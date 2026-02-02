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
  Video,
  VideoOff,
  Radio,
  Settings,
  MessageSquare,
  Users,
  Signal,
  Maximize2,
  Volume2,
  Copy,
  Plus,
  Minus,
  Share2,
  Timer,
  RotateCcw,
  Play,
  Pause,
  StopCircle,
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

const mockChat = [
  { id: "1", user: "Antigravity", message: "Broadcaster view initialized.", time: "System" },
];

export default function BroadcasterControlPage() {
  const [streamId] = useState(() => generateStreamId());
  const [isLive, setIsLive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [activeCamera, setActiveCamera] = useState<string | null>(null);
  const [volume, setVolume] = useState([75]);
  const [cameras, setCameras] = useState<CameraFeed[]>([]);
  const [messages, setMessages] = useState<any[]>(mockChat);
  const [chatMessage, setChatMessage] = useState("");

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

  // Score
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [homeTeam, setHomeTeam] = useState("FC Freetown");
  const [awayTeam, setAwayTeam] = useState("Bo Rangers");

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
      data: { isLive, homeScore, awayScore, matchTime: formatTime(matchMinutes, matchSeconds), homeTeam, awayTeam, addedTime }
    });
  }, [isLive, homeScore, awayScore, matchMinutes, matchSeconds, homeTeam, awayTeam, streamId, addedTime]);

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

    socket.current.on('chat:message', (msg) => {
      setMessages(prev => [...prev.slice(-49), msg]);
    });

    return () => {
      socket.current.off('broadcaster:cameras');
      socket.current.off('camera:new');
      socket.current.off('camera:status');
      socket.current.off('camera:disconnected');
      socket.current.off('chat:message');
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

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;
    socket.current.emit('chat:message', { streamCode: streamId, username: 'Broadcaster', message: chatMessage, badge: 'admin' });
    setChatMessage("");
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Street Bull Live Stream', text: `Watch ${homeTeam} vs ${awayTeam} live!`, url: viewerWatchUrl });
      } catch (err) { handleCopy(viewerWatchUrl, "share"); }
    } else { handleCopy(viewerWatchUrl, "share"); }
  };

  // Recording Implementation
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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="border-b bg-card px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold">Broadcast Control</h1>
          <Badge className={isLive ? "bg-red-500 animate-pulse" : "bg-neutral-500"}>
            <Radio className="h-3 w-3 mr-1" /> {isLive ? "LIVE" : "OFFLINE"}
          </Badge>
          <Badge variant="outline" className="font-mono">{streamId}</Badge>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" /> <span>{cameras.length * 15 + 120} viewers</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => setSettingsOpen(true)}>
            <Settings className="h-4 w-4 mr-2" /> Settings
          </Button>
        </div>
      </div>

      <div className="flex h-[calc(100vh-65px)]">
        <div className="flex-1 p-4 overflow-auto space-y-4">
          <Card className="overflow-hidden border-none bg-black relative aspect-video">
            <div className="absolute inset-0 flex items-center justify-center">
              {activeCamera ? (
                <video ref={mainVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              ) : (
                <div className="text-center text-white/50">
                  <VideoOff className="h-16 w-16 mx-auto mb-4" />
                  <p>No Camera Selected</p>
                </div>
              )}
            </div>

            {showScoreboard && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 w-full flex justify-center px-4">
                <div className="flex items-center gap-4 bg-black/60 backdrop-blur rounded-lg px-6 py-2 border border-white/10 shadow-2xl">
                  <div className="font-bold text-white uppercase tracking-tight">{homeTeam}</div>
                  <div className="text-2xl font-black text-white px-2 bg-primary/20 rounded">{homeScore} - {awayScore}</div>
                  <div className="font-bold text-white uppercase tracking-tight">{awayTeam}</div>
                  {showClock && (
                    <div className="border-l border-white/20 pl-4 font-mono text-white text-xl">
                      {formatTime(matchMinutes, matchSeconds)}
                      {addedTime > 0 && <span className="text-red-500 ml-1">+{addedTime}</span>}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button size="icon" variant="ghost" className="text-white hover:bg-white/20" onClick={() => setIsMuted(!isMuted)}>
                  {isMuted ? <MicOff /> : <Mic />}
                </Button>
                <div className="w-24"><Slider value={volume} onValueChange={setVolume} max={100} /></div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={isRecording ? "destructive" : "outline"}
                  className={`gap-2 ${isRecording ? 'animate-pulse' : 'bg-transparent text-white border-white/20 hover:bg-white/10'}`}
                  onClick={isRecording ? handleStopRecording : handleStartRecording}
                >
                  <div className={`h-2 w-2 rounded-full ${isRecording ? 'bg-white' : 'bg-red-500'}`} />
                  {isRecording ? "Stop" : "Rec"}
                </Button>
                <Button className={isLive ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"} onClick={() => setIsLive(!isLive)}>
                  {isLive ? <StopCircle className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                  {isLive ? "End Stream" : "Go Live"}
                </Button>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold flex items-center gap-2"><Timer /> Match Control</h2>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => setIsClockRunning(!isClockRunning)}>{isClockRunning ? "Pause" : "Start"} Clock</Button>
                <Button size="sm" variant="ghost" onClick={() => { setMatchMinutes(0); setMatchSeconds(0); }}>Reset</Button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <Label>Live Score</Label>
                <div className="flex items-center justify-around bg-muted/50 p-4 rounded-xl">
                  <div className="text-center">
                    <p className="text-xs uppercase text-muted-foreground mb-2">{homeTeam}</p>
                    <div className="flex items-center gap-2">
                      <Button size="icon" variant="outline" onClick={() => setHomeScore(Math.max(0, homeScore - 1))}>-</Button>
                      <span className="text-3xl font-black">{homeScore}</span>
                      <Button size="icon" variant="outline" onClick={() => setHomeScore(homeScore + 1)}>+</Button>
                    </div>
                  </div>
                  <div className="h-10 w-px bg-border" />
                  <div className="text-center">
                    <p className="text-xs uppercase text-muted-foreground mb-2">{awayTeam}</p>
                    <div className="flex items-center gap-2">
                      <Button size="icon" variant="outline" onClick={() => setAwayScore(Math.max(0, awayScore - 1))}>-</Button>
                      <span className="text-3xl font-black">{awayScore}</span>
                      <Button size="icon" variant="outline" onClick={() => setAwayScore(awayScore + 1)}>+</Button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <Label>Added Injury Time</Label>
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5].map(m => (
                    <Button key={m} size="sm" variant={addedTime === m ? "default" : "outline"} onClick={() => setAddedTime(m)}>+{m}m</Button>
                  ))}
                  <Button size="sm" variant="ghost" onClick={() => setAddedTime(0)}>Clear</Button>
                </div>
              </div>
            </div>
          </Card>

          <div className="space-y-2">
            <h2 className="font-bold flex items-center gap-2"><Camera /> Multiview / Camera Grid</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {cameras.map(cam => (
                <Card key={cam.id} className={`cursor-pointer overflow-hidden transition-all ${activeCamera === cam.id ? 'ring-2 ring-primary bg-primary/5' : ''}`} onClick={() => handleCameraSwitch(cam.id)}>
                  <div className="aspect-video bg-muted relative">
                    <video ref={el => { videoRefs.current[cam.id] = el; }} autoPlay playsInline muted className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-transparent flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/40">
                      <Play className="text-white h-8 w-8" />
                    </div>
                    <div className="absolute top-1 left-1 bg-black/50 text-[10px] px-1.5 py-0.5 text-white rounded font-medium">{cam.name}</div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        <div className="w-80 border-l bg-card flex flex-col">
          <Tabs defaultValue="chat" className="flex-1 flex flex-col">
            <TabsList className="w-full rounded-none border-b h-12">
              <TabsTrigger value="chat" className="flex-1">Chat</TabsTrigger>
              <TabsTrigger value="links" className="flex-1">Links</TabsTrigger>
            </TabsList>
            <TabsContent value="chat" className="flex-1 flex flex-col p-0 m-0 overflow-hidden">
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-3">
                  {messages.map((m, i) => (
                    <div key={i} className="text-sm border-l-2 border-primary/20 pl-2 py-1">
                      <span className="font-bold text-primary mr-2">{m.user}:</span>
                      <span className="text-muted-foreground">{m.message}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="p-4 border-t flex gap-2">
                <Input value={chatMessage} onChange={e => setChatMessage(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMessage()} placeholder="Type message..." className="bg-transparent" />
                <Button size="icon" onClick={handleSendMessage}><MessageSquare className="h-4 w-4" /></Button>
              </div>
            </TabsContent>
            <TabsContent value="links" className="p-4 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs uppercase text-muted-foreground">Viewer Link</Label>
                  <div className="flex gap-2">
                    <Input readOnly value={viewerWatchUrl} className="text-xs bg-muted border-none" />
                    <Button size="icon" variant="outline" onClick={() => handleCopy(viewerWatchUrl, "watch")}><Copy className="h-4 w-4" /></Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase text-muted-foreground">Camera Link</Label>
                  <div className="flex gap-2">
                    <Input readOnly value={cameraJoinUrl} className="text-xs bg-muted border-none" />
                    <Button size="icon" variant="outline" onClick={() => handleCopy(cameraJoinUrl, "camera")}><Copy className="h-4 w-4" /></Button>
                  </div>
                </div>
                <Button className="w-full gap-2" variant="secondary" onClick={handleShare}><Share2 className="h-4 w-4" /> Share Stream</Button>
              </div>
              <div className="flex flex-col items-center gap-2 pt-4">
                <QRCodeSVG value={viewerWatchUrl} size={140} includeMargin level="H" />
                <p className="text-[10px] text-muted-foreground text-center">Scan to watch live on mobile</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle>Overlay & Stream Settings</DialogTitle></DialogHeader>
          <div className="space-y-6 py-4">
            <div className="flex items-center justify-between">
              <Label>Show Scoreboard</Label>
              <Switch checked={showScoreboard} onCheckedChange={setShowScoreboard} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Show Match Clock</Label>
              <Switch checked={showClock} onCheckedChange={setShowClock} />
            </div>
            <div className="space-y-2">
              <Label>Home Team Name</Label>
              <Input value={homeTeam} onChange={e => setHomeTeam(e.target.value)} className="bg-transparent" />
            </div>
            <div className="space-y-2">
              <Label>Away Team Name</Label>
              <Input value={awayTeam} onChange={e => setAwayTeam(e.target.value)} className="bg-transparent" />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
