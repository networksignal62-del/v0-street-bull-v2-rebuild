"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
  Activity,
  Zap,
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
  const [homeTeam, setHomeTeam] = useState("HOME TEAM");
  const [awayTeam, setAwayTeam] = useState("AWAY TEAM");
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
  const [volume, setVolume] = useState([85]);
  const [viewerCount, setViewerCount] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const socket = useRef(getSocket());
  const peerRef = useRef<SimplePeer.Instance | null>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  const connectToCamera = useCallback((cameraId: string) => {
    console.log(`[Viewer] Connecting to camera ${cameraId}`);
    if (peerRef.current) peerRef.current.destroy();

    const peer = new SimplePeer({
      initiator: true,
      trickle: true,
      config: ICE_SERVERS
    });

    peerRef.current = peer;

    peer.on('signal', (signal) => {
      if (signal.type === 'offer') {
        socket.current.emit('webrtc:offer', { to: cameraId, offer: signal });
      } else {
        socket.current.emit('webrtc:ice-candidate', { to: cameraId, candidate: signal });
      }
    });

    peer.on('stream', (stream) => {
      console.log("[Viewer] Stream received");
      if (videoRef.current) videoRef.current.srcObject = stream;
    });

    peer.on('error', (err) => console.error('[Viewer] Peer error:', err));
  }, []);

  useEffect(() => {
    const s = socket.current;
    s.emit('viewer:join', { streamCode });

    s.on('match:update', ({ data }) => {
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

    s.on('active-camera-changed', ({ cameraId }) => {
      connectToCamera(cameraId);
    });

    s.on('webrtc:answer', ({ from, answer }) => {
      if (peerRef.current) peerRef.current.signal(answer);
    });

    s.on('webrtc:ice-candidate', ({ from, candidate }) => {
      if (peerRef.current) peerRef.current.signal(candidate);
    });

    s.on('viewer:count', ({ streamCode: code, count }) => {
      if (code === streamCode) setViewerCount(count);
    });

    return () => {
      s.off('match:update');
      s.off('active-camera-changed');
      s.off('webrtc:answer');
      s.off('webrtc:ice-candidate');
      s.off('viewer:count');
      if (peerRef.current) peerRef.current.destroy();
    };
  }, [streamCode, connectToCamera]);

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
    <div className="min-h-screen bg-[#050505] text-[#E0E0E0] font-sans selection:bg-blue-500/30 overflow-x-hidden">
      <div className="max-w-[1600px] mx-auto flex flex-col items-center">

        {/* --- Main Theater Section --- */}
        <div className="w-full bg-black relative flex flex-col">
          {/* Theater Header (Sticky on scroll up maybe) */}
          <div className="h-14 px-6 flex items-center justify-between border-b border-white/5 bg-black/40 backdrop-blur-md">
            <div className="flex items-center gap-4">
              <div className="h-2 w-2 rounded-full bg-red-600 animate-pulse shadow-[0_0_10px_rgba(220,38,38,0.8)]" />
              <span className="text-[10px] font-black tracking-[0.2em] italic uppercase">{isLive ? 'LIVE BROADCAST' : 'OFF AIR'}</span>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Users className="h-3 w-3 text-blue-500" />
                <span className="text-[10px] font-black tabular-nums tracking-widest uppercase">{viewerCount} LIVE FANS</span>
              </div>
              <div className="h-4 w-px bg-white/10" />
              <span className="text-[10px] font-black text-white/40 tracking-widest font-mono uppercase">{streamCode}</span>
            </div>
          </div>

          {/* Video Player Main Section */}
          <div ref={playerContainerRef} className="relative aspect-video w-full max-h-[85vh] bg-black group overflow-hidden shadow-[0_0_100px_rgba(37,99,235,0.1)]">
            <video ref={videoRef} autoPlay playsInline muted={isMuted} className="w-full h-full object-contain" />

            {/* Minimal In-Video Scoreboard (Top Left) */}
            <div className="absolute top-6 left-6 z-20 pointer-events-none origin-top-left">
              <div className="bg-black/90 backdrop-blur-3xl rounded-xl border border-white/10 shadow-3xl flex flex-col overflow-hidden min-w-[140px]">
                <div className="flex items-center justify-between px-3 py-1.5 bg-white/5 border-b border-white/5">
                  <span className="text-[11px] font-black tracking-tighter uppercase tabular-nums">{matchTime}</span>
                  <Zap className="h-2 w-2 text-blue-500 fill-blue-500" />
                </div>
                <div className="px-3 py-2 space-y-2">
                  <div className="flex items-center justify-between gap-6">
                    <div className="flex items-center gap-2">
                      {homeLogo ? <img src={homeLogo} className="h-4 w-4 rounded-full object-cover" /> : <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />}
                      <span className="text-[11px] font-black italic uppercase tracking-tighter truncate max-w-[80px]">{homeTeam}</span>
                    </div>
                    <span className="text-sm font-black text-blue-500 tabular-nums">{homeScore}</span>
                  </div>
                  <div className="flex items-center justify-between gap-6">
                    <div className="flex items-center gap-2">
                      {awayLogo ? <img src={awayLogo} className="h-4 w-4 rounded-full object-cover" /> : <div className="h-1.5 w-1.5 rounded-full bg-red-500" />}
                      <span className="text-[11px] font-black italic uppercase tracking-tighter truncate max-w-[80px]">{awayTeam}</span>
                    </div>
                    <span className="text-sm font-black text-red-500 tabular-nums">{awayScore}</span>
                  </div>
                </div>
                {addedTime > 0 && (
                  <div className="bg-red-600/10 text-red-500 text-[9px] font-black tracking-widest text-center py-1 border-t border-red-500/10 italic">
                    +{addedTime} EXTRA MIN
                  </div>
                )}
              </div>
            </div>

            {/* Controls Overlay */}
            <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black/100 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <Button variant="ghost" size="icon" className="h-12 w-12 hover:bg-white/10 text-white rounded-2xl" onClick={togglePlay}>
                    {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                  </Button>
                  <div className="flex items-center gap-4 group/vol">
                    <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-white/10 text-white rounded-xl" onClick={() => setIsMuted(!isMuted)}>
                      {isMuted || volume[0] === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                    </Button>
                    <div className="w-24 opacity-0 group-hover/vol:opacity-100 transition-all duration-300 -translate-x-2 group-hover/vol:translate-x-0">
                      <Slider value={volume} onValueChange={setVolume} max={100} className="[&_[role=slider]]:bg-blue-500" />
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-12 w-12 hover:bg-white/10 text-white rounded-2xl" onClick={toggleFullscreen}>
                  <Maximize className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Social / Match Title Bar */}
          <div className="p-8 lg:p-12 space-y-12 bg-[#0A0A0A]">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 border-b border-white/5 pb-10">
              <div className="flex items-center gap-8">
                <div className="flex -space-x-4">
                  <div className="h-20 w-20 rounded-full border-4 border-[#0A0A0A] bg-gradient-to-br from-blue-600 to-blue-900 flex items-center justify-center shadow-3xl overflow-hidden">
                    {homeLogo ? <img src={homeLogo} className="h-full w-full object-cover" /> : <span className="text-3xl font-black italic">{homeTeam[0]}</span>}
                  </div>
                  <div className="h-20 w-20 rounded-full border-4 border-[#0A0A0A] bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center shadow-3xl overflow-hidden">
                    {awayLogo ? <img src={awayLogo} className="h-full w-full object-cover" /> : <span className="text-3xl font-black italic">{awayTeam[0]}</span>}
                  </div>
                </div>
                <div className="space-y-1">
                  <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase whitespace-nowrap"><span className="text-blue-500">{homeTeam}</span> <span className="text-white/20">vs</span> <span className="text-red-500">{awayTeam}</span></h1>
                  <div className="flex items-center gap-3 text-white/30 font-black text-[10px] uppercase tracking-[0.3em] mt-2">
                    <Calendar className="h-3 w-3" /> MATCH DAY • LIVE FROM THE HUB • {viewerCount} SPECTATORS
                  </div>
                </div>
              </div>
              <Button variant="secondary" className="bg-white/5 hover:bg-blue-600 border border-white/10 text-white font-black rounded-2xl px-8 h-12 gap-3 text-[10px] uppercase tracking-widest shadow-2xl transition-all">
                <Share2 className="h-4 w-4" /> Share Stream
              </Button>
            </div>

            {/* Engagement Matrix */}
            <Tabs defaultValue="events" className="w-full">
              <TabsList className="bg-transparent border-b border-white/5 w-full justify-start h-auto p-0 gap-12">
                <TabsTrigger value="events" className="bg-transparent border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent rounded-none px-0 py-6 text-[10px] font-black uppercase tracking-[0.4em] text-white/40 data-[state=active]:text-white transition-all">Timeline</TabsTrigger>
                <TabsTrigger value="stats" className="bg-transparent border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent rounded-none px-0 py-6 text-[10px] font-black uppercase tracking-[0.4em] text-white/40 data-[state=active]:text-white transition-all">Matrix</TabsTrigger>
                <TabsTrigger value="lineup" className="bg-transparent border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent rounded-none px-0 py-6 text-[10px] font-black uppercase tracking-[0.4em] text-white/40 data-[state=active]:text-white transition-all">Squads</TabsTrigger>
              </TabsList>

              <div className="mt-12">
                <TabsContent value="events" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 space-y-6">
                      {highlights.map((h) => (
                        <div key={h.id} className="group flex items-center justify-between p-8 bg-white/5 rounded-3xl border border-white/5 hover:bg-white/[0.08] transition-all duration-300">
                          <div className="flex items-center gap-8">
                            <div className="flex flex-col items-center">
                              <span className="text-4xl font-black italic tabular-nums tracking-tighter text-blue-500">{h.time}'</span>
                              <span className="text-[8px] font-black uppercase tracking-[0.2em] opacity-40">MINS</span>
                            </div>
                            <div className="h-12 w-px bg-white/10" />
                            <div>
                              <div className="flex items-center gap-3 mb-1">
                                <Trophy className="h-4 w-4 text-yellow-500" />
                                <h4 className="text-xl font-black uppercase italic tracking-tighter">GOAL SCORER</h4>
                              </div>
                              <div className="flex items-baseline gap-3">
                                <p className="text-sm font-black uppercase tracking-[0.1em] text-white/80">{h.player}</p>
                                <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest leading-none">[{h.team}]</p>
                              </div>
                            </div>
                          </div>
                          <Activity className="h-6 w-6 text-white/10 group-hover:text-blue-500 group-hover:animate-pulse transition-all" />
                        </div>
                      ))}
                      {highlights.length === 0 && (
                        <div className="py-24 text-center border-2 border-dashed border-white/5 rounded-[3rem] opacity-20">
                          <Zap className="h-12 w-12 mx-auto mb-4" />
                          <p className="text-xs font-black uppercase tracking-[0.3em]">Gathering Match Intelligence...</p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-8">
                      <div className="bg-[#0F1115] rounded-[2.5rem] overflow-hidden border border-white/5 shadow-3xl group">
                        <div className="aspect-[4/3] bg-neutral-900 relative overflow-hidden">
                          {matchThumbnail ? <img src={matchThumbnail} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" /> : (
                            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-600/10 to-red-600/10">
                              <Activity className="h-16 w-16 text-white/5" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/100 via-black/20 to-transparent flex items-end p-8">
                            <div>
                              <div className="h-1 w-12 bg-blue-600 rounded-full mb-4" />
                              <h4 className="text-[10px] font-black uppercase text-blue-500 tracking-[0.3em] mb-2">Featured Hub</h4>
                              <p className="text-xl font-black italic uppercase tracking-tighter leading-tight">{homeTeam} v {awayTeam}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="stats" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="max-w-3xl mx-auto space-y-12 bg-white/5 p-12 rounded-[3rem] border border-white/5 shadow-2xl">
                    <div className="space-y-6">
                      <div className="flex justify-between items-end">
                        <div className="flex flex-col">
                          <span className="text-5xl font-black italic tabular-nums text-blue-500">{stats.home.possession}%</span>
                          <span className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">{homeTeam}</span>
                        </div>
                        <span className="text-xs font-black uppercase tracking-[0.4em] mb-2">Dominance Matrix</span>
                        <div className="flex flex-col items-end">
                          <span className="text-5xl font-black italic tabular-nums text-red-500">{stats.away.possession}%</span>
                          <span className="text-[10px] font-black uppercase tracking-widest opacity-40 mr-1 text-right">{awayTeam}</span>
                        </div>
                      </div>
                      <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden flex">
                        <div className="bg-blue-600 h-full transition-all duration-1000 ease-out" style={{ width: `${stats.home.possession}%` }} />
                        <div className="bg-red-600 h-full transition-all duration-1000 ease-out" style={{ width: `${stats.away.possession}%` }} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-12 pt-12 border-t border-white/5">
                      <div className="text-center space-y-2">
                        <p className="text-6xl font-black italic tabular-nums">{stats.home.shots}</p>
                        <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.3em]">Total Offense {homeTeam}</p>
                      </div>
                      <div className="text-center space-y-2">
                        <p className="text-6xl font-black italic tabular-nums">{stats.away.shots}</p>
                        <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.3em]">Total Offense {awayTeam}</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="lineup" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/5 rounded-[3rem] overflow-hidden border border-white/5">
                    <div className="p-12 space-y-8 bg-black/40">
                      <h3 className="text-2xl font-black italic uppercase tracking-tighter text-blue-500 ml-4 border-l-4 border-blue-500 pl-4">{homeTeam} Tactical</h3>
                      <p className="text-white/60 text-lg leading-relaxed whitespace-pre-wrap font-medium h-64 italic">
                        {lineup.home || "Official formation pending data feed..."}
                      </p>
                    </div>
                    <div className="p-12 space-y-8 bg-black/60">
                      <h3 className="text-2xl font-black italic uppercase tracking-tighter text-red-500 ml-4 border-l-4 border-red-500 pl-4">{awayTeam} Tactical</h3>
                      <p className="text-white/60 text-lg leading-relaxed whitespace-pre-wrap font-medium h-64 italic">
                        {lineup.away || "Official formation pending data feed..."}
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .shadow-3xl {
            box-shadow: 0 40px 100px -20px rgba(0,0,0,0.8);
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .shadow-glow {
            box-shadow: 0 0 30px rgba(37,99,235,0.1);
        }
      `}</style>
    </div>
  );
}
