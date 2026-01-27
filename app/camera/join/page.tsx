"use client";

import { useState, useEffect, useRef } from "react";
import SimplePeer from "simple-peer";
import { getSocket } from "@/lib/socket";
import { useMediaStream } from "@/hooks/useMediaStream";
import {
  Camera,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Signal,
  Battery,
  Wifi,
  WifiOff,
  Settings,
  RefreshCw,
  CheckCircle,
  XCircle,
  Loader2,
  SwitchCamera,
  ZoomIn,
  ZoomOut,
  Flashlight,
  FlashlightOff,
  Focus,
  Radio,
  AlertTriangle,
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
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("disconnected");
  const [streamCode, setStreamCode] = useState("");
  const [cameraName, setCameraName] = useState("");
  const [operatorName, setOperatorName] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [flashOn, setFlashOn] = useState(false);
  const [zoom, setZoom] = useState([1]);
  const [quality, setQuality] = useState("720p");
  const [batteryLevel, setBatteryLevel] = useState(85);
  const [signalStrength, setSignalStrength] = useState<
    "excellent" | "good" | "fair" | "poor"
  >("good");
  const [showSettings, setShowSettings] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">(
    "environment"
  );
  const [peer, setPeer] = useState<SimplePeer.Instance | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const socket = useRef(getSocket());

  // Use media stream hook
  const { stream, error: streamError, isLoading: streamLoading, startStream, stopStream } = useMediaStream({
    quality: quality as '480p' | '720p' | '1080p',
    facingMode,
    autoStart: false,
  });

  // Simulate battery drain
  useEffect(() => {
    if (connectionStatus === "live") {
      const interval = setInterval(() => {
        setBatteryLevel((prev) => Math.max(0, prev - 0.1));
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [connectionStatus]);

  const handleJoin = async () => {
    if (!streamCode || !cameraName || !operatorName) return;

    setConnectionStatus("connecting");

    try {
      // Start camera stream
      await startStream();

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

      // Listen for broadcaster messages
      socket.current.on('broadcaster:message', ({ message }) => {
        console.log('Broadcaster message:', message);
      });

    } catch (error) {
      console.error('Failed to join:', error);
      setConnectionStatus("disconnected");
    }
  };

  const handleDisconnect = () => {
    stopStream();
    if (peer) {
      peer.destroy();
      setPeer(null);
    }
    socket.current.disconnect();
    setConnectionStatus("disconnected");
  };

  // Update video element when stream changes
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const getSignalColor = () => {
    switch (signalStrength) {
      case "excellent":
        return "text-green-500";
      case "good":
        return "text-yellow-500";
      case "fair":
        return "text-orange-500";
      default:
        return "text-red-500";
    }
  };

  const getBatteryColor = () => {
    if (batteryLevel > 50) return "text-green-500";
    if (batteryLevel > 20) return "text-yellow-500";
    return "text-red-500";
  };

  // Join Form
  if (connectionStatus === "disconnected") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Camera className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Join as Camera</CardTitle>
            <CardDescription>
              Enter the stream code to join as a camera operator
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="streamCode">Stream Code</Label>
              <Input
                id="streamCode"
                placeholder="e.g., SB-MATCH-2026-001"
                value={streamCode}
                onChange={(e) => setStreamCode(e.target.value.toUpperCase())}
                className="font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="operatorName">Your Name</Label>
              <Input
                id="operatorName"
                placeholder="e.g., Ibrahim Kamara"
                value={operatorName}
                onChange={(e) => setOperatorName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cameraName">Camera Position</Label>
              <Select value={cameraName} onValueChange={setCameraName}>
                <SelectTrigger>
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
                <SelectTrigger>
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
            <p className="text-xs text-center text-muted-foreground">
              By joining, you agree to stream video to the broadcaster
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Connecting State
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
            <p className="text-xs text-muted-foreground mt-4">
              Requesting camera permissions...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Live Camera Interface
  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Status Bar */}
      <div className="bg-card/90 backdrop-blur border-b flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-3">
          {connectionStatus === "live" ? (
            <Badge className="bg-red-500 text-white animate-pulse gap-1">
              <Radio className="h-3 w-3" />
              LIVE
            </Badge>
          ) : (
            <Badge variant="secondary" className="gap-1">
              <CheckCircle className="h-3 w-3" />
              Connected
            </Badge>
          )}
          <span className="text-sm font-medium">{cameraName}</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Signal className={`h-4 w-4 ${getSignalColor()}`} />
            <span className="text-xs capitalize">{signalStrength}</span>
          </div>
          <div className="flex items-center gap-1">
            <Battery className={`h-4 w-4 ${getBatteryColor()}`} />
            <span className="text-xs">{Math.round(batteryLevel)}%</span>
          </div>
          <Badge variant="outline" className="text-xs">
            {quality}
          </Badge>
        </div>
      </div>

      {/* Camera Preview */}
      <div className="flex-1 relative">
        {/* Real Video Preview */}
        {isVideoOn && stream ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            {streamError ? (
              <div className="text-center px-4">
                <AlertTriangle className="h-24 w-24 mx-auto text-destructive/50" />
                <p className="text-destructive mt-4 font-medium">Camera Error</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {streamError}
                </p>
              </div>
            ) : streamLoading ? (
              <div className="text-center">
                <RefreshCw className="h-24 w-24 mx-auto text-muted-foreground/50 animate-spin" />
                <p className="text-muted-foreground mt-4">Starting camera...</p>
              </div>
            ) : (
              <div className="text-center">
                <VideoOff className="h-24 w-24 mx-auto text-muted-foreground/50" />
                <p className="text-muted-foreground mt-4">Camera Off</p>
              </div>
            )}
          </div>
        )}

        {/* Zoom Indicator */}
        {zoom[0] > 1 && (
          <div className="absolute top-4 left-4 bg-black/50 backdrop-blur rounded-full px-3 py-1">
            <span className="text-white text-sm">{zoom[0].toFixed(1)}x</span>
          </div>
        )}

        {/* On Air Indicator */}
        {connectionStatus === "live" && (
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse" />
            <span className="text-white text-sm font-medium">ON AIR</span>
          </div>
        )}

        {/* Broadcaster Message */}
        <div className="absolute bottom-32 left-4 right-4">
          <Card className="bg-card/80 backdrop-blur">
            <CardContent className="py-2 px-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <span className="text-sm">
                Broadcaster: "Focus on the left wing player"
              </span>
            </CardContent>
          </Card>
        </div>

        {/* Side Controls */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 space-y-3">
          <Button
            variant="secondary"
            size="icon"
            className="rounded-full h-12 w-12 bg-black/50 backdrop-blur"
            onClick={() =>
              setFacingMode(facingMode === "user" ? "environment" : "user")
            }
          >
            <SwitchCamera className="h-5 w-5" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="rounded-full h-12 w-12 bg-black/50 backdrop-blur"
            onClick={() => setFlashOn(!flashOn)}
          >
            {flashOn ? (
              <Flashlight className="h-5 w-5" />
            ) : (
              <FlashlightOff className="h-5 w-5" />
            )}
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="rounded-full h-12 w-12 bg-black/50 backdrop-blur"
            onClick={() => setShowSettings(true)}
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>

        {/* Zoom Slider */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-3">
          <Button
            variant="secondary"
            size="icon"
            className="rounded-full h-10 w-10 bg-black/50 backdrop-blur"
            onClick={() => setZoom([Math.min(5, zoom[0] + 0.5)])}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <div className="h-32 flex items-center">
            <Slider
              value={zoom}
              onValueChange={setZoom}
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
            className="rounded-full h-10 w-10 bg-black/50 backdrop-blur"
            onClick={() => setZoom([Math.max(1, zoom[0] - 0.5)])}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="bg-card/90 backdrop-blur border-t p-4">
        <div className="flex items-center justify-around max-w-md mx-auto gap-2">
          <Button
            variant={isMuted ? "destructive" : "secondary"}
            size="icon"
            className="rounded-full h-14 w-14"
            onClick={() => setIsMuted(!isMuted)}
          >
            {isMuted ? (
              <MicOff className="h-6 w-6" />
            ) : (
              <Mic className="h-6 w-6" />
            )}
          </Button>

          <Button
            variant={isVideoOn ? "default" : "destructive"}
            size="icon"
            className="rounded-full h-16 w-16"
            onClick={() => setIsVideoOn(!isVideoOn)}
          >
            {isVideoOn ? (
              <Video className="h-7 w-7" />
            ) : (
              <VideoOff className="h-7 w-7" />
            )}
          </Button>

          <Button
            variant="destructive"
            size="icon"
            className="rounded-full h-14 w-14"
            onClick={handleDisconnect}
          >
            <XCircle className="h-6 w-6" />
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-3">
          Streaming to: FC Freetown vs Bo Rangers
        </p>
      </div>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Camera Settings</DialogTitle>
            <DialogDescription>
              Adjust your camera settings for optimal streaming
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Video Quality</Label>
              <Select value={quality} onValueChange={setQuality}>
                <SelectTrigger>
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
              <Label>Auto Focus</Label>
              <Button variant="outline" className="w-full gap-2 bg-transparent">
                <Focus className="h-4 w-4" />
                Tap to Focus
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <Label>Stabilization</Label>
              <Button variant="outline" size="sm">
                On
              </Button>
            </div>
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Stream Code</span>
                <span className="font-mono">{streamCode}</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-muted-foreground">Camera Position</span>
                <span>{cameraName}</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-muted-foreground">Operator</span>
                <span>{operatorName}</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
