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
  Activity,
  Disc,
  Check,
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
  const [isMuted, setIsMuted] = useState(false);
  const [activeCamera, setActiveCamera] = useState<string | null>(null);
  const [volume, setVolume] = useState([85]);
  const [cameras, setCameras] = useState<CameraFeed[]>([]);
  const [realViewerCount, setRealViewerCount] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // --- Refs ---
  const socket = useRef(getSocket());
  const peersRef = useRef<Map<string, SimplePeer.Instance>>(new Map());
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});
  const mainVideoRef = useRef<HTMLVideoElement>(null);

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
  const [homeLogo, setHomeLogo] = useState<string>("");
  const [awayLogo, setAwayLogo] = useState<string>("");
  const [matchThumbnail, setMatchThumbnail] = useState<string>("");

  const [highlights, setHighlights] = useState<{ id: string; type: string; team: string; player: string; time: string }[]>([]);
  const [lineup, setLineup] = useState({ home: "", away: "" });
  const [stats, setStats] = useState({ home: { shots: 0, possession: 50 }, away: { shots: 0, possession: 50 } });

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showScoreboard, setShowScoreboard] = useState(true);
  const [showClock, setShowClock] = useState(true);

  // --- WebRTC Logic ---
  const createPeerConnection = useCallback((cameraId: string) => {
    console.log(`[WebRTC] Initiating to ${cameraId}`);

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
      } else if (signal.candidate) {
        socket.current.emit('webrtc:ice-candidate', { to: cameraId, candidate: signal });
      }
    });

    peer.on('stream', (stream) => {
      console.log(`[WebRTC] Received stream from ${cameraId}`);
      setCameras(prev => prev.map(cam => cam.id === cameraId ? { ...cam, stream } : cam));
    });

    peer.on('error', (err) => {
      console.error(`[WebRTC] Error with ${cameraId}:`, err);
      peersRef.current.delete(cameraId);
    });

    peer.on('close', () => peersRef.current.delete(cameraId));
  }, []);

  // --- Socket Effects ---
  useEffect(() => {
    const s = socket.current;

    s.emit('broadcaster:join', { streamCode: streamId });

    const handleCameras = ({ cameras: existingCameras }: { cameras: any[] }) => {
      setCameras(existingCameras.map(cam => ({
        id: cam.cameraId, name: cam.name, operator: cam.operator, status: cam.status
      })));
      existingCameras.forEach(cam => createPeerConnection(cam.cameraId));
    };

    const handleNewCamera = ({ cameraId, name, operator }: any) => {
      setCameras(prev => [...prev.filter(c => c.id !== cameraId), { id: cameraId, name, operator, status: 'connecting' }]);
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

    const handleAnswer = ({ from, answer }: any) => {
      const peer = peersRef.current.get(from);
      if (peer) peer.signal(answer);
    };

    const handleIceCandidate = ({ from, candidate }: any) => {
      const peer = peersRef.current.get(from);
      if (peer) peer.signal(candidate);
    };

    const handleViewerCount = ({ streamCode: code, count }: any) => {
      if (code === streamId) setRealViewerCount(count);
    };

    s.on('broadcaster:cameras', handleCameras);
    s.on('camera:new', handleNewCamera);
    s.on('camera:status', handleStatus);
    s.on('camera:disconnected', handleDisconnect);
    s.on('webrtc:answer', handleAnswer);
    s.on('webrtc:ice-candidate', handleIceCandidate);
    s.on('viewer:count', handleViewerCount);

    return () => {
      s.off('broadcaster:cameras', handleCameras);
      s.off('camera:new', handleNewCamera);
      s.off('camera:status', handleStatus);
      s.off('camera:disconnected', handleDisconnect);
      s.off('webrtc:answer', handleAnswer);
      s.off('webrtc:ice-candidate', handleIceCandidate);
      s.off('viewer:count', handleViewerCount);
    };
  }, [streamId, createPeerConnection]);

  // --- Video Sync Effects ---
  useEffect(() => {
    cameras.forEach(cam => {
      if (cam.stream && videoRefs.current[cam.id]) {
        if (videoRefs.current[cam.id]!.srcObject !== cam.stream) {
          videoRefs.current[cam.id]!.srcObject = cam.stream;
          videoRefs.current[cam.id]!.play().catch(() => { });
        }
      }
    });
  }, [cameras]);

  useEffect(() => {
    if (activeCamera && mainVideoRef.current) {
      const cam = cameras.find(c => c.id === activeCamera);
      if (cam?.stream) {
        mainVideoRef.current.srcObject = cam.stream;
        mainVideoRef.current.play().catch(() => { });
      }
    }
  }, [activeCamera, cameras]);

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
        addedTime, highlights, lineup, stats
      }
    });
  }, [isLive, homeScore, awayScore, matchMinutes, matchSeconds, homeTeam, awayTeam, homeLogo, awayLogo, matchThumbnail, streamId, addedTime, highlights, lineup, stats]);

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

  // --- Handlers ---
  const handleCameraSwitch = (cameraId: string) => {
    setActiveCamera(cameraId);
    socket.current.emit('broadcaster:set-active-camera', { cameraId, streamCode: streamId });
  };

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
    <div className="min-h-screen bg-[#050505] text-[#E0E0E0] font-display selection:bg-blue-500/30 overflow-hidden">
      {/* HEADER */}
      <header className="h-16 border-b border-white/5 bg-black/40 backdrop-blur-xl px-4 flex items-center justify-between sticky top-0 z-[100]">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg">
              <Monitor className="h-5 w-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-black tracking-widest uppercase">STREET BULL <span className="text-blue-500">CONTROL</span></h1>
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
        <div className="flex-1 bg-[#0A0A0A] p-4 lg:p-6 overflow-y-auto custom-scrollbar">
          <div className="max-w-[1400px] mx-auto space-y-6">

            {/* Monitor Area */}
            <div className="aspect-video bg-black rounded-3xl overflow-hidden shadow-3xl border border-white/10 relative group">
              {activeCamera ? (
                <video ref={mainVideoRef} autoPlay playsInline muted className="w-full h-full object-contain" />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white/10">
                  <VideoOff className="h-24 w-24 mb-6 stroke-[1]" />
                  <p className="text-xl font-black uppercase tracking-widest italic font-display">No Source Selected</p>
                </div>
              )}

              {/* Always Visible Overlays */}
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

              {/* Fixed Control Bar (Always Visible) */}
              <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/100 via-black/40 to-transparent">
                <div className="flex items-center justify-between">
                  <div className="flex gap-4">
                    <Button size="icon" variant="ghost" className="h-10 w-10 rounded-xl bg-white/5 hover:bg-white/10 text-white" onClick={() => setIsMuted(!isMuted)}>
                      {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    </Button>
                    <div className="w-32 hidden sm:flex items-center px-3 bg-white/5 rounded-xl">
                      <Slider value={volume} onValueChange={setVolume} max={100} />
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
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 px-2 font-display">Active Units</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {cameras.map(cam => (
                  <Card
                    key={cam.id}
                    className={`bg-[#0F1115] border-none overflow-hidden rounded-2xl cursor-pointer transition-all relative aspect-video ${activeCamera === cam.id ? 'ring-2 ring-blue-500 ring-offset-4 ring-offset-[#0A0A0A]' : 'hover:bg-white/5'}`}
                    onClick={() => handleCameraSwitch(cam.id)}
                  >
                    <video ref={el => { videoRefs.current[cam.id] = el; }} autoPlay playsInline muted className="w-full h-full object-cover opacity-70 group-hover:opacity-100" />
                    <div className="absolute inset-0 bg-transparent flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/40">
                      <Monitor className="h-6 w-6 text-white" />
                    </div>
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-black/60 text-[8px] font-black italic tracking-widest">{cam.name}</Badge>
                    </div>
                  </Card>
                ))}
                {cameras.length === 0 && (
                  <div className="col-span-4 h-32 flex flex-col items-center justify-center bg-white/5 rounded-2xl border-2 border-dashed border-white/5 text-white/20">
                    <Camera className="h-8 w-8 mb-2 opacity-20" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Awaiting camera operators...</span>
                  </div>
                )}
              </div>
            </div>

            {/* Dashboards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                <ScrollArea className="flex-1 p-4">
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

              {/* Team Info */}
              <Card className="bg-[#12151B] border border-white/5 rounded-3xl overflow-hidden shadow-2xl h-full">
                <Tabs defaultValue="stats" className="h-full flex flex-col">
                  <TabsList className="bg-white/2 rounded-none border-b border-white/5 h-12 flex px-1">
                    <TabsTrigger value="stats" className="flex-1 text-[9px] font-black uppercase tracking-widest">Analytics</TabsTrigger>
                    <TabsTrigger value="lineup" className="flex-1 text-[9px] font-black uppercase tracking-widest">Squads</TabsTrigger>
                  </TabsList>
                  <ScrollArea className="flex-1">
                    <TabsContent value="stats" className="p-6 m-0 space-y-6">
                      <div className="space-y-4">
                        <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-white/30">
                          <span>{stats.home.possession}%</span>
                          <span>Possession</span>
                          <span>{stats.away.possession}%</span>
                        </div>
                        <Slider value={[stats.home.possession]} max={100} onValueChange={v => setStats(s => ({ ...s, home: { ...s.home, possession: v[0] }, away: { ...s.away, possession: 100 - v[0] } }))} />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-white/2 rounded-xl border border-white/5 text-center space-y-1">
                          <span className="text-[8px] font-black text-white/20 uppercase">Shots - {homeTeam}</span>
                          <div className="flex items-center justify-center gap-3">
                            <span className="text-xl font-black italic">{stats.home.shots}</span>
                            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setStats(s => ({ ...s, home: { ...s.home, shots: s.home.shots + 1 } }))}><Plus className="h-3 w-3" /></Button>
                          </div>
                        </div>
                        <div className="p-3 bg-white/2 rounded-xl border border-white/5 text-center space-y-1">
                          <span className="text-[8px] font-black text-white/20 uppercase">Shots - {awayTeam}</span>
                          <div className="flex items-center justify-center gap-3">
                            <span className="text-xl font-black italic">{stats.away.shots}</span>
                            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setStats(s => ({ ...s, away: { ...s.away, shots: s.away.shots + 1 } }))}><Plus className="h-3 w-3" /></Button>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="lineup" className="p-6 m-0 space-y-4">
                      <textarea className="w-full bg-black/40 border-none rounded-xl p-3 text-[10px] font-bold h-20 resize-none" placeholder="Home lineup..." value={lineup.home} onChange={e => setLineup(l => ({ ...l, home: e.target.value }))} />
                      <textarea className="w-full bg-black/40 border-none rounded-xl p-3 text-[10px] font-bold h-20 resize-none" placeholder="Away lineup..." value={lineup.away} onChange={e => setLineup(l => ({ ...l, away: e.target.value }))} />
                    </TabsContent>
                  </ScrollArea>
                </Tabs>
              </Card>
            </div>
          </div>
        </div>

        {/* SIDEBAR */}
        <div className="w-full lg:w-80 bg-black border-l border-white/5 flex flex-col font-sans">
          <div className="p-6 space-y-8">
            <div className="space-y-4">
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">Production Hub</h2>

              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black uppercase text-white/40">Camera Invite</span>
                  <div className="p-1 bg-white rounded shadow-xl">
                    <QRCodeSVG value={cameraJoinUrl} size={64} level="L" />
                  </div>
                </div>
                <div className="flex gap-1 relative">
                  <Input readOnly value={cameraJoinUrl} className="bg-transparent border-white/10 text-[9px] font-mono h-8 pr-10" />
                  <button
                    onClick={() => handleCopy(cameraJoinUrl, 'cam-url')}
                    className="absolute right-0 top-0 h-8 w-8 flex items-center justify-center text-white/40 hover:text-white"
                  >
                    {copiedId === 'cam-url' ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                  </button>
                </div>
              </div>

              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-3">
                <span className="text-[9px] font-black uppercase text-white/40">Watch Hub</span>
                <div className="flex gap-1 relative">
                  <Input readOnly value={viewerWatchUrl} className="bg-transparent border-white/10 text-[9px] font-mono h-8 pr-10" />
                  <button
                    onClick={() => handleCopy(viewerWatchUrl, 'watch-url')}
                    className="absolute right-0 top-0 h-8 w-8 flex items-center justify-center text-white/40 hover:text-white"
                  >
                    {copiedId === 'watch-url' ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                  </button>
                </div>
                <Button className="w-full h-9 bg-white/5 hover:bg-blue-600 rounded-xl gap-2 text-[9px] font-black uppercase tracking-widest transition-all" onClick={() => { if (navigator.share) navigator.share({ url: viewerWatchUrl }) }}>
                  <Share2 className="h-3.5 w-3.5" /> Share Stream
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">System Logs</h2>
              <ScrollArea className="h-48 border-t border-white/5 pt-4">
                <div className="space-y-3 opacity-30 font-mono text-[9px]">
                  <div className="flex gap-3"><Activity className="h-3 w-3 text-blue-500" /> <span>UPLINK_READY_SECURE</span></div>
                  <div className="flex gap-3"><Activity className="h-3 w-3 text-green-500" /> <span>SIGNAL_TX_STABLE_4.2M</span></div>
                  {cameras.map(c => <div key={c.id} className="flex gap-3 text-white"><Activity className="h-3 w-3" /> <span>LINKED::{c.name.toUpperCase()}</span></div>)}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
      </main>

      {/* CONFIG DIALOG */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="max-w-2xl bg-[#0F1115] border-white/5 rounded-3xl p-0 overflow-hidden text-white font-sans">
          <div className="p-8 border-b border-white/5">
            <DialogHeader>
              <DialogTitle className="text-xl font-black italic tracking-tighter uppercase font-display italic">Control Suite <span className="text-blue-500 italic">Settings</span></DialogTitle>
            </DialogHeader>
          </div>
          <ScrollArea className="max-h-[70vh]">
            <div className="p-8 space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500">Overlay Display</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-white/2 rounded-2xl border border-white/5">
                      <Label className="font-bold text-sm">Visual Scoreboard</Label>
                      <Switch checked={showScoreboard} onCheckedChange={setShowScoreboard} />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white/2 rounded-2xl border border-white/5">
                      <Label className="font-bold text-sm">Real-time Clock</Label>
                      <Switch checked={showClock} onCheckedChange={setShowClock} />
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500">Identity Profile</h3>
                  <div className="space-y-4">
                    <div className="space-y-1.5 px-1">
                      <Label className="text-[9px] font-black uppercase text-white/30 tracking-widest">Home Team</Label>
                      <Input value={homeTeam} onChange={e => setHomeTeam(e.target.value.toUpperCase())} className="bg-black/40 border-white/10 rounded-xl h-10 font-black italic" />
                    </div>
                    <div className="space-y-1.5 px-1">
                      <Label className="text-[9px] font-black uppercase text-white/30 tracking-widest">Away Team</Label>
                      <Input value={awayTeam} onChange={e => setAwayTeam(e.target.value.toUpperCase())} className="bg-black/40 border-white/10 rounded-xl h-10 font-black italic" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6 pt-4 border-t border-white/5">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500">Broadcast Assets</h3>
                <div className="grid grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <Label className="text-[9px] font-black uppercase text-white/30 block text-center">Home Logo</Label>
                    <label className="aspect-square bg-white/5 rounded-2xl border border-white/5 flex flex-col items-center justify-center relative overflow-hidden cursor-pointer hover:bg-white/10 transition-colors">
                      {homeLogo ? <img src={homeLogo} className="h-full w-full object-contain" /> : <Plus className="h-6 w-6 text-white/10" />}
                      <input type="file" className="hidden" accept="image/*" onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const r = new FileReader();
                          r.onload = () => setHomeLogo(r.result as string);
                          r.readAsDataURL(file);
                        }
                      }} />
                    </label>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[9px] font-black uppercase text-white/30 block text-center">Away Logo</Label>
                    <label className="aspect-square bg-white/5 rounded-2xl border border-white/5 flex flex-col items-center justify-center relative overflow-hidden cursor-pointer hover:bg-white/10 transition-colors">
                      {awayLogo ? <img src={awayLogo} className="h-full w-full object-contain" /> : <Plus className="h-6 w-6 text-white/10" />}
                      <input type="file" className="hidden" accept="image/*" onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const r = new FileReader();
                          r.onload = () => setAwayLogo(r.result as string);
                          r.readAsDataURL(file);
                        }
                      }} />
                    </label>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[9px] font-black uppercase text-white/30 block text-center">Match Cover</Label>
                    <label className="aspect-square bg-white/5 rounded-2xl border border-white/5 flex flex-col items-center justify-center relative overflow-hidden cursor-pointer hover:bg-white/10 transition-colors">
                      {matchThumbnail ? <img src={matchThumbnail} className="h-full w-full object-contain" /> : <ImageIcon className="h-6 w-6 text-white/10" />}
                      <input type="file" className="hidden" accept="image/*" onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const r = new FileReader();
                          r.onload = () => setMatchThumbnail(r.result as string);
                          r.readAsDataURL(file);
                        }
                      }} />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
          <div className="p-8 border-t border-white/5 bg-black/20 flex justify-end">
            <Button onClick={() => setSettingsOpen(false)} className="bg-blue-600 hover:bg-blue-700 h-12 px-8 rounded-xl font-black italic tracking-widest shadow-2xl">SAVE CHANGES</Button>
          </div>
        </DialogContent>
      </Dialog>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
        .shadow-3xl { box-shadow: 0 40px 80px -20px rgba(0,0,0,0.8); }
        .font-display { font-family: var(--font-display), 'Poppins', sans-serif; }
      `}</style>
    </div>
  );
}
