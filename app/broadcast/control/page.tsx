"use client";

import React from "react"

import { useState, useEffect, useRef, useCallback } from "react";
import { QRCodeSVG } from "qrcode.react";
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
  Clock,
  Signal,
  Maximize2,
  Volume2,
  QrCode,
  Copy,
  Check,
  RefreshCw,
  Play,
  Pause,
  StopCircle,
  Plus,
  Minus,
  Share2,
  Upload,
  ImageIcon,
  X,
  Timer,
  RotateCcw,
  Sliders,
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
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Generate unique stream ID
const generateStreamId = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "SB-";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Mock camera feeds
const initialCameras = [
  {
    id: 1,
    name: "Goal Post A",
    operator: "Ibrahim K.",
    status: "live" as const,
    quality: "1080p",
    battery: 85,
    signal: "excellent" as const,
  },
  {
    id: 2,
    name: "Goal Post B",
    operator: "Mohamed S.",
    status: "live" as const,
    quality: "720p",
    battery: 72,
    signal: "good" as const,
  },
  {
    id: 3,
    name: "Crowd View",
    operator: "Fatmata A.",
    status: "live" as const,
    quality: "1080p",
    battery: 90,
    signal: "excellent" as const,
  },
  {
    id: 4,
    name: "Ball Tracker",
    operator: "Alhaji B.",
    status: "live" as const,
    quality: "720p",
    battery: 65,
    signal: "good" as const,
  },
  {
    id: 5,
    name: "Coach Bench",
    operator: "Aminata T.",
    status: "connecting" as const,
    quality: "720p",
    battery: 45,
    signal: "fair" as const,
  },
];

// Mock chat messages
const mockChat = [
  { id: 1, user: "FanMohamed", message: "Great goal!", time: "2 min ago" },
  {
    id: 2,
    user: "SierraFan",
    message: "What a save by the keeper!",
    time: "1 min ago",
  },
  {
    id: 3,
    user: "FreetownFC",
    message: "Come on boys!",
    time: "30 sec ago",
  },
  {
    id: 4,
    user: "BoCity",
    message: "The striker is on fire today",
    time: "10 sec ago",
  },
];

export default function BroadcasterControlPage() {
  // Stream state
  const [isLive, setIsLive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [activeCamera, setActiveCamera] = useState(1);
  const [volume, setVolume] = useState([75]);
  const [cameras, setCameras] = useState(initialCameras);

  // Stream IDs
  const [streamId] = useState(() => generateStreamId());
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const cameraJoinUrl = `${baseUrl}/camera/join?stream=${streamId}`;
  const viewerWatchUrl = `${baseUrl}/watch/${streamId}`;

  // Copy state
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  // Game Clock State
  const [matchMinutes, setMatchMinutes] = useState(0);
  const [matchSeconds, setMatchSeconds] = useState(0);
  const [isClockRunning, setIsClockRunning] = useState(false);
  const [addedTime, setAddedTime] = useState(0);
  const [halfTime, setHalfTime] = useState<1 | 2>(1);
  const clockInterval = useRef<NodeJS.Timeout | null>(null);

  // Score State
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [homeTeam, setHomeTeam] = useState("FC Freetown");
  const [awayTeam, setAwayTeam] = useState("Bo Rangers");
  const [homeLogo, setHomeLogo] = useState<string | null>(null);
  const [awayLogo, setAwayLogo] = useState<string | null>(null);

  // Settings State
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [videoQuality, setVideoQuality] = useState("1080p");
  const [frameRate, setFrameRate] = useState("30");
  const [bitrate, setBitrate] = useState("4500");
  const [showScoreboard, setShowScoreboard] = useState(true);
  const [showClock, setShowClock] = useState(true);
  const [showLogos, setShowLogos] = useState(true);

  // Dialogs
  const [showCameraQR, setShowCameraQR] = useState(false);
  const [showViewerQR, setShowViewerQR] = useState(false);
  const [showLogoUpload, setShowLogoUpload] = useState<"home" | "away" | null>(
    null
  );

  // Clock Functions
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
    } else {
      if (clockInterval.current) {
        clearInterval(clockInterval.current);
      }
    }
    return () => {
      if (clockInterval.current) {
        clearInterval(clockInterval.current);
      }
    };
  }, [isClockRunning]);

  const startClock = () => setIsClockRunning(true);
  const pauseClock = () => setIsClockRunning(false);
  const resetClock = () => {
    setIsClockRunning(false);
    setMatchMinutes(0);
    setMatchSeconds(0);
    setAddedTime(0);
  };

  const setClockTo45 = () => {
    setMatchMinutes(45);
    setMatchSeconds(0);
    setHalfTime(2);
  };

  const addInjuryTime = (mins: number) => {
    setAddedTime((prev) => prev + mins);
  };

  const formatTime = (mins: number, secs: number) => {
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Copy function
  const handleCopy = useCallback((text: string, item: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(item);
    setTimeout(() => setCopiedItem(null), 2000);
  }, []);

  // Logo upload handler
  const handleLogoUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    team: "home" | "away"
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (team === "home") {
          setHomeLogo(reader.result as string);
        } else {
          setAwayLogo(reader.result as string);
        }
        setShowLogoUpload(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const getSignalColor = (signal: string) => {
    switch (signal) {
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

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <div className="border-b bg-card">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">Broadcast Control</h1>
            {isLive ? (
              <Badge className="bg-red-500 text-white animate-pulse">
                <Radio className="h-3 w-3 mr-1" />
                LIVE
              </Badge>
            ) : (
              <Badge variant="secondary">OFFLINE</Badge>
            )}
            <Badge variant="outline" className="font-mono">
              {streamId}
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>1,234 viewers</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Camera className="h-4 w-4" />
              <span>
                {cameras.filter((c) => c.status === "live").length} cameras
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 bg-transparent"
              onClick={() => setSettingsOpen(true)}
            >
              <Settings className="h-4 w-4" />
              Settings
            </Button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-57px)]">
        {/* Main Content */}
        <div className="flex-1 p-4 space-y-4 overflow-auto">
          {/* Main Preview */}
          <Card className="overflow-hidden">
            <div className="relative aspect-video bg-black">
              {/* Video Preview Placeholder */}
              <div className="absolute inset-0 flex items-center justify-center">
                {isLive ? (
                  <div className="text-center text-white">
                    <Video className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">
                      Camera {activeCamera}:{" "}
                      {cameras.find((c) => c.id === activeCamera)?.name}
                    </p>
                  </div>
                ) : (
                  <div className="text-center text-white/50">
                    <VideoOff className="h-16 w-16 mx-auto mb-4" />
                    <p>Stream is offline</p>
                  </div>
                )}
              </div>

              {/* Overlay Controls */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                {/* Scoreboard Overlay */}
                {showScoreboard && (
                  <div className="flex items-center justify-center mb-4">
                    <div className="flex items-center gap-4 bg-card/90 backdrop-blur rounded-lg px-6 py-3">
                      {/* Home Team */}
                      <div className="flex items-center gap-3">
                        {showLogos && (
                          <div
                            className="h-10 w-10 rounded-full bg-muted flex items-center justify-center cursor-pointer hover:ring-2 ring-primary overflow-hidden"
                            onClick={() => setShowLogoUpload("home")}
                          >
                            {homeLogo ? (
                              <img
                                src={homeLogo || "/placeholder.svg"}
                                alt="Home logo"
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Upload className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                        )}
                        <div className="text-center">
                          <Input
                            value={homeTeam}
                            onChange={(e) => setHomeTeam(e.target.value)}
                            className="w-28 text-center text-sm font-bold h-7 bg-transparent border-none p-0"
                          />
                        </div>
                      </div>

                      {/* Home Score */}
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() =>
                            setHomeScore(Math.max(0, homeScore - 1))
                          }
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-3xl font-bold min-w-[2.5rem] text-center text-white">
                          {homeScore}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => setHomeScore(homeScore + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      {/* Clock */}
                      {showClock && (
                        <div className="text-center px-4 border-x border-white/20">
                          <p className="text-2xl font-mono font-bold text-white">
                            {formatTime(matchMinutes, matchSeconds)}
                            {addedTime > 0 && (
                              <span className="text-sm ml-1 text-[#FF5722]">
                                +{addedTime}
                              </span>
                            )}
                          </p>
                          <p className="text-[10px] text-white/60">
                            {halfTime === 1 ? "1ST HALF" : "2ND HALF"}
                          </p>
                        </div>
                      )}

                      {/* Away Score */}
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() =>
                            setAwayScore(Math.max(0, awayScore - 1))
                          }
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-3xl font-bold min-w-[2.5rem] text-center text-white">
                          {awayScore}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => setAwayScore(awayScore + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      {/* Away Team */}
                      <div className="flex items-center gap-3">
                        <div className="text-center">
                          <Input
                            value={awayTeam}
                            onChange={(e) => setAwayTeam(e.target.value)}
                            className="w-28 text-center text-sm font-bold h-7 bg-transparent border-none p-0"
                          />
                        </div>
                        {showLogos && (
                          <div
                            className="h-10 w-10 rounded-full bg-muted flex items-center justify-center cursor-pointer hover:ring-2 ring-primary overflow-hidden"
                            onClick={() => setShowLogoUpload("away")}
                          >
                            {awayLogo ? (
                              <img
                                src={awayLogo || "/placeholder.svg"}
                                alt="Away logo"
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Upload className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Control Bar */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      variant={isMuted ? "destructive" : "secondary"}
                      size="icon"
                      onClick={() => setIsMuted(!isMuted)}
                    >
                      {isMuted ? (
                        <MicOff className="h-4 w-4" />
                      ) : (
                        <Mic className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant={isVideoOn ? "secondary" : "destructive"}
                      size="icon"
                      onClick={() => setIsVideoOn(!isVideoOn)}
                    >
                      {isVideoOn ? (
                        <Video className="h-4 w-4" />
                      ) : (
                        <VideoOff className="h-4 w-4" />
                      )}
                    </Button>
                    <div className="flex items-center gap-2 ml-4">
                      <Volume2 className="h-4 w-4 text-white/70" />
                      <Slider
                        value={volume}
                        onValueChange={setVolume}
                        max={100}
                        step={1}
                        className="w-24"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isLive ? (
                      <>
                        <Button
                          variant="secondary"
                          className="gap-2"
                          onClick={() => setIsLive(false)}
                        >
                          <Pause className="h-4 w-4" />
                          Pause
                        </Button>
                        <Button
                          variant="destructive"
                          className="gap-2"
                          onClick={() => setIsLive(false)}
                        >
                          <StopCircle className="h-4 w-4" />
                          End
                        </Button>
                      </>
                    ) : (
                      <Button
                        className="gap-2 bg-red-500 hover:bg-red-600"
                        onClick={() => setIsLive(true)}
                      >
                        <Radio className="h-4 w-4" />
                        Go Live
                      </Button>
                    )}
                    <Button variant="outline" size="icon" className="bg-transparent">
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Live Indicator */}
              {isLive && (
                <div className="absolute top-4 left-4">
                  <Badge className="bg-red-500 text-white animate-pulse">
                    <span className="h-2 w-2 rounded-full bg-white mr-2 inline-block" />
                    LIVE
                  </Badge>
                </div>
              )}
            </div>
          </Card>

          {/* Game Clock Controls */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Timer className="h-5 w-5" />
                Game Clock Controls
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-3">
                {/* Clock Display */}
                <div className="bg-muted rounded-lg px-6 py-3 font-mono text-2xl font-bold">
                  {formatTime(matchMinutes, matchSeconds)}
                  {addedTime > 0 && (
                    <span className="text-sm ml-2 text-[#FF5722]">
                      +{addedTime}
                    </span>
                  )}
                </div>

                {/* Main Controls */}
                <div className="flex items-center gap-2">
                  {!isClockRunning ? (
                    <Button onClick={startClock} className="gap-2">
                      <Play className="h-4 w-4" />
                      Start
                    </Button>
                  ) : (
                    <Button
                      onClick={pauseClock}
                      variant="secondary"
                      className="gap-2"
                    >
                      <Pause className="h-4 w-4" />
                      Pause
                    </Button>
                  )}
                  <Button
                    onClick={resetClock}
                    variant="outline"
                    className="gap-2 bg-transparent"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reset
                  </Button>
                </div>

                {/* Half Time */}
                <div className="flex items-center gap-2">
                  <Button
                    onClick={setClockTo45}
                    variant="outline"
                    size="sm"
                    className="bg-transparent"
                  >
                    Set to 45:00
                  </Button>
                  <Select
                    value={halfTime.toString()}
                    onValueChange={(v) => setHalfTime(Number(v) as 1 | 2)}
                  >
                    <SelectTrigger className="w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1st Half</SelectItem>
                      <SelectItem value="2">2nd Half</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Added Time */}
                <div className="flex items-center gap-2 ml-auto">
                  <span className="text-sm text-muted-foreground">
                    Added Time:
                  </span>
                  <Button
                    onClick={() => addInjuryTime(1)}
                    variant="outline"
                    size="sm"
                    className="bg-transparent"
                  >
                    +1
                  </Button>
                  <Button
                    onClick={() => addInjuryTime(2)}
                    variant="outline"
                    size="sm"
                    className="bg-transparent"
                  >
                    +2
                  </Button>
                  <Button
                    onClick={() => addInjuryTime(3)}
                    variant="outline"
                    size="sm"
                    className="bg-transparent"
                  >
                    +3
                  </Button>
                  <Button
                    onClick={() => setAddedTime(0)}
                    variant="ghost"
                    size="sm"
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Camera Grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">Camera Feeds ({cameras.length})</h2>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 bg-transparent"
                  onClick={() => setShowCameraQR(true)}
                >
                  <QrCode className="h-4 w-4" />
                  Camera QR
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 bg-transparent"
                  onClick={() => setShowViewerQR(true)}
                >
                  <Share2 className="h-4 w-4" />
                  Viewer Link
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {cameras.map((camera) => (
                <Card
                  key={camera.id}
                  className={`cursor-pointer transition-all overflow-hidden ${
                    activeCamera === camera.id
                      ? "ring-2 ring-primary"
                      : "hover:ring-1 hover:ring-primary/50"
                  }`}
                  onClick={() => setActiveCamera(camera.id)}
                >
                  <div className="relative aspect-video bg-muted">
                    <div className="absolute inset-0 flex items-center justify-center">
                      {camera.status === "live" ? (
                        <Camera className="h-6 w-6 text-muted-foreground" />
                      ) : (
                        <RefreshCw className="h-6 w-6 text-muted-foreground animate-spin" />
                      )}
                    </div>
                    <div className="absolute top-1 left-1">
                      <Badge
                        variant={
                          camera.status === "live" ? "default" : "secondary"
                        }
                        className="text-[10px] px-1 py-0"
                      >
                        {camera.status === "live" ? "LIVE" : "..."}
                      </Badge>
                    </div>
                    <div className="absolute top-1 right-1">
                      <Signal
                        className={`h-3 w-3 ${getSignalColor(camera.signal)}`}
                      />
                    </div>
                    {activeCamera === camera.id && (
                      <div className="absolute bottom-1 right-1">
                        <Badge className="bg-primary text-[10px] px-1 py-0">
                          ON AIR
                        </Badge>
                      </div>
                    )}
                  </div>
                  <div className="p-2">
                    <p className="text-xs font-medium truncate">{camera.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {camera.operator} - {camera.quality}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 border-l bg-card flex flex-col">
          <Tabs defaultValue="chat" className="flex-1 flex flex-col">
            <TabsList className="w-full justify-start rounded-none border-b px-2">
              <TabsTrigger value="chat" className="gap-1">
                <MessageSquare className="h-3 w-3" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="cameras" className="gap-1">
                <Camera className="h-3 w-3" />
                Cameras
              </TabsTrigger>
              <TabsTrigger value="share" className="gap-1">
                <Share2 className="h-3 w-3" />
                Share
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="flex-1 flex flex-col m-0 p-0">
              <ScrollArea className="flex-1 p-3">
                <div className="space-y-3">
                  {mockChat.map((msg) => (
                    <div key={msg.id} className="flex gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-[10px]">
                          {msg.user[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium">{msg.user}</span>
                          <span className="text-[10px] text-muted-foreground">
                            {msg.time}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {msg.message}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="p-3 border-t">
                <div className="flex gap-2">
                  <Input placeholder="Send a message..." className="text-sm" />
                  <Button size="sm">Send</Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="cameras" className="flex-1 m-0 p-3">
              <div className="space-y-3">
                {cameras.map((camera) => (
                  <div
                    key={camera.id}
                    className={`p-3 rounded-lg border ${
                      activeCamera === camera.id
                        ? "border-primary bg-primary/10"
                        : "border-border"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{camera.name}</span>
                      <Badge
                        variant={
                          camera.status === "live" ? "default" : "secondary"
                        }
                        className="text-[10px]"
                      >
                        {camera.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <div>Operator: {camera.operator}</div>
                      <div>Quality: {camera.quality}</div>
                      <div>Battery: {camera.battery}%</div>
                      <div className="flex items-center gap-1">
                        Signal:{" "}
                        <Signal
                          className={`h-3 w-3 ${getSignalColor(camera.signal)}`}
                        />
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="w-full mt-2"
                      variant={
                        activeCamera === camera.id ? "default" : "outline"
                      }
                      onClick={() => setActiveCamera(camera.id)}
                    >
                      {activeCamera === camera.id
                        ? "Currently Active"
                        : "Switch to this camera"}
                    </Button>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="share" className="flex-1 m-0 p-3">
              <div className="space-y-4">
                {/* Camera QR */}
                <div>
                  <Label className="text-sm font-medium">
                    Camera Operator Link
                  </Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Share with camera operators to join
                  </p>
                  <div className="flex gap-2">
                    <Input
                      value={cameraJoinUrl}
                      readOnly
                      className="text-xs"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="bg-transparent"
                      onClick={() => handleCopy(cameraJoinUrl, "camera")}
                    >
                      {copiedItem === "camera" ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full mt-2 gap-2 bg-transparent"
                    onClick={() => setShowCameraQR(true)}
                  >
                    <QrCode className="h-4 w-4" />
                    Show QR Code
                  </Button>
                </div>

                {/* Viewer Link */}
                <div>
                  <Label className="text-sm font-medium">Viewer Watch Link</Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Share with fans to watch live
                  </p>
                  <div className="flex gap-2">
                    <Input
                      value={viewerWatchUrl}
                      readOnly
                      className="text-xs"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="bg-transparent"
                      onClick={() => handleCopy(viewerWatchUrl, "viewer")}
                    >
                      {copiedItem === "viewer" ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full mt-2 gap-2 bg-transparent"
                    onClick={() => setShowViewerQR(true)}
                  >
                    <QrCode className="h-4 w-4" />
                    Show QR Code
                  </Button>
                </div>

                {/* Stream Code */}
                <div>
                  <Label className="text-sm font-medium">Stream Code</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={streamId}
                      readOnly
                      className="font-mono"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="bg-transparent"
                      onClick={() => handleCopy(streamId, "code")}
                    >
                      {copiedItem === "code" ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                      Copy Link
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Camera QR Dialog */}
      <Dialog open={showCameraQR} onOpenChange={setShowCameraQR}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Camera Operator QR Code</DialogTitle>
            <DialogDescription>
              Camera operators scan this QR code with their phone to join and
              stream video
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="bg-white p-4 rounded-lg">
              <QRCodeSVG value={cameraJoinUrl} size={200} level="H" />
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Or share this link:</p>
              <code className="text-xs bg-muted px-2 py-1 rounded mt-1 block break-all">
                {cameraJoinUrl}
              </code>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="gap-2 bg-transparent"
              onClick={() => handleCopy(cameraJoinUrl, "camera-dialog")}
            >
              {copiedItem === "camera-dialog" ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              Copy Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Viewer QR Dialog */}
      <Dialog open={showViewerQR} onOpenChange={setShowViewerQR}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Viewer Watch Link</DialogTitle>
            <DialogDescription>
              Fans scan this QR code to watch the live stream
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="bg-white p-4 rounded-lg">
              <QRCodeSVG value={viewerWatchUrl} size={200} level="H" />
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Or share this link:</p>
              <code className="text-xs bg-muted px-2 py-1 rounded mt-1 block break-all">
                {viewerWatchUrl}
              </code>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="gap-2 bg-transparent"
              onClick={() => handleCopy(viewerWatchUrl, "viewer-dialog")}
            >
              {copiedItem === "viewer-dialog" ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              Copy Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Logo Upload Dialog */}
      <Dialog
        open={showLogoUpload !== null}
        onOpenChange={() => setShowLogoUpload(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Upload {showLogoUpload === "home" ? "Home" : "Away"} Team Logo
            </DialogTitle>
            <DialogDescription>
              Upload a logo to display on the scoreboard overlay
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="logo-upload" className="sr-only">
              Choose logo
            </Label>
            <Input
              id="logo-upload"
              type="file"
              accept="image/*"
              onChange={(e) =>
                showLogoUpload && handleLogoUpload(e, showLogoUpload)
              }
            />
            <p className="text-xs text-muted-foreground mt-2">
              Recommended: Square image, at least 100x100px
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sliders className="h-5 w-5" />
              Stream Settings
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Video Quality */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Video Quality</Label>
              <Select value={videoQuality} onValueChange={setVideoQuality}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="480p">480p (SD)</SelectItem>
                  <SelectItem value="720p">720p (HD)</SelectItem>
                  <SelectItem value="1080p">1080p (Full HD)</SelectItem>
                  <SelectItem value="1440p">1440p (2K)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Frame Rate */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Frame Rate</Label>
              <Select value={frameRate} onValueChange={setFrameRate}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24">24 fps</SelectItem>
                  <SelectItem value="30">30 fps</SelectItem>
                  <SelectItem value="60">60 fps</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Bitrate */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                Bitrate (kbps): {bitrate}
              </Label>
              <Slider
                value={[parseInt(bitrate)]}
                onValueChange={(v) => setBitrate(v[0].toString())}
                min={1000}
                max={8000}
                step={500}
              />
              <p className="text-xs text-muted-foreground">
                Higher bitrate = better quality but more bandwidth required
              </p>
            </div>

            {/* Overlay Settings */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Overlay Settings</Label>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Show Scoreboard</span>
                  <Switch
                    checked={showScoreboard}
                    onCheckedChange={setShowScoreboard}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Show Clock</span>
                  <Switch checked={showClock} onCheckedChange={setShowClock} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Show Team Logos</span>
                  <Switch checked={showLogos} onCheckedChange={setShowLogos} />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSettingsOpen(false)} className="bg-transparent">
              Cancel
            </Button>
            <Button onClick={() => setSettingsOpen(false)}>Save Settings</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
