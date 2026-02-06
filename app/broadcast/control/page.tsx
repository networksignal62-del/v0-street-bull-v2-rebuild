"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import SimplePeer from "simple-peer";
import { QRCodeSVG } from "qrcode.react";
import { getSocket } from "@/lib/socket";
import { ICE_SERVERS } from "@/lib/webrtc";
import {
  Camera,
  Mic,
  MicOff,
  VideoOff,
  Radio,
  Settings,
  Users,
  Copy,
  Plus,
  Minus,
  Share2,
  Timer,
  Play,
  StopCircle,
  Trophy,
  Users2,
  BarChart3,
  Image as ImageIcon,
  History,
  Link as LinkIcon,
  Monitor,
  Layout,
  Activity,
  Disc,
  Check,
  Headphones,
  RotateCcw,
  Pause,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

const generateStreamId = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "SB-";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

interface CameraFeed {
  id: string;
  name: string;
  operator: string;
  status: string;
  stream?: MediaStream;
}

export default function BroadcasterControlPage() {
  // --- State Management ---
  const [streamId] = useState(() => generateStreamId());
  const [isLive, setIsLive] = useState(false);
  const [isMuted, setIsMuted] = useState(false); // Broadcaster Mic Mute
  const [activeCamera, setActiveCamera] = useState<string | null>(null);
  const [cameras, setCameras] = useState<CameraFeed[]>([]);
  const [realViewerCount, setRealViewerCount] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [playbackError, setPlaybackError] = useState(false);
  const [isMonitoringStarted, setIsMonitoringStarted] = useState(false);

  // --- Refs ---
  const socket = useRef(getSocket());
  const camerasRef = useRef<CameraFeed[]>([]);
  const peersRef = useRef<Map<string, SimplePeer.Instance>>(new Map()); // Camera Peers
  const viewerPeersRef = useRef<Map<string, SimplePeer.Instance>>(new Map()); // Viewer Peers
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});
  const mainVideoRef = useRef<HTMLVideoElement>(null);

  // Audio handling
  const broadcasterAudioStream = useRef<MediaStream | null>(null);

  // --- URLs ---
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const cameraJoinUrl = `${baseUrl}/camera/join?stream=${streamId}`;
  const viewerWatchUrl = `${baseUrl}/watch/${streamId}`;

  // --- Match Stats & Data ---
  const [matchMinutes, setMatchMinutes] = useState(0);
  const [matchSeconds, setMatchSeconds] = useState(0);
  const [isClockRunning, setIsClockRunning] = useState(false);
  const [addedTime, setAddedTime] = useState(0);
  const clockInterval = useRef<NodeJS.Timeout | null>(null);

  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [homeTeam, setHomeTeam] = useState("HOME TEAM");
  const [awayTeam, setAwayTeam] = useState("AWAY TEAM");
  const [homeLogo, setHomeLogo] = useState<string>("/team-home-placeholder.png");
  const [awayLogo, setAwayLogo] = useState<string>("/team-away-placeholder.png");
  const [matchThumbnail, setMatchThumbnail] = useState<string>("/match-thumbnail-placeholder.png");

  const [highlights, setHighlights] = useState<{ id: string; type: string; team: string; player: string; time: string }[]>([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showScoreboard, setShowScoreboard] = useState(true);
  const [showClock, setShowClock] = useState(true);

  // Broadcaster Audio Capture
  useEffect(() => {
    async function getAudio() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        broadcasterAudioStream.current = stream;

        // If muted initially, disable track
        stream.getAudioTracks().forEach(t => t.enabled = !isMuted);

      } catch (e) {
        console.error("Failed to get broadcaster microphone", e);
      }
    }
    getAudio();
  }, []);

  // Handle Mute Toggle
  useEffect(() => {
    if (broadcasterAudioStream.current) {
      broadcasterAudioStream.current.getAudioTracks().forEach(t => t.enabled = !isMuted);
    }
  }, [isMuted]);

  // Sync cameras ref
  useEffect(() => { camerasRef.current = cameras; }, [cameras]);

  // --- WebRTC Logic for CAMERAS (Receiving) ---
  const createPeerConnection = useCallback((cameraId: string) => {
    console.log(`[WebRTC] Initiating to Camera ${cameraId}`);

    if (peersRef.current.has(cameraId)) {
      peersRef.current.get(cameraId)?.destroy();
      peersRef.current.delete(cameraId);
    }

    const peer = new SimplePeer({
      initiator: true,
      trickle: true,
      config: ICE_SERVERS,
    });

    peersRef.current.set(cameraId, peer);

    peer.on('signal', (signal) => {
      if (signal.type === 'offer') {
        socket.current.emit('webrtc:offer', { to: cameraId, offer: signal });
      } else if (signal.candidate) {
        socket.current.emit('webrtc:ice-candidate', { to: cameraId, candidate: signal });
      }
    });

    peer.on('stream', (stream) => {
      console.log(`[WebRTC] Stream received from ${cameraId}`);
      setCameras(prev => prev.map(cam => {
        if (cam.id === cameraId) {
          return { ...cam, stream, status: 'live' };
        }
        return cam;
      }));

      // Auto-select first camera if none active
      if (!activeCamera) setActiveCamera(cameraId);
    });

    peer.on('error', (err) => {
      console.error(`[WebRTC] Error with ${cameraId}:`, err);
    });

    peer.on('close', () => {
      console.log(`[WebRTC] Connection closed: ${cameraId}`);
      peersRef.current.delete(cameraId);
      setCameras(prev => prev.map(c => c.id === cameraId ? { ...c, status: 'disconnected', stream: undefined } : c));
    });
  }, [activeCamera]);

  // --- WebRTC Logic for VIEWERS (Sending) ---
  const connectToViewer = (viewerId: string) => {
    console.log(`[Link] Connecting to Viewer ${viewerId}`);
    if (viewerPeersRef.current.has(viewerId)) return; // Already connected

    const peer = new SimplePeer({
      initiator: true,
      trickle: true,
      config: ICE_SERVERS,
    });

    // Create Mixed Stream for synchronized playback
    const tracks: MediaStreamTrack[] = [];

    // 1. Video (Active Camera) - Use Ref to get fresh state
    const activeCam = camerasRef.current.find(c => c.id === activeCamera);
    if (activeCamera && activeCam?.stream) {
      const videoTrack = activeCam.stream.getVideoTracks()[0];
      if (videoTrack) tracks.push(videoTrack);
    }

    // 2. Audio (Broadcaster Mic)
    if (broadcasterAudioStream.current) {
      const audioTrack = broadcasterAudioStream.current.getAudioTracks()[0];
      if (audioTrack) tracks.push(audioTrack);
    }

    // Bundle into single stream to prevent partial playback on viewer
    if (tracks.length > 0) {
      const mixedStream = new MediaStream(tracks);
      mixedStream.getTracks().forEach(t => peer.addTrack(t, mixedStream));
    }

    viewerPeersRef.current.set(viewerId, peer);

    peer.on('signal', (signal) => {
      if (signal.type === 'offer') {
        socket.current.emit('webrtc:offer', { to: viewerId, offer: signal });
      } else if (signal.candidate) {
        socket.current.emit('webrtc:ice-candidate', { to: viewerId, candidate: signal });
      }
    });

    peer.on('close', () => {
      viewerPeersRef.current.delete(viewerId);
    });

    peer.on('error', (err) => console.error("Viewer Peer Error", err));
  };

  // Switch Active Camera for Viewers
  const handleCameraSwitch = (cameraId: string) => {
    const oldActiveId = activeCamera;
    setActiveCamera(cameraId);
    socket.current.emit('broadcaster:set-active-camera', { cameraId, streamCode: streamId });

    // Update Viewer Streams
    const newCam = cameras.find(c => c.id === cameraId);
    const oldCam = cameras.find(c => c.id === oldActiveId);

    if (newCam?.stream) {
      const newTrack = newCam.stream.getVideoTracks()[0];

      viewerPeersRef.current.forEach(peer => {
        // Check if we need to replace a track
        const senders = peer._pc.getSenders(); // Access underlying PC
        const videoSender = senders.find((s: any) => s.track && s.track.kind === 'video');

        if (videoSender && newTrack) {
          videoSender.replaceTrack(newTrack);
        } else if (!videoSender && newTrack) {
          // If previously no video, add it (might require renegotiation which SimplePeer handles poorly sometimes)
          // For simplicity, we assume robust initiation.
          peer.addTrack(newTrack, newCam.stream!);
        }
      });
    }
  };

  // --- Socket Effects ---
  useEffect(() => {
    const s = socket.current;

    const onConnect = () => {
      console.log("Broadcaster socket connected");
      s.emit('broadcaster:join', { streamCode: streamId });
    };

    const handleCameras = ({ cameras: existingCameras }: { cameras: any[] }) => {
      setCameras(existingCameras.map(cam => ({
        id: cam.cameraId, name: cam.name, operator: cam.operator, status: cam.status
      })));
      existingCameras.forEach(cam => createPeerConnection(cam.cameraId));
    };

    const handleNewCamera = ({ cameraId, name, operator }: any) => {
      setCameras(prev => {
        if (prev.find(c => c.id === cameraId)) return prev;
        return [...prev, { id: cameraId, name, operator, status: 'connecting' }];
      });
      createPeerConnection(cameraId);
    };

    const handleStatus = ({ cameraId, status }: any) => {
      setCameras(prev => prev.map(cam => cam.id === cameraId ? { ...cam, status } : cam));
    };

    const handleDisconnect = ({ cameraId }: any) => {
      setCameras(prev => prev.filter(cam => cam.id !== cameraId));
      if (peersRef.current.has(cameraId)) {
        peersRef.current.get(cameraId)?.destroy();
        peersRef.current.delete(cameraId);
      }
    };

    const handleViewerJoined = ({ viewerId }: any) => {
      connectToViewer(viewerId);
    };

    const handleAnswer = ({ from, answer }: any) => {
      // Check if it's a camera or viewer
      if (peersRef.current.has(from)) peersRef.current.get(from)?.signal(answer);
      if (viewerPeersRef.current.has(from)) viewerPeersRef.current.get(from)?.signal(answer);
    };

    const handleIceCandidate = ({ from, candidate }: any) => {
      if (peersRef.current.has(from)) peersRef.current.get(from)?.signal(candidate);
      if (viewerPeersRef.current.has(from)) viewerPeersRef.current.get(from)?.signal(candidate);
    };

    if (s.connected) onConnect();
    else s.on('connect', onConnect);

    s.on('broadcaster:cameras', handleCameras);
    s.on('camera:new', handleNewCamera);
    s.on('camera:status', handleStatus);
    s.on('camera:disconnected', handleDisconnect);
    s.on('viewer:joined', handleViewerJoined);
    s.on('webrtc:answer', handleAnswer);
    s.on('webrtc:ice-candidate', handleIceCandidate);
    s.on('viewer:count', ({ streamCode: code, count }: any) => { if (code === streamId) setRealViewerCount(count); });

    return () => {
      s.off('connect', onConnect);
      s.off('broadcaster:cameras', handleCameras);
      s.off('camera:new', handleNewCamera);
      s.off('camera:status', handleStatus);
      s.off('camera:disconnected', handleDisconnect);
      s.off('viewer:joined', handleViewerJoined);
      s.off('webrtc:answer', handleAnswer);
      s.off('webrtc:ice-candidate', handleIceCandidate);
      peersRef.current.forEach(p => p.destroy());
      peersRef.current.clear();
      viewerPeersRef.current.forEach(p => p.destroy());
      viewerPeersRef.current.clear();
    };
  }, [streamId, createPeerConnection]);

  // --- Video Sync Effects (Local Monitor) ---
  useEffect(() => {
    cameras.forEach(cam => {
      const el = videoRefs.current[cam.id];
      if (el && cam.stream && el.srcObject !== cam.stream) {
        el.srcObject = cam.stream;
        el.muted = true; // Force mute for preview
        el.play().catch(e => console.warn("Autoplay blocked on preview", e));
      }
    });

    if (activeCamera && mainVideoRef.current) {
      const cam = cameras.find(c => c.id === activeCamera);
      if (cam?.stream) {
        // Only update if changed to prevent flickering
        if (mainVideoRef.current.srcObject !== cam.stream) {
          mainVideoRef.current.srcObject = cam.stream;
          mainVideoRef.current.muted = true; // Force mute for main monitor initially
          mainVideoRef.current.play().catch(e => {
            console.error("Main Autoplay blocked", e);
            setPlaybackError(true);
          });
        }
      }
    }
  }, [cameras, activeCamera]);

  // --- Data Sync ---
  const formatTime = (mins: number, secs: number) => {
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    socket.current.emit('match:update', {
      streamCode: streamId,
      data: {
        isLive, homeScore, awayScore,
        matchTime: formatTime(matchMinutes, matchSeconds),
        homeTeam, awayTeam, homeLogo, awayLogo, matchThumbnail,
        addedTime, highlights, stats: { home: { shots: 0, possession: 50 }, away: { shots: 0, possession: 50 } } // Mock stats
      }
    });
  }, [isLive, homeScore, awayScore, matchMinutes, matchSeconds, homeTeam, awayTeam, homeLogo, awayLogo, matchThumbnail, streamId, addedTime, highlights]);

  // --- Clock Control ---
  useEffect(() => {
    if (isClockRunning) {
      clockInterval.current = setInterval(() => {
        setMatchSeconds(prev => {
          if (prev >= 59) {
            setMatchMinutes(m => m + 1);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    } else if (clockInterval.current) {
      clearInterval(clockInterval.current);
    }
    return () => { if (clockInterval.current) clearInterval(clockInterval.current); };
  }, [isClockRunning]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const addHighlight = (type: string, team: string) => {
    const player = prompt("Enter Player Name:");
    if (player) {
      setHighlights(prev => [...prev, {
        id: Math.random().toString(36).substr(2, 9),
        type, team, player,
        time: formatTime(matchMinutes, matchSeconds)
      }]);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#E0E0E0] font-sans overflow-hidden">
      {/* HEADER */}
      <header className="h-16 border-b border-white/5 bg-black/40 backdrop-blur-xl px-4 flex items-center justify-between sticky top-0 z-[100]">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg">
              <Monitor className="h-5 w-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-black tracking-widest uppercase font-poppins">STREET BULL <span className="text-blue-500">CONTROL</span></h1>
              <p className="text-[10px] text-white/30 font-bold tracking-tighter uppercase font-sans">Professional Broadcast Suite v2.2</p>
            </div>
          </div>
          <div className="flex items-center gap-3 ml-4">
            <Badge className={`h-6 px-3 border-none flex items-center gap-2 font-black italic tracking-tighter ${isLive ? 'bg-red-600 animate-pulse' : 'bg-white/10 text-white/40'}`}>
              <Radio className="h-3 w-3" /> {isLive ? 'ON AIR' : 'OFFLINE'}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 rounded-full border border-blue-500/20">
            <Button variant="ghost" size="icon" className="h-5 w-5 text-blue-400" onClick={() => handleCopy(viewerWatchUrl, 'viewer-link')}>
              {copiedId === 'viewer-link' ? <Check className="h-3 w-3" /> : <LinkIcon className="h-3 w-3" />}
            </Button>
            <Users className="h-4 w-4 text-blue-400" />
            <span className="text-sm font-black tabular-nums">{realViewerCount} <span className="text-[10px] text-blue-300 opacity-60 font-sans">FANS</span></span>
          </div>
          <Button variant="ghost" size="icon" className="text-white/40 hover:text-white hover:bg-white/5" onClick={() => setSettingsOpen(true)}>
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex flex-col lg:flex-row h-[calc(100vh-64px)]">
        {/* CENTER MONITOR */}
        <div className="flex-1 bg-[#0A0A0A] p-4 lg:p-6 overflow-y-auto custom-scrollbar flex flex-col">
          <div className="max-w-[1400px] mx-auto space-y-6 flex-1 flex flex-col">

            {/* Monitor Area */}
            <div className="aspect-video bg-black rounded-3xl overflow-hidden shadow-3xl border border-white/10 relative group flex-shrink-0">
              {!isMonitoringStarted ? (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md">
                  <Button
                    onClick={() => setIsMonitoringStarted(true)}
                    className="h-16 px-8 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-black italic tracking-widest text-lg shadow-2xl shadow-blue-900/40 animate-pulse transition-all hover:scale-105"
                  >
                    <Play className="h-6 w-6 mr-3 fill-current" />
                    INITIALIZE MONITORING CONSOLE
                  </Button>
                  <p className="mt-4 text-xs text-white/40 font-mono tracking-widest uppercase">Click to enable secure video downlink</p>
                </div>
              ) : activeCamera ? (
                <>
                  <video
                    ref={mainVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-contain"
                    onCanPlay={() => {
                      mainVideoRef.current?.play().catch(e => {
                        console.error("Main Video Autoplay Failed:", e);
                        setPlaybackError(true);
                      });
                    }}
                  />

                  {/* Playback Error Overlay */}
                  {playbackError && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                      <Button
                        onClick={() => {
                          if (mainVideoRef.current) {
                            mainVideoRef.current.play().then(() => setPlaybackError(false));
                          }
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-full shadow-2xl animate-pulse"
                      >
                        <Play className="h-6 w-6 mr-2 fill-current" />
                        CLICK TO ENABLE VIDEO
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white/10">
                  <VideoOff className="h-24 w-24 mb-6 stroke-[1]" />
                  <p className="text-xl font-black uppercase tracking-widest italic font-poppins">No Source Selected</p>
                </div>
              )}

              {/* Status & Audio Pulse */}
              {isLive && (
                <div className="absolute top-6 right-6 z-20 flex flex-col gap-2">
                  <div className="bg-red-600/90 backdrop-blur px-3 py-1 rounded-full flex items-center gap-2 animate-pulse">
                    <Radio className="h-3 w-3 text-white" />
                    <span className="text-[10px] font-black uppercase text-white tracking-widest">Live Feed active</span>
                  </div>
                  {!isMuted && (
                    <div className="bg-blue-600/90 backdrop-blur px-3 py-1 rounded-full flex items-center gap-2">
                      <Mic className="h-3 w-3 text-white" />
                      <span className="text-[10px] font-black uppercase text-white tracking-widest">Comm Link Open</span>
                    </div>
                  )}
                </div>
              )}

              {/* Always Visible Overlays (Scoreboard) */}
              {showScoreboard && (
                <div className="absolute top-6 left-6 z-20 pointer-events-none scale-110 origin-top-left">
                  <div className="flex items-center bg-black/80 backdrop-blur-2xl rounded-xl border border-white/10 shadow-3xl overflow-hidden divide-x divide-white/10">
                    <div className="flex items-center h-12 bg-blue-600/20 px-4 gap-3">
                      {homeLogo && <img src={homeLogo} className="h-6 w-6 rounded-full object-cover shadow-lg" />}
                      <span className="text-sm font-black text-white italic tracking-tighter">{homeTeam}</span>
                      <span className="text-xl font-black text-blue-400 ml-2">{homeScore}</span>
                    </div>
                    <div className="flex items-center h-12 bg-red-600/20 px-4 gap-3">
                      <span className="text-xl font-black text-red-400 mr-2">{awayScore}</span>
                      <span className="text-sm font-black text-white italic tracking-tighter">{awayTeam}</span>
                      {awayLogo && <img src={awayLogo} className="h-6 w-6 rounded-full object-cover shadow-lg" />}
                    </div>
                    {showClock && (
                      <div className="flex flex-col justify-center items-center px-4 bg-white/5 h-12 min-w-[70px]">
                        <span className="text-lg font-black tabular-nums tracking-tighter">{formatTime(matchMinutes, matchSeconds)}</span>
                        {addedTime > 0 && <span className="text-[10px] text-red-500 font-bold -mt-1">+{addedTime}'</span>}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Control Bar */}
              <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/100 via-black/40 to-transparent">
                <div className="flex items-center justify-between">
                  <div className="flex gap-4">
                    <Button
                      size="icon"
                      variant="ghost"
                      className={`h-10 w-10 rounded-xl transition-colors ${isMuted ? 'bg-red-600/20 text-red-500 hover:bg-red-600/30' : 'bg-white/5 hover:bg-white/10 text-white'}`}
                      onClick={() => setIsMuted(!isMuted)}
                    >
                      {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    </Button>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase text-white/30 tracking-widest pl-2">
                      <Headphones className="h-3 w-3" /> Commentary
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Button
                      className={`h-12 px-8 rounded-2xl font-black italic tracking-tight gap-3 shadow-2xl transition-all ${isLive ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                      onClick={() => setIsLive(!isLive)}
                    >
                      {isLive ? <StopCircle className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                      {isLive ? 'STOP BROADCAST' : 'GO LIVE NOW'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Input Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 font-poppins">Active Units</h2>
                <Button variant="ghost" size="sm" className="h-6 text-[10px] text-blue-400 bg-blue-500/10 hover:bg-blue-500/20" onClick={() => handleCopy(cameraJoinUrl, 'cam-link')}>
                  {copiedId === 'cam-link' ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                  COPY LINK
                </Button>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {cameras.map(cam => (
                  <Card
                    key={cam.id}
                    className={`bg-[#0F1115] border-none overflow-hidden rounded-2xl cursor-pointer transition-all relative aspect-video group ${activeCamera === cam.id ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-[#0A0A0A]' : 'hover:bg-white/5'}`}
                    onClick={() => handleCameraSwitch(cam.id)}
                  >
                    <div className="absolute top-2 left-2 z-10 flex gap-2">
                      <Badge className="bg-black/60 text-[8px] font-black italic tracking-widest backdrop-blur border-none">{cam.name}</Badge>
                      {cam.status === 'live' && <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse mt-1" />}
                    </div>

                    <video ref={el => { videoRefs.current[cam.id] = el; }} autoPlay playsInline muted className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />

                    <div className={`absolute inset-0 flex items-center justify-center transition-all bg-black/40 ${activeCamera === cam.id ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'}`}>
                      <div className="bg-blue-600 rounded-full p-2 shadow-xl scale-75 group-hover:scale-100 transition-transform">
                        <Monitor className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  </Card>
                ))}
                {cameras.length === 0 && (
                  <div className="col-span-2 lg:col-span-4 h-32 flex flex-col items-center justify-center bg-white/5 rounded-2xl border-2 border-dashed border-white/5 text-white/20">
                    <Camera className="h-8 w-8 mb-2 opacity-20" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Awaiting camera operators...</span>
                  </div>
                )}
              </div>
            </div>

            {/* Dashboards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-6">
              {/* Match Control */}
              <Card className="bg-[#12151B] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                <CardHeader className="bg-white/2 py-4 px-6 border-b border-white/5">
                  <CardTitle className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><Timer className="h-3.5 w-3.5 text-orange-500" /> Match Control</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-8">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 flex flex-col items-center gap-2">
                      <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center p-2">
                        {homeLogo ? <img src={homeLogo} className="h-full w-full object-contain" /> : <div className="h-full w-full bg-blue-500/20 rounded-full" />}
                      </div>
                      <div className="flex items-center gap-3">
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-white/20" onClick={() => setHomeScore(Math.max(0, homeScore - 1))}><Minus /></Button>
                        <span className="text-3xl font-black italic tabular-nums">{homeScore}</span>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-white/20" onClick={() => setHomeScore(homeScore + 1)}><Plus /></Button>
                      </div>
                    </div>
                    <div className="h-12 w-px bg-white/10" />
                    <div className="flex-1 flex flex-col items-center gap-2">
                      <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center p-2">
                        {awayLogo ? <img src={awayLogo} className="h-full w-full object-contain" /> : <div className="h-full w-full bg-red-500/20 rounded-full" />}
                      </div>
                      <div className="flex items-center gap-3">
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-white/20" onClick={() => setAwayScore(Math.max(0, awayScore - 1))}><Minus /></Button>
                        <span className="text-3xl font-black italic tabular-nums">{awayScore}</span>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-white/20" onClick={() => setAwayScore(awayScore + 1)}><Plus /></Button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-black/40 rounded-2xl p-4 border border-white/5 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-black tabular-nums tracking-tighter text-blue-500">{formatTime(matchMinutes, matchSeconds)}</span>
                      <div className="flex gap-2">
                        <Button size="sm" className="h-8 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white" onClick={() => setIsClockRunning(!isClockRunning)}>
                          {isClockRunning ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => { setMatchMinutes(0); setMatchSeconds(0); }} className="h-8 text-white/20"><RotateCcw className="h-3.5 w-3.5" /></Button>
                      </div>
                    </div>
                    <div className="flex justify-between gap-1">
                      {[1, 2, 3, 5].map(m => (
                        <button
                          key={m}
                          onClick={() => setAddedTime(m)}
                          className={`flex-1 py-1 text-[9px] font-black uppercase rounded ${addedTime === m ? 'bg-blue-600' : 'bg-white/5 hover:bg-white/10'}`}
                        >
                          +{m}'
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Event Logger */}
              <Card className="bg-[#12151B] border border-white/5 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-full">
                <CardHeader className="bg-white/2 py-4 px-6 border-b border-white/5 flex flex-row items-center justify-between shrink-0">
                  <CardTitle className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><Trophy className="h-3.5 w-3.5 text-yellow-500" /> Highlights</CardTitle>
                  <Disc className={`h-3 w-3 ${isLive ? 'text-red-600 animate-pulse' : 'text-white/10'}`} />
                </CardHeader>
                <ScrollArea className="flex-1 p-4 h-48">
                  <div className="space-y-2">
                    {highlights.map(h => (
                      <div key={h.id} className="p-3 bg-white/2 rounded-xl border border-white/5 flex items-center justify-between group">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-blue-500 italic uppercase">{h.time}' {h.type}</span>
                          <p className="text-[11px] font-black uppercase tracking-tighter">{h.player}</p>
                          <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest">{h.team}</span>
                        </div>
                        <button onClick={() => setHighlights(prev => prev.filter(x => x.id !== h.id))} className="opacity-0 group-hover:opacity-100 text-red-500/50 hover:text-red-500"><Minus className="h-4 w-4" /></button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="p-4 border-t border-white/5 bg-black/20 flex gap-2 rounded-b-3xl">
                  <Button className="flex-1 h-9 bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white rounded-xl text-[9px] font-black italic tracking-tighter" onClick={() => addHighlight('Goal', homeTeam)}>HOME GOAL</Button>
                  <Button className="flex-1 h-9 bg-red-600/10 hover:bg-red-600 text-red-400 hover:text-white rounded-xl text-[9px] font-black italic tracking-tighter" onClick={() => addHighlight('Goal', awayTeam)}>AWAY GOAL</Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
