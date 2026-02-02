"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import SimplePeer from "simple-peer";
import { getSocket } from "@/lib/socket";
import { ICE_SERVERS } from "@/lib/webrtc";
import {
  Camera,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Radio,
  Battery,
  Settings,
  XCircle,
  Loader2,
  SwitchCamera,
  ZoomIn,
  ZoomOut,
  Zap,
  Wifi,
  MoreVertical,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function CameraJoinPage() {
  const searchParams = useSearchParams();
  const streamCodeFromUrl = searchParams ? searchParams.get("stream") || "" : "";

  const [connectionStatus, setConnectionStatus] = useState<"disconnected" | "connecting" | "live">("disconnected");
  const [streamCode, setStreamCode] = useState(streamCodeFromUrl);
  const [cameraName, setCameraName] = useState("");
  const [operatorName, setOperatorName] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [zoom, setZoom] = useState([1]);
  const [quality, setQuality] = useState("720p");
  const [batteryLevel, setBatteryLevel] = useState(100);
  const [facingMode, setFacingMode] = useState<"environment">("environment"); // Stick to back camera usually
  const [showSettings, setShowSettings] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const socket = useRef(getSocket());
  const peersRef = useRef<Map<string, SimplePeer.Instance>>(new Map());

  // Battery monitoring
  useEffect(() => {
    if ("getBattery" in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setBatteryLevel(Math.round(battery.level * 100));
        battery.onlevelchange = () => setBatteryLevel(Math.round(battery.level * 100));
      });
    }
  }, []);

  const startCamera = useCallback(async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: "environment" },
          width: quality === "1080p" ? { ideal: 1920 } : { ideal: 1280 },
          height: quality === "1080p" ? { ideal: 1080 } : { ideal: 720 },
          frameRate: { ideal: 30 }
        },
        audio: true
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(e => console.error("Video play error:", e));
      }
      return stream;
    } catch (err) {
      console.error("Camera access error:", err);
      return null;
    }
  }, [quality]);

  const handleJoin = async () => {
    if (!streamCode || !cameraName) return;
    setConnectionStatus("connecting");

    const stream = await startCamera();
    if (!stream) {
      alert("Failed to access camera. Please check permissions.");
      setConnectionStatus("disconnected");
      return;
    }

    const s = socket.current;
    s.emit('camera:join', { streamCode, cameraName, operatorName });

    s.on('camera:joined', ({ cameraId }) => {
      setConnectionStatus("live");
      s.emit('camera:ready', { cameraId });
    });

    s.on('webrtc:offer', ({ from, offer }) => {
      if (!streamRef.current) return;

      const peer = new SimplePeer({
        initiator: false,
        trickle: true,
        stream: streamRef.current,
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

      peer.on('close', () => peersRef.current.delete(from));
      peer.on('error', () => peersRef.current.delete(from));

      peer.signal(offer);
    });

    s.on('webrtc:ice-candidate', ({ from, candidate }) => {
      const peer = peersRef.current.get(from);
      if (peer) peer.signal(candidate);
    });
  };

  const handleManualSwitch = () => {
    // Re-trigger camera start if blank
    startCamera();
  };

  if (connectionStatus === "disconnected") {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 text-white font-display">
        <Card className="w-full max-w-sm bg-[#0F1115] border-white/5 shadow-3xl rounded-[2.5rem] overflow-hidden">
          <div className="p-10 text-center bg-gradient-to-br from-blue-600/20 to-transparent">
            <div className="h-14 w-14 rounded-2xl bg-blue-600 flex items-center justify-center mx-auto mb-6 shadow-xl">
              <Camera className="h-7 w-7 text-white" />
            </div>
            <h2 className="text-2xl font-black italic tracking-tighter uppercase">DEPLOY <span className="text-blue-500">UNIT</span></h2>
            <p className="text-[10px] text-white/30 font-bold tracking-widest uppercase mt-2 font-sans">Mobile Transmission Node</p>
          </div>
          <CardContent className="p-8 space-y-6">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-[9px] font-black uppercase text-white/40 tracking-widest ml-1">Stream Code</Label>
                <Input value={streamCode} onChange={e => setStreamCode(e.target.value.toUpperCase())} className="bg-black/40 border-white/5 rounded-xl h-12 font-black italic" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[9px] font-black uppercase text-white/40 tracking-widest ml-1">Assigned Position</Label>
                <Select value={cameraName} onValueChange={setCameraName}>
                  <SelectTrigger className="bg-black/40 border-white/5 rounded-xl h-12">
                    <SelectValue placeholder="POSITION SELECT" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0F1115] border-white/10 text-white">
                    <SelectItem value="NORTH">NORTH GOAL</SelectItem>
                    <SelectItem value="SOUTH">SOUTH GOAL</SelectItem>
                    <SelectItem value="CENTER">CENTER FIELD</SelectItem>
                    <SelectItem value="MOBILE">MOBILE UNIT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button className="w-full h-14 bg-blue-600 hover:bg-blue-700 rounded-2xl font-black italic tracking-widest transition-all" onClick={handleJoin}>START UPLINK</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (connectionStatus === "connecting") {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white gap-4 font-display">
        <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em]">INITIATING SIGNAL...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col text-white font-sans overflow-hidden">
      {/* HUD TOP */}
      <div className="h-14 px-4 flex items-center justify-between bg-black/80 backdrop-blur-md border-b border-white/10 z-50">
        <div className="flex items-center gap-3">
          <Badge className="bg-red-600 animate-pulse text-[9px] font-black tracking-widest italic rounded">LIVE_TRANS</Badge>
          <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{cameraName}</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Battery className={`h-4 w-4 ${batteryLevel < 20 ? 'text-red-500' : 'text-green-500'}`} />
            <span className="text-[10px] font-bold tabular-nums">{batteryLevel}%</span>
          </div>
          <button onClick={() => setShowSettings(true)} className="text-white/40"><Settings className="h-4 w-4" /></button>
        </div>
      </div>

      <div className="flex-1 relative bg-black">
        <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover" />

        {/* VIEW UI */}
        <div className="absolute inset-6 border border-white/5 pointer-events-none">
          <div className="absolute top-0 left-0 w-6 h-6 border-t border-l border-white/20" />
          <div className="absolute top-0 right-0 w-6 h-6 border-t border-r border-white/20" />
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b border-l border-white/20" />
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b border-r border-white/20" />
        </div>

        <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-4">
          <Button size="icon" variant="ghost" className="h-12 w-12 bg-black/50 border border-white/10 rounded-2xl" onClick={handleManualSwitch}><SwitchCamera className="h-5 w-5" /></Button>
        </div>
      </div>

      {/* CONTROLS */}
      <div className="h-24 bg-black border-t border-white/10 px-8 flex items-center justify-between">
        <Button variant="ghost" size="icon" className={`h-12 w-12 rounded-xl border ${isMuted ? 'bg-red-600/20 border-red-500 text-red-500' : 'bg-white/5 border-white/10'}`} onClick={() => setIsMuted(!isMuted)}>
          {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </Button>

        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-red-600 animate-pulse" />
            <span className="text-[10px] font-black italic tracking-widest">TRANSMITTING</span>
          </div>
          <span className="text-[8px] font-bold text-white/20 uppercase tracking-[0.3em] font-sans">UPLINK_STABLE</span>
        </div>

        <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl bg-white/5 border border-white/10" onClick={() => window.location.reload()}>
          <XCircle className="h-5 w-5 text-white/20" />
        </Button>
      </div>

      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="bg-[#0F1115] border-white/5 p-8 max-w-xs rounded-3xl font-display">
          <DialogHeader><DialogTitle className="text-white font-black italic uppercase italic">UNIT_SETUP</DialogTitle></DialogHeader>
          <div className="space-y-6 pt-4">
            <div className="space-y-2">
              <Label className="text-[9px] font-black uppercase text-white/30 ml-1">Video Resolution</Label>
              <Select value={quality} onValueChange={v => { setQuality(v); setTimeout(() => startCamera(), 100); }}>
                <SelectTrigger className="bg-black/40 border-white/10 rounded-xl h-11 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0F1115] border-white/10 text-white">
                  <SelectItem value="720p">720P BALANCED</SelectItem>
                  <SelectItem value="1080p">1080P PRO</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full h-11 bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10" onClick={() => setShowSettings(false)}>CONFIRM</Button>
          </div>
        </DialogContent>
      </Dialog>
      <style jsx global>{`
        .font-display { font-family: var(--font-display), 'Poppins', sans-serif; }
      `}</style>
    </div>
  );
}
