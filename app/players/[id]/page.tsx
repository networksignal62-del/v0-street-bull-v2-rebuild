"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  User,
  Trophy,
  Target,
  Calendar,
  MapPin,
  Ruler,
  Weight,
  Star,
  Heart,
  Share2,
  MessageSquare,
  ArrowLeft,
  Play,
  Clock,
  Eye,
} from "lucide-react";
import type { Player } from "@/lib/types";

// Mock player data - in production this would be fetched from API
const mockPlayer: Player = {
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
  bio: "A talented striker with exceptional pace and finishing ability. Mohamed has been the top scorer for East End Lions for two consecutive seasons and is known for his clinical finishing in the box.",
  createdAt: "2024-01-01",
  updatedAt: "2024-01-01",
};

const careerHistory = [
  { club: "East End Lions", period: "2022 - Present", goals: 24, matches: 45 },
  { club: "FC Kallon Youth", period: "2020 - 2022", goals: 18, matches: 32 },
  { club: "Freetown Academy", period: "2018 - 2020", goals: 12, matches: 28 },
];

const highlights = [
  { id: "1", title: "Season Highlights 2024", views: "2.4K", duration: "5:32" },
  { id: "2", title: "Top 10 Goals", views: "1.8K", duration: "3:45" },
  { id: "3", title: "Skills & Dribbling", views: "1.2K", duration: "4:20" },
];

const statusColors: Record<string, string> = {
  available: "bg-[#FF5722] text-white",
  assigned: "bg-[#1E3A8A] text-white",
  signed: "bg-[#10B981] text-white",
};

export default function PlayerProfilePage() {
  const params = useParams();
  const id = params.id as string;
  const player = mockPlayer; // In production, fetch by id

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-[#0A1128] via-[#1E3A8A] to-[#0A1128]">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {/* Back Button */}
            <Link
              href="/players"
              className="mb-6 inline-flex items-center gap-2 text-white/70 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Players
            </Link>

            <div className="grid items-center gap-8 lg:grid-cols-3">
              {/* Player Image */}
              <div className="flex justify-center lg:justify-start">
                <div className="relative h-64 w-64 overflow-hidden rounded-2xl bg-white/10 lg:h-80 lg:w-80">
                  {player.photo ? (
                    <img
                      src={player.photo || "/placeholder.svg"}
                      alt={player.fullName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <User className="h-24 w-24 text-white/40" />
                    </div>
                  )}
                  <Badge
                    className={`absolute right-4 top-4 ${statusColors[player.status]}`}
                  >
                    {player.status.charAt(0).toUpperCase() +
                      player.status.slice(1)}
                  </Badge>
                </div>
              </div>

              {/* Player Info */}
              <div className="text-center lg:col-span-2 lg:text-left">
                <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                  <Badge variant="outline" className="border-white/30 text-white">
                    {player.position}
                  </Badge>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < Math.floor(player.rating / 2)
                            ? "fill-yellow-500 text-yellow-500"
                            : "text-white/30"
                        }`}
                      />
                    ))}
                    <span className="ml-1 text-white/70">
                      {player.rating}/10
                    </span>
                  </div>
                </div>

                <h1 className="mt-4 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
                  {player.fullName}
                </h1>

                <p className="mt-2 text-lg text-white/70">
                  {player.club || "Free Agent"} | {player.nationality}
                </p>

                <div className="mt-4 text-3xl font-bold text-[#FF5722]">
                  ${player.marketValue.toLocaleString()}
                </div>

                {/* Quick Stats */}
                <div className="mt-6 grid grid-cols-3 gap-4 sm:grid-cols-4 lg:flex lg:gap-8">
                  <div className="text-center lg:text-left">
                    <p className="text-2xl font-bold text-white">{player.goals}</p>
                    <p className="text-sm text-white/60">Goals</p>
                  </div>
                  <div className="text-center lg:text-left">
                    <p className="text-2xl font-bold text-white">{player.assists}</p>
                    <p className="text-sm text-white/60">Assists</p>
                  </div>
                  <div className="text-center lg:text-left">
                    <p className="text-2xl font-bold text-white">{player.matches}</p>
                    <p className="text-sm text-white/60">Matches</p>
                  </div>
                  <div className="text-center lg:text-left">
                    <p className="text-2xl font-bold text-white">{player.age}</p>
                    <p className="text-sm text-white/60">Years</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
                  <Button className="bg-[#FF5722] text-white hover:bg-[#FF5722]/90">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Contact Agent
                  </Button>
                  <Button
                    variant="outline"
                    className="border-white/30 bg-white/10 text-white hover:bg-white/20"
                  >
                    <Heart className="mr-2 h-4 w-4" />
                    Save Player
                  </Button>
                  <Button
                    variant="outline"
                    className="border-white/30 bg-white/10 text-white hover:bg-white/20"
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Details Section */}
        <section className="py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Main Content */}
              <div className="space-y-8 lg:col-span-2">
                {/* About */}
                <Card>
                  <CardHeader>
                    <CardTitle>About</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      {player.bio || "No biography available."}
                    </p>
                  </CardContent>
                </Card>

                {/* Physical Info */}
                <Card>
                  <CardHeader>
                    <CardTitle>Physical Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <Ruler className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Height</p>
                          <p className="font-semibold">{player.height} cm</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <Weight className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Weight</p>
                          <p className="font-semibold">{player.weight} kg</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <Calendar className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Age</p>
                          <p className="font-semibold">{player.age} years</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <Target className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Foot</p>
                          <p className="font-semibold">{player.preferredFoot}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Career History */}
                <Card>
                  <CardHeader>
                    <CardTitle>Career History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {careerHistory.map((career, index) => (
                        <div
                          key={career.club}
                          className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0"
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                              <Trophy className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="font-semibold">{career.club}</p>
                              <p className="text-sm text-muted-foreground">
                                {career.period}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{career.goals} Goals</p>
                            <p className="text-sm text-muted-foreground">
                              {career.matches} Matches
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Video Highlights */}
                <Card>
                  <CardHeader>
                    <CardTitle>Video Highlights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 sm:grid-cols-3">
                      {highlights.map((video) => (
                        <div
                          key={video.id}
                          className="group relative cursor-pointer overflow-hidden rounded-lg"
                        >
                          <div className="aspect-video bg-gradient-to-br from-[#1E3A8A] to-[#0A1128]">
                            <div className="flex h-full items-center justify-center">
                              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 transition-transform group-hover:scale-110">
                                <Play className="h-6 w-6 text-white" />
                              </div>
                            </div>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                            <p className="text-sm font-medium text-white">
                              {video.title}
                            </p>
                            <div className="mt-1 flex items-center gap-3 text-xs text-white/70">
                              <span className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                {video.views}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {video.duration}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Agent Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Agent / Representative</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {player.agentId ? (
                      <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          <User className="h-7 w-7" />
                        </div>
                        <div>
                          <p className="font-semibold">Agent Name</p>
                          <p className="text-sm text-muted-foreground">
                            Sports Agency SL
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-muted-foreground">
                          No agent assigned
                        </p>
                        <Button className="mt-3 bg-transparent" variant="outline" size="sm">
                          Request Representation
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Quick Stats Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Season Statistics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Goals</span>
                      <span className="font-semibold">{player.goals}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Assists</span>
                      <span className="font-semibold">{player.assists}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Matches</span>
                      <span className="font-semibold">{player.matches}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Goal/Match</span>
                      <span className="font-semibold">
                        {(player.goals / player.matches).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Rating</span>
                      <span className="font-semibold">{player.rating}/10</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Location Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Location</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-semibold">{player.nationality}</p>
                        <p className="text-sm text-muted-foreground">
                          West Africa
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
