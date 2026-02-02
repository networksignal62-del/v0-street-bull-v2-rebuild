"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import SimplePeer from "simple-peer";
import { getSocket } from "@/lib/socket";
import {
  Camera,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Signal,
  Battery,
  Settings,
  CheckCircle,
  XCircle,
  Loader2,
  SwitchCamera,
  ZoomIn,
  ZoomOut,
  Radio,
  AlertTriangle,
  Wifi,
  WifiOff,
  RefreshCw,
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

type ConnectionStatus = "disconnected" | "connecting" | "connected" | "live";

export default function CameraJoinPage() {
  const searchParams = useSearchParams();
  const streamCodeFromUrl = searchParams ? searchParams.get("stream") || "" : "";

  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("disconnected");
  const [streamCode, setStreamCode] = useState(streamCodeFromUrl);
  const [cameraName, setCameraName] = useState("");
  const [operatorName, setOperatorName] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [zoom, setZoom] = useState([1]);
  const [quality, setQuality] = useState("720p");
  const [batteryLevel, setBatteryLevel] = useState(100);
  const [signalStrength, setSignalStrength] = useState<"excellent" | "good" | "fair" | "poor">("excellent");
  const [showSettings, setShowSettings] = useState(false);

  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [activeStreamId, setActiveStreamId] = useState<string | null>(null);
  const socket = useRef(getSocket());
  const peersRef = useRef<Map<string, SimplePeer.Instance>>(new Map());

  // Get battery status
  useEffect(() => {
    if ("getBattery" in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setBatteryLevel(Math.round(battery.level * 100));
        battery.addEventListener("levelchange", () => {
          setBatteryLevel(Math.round(battery.level * 100));
        });
      });
    }
  }, []);

  // Get network status
  useEffect(() => {
    const updateNetworkStatus = () => {
      const connection = (navigator as any).connection;
      if (connection) {
        const type = connection.effectiveType;
        if (type === "4g") setSignalStrength("excellent");
        else if (type === "3g") setSignalStrength("good");
        else if (type === "2g") setSignalStrength("fair");
        else setSignalStrength("poor");
      }
    };
    updateNetworkStatus();
    window.addEventListener("online", updateNetworkStatus);
    window.addEventListener("offline", () => setSignalStrength("poor"));
    return () => {
      window.removeEventListener("online", updateNetworkStatus);
      window.removeEventListener("offline", () => setSignalStrength("poor"));
    };
  }, []);

  // Start camera stream
  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);

      // Stop any existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facingMode,
          ...(quality === "1080p" ? { width: { ideal: 1920 }, height: { ideal: 1080 } } :
            quality === "720p" ? { width: { ideal: 1280 }, height: { ideal: 720 } } :
              { width: { ideal: 854 }, height: { ideal: 480 } })
        },
        audio: true,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      setActiveStreamId(stream.id);
      setHasPermission(true);

      // Apply initial mute state
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) audioTrack.enabled = !isMuted;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setConnectionStatus(prev => prev); // Trigger re-render
    } catch (error) {
      console.log("[v0] Camera error:", error);
      setHasPermission(false);
      if (error instanceof Error) {
        if (error.name === "NotAllowedError") {
          setCameraError("Camera permission denied. Please allow camera access in your browser settings.");
        } else if (error.name === "NotFoundError") {
          setCameraError("No camera found. Please connect a camera and try again.");
        } else {
          setCameraError("Failed to access camera. Please check your device settings.");
        }
      }
    }
  }, [facingMode, quality, isMuted]);

  // Stop camera stream
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Toggle video (Software toggle)
  useEffect(() => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = isVideoOn;
      }
    }
    if (isVideoOn && !streamRef.current && (connectionStatus === "live" || connectionStatus === "connected")) {
      startCamera();
    }
  }, [isVideoOn, connectionStatus, startCamera]);

  // Toggle audio
  useEffect(() => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isMuted;
      }
    }
  }, [isMuted]);

  // Switch camera
  const switchCamera = useCallback(async () => {
    const newMode = facingMode === "user" ? "environment" : "user";
    setFacingMode(newMode);

    // Attempt to lock orientation to landscape on back camera
    if (newMode === "environment" && "screen" in window && (window.screen as any).orientation?.lock) {
      try {
        await (window.screen as any).orientation.lock("landscape");
      } catch (e) {
        console.log("Orientation lock not supported");
      }
    }

    if (connectionStatus === "live" || connectionStatus === "connected" || connectionStatus === "connecting") {
      setTimeout(() => startCamera(), 100);
    }
  }, [facingMode, connectionStatus, startCamera]);

  const handleJoin = async () => {
    if (!streamCode || !cameraName || !operatorName) return;

    setConnectionStatus("connecting");

    try {
      await startCamera();

      // Join via socket
      socket.current.emit('camera:join', {
        streamCode,
        cameraName,
        operatorName,
      });

      socket.current.on('camera:joined', ({ cameraId }) => {
        console.log('Camera joined with ID:', cameraId);
        setConnectionStatus("connected");

        setTimeout(() => {
          setConnectionStatus("live");
          socket.current.emit('camera:ready', { cameraId });
        }, 1000);
      });

      // Signal for start:stream
      socket.current.on('start:stream', () => {
        console.log('✓ Broadcaster requested stream start');
        setConnectionStatus("live");
      });

      // Listen for chat messages
      socket.current.on('chat:message', (msg) => {
        console.log('Chat message:', msg);
      });

      // Handle WebRTC Offer
      socket.current.on('webrtc:offer', ({ from, offer }) => {
        console.log('Received offer from:', from);

        if (!streamRef.current) {
          console.error("No stream available for WebRTC");
          return;
        }

        const peer = new SimplePeer({
          initiator: false,
          trickle: true,
          stream: streamRef.current,
        });

        peersRef.current.set(from, peer);

        peer.on('signal', (signal) => {
          socket.current.emit('webrtc:answer', {
            to: from,
            answer: signal,
          });
        });

        peer.on('error', (err) => {
          console.error('Peer error:', err);
          peersRef.current.delete(from);
        });

        peer.signal(offer);
      });

      socket.current.on('webrtc:ice-candidate', ({ from, candidate }) => {
        const peer = peersRef.current.get(from);
        if (peer) {
          peer.signal(candidate);
        }
      });

    } catch (error) {
      console.error("Failed to join:", error);
      setConnectionStatus("disconnected");
    }
  };

  const handleDisconnect = () => {
    stopCamera();
    peersRef.current.forEach(peer => peer.destroy());
    peersRef.current.clear();
    socket.current.disconnect();
    setConnectionStatus("disconnected");
  };

  useEffect(() => {
    return () => {
      stopCamera();
      peersRef.current.forEach(peer => peer.destroy());
      peersRef.current.clear();
    };
  }, [stopCamera]);

  const getSignalColor = () => {
    switch (signalStrength) {
      case "excellent": return "text-green-500";
      case "good": return "text-yellow-500";
      case "fair": return "text-orange-500";
      default: return "text-red-500";
    }
  };

  const getBatteryColor = () => {
    if (batteryLevel > 50) return "text-green-500";
    if (batteryLevel > 20) return "text-yellow-500";
    return "text-red-500";
  };

  useEffect(() => {
    if (videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [activeStreamId, isVideoOn]);

  if (connectionStatus === "disconnected") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Camera className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-xl sm:text-2xl">Join as Camera</CardTitle>
            <CardDescription>
              Enter the stream code to join as a camera operator
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {cameraError && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{cameraError}</span>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="streamCode">Stream Code</Label>
              <Input
                id="streamCode"
                placeholder="e.g., SB-MATCH-001"
                value={streamCode}
                onChange={(e) => setStreamCode(e.target.value.toUpperCase())}
                className="font-mono text-white bg-transparent"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="operatorName">Your Name</Label>
              <Input
                id="operatorName"
                placeholder="e.g., Ibrahim Kamara"
                value={operatorName}
                onChange={(e) => setOperatorName(e.target.value)}
                className="text-white bg-transparent"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cameraName">Camera Position</Label>
              <Select value={cameraName} onValueChange={setCameraName}>
                <SelectTrigger className="bg-transparent text-white">
                  <SelectValue placeholder="Select camera position" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Goal Post A">Goal Post A</SelectItem>
                  <SelectItem value="Goal Post B">Goal Post B</SelectItem>
                  <SelectItem value="Crowd View">Crowd View</SelectItem>
                  <SelectItem value="Ball Tracker">Ball Tracker</SelectItem>
                  <SelectItem value="Coach Bench">Coach Bench</SelectItem>
                  <SelectItem value="Player Bench">Player Bench</SelectItem>
                  <SelectItem value="Sideline">Sideline</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="quality">Video Quality</Label>
              <Select value={quality} onValueChange={setQuality}>
                <SelectTrigger className="bg-transparent text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="480p">480p (Low data usage)</SelectItem>
                  <SelectItem value="720p">720p (Recommended)</SelectItem>
                  <SelectItem value="1080p">1080p (High quality)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              className="w-full gap-2"
              onClick={handleJoin}
              disabled={!streamCode || !cameraName || !operatorName}
            >
              <Video className="h-4 w-4" />
              Join Broadcast
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (connectionStatus === "connecting") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <Loader2 className="h-16 w-16 mx-auto mb-4 text-primary animate-spin" />
            <h2 className="text-xl font-semibold mb-2">Connecting...</h2>
            <p className="text-muted-foreground mb-4">
              Joining broadcast as {cameraName}
            </p>
            <Progress value={66} className="w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Status Bar */}
      <div className="bg-card/90 backdrop-blur border-b flex items-center justify-between px-3 sm:px-4 py-2">
        <div className="flex items-center gap-2 sm:gap-3">
          {connectionStatus === "live" ? (
            <Badge className="bg-red-500 text-white animate-pulse gap-1 text-xs">
              <Radio className="h-3 w-3" />
              LIVE
            </Badge>
          ) : (
            <Badge variant="secondary" className="gap-1 text-xs">
              <CheckCircle className="h-3 w-3" />
              Connected
            </Badge>
          )}
          <span className="text-xs sm:text-sm font-medium truncate max-w-[100px] sm:max-w-none text-white">{cameraName}</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-1">
            <Wifi className={`h-4 w-4 ${getSignalColor()}`} />
            <span className="text-xs capitalize hidden sm:inline text-white">{signalStrength}</span>
          </div>
          <div className="flex items-center gap-1">
            <Battery className={`h-4 w-4 ${getBatteryColor()}`} />
            <span className="text-xs text-white">{Math.round(batteryLevel)}%</span>
          </div>
          <Badge variant="outline" className="text-xs hidden sm:flex text-white">
            {quality}
          </Badge>
        </div>
      </div>

      <div className="flex-1 relative bg-black">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`absolute inset-0 w-full h-full object-cover ${!isVideoOn ? 'hidden' : ''}`}
          style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
        />

        {!isVideoOn && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <div className="text-center">
              <VideoOff className="h-16 w-16 sm:h-24 sm:w-24 mx-auto text-muted-foreground/50" />
              <p className="text-muted-foreground mt-4">Camera Off</p>
            </div>
          </div>
        )}

        {hasPermission === false && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted p-4">
            <Card className="max-w-md">
              <CardContent className="pt-6 text-center">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-destructive" />
                <h3 className="font-semibold mb-2">Camera Access Required</h3>
                <p className="text-sm text-muted-foreground mb-4">{cameraError}</p>
                <Button onClick={startCamera} className="gap-2">
                  <Camera className="h-4 w-4" />
                  Retry
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {zoom[0] > 1 && (
          <div className="absolute top-4 left-4 bg-black/50 backdrop-blur rounded-full px-3 py-1">
            <span className="text-white text-sm">{zoom[0].toFixed(1)}x</span>
          </div>
        )}

        {connectionStatus === "live" && (
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse" />
            <span className="text-white text-sm font-medium">ON AIR</span>
          </div>
        )}

        <div className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 space-y-2 sm:space-y-3">
          <Button
            variant="secondary"
            size="icon"
            className="rounded-full h-10 w-10 sm:h-12 sm:w-12 bg-black/50 backdrop-blur"
            onClick={switchCamera}
          >
            <SwitchCamera className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="rounded-full h-10 w-10 sm:h-12 sm:w-12 bg-black/50 backdrop-blur"
            onClick={() => setShowSettings(true)}
          >
            <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>

        <div className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2 sm:gap-3">
          <Button
            variant="secondary"
            size="icon"
            className="rounded-full h-8 w-8 sm:h-10 sm:w-10 bg-black/50 backdrop-blur"
            onClick={() => {
              const newVal = Math.min(5, zoom[0] + 0.5);
              setZoom([newVal]);
              if (streamRef.current) {
                const track = streamRef.current.getVideoTracks()[0];
                if (track && 'applyConstraints' in track) {
                  (track as any).applyConstraints({ advanced: [{ zoom: newVal }] });
                }
              }
            }}
          >
            <ZoomIn className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
          <div className="h-24 sm:h-32 flex items-center">
            <Slider
              value={zoom}
              onValueChange={(val) => {
                setZoom(val);
                if (streamRef.current) {
                  const track = streamRef.current.getVideoTracks()[0];
                  if (track && 'applyConstraints' in track) {
                    (track as any).applyConstraints({ advanced: [{ zoom: val[0] }] });
                  }
                }
              }}
              min={1}
              max={5}
              step={0.1}
              orientation="vertical"
              className="h-full"
            />
          </div>
          <Button
            variant="secondary"
            size="icon"
            className="rounded-full h-8 w-8 sm:h-10 sm:w-10 bg-black/50 backdrop-blur"
            onClick={() => {
              const newVal = Math.max(1, zoom[0] - 0.5);
              setZoom([newVal]);
              if (streamRef.current) {
                const track = streamRef.current.getVideoTracks()[0];
                if (track && 'applyConstraints' in track) {
                  (track as any).applyConstraints({ advanced: [{ zoom: newVal }] });
                }
              }
            }}
          >
            <ZoomOut className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>
      </div>

      <div className="bg-card/90 backdrop-blur border-t p-3 sm:p-4">
        <div className="flex items-center justify-around max-w-md mx-auto">
          <Button
            variant={isMuted ? "destructive" : "secondary"}
            size="icon"
            className="rounded-full h-12 w-12 sm:h-14 sm:w-14"
            onClick={() => setIsMuted(!isMuted)}
          >
            {isMuted ? <MicOff className="h-5 w-5 sm:h-6 sm:w-6" /> : <Mic className="h-5 w-5 sm:h-6 sm:w-6" />}
          </Button>

          <Button
            variant={isVideoOn ? "default" : "destructive"}
            size="icon"
            className="rounded-full h-14 w-14 sm:h-16 sm:w-16"
            onClick={() => setIsVideoOn(!isVideoOn)}
          >
            {isVideoOn ? <Video className="h-6 w-6 sm:h-7 sm:w-7" /> : <VideoOff className="h-6 w-6 sm:h-7 sm:w-7" />}
          </Button>

          <Button
            variant="destructive"
            size="icon"
            className="rounded-full h-12 w-12 sm:h-14 sm:w-14"
            onClick={handleDisconnect}
          >
            <XCircle className="h-5 w-5 sm:h-6 sm:w-6" />
          </Button>
        </div>
        <p className="text-center text-xs text-muted-foreground mt-3">
          Streaming to: {streamCode}
        </p>
      </div>

      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-[90vw] sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-white">Camera Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-white">Video Quality</Label>
              <Select value={quality} onValueChange={(val) => { setQuality(val); startCamera(); }}>
                <SelectTrigger className="bg-transparent text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="480p">480p (Save data)</SelectItem>
                  <SelectItem value="720p">720p (Balanced)</SelectItem>
                  <SelectItem value="1080p">1080p (Best quality)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-white">Camera</Label>
              <Button variant="outline" className="w-full gap-2 bg-transparent text-white" onClick={switchCamera}>
                <SwitchCamera className="h-4 w-4" />
                Switch to {facingMode === "user" ? "Back" : "Front"} Camera
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
