"use client";

import React, { useEffect, useRef, useState } from "react";
import SimplePeer from "simple-peer";
import { getSocket } from "@/lib/socket";
import { useParams } from "next/navigation";
import { ICE_SERVERS } from "@/lib/webrtc";
import {
  WifiOff,
  Share2,
  MessageCircle,
  Heart,
  Trophy,
  Calendar,
  MapPin,
  Copy,
  Check,
  Radio
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";

export default function WatchPage() {
  const params = useParams();
  const streamId = params?.id as string;

  // State
  const [status, setStatus] = useState<"connecting" | "live" | "offline">("connecting");
  const [matchData, setMatchData] = useState<any>(null);
  const [viewerCount, setViewerCount] = useState(0);
  const [activeCameraId, setActiveCameraId] = useState<string | null>(null);

  // Refs
  const socket = useRef(getSocket());
  const peerRef = useRef<SimplePeer.Instance | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // --- Connection Logic ---
  useEffect(() => {
    if (!streamId) return;

    const s = socket.current;
    if (!s.connected) s.connect();

    // Handlers
    const onConnect = () => {
      console.log("Viewer Connected");
      s.emit('viewer:join', { streamCode: streamId });
    };

    const handleActiveCamera = ({ cameraId }: { cameraId: string }) => {
      console.log("Active camera changed to:", cameraId);
      setActiveCameraId(cameraId);
      // We do NOT initiate connection. We wait for Broadcaster to relay or directly from Camera?
      // Wait, architecture: Camera -> Broadcaster -> Viewer? 
      // OR Camera -> Viewer (P2P Mesh)?
      // Original design: Broadcaster acts as a relay? No, typically simpler is mesh.
      // BUT Broadcaster control panel needs to SWITCH the feed.
      // For simplicity in V2:
      // Broadcaster sends "active-camera-changed"
      // Viewer connects P2P to that Camera DIRECTLY.
      // Camera must handle multiple viewers (can choke bandwidth).
      // BETTER: Viewer connects to BROADCASTER (if we used an SFU).
      // BUT since we use simple-peer (Mesh), Camera connects to Broadcaster (1 peer).
      // And Camera connects to EVERY Viewer? That kills mobile battery.
      // REVISED ARCHITECTURE:
      // Camera -> Broadcaster (P2P). Broadcaster displays it.
      // Broadcaster -> Canvas Capture -> Stream to Viewers?
      // Limitation: simple-peer connects 1:1.
      // If we want Broadcaster to be the Source for Viewers:
      // Broadcaster needs to create a peer for EACH viewer.
      // This puts load on Broadcaster (Laptop), which is better than Camera (Phone).
      // Let's implement Broadcaster -> Viewer P2P.

      // This means Broadcaster Page must listen for 'viewer:join' and initiate connection TO viewer.
      // Viewer accepts offer.
      // SO: Viewer joins room. Broadcaster gets 'viewer:joined'. Broadcaster calls Viewer.
    };

    // For now, let's keep the existing logic where we might be expecting offers directly?
    // Let's rely on server relaying offers.

    // Listen for WebRTC Offer (likely from Broadcaster)
    const handleOffer = ({ from, offer }: any) => {
      console.log("Received Offer from:", from);

      // Destroy existing
      if (peerRef.current) {
        peerRef.current.destroy();
      }

      const peer = new SimplePeer({
        initiator: false,
        trickle: true,
        config: ICE_SERVERS
      });

      peerRef.current = peer;

      peer.on('signal', (signal) => {
        if (signal.type === 'answer') {
          s.emit('webrtc:answer', { to: from, answer: signal });
        } else if (signal.candidate) {
          s.emit('webrtc:ice-candidate', { to: from, candidate: signal });
        }
      });

      peer.on('stream', (stream) => {
        console.log("Stream Received");
        setStatus('live');
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(console.error);
        }
      });

      peer.on('close', () => {
        console.log("Stream closed");
        setStatus('offline');
      });

      peer.signal(offer);
    };

    const handleIceCandidate = ({ from, candidate }: any) => {
      if (peerRef.current) peerRef.current.signal(candidate);
    };

    const handleMatchUpdate = ({ data }: any) => {
      setMatchData(data);
      if (data.isLive === false) setStatus('offline');
      else if (status === 'offline' && data.isLive) setStatus('connecting'); // Try to reconnect?
    };

    const handleViewerCount = ({ streamCode: code, count }: any) => {
      if (code === streamId) setViewerCount(count);
    };

    if (s.connected) onConnect();
    else s.on('connect', onConnect);

    s.on('active-camera-changed', handleActiveCamera);
    // In this updated plan, Broadcaster initiates connection to Viewer.
    // So Viewer just waits for 'webrtc:offer'.
    s.on('webrtc:offer', handleOffer);
    s.on('webrtc:ice-candidate', handleIceCandidate);
    s.on('match:update', handleMatchUpdate);
    s.on('viewer:count', handleViewerCount);

    return () => {
      s.off('connect', onConnect);
      s.off('active-camera-changed', handleActiveCamera);
      s.off('webrtc:offer', handleOffer);
      s.off('webrtc:ice-candidate', handleIceCandidate);
      s.off('match:update', handleMatchUpdate);
      s.off('viewer:count', handleViewerCount);
      peerRef.current?.destroy();
      disconnectSocket();
    };
  }, [streamId]);

  // --- Render ---
  return (
    <div className="min-h-screen bg-[#050505] font-sans text-white">
      {/* Main Video Container */}
      <div className="w-full max-w-[1600px] mx-auto p-4 lg:p-6 space-y-6">
        {/* Video Player */}
        <div className="relative aspect-video bg-black rounded-3xl overflow-hidden shadow-3xl border border-white/5 group">
          {/* Video Element */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            controls={false}
            className={`w-full h-full object-contain transition-opacity duration-500 ${status === 'live' ? 'opacity-100' : 'opacity-40'}`}
          />

          {/* Status Overlays */}
          {status !== 'live' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
              <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center mb-6 animate-pulse">
                <Radio className="h-10 w-10 text-white/20" />
              </div>
              <h2 className="text-2xl font-black italic uppercase tracking-widest text-white/40">
                {status === 'connecting' ? 'Establishing Downlink...' : 'Stream Offline'}
              </h2>
            </div>
          )}

          {/* Live Overlay Interface */}
          <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 lg:p-10 z-10">
            {/* Top Bar */}
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-4">
                {status === 'live' && (
                  <Badge className="bg-red-600 text-white border-none italic font-black uppercase tracking-widest px-3 py-1 animate-pulse shadow-lg ring-1 ring-red-500/50">
                    LIVE
                  </Badge>
                )}
                {status === 'offline' && <Badge variant="outline" className="border-white/20 text-white/40 font-black italic uppercase">OFF AIR</Badge>}
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 backdrop-blur rounded-full border border-white/10">
                  <Radio className="h-3 w-3 text-blue-500" />
                  <span className="text-[10px] font-black uppercase tracking-wider">{viewerCount} LIVE</span>
                </div>
                <div className="px-3 py-1.5 bg-black/40 backdrop-blur rounded-full border border-white/10 text-[10px] font-mono font-bold text-white/40 uppercase">
                  {streamId}
                </div>
              </div>
            </div>

            {/* Scoreboard Overlay (Only if active) */}
            {matchData && (
              <div className="absolute top-8 left-8 transform transition-all duration-500">
                <div className="flex items-center bg-black/90 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden divide-x divide-white/10">
                  <div className="h-16 w-16 bg-blue-900/20 p-2 flex items-center justify-center">
                    {matchData.homeLogo ? <img src={matchData.homeLogo} className="h-full w-full object-contain" /> : <div className="h-8 w-8 rounded-full bg-blue-500/50" />}
                  </div>
                  <div className="h-16 flex flex-col justify-center px-4 bg-gradient-to-r from-blue-900/10 to-transparent min-w-[120px]">
                    <span className="text-[10px] font-black uppercase text-blue-400 tracking-widest mb-1">HOME</span>
                    <span className="text-xl font-black italic text-white leading-none">{matchData.homeTeam || 'HOME'}</span>
                  </div>
                  <div className="h-16 w-20 flex items-center justify-center bg-black">
                    <span className="text-3xl font-black text-white tracking-tighter tabular-nums">{matchData.homeScore}</span>
                    <span className="text-white/20 mx-1 font-light">:</span>
                    <span className="text-3xl font-black text-white tracking-tighter tabular-nums">{matchData.awayScore}</span>
                  </div>
                  <div className="h-16 flex flex-col justify-center items-end px-4 bg-gradient-to-l from-red-900/10 to-transparent min-w-[120px]">
                    <span className="text-[10px] font-black uppercase text-red-400 tracking-widest mb-1">AWAY</span>
                    <span className="text-xl font-black italic text-white leading-none">{matchData.awayTeam || 'AWAY'}</span>
                  </div>
                  <div className="h-16 w-16 bg-red-900/20 p-2 flex items-center justify-center">
                    {matchData.awayLogo ? <img src={matchData.awayLogo} className="h-full w-full object-contain" /> : <div className="h-8 w-8 rounded-full bg-red-500/50" />}
                  </div>
                  <div className="h-16 min-w-[80px] flex flex-col items-center justify-center bg-white/5 px-2">
                    <span className="text-xl font-black tabular-nums tracking-tighter text-green-400">{matchData.matchTime}</span>
                    {matchData.addedTime > 0 && <span className="text-[9px] font-bold text-red-500 uppercase">+{matchData.addedTime}' STOPPAGE</span>}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h1 className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                  {matchData?.homeTeam || 'HOME TEAM'} <span className="text-white/20 not-italic font-sans text-lg">VS</span> {matchData?.awayTeam || 'AWAY TEAM'}
                </h1>
                <div className="flex items-center gap-4 text-sm font-bold text-white/40 uppercase tracking-widest">
                  <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> LIVE MATCHDAY</span>
                  <span className="w-1 h-1 bg-white/20 rounded-full" />
                  <span className="flex items-center gap-1.5 text-blue-400"><MapPin className="h-3.5 w-3.5" /> FREETOWN, SL</span>
                </div>
              </div>
              <Button className="bg-white text-black hover:bg-gray-200 rounded-full font-black uppercase tracking-widest" onClick={() => { if (navigator.share) navigator.share({ url: window.location.href }) }}>
                <Share2 className="h-4 w-4 mr-2" /> Share
              </Button>
            </div>

            <div className="p-6 bg-[#12151B] rounded-3xl border border-white/5">
              <h3 className="text-md font-black uppercase tracking-widest mb-4 flex items-center gap-2"><Trophy className="h-4 w-4 text-yellow-500" /> Match Events</h3>
              <ScrollArea className="h-[200px]">
                <div className="space-y-3">
                  {matchData?.highlights?.map((h: any) => (
                    <div key={h.id} className="flex items-center gap-4 p-3 rounded-xl bg-white/2 border border-white/5">
                      <div className="font-mono font-black text-blue-500">{h.time}'</div>
                      <div className="w-px h-8 bg-white/10" />
                      <div>
                        <div className="text-xs font-black uppercase tracking-wider text-white">{h.type}</div>
                        <div className="text-[10px] uppercase font-bold text-white/40">{h.player} • {h.team}</div>
                      </div>
                    </div>
                  ))}
                  {(!matchData?.highlights || matchData.highlights.length === 0) && (
                    <div className="text-center py-10 text-white/20 text-xs font-black uppercase tracking-widest">No match events yet</div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>

          {/* Chat / Sidebar */}
          <Card className="bg-[#12151B] border-white/5 rounded-3xl h-[600px] flex flex-col">
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-widest flex items-center gap-2"><MessageCircle className="h-3.5 w-3.5 text-blue-500" /> Live Chat</span>
              <span className="text-[10px] font-bold text-white/20">Coming Soon</span>
            </div>
            <div className="flex-1 flex items-center justify-center p-8 text-center opacity-30">
              <div>
                <MessageCircle className="h-8 w-8 mx-auto mb-3" />
                <p className="text-xs font-black uppercase tracking-widest">Chat Disabled</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
