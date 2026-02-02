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
  Pause,
  RotateCcw,
  Monitor,
  Layout,
  Cpu,
  Activity,
  ChevronRight,
  Disc,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";

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
  peer?: SimplePeer.Instance;
}

export default function BroadcasterControlPage() {
  // --- State Management ---
  const [streamId] = useState(() => generateStreamId());
  const [isLive, setIsLive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [activeCamera, setActiveCamera] = useState<string | null>(null);
  const [volume, setVolume] = useState([85]);
  const [cameras, setCameras] = useState<CameraFeed[]>([]);
  const [realViewerCount, setRealViewerCount] = useState(0);

  // --- Refs ---
  const socket = useRef(getSocket());
  const peersRef = useRef<Map<string, SimplePeer.Instance>>(new Map());
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});
  const mainVideoRef = useRef<HTMLVideoElement>(null);

  // --- URLs ---
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const cameraJoinUrl = `${baseUrl}/camera/join?stream=${streamId}`;
  const viewerWatchUrl = `${baseUrl}/watch/${streamId}`;

  // --- Stats & Overlays ---
  const [matchMinutes, setMatchMinutes] = useState(0);
  const [matchSeconds, setMatchSeconds] = useState(0);
  const [isClockRunning, setIsClockRunning] = useState(false);
  const [addedTime, setAddedTime] = useState(0);
  const clockInterval = useRef<NodeJS.Timeout | null>(null);

  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [homeTeam, setHomeTeam] = useState("HOME TEAM");
  const [awayTeam, setAwayTeam] = useState("AWAY TEAM");
  const [homeLogo, setHomeLogo] = useState<string>("");
  const [awayLogo, setAwayLogo] = useState<string>("");
  const [matchThumbnail, setMatchThumbnail] = useState<string>("");

  const [highlights, setHighlights] = useState<{ id: string; type: string; team: string; player: string; time: string }[]>([]);
  const [lineup, setLineup] = useState({ home: "", away: "" });
  const [stats, setStats] = useState({ home: { shots: 0, possession: 50 }, away: { shots: 0, possession: 50 } });

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showScoreboard, setShowScoreboard] = useState(true);
  const [showClock, setShowClock] = useState(true);
  const [isRecording, setIsRecording] = useState(false);

  // --- WebRTC Signaling ---
  const createPeerConnection = useCallback((cameraId: string) => {
    console.log(`[WebRTC] Initiating connection to ${cameraId}`);

    // Destroy existing peer if any
    if (peersRef.current.has(cameraId)) {
      peersRef.current.get(cameraId)?.destroy();
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
      } else {
        // Send as candidate or general signal
        socket.current.emit('webrtc:ice-candidate', { to: cameraId, candidate: signal });
      }
    });

    peer.on('stream', (stream) => {
      console.log(`[WebRTC] Received stream from ${cameraId}`);
      setCameras(prev => prev.map(cam => {
        if (cam.id === cameraId) {
          return { ...cam, stream };
        }
        return cam;
      }));
    });

    peer.on('error', (err) => {
      console.error(`[WebRTC] Peer error with ${cameraId}:`, err);
      peersRef.current.delete(cameraId);
    });

    peer.on('close', () => {
      console.log(`[WebRTC] Connection closed with ${cameraId}`);
      peersRef.current.delete(cameraId);
    });
  }, []);

  // --- Socket Listeners ---
  useEffect(() => {
    const s = socket.current;
    s.emit('broadcaster:join', { streamCode: streamId });

    s.on('broadcaster:cameras', ({ cameras: existingCameras }) => {
      console.log('Existing cameras:', existingCameras);
      setCameras(existingCameras.map((cam: any) => ({
        id: cam.cameraId, name: cam.name, operator: cam.operator, status: cam.status
      })));
      existingCameras.forEach((cam: any) => createPeerConnection(cam.cameraId));
    });

    s.on('camera:new', ({ cameraId, name, operator }) => {
      console.log('New camera:', name);
      setCameras(prev => [...prev.filter(c => c.id !== cameraId), { id: cameraId, name, operator, status: 'connecting' }]);
      createPeerConnection(cameraId);
    });

    s.on('camera:status', ({ cameraId, status }) => {
      setCameras(prev => prev.map(cam => cam.id === cameraId ? { ...cam, status } : cam));
    });

    s.on('camera:disconnected', ({ cameraId }) => {
      console.log('Camera disconnected:', cameraId);
      setCameras(prev => prev.filter(cam => cam.id !== cameraId));
      if (peersRef.current.has(cameraId)) {
        peersRef.current.get(cameraId)?.destroy();
        peersRef.current.delete(cameraId);
      }
      if (activeCamera === cameraId) setActiveCamera(null);
    });

    s.on('webrtc:answer', ({ from, answer }) => {
      const peer = peersRef.current.get(from);
      if (peer) peer.signal(answer);
    });

    s.on('webrtc:ice-candidate', ({ from, candidate }) => {
      const peer = peersRef.current.get(from);
      if (peer) peer.signal(candidate);
    });

    s.on('viewer:count', ({ streamCode: code, count }) => {
      if (code === streamId) setRealViewerCount(count);
    });

    return () => {
      s.off('broadcaster:cameras');
      s.off('camera:new');
      s.off('camera:status');
      s.off('camera:disconnected');
      s.off('webrtc:answer');
      s.off('webrtc:ice-candidate');
      s.off('viewer:count');
    };
  }, [streamId, createPeerConnection, activeCamera]);

  // --- Video Handling ---
  useEffect(() => {
    cameras.forEach(cam => {
      if (cam.stream && videoRefs.current[cam.id]) {
        if (videoRefs.current[cam.id]!.srcObject !== cam.stream) {
          videoRefs.current[cam.id]!.srcObject = cam.stream;
        }
      }
    });
  }, [cameras]);

  useEffect(() => {
    if (activeCamera && mainVideoRef.current) {
      const cam = cameras.find(c => c.id === activeCamera);
      if (cam?.stream) {
        mainVideoRef.current.srcObject = cam.stream;
      }
    }
  }, [activeCamera, cameras]);

  // --- Match Sync ---
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
        addedTime, highlights, lineup, stats
      }
    });
  }, [isLive, homeScore, awayScore, matchMinutes, matchSeconds, homeTeam, awayTeam, homeLogo, awayLogo, matchThumbnail, streamId, addedTime, highlights, lineup, stats]);

  // --- Clock Logic ---
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
    } else {
      if (clockInterval.current) clearInterval(clockInterval.current);
    }
    return () => { if (clockInterval.current) clearInterval(clockInterval.current); };
  }, [isClockRunning]);

  // --- Handlers ---
  const handleCameraSwitch = (cameraId: string) => {
    setActiveCamera(cameraId);
    socket.current.emit('broadcaster:set-active-camera', { cameraId, streamCode: streamId });
  };

  const addHighlight = (type: string, team: string) => {
    const player = prompt("Player Name:");
    if (player) {
      setHighlights(prev => [...prev, {
        id: Math.random().toString(36).substr(2, 9),
        type, team, player,
        time: formatTime(matchMinutes, matchSeconds)
      }]);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#E0E0E0] font-sans selection:bg-blue-500/30 overflow-hidden">
      {/* --- Production Header --- */}
      <header className="h-16 border-b border-white/5 bg-black/40 backdrop-blur-xl px-4 flex items-center justify-between sticky top-0 z-[100]">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.3)]">
              <Monitor className="h-5 w-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-black tracking-widest uppercase">STREET BULL <span className="text-blue-500">CONTROL</span></h1>
              <p className="text-[10px] text-white/30 font-bold tracking-tighter uppercase">Professional Broadcast Suite v2.1</p>
            </div>
          </div>
          <div className="h-8 w-px bg-white/10 hidden md:block" />
          <div className="flex items-center gap-4">
            <Badge className={`h-6 px-3 border-none flex items-center gap-2 font-black italic tracking-tighter ${isLive ? 'bg-red-600 animate-pulse' : 'bg-white/10 text-white/40'}`}>
              <Radio className="h-3 w-3" /> {isLive ? 'ON AIR' : 'OFLINE'}
            </Badge>
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5">
              <Activity className="h-3 w-3 text-green-500" />
              <span className="text-[10px] font-bold text-white/60 tabular-nums">BITRATE: 4.2 MBPS</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-1.5 bg-blue-500/10 rounded-full border border-blue-500/20">
            <Users className="h-4 w-4 text-blue-400" />
            <span className="text-sm font-black tabular-nums">{realViewerCount} <span className="text-[10px] text-blue-300 opacity-60">FANS</span></span>
          </div>
          <Button variant="ghost" size="icon" className="text-white/40 hover:text-white hover:bg-white/5" onClick={() => setSettingsOpen(true)}>
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* --- Layout Grid --- */}
      <main className="flex flex-col lg:flex-row h-[calc(100vh-64px)]">
        {/* CENTER: Main Monitoring */}
        <div className="flex-1 bg-[#0A0A0A] p-4 lg:p-6 overflow-y-auto custom-scrollbar">
          <div className="max-w-[1400px] mx-auto space-y-6">

            {/* Main Stage */}
            <div className="relative group">
              <div className="aspect-video bg-black rounded-3xl overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8)] border border-white/10 relative">
                {activeCamera ? (
                  <video ref={mainVideoRef} autoPlay playsInline muted className="w-full h-full object-contain" />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white/10">
                    <VideoOff className="h-24 w-24 mb-6 stroke-[1]" />
                    <p className="text-xl font-black uppercase tracking-widest italic">Signal Lost</p>
                    <p className="text-xs font-bold mt-2 opacity-40 uppercase">NO ACTIVE CAMERA SELECTED</p>
                  </div>
                )}

                {/* Overlays */}
                {showScoreboard && (
                  <div className="absolute top-6 left-6 z-20 pointer-events-none transition-all duration-500 scale-110 origin-top-left">
                    <div className="flex items-center gap-0 bg-black/80 backdrop-blur-2xl rounded-xl border border-white/10 shadow-3xl overflow-hidden divide-x divide-white/10">
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

                {/* Bottom Controls */}
                <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black/100 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-4">
                      <Button size="icon" variant="ghost" className="h-12 w-12 rounded-2xl bg-white/5 hover:bg-white/10 text-white" onClick={() => setIsMuted(!isMuted)}>
                        {isMuted ? <MicOff /> : <Mic />}
                      </Button>
                      <div className="w-40 flex items-center px-4 bg-white/5 rounded-2xl">
                        <Slider value={volume} onValueChange={setVolume} max={100} className="[&_[role=slider]]:bg-blue-500" />
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <Button
                        className={`h-12 px-8 rounded-2xl font-black italic tracking-tighter gap-3 shadow-2xl transition-all ${isLive ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                        onClick={() => setIsLive(!isLive)}
                      >
                        {isLive ? <StopCircle className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                        {isLive ? 'STOP BROADCAST' : 'GO LIVE NOW'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Multiview Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Input Feeds Matrix</h2>
                <div className="flex gap-2">
                  <div className="h-1 w-8 bg-blue-600 rounded-full" />
                  <div className="h-1 w-2 bg-white/10 rounded-full" />
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {cameras.map(cam => (
                  <Card
                    key={cam.id}
                    className={`bg-[#0F1115] border-none overflow-hidden rounded-2xl cursor-pointer transition-all duration-300 relative group aspect-video ${activeCamera === cam.id ? 'ring-2 ring-blue-500 ring-offset-4 ring-offset-[#0A0A0A]' : 'hover:bg-white/5'}`}
                    onClick={() => handleCameraSwitch(cam.id)}
                  >
                    <video ref={el => { videoRefs.current[cam.id] = el; }} autoPlay playsInline muted className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute top-3 left-3 flex flex-col gap-1">
                      <Badge className="bg-black/60 rounded px-1.5 py-0.5 text-[8px] font-black italic tracking-widest border border-white/5">{cam.name}</Badge>
                      <span className="text-[8px] font-black text-white/40 uppercase ml-1">{cam.operator}</span>
                    </div>
                    <div className="absolute bottom-3 right-3 flex gap-1 items-center">
                      {cam.status === 'live' && <div className="h-1.5 w-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />}
                    </div>
                  </Card>
                ))}
                {cameras.length < 4 && Array.from({ length: 4 - cameras.length }).map((_, i) => (
                  <div key={i} className="aspect-video bg-white/5 rounded-2xl border-2 border-dashed border-white/5 flex flex-col items-center justify-center text-white/10">
                    <Layout className="h-6 w-6 mb-2 opacity-5" />
                    <span className="text-[9px] font-black uppercase opacity-20 tracking-wider">Channel {cameras.length + i + 1} Empty</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Match Tools Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Clock & Score Controller */}
              <Card className="bg-[#12151B] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                <CardHeader className="bg-white/5 py-4 px-6">
                  <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2"><Timer className="h-4 w-4 text-orange-500" /> Match Control</CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                  <div className="flex items-center justify-between gap-6">
                    <div className="flex-1 flex flex-col items-center gap-4">
                      <div className="h-16 w-16 rounded-full bg-blue-500/10 flex items-center justify-center p-3">
                        {homeLogo ? <img src={homeLogo} className="h-full w-full object-contain" /> : <div className="h-full w-full bg-blue-500/20 rounded-full" />}
                      </div>
                      <div className="flex items-center gap-4">
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-white/20 hover:text-white" onClick={() => setHomeScore(Math.max(0, homeScore - 1))}><Minus /></Button>
                        <span className="text-4xl font-black italic tabular-nums">{homeScore}</span>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-white/20 hover:text-white" onClick={() => setHomeScore(homeScore + 1)}><Plus /></Button>
                      </div>
                    </div>
                    <div className="h-16 w-px bg-white/5" />
                    <div className="flex-1 flex flex-col items-center gap-4">
                      <div className="h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center p-3">
                        {awayLogo ? <img src={awayLogo} className="h-full w-full object-contain" /> : <div className="h-full w-full bg-red-500/20 rounded-full" />}
                      </div>
                      <div className="flex items-center gap-4">
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-white/20 hover:text-white" onClick={() => setAwayScore(Math.max(0, awayScore - 1))}><Minus /></Button>
                        <span className="text-4xl font-black italic tabular-nums">{awayScore}</span>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-white/20 hover:text-white" onClick={() => setAwayScore(awayScore + 1)}><Plus /></Button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-black/40 rounded-2xl p-6 border border-white/5">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex flex-col">
                        <span className="text-3xl font-black tabular-nums tracking-tighter italic text-blue-500">{formatTime(matchMinutes, matchSeconds)}</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Game Interval</span>
                      </div>
                      <div className="flex gap-2">
                        <Button className="h-10 rounded-xl bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white" onClick={() => setIsClockRunning(!isClockRunning)}>
                          {isClockRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => { setMatchMinutes(0); setMatchSeconds(0); }} className="text-white/20"><RotateCcw className="h-4 w-4" /></Button>
                      </div>
                    </div>
                    <div className="flex justify-between gap-px bg-white/5 p-px rounded-xl">
                      {[1, 2, 3, 5].map(m => (
                        <button
                          key={m}
                          onClick={() => setAddedTime(m)}
                          className={`flex-1 py-2 text-[10px] font-black uppercase transition-all ${addedTime === m ? 'bg-blue-600 text-white' : 'hover:bg-white/5'}`}
                        >
                          +{m}'
                        </button>
                      ))}
                      <button onClick={() => setAddedTime(0)} className="flex-1 py-1 text-[10px] font-black uppercase hover:bg-white/5">—</button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Event Logger */}
              <Card className="bg-[#12151B] border border-white/5 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-full">
                <CardHeader className="bg-white/5 py-4 px-6 flex flex-row items-center justify-between shrink-0">
                  <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2"><Trophy className="h-4 w-4 text-yellow-500" /> Match Highlights</CardTitle>
                  <Disc className={`h-4 w-4 ${isLive ? 'text-red-600 animate-pulse' : 'text-white/10'}`} />
                </CardHeader>
                <ScrollArea className="flex-1 p-6">
                  <div className="space-y-3">
                    {highlights.map(h => (
                      <div key={h.id} className="p-4 bg-white/5 rounded-2xl border border-white/5 group hover:bg-white/10 transition-colors">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-black text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded italic">{h.time}'</span>
                          <button onClick={() => setHighlights(prev => prev.filter(x => x.id !== h.id))} className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-500 transition-all"><Plus className="h-3 w-3 rotate-45" /></button>
                        </div>
                        <p className="text-sm font-black italic tracking-tight uppercase">{h.player}</p>
                        <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">{h.team}</span>
                      </div>
                    ))}
                    {highlights.length === 0 && (
                      <div className="h-48 flex flex-col items-center justify-center text-white/5 gap-3">
                        <History className="h-10 w-10 stroke-[1]" />
                        <span className="text-[10px] font-black uppercase tracking-widest">No Events Logged</span>
                      </div>
                    )}
                  </div>
                </ScrollArea>
                <div className="p-6 border-t border-white/5 bg-black/20 flex gap-3 rounded-b-3xl">
                  <Button className="flex-1 h-10 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white rounded-xl text-[10px] font-black italic tracking-tighter" onClick={() => addHighlight('Goal', homeTeam)}>LOG {homeTeam}</Button>
                  <Button className="flex-1 h-10 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white rounded-xl text-[10px] font-black italic tracking-tighter" onClick={() => addHighlight('Goal', awayTeam)}>LOG {awayTeam}</Button>
                </div>
              </Card>

              {/* Tactics & Analytics */}
              <Card className="bg-[#12151B] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                <CardHeader className="bg-white/5 py-4 px-6 flex items-center justify-between">
                  <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2"><BarChart3 className="h-4 w-4 text-blue-500" /> Squad & Intel</CardTitle>
                </CardHeader>
                <Tabs defaultValue="stats" className="w-full">
                  <TabsList className="w-full rounded-none bg-transparent border-b border-white/5 h-12 flex">
                    <TabsTrigger value="stats" className="flex-1 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-transparent data-[state=active]:text-blue-500 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none">DATA</TabsTrigger>
                    <TabsTrigger value="lineup" className="flex-1 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-transparent data-[state=active]:text-blue-500 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none">LINEUP</TabsTrigger>
                  </TabsList>
                  <div className="p-6 h-64">
                    <TabsContent value="stats" className="m-0 space-y-6">
                      <div className="space-y-4">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-1">
                          <span className="text-white/40">POSS: {stats.home.possession}%</span>
                          <span className="text-blue-500">POSSESSION</span>
                          <span className="text-white/40">{stats.away.possession}%</span>
                        </div>
                        <Slider value={[stats.home.possession]} max={100} onValueChange={v => setStats(s => ({ ...s, home: { ...s.home, possession: v[0] }, away: { ...s.away, possession: 100 - v[0] } }))} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white/5 rounded-2xl space-y-2 border border-white/5">
                          <span className="text-[10px] font-black uppercase text-white/30 truncate block">Shots: {homeTeam}</span>
                          <div className="flex items-center justify-between">
                            <span className="text-2xl font-black italic">{stats.home.shots}</span>
                            <Button size="icon" variant="ghost" className="h-6 w-6 text-blue-500" onClick={() => setStats(s => ({ ...s, home: { ...s.home, shots: s.home.shots + 1 } }))}><Plus /></Button>
                          </div>
                        </div>
                        <div className="p-4 bg-white/5 rounded-2xl space-y-2 border border-white/5">
                          <span className="text-[10px] font-black uppercase text-white/30 truncate block">Shots: {awayTeam}</span>
                          <div className="flex items-center justify-between">
                            <span className="text-2xl font-black italic">{stats.away.shots}</span>
                            <Button size="icon" variant="ghost" className="h-6 w-6 text-red-500" onClick={() => setStats(s => ({ ...s, away: { ...s.away, shots: s.away.shots + 1 } }))}><Plus /></Button>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="lineup" className="m-0 space-y-4">
                      <textarea
                        className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-[11px] font-medium h-24 focus:ring-1 ring-blue-500 transition-all outline-none"
                        placeholder="HOME SQUAD..."
                        value={lineup.home}
                        onChange={e => setLineup(l => ({ ...l, home: e.target.value }))}
                      />
                      <textarea
                        className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-[11px] font-medium h-24 focus:ring-1 ring-blue-500 transition-all outline-none"
                        placeholder="AWAY SQUAD..."
                        value={lineup.away}
                        onChange={e => setLineup(l => ({ ...l, away: e.target.value }))}
                      />
                    </TabsContent>
                  </div>
                </Tabs>
              </Card>
            </div>
          </div>
        </div>

        {/* SIDEBAR: Admin & Distribution */}
        <div className="w-full lg:w-96 bg-black border-l border-white/5 flex flex-col">
          <div className="p-6 border-b border-white/5 bg-gradient-to-br from-blue-600/10 to-transparent">
            <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-blue-500 mb-4">Distribution Hub</h2>
            <div className="space-y-4">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase text-white/40">Camera Invite</span>
                  <div className="p-1.5 bg-white rounded-lg shadow-2xl">
                    <QRCodeSVG value={cameraJoinUrl} size={64} level="H" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Input readOnly value={cameraJoinUrl} className="bg-transparent border-white/10 text-[10px] font-mono h-9" />
                  <Button size="icon" variant="ghost" className="h-9 w-9 shrink-0 hover:bg-white/10" onClick={() => handleCopy(cameraJoinUrl)}><Copy className="h-4 w-4" /></Button>
                </div>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-3">
                <span className="text-[10px] font-black uppercase text-white/40">Watch Hub Link</span>
                <div className="flex gap-2">
                  <Input readOnly value={viewerWatchUrl} className="bg-transparent border-white/10 text-[10px] font-mono h-9" />
                  <Button size="icon" variant="ghost" className="h-9 w-9 shrink-0 hover:bg-white/10" onClick={() => handleCopy(viewerWatchUrl)}><Copy className="h-4 w-4" /></Button>
                </div>
                <Button className="w-full h-10 bg-white/5 hover:bg-blue-600 rounded-xl gap-2 text-[10px] font-black uppercase tracking-widest transition-all" onClick={() => { if (navigator.share) navigator.share({ url: viewerWatchUrl }) }}>
                  <Share2 className="h-4 w-4" /> Share Stream
                </Button>
              </div>
            </div>
          </div>

          <ScrollArea className="flex-1 p-6">
            <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-white/20 mb-6">Production Logs</h2>
            <div className="space-y-4 opacity-40">
              <div className="flex gap-4">
                <Cpu className="h-4 w-4 shrink-0 text-blue-500" />
                <div className="space-y-1">
                  <p className="text-[11px] font-bold">SYSTEM_V2_READY</p>
                  <p className="text-[10px] tabular-nums">12:45:01.32</p>
                </div>
              </div>
              <div className="flex gap-4">
                <Activity className="h-4 w-4 shrink-0 text-green-500" />
                <div className="space-y-1">
                  <p className="text-[11px] font-bold">STUN_RELAY_CONNECTED</p>
                  <p className="text-[10px] tabular-nums">12:45:05.11</p>
                </div>
              </div>
              {cameras.map(cam => (
                <div key={cam.id} className="flex gap-4">
                  <Camera className="h-4 w-4 shrink-0 text-white" />
                  <div className="space-y-1">
                    <p className="text-[11px] font-bold">FEED_RECEIVED: {cam.name.toUpperCase()}</p>
                    <p className="text-[10px] tabular-nums">STATUS_ACTIVE</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="p-6 bg-black">
            <Card className="bg-white/5 border-none rounded-2xl p-4">
              <div className="flex items-center gap-4">
                <disc className={`h-4 w-4 ${isRecording ? 'text-red-600 animate-pulse' : 'text-white/10'}`} />
                <div className="flex-1">
                  <p className="text-xs font-black uppercase tracking-widest">Recording Status</p>
                  <p className="text-[10px] text-white/30 uppercase font-black">{isRecording ? 'writing to memory...' : 'STANDBY'}</p>
                </div>
                <Button size="sm" variant={isRecording ? 'destructive' : 'outline'} className="rounded-lg h-8 text-[10px] font-black uppercase tracking-widest" onClick={() => setIsRecording(!isRecording)}>
                  {isRecording ? 'STOP' : 'REC'}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </main>

      {/* --- Global Config Dialog --- */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="max-w-2xl bg-[#0F1115] border-white/5 rounded-[2rem] p-0 shadow-3xl overflow-hidden">
          <div className="p-8 bg-gradient-to-br from-blue-600/20 to-transparent border-b border-white/5">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black italic tracking-tighter uppercase italic">Control Suite <span className="text-blue-500 italic">Configuration</span></DialogTitle>
            </DialogHeader>
          </div>
          <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-6">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500">Live Overlays</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 transition-colors">
                    <Label className="font-bold text-sm">Visual Scoreboard</Label>
                    <Switch checked={showScoreboard} onCheckedChange={setShowScoreboard} />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 transition-colors">
                    <Label className="font-bold text-sm">Real-time Clock</Label>
                    <Switch checked={showClock} onCheckedChange={setShowClock} />
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500">Identity Profile</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-white/30 ml-2">Home Organization</Label>
                    <Input value={homeTeam} onChange={e => setHomeTeam(e.target.value.toUpperCase())} className="bg-black/40 border-white/10 rounded-xl h-12 font-black italic tracking-tighter" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-white/30 ml-2">Visitor Organization</Label>
                    <Input value={awayTeam} onChange={e => setAwayTeam(e.target.value.toUpperCase())} className="bg-black/40 border-white/10 rounded-xl h-12 font-black italic tracking-tighter" />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6 pt-4 border-t border-white/5">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500">Brand Assets</h3>
              <div className="grid grid-cols-3 gap-6">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase text-white/30 block text-center">Home Emblem</Label>
                  <div className="aspect-square bg-white/5 rounded-3xl border border-white/5 flex flex-col items-center justify-center p-6 relative overflow-hidden group">
                    {homeLogo ? <img src={homeLogo} className="h-full w-full object-contain" /> : <Plus className="h-8 w-8 text-white/5" />}
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const r = new FileReader();
                        r.onload = () => setHomeLogo(r.result as string);
                        r.readAsDataURL(file);
                      }
                    }} />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase text-white/30 block text-center">Away Emblem</Label>
                  <div className="aspect-square bg-white/5 rounded-3xl border border-white/5 flex flex-col items-center justify-center p-6 relative overflow-hidden">
                    {awayLogo ? <img src={awayLogo} className="h-full w-full object-contain" /> : <Plus className="h-8 w-8 text-white/5" />}
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const r = new FileReader();
                        r.onload = () => setAwayLogo(r.result as string);
                        r.readAsDataURL(file);
                      }
                    }} />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase text-white/30 block text-center">Production Poster</Label>
                  <div className="aspect-square bg-white/5 rounded-3xl border border-white/5 flex flex-col items-center justify-center p-6 relative overflow-hidden">
                    {matchThumbnail ? <img src={matchThumbnail} className="h-full w-full object-contain" /> : <ImageIcon className="h-8 w-8 text-white/5" />}
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const r = new FileReader();
                        r.onload = () => setMatchThumbnail(r.result as string);
                        r.readAsDataURL(file);
                      }
                    }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="p-8 bg-black/40 border-t border-white/5 flex justify-end">
            <Button onClick={() => setSettingsOpen(false)} className="bg-blue-600 hover:bg-blue-700 h-14 px-12 rounded-2xl font-black italic tracking-widest shadow-2xl">APPLY CONFIGURATION</Button>
          </div>
        </DialogContent>
      </Dialog>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .shadow-3xl {
          box-shadow: 0 50px 100px -20px rgba(0,0,0,0.8);
        }
        input, select, textarea {
          color: white !important;
        }
      `}</style>
    </div>
  );
}
