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
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
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
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          ...(quality === "1080p" ? { width: { ideal: 1920 } } : { width: { ideal: 1280 } })
        },
        audio: true
      });

      streamRef.current = stream;
      stream.getAudioTracks().forEach(t => t.enabled = !isMuted);
      stream.getVideoTracks().forEach(t => t.enabled = isVideoOn);

      if (videoRef.current) videoRef.current.srcObject = stream;
      return stream;
    } catch (err) {
      console.error("Camera error:", err);
      alert("Please allow camera access to join.");
      return null;
    }
  }, [facingMode, quality, isMuted, isVideoOn]);

  const handleJoin = async () => {
    if (!streamCode || !cameraName) return;
    setConnectionStatus("connecting");

    const stream = await startCamera();
    if (!stream) {
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
      console.log("[Camera] Offer from:", from);
      if (!streamRef.current) return;

      const peer = new SimplePeer({ initiator: false, trickle: true, stream: streamRef.current, config: ICE_SERVERS });
      peersRef.current.set(from, peer);

      peer.on('signal', (signal) => {
        const type = signal.type === 'answer' ? 'webrtc:answer' : 'webrtc:ice-candidate';
        s.emit(type, { to: from, [signal.type === 'answer' ? 'answer' : 'candidate']: signal });
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

  const switchCamera = () => {
    setFacingMode(prev => prev === "user" ? "environment" : "user");
    setTimeout(() => startCamera(), 100);
  };

  if (connectionStatus === "disconnected") {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 text-white">
        <Card className="w-full max-w-sm bg-[#0F1115] border-white/5 shadow-3xl rounded-[2rem] overflow-hidden">
          <CardHeader className="text-center p-8 bg-gradient-to-br from-blue-600/20 to-transparent">
            <div className="h-16 w-16 rounded-2xl bg-blue-600 flex items-center justify-center mx-auto mb-6 shadow-2xl">
              <Camera className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-black italic tracking-tighter uppercase">INITIATE <span className="text-blue-500">UNIT</span></CardTitle>
            <CardDescription className="text-white/40 font-bold text-[10px] uppercase tracking-widest mt-2">Connect mobile camera to production hub</CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="space-y-4">
              <div className="space-y-1.5 px-1">
                <Label className="text-[10px] font-black uppercase text-white/30 tracking-widest">Target Flux Code</Label>
                <Input value={streamCode} onChange={e => setStreamCode(e.target.value.toUpperCase())} className="bg-black/40 border-white/10 rounded-xl h-12 font-black italic tracking-tighter" placeholder="E.G. SB-ALPHA-9" />
              </div>
              <div className="space-y-1.5 px-1">
                <Label className="text-[10px] font-black uppercase text-white/30 tracking-widest">Operator Signature</Label>
                <Input value={operatorName} onChange={e => setOperatorName(e.target.value)} className="bg-black/40 border-white/10 rounded-xl h-12 font-bold" placeholder="your name" />
              </div>
              <div className="space-y-1.5 px-1">
                <Label className="text-[10px] font-black uppercase text-white/30 tracking-widest">Deployment Point</Label>
                <Select value={cameraName} onValueChange={setCameraName}>
                  <SelectTrigger className="bg-black/40 border-white/10 rounded-xl h-12 text-white/60">
                    <SelectValue placeholder="SELECT POSITION" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0F1115] border-white/10 text-white">
                    <SelectItem value="GOAL A">NORTH GOAL</SelectItem>
                    <SelectItem value="GOAL B">SOUTH GOAL</SelectItem>
                    <SelectItem value="SIDELINE">SIDELINE UNIT</SelectItem>
                    <SelectItem value="MOBILE">MOBILE TRACKER</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button className="w-full h-14 bg-blue-600 hover:bg-blue-700 rounded-2xl font-black italic tracking-widest shadow-2xl transition-all" onClick={handleJoin}>START TRANSMISSION</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (connectionStatus === "connecting") {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white gap-6">
        <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.5em] animate-pulse">Establishing Secure Uplink...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col text-white font-sans overflow-hidden">
      {/* HUD Header */}
      <div className="h-14 px-4 flex items-center justify-between bg-black/80 backdrop-blur-xl border-b border-white/10 z-50">
        <div className="flex items-center gap-3">
          <Badge className="bg-red-600 animate-pulse text-[8px] font-black tracking-widest px-1.5 py-0.5 rounded italic">LIVE_FEED</Badge>
          <span className="text-[10px] font-black uppercase tracking-widest text-white/60">{cameraName}</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Battery className={`h-4 w-4 ${batteryLevel < 20 ? 'text-red-550' : 'text-green-500'}`} />
            <span className="text-[10px] font-bold tabular-nums">{batteryLevel}%</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setShowSettings(true)} className="text-white/40"><Settings className="h-4 w-4" /></Button>
        </div>
      </div>

      <div className="flex-1 relative bg-[#050505]">
        <video
          ref={videoRef} autoPlay playsInline muted
          className="absolute inset-0 w-full h-full object-cover"
          style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
        />

        {/* Viewfinder UI */}
        <div className="absolute inset-8 border border-white/5 pointer-events-none">
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-white/20" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-white/20" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-white/20" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-white/20" />
        </div>

        <div className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col gap-6">
          <Button size="icon" variant="ghost" className="h-10 w-10 bg-black/40 backdrop-blur rounded-xl border border-white/10" onClick={() => setZoom([Math.min(5, zoom[0] + 0.2)])}><ZoomIn className="h-4 w-4" /></Button>
          <div className="h-32 flex items-center justify-center">
            <Slider orientation="vertical" value={zoom} onValueChange={setZoom} min={1} max={5} step={0.1} />
          </div>
          <Button size="icon" variant="ghost" className="h-10 w-10 bg-black/40 backdrop-blur rounded-xl border border-white/10" onClick={() => setZoom([Math.max(1, zoom[0] - 0.2)])}><ZoomOut className="h-4 w-4" /></Button>
        </div>

        <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-4">
          <Button size="icon" variant="ghost" className="h-12 w-12 bg-black/80 backdrop-blur rounded-2xl border border-white/20" onClick={switchCamera}><SwitchCamera className="h-5 w-5" /></Button>
        </div>
      </div>

      {/* Production Footer */}
      <div className="h-24 bg-black border-t border-white/10 px-6 flex items-center justify-between px-12">
        <Button variant="ghost" size="icon" className={`h-14 w-14 rounded-2xl border ${isMuted ? 'bg-red-600/20 border-red-500 text-red-500' : 'bg-white/5 border-white/10'}`} onClick={() => setIsMuted(!isMuted)}>
          {isMuted ? <MicOff /> : <Mic />}
        </Button>

        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-red-600 animate-pulse shadow-[0_0_10px_rgba(220,38,38,0.8)]" />
            <span className="text-[10px] font-black italic tracking-widest">ON AIR</span>
          </div>
          <span className="text-[8px] font-bold text-white/30 uppercase tracking-[0.3em]">PRO_UNIT_ACTIVE</span>
        </div>

        <Button variant="ghost" size="icon" className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10" onClick={() => window.location.reload()}>
          <XCircle className="h-6 w-6 text-white/40" />
        </Button>
      </div>

      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="bg-[#0F1115] border-white/5 p-8 max-w-sm rounded-[2rem]">
          <DialogHeader><DialogTitle className="text-white font-black italic uppercase italic">SYSTEM_CONFIG</DialogTitle></DialogHeader>
          <div className="space-y-6 pt-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-white/30 ml-1">Stream Quality</Label>
              <Select value={quality} onValueChange={v => { setQuality(v); setTimeout(() => startCamera(), 100); }}>
                <SelectTrigger className="bg-black/40 border-white/10 rounded-xl h-12 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0F1115] border-white/10 text-white">
                  <SelectItem value="720p">720P BALANCED</SelectItem>
                  <SelectItem value="1080p">1080P PRO</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full h-12 bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10" onClick={() => setShowSettings(false)}>CLOSE</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
