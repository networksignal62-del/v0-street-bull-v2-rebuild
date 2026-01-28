"use client";

import { useState, useEffect, useRef } from "react";
import SimplePeer from "simple-peer";
import { getSocket } from "@/lib/socket";
import { ICE_SERVERS } from "@/lib/webrtc";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Heart,
  MessageSquare,
  Share2,
  Users,
  Radio,
  ThumbsUp,
  Send,
  Settings,
  ChevronDown,
  Clock,
  Trophy,
  Flag,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

// Mock data
const mockChat = [
  { id: 1, user: "FanMohamed", message: "Let's go!", time: "5 min ago", badge: null },
  { id: 2, user: "SierraFan99", message: "Great goal!", time: "4 min ago", badge: "subscriber" },
  { id: 3, user: "FreetownFC", message: "Amazing play!", time: "3 min ago", badge: "vip" },
  { id: 4, user: "BoCity", message: "The striker is on fire", time: "2 min ago", badge: null },
  { id: 5, user: "FootballLover", message: "Best match of the season!", time: "1 min ago", badge: "subscriber" },
  { id: 6, user: "KrioKing", message: "Wi de watch am!", time: "30 sec ago", badge: null },
];

const matchEvents = [
  { time: "12'", type: "goal", team: "home", player: "Mohamed Bangura", description: "Goal! Header from corner" },
  { time: "28'", type: "yellow", team: "away", player: "Ibrahim Sesay", description: "Yellow card for foul" },
  { time: "35'", type: "goal", team: "away", player: "Alhaji Kamara", description: "Goal! Long range shot" },
  { time: "41'", type: "goal", team: "home", player: "Abdul Conteh", description: "Goal! Penalty kick" },
];

const relatedMatches = [
  { id: 1, home: "Kallon FC", away: "East End Lions", status: "Live", viewers: 856 },
  { id: 2, home: "Mighty Blackpool", away: "Diamond Stars", status: "Upcoming", time: "16:00" },
  { id: 3, home: "FC Johansen", away: "Ports Authority", status: "Upcoming", time: "18:00" },
];

export default function WatchPage() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [volume, setVolume] = useState([80]);
  const [quality, setQuality] = useState("720p");
  const [showChat, setShowChat] = useState(true);
  const [liked, setLiked] = useState(false);
  const [viewerCount, setViewerCount] = useState(1234);
  const [chatMessage, setChatMessage] = useState("");
  const [matchTime, setMatchTime] = useState("00:00");
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [isLive, setIsLive] = useState(false);
  const [activeCameraId, setActiveCameraId] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const socket = useRef(getSocket());
  const peerRef = useRef<SimplePeer.Instance | null>(null);

  // Simulate viewer count changes
  useEffect(() => {
    const interval = setInterval(() => {
      setViewerCount((prev) => prev + Math.floor(Math.random() * 10 - 3));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Real-time match updates from broadcaster
  useEffect(() => {
    socket.current.on('match:update', ({ data }) => {
      console.log('Match update:', data);
      if (data.matchTime) setMatchTime(data.matchTime);
      if (typeof data.homeScore === 'number') setHomeScore(data.homeScore);
      if (typeof data.awayScore === 'number') setAwayScore(data.awayScore);
      if (typeof data.isLive === 'boolean') {
        setIsLive(data.isLive);
        setIsPlaying(data.isLive);
      }
    });

    return () => {
      socket.current.off('match:update');
    };
  }, []);

  // Initialize viewer
  useEffect(() => {
    const streamCode = "SB-MATCH-2026-001";
    socket.current.emit('viewer:join', { streamCode });

    // Listen for active camera changes
    socket.current.on('active-camera-changed', ({ cameraId }) => {
      console.log('Active camera changed to:', cameraId);
      setActiveCameraId(cameraId);
      // In a full implementation, we'd request the stream from this camera
    });

    return () => {
      socket.current.off('active-camera-changed');
      if (peerRef.current) {
        peerRef.current.destroy();
      }
    };
  }, []);

  // Connect to Active Camera
  useEffect(() => {
    if (!activeCameraId) return;

    console.log('Connecting to camera:', activeCameraId);

    // Destroy previous peer
    if (peerRef.current) {
      peerRef.current.destroy();
    }

    // Create new peer (initiator)
    const peer = new SimplePeer({
      initiator: true,
      trickle: true,
      config: ICE_SERVERS,
    });

    peer.on('signal', (signal) => {
      socket.current.emit('webrtc:offer', {
        to: activeCameraId,
        offer: signal,
      });
    });

    peer.on('stream', (remoteStream) => {
      console.log('Received stream from camera');
      setStream(remoteStream);
    });

    peer.on('error', (err) => {
      console.error('Peer error:', err);
    });

    peerRef.current = peer;

    // Listen for answer
    const handleAnswer = ({ from, answer }: { from: string, answer: any }) => {
      if (from === activeCameraId && peerRef.current) {
        peerRef.current.signal(answer);
      }
    };

    // Listen for ICE candidates
    const handleIceCandidate = ({ from, candidate }: { from: string, candidate: any }) => {
      if (from === activeCameraId && peerRef.current) {
        peerRef.current.signal(candidate);
      }
    };

    socket.current.on('webrtc:answer', handleAnswer);
    socket.current.on('webrtc:ice-candidate', handleIceCandidate);

    return () => {
      socket.current.off('webrtc:answer', handleAnswer);
      socket.current.off('webrtc:ice-candidate', handleIceCandidate);
      if (peerRef.current) {
        peerRef.current.destroy();
        peerRef.current = null;
      }
    };
  }, [activeCameraId]);

  // Update video element when stream changes
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;
    // In real app, this would send to backend
    setChatMessage("");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
              <Trophy className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">Street Bull</span>
          </Link>
          <div className="flex items-center gap-2">
            <Badge className="bg-red-500 text-white gap-1">
              <Radio className="h-3 w-3" />
              LIVE
            </Badge>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{viewerCount.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row">
        {/* Main Content */}
        <div className="flex-1">
          {/* Video Player */}
          <div className="relative aspect-video bg-black">
            {/* Real Video Stream */}
            {stream ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <Play className="h-20 w-20 mx-auto opacity-50" />
                  <p className="mt-4 text-lg">Connecting to Live Stream...</p>
                </div>
              </div>
            )}

            {/* Scoreboard Overlay */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2">
              <Card className="bg-card/90 backdrop-blur">
                <CardContent className="py-2 px-4 flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">HOME</p>
                    <p className="font-bold">FC Freetown</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{homeScore} - {awayScore}</p>
                    <p className="text-xs text-muted-foreground">{matchTime}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">AWAY</p>
                    <p className="font-bold">Bo Rangers</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Live Badge */}
            {isLive && (
              <div className="absolute top-4 left-4">
                <Badge className="bg-red-500 text-white animate-pulse">
                  <span className="h-2 w-2 rounded-full bg-white mr-2" />
                  LIVE
                </Badge>
              </div>
            )}

            {/* Video Controls */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              {/* Progress Bar */}
              <div className="w-full h-1 bg-white/30 rounded-full mb-4">
                <div className="h-full w-full bg-red-500 rounded-full animate-pulse" />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    {isPlaying ? (
                      <Pause className="h-5 w-5" />
                    ) : (
                      <Play className="h-5 w-5" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                    onClick={() => setIsMuted(!isMuted)}
                  >
                    {isMuted ? (
                      <VolumeX className="h-5 w-5" />
                    ) : (
                      <Volume2 className="h-5 w-5" />
                    )}
                  </Button>
                  <div className="w-24 hidden sm:block">
                    <Slider
                      value={volume}
                      onValueChange={setVolume}
                      max={100}
                      step={1}
                      className="cursor-pointer"
                    />
                  </div>
                  <span className="text-white text-sm ml-2">{matchTime}</span>
                </div>

                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-white/20 gap-1"
                      >
                        <Settings className="h-4 w-4" />
                        {quality}
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => setQuality("1080p")}>
                        1080p HD
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setQuality("720p")}>
                        720p
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setQuality("480p")}>
                        480p
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setQuality("Auto")}>
                        Auto
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20 lg:hidden"
                    onClick={() => setShowChat(!showChat)}
                  >
                    <MessageSquare className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                    onClick={() => setIsFullscreen(!isFullscreen)}
                  >
                    {isFullscreen ? (
                      <Minimize2 className="h-5 w-5" />
                    ) : (
                      <Maximize2 className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Match Info */}
          <div className="p-4 border-b">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-xl font-bold">
                  FC Freetown vs Bo Rangers - Sierra Leone Premier League
                </h1>
                <p className="text-muted-foreground text-sm mt-1">
                  Live from National Stadium, Freetown
                </p>
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    {viewerCount.toLocaleString()} watching
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    Started 47 minutes ago
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={liked ? "default" : "outline"}
                  size="sm"
                  className="gap-1"
                  onClick={() => setLiked(!liked)}
                >
                  <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
                  {liked ? "Liked" : "Like"}
                </Button>
                <Button variant="outline" size="sm" className="gap-1 bg-transparent">
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
              </div>
            </div>
          </div>

          {/* Match Details Tabs */}
          <div className="p-4">
            <Tabs defaultValue="events">
              <TabsList>
                <TabsTrigger value="events">Match Events</TabsTrigger>
                <TabsTrigger value="lineup">Lineup</TabsTrigger>
                <TabsTrigger value="stats">Stats</TabsTrigger>
              </TabsList>

              <TabsContent value="events" className="mt-4">
                <div className="space-y-3">
                  {matchEvents.map((event, index) => (
                    <Card key={index}>
                      <CardContent className="py-3 px-4 flex items-center gap-4">
                        <span className="text-sm font-mono font-bold min-w-[3rem]">
                          {event.time}
                        </span>
                        <div
                          className={`h-8 w-8 rounded-full flex items-center justify-center ${event.type === "goal"
                            ? "bg-green-500/10 text-green-500"
                            : "bg-yellow-500/10 text-yellow-500"
                            }`}
                        >
                          {event.type === "goal" ? (
                            <Trophy className="h-4 w-4" />
                          ) : (
                            <Flag className="h-4 w-4" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{event.player}</p>
                          <p className="text-sm text-muted-foreground">
                            {event.description}
                          </p>
                        </div>
                        <Badge
                          variant={
                            event.team === "home" ? "default" : "secondary"
                          }
                        >
                          {event.team === "home" ? "FC Freetown" : "Bo Rangers"}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="lineup" className="mt-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">FC Freetown</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {[
                          "1. GK - Sulaiman Conteh",
                          "2. DF - Mohamed Kamara",
                          "3. DF - Ibrahim Bangura",
                          "4. MF - Abdul Sesay",
                          "9. FW - Mohamed Bangura (C)",
                        ].map((player, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 p-2 rounded bg-muted/50"
                          >
                            <span className="text-sm">{player}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Bo Rangers</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {[
                          "1. GK - Alhaji Turay",
                          "2. DF - Ibrahim Sesay",
                          "3. DF - Mohamed Kanu",
                          "4. MF - Abdul Kamara",
                          "10. FW - Alhaji Kamara (C)",
                        ].map((player, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 p-2 rounded bg-muted/50"
                          >
                            <span className="text-sm">{player}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="stats" className="mt-4">
                <Card>
                  <CardContent className="py-6">
                    <div className="space-y-4">
                      {[
                        { label: "Possession", home: 55, away: 45 },
                        { label: "Shots", home: 12, away: 8 },
                        { label: "Shots on Target", home: 6, away: 4 },
                        { label: "Corners", home: 5, away: 3 },
                        { label: "Fouls", home: 8, away: 11 },
                      ].map((stat, i) => (
                        <div key={i}>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span>{stat.home}</span>
                            <span className="font-medium">{stat.label}</span>
                            <span>{stat.away}</span>
                          </div>
                          <div className="flex h-2 rounded-full overflow-hidden bg-muted">
                            <div
                              className="bg-primary"
                              style={{
                                width: `${(stat.home / (stat.home + stat.away)) * 100
                                  }%`,
                              }}
                            />
                            <div
                              className="bg-secondary"
                              style={{
                                width: `${(stat.away / (stat.home + stat.away)) * 100
                                  }%`,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Related Matches */}
          <div className="p-4 border-t">
            <h2 className="font-bold mb-4">More Matches</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {relatedMatches.map((match) => (
                <Card
                  key={match.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <CardContent className="py-3 px-4">
                    <div className="flex items-center justify-between mb-2">
                      {match.status === "Live" ? (
                        <Badge className="bg-red-500 text-white text-[10px]">
                          LIVE
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px]">
                          {match.time}
                        </Badge>
                      )}
                      {match.viewers && (
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {match.viewers}
                        </span>
                      )}
                    </div>
                    <p className="font-medium text-sm">
                      {match.home} vs {match.away}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Chat Sidebar */}
        <div
          className={`lg:w-80 border-l bg-card flex flex-col ${showChat ? "block" : "hidden lg:flex"
            }`}
        >
          <div className="p-4 border-b">
            <h2 className="font-bold flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Live Chat
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              {viewerCount.toLocaleString()} people watching
            </p>
          </div>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {mockChat.map((msg) => (
                <div key={msg.id} className="flex gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {msg.user[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{msg.user}</span>
                      {msg.badge && (
                        <Badge
                          variant="secondary"
                          className="text-[10px] px-1 py-0"
                        >
                          {msg.badge}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {msg.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                placeholder="Send a message..."
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                className="text-sm"
              />
              <Button size="icon" onClick={handleSendMessage}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2 text-center">
              Be respectful in chat
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
