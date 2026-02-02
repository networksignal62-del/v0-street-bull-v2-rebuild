"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import SimplePeer from "simple-peer";
import { getSocket } from "@/lib/socket";
import { ICE_SERVERS } from "@/lib/webrtc";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Settings,
  Maximize,
  MessageSquare,
  Users,
  Share2,
  Clock,
  ChevronRight,
  ChevronLeft,
  X,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function WatchPage() {
  const params = useParams();
  const streamCode = params?.id as string;
  const [isLive, setIsLive] = useState(false);
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [homeTeam, setHomeTeam] = useState("Home Team");
  const [awayTeam, setAwayTeam] = useState("Away Team");
  const [matchTime, setMatchTime] = useState("00:00");
  const [addedTime, setAddedTime] = useState(0);

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState([80]);
  const [quality, setQuality] = useState("720p");
  const [showChat, setShowChat] = useState(true);
  const [chatMessage, setChatMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [viewerCount, setViewerCount] = useState(120);

  const videoRef = useRef<HTMLVideoElement>(null);
  const socket = useRef(getSocket());
  const peerRef = useRef<SimplePeer.Instance | null>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    socket.current.emit('viewer:join', { streamCode });

    socket.current.on('match:update', ({ data }) => {
      setHomeScore(data.homeScore);
      setAwayScore(data.awayScore);
      setMatchTime(data.matchTime);
      setHomeTeam(data.homeTeam);
      setAwayTeam(data.awayTeam);
      setAddedTime(data.addedTime || 0);
      setIsLive(data.isLive);
    });

    socket.current.on('active-camera-changed', ({ cameraId }) => {
      console.log('Active camera changed to:', cameraId);
      connectToCamera(cameraId);
    });

    socket.current.on('chat:message', (msg) => {
      setMessages(prev => [...prev.slice(-49), msg]);
    });

    return () => {
      socket.current.off('match:update');
      socket.current.off('active-camera-changed');
      socket.current.off('chat:message');
      if (peerRef.current) peerRef.current.destroy();
    };
  }, [streamCode]);

  const connectToCamera = (cameraId: string) => {
    if (peerRef.current) peerRef.current.destroy();

    const peer = new SimplePeer({
      initiator: true,
      trickle: true,
      config: ICE_SERVERS,
    });

    peerRef.current = peer;

    peer.on('signal', (signal) => {
      socket.current.emit('webrtc:offer', { to: cameraId, offer: signal });
    });

    peer.on('stream', (stream) => {
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    });

    peer.on('error', (err) => console.error('Peer error:', err));

    socket.current.on('webrtc:answer', ({ from, answer }) => {
      if (from === cameraId && peerRef.current) {
        peerRef.current.signal(answer);
      }
    });

    socket.current.on('webrtc:ice-candidate', ({ from, candidate }) => {
      if (from === cameraId && peerRef.current) {
        peerRef.current.signal(candidate);
      }
    });
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;
    socket.current.emit('chat:message', {
      streamCode,
      username: 'Fan-' + Math.floor(Math.random() * 9000 + 1000),
      message: chatMessage
    });
    setChatMessage("");
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Street Bull Live Stream',
          text: `Watch ${homeTeam} vs ${awayTeam} live!`,
          url: window.location.href,
        });
      } catch (err) { console.log(err); }
    }
  };

  const toggleFullscreen = () => {
    if (playerContainerRef.current) {
      if (!document.fullscreenElement) {
        playerContainerRef.current.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col sm:flex-row">
      <div className={`flex-1 flex flex-col min-h-0 ${showChat ? 'w-full sm:w-[70%]' : 'w-full'}`}>
        <div ref={playerContainerRef} className="relative aspect-video bg-black group overflow-hidden">
          <video ref={videoRef} autoPlay playsInline muted={isMuted} className="w-full h-full object-contain" />

          <div className="absolute top-4 left-4 z-10 flex gap-2">
            {isLive ? (
              <Badge className="bg-red-600 animate-pulse text-xs font-bold uppercase tracking-wider px-2 border-none">Live</Badge>
            ) : (
              <Badge variant="secondary" className="bg-white/20 text-white border-none text-xs backdrop-blur-md">Offline</Badge>
            )}
            <Badge variant="secondary" className="bg-black/40 text-xs backdrop-blur-sm border-none flex items-center gap-1">
              <Users className="h-3 w-3" /> {viewerCount}
            </Badge>
          </div>

          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="hover:bg-white/20 text-white" onClick={togglePlay}>
                  {isPlaying ? <Pause /> : <Play />}
                </Button>
                <div className="flex items-center gap-2 group/vol">
                  <Button variant="ghost" size="icon" className="hover:bg-white/20 text-white" onClick={() => setIsMuted(!isMuted)}>
                    {isMuted || volume[0] === 0 ? <VolumeX /> : <Volume2 />}
                  </Button>
                  <div className="w-0 group-hover/vol:w-24 overflow-hidden transition-all">
                    <Slider value={volume} onValueChange={setVolume} max={100} className="w-24" />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="hover:bg-white/20 text-white text-xs">{quality}</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-black/90 border-white/10 text-white">
                    <DropdownMenuItem onClick={() => setQuality("1080p")}>1080p</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setQuality("720p")}>720p</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setQuality("480p")}>480p</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button variant="ghost" size="icon" className="hover:bg-white/20 text-white" onClick={toggleFullscreen}>
                  <Maximize className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
            <div className="space-y-1">
              <h1 className="text-lg sm:text-2xl font-bold">{homeTeam} vs {awayTeam}</h1>
              <p className="text-sm text-neutral-400">Started {matchTime === "00:00" ? "just now" : matchTime + " ago"}</p>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={handleShare} variant="secondary" className="bg-white/10 hover:bg-white/20 text-white border-none text-xs">
                <Share2 className="h-4 w-4 mr-2" /> Share
              </Button>
              <Button onClick={() => setShowChat(!showChat)} variant="secondary" className="bg-white/10 hover:bg-white/20 text-white border-none text-xs sm:hidden">
                <MessageSquare className="h-4 w-4 mr-2" /> Chat
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="bg-[#1A1A1A] border-none p-4 text-center">
              <p className="text-xs text-neutral-500 mb-1">Score</p>
              <p className="text-2xl font-black">{homeScore} - {awayScore}</p>
            </Card>
            <Card className="bg-[#1A1A1A] border-none p-4 text-center">
              <p className="text-xs text-neutral-500 mb-1">Time</p>
              <p className="text-2xl font-black">{matchTime}{addedTime > 0 && <span className="text-sm text-red-500">+{addedTime}</span>}</p>
            </Card>
          </div>
        </div>
      </div>

      {showChat && (
        <div className="w-full sm:w-[30%] border-l border-white/10 flex flex-col bg-[#0F0F0F] h-[50vh] sm:h-auto">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h2 className="font-bold flex items-center gap-2 tracking-tight">
              <MessageSquare className="h-4 w-4 text-primary" /> Live Chat
            </h2>
            <Button variant="ghost" size="icon" className="sm:hidden" onClick={() => setShowChat(false)}><X /></Button>
          </div>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((m, i) => (
                <div key={i} className="flex gap-3">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="bg-primary/20 text-primary text-[10px] uppercase">{m.user[0]}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-neutral-400">{m.user}</p>
                    <p className="text-sm leading-relaxed text-neutral-200">{m.message}</p>
                  </div>
                </div>
              ))}
              {messages.length === 0 && (
                <div className="h-32 flex items-center justify-center text-neutral-600 text-sm">No messages yet. Start the conversation!</div>
              )}
            </div>
          </ScrollArea>

          <div className="p-4 border-t border-white/10 bg-[#0A0A0A]">
            <div className="relative">
              <Input
                value={chatMessage}
                onChange={e => setChatMessage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                placeholder="Send a message..."
                className="pr-12 bg-[#1A1A1A] border-none text-sm h-11 focus-visible:ring-1 ring-primary"
              />
              <Button size="icon" variant="ghost" className="absolute right-1 top-1 h-9 w-9 text-primary hover:bg-primary/10" onClick={handleSendMessage}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-xl ${className}`}>{children}</div>;
}
