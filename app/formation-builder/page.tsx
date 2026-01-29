"use client";

import React from "react"

import { useState, useCallback, useRef, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  RotateCcw,
  Download,
  Save,
  Undo,
  Redo,
  Trash2,
  Move,
  Play,
  Plus,
  X,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpLeft,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowDownRight,
  Circle,
  Video,
} from "lucide-react";

// Formation presets
const formations: Record<
  string,
  { name: string; positions: { x: number; y: number; role: string }[] }
> = {
  "4-3-3": {
    name: "4-3-3",
    positions: [
      { x: 50, y: 90, role: "GK" },
      { x: 20, y: 70, role: "DEF" },
      { x: 40, y: 70, role: "DEF" },
      { x: 60, y: 70, role: "DEF" },
      { x: 80, y: 70, role: "DEF" },
      { x: 30, y: 45, role: "MID" },
      { x: 50, y: 45, role: "MID" },
      { x: 70, y: 45, role: "MID" },
      { x: 20, y: 20, role: "FWD" },
      { x: 50, y: 15, role: "FWD" },
      { x: 80, y: 20, role: "FWD" },
    ],
  },
  "4-4-2": {
    name: "4-4-2",
    positions: [
      { x: 50, y: 90, role: "GK" },
      { x: 20, y: 70, role: "DEF" },
      { x: 40, y: 70, role: "DEF" },
      { x: 60, y: 70, role: "DEF" },
      { x: 80, y: 70, role: "DEF" },
      { x: 20, y: 45, role: "MID" },
      { x: 40, y: 45, role: "MID" },
      { x: 60, y: 45, role: "MID" },
      { x: 80, y: 45, role: "MID" },
      { x: 35, y: 20, role: "FWD" },
      { x: 65, y: 20, role: "FWD" },
    ],
  },
  "3-5-2": {
    name: "3-5-2",
    positions: [
      { x: 50, y: 90, role: "GK" },
      { x: 30, y: 70, role: "DEF" },
      { x: 50, y: 70, role: "DEF" },
      { x: 70, y: 70, role: "DEF" },
      { x: 15, y: 45, role: "MID" },
      { x: 35, y: 50, role: "MID" },
      { x: 50, y: 45, role: "MID" },
      { x: 65, y: 50, role: "MID" },
      { x: 85, y: 45, role: "MID" },
      { x: 35, y: 20, role: "FWD" },
      { x: 65, y: 20, role: "FWD" },
    ],
  },
  "4-2-3-1": {
    name: "4-2-3-1",
    positions: [
      { x: 50, y: 90, role: "GK" },
      { x: 20, y: 70, role: "DEF" },
      { x: 40, y: 70, role: "DEF" },
      { x: 60, y: 70, role: "DEF" },
      { x: 80, y: 70, role: "DEF" },
      { x: 35, y: 55, role: "MID" },
      { x: 65, y: 55, role: "MID" },
      { x: 20, y: 35, role: "MID" },
      { x: 50, y: 30, role: "MID" },
      { x: 80, y: 35, role: "MID" },
      { x: 50, y: 15, role: "FWD" },
    ],
  },
  "5-3-2": {
    name: "5-3-2",
    positions: [
      { x: 50, y: 90, role: "GK" },
      { x: 10, y: 65, role: "DEF" },
      { x: 30, y: 70, role: "DEF" },
      { x: 50, y: 70, role: "DEF" },
      { x: 70, y: 70, role: "DEF" },
      { x: 90, y: 65, role: "DEF" },
      { x: 30, y: 45, role: "MID" },
      { x: 50, y: 45, role: "MID" },
      { x: 70, y: 45, role: "MID" },
      { x: 35, y: 20, role: "FWD" },
      { x: 65, y: 20, role: "FWD" },
    ],
  },
};

type MovementDirection =
  | "stay"
  | "forward"
  | "back"
  | "left"
  | "right"
  | "forward-left"
  | "forward-right"
  | "back-left"
  | "back-right";

interface PassingRoute {
  targetPlayerId: number;
  type: "short" | "long" | "through";
}

interface PlayerPosition {
  id: number;
  x: number;
  y: number;
  role: string;
  name?: string;
  movement: MovementDirection;
  passingRoutes: PassingRoute[];
  videoUrl?: string;
}

const roleColors: Record<string, { bg: string; border: string }> = {
  GK: { bg: "bg-yellow-500", border: "border-yellow-400" },
  DEF: { bg: "bg-blue-500", border: "border-blue-400" },
  MID: { bg: "bg-green-500", border: "border-green-400" },
  FWD: { bg: "bg-[#FF5722]", border: "border-orange-400" },
};

const movementIcons: Record<MovementDirection, React.ReactNode> = {
  stay: <Circle className="h-4 w-4" />,
  forward: <ArrowUp className="h-4 w-4" />,
  back: <ArrowDown className="h-4 w-4" />,
  left: <ArrowLeft className="h-4 w-4" />,
  right: <ArrowRight className="h-4 w-4" />,
  "forward-left": <ArrowUpLeft className="h-4 w-4" />,
  "forward-right": <ArrowUpRight className="h-4 w-4" />,
  "back-left": <ArrowDownLeft className="h-4 w-4" />,
  "back-right": <ArrowDownRight className="h-4 w-4" />,
};

export default function FormationBuilderPage() {
  const [formationName, setFormationName] = useState("My Formation");
  const [selectedFormation, setSelectedFormation] = useState("4-3-3");
  const [players, setPlayers] = useState<PlayerPosition[]>(
    formations["4-3-3"].positions.map((pos, idx) => ({
      id: idx,
      ...pos,
      name: `Player ${idx + 1}`,
      movement: "stay" as MovementDirection,
      passingRoutes: [],
    }))
  );
  const [selectedPlayer, setSelectedPlayer] = useState<number | null>(null);
  const [history, setHistory] = useState<PlayerPosition[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [tacticalModalOpen, setTacticalModalOpen] = useState(false);
  const [tacticalPlayer, setTacticalPlayer] = useState<PlayerPosition | null>(
    null
  );
  const [isSimulating, setIsSimulating] = useState(false);
  const [showPassingLines, setShowPassingLines] = useState(true);
  const [addingPassRoute, setAddingPassRoute] = useState(false);
  const pitchRef = useRef<HTMLDivElement>(null);

  const saveToHistory = useCallback(
    (newPlayers: PlayerPosition[]) => {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push([...newPlayers]);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    },
    [history, historyIndex]
  );

  const handleFormationChange = (formationKey: string) => {
    setSelectedFormation(formationKey);
    const newPlayers = formations[formationKey].positions.map((pos, idx) => ({
      id: idx,
      ...pos,
      name: players[idx]?.name || `Player ${idx + 1}`,
      movement: "stay" as MovementDirection,
      passingRoutes: [],
    }));
    setPlayers(newPlayers);
    saveToHistory(newPlayers);
  };

  const handlePlayerDrag = (
    playerId: number,
    e: React.MouseEvent | React.TouchEvent
  ) => {
    if (addingPassRoute) return;
    e.preventDefault();
    setSelectedPlayer(playerId);

    const pitchElement = pitchRef.current;
    if (!pitchElement) return;

    const pitchRect = pitchElement.getBoundingClientRect();

    const handleMove = (moveEvent: MouseEvent | TouchEvent) => {
      const clientX =
        "touches" in moveEvent
          ? moveEvent.touches[0].clientX
          : moveEvent.clientX;
      const clientY =
        "touches" in moveEvent
          ? moveEvent.touches[0].clientY
          : moveEvent.clientY;

      const x = ((clientX - pitchRect.left) / pitchRect.width) * 100;
      const y = ((clientY - pitchRect.top) / pitchRect.height) * 100;

      setPlayers((prev) =>
        prev.map((p) =>
          p.id === playerId
            ? {
                ...p,
                x: Math.max(5, Math.min(95, x)),
                y: Math.max(5, Math.min(95, y)),
              }
            : p
        )
      );
    };

    const handleEnd = () => {
      saveToHistory(players);
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", handleEnd);
      document.removeEventListener("touchmove", handleMove);
      document.removeEventListener("touchend", handleEnd);
    };

    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseup", handleEnd);
    document.addEventListener("touchmove", handleMove);
    document.addEventListener("touchend", handleEnd);
  };

  const handlePlayerDoubleClick = (player: PlayerPosition) => {
    setTacticalPlayer(player);
    setTacticalModalOpen(true);
  };

  const handlePlayerClickForPass = (playerId: number) => {
    if (addingPassRoute && tacticalPlayer && playerId !== tacticalPlayer.id) {
      const newRoute: PassingRoute = {
        targetPlayerId: playerId,
        type: "short",
      };
      const updatedPlayers = players.map((p) =>
        p.id === tacticalPlayer.id
          ? { ...p, passingRoutes: [...p.passingRoutes, newRoute] }
          : p
      );
      setPlayers(updatedPlayers);
      setTacticalPlayer(updatedPlayers.find((p) => p.id === tacticalPlayer.id) || null);
      setAddingPassRoute(false);
      saveToHistory(updatedPlayers);
    }
  };

  const handleMovementChange = (direction: MovementDirection) => {
    if (!tacticalPlayer) return;
    const updatedPlayers = players.map((p) =>
      p.id === tacticalPlayer.id ? { ...p, movement: direction } : p
    );
    setPlayers(updatedPlayers);
    setTacticalPlayer({ ...tacticalPlayer, movement: direction });
  };

  const removePassingRoute = (index: number) => {
    if (!tacticalPlayer) return;
    const newRoutes = tacticalPlayer.passingRoutes.filter((_, i) => i !== index);
    const updatedPlayers = players.map((p) =>
      p.id === tacticalPlayer.id ? { ...p, passingRoutes: newRoutes } : p
    );
    setPlayers(updatedPlayers);
    setTacticalPlayer({ ...tacticalPlayer, passingRoutes: newRoutes });
  };

  const simulatePass = () => {
    setIsSimulating(true);
    // Animate ball along passing routes
    setTimeout(() => setIsSimulating(false), 2000);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setPlayers(history[historyIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setPlayers(history[historyIndex + 1]);
    }
  };

  const handleClear = () => {
    const clearedPlayers = players.map((p) => ({
      ...p,
      x: 50,
      y: 50,
      movement: "stay" as MovementDirection,
      passingRoutes: [],
    }));
    setPlayers(clearedPlayers);
    saveToHistory(clearedPlayers);
  };

  const handleReset = () => {
    handleFormationChange(selectedFormation);
  };

  // Calculate line position for passing routes
  const getPassingLineCoords = (fromPlayer: PlayerPosition, toPlayerId: number) => {
    const toPlayer = players.find((p) => p.id === toPlayerId);
    if (!toPlayer) return null;
    return {
      x1: fromPlayer.x,
      y1: fromPlayer.y,
      x2: toPlayer.x,
      y2: toPlayer.y,
    };
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Team Formation Builder</h1>
            <p className="mt-2 text-muted-foreground">
              Create tactical formations with movement directions and passing routes
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Pitch Area */}
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-4">
                  {/* Pitch */}
                  <div
                    ref={pitchRef}
                    className="relative aspect-[100/70] overflow-hidden rounded-lg bg-[#10B981]"
                    style={{
                      backgroundImage: `
                        linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)
                      `,
                      backgroundSize: "10% 10%",
                    }}
                  >
                    {/* Field Markings */}
                    <svg
                      className="absolute inset-0 h-full w-full"
                      viewBox="0 0 100 70"
                      preserveAspectRatio="none"
                    >
                      {/* Outer Border */}
                      <rect
                        x="2"
                        y="2"
                        width="96"
                        height="66"
                        fill="none"
                        stroke="white"
                        strokeWidth="0.3"
                      />
                      {/* Center Line */}
                      <line
                        x1="2"
                        y1="35"
                        x2="98"
                        y2="35"
                        stroke="white"
                        strokeWidth="0.3"
                      />
                      {/* Center Circle */}
                      <circle
                        cx="50"
                        cy="35"
                        r="10"
                        fill="none"
                        stroke="white"
                        strokeWidth="0.3"
                      />
                      {/* Center Dot */}
                      <circle cx="50" cy="35" r="0.5" fill="white" />
                      {/* Top Penalty Box */}
                      <rect
                        x="28"
                        y="2"
                        width="44"
                        height="14"
                        fill="none"
                        stroke="white"
                        strokeWidth="0.3"
                      />
                      {/* Top Goal Box */}
                      <rect
                        x="38"
                        y="2"
                        width="24"
                        height="6"
                        fill="none"
                        stroke="white"
                        strokeWidth="0.3"
                      />
                      {/* Bottom Penalty Box */}
                      <rect
                        x="28"
                        y="54"
                        width="44"
                        height="14"
                        fill="none"
                        stroke="white"
                        strokeWidth="0.3"
                      />
                      {/* Bottom Goal Box */}
                      <rect
                        x="38"
                        y="62"
                        width="24"
                        height="6"
                        fill="none"
                        stroke="white"
                        strokeWidth="0.3"
                      />
                      {/* Passing Lines */}
                      {showPassingLines &&
                        players.map((player) =>
                          player.passingRoutes.map((route, idx) => {
                            const coords = getPassingLineCoords(
                              player,
                              route.targetPlayerId
                            );
                            if (!coords) return null;
                            return (
                              <line
                                key={`${player.id}-${idx}`}
                                x1={coords.x1}
                                y1={(coords.y1 / 100) * 70}
                                x2={coords.x2}
                                y2={(coords.y2 / 100) * 70}
                                stroke="#FF5722"
                                strokeWidth="0.4"
                                strokeDasharray="2,1"
                                markerEnd="url(#arrowhead)"
                              />
                            );
                          })
                        )}
                      <defs>
                        <marker
                          id="arrowhead"
                          markerWidth="3"
                          markerHeight="3"
                          refX="3"
                          refY="1.5"
                          orient="auto"
                        >
                          <polygon points="0 0, 3 1.5, 0 3" fill="#FF5722" />
                        </marker>
                      </defs>
                    </svg>

                    {/* Players */}
                    {players.map((player) => (
                      <div
                        key={player.id}
                        className={`absolute flex cursor-move flex-col items-center transition-transform ${
                          selectedPlayer === player.id
                            ? "z-20 scale-110"
                            : "z-10"
                        } ${addingPassRoute && tacticalPlayer?.id !== player.id ? "cursor-pointer" : ""}`}
                        style={{
                          left: `${player.x}%`,
                          top: `${player.y}%`,
                          transform: "translate(-50%, -50%)",
                        }}
                        onMouseDown={(e) => handlePlayerDrag(player.id, e)}
                        onTouchStart={(e) => handlePlayerDrag(player.id, e)}
                        onDoubleClick={() => handlePlayerDoubleClick(player)}
                        onClick={() => handlePlayerClickForPass(player.id)}
                      >
                        {/* Movement arrow indicator */}
                        {player.movement !== "stay" && (
                          <div className="absolute -top-3 text-white bg-black/50 rounded-full p-0.5">
                            {movementIcons[player.movement]}
                          </div>
                        )}
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold text-white shadow-lg ${
                            roleColors[player.role].bg
                          } ${roleColors[player.role].border} ${
                            selectedPlayer === player.id
                              ? "ring-2 ring-white ring-offset-2"
                              : ""
                          } ${addingPassRoute && tacticalPlayer?.id !== player.id ? "ring-2 ring-[#FF5722] animate-pulse" : ""}`}
                        >
                          {player.id + 1}
                        </div>
                        <span className="mt-1 rounded bg-black/50 px-1.5 py-0.5 text-[10px] font-medium text-white">
                          {player.role}
                        </span>
                      </div>
                    ))}

                    {/* Simulating ball animation */}
                    {isSimulating && (
                      <div className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-lg animate-ping" />
                    )}
                  </div>

                  {/* Controls under pitch */}
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleUndo}
                        disabled={historyIndex <= 0}
                      >
                        <Undo className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRedo}
                        disabled={historyIndex >= history.length - 1}
                      >
                        <Redo className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleReset}>
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Reset
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleClear}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Clear
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowPassingLines(!showPassingLines)}
                      >
                        {showPassingLines ? "Hide" : "Show"} Routes
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Export
                      </Button>
                      <Button size="sm">
                        <Save className="mr-2 h-4 w-4" />
                        Save
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Controls Panel */}
            <div className="space-y-6">
              {/* Formation Name */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Formation Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="formationName">Formation Name</Label>
                    <Input
                      id="formationName"
                      value={formationName}
                      onChange={(e) => setFormationName(e.target.value)}
                      className="mt-1.5"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Formation Presets */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Preset Formations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.keys(formations).map((key) => (
                      <Button
                        key={key}
                        variant={
                          selectedFormation === key ? "default" : "outline"
                        }
                        onClick={() => handleFormationChange(key)}
                        className="w-full"
                      >
                        {formations[key].name}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Position Legend */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Position Legend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(roleColors).map(([role, colors]) => (
                      <div key={role} className="flex items-center gap-3">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full ${colors.bg} text-xs font-bold text-white`}
                        >
                          {role}
                        </div>
                        <span className="text-sm">
                          {role === "GK"
                            ? "Goalkeeper"
                            : role === "DEF"
                              ? "Defender"
                              : role === "MID"
                                ? "Midfielder"
                                : "Forward"}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Player List */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Players</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground mb-3">
                    Double-click a player on the pitch to set tactics
                  </p>
                  <div className="max-h-64 space-y-2 overflow-y-auto">
                    {players.map((player) => (
                      <div
                        key={player.id}
                        className={`flex items-center justify-between rounded-lg border p-2 transition-colors cursor-pointer ${
                          selectedPlayer === player.id
                            ? "border-primary bg-primary/10"
                            : "border-border hover:bg-muted/50"
                        }`}
                        onClick={() => {
                          setSelectedPlayer(player.id);
                          setTacticalPlayer(player);
                          setTacticalModalOpen(true);
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white ${roleColors[player.role].bg}`}
                          >
                            {player.id + 1}
                          </div>
                          <Badge variant="outline">{player.role}</Badge>
                          {player.movement !== "stay" && (
                            <span className="text-muted-foreground">
                              {movementIcons[player.movement]}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          {player.passingRoutes.length > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {player.passingRoutes.length} routes
                            </Badge>
                          )}
                          <Move className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Instructions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Instructions</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>- Drag players to reposition them</li>
                    <li>- Double-click a player to set tactics</li>
                    <li>- Add movement directions and passing routes</li>
                    <li>- Use Simulate to visualize plays</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Tactical Modal */}
      <Dialog open={tacticalModalOpen} onOpenChange={setTacticalModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Player {tacticalPlayer ? tacticalPlayer.id + 1 : ""} Tactics -{" "}
              {tacticalPlayer?.role}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Movement Direction */}
            <div>
              <Label className="text-sm font-medium">Movement Direction</Label>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {(
                  [
                    ["forward-left", "forward", "forward-right"],
                    ["left", "stay", "right"],
                    ["back-left", "back", "back-right"],
                  ] as MovementDirection[][]
                ).map((row, rowIdx) => (
                  <div key={rowIdx} className="contents">
                    {row.map((direction) => (
                      <Button
                        key={direction}
                        variant={
                          tacticalPlayer?.movement === direction
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        className="aspect-square"
                        onClick={() => handleMovementChange(direction)}
                      >
                        {movementIcons[direction]}
                      </Button>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Passing Routes */}
            <div>
              <Label className="text-sm font-medium">Passing Routes</Label>
              <Button
                variant="outline"
                size="sm"
                className="mt-2 w-full bg-transparent"
                onClick={() => {
                  setAddingPassRoute(true);
                  setTacticalModalOpen(false);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Passing Route
              </Button>
              {tacticalPlayer && tacticalPlayer.passingRoutes.length > 0 && (
                <div className="mt-3 space-y-2">
                  {tacticalPlayer.passingRoutes.map((route, idx) => {
                    const targetPlayer = players.find(
                      (p) => p.id === route.targetPlayerId
                    );
                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between rounded bg-muted p-2"
                      >
                        <span className="text-sm">
                          To Player {route.targetPlayerId + 1} (
                          {targetPlayer?.role})
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removePassingRoute(idx)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Simulate */}
            <div>
              <Label className="text-sm font-medium">Simulate</Label>
              <Button
                variant="default"
                size="sm"
                className="mt-2 w-full"
                onClick={simulatePass}
                disabled={isSimulating}
              >
                <Play className="mr-2 h-4 w-4" />
                {isSimulating ? "Simulating..." : "Play Simulation"}
              </Button>
            </div>

            {/* Video Highlight */}
            <div>
              <Label className="text-sm font-medium">Player Highlights</Label>
              <div className="mt-2 aspect-video rounded-lg bg-muted flex items-center justify-center">
                <Video className="h-8 w-8 text-muted-foreground" />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setTacticalModalOpen(false)}
            >
              Close
            </Button>
            <Button onClick={() => setTacticalModalOpen(false)}>
              Save Tactics
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Adding Pass Route Overlay */}
      {addingPassRoute && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center pointer-events-none">
          <div className="bg-card p-4 rounded-lg shadow-lg pointer-events-auto">
            <p className="text-sm mb-2">Click on a player to create a passing route</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAddingPassRoute(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
