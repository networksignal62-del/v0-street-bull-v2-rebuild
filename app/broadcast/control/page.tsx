"use client";

import { useState } from "react";
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
  VolumeX,
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
  AlertCircle,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock camera feeds
const mockCameras = [
  {
    id: 1,
    name: "Goal Post A",
    operator: "Ibrahim K.",
    status: "live",
    quality: "1080p",
    battery: 85,
    signal: "excellent",
  },
  {
    id: 2,
    name: "Goal Post B",
    operator: "Mohamed S.",
    status: "live",
    quality: "720p",
    battery: 72,
    signal: "good",
  },
  {
    id: 3,
    name: "Crowd View",
    operator: "Fatmata A.",
    status: "live",
    quality: "1080p",
    battery: 90,
    signal: "excellent",
  },
  {
    id: 4,
    name: "Ball Tracker",
    operator: "Alhaji B.",
    status: "live",
    quality: "720p",
    battery: 65,
    signal: "good",
  },
  {
    id: 5,
    name: "Coach Bench",
    operator: "Aminata T.",
    status: "connecting",
    quality: "720p",
    battery: 45,
    signal: "fair",
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
  { id: 4, user: "BoCity", message: "The striker is on fire today", time: "10 sec ago" },
];

export default function BroadcasterControlPage() {
  const [isLive, setIsLive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [activeCamera, setActiveCamera] = useState(1);
  const [volume, setVolume] = useState([75]);
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);
  const [matchTime, setMatchTime] = useState("45:00");
  const [homeScore, setHomeScore] = useState(2);
  const [awayScore, setAwayScore] = useState(1);

  const streamCode = "SB-MATCH-2026-001";
  const viewerLink = "https://streetbull.sl/watch/live-abc123";
  const cameraLink = "https://streetbull.sl/camera/join/xyz789";

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>1,234 viewers</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Stream time: 45:32</span>
            </div>
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
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
                      {mockCameras.find((c) => c.id === activeCamera)?.name}
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
                <div className="flex items-center justify-center mb-4">
                  <div className="flex items-center gap-4 bg-card/90 backdrop-blur rounded-lg px-6 py-3">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">HOME</p>
                      <p className="font-bold text-lg">FC Freetown</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => setHomeScore(Math.max(0, homeScore - 1))}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="text-3xl font-bold min-w-[3rem] text-center">
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
                    <div className="text-center px-4">
                      <Input
                        value={matchTime}
                        onChange={(e) => setMatchTime(e.target.value)}
                        className="w-20 text-center font-mono text-lg h-8"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => setAwayScore(Math.max(0, awayScore - 1))}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="text-3xl font-bold min-w-[3rem] text-center">
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
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">AWAY</p>
                      <p className="font-bold text-lg">Bo Rangers</p>
                    </div>
                  </div>
                </div>

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
                          Pause Stream
                        </Button>
                        <Button
                          variant="destructive"
                          className="gap-2"
                          onClick={() => setIsLive(false)}
                        >
                          <StopCircle className="h-4 w-4" />
                          End Stream
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
                    <Button variant="outline" size="icon">
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Live Indicator */}
              {isLive && (
                <div className="absolute top-4 left-4">
                  <Badge className="bg-red-500 text-white animate-pulse">
                    <span className="h-2 w-2 rounded-full bg-white mr-2 animate-ping" />
                    LIVE
                  </Badge>
                </div>
              )}
            </div>
          </Card>

          {/* Camera Grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">Camera Feeds</h2>
              <Dialog open={showQR} onOpenChange={setShowQR}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                    <QrCode className="h-4 w-4" />
                    Add Camera
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add Camera Operator</DialogTitle>
                    <DialogDescription>
                      Share this QR code or link with camera operators to join
                      the broadcast.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    {/* QR Code Placeholder */}
                    <div className="flex justify-center">
                      <div className="h-48 w-48 bg-white rounded-lg flex items-center justify-center">
                        <div className="grid grid-cols-5 gap-1 p-4">
                          {Array.from({ length: 25 }).map((_, i) => (
                            <div
                              key={i}
                              className={`h-6 w-6 ${
                                Math.random() > 0.5
                                  ? "bg-black"
                                  : "bg-transparent"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Camera Join Link</Label>
                      <div className="flex gap-2">
                        <Input value={cameraLink} readOnly className="text-sm" />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleCopy(cameraLink)}
                        >
                          {copied ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Stream Code</Label>
                      <div className="flex gap-2">
                        <Input
                          value={streamCode}
                          readOnly
                          className="font-mono"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleCopy(streamCode)}
                        >
                          {copied ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {mockCameras.map((camera) => (
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
                      {camera.operator}
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

            <TabsContent value="cameras" className="flex-1 m-0 p-0">
              <ScrollArea className="flex-1 p-3">
                <div className="space-y-3">
                  {mockCameras.map((camera) => (
                    <Card key={camera.id} className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              camera.status === "live" ? "default" : "secondary"
                            }
                            className="text-[10px]"
                          >
                            {camera.status === "live" ? "LIVE" : "CONNECTING"}
                          </Badge>
                          <span className="text-sm font-medium">
                            {camera.name}
                          </span>
                        </div>
                        <Button
                          variant={
                            activeCamera === camera.id ? "default" : "outline"
                          }
                          size="sm"
                          className="text-xs h-6"
                          onClick={() => setActiveCamera(camera.id)}
                        >
                          {activeCamera === camera.id ? "On Air" : "Switch"}
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[10px] text-muted-foreground">
                        <div>Operator: {camera.operator}</div>
                        <div>Quality: {camera.quality}</div>
                        <div>Battery: {camera.battery}%</div>
                        <div
                          className={`capitalize ${getSignalColor(
                            camera.signal
                          )}`}
                        >
                          Signal: {camera.signal}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="share" className="flex-1 m-0 p-3">
              <div className="space-y-4">
                <Card className="p-4">
                  <h3 className="font-medium mb-2">Viewer Watch Link</h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    Share this link with fans to watch the stream
                  </p>
                  <div className="flex gap-2">
                    <Input value={viewerLink} readOnly className="text-xs" />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleCopy(viewerLink)}
                    >
                      {copied ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </Card>

                <Card className="p-4">
                  <h3 className="font-medium mb-2">Camera Join Link</h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    Share with camera operators to join broadcast
                  </p>
                  <div className="flex gap-2">
                    <Input value={cameraLink} readOnly className="text-xs" />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleCopy(cameraLink)}
                    >
                      {copied ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </Card>

                <div className="flex justify-center pt-4">
                  <div className="h-32 w-32 bg-white rounded-lg flex items-center justify-center">
                    <QrCode className="h-20 w-20 text-black" />
                  </div>
                </div>
                <p className="text-xs text-center text-muted-foreground">
                  Scan to watch live
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
