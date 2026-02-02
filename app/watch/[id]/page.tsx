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
  Check,
  Disc,
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

  // Synced state from broadcaster
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

  // Player state
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState([85]);
  const [viewerCount, setViewerCount] = useState(0);
  const [copied, setCopied] = useState(false);

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const socket = useRef(getSocket());
  const peerRef = useRef<SimplePeer.Instance | null>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  const connectToCamera = useCallback((cameraId: string) => {
    console.log(`[Viewer] Target Camera: ${cameraId}`);
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
      } else if (signal.candidate) {
        socket.current.emit('webrtc:ice-candidate', { to: cameraId, candidate: signal });
      }
    });

    peer.on('stream', (stream) => {
      console.log("[Viewer] Received broadcast stream");
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => { });
      }
    });

    peer.on('error', (err) => console.error('[Viewer] Peer error:', err));
  }, []);

  useEffect(() => {
    const s = socket.current;
    s.emit('viewer:join', { streamCode });

    const handleUpdate = ({ data }: any) => {
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
    };

    const handleCamera = ({ cameraId }: any) => connectToCamera(cameraId);

    const handleAnswer = ({ from, answer }: any) => {
      if (peerRef.current) peerRef.current.signal(answer);
    };

    const handleCandidate = ({ from, candidate }: any) => {
      if (peerRef.current) peerRef.current.signal(candidate);
    };

    const handleCount = ({ streamCode: code, count }: any) => {
      if (code === streamCode) setViewerCount(count);
    };

    s.on('match:update', handleUpdate);
    s.on('active-camera-changed', handleCamera);
    s.on('webrtc:answer', handleAnswer);
    s.on('webrtc:ice-candidate', handleCandidate);
    s.on('viewer:count', handleCount);

    return () => {
      s.off('match:update', handleUpdate);
      s.off('active-camera-changed', handleCamera);
      s.off('webrtc:answer', handleAnswer);
      s.off('webrtc:ice-candidate', handleCandidate);
      s.off('viewer:count', handleCount);
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

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    if (navigator.share) {
      navigator.share({ title: `Watching ${homeTeam} vs ${awayTeam}`, url });
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#E0E0E0] font-sans selection:bg-blue-500/30 overflow-x-hidden font-display">
      <div className="max-w-[1600px] mx-auto flex flex-col items-center">

        {/* PLAYER THEATER */}
        <div className="w-full bg-black relative flex flex-col">
          <div className="h-14 px-6 flex items-center justify-between border-b border-white/5 bg-black/40 backdrop-blur-md">
            <div className="flex items-center gap-4">
              <div className={`h-2 w-2 rounded-full ${isLive ? 'bg-red-600 animate-pulse shadow-[0_0_10px_rgba(220,38,38,0.8)]' : 'bg-white/20'}`} />
              <span className="text-[10px] font-black tracking-[0.2em] italic uppercase">{isLive ? 'LIVE TRANSMISSION' : 'OFF AIR'}</span>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Users className="h-3.5 w-3.5 text-blue-500" />
                <span className="text-[10px] font-black tabular-nums tracking-widest uppercase">{viewerCount} LIVE</span>
              </div>
              <div className="h-4 w-px bg-white/10" />
              <span className="text-[10px] font-black text-white/40 tracking-widest font-mono">{streamCode}</span>
            </div>
          </div>

          <div ref={playerContainerRef} className="relative aspect-video w-full max-h-[85vh] bg-[#0A0A0A] group overflow-hidden shadow-2xl">
            <video ref={videoRef} autoPlay playsInline muted={isMuted} className="w-full h-full object-contain" />

            {/* SCORE OVERLAY */}
            <div className="absolute top-6 left-6 z-20 pointer-events-none scale-100 sm:scale-125 origin-top-left">
              <div className="bg-black/80 backdrop-blur-3xl rounded-xl border border-white/10 shadow-3xl flex flex-col overflow-hidden min-w-[150px]">
                <div className="flex items-center justify-center px-3 py-1.5 bg-white/5 border-b border-white/5">
                  <span className="text-[11px] font-black tracking-tight tabular-nums uppercase">{matchTime}</span>
                </div>
                <div className="px-4 py-3 space-y-2">
                  <div className="flex items-center justify-between gap-6">
                    <div className="flex items-center gap-2">
                      {homeLogo ? <img src={homeLogo} className="h-5 w-5 rounded-full object-cover" /> : <div className="h-2 w-2 rounded-full bg-blue-500" />}
                      <span className="text-[11px] font-black italic uppercase tracking-tighter truncate max-w-[90px]">{homeTeam}</span>
                    </div>
                    <span className="text-sm font-black text-blue-500 tabular-nums">{homeScore}</span>
                  </div>
                  <div className="flex items-center justify-between gap-6">
                    <div className="flex items-center gap-2">
                      {awayLogo ? <img src={awayLogo} className="h-5 w-5 rounded-full object-cover" /> : <div className="h-2 w-2 rounded-full bg-red-500" />}
                      <span className="text-[11px] font-black italic uppercase tracking-tighter truncate max-w-[90px]">{awayTeam}</span>
                    </div>
                    <span className="text-sm font-black text-red-500 tabular-nums">{awayScore}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* PLAYER CONTROLS */}
            <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black/100 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <Button variant="ghost" size="icon" className="h-12 w-12 hover:bg-white/10 text-white rounded-2xl" onClick={togglePlay}>
                    {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                  </Button>
                  <div className="flex items-center gap-4 group/vol">
                    <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-white/10 text-white rounded-xl" onClick={() => setIsMuted(!isMuted)}>
                      {isMuted || volume[0] === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                    </Button>
                    <div className="w-24">
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

          {/* SOCIAL & INFO */}
          <div className="p-8 lg:p-12 space-y-12 bg-[#0A0A0A]">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 border-b border-white/5 pb-10">
              <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
                <div className="flex -space-x-4">
                  <div className="h-24 w-24 rounded-full border-4 border-[#0A0A0A] bg-blue-600 flex items-center justify-center shadow-2xl overflow-hidden">
                    {homeLogo ? <img src={homeLogo} className="h-full w-full object-cover" /> : <span className="text-4xl font-black italic">{homeTeam[0]}</span>}
                  </div>
                  <div className="h-24 w-24 rounded-full border-4 border-[#0A0A0A] bg-red-600 flex items-center justify-center shadow-2xl overflow-hidden">
                    {awayLogo ? <img src={awayLogo} className="h-full w-full object-cover" /> : <span className="text-4xl font-black italic">{awayTeam[0]}</span>}
                  </div>
                </div>
                <div className="space-y-1">
                  <h1 className="text-4xl md:text-7xl font-black italic tracking-tighter uppercase whitespace-normal"><span className="text-blue-500">{homeTeam}</span> <span className="text-white/20 px-2">v</span> <span className="text-red-500">{awayTeam}</span></h1>
                  <div className="flex items-center justify-center md:justify-start gap-4 text-white/30 font-black text-[10px] uppercase tracking-[0.3em] font-sans mt-3">
                    <Calendar className="h-3.5 w-3.5" /> <span>LIVE FROM PRODUCTION HUB</span>
                  </div>
                </div>
              </div>
              <Button
                variant="secondary"
                onClick={handleShare}
                className="bg-white/5 hover:bg-blue-600 border border-white/10 text-white font-black rounded-2xl px-10 h-14 gap-3 text-xs uppercase tracking-widest transition-all"
              >
                {copied ? <Check className="h-5 w-5 text-green-500" /> : <Share2 className="h-5 w-5" />}
                {copied ? 'LINK COPIED' : 'SHARE STREAM'}
              </Button>
            </div>

            {/* MATCH DATA */}
            <Tabs defaultValue="events" className="w-full">
              <TabsList className="bg-transparent border-b border-white/5 w-full justify-start h-auto p-0 gap-12 rounded-none">
                <TabsTrigger value="events" className="bg-transparent border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent rounded-none px-0 py-6 text-[11px] font-black uppercase tracking-[0.3em] text-white/40 data-[state=active]:text-white">Timeline</TabsTrigger>
                <TabsTrigger value="stats" className="bg-transparent border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent rounded-none px-0 py-6 text-[11px] font-black uppercase tracking-[0.3em] text-white/40 data-[state=active]:text-white">Matrix</TabsTrigger>
                <TabsTrigger value="lineup" className="bg-transparent border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent rounded-none px-0 py-6 text-[11px] font-black uppercase tracking-[0.3em] text-white/40 data-[state=active]:text-white">Squads</TabsTrigger>
              </TabsList>

              <div className="mt-12">
                <TabsContent value="events" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 space-y-4">
                      {highlights.map((h) => (
                        <div key={h.id} className="flex items-center justify-between p-8 bg-white/2 rounded-[2rem] border border-white/5">
                          <div className="flex items-center gap-8">
                            <div className="flex flex-col items-center min-w-[60px]">
                              <span className="text-4xl font-black italic tabular-nums tracking-tighter text-blue-500">{h.time}'</span>
                            </div>
                            <div className="h-10 w-px bg-white/10" />
                            <div>
                              <div className="flex items-center gap-3 mb-1">
                                <Trophy className="h-4 w-4 text-yellow-500" />
                                <h4 className="text-xs font-black uppercase tracking-widest text-white/40">MARCH HIGHLIGHT</h4>
                              </div>
                              <p className="text-2xl font-black uppercase italic tracking-tighter">{h.player}</p>
                              <span className="text-[10px] uppercase font-bold text-blue-400 opacity-60 tracking-widest">{h.team} • {h.type}</span>
                            </div>
                          </div>
                          <Disc className="h-8 w-8 text-white/5" />
                        </div>
                      ))}
                      {highlights.length === 0 && (
                        <div className="py-24 text-center border-2 border-dashed border-white/5 rounded-[3rem] opacity-20">
                          <p className="text-[11px] font-black uppercase tracking-[0.3em]">Official data pending kickoff...</p>
                        </div>
                      )}
                    </div>

                    <div className="hidden lg:block">
                      <div className="bg-[#0F1115] rounded-[2.5rem] overflow-hidden border border-white/5 p-2">
                        <div className="aspect-[4/3] bg-neutral-900 rounded-[2rem] relative overflow-hidden">
                          {matchThumbnail ? <img src={matchThumbnail} className="h-full w-full object-cover" /> : (
                            <div className="absolute inset-0 flex items-center justify-center bg-blue-600/5">
                              <Activity className="h-12 w-12 text-white/10 animate-pulse" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent flex items-end p-8">
                            <p className="text-lg font-black italic uppercase tracking-tighter">{homeTeam} v {awayTeam}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="stats" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="max-w-4xl mx-auto space-y-16 bg-white/2 p-12 rounded-[3.5rem] border border-white/5">
                    <div className="space-y-8">
                      <div className="flex justify-between items-end">
                        <div className="flex flex-col">
                          <span className="text-7xl font-black italic tabular-nums text-blue-500">{stats.home.possession}%</span>
                          <span className="text-[10px] font-black uppercase tracking-widest opacity-30 mt-2">{homeTeam}</span>
                        </div>
                        <div className="flex flex-col items-center pb-4">
                          <Zap className="h-6 w-6 text-yellow-500 mb-2" />
                          <span className="text-[11px] font-black uppercase tracking-[0.5em] text-white/20">POSSESSION</span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-7xl font-black italic tabular-nums text-red-500">{stats.away.possession}%</span>
                          <span className="text-[10px] font-black uppercase tracking-widest opacity-30 mt-2 text-right">{awayTeam}</span>
                        </div>
                      </div>
                      <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden flex">
                        <div className="bg-blue-600 h-full transition-all duration-1000" style={{ width: `${stats.home.possession}%` }} />
                        <div className="bg-red-600 h-full transition-all duration-1000" style={{ width: `${stats.away.possession}%` }} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-12 pt-16 border-t border-white/5">
                      <div className="text-center">
                        <p className="text-7xl font-black italic tabular-nums">{stats.home.shots}</p>
                        <p className="text-[10px] text-white/20 font-black uppercase tracking-widest mt-2">{homeTeam} TOTAL SHOTS</p>
                      </div>
                      <div className="text-center">
                        <p className="text-7xl font-black italic tabular-nums">{stats.away.shots}</p>
                        <p className="text-[10px] text-white/20 font-black uppercase tracking-widest mt-2">{awayTeam} TOTAL SHOTS</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="lineup" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/5 rounded-[3rem] overflow-hidden border border-white/5">
                    <div className="p-12 space-y-8 bg-black/40">
                      <h3 className="text-3xl font-black italic uppercase text-blue-500">{homeTeam} SQUAD</h3>
                      <p className="text-white/60 text-lg leading-relaxed whitespace-pre-wrap font-medium italic">
                        {lineup.home || "Official formation pending data feed..."}
                      </p>
                    </div>
                    <div className="p-12 space-y-8 bg-black/60">
                      <h3 className="text-3xl font-black italic uppercase text-red-500">{awayTeam} SQUAD</h3>
                      <p className="text-white/60 text-lg leading-relaxed whitespace-pre-wrap font-medium italic">
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
        .shadow-3xl { box-shadow: 0 40px 100px -20px rgba(0,0,0,0.8); }
        .font-display { font-family: var(--font-display), 'Poppins', sans-serif; }
      `}</style>
    </div>
  );
}
