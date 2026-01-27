"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  Filter,
  Search,
  Radio,
  Trophy,
  ChevronRight,
  Play,
  Bell,
  CalendarDays,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

const liveMatches = [
  {
    id: 1,
    homeTeam: "FC Freetown",
    awayTeam: "Bo Rangers",
    homeScore: 2,
    awayScore: 1,
    minute: "67'",
    venue: "National Stadium",
    viewers: 1234,
    competition: "Premier League",
  },
  {
    id: 2,
    homeTeam: "Kallon FC",
    awayTeam: "East End Lions",
    homeScore: 0,
    awayScore: 0,
    minute: "23'",
    venue: "Siaka Stevens Stadium",
    viewers: 856,
    competition: "Premier League",
  },
];

const upcomingMatches = [
  {
    id: 3,
    homeTeam: "Mighty Blackpool",
    awayTeam: "Diamond Stars",
    date: "Today",
    time: "16:00",
    venue: "Bo Stadium",
    competition: "Premier League",
  },
  {
    id: 4,
    homeTeam: "FC Johansen",
    awayTeam: "Ports Authority",
    date: "Today",
    time: "18:00",
    venue: "National Stadium",
    competition: "FA Cup",
  },
  {
    id: 5,
    homeTeam: "Old Edwardians",
    awayTeam: "Kamboi Eagles",
    date: "Tomorrow",
    time: "15:00",
    venue: "Kenema Stadium",
    competition: "Premier League",
  },
  {
    id: 6,
    homeTeam: "FC Republic",
    awayTeam: "Anti-Drugs FC",
    date: "Tomorrow",
    time: "17:00",
    venue: "Makeni Stadium",
    competition: "Premier League",
  },
  {
    id: 7,
    homeTeam: "Central Parade",
    awayTeam: "Wusum Stars",
    date: "Jan 29",
    time: "15:30",
    venue: "Koidu Stadium",
    competition: "FA Cup",
  },
];

const recentMatches = [
  {
    id: 8,
    homeTeam: "East End Lions",
    awayTeam: "FC Freetown",
    homeScore: 1,
    awayScore: 2,
    date: "Yesterday",
    venue: "National Stadium",
    competition: "Premier League",
  },
  {
    id: 9,
    homeTeam: "Bo Rangers",
    awayTeam: "Kallon FC",
    homeScore: 3,
    awayScore: 1,
    date: "Jan 25",
    venue: "Bo Stadium",
    competition: "Premier League",
  },
  {
    id: 10,
    homeTeam: "Diamond Stars",
    awayTeam: "Ports Authority",
    homeScore: 0,
    awayScore: 0,
    date: "Jan 24",
    venue: "Kenema Stadium",
    competition: "FA Cup",
  },
];

export default function GamesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [competition, setCompetition] = useState("all");

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Matches & Games</h1>
          <p className="text-muted-foreground">
            Watch live games, check upcoming fixtures, and view recent results
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search teams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={competition} onValueChange={setCompetition}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Competition" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Competitions</SelectItem>
              <SelectItem value="premier">Premier League</SelectItem>
              <SelectItem value="fa-cup">FA Cup</SelectItem>
              <SelectItem value="friendly">Friendlies</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Live Matches */}
        {liveMatches.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <Badge className="bg-red-500 text-white animate-pulse">
                <Radio className="h-3 w-3 mr-1" />
                LIVE NOW
              </Badge>
              <span className="text-sm text-muted-foreground">
                {liveMatches.length} matches in progress
              </span>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {liveMatches.map((match) => (
                <Card
                  key={match.id}
                  className="overflow-hidden border-red-500/20 bg-gradient-to-br from-red-500/5 to-transparent"
                >
                  <CardContent className="p-0">
                    <div className="flex items-center justify-between p-4">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-4">
                          <div className="text-center flex-1">
                            <p className="font-bold text-lg">{match.homeTeam}</p>
                            <p className="text-xs text-muted-foreground">Home</p>
                          </div>
                          <div className="px-4">
                            <div className="flex items-center gap-2">
                              <span className="text-3xl font-bold">
                                {match.homeScore}
                              </span>
                              <span className="text-xl text-muted-foreground">
                                -
                              </span>
                              <span className="text-3xl font-bold">
                                {match.awayScore}
                              </span>
                            </div>
                            <Badge
                              variant="secondary"
                              className="mt-1 bg-red-500/10 text-red-500"
                            >
                              {match.minute}
                            </Badge>
                          </div>
                          <div className="text-center flex-1">
                            <p className="font-bold text-lg">{match.awayTeam}</p>
                            <p className="text-xs text-muted-foreground">Away</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {match.venue}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {match.viewers.toLocaleString()} watching
                          </div>
                        </div>
                      </div>
                    </div>
                    <Link href={`/watch/${match.id}`}>
                      <Button className="w-full rounded-none gap-2">
                        <Play className="h-4 w-4" />
                        Watch Live
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Tabs for Upcoming and Recent */}
        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList>
            <TabsTrigger value="upcoming" className="gap-2">
              <CalendarDays className="h-4 w-4" />
              Upcoming
            </TabsTrigger>
            <TabsTrigger value="recent" className="gap-2">
              <Trophy className="h-4 w-4" />
              Recent Results
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {upcomingMatches.map((match) => (
              <Card key={match.id} className="hover:bg-muted/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="text-center min-w-[80px]">
                      <p className="text-sm font-medium">{match.date}</p>
                      <p className="text-2xl font-bold">{match.time}</p>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex-1">
                          <p className="font-semibold">{match.homeTeam}</p>
                          <p className="text-xs text-muted-foreground">Home</p>
                        </div>
                        <span className="text-lg font-bold text-muted-foreground px-4">
                          vs
                        </span>
                        <div className="flex-1 text-right">
                          <p className="font-semibold">{match.awayTeam}</p>
                          <p className="text-xs text-muted-foreground">Away</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {match.venue}
                        </div>
                        <Badge variant="outline" className="text-[10px]">
                          {match.competition}
                        </Badge>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="gap-1 bg-transparent">
                      <Bell className="h-3 w-3" />
                      Remind
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="recent" className="space-y-4">
            {recentMatches.map((match) => (
              <Card key={match.id} className="hover:bg-muted/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="text-center min-w-[80px]">
                      <p className="text-sm text-muted-foreground">{match.date}</p>
                      <Badge variant="secondary" className="mt-1">
                        FT
                      </Badge>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex-1">
                          <p
                            className={`font-semibold ${
                              match.homeScore > match.awayScore
                                ? "text-green-500"
                                : ""
                            }`}
                          >
                            {match.homeTeam}
                          </p>
                        </div>
                        <div className="px-4 flex items-center gap-2">
                          <span
                            className={`text-xl font-bold ${
                              match.homeScore > match.awayScore
                                ? "text-green-500"
                                : ""
                            }`}
                          >
                            {match.homeScore}
                          </span>
                          <span className="text-muted-foreground">-</span>
                          <span
                            className={`text-xl font-bold ${
                              match.awayScore > match.homeScore
                                ? "text-green-500"
                                : ""
                            }`}
                          >
                            {match.awayScore}
                          </span>
                        </div>
                        <div className="flex-1 text-right">
                          <p
                            className={`font-semibold ${
                              match.awayScore > match.homeScore
                                ? "text-green-500"
                                : ""
                            }`}
                          >
                            {match.awayTeam}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {match.venue}
                        </div>
                        <Badge variant="outline" className="text-[10px]">
                          {match.competition}
                        </Badge>
                      </div>
                    </div>
                    <Link href={`/watch/${match.id}`}>
                      <Button variant="ghost" size="icon">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>

        {/* League Table Preview */}
        <section className="mt-10">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                Premier League Standings
              </CardTitle>
              <CardDescription>Top 5 teams</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { pos: 1, team: "FC Freetown", played: 18, points: 42 },
                  { pos: 2, team: "East End Lions", played: 18, points: 39 },
                  { pos: 3, team: "Bo Rangers", played: 18, points: 36 },
                  { pos: 4, team: "Kallon FC", played: 18, points: 33 },
                  { pos: 5, team: "Diamond Stars", played: 18, points: 30 },
                ].map((team) => (
                  <div
                    key={team.pos}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50"
                  >
                    <span
                      className={`text-lg font-bold w-6 ${
                        team.pos === 1 ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      {team.pos}
                    </span>
                    <span className="flex-1 font-medium">{team.team}</span>
                    <span className="text-sm text-muted-foreground">
                      P {team.played}
                    </span>
                    <span className="text-lg font-bold min-w-[3rem] text-right">
                      {team.points} pts
                    </span>
                  </div>
                ))}
              </div>
              <Button variant="ghost" className="w-full mt-4 gap-2">
                View Full Table
                <ChevronRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>

      <Footer />
    </div>
  );
}
