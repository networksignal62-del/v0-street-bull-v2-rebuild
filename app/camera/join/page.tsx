"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import SimplePeer from "simple-peer";
import { getSocket, disconnectSocket } from "@/lib/socket";
import { useSearchParams } from "next/navigation";
import {
  Camera,
  Wifi,
  WifiOff,
  Settings,
  RotateCcw,
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  Battery,
  Signal,
  Menu,
  X,
  CheckCircle2,
  Activity
} from "lucide-react";
import {
  ICE_SERVERS,
  getUserMedia,
  switchCamera,
  MEDIA_CONSTRAINTS,
  MEDIA_CONSTRAINTS_LOW,
  MEDIA_CONSTRAINTS_HIGH
} from "@/lib/webrtc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const QUALITY_PRESETS = {
  'low': MEDIA_CONSTRAINTS_LOW,
  'normal': MEDIA_CONSTRAINTS,
  'high': MEDIA_CONSTRAINTS_HIGH
};

export default function CameraJoinPage() {
  const searchParams = useSearchParams();
  const streamCode = searchParams.get('stream');

  // State
  const [hasPermissions, setHasPermissions] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"disconnected" | "connecting" | "live">("disconnected");
  const [cameraName, setCameraName] = useState("Cam 1"); // Default
  const [operatorName, setOperatorName] = useState("Operator"); // Default
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const [quality, setQuality] = useState<'low' | 'normal' | 'high'>('normal');
  const [showSettings, setShowSettings] = useState(false);
  const [matchData, setMatchData] = useState<any>(null); // For HUD

  // Refs
  const socket = useRef(getSocket());
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const peersRef = useRef<Map<string, SimplePeer.Instance>>(new Map());

  // --- 1. Camera Initialization ---
  const startCamera = async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }

      const constraints = { ...QUALITY_PRESETS[quality], video: { ...QUALITY_PRESETS[quality].video, facingMode } };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.play().catch(console.error); // Ensure autoplay
      }

      setHasPermissions(true);
      return stream;
    } catch (err) {
      console.error("Camera Error:", err);
      alert("Could not access camera. Please allow permissions.");
      setHasPermissions(false);
      return null;
    }
  };

  // Switch Camera logic
  const handleSwitchCamera = async () => {
    const newMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newMode);
    // Restart camera with new mode will be handled by useEffect or manual call?
    // Let's do it manually to ensure sync
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }
    const constraints = { ...QUALITY_PRESETS[quality], video: { ...QUALITY_PRESETS[quality].video, facingMode: newMode } };
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      // Update peers
      peersRef.current.forEach(peer => {
        // Replace tracks
        // SimplePeer doesn't support easy track replacement without renegotiation sometimes
        // But standard WebRTC does via sender.replaceTrack
        // For simplicity, we might need to rely on the peer re-negotiating or just destroy/recreate?
        // Re-creating is safer for stability but slower.
        // Let's try attempting to replace tracks if possible, else warn user.

        // Actually, for broad compatibility, best to leave connection up but swap stream
        const oldVideoTrack = peer.streams[0]?.getVideoTracks()[0];
        const newVideoTrack = stream.getVideoTracks()[0];
        if (oldVideoTrack && newVideoTrack) {
          peer.replaceTrack(oldVideoTrack, newVideoTrack, stream);
        }
      });
    } catch (e) {
      console.error("Switch failed", e);
    }
  };


  // --- 2. Connection Logic ---
  const handleJoin = async () => {
    if (!streamCode) return alert("No Stream ID provided!");

    setConnectionStatus("connecting");
    const stream = await startCamera();
    if (!stream) {
      setConnectionStatus("disconnected");
      return;
    }

    const s = socket.current;
    if (!s.connected) s.connect();

    // Register handlers
    s.emit('camera:join', { streamCode, cameraName, operatorName });

    s.on('camera:joined', ({ cameraId }) => {
      console.log("Joined as camera:", cameraId);
      setConnectionStatus("live");
      s.emit('camera:ready', { cameraId });
      // Prevent sleep
      if ('wakeLock' in navigator) {
        // @ts-ignore
        navigator.wakeLock.request('screen').catch(console.error);
      }
    });

    s.on('start:stream', () => {
      console.log("Broadcaster requested stream start");
      // usually we are already ready, but good to know
    });

    // WebRTC Signaling
    s.on('webrtc:offer', ({ from, offer }) => {
      console.log("Received offer from broadcaster");

      // Destroy existing peer if any to avoid conflicts
      if (peersRef.current.has(from)) {
        peersRef.current.get(from)?.destroy();
        peersRef.current.delete(from);
      }

      const peer = new SimplePeer({
        initiator: false,
        trickle: true,
        stream: streamRef.current!, // Must have stream
        config: ICE_SERVERS
      });

      peersRef.current.set(from, peer);

      peer.on('signal', (signal) => {
        if (signal.type === 'answer') {
          s.emit('webrtc:answer', { to: from, answer: signal });
        } else if (signal.candidate) {
          s.emit('webrtc:ice-candidate', { to: from, candidate: signal });
        }
      });

      // Add Data Channel for match updates? 
      // Currently match updates come via socket 'match:update'

      peer.on('close', () => {
        peersRef.current.delete(from);
      });

      peer.on('error', (err) => {
        console.error("Peer error", err);
      });

      peer.signal(offer);
    });

    s.on('webrtc:ice-candidate', ({ from, candidate }) => {
      const peer = peersRef.current.get(from);
      if (peer) peer.signal(candidate);
    });

    // HUD Updates
    s.on('match:update', ({ data }) => {
      setMatchData(data);
    });
  };

  // Cleanup
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
      peersRef.current.forEach(p => p.destroy());
      disconnectSocket();
    };
  }, []);


  // --- Render ---
  if (connectionStatus === "disconnected") {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 text-white font-sans overflow-hidden relative">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(30,30,30,1)_0%,_rgba(5,5,5,1)_100%)] opacity-50" />
        <div className="absolute top-0 w-full h-px bg-gradient-to-r from-transparent via-blue-900/50 to-transparent" />
        <div className="absolute bottom-0 w-full h-px bg-gradient-to-r from-transparent via-blue-900/50 to-transparent" />

        <Card className="w-full max-w-sm bg-[#0F1115] border-white/5 shadow-3xl rounded-[2.5rem] overflow-hidden relative z-10">
          <div className="p-10 text-center bg-gradient-to-b from-blue-900/10 to-transparent">
            <div className="h-20 w-20 rounded-3xl bg-blue-600 flex items-center justify-center mx-auto mb-8 shadow-2xl ring-4 ring-blue-900/20 rotate-3 transition-transform hover:rotate-0">
              <Camera className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-3xl font-black italic tracking-tighter uppercase font-poppins text-white">DEPLOY <span className="text-blue-500">UNIT</span></h2>
            <p className="text-[10px] text-blue-200/40 font-bold tracking-[0.3em] uppercase mt-3 font-sans">Mobile Transmission Node</p>
          </div>

          <div className="p-8 space-y-6">
            <div className="space-y-4">
              <div className="bg-black/40 p-4 rounded-2xl border border-white/5 space-y-2">
                <label className="text-[9px] font-black transform uppercase text-white/30 tracking-widest pl-1">Camera ID</label>
                <Select value={cameraName} onValueChange={setCameraName}>
                  <SelectTrigger className="bg-transparent border-none text-lg font-black italic shadow-none h-auto p-0 focus:ring-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1d24] border-white/10 text-white font-sans">
                    {["Main Cam", "Sideline A", "Sideline B", "Goal Cam North", "Goal Cam South", "Drone Feed"].map(cam => (
                      <SelectItem key={cam} value={cam} className="focus:bg-blue-600 focus:text-white font-bold">{cam}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-black/40 p-4 rounded-2xl border border-white/5 space-y-2">
                <label className="text-[9px] font-black transform uppercase text-white/30 tracking-widest pl-1">Operator</label>
                <input
                  type="text"
                  value={operatorName}
                  onChange={(e) => setOperatorName(e.target.value)}
                  className="w-full bg-transparent border-none text-lg font-bold text-white placeholder:text-white/20 focus:outline-none focus:ring-0"
                  placeholder="Enter Name"
                />
              </div>
            </div>

            <Button
              className="w-full h-16 bg-blue-600 hover:bg-blue-500 rounded-2xl text-lg font-black italic tracking-widest shadow-xl shadow-blue-900/20 transition-all hover:scale-[1.02]"
              onClick={handleJoin}
            >
              INITIALIZE UPLINK
            </Button>

            <div className="flex justify-center">
              <p className="text-[9px] text-white/20 font-mono">SECURE PROTOCOL v2.2</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // LIVE VIEW
  return (
    <div className="fixed inset-0 bg-black overflow-hidden font-sans">
      {/* Fullscreen Video */}
      <video
        ref={localVideoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Cinematic Overlays */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/80 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/90 to-transparent pointer-events-none" />

      {/* Grid Lines Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-8 left-8 w-4 h-4 border-l-2 border-t-2 border-white" />
        <div className="absolute top-8 right-8 w-4 h-4 border-r-2 border-t-2 border-white" />
        <div className="absolute bottom-8 left-8 w-4 h-4 border-l-2 border-b-2 border-white" />
        <div className="absolute bottom-8 right-8 w-4 h-4 border-r-2 border-b-2 border-white" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border border-white/30 rounded-full flex items-center justify-center">
            <div className="w-1 h-1 bg-red-500 rounded-full" />
          </div>
        </div>
      </div>

      {/* Top Bar HUD */}
      <div className="absolute top-0 inset-x-0 p-6 flex justify-between items-start z-20">
        <div className="flex flex-col gap-1">
          <Badge className="bg-red-600 border-none text-white italic font-black uppercase tracking-widest px-3 py-1 shadow-lg animate-pulse w-fit">
            LIVE_TRANS
          </Badge>
          <div className="flex items-center gap-2 mt-1 px-1">
            <span className="text-[10px] font-mono text-white/60 font-bold uppercase tracking-wider">{cameraName}</span>
            <span className="w-1 h-1 rounded-full bg-blue-500" />
            <span className="text-[10px] font-mono text-white/60 font-bold uppercase tracking-wider">{operatorName}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur px-3 py-1.5 rounded-full border border-white/10">
            <Battery className="h-4 w-4 text-green-500" />
            <span className="text-[10px] font-mono font-bold text-white">94%</span>
          </div>
          <Button variant="ghost" size="icon" className="text-white/70 hover:bg-white/10 hover:text-white rounded-full bg-black/20 backdrop-blur" onClick={() => setShowSettings(!showSettings)}>
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Dynamic Match HUD (Received from Broadcaster) */}
      {matchData && matchData.isLive && (
        <div className="absolute top-24 left-6 z-10 pointer-events-none">
          <div className="flex flex-col gap-1">
            <div className="bg-black/60 backdrop-blur rounded px-3 py-1 border-l-2 border-blue-500 w-fit">
              <span className="text-xs font-black italic text-white uppercase">{matchData.homeTeam || 'HOME'} {matchData.homeScore} - {matchData.awayScore} {matchData.awayTeam || 'AWAY'}</span>
            </div>
            <div className="bg-black/60 backdrop-blur rounded px-3 py-1 border-l-2 border-white/50 w-fit">
              <span className="text-xs font-mono font-bold text-white">{matchData.matchTime}</span>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Controls */}
      <div className="absolute bottom-0 inset-x-0 p-8 z-20 flex justify-between items-end">
        <Button size="icon" variant="secondary" className="h-14 w-14 rounded-full bg-white/10 backdrop-blur border border-white/10 text-white hover:bg-white/20 shadow-2xl">
          <MicOff className="h-6 w-6" />
        </Button>

        <div className="flex flex-col items-center gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
            <span className="text-[10px] font-black italic uppercase tracking-[0.2em] text-white text-shadow">TRANSMITTING</span>
          </div>
          <span className="text-[8px] font-mono text-white/30 uppercase tracking-widest">UPLINK_STABLE</span>
        </div>

        <Button onClick={handleSwitchCamera} size="icon" variant="secondary" className="h-14 w-14 rounded-full bg-white/10 backdrop-blur border border-white/10 text-white hover:bg-white/20 shadow-2xl">
          <RotateCcw className="h-6 w-6" />
        </Button>
      </div>

      {/* Settings Overlay */}
      {showSettings && (
        <div className="absolute inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-6" onClick={() => setShowSettings(false)}>
          <div className="w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-black italic text-white uppercase mb-6 text-center">Config</h3>
            <div className="grid grid-cols-3 gap-3 mb-8">
              {['low', 'normal', 'high'].map(q => (
                <button
                  key={q}
                  onClick={() => { setQuality(q as any); setShowSettings(false); startCamera(); }}
                  className={`h-12 rounded-xl border border-white/10 flex items-center justify-center text-xs font-black uppercase tracking-widest transition-all ${quality === q ? 'bg-blue-600 border-blue-500 text-white' : 'bg-white/5 text-white/40'}`}
                >
                  {q}
                </button>
              ))}
            </div>
            <Button className="w-full bg-white/10 h-14 rounded-2xl font-black uppercase tracking-widest hover:bg-white/20" onClick={() => setShowSettings(false)}>Close</Button>
          </div>
        </div>
      )}
    </div>
  );
}
