"use client";

import React from "react"

import { useState, useCallback } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  RotateCcw,
  Download,
  Save,
  Undo,
  Redo,
  Trash2,
  Move,
} from "lucide-react";

// Formation presets
const formations: Record<string, { name: string; positions: { x: number; y: number; role: string }[] }> = {
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

interface PlayerPosition {
  id: number;
  x: number;
  y: number;
  role: string;
  name?: string;
}

const roleColors: Record<string, { bg: string; border: string }> = {
  GK: { bg: "bg-yellow-500", border: "border-yellow-400" },
  DEF: { bg: "bg-blue-500", border: "border-blue-400" },
  MID: { bg: "bg-green-500", border: "border-green-400" },
  FWD: { bg: "bg-[#FF5722]", border: "border-orange-400" },
};

export default function FormationBuilderPage() {
  const [formationName, setFormationName] = useState("My Formation");
  const [selectedFormation, setSelectedFormation] = useState("4-3-3");
  const [players, setPlayers] = useState<PlayerPosition[]>(
    formations["4-3-3"].positions.map((pos, idx) => ({
      id: idx,
      ...pos,
      name: `Player ${idx + 1}`,
    }))
  );
  const [selectedPlayer, setSelectedPlayer] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [history, setHistory] = useState<PlayerPosition[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const saveToHistory = useCallback((newPlayers: PlayerPosition[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...newPlayers]);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const handleFormationChange = (formationKey: string) => {
    setSelectedFormation(formationKey);
    const newPlayers = formations[formationKey].positions.map((pos, idx) => ({
      id: idx,
      ...pos,
      name: players[idx]?.name || `Player ${idx + 1}`,
    }));
    setPlayers(newPlayers);
    saveToHistory(newPlayers);
  };

  const handlePlayerDrag = (
    playerId: number,
    e: React.MouseEvent | React.TouchEvent
  ) => {
    e.preventDefault();
    setIsDragging(true);
    setSelectedPlayer(playerId);

    const pitchElement = document.getElementById("pitch");
    if (!pitchElement) return;

    const pitchRect = pitchElement.getBoundingClientRect();

    const handleMove = (moveEvent: MouseEvent | TouchEvent) => {
      const clientX =
        "touches" in moveEvent ? moveEvent.touches[0].clientX : moveEvent.clientX;
      const clientY =
        "touches" in moveEvent ? moveEvent.touches[0].clientY : moveEvent.clientY;

      const x = ((clientX - pitchRect.left) / pitchRect.width) * 100;
      const y = ((clientY - pitchRect.top) / pitchRect.height) * 100;

      setPlayers((prev) =>
        prev.map((p) =>
          p.id === playerId
            ? { ...p, x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) }
            : p
        )
      );
    };

    const handleEnd = () => {
      setIsDragging(false);
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
    }));
    setPlayers(clearedPlayers);
    saveToHistory(clearedPlayers);
  };

  const handleReset = () => {
    handleFormationChange(selectedFormation);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Formation Builder</h1>
            <p className="mt-2 text-muted-foreground">
              Create and customize your team formation
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Pitch Area */}
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-4">
                  {/* Pitch */}
                  <div
                    id="pitch"
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
                      {/* Top Penalty Arc */}
                      <path
                        d="M 38 16 Q 50 22 62 16"
                        fill="none"
                        stroke="white"
                        strokeWidth="0.3"
                      />
                      {/* Bottom Penalty Arc */}
                      <path
                        d="M 38 54 Q 50 48 62 54"
                        fill="none"
                        stroke="white"
                        strokeWidth="0.3"
                      />
                    </svg>

                    {/* Players */}
                    {players.map((player) => (
                      <div
                        key={player.id}
                        className={`absolute flex cursor-move flex-col items-center transition-transform ${
                          selectedPlayer === player.id ? "z-20 scale-110" : "z-10"
                        }`}
                        style={{
                          left: `${player.x}%`,
                          top: `${player.y}%`,
                          transform: "translate(-50%, -50%)",
                        }}
                        onMouseDown={(e) => handlePlayerDrag(player.id, e)}
                        onTouchStart={(e) => handlePlayerDrag(player.id, e)}
                      >
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold text-white shadow-lg ${
                            roleColors[player.role].bg
                          } ${roleColors[player.role].border} ${
                            selectedPlayer === player.id
                              ? "ring-2 ring-white ring-offset-2"
                              : ""
                          }`}
                        >
                          {player.id + 1}
                        </div>
                        <span className="mt-1 rounded bg-black/50 px-1.5 py-0.5 text-[10px] font-medium text-white">
                          {player.role}
                        </span>
                      </div>
                    ))}
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
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleClear}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Clear
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
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
                        variant={selectedFormation === key ? "default" : "outline"}
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
                  <div className="max-h-64 space-y-2 overflow-y-auto">
                    {players.map((player) => (
                      <div
                        key={player.id}
                        className={`flex items-center justify-between rounded-lg border p-2 transition-colors ${
                          selectedPlayer === player.id
                            ? "border-primary bg-primary/10"
                            : "border-border"
                        }`}
                        onClick={() => setSelectedPlayer(player.id)}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white ${roleColors[player.role].bg}`}
                          >
                            {player.id + 1}
                          </div>
                          <Badge variant="outline">{player.role}</Badge>
                        </div>
                        <Move className="h-4 w-4 text-muted-foreground" />
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
                    <li>- Drag players to reposition them on the pitch</li>
                    <li>- Click preset buttons to apply a formation</li>
                    <li>- Use Undo/Redo to navigate your changes</li>
                    <li>- Save your formation for later use</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
