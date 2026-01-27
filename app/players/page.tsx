"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { PlayerCard } from "@/components/player/player-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, Grid, List, SlidersHorizontal } from "lucide-react";
import type { Player } from "@/lib/types";

// Mock player data
const mockPlayers: Player[] = [
  {
    id: "1",
    userId: "u1",
    fullName: "Mohamed Kamara",
    position: "Forward",
    club: "East End Lions",
    goals: 24,
    assists: 12,
    matches: 45,
    marketValue: 50000,
    rating: 8.5,
    status: "available",
    age: 22,
    nationality: "Sierra Leone",
    preferredFoot: "Right",
    height: 180,
    weight: 75,
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  {
    id: "2",
    userId: "u2",
    fullName: "Ibrahim Sesay",
    position: "Midfielder",
    club: "FC Kallon",
    goals: 8,
    assists: 18,
    matches: 52,
    marketValue: 45000,
    rating: 8.0,
    status: "assigned",
    age: 24,
    nationality: "Sierra Leone",
    preferredFoot: "Both",
    height: 175,
    weight: 72,
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  {
    id: "3",
    userId: "u3",
    fullName: "Alhaji Conteh",
    position: "Defender",
    club: "Mighty Blackpool",
    goals: 3,
    assists: 5,
    matches: 60,
    marketValue: 35000,
    rating: 7.8,
    status: "signed",
    age: 26,
    nationality: "Sierra Leone",
    preferredFoot: "Left",
    height: 188,
    weight: 82,
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  {
    id: "4",
    userId: "u4",
    fullName: "Abubakar Bangura",
    position: "Goalkeeper",
    club: "Bo Rangers",
    goals: 0,
    assists: 2,
    matches: 48,
    marketValue: 30000,
    rating: 7.5,
    status: "available",
    age: 28,
    nationality: "Sierra Leone",
    preferredFoot: "Right",
    height: 192,
    weight: 85,
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  {
    id: "5",
    userId: "u5",
    fullName: "Samuel Kargbo",
    position: "Midfielder",
    club: "Diamond Stars",
    goals: 12,
    assists: 15,
    matches: 40,
    marketValue: 42000,
    rating: 7.9,
    status: "available",
    age: 21,
    nationality: "Sierra Leone",
    preferredFoot: "Right",
    height: 178,
    weight: 74,
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  {
    id: "6",
    userId: "u6",
    fullName: "Foday Koroma",
    position: "Forward",
    club: "Freetown City",
    goals: 18,
    assists: 8,
    matches: 38,
    marketValue: 55000,
    rating: 8.2,
    status: "available",
    age: 20,
    nationality: "Sierra Leone",
    preferredFoot: "Left",
    height: 176,
    weight: 70,
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
];

const positions = ["All", "Forward", "Midfielder", "Defender", "Goalkeeper"];
const statuses = ["All", "Available", "Assigned", "Signed"];

export default function PlayersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filteredPlayers = mockPlayers.filter((player) => {
    const matchesSearch = player.fullName
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesPosition =
      selectedPosition === "All" || player.position === selectedPosition;
    const matchesStatus =
      selectedStatus === "All" ||
      player.status.toLowerCase() === selectedStatus.toLowerCase();
    return matchesSearch && matchesPosition && matchesStatus;
  });

  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-[#0A1128] via-[#1E3A8A] to-[#0A1128] py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
                Discover <span className="text-[#FF5722]">Talent</span>
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-white/70">
                Browse through our database of talented football players from
                Sierra Leone. Find your next star player.
              </p>
            </div>

            {/* Search Bar */}
            <div className="mx-auto mt-8 max-w-2xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search players by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-12 border-white/20 bg-white/10 pl-12 text-white placeholder:text-white/50"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Filters & Results */}
        <section className="py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Filters */}
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <Select
                  value={selectedPosition}
                  onValueChange={setSelectedPosition}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Position" />
                  </SelectTrigger>
                  <SelectContent>
                    {positions.map((pos) => (
                      <SelectItem key={pos} value={pos}>
                        {pos}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={selectedStatus}
                  onValueChange={setSelectedStatus}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button variant="outline" size="icon">
                  <SlidersHorizontal className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center gap-3">
                <p className="text-sm text-muted-foreground">
                  {filteredPlayers.length} players found
                </p>
                <div className="flex items-center rounded-lg border border-border p-1">
                  <Button
                    variant={viewMode === "grid" ? "secondary" : "ghost"}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "secondary" : "ghost"}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Active Filters */}
            {(selectedPosition !== "All" || selectedStatus !== "All") && (
              <div className="mb-6 flex flex-wrap items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Active filters:
                </span>
                {selectedPosition !== "All" && (
                  <Badge
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => setSelectedPosition("All")}
                  >
                    {selectedPosition} &times;
                  </Badge>
                )}
                {selectedStatus !== "All" && (
                  <Badge
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => setSelectedStatus("All")}
                  >
                    {selectedStatus} &times;
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedPosition("All");
                    setSelectedStatus("All");
                  }}
                >
                  Clear all
                </Button>
              </div>
            )}

            {/* Players Grid */}
            {filteredPlayers.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredPlayers.map((player) => (
                  <PlayerCard
                    key={player.id}
                    player={player}
                    onFavorite={toggleFavorite}
                    isFavorite={favorites.includes(player.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                  <Filter className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">No players found</h3>
                <p className="mt-2 text-muted-foreground">
                  Try adjusting your search or filters
                </p>
                <Button
                  variant="outline"
                  className="mt-4 bg-transparent"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedPosition("All");
                    setSelectedStatus("All");
                  }}
                >
                  Clear filters
                </Button>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
