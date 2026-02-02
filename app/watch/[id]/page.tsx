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
  Maximize,
  Users,
  Share2,
  Trophy,
  Users2,
  BarChart3,
  Calendar,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

export default function WatchPage() {
  const params = useParams();
  const streamCode = params?.id as string;

  // Synced State
  const [isLive, setIsLive] = useState(false);
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [homeTeam, setHomeTeam] = useState("Home Team");
  const [awayTeam, setAwayTeam] = useState("Away Team");
  const [homeLogo, setHomeLogo] = useState("");
  const [awayLogo, setAwayLogo] = useState("");
  const [matchThumbnail, setMatchThumbnail] = useState("");
  const [matchTime, setMatchTime] = useState("00:00");
  const [addedTime, setAddedTime] = useState(0);
  const [highlights, setHighlights] = useState<any[]>([]);
  const [lineup, setLineup] = useState({ home: "", away: "" });
  const [stats, setStats] = useState({ home: { shots: 0, possession: 50 }, away: { shots: 0, possession: 50 } });

  // Player State
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState([80]);
  const [viewerCount, setViewerCount] = useState(0);

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
      setHomeLogo(data.homeLogo || "");
      setAwayLogo(data.awayLogo || "");
      setMatchThumbnail(data.matchThumbnail || "");
      setAddedTime(data.addedTime || 0);
      setIsLive(data.isLive);
      setHighlights(data.highlights || []);
      setLineup(data.lineup || { home: "", away: "" });
      setStats(data.stats || { home: { shots: 0, possession: 50 }, away: { shots: 0, possession: 50 } });
    });

    socket.current.on('active-camera-changed', ({ cameraId }) => {
      connectToCamera(cameraId);
    });

    socket.current.on('viewer:count', ({ streamCode: code, count }) => {
      if (code === streamCode) setViewerCount(count);
    });

    return () => {
      socket.current.off('match:update');
      socket.current.off('active-camera-changed');
      socket.current.off('viewer:count');
      if (peerRef.current) peerRef.current.destroy();
    };
  }, [streamCode]);

  const connectToCamera = (cameraId: string) => {
    if (peerRef.current) peerRef.current.destroy();
    const peer = new SimplePeer({ initiator: true, trickle: true, config: ICE_SERVERS });
    peerRef.current = peer;
    peer.on('signal', (signal) => socket.current.emit('webrtc:offer', { to: cameraId, offer: signal }));
    peer.on('stream', (stream) => { if (videoRef.current) videoRef.current.srcObject = stream; });
    peer.on('error', (err) => console.error('Peer error:', err));

    socket.current.on('webrtc:answer', ({ from, answer }) => {
      if (from === cameraId && peerRef.current) peerRef.current.signal(answer);
    });
    socket.current.on('webrtc:ice-candidate', ({ from, candidate }) => {
      if (from === cameraId && peerRef.current) peerRef.current.signal(candidate);
    });
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const toggleFullscreen = () => {
    if (playerContainerRef.current) {
      if (!document.fullscreenElement) playerContainerRef.current.requestFullscreen();
      else document.exitFullscreen();
    }
  };

  return (
    <div className="min-h-screen bg-[#0F1115] text-white">
      <div className="max-w-[1920px] mx-auto flex flex-col lg:flex-row">

        {/* Main Video & Content Section */}
        <div className="flex-1 flex flex-col min-h-0 bg-[#0A0A0B]">
          {/* Video Player */}
          <div ref={playerContainerRef} className="relative aspect-video bg-black group overflow-hidden shadow-2xl">
            <video ref={videoRef} autoPlay playsInline muted={isMuted} className="w-full h-full object-contain" />

            {/* Small Top-Left Scoreboard */}
            <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 pointer-events-none">
              <div className="bg-black/80 backdrop-blur-md rounded-md overflow-hidden border border-white/10 shadow-lg flex flex-col min-w-[120px]">
                <div className="flex items-center justify-between px-2 py-1 bg-white/5 border-b border-white/5">
                  <span className="text-[10px] font-black tracking-tighter uppercase tabular-nums">{matchTime}</span>
                  {isLive && <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />}
                </div>
                <div className="px-2 py-1.5 space-y-1">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-1.5">
                      {homeLogo ? <img src={homeLogo} className="h-3.5 w-3.5 rounded-full object-cover" /> : <div className="h-3.5 w-3.5 rounded-full bg-blue-500/20" />}
                      <span className="text-[10px] font-bold uppercase truncate max-w-[60px]">{homeTeam}</span>
                    </div>
                    <span className="text-sm font-black text-primary">{homeScore}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-1.5">
                      {awayLogo ? <img src={awayLogo} className="h-3.5 w-3.5 rounded-full object-cover" /> : <div className="h-3.5 w-3.5 rounded-full bg-red-500/20" />}
                      <span className="text-[10px] font-bold uppercase truncate max-w-[60px]">{awayTeam}</span>
                    </div>
                    <span className="text-sm font-black text-primary">{awayScore}</span>
                  </div>
                </div>
                {addedTime > 0 && (
                  <div className="bg-red-600/20 text-red-500 text-[8px] font-black text-center py-0.5 border-t border-red-500/20">
                    +{addedTime} MIN ADDED
                  </div>
                )}
              </div>
              <Badge variant="secondary" className="w-fit bg-black/40 text-[9px] backdrop-blur-sm border-none flex items-center gap-1 py-0.5 px-2">
                <Users className="h-2.5 w-2.5" /> {viewerCount} Fans
              </Badge>
            </div>

            {/* Controls Overlay */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10 text-white rounded-full" onClick={togglePlay}>
                    {isPlaying ? <Pause /> : <Play />}
                  </Button>
                  <div className="flex items-center gap-2 group/vol">
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10 text-white rounded-full" onClick={() => setIsMuted(!isMuted)}>
                      {isMuted || volume[0] === 0 ? <VolumeX /> : <Volume2 />}
                    </Button>
                    <Slider value={volume} onValueChange={setVolume} max={100} className="w-24 opacity-0 group-hover/vol:opacity-100 transition-opacity" />
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10 text-white rounded-full" onClick={toggleFullscreen}>
                  <Maximize className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Engagement Tabs Below Video */}
          <div className="p-4 md:p-8 space-y-8 bg-[#0F1115]">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/5 pb-8">
              <div className="flex items-center gap-6">
                <div className="flex -space-x-3">
                  <div className="h-14 w-14 rounded-full border-4 border-[#0F1115] bg-blue-600 flex items-center justify-center shadow-2xl overflow-hidden">
                    {homeLogo ? <img src={homeLogo} className="h-full w-full object-cover" /> : <span className="text-xl font-black">{homeTeam[0]}</span>}
                  </div>
                  <div className="h-14 w-14 rounded-full border-4 border-[#0F1115] bg-red-600 flex items-center justify-center shadow-2xl overflow-hidden">
                    {awayLogo ? <img src={awayLogo} className="h-full w-full object-cover" /> : <span className="text-xl font-black">{awayTeam[0]}</span>}
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl md:text-4xl font-black italic tracking-tighter uppercase">{homeTeam} VS {awayTeam}</h1>
                  <div className="flex items-center gap-3 text-neutral-500 font-bold text-xs uppercase tracking-widest mt-1">
                    <Calendar className="h-3 w-3" /> Live Stream • 12.0k Registered Fans
                  </div>
                </div>
              </div>
              <Button variant="secondary" className="bg-white/10 hover:bg-white/20 text-white font-bold rounded-full px-6 h-12 gap-2 text-xs uppercase">
                <Share2 className="h-4 w-4" /> Share Hub
              </Button>
            </div>

            <Tabs defaultValue="stats" className="w-full">
              <TabsList className="bg-transparent border-b border-white/5 w-full justify-start h-auto p-0 gap-8">
                <TabsTrigger value="stats" className="bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-0 py-4 text-xs font-black uppercase tracking-widest opacity-40 data-[state=active]:opacity-100 transition-all">Match Stats</TabsTrigger>
                <TabsTrigger value="lineup" className="bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-0 py-4 text-xs font-black uppercase tracking-widest opacity-40 data-[state=active]:opacity-100 transition-all">Lineups</TabsTrigger>
                <TabsTrigger value="events" className="bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-0 py-4 text-xs font-black uppercase tracking-widest opacity-40 data-[state=active]:opacity-100 transition-all">Match Events</TabsTrigger>
              </TabsList>

              <div className="mt-8">
                <TabsContent value="stats" className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6 bg-white/5 p-6 rounded-2xl border border-white/5">
                      <h3 className="text-xs font-black uppercase tracking-widest text-primary">Game Dominance</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between text-xs font-bold uppercase mb-1">
                          <span>{homeTeam} ({stats.home.possession}%)</span>
                          <span>POSSESSION</span>
                          <span>{awayTeam} ({stats.away.possession}%)</span>
                        </div>
                        <div className="flex h-2 w-full bg-white/5 rounded-full overflow-hidden">
                          <div className="bg-blue-600 h-full transition-all duration-1000" style={{ width: `${stats.home.possession}%` }} />
                          <div className="bg-red-600 h-full transition-all duration-1000" style={{ width: `${stats.away.possession}%` }} />
                        </div>
                      </div>
                      <div className="flex justify-between pt-4 border-t border-white/5">
                        <div className="text-center">
                          <p className="text-2xl font-black">{stats.home.shots}</p>
                          <p className="text-[10px] text-neutral-500 font-bold uppercase">Total Shots</p>
                        </div>
                        <div className="h-10 w-px bg-white/10" />
                        <div className="text-center">
                          <p className="text-2xl font-black">{stats.away.shots}</p>
                          <p className="text-[10px] text-neutral-500 font-bold uppercase">Total Shots</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="lineup" className="animate-in fade-in slide-in-from-bottom-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12 p-8 bg-white/5 rounded-3xl border border-white/5">
                    <div className="space-y-4">
                      <h3 className="text-xl font-black italic uppercase tracking-tighter text-blue-500">{homeTeam} Squad</h3>
                      <p className="text-neutral-400 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                        {lineup.home || "Official lineup pending release..."}
                      </p>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-xl font-black italic uppercase tracking-tighter text-red-500">{awayTeam} Squad</h3>
                      <p className="text-neutral-400 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                        {lineup.away || "Official lineup pending release..."}
                      </p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="events" className="animate-in fade-in slide-in-from-bottom-2">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-4">
                      {highlights.map((h, i) => (
                        <div key={h.id} className="group flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/[0.08] transition-all">
                          <div className="flex items-center gap-6">
                            <div className="flex flex-col items-center">
                              <span className="text-3xl font-black tabular-nums">{h.time}'</span>
                              <span className="text-[8px] font-black uppercase text-primary tracking-widest mt-0.5">MINS</span>
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <Trophy className="h-4 w-4 text-yellow-500" />
                                <h4 className="text-lg font-black uppercase italic tracking-tighter">GOAL SCORER</h4>
                              </div>
                              <p className="text-sm font-bold text-neutral-400 uppercase tracking-widest">{h.player} • {h.team}</p>
                            </div>
                          </div>
                          <ChevronRight className="h-6 w-6 text-white/20 group-hover:text-white/60 transition-colors" />
                        </div>
                      ))}
                      {highlights.length === 0 && (
                        <div className="py-12 text-center text-neutral-500 border-2 border-dashed border-white/5 rounded-3xl">
                          <p className="text-sm font-bold uppercase">Waiting for match data...</p>
                        </div>
                      )}
                    </div>

                    {/* Match Thumbnail/Card */}
                    <div className="space-y-6">
                      <div className="bg-[#1A1C1F] rounded-3xl overflow-hidden border border-white/10 shadow-3xl">
                        <div className="aspect-[4/3] bg-neutral-800 relative">
                          {matchThumbnail ? <img src={matchThumbnail} className="h-full w-full object-cover" /> : (
                            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-600/20 to-red-600/20">
                              <Users2 className="h-12 w-12 text-white/10" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6">
                            <div>
                              <h4 className="text-xs font-black uppercase text-primary tracking-widest mb-1">Match of the Day</h4>
                              <p className="text-sm font-bold">{homeTeam} vs {awayTeam}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Archivy&display=swap');
        
        .shadow-3xl {
            box-shadow: 0 40px 80px -20px rgba(0,0,0,0.8);
        }
      `}</style>
    </div>
  );
}
