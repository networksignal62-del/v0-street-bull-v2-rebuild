"use client";

import React, { useState, useEffect, useRef } from "react";
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
  peer?: SimplePeer.Instance;
}

export default function BroadcasterControlPage() {
  const [streamId] = useState(() => generateStreamId());
  const [isLive, setIsLive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [activeCamera, setActiveCamera] = useState<string | null>(null);
  const [volume, setVolume] = useState([75]);
  const [cameras, setCameras] = useState<CameraFeed[]>([]);
  const [realViewerCount, setRealViewerCount] = useState(0);

  const socket = useRef(getSocket());
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});
  const mainVideoRef = useRef<HTMLVideoElement>(null);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const cameraJoinUrl = `${baseUrl}/camera/join?stream=${streamId}`;
  const viewerWatchUrl = `${baseUrl}/watch/${streamId}`;

  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  // Clock
  const [matchMinutes, setMatchMinutes] = useState(0);
  const [matchSeconds, setMatchSeconds] = useState(0);
  const [isClockRunning, setIsClockRunning] = useState(false);
  const [addedTime, setAddedTime] = useState(0);
  const clockInterval = useRef<NodeJS.Timeout | null>(null);

  // Score & Teams
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [homeTeam, setHomeTeam] = useState("Home Team");
  const [awayTeam, setAwayTeam] = useState("Away Team");
  const [homeLogo, setHomeLogo] = useState<string>("");
  const [awayLogo, setAwayLogo] = useState<string>("");
  const [matchThumbnail, setMatchThumbnail] = useState<string>("");

  // Highlights, Lineup, Stats
  const [highlights, setHighlights] = useState<{ id: string; type: string; team: string; player: string; time: string }[]>([]);
  const [lineup, setLineup] = useState({ home: "", away: "" });
  const [stats, setStats] = useState({ home: { shots: 0, possession: 50 }, away: { shots: 0, possession: 50 } });

  // Settings
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showScoreboard, setShowScoreboard] = useState(true);
  const [showClock, setShowClock] = useState(true);

  // Recording
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const formatTime = (mins: number, secs: number) => {
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    socket.current.emit('match:update', {
      streamCode: streamId,
      data: {
        isLive,
        homeScore,
        awayScore,
        matchTime: formatTime(matchMinutes, matchSeconds),
        homeTeam,
        awayTeam,
        homeLogo,
        awayLogo,
        matchThumbnail,
        addedTime,
        highlights,
        lineup,
        stats
      }
    });
  }, [isLive, homeScore, awayScore, matchMinutes, matchSeconds, homeTeam, awayTeam, homeLogo, awayLogo, matchThumbnail, streamId, addedTime, highlights, lineup, stats]);

  useEffect(() => {
    socket.current.emit('broadcaster:join', { streamCode: streamId });

    socket.current.on('broadcaster:cameras', ({ cameras: existingCameras }) => {
      setCameras(existingCameras.map((cam: any) => ({
        id: cam.cameraId, name: cam.name, operator: cam.operator, status: cam.status
      })));
      existingCameras.forEach((cam: any) => createPeerConnection(cam.cameraId));
    });

    socket.current.on('camera:new', ({ cameraId, name, operator }) => {
      setCameras(prev => [...prev.filter(c => c.id !== cameraId), { id: cameraId, name, operator, status: 'connecting' }]);
      createPeerConnection(cameraId);
    });

    socket.current.on('camera:status', ({ cameraId, status }) => {
      setCameras(prev => prev.map(cam => cam.id === cameraId ? { ...cam, status } : cam));
    });

    socket.current.on('camera:disconnected', ({ cameraId }) => {
      setCameras(prev => prev.filter(cam => cam.id !== cameraId));
    });

    socket.current.on('viewer:count', ({ streamCode: code, count }) => {
      if (code === streamId) {
        setRealViewerCount(count);
      }
    });

    return () => {
      socket.current.off('broadcaster:cameras');
      socket.current.off('camera:new');
      socket.current.off('camera:status');
      socket.current.off('camera:disconnected');
    };
  }, [streamId]);

  const createPeerConnection = (cameraId: string) => {
    const peer = new SimplePeer({ initiator: true, trickle: true, config: ICE_SERVERS });
    peer.on('signal', (signal) => socket.current.emit('webrtc:offer', { to: cameraId, offer: signal }));
    peer.on('stream', (stream) => {
      setCameras(prev => prev.map(cam => cam.id === cameraId ? { ...cam, stream, peer } : cam));
      if (videoRefs.current[cameraId]) videoRefs.current[cameraId]!.srcObject = stream;
    });
    peer.on('error', (err) => console.error('Peer error:', err));
  };

  useEffect(() => {
    if (activeCamera && mainVideoRef.current) {
      const cam = cameras.find(c => c.id === activeCamera);
      if (cam?.stream) mainVideoRef.current.srcObject = cam.stream;
    }
  }, [activeCamera, cameras]);

  const handleCameraSwitch = (cameraId: string) => {
    setActiveCamera(cameraId);
    socket.current.emit('broadcaster:set-active-camera', { cameraId, streamCode: streamId });
  };

  useEffect(() => {
    if (isClockRunning) {
      clockInterval.current = setInterval(() => {
        setMatchSeconds((prev) => {
          if (prev >= 59) {
            setMatchMinutes((m) => m + 1);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    } else if (clockInterval.current) {
      clearInterval(clockInterval.current);
    }
    return () => {
      if (clockInterval.current) clearInterval(clockInterval.current);
    };
  }, [isClockRunning]);

  const handleCopy = (text: string, item: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(item);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Street Bull Live Stream', text: `Watch ${homeTeam} vs ${awayTeam} live!`, url: viewerWatchUrl });
      } catch (err) { handleCopy(viewerWatchUrl, "share"); }
    } else { handleCopy(viewerWatchUrl, "share"); }
  };

  const handleStartRecording = () => {
    const cam = cameras.find(c => c.id === (activeCamera || ""));
    if (!cam?.stream) return;
    recordedChunksRef.current = [];
    const mediaRecorder = new MediaRecorder(cam.stream, { mimeType: 'video/webm' });
    mediaRecorder.ondataavailable = (e) => e.data.size > 0 && recordedChunksRef.current.push(e.data);
    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SB-RECORDING-${Date.now()}.webm`;
      a.click();
    };
    mediaRecorder.start();
    mediaRecorderRef.current = mediaRecorder;
    setIsRecording(true);
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>, team: 'home' | 'away') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (team === 'home') setHomeLogo(reader.result as string);
        else setAwayLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleThumbUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setMatchThumbnail(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const addHighlight = (type: string, team: string) => {
    const player = prompt("Enter player name:");
    if (player) {
      setHighlights(prev => [...prev, {
        id: Math.random().toString(36).substr(2, 9),
        type,
        team,
        player,
        time: formatTime(matchMinutes, matchSeconds)
      }]);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans">
      {/* Header */}
      <div className="border-b bg-white px-4 md:px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="bg-[#E63946] p-2 rounded-lg text-white">
            <Radio className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Studio Control</h1>
            <div className="flex items-center gap-2">
              <Badge className={isLive ? "bg-red-500 hover:bg-red-600 animate-pulse" : "bg-neutral-500"}>
                {isLive ? "LIVE BROADCAST" : "STREAMING OFFLINE"}
              </Badge>
              <span className="text-xs text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded">{streamId}</span>
            </div>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-6">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Users className="h-4 w-4 text-blue-500" />
            <span>{realViewerCount} Live Fans</span>
          </div>
          <Button variant="outline" className="gap-2" onClick={() => setSettingsOpen(true)}>
            <Settings className="h-4 w-4" /> Setup
          </Button>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row h-[calc(100vh-81px)]">
        {/* Main Content Area */}
        <div className="flex-1 p-4 md:p-6 overflow-auto bg-[#F0F2F5]">
          <div className="max-w-7xl mx-auto space-y-6">

            {/* Top Row: Video & Links */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Video Monitor */}
              <div className="lg:col-span-2 space-y-4">
                <Card className="overflow-hidden border-none bg-black relative aspect-video shadow-2xl rounded-2xl group">
                  <div className="absolute inset-0 flex items-center justify-center">
                    {activeCamera ? (
                      <video ref={mainVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center text-white/50">
                        <VideoOff className="h-16 w-16 mx-auto mb-4 opacity-20" />
                        <p className="text-lg font-medium">Select a camera feed to go live</p>
                      </div>
                    )}
                  </div>

                  {/* Broadcast Overlays */}
                  {showScoreboard && (
                    <div className="absolute top-4 left-4 z-10">
                      <div className="flex items-center gap-3 bg-black/80 backdrop-blur-md rounded-lg pl-3 pr-4 py-2 border border-white/20 shadow-2xl scale-90 origin-top-left">
                        <div className="flex items-center gap-2 pr-3 border-r border-white/20 font-bold text-white text-sm uppercase tracking-tighter">
                          {homeLogo && <img src={homeLogo} className="h-6 w-6 rounded-full object-cover" />}
                          {homeTeam}
                          <span className="text-xl ml-2 text-primary">{homeScore}</span>
                        </div>
                        <div className="flex items-center gap-2 font-bold text-white text-sm uppercase tracking-tighter">
                          <span className="text-xl mr-2 text-primary">{awayScore}</span>
                          {awayTeam}
                          {awayLogo && <img src={awayLogo} className="h-6 w-6 rounded-full object-cover" />}
                        </div>
                        {showClock && (
                          <div className="ml-4 pl-4 border-l border-white/20 font-mono text-white text-lg">
                            {formatTime(matchMinutes, matchSeconds)}
                            {addedTime > 0 && <span className="text-red-500 text-xs ml-1">+{addedTime}'</span>}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-3 bg-black/40 backdrop-blur rounded-full px-4 py-2">
                      <Button size="icon" variant="ghost" className="text-white hover:bg-white/20" onClick={() => setIsMuted(!isMuted)}>
                        {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                      </Button>
                      <div className="w-24"><Slider value={volume} onValueChange={setVolume} max={100} /></div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        variant={isRecording ? "destructive" : "secondary"}
                        className={`gap-2 rounded-full h-11 px-6 shadow-xl ${isRecording ? 'animate-pulse' : ''}`}
                        onClick={isRecording ? handleStopRecording : handleStartRecording}
                      >
                        <div className={`h-2.5 w-2.5 rounded-full ${isRecording ? 'bg-white' : 'bg-red-500'}`} />
                        {isRecording ? "Stop Recording" : "Record POV"}
                      </Button>
                      <Button
                        className={`h-11 px-8 rounded-full shadow-xl font-bold ${isLive ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}`}
                        onClick={() => setIsLive(!isLive)}
                      >
                        {isLive ? <StopCircle className="mr-2 h-5 w-5" /> : <Play className="mr-2 h-5 w-5" />}
                        {isLive ? "TERMINATE STREAM" : "START BROADCAST"}
                      </Button>
                    </div>
                  </div>
                </Card>

                {/* Camera Grid Under Video */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-500">Live Camera Feeds</h2>
                    <Badge variant="outline" className="bg-white">{cameras.length} Active</Badge>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {cameras.map(cam => (
                      <Card key={cam.id} className={`cursor-pointer overflow-hidden transition-all group ring-offset-4 ${activeCamera === cam.id ? 'ring-2 ring-blue-500' : 'hover:ring-2 hover:ring-neutral-300'}`} onClick={() => handleCameraSwitch(cam.id)}>
                        <div className="aspect-video bg-[#1A1A1A] relative">
                          <video ref={el => { videoRefs.current[cam.id] = el; }} autoPlay playsInline muted className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                            <Play className="text-white h-8 w-8" />
                          </div>
                          <div className="absolute top-2 left-2 flex items-center gap-2">
                            <div className="bg-black/60 text-[10px] px-2 py-1 text-white rounded font-bold uppercase">{cam.name}</div>
                          </div>
                        </div>
                      </Card>
                    ))}
                    {cameras.length === 0 && (
                      <div className="col-span-4 py-8 text-center bg-white rounded-xl border-2 border-dashed border-neutral-200">
                        <Camera className="h-8 w-8 mx-auto mb-2 text-neutral-300" />
                        <p className="text-sm text-neutral-400">Waiting for camera operators to join...</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Access & QR Section */}
              <div className="space-y-6">
                <Card className="shadow-lg border-none overflow-hidden rounded-2xl">
                  <CardHeader className="bg-blue-600 text-white pb-6">
                    <CardTitle className="text-lg flex items-center gap-2 tracking-tight"><LinkIcon className="h-5 w-5" /> Stream Access</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6 -mt-4 bg-white rounded-t-2xl">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Fan Watch Page</Label>
                        <div className="flex gap-2">
                          <Input readOnly value={viewerWatchUrl} className="text-xs bg-neutral-50 h-10 border-none font-medium text-blue-600" />
                          <Button size="icon" variant="outline" className="h-10 w-10 shrink-0" onClick={() => handleCopy(viewerWatchUrl, "watch")}><Copy className="h-4 w-4" /></Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Camera Unit Invite</Label>
                        <div className="flex gap-2">
                          <Input readOnly value={cameraJoinUrl} className="text-xs bg-neutral-50 h-10 border-none font-medium text-red-500" />
                          <Button size="icon" variant="outline" className="h-10 w-10 shrink-0" onClick={() => handleCopy(cameraJoinUrl, "camera")}><Copy className="h-4 w-4" /></Button>
                        </div>
                      </div>
                      <Button className="w-full h-11 bg-[#1A1A1A] hover:bg-[#333] gap-2 rounded-xl text-white font-bold" onClick={handleShare}><Share2 className="h-4 w-4" /> Share Stream Link</Button>
                    </div>

                    <div className="flex flex-col items-center gap-4 py-2 bg-neutral-50 rounded-2xl">
                      <div className="p-3 bg-white rounded-xl shadow-sm">
                        <QRCodeSVG value={cameraJoinUrl} size={160} includeMargin level="H" />
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-bold text-neutral-600 uppercase">Camera QR Code</p>
                        <p className="text-[10px] text-neutral-400 mt-1">Scan with any mobile device to start filming</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-lg border-none rounded-2xl p-6 bg-white space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold flex items-center gap-2"><ImageIcon className="h-4 w-4 text-purple-500" /> Broadcast Assets</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl">
                      <div className="h-10 w-10 rounded-lg bg-white shadow-sm flex items-center justify-center overflow-hidden">
                        {matchThumbnail ? <img src={matchThumbnail} className="h-full w-full object-cover" /> : <ImageIcon className="text-neutral-300" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] uppercase font-bold text-neutral-400">Match Thumbnail</p>
                        <input type="file" className="hidden" id="thumb-up" onChange={handleThumbUpload} accept="image/*" />
                        <Label htmlFor="thumb-up" className="text-xs font-bold text-blue-600 hover:underline cursor-pointer">Update Image</Label>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-neutral-50 rounded-xl space-y-2">
                        <div className="h-12 w-full rounded bg-white flex items-center justify-center overflow-hidden">
                          {homeLogo ? <img src={homeLogo} className="h-full w-full object-contain" /> : <p className="text-[10px] text-neutral-300">Home Logo</p>}
                        </div>
                        <input type="file" className="hidden" id="home-up" onChange={(e) => handleLogoUpload(e, 'home')} accept="image/*" />
                        <Label htmlFor="home-up" className="block text-[10px] text-center font-bold text-blue-600 cursor-pointer">UPLOAD</Label>
                      </div>
                      <div className="p-3 bg-neutral-50 rounded-xl space-y-2">
                        <div className="h-12 w-full rounded bg-white flex items-center justify-center overflow-hidden">
                          {awayLogo ? <img src={awayLogo} className="h-full w-full object-contain" /> : <p className="text-[10px] text-neutral-300">Away Logo</p>}
                        </div>
                        <input type="file" className="hidden" id="away-up" onChange={(e) => handleLogoUpload(e, 'away')} accept="image/*" />
                        <Label htmlFor="away-up" className="block text-[10px] text-center font-bold text-blue-600 cursor-pointer">UPLOAD</Label>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* Bottom Row: Match Operations */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Score & Time Controls */}
              <Card className="shadow-lg border-none rounded-2xl">
                <CardHeader className="border-b pb-4">
                  <CardTitle className="text-base flex items-center gap-2 tracking-tight"><Timer className="text-red-500 h-5 w-5" /> Match Clock & Score</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="flex items-center justify-around gap-4">
                    <div className="text-center space-y-2">
                      <p className="text-[10px] font-bold text-neutral-400 uppercase">{homeTeam}</p>
                      <div className="flex items-center gap-2">
                        <Button size="icon" variant="outline" className="rounded-xl h-10 w-10" onClick={() => setHomeScore(Math.max(0, homeScore - 1))}>-</Button>
                        <span className="text-4xl font-black tabular-nums">{homeScore}</span>
                        <Button size="icon" variant="outline" className="rounded-xl h-10 w-10" onClick={() => setHomeScore(homeScore + 1)}>+</Button>
                      </div>
                    </div>
                    <div className="h-12 w-px bg-neutral-100" />
                    <div className="text-center space-y-2">
                      <p className="text-[10px] font-bold text-neutral-400 uppercase">{awayTeam}</p>
                      <div className="flex items-center gap-2">
                        <Button size="icon" variant="outline" className="rounded-xl h-10 w-10" onClick={() => setAwayScore(Math.max(0, awayScore - 1))}>-</Button>
                        <span className="text-4xl font-black tabular-nums">{awayScore}</span>
                        <Button size="icon" variant="outline" className="rounded-xl h-10 w-10" onClick={() => setAwayScore(awayScore + 1)}>+</Button>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-neutral-50 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-mono font-bold tracking-tighter tabular-nums">
                        {formatTime(matchMinutes, matchSeconds)}
                        <span className="text-red-500 text-sm align-top ml-1">+{addedTime}'</span>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant={isClockRunning ? "outline" : "default"} className="rounded-lg px-4" onClick={() => setIsClockRunning(!isClockRunning)}>
                          {isClockRunning ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                          {isClockRunning ? "Pause" : "Resume"}
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => { setMatchMinutes(0); setMatchSeconds(0); }}><RotateCcw className="h-4 w-4 text-neutral-400" /></Button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {[1, 2, 3, 4, 5].map(m => (
                        <Button key={m} size="sm" variant={addedTime === m ? "default" : "outline"} className="text-[10px] h-7 px-3 rounded-md" onClick={() => setAddedTime(m)}>+{m} min</Button>
                      ))}
                      <Button size="sm" variant="ghost" className="text-[10px] h-7" onClick={() => setAddedTime(0)}>Clear</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Highlights / Events Log */}
              <Card className="shadow-lg border-none rounded-2xl flex flex-col h-full">
                <CardHeader className="border-b pb-4 shrink-0">
                  <CardTitle className="text-base flex items-center gap-2 tracking-tight"><Trophy className="text-yellow-500 h-5 w-5" /> Live Highlights</CardTitle>
                </CardHeader>
                <div className="flex-1 min-h-0 flex flex-col">
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-3">
                      {highlights.map((h) => (
                        <div key={h.id} className="flex items-center gap-3 p-3 bg-white border border-neutral-100 rounded-xl shadow-sm text-sm">
                          <div className="bg-green-100 p-2 rounded-lg text-green-700 font-bold text-[10px]">{h.time}'</div>
                          <div className="flex-1">
                            <p className="font-bold flex items-center gap-2">{h.type.toUpperCase()}: {h.player}</p>
                            <p className="text-[10px] text-neutral-400 uppercase font-medium">{h.team}</p>
                          </div>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-red-300 hover:text-red-500" onClick={() => setHighlights(prev => prev.filter(x => x.id !== h.id))}><History className="h-4 w-4" /></Button>
                        </div>
                      ))}
                      {highlights.length === 0 && (
                        <div className="h-32 flex flex-col items-center justify-center text-neutral-300">
                          <History className="h-8 w-8 mb-2 opacity-50" />
                          <p className="text-xs">No match events logged yet</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                  <div className="p-4 border-t bg-neutral-50 flex gap-2 rounded-b-2xl">
                    <Button className="flex-1 bg-[#1A1A1A] text-white hover:bg-[#333] text-xs h-9 rounded-lg" onClick={() => addHighlight('Goal', homeTeam)}>HOME GOAL</Button>
                    <Button className="flex-1 bg-[#1A1A1A] text-white hover:bg-[#333] text-xs h-9 rounded-lg" onClick={() => addHighlight('Goal', awayTeam)}>AWAY GOAL</Button>
                  </div>
                </div>
              </Card>

              {/* Lineup & Stats Management */}
              <Card className="shadow-lg border-none rounded-2xl">
                <CardHeader className="border-b pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2 tracking-tight"><BarChart3 className="text-blue-500 h-5 w-5" /> Analytics & Lineup</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <Tabs defaultValue="stats" className="w-full">
                    <TabsList className="w-full h-12 rounded-none bg-transparent border-b grid grid-cols-2">
                      <TabsTrigger value="stats" className="text-xs data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-500">Match Stats</TabsTrigger>
                      <TabsTrigger value="lineup" className="text-xs data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-500">Lineups</TabsTrigger>
                    </TabsList>
                    <ScrollArea className="h-64">
                      <TabsContent value="stats" className="p-6 space-y-6 m-0">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between text-[11px] font-bold uppercase text-neutral-400 mb-1">
                            <span>Shots: {stats.home.shots}</span>
                            <span className="text-neutral-900">Total Shots</span>
                            <span>Shots: {stats.away.shots}</span>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="flex-1 h-8 rounded-lg" onClick={() => setStats(s => ({ ...s, home: { ...s.home, shots: Math.max(0, s.home.shots + 1) } }))}>+1 Home</Button>
                            <Button size="sm" variant="outline" className="flex-1 h-8 rounded-lg" onClick={() => setStats(s => ({ ...s, away: { ...s.away, shots: Math.max(0, s.away.shots + 1) } }))}>+1 Away</Button>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between text-[11px] font-bold uppercase text-neutral-400 mb-1">
                            <span>{stats.home.possession}%</span>
                            <span className="text-neutral-900">Possession</span>
                            <span>{stats.away.possession}%</span>
                          </div>
                          <Slider
                            value={[stats.home.possession]}
                            max={100}
                            step={1}
                            onValueChange={(v) => setStats(s => ({ ...s, home: { ...s.home, possession: v[0] }, away: { ...s.away, possession: 100 - v[0] } }))}
                            className="[&_.relative]:h-2"
                          />
                        </div>
                      </TabsContent>
                      <TabsContent value="lineup" className="p-6 space-y-4 m-0">
                        <div className="space-y-2">
                          <Label className="text-[10px] uppercase font-bold text-neutral-400">Home Formation / Squad</Label>
                          <textarea
                            value={lineup.home}
                            onChange={e => setLineup(l => ({ ...l, home: e.target.value }))}
                            placeholder="Enter Home Details..."
                            className="w-full p-3 rounded-xl bg-neutral-50 border-none text-xs h-20 focus:ring-1 ring-blue-500 resize-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] uppercase font-bold text-neutral-400">Away Formation / Squad</Label>
                          <textarea
                            value={lineup.away}
                            onChange={e => setLineup(l => ({ ...l, away: e.target.value }))}
                            placeholder="Enter Away Details..."
                            className="w-full p-3 rounded-xl bg-neutral-50 border-none text-xs h-20 focus:ring-1 ring-blue-500 resize-none"
                          />
                        </div>
                      </TabsContent>
                    </ScrollArea>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Global Settings Dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="max-w-2xl bg-white border-none rounded-3xl shadow-3xl p-0 overflow-hidden">
          <DialogHeader className="p-8 bg-neutral-900 text-white">
            <DialogTitle className="text-2xl font-bold tracking-tight">Broadcast Control Hub</DialogTitle>
          </DialogHeader>
          <div className="p-8 space-y-8">
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-6">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">Overlay Display</h3>
                <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-2xl hover:bg-neutral-100 transition-colors">
                  <Label className="font-bold">Main Scoreboard</Label>
                  <Switch checked={showScoreboard} onCheckedChange={setShowScoreboard} />
                </div>
                <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-2xl hover:bg-neutral-100 transition-colors">
                  <Label className="font-bold">Match Timer</Label>
                  <Switch checked={showClock} onCheckedChange={setShowClock} />
                </div>
              </div>
              <div className="space-y-6">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">Team Identity</h3>
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase font-bold text-neutral-400 ml-1">Home Team</Label>
                  <Input value={homeTeam} onChange={e => setHomeTeam(e.target.value)} className="rounded-xl h-12 border-neutral-200 font-bold" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase font-bold text-neutral-400 ml-1">Away Team</Label>
                  <Input value={awayTeam} onChange={e => setAwayTeam(e.target.value)} className="rounded-xl h-12 border-neutral-200 font-bold" />
                </div>
              </div>
            </div>
          </div>
          <div className="p-6 bg-neutral-50 border-t flex justify-end">
            <Button onClick={() => setSettingsOpen(false)} className="bg-blue-600 hover:bg-blue-700 px-8 rounded-xl font-bold">SAVE CONFIGURATION</Button>
          </div>
        </DialogContent>
      </Dialog>

      <style jsx global>{`
        button + .sr-only + span[role="slider"] {
          background: #3B82F6 !important;
        }
        .shadow-3xl {
            box-shadow: 0 35px 60px -15px rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </div>
  );
}
