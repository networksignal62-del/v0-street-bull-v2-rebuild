"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Search,
  Plus,
  Calendar,
  MapPin,
  Trophy,
  Target,
  Activity,
  ChevronRight,
  UserPlus,
  FileText,
  TrendingUp,
  Star,
  Shield,
} from "lucide-react";

// Mock squad data
const squadPlayers = [
  { id: 1, name: "Mohamed Kamara", position: "Forward", age: 19, rating: 4.8, status: "Active", contractEnd: "Dec 2027" },
  { id: 2, name: "Ibrahim Sesay", position: "Midfielder", age: 21, rating: 4.6, status: "Active", contractEnd: "Jun 2026" },
  { id: 3, name: "Samuel Bangura", position: "Defender", age: 22, rating: 4.5, status: "Injured", contractEnd: "Dec 2026" },
  { id: 4, name: "Alhassan Koroma", position: "Goalkeeper", age: 20, rating: 4.7, status: "Active", contractEnd: "Jun 2028" },
  { id: 5, name: "Alpha Jalloh", position: "Forward", age: 18, rating: 4.3, status: "Active", contractEnd: "Dec 2028" },
  { id: 6, name: "Musa Conteh", position: "Midfielder", age: 23, rating: 4.4, status: "Active", contractEnd: "Jun 2026" },
];

// Mock transfer targets
const transferTargets = [
  { id: 1, name: "John Mansaray", position: "Defender", club: "Bo United", rating: 4.6, status: "Watching" },
  { id: 2, name: "Patrick Koroma", position: "Midfielder", club: "Kenema Stars", rating: 4.5, status: "In Talks" },
  { id: 3, name: "David Kamara", position: "Forward", club: "Free Agent", rating: 4.7, status: "Offer Sent" },
];

// Mock upcoming fixtures
const upcomingFixtures = [
  { id: 1, opponent: "Bo United FC", date: "Jan 30, 2026", venue: "Home", competition: "League" },
  { id: 2, opponent: "Kenema Stars", date: "Feb 5, 2026", venue: "Away", competition: "Cup" },
  { id: 3, opponent: "Makeni FC", date: "Feb 12, 2026", venue: "Home", competition: "League" },
];

// Mock recent results
const recentResults = [
  { id: 1, opponent: "East End Lions", result: "W", score: "3-1" },
  { id: 2, opponent: "FC Kallon", result: "D", score: "2-2" },
  { id: 3, opponent: "Port Authority", result: "W", score: "2-0" },
  { id: 4, opponent: "Diamond Stars", result: "L", score: "0-1" },
  { id: 5, opponent: "Mighty Blackpool", result: "W", score: "4-2" },
];

export default function ClubDashboard() {
  const [searchQuery, setSearchQuery] = useState("");

  const stats = [
    { title: "Squad Size", value: "28", subtitle: "23 active", icon: Users },
    { title: "League Position", value: "3rd", subtitle: "Premier League", icon: Trophy },
    { title: "Goals Scored", value: "42", subtitle: "15 matches", icon: Target },
    { title: "Clean Sheets", value: "7", subtitle: "46% rate", icon: Shield },
  ];

  const positionBreakdown = [
    { position: "Goalkeepers", count: 3, color: "bg-yellow-500" },
    { position: "Defenders", count: 8, color: "bg-blue-500" },
    { position: "Midfielders", count: 10, color: "bg-green-500" },
    { position: "Forwards", count: 7, color: "bg-red-500" },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Club Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your squad, transfers, and fixtures
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Search className="h-4 w-4 mr-2" />
            Scout Players
          </Button>
          <Button className="bg-[#FF5722] hover:bg-[#E64A19] text-white">
            <UserPlus className="h-4 w-4 mr-2" />
            Add Player
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-3xl font-bold text-foreground mt-1">
                      {stat.value}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stat.subtitle}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-[#FF5722]/10">
                    <Icon className="h-6 w-6 text-[#FF5722]" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Squad Management */}
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Squad Management</CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search squad..."
                    className="pl-9 w-48"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="squad">
                <TabsList className="mb-4">
                  <TabsTrigger value="squad">First Team</TabsTrigger>
                  <TabsTrigger value="targets">Transfer Targets</TabsTrigger>
                </TabsList>

                <TabsContent value="squad">
                  <div className="space-y-3">
                    {squadPlayers
                      .filter((p) =>
                        p.name.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((player) => (
                        <div
                          key={player.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-background border border-border hover:border-[#FF5722] transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-[#1E3A8A] text-white text-sm">
                                {player.name.split(" ").map((n) => n[0]).join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-foreground">
                                  {player.name}
                                </p>
                                <Badge variant="outline" className="text-xs">
                                  {player.position}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Age: {player.age} | Contract: {player.contractEnd}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                              <span className="text-sm font-medium">{player.rating}</span>
                            </div>
                            <Badge
                              className={`text-xs ${
                                player.status === "Active"
                                  ? "bg-green-500/10 text-green-500 border-green-500/30"
                                  : "bg-red-500/10 text-red-500 border-red-500/30"
                              }`}
                            >
                              {player.status}
                            </Badge>
                            <Button size="sm" variant="ghost">
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                </TabsContent>

                <TabsContent value="targets">
                  <div className="space-y-3">
                    {transferTargets.map((target) => (
                      <div
                        key={target.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-background border border-border hover:border-[#FF5722] transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-[#FF5722] text-white text-sm">
                              {target.name.split(" ").map((n) => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-foreground">
                                {target.name}
                              </p>
                              <Badge variant="outline" className="text-xs">
                                {target.position}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {target.club}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                            <span className="text-sm font-medium">{target.rating}</span>
                          </div>
                          <Badge
                            className={`text-xs ${
                              target.status === "Watching"
                                ? "bg-blue-500/10 text-blue-500 border-blue-500/30"
                                : target.status === "In Talks"
                                ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/30"
                                : "bg-green-500/10 text-green-500 border-green-500/30"
                            }`}
                          >
                            {target.status}
                          </Badge>
                          <Button size="sm" variant="outline">
                            View
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-4 bg-transparent">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Transfer Target
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Squad Breakdown */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">Squad Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {positionBreakdown.map((item, index) => (
                  <div key={index} className="p-4 rounded-lg bg-background border border-border text-center">
                    <div className={`w-10 h-10 mx-auto rounded-full ${item.color} flex items-center justify-center mb-2`}>
                      <span className="text-white font-bold">{item.count}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.position}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Upcoming Fixtures */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-[#FF5722]" />
                Upcoming Fixtures
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingFixtures.map((fixture) => (
                  <div
                    key={fixture.id}
                    className="p-3 rounded-lg bg-background border border-border"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-foreground">{fixture.opponent}</p>
                      <Badge variant="outline" className="text-xs">
                        {fixture.competition}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{fixture.date}</span>
                      <span className={fixture.venue === "Home" ? "text-green-500" : "text-blue-500"}>
                        {fixture.venue}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4 bg-transparent">
                View Full Schedule
              </Button>
            </CardContent>
          </Card>

          {/* Recent Results */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5 text-[#FF5722]" />
                Recent Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-1 mb-4">
                {recentResults.map((result) => (
                  <div
                    key={result.id}
                    className={`flex-1 h-8 rounded flex items-center justify-center text-xs font-bold text-white ${
                      result.result === "W"
                        ? "bg-green-500"
                        : result.result === "D"
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                  >
                    {result.result}
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                {recentResults.slice(0, 3).map((result) => (
                  <div
                    key={result.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-muted-foreground">{result.opponent}</span>
                    <span
                      className={`font-medium ${
                        result.result === "W"
                          ? "text-green-500"
                          : result.result === "D"
                          ? "text-yellow-500"
                          : "text-red-500"
                      }`}
                    >
                      {result.score}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <FileText className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Users className="h-4 w-4 mr-2" />
                Manage Staff
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Trophy className="h-4 w-4 mr-2" />
                View Standings
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
