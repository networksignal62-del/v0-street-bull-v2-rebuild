"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  Star,
  TrendingUp,
  MessageSquare,
  Search,
  Filter,
  Eye,
  Heart,
  Mail,
  MapPin,
  Calendar,
  ChevronRight,
  Briefcase,
} from "lucide-react";

// Mock data for recommended players
const recommendedPlayers = [
  {
    id: 1,
    name: "Mohamed Kamara",
    position: "Forward",
    age: 19,
    location: "Freetown",
    rating: 4.8,
    skills: { pace: 88, shooting: 85, passing: 72 },
    status: "Available",
    views: 234,
  },
  {
    id: 2,
    name: "Ibrahim Sesay",
    position: "Midfielder",
    age: 21,
    location: "Bo",
    rating: 4.6,
    skills: { pace: 75, shooting: 68, passing: 88 },
    status: "Available",
    views: 189,
  },
  {
    id: 3,
    name: "Samuel Bangura",
    position: "Defender",
    age: 22,
    location: "Kenema",
    rating: 4.5,
    skills: { pace: 72, shooting: 55, passing: 76 },
    status: "In Talks",
    views: 156,
  },
  {
    id: 4,
    name: "Alhassan Koroma",
    position: "Goalkeeper",
    age: 20,
    location: "Makeni",
    rating: 4.7,
    skills: { reflexes: 90, positioning: 85, handling: 82 },
    status: "Available",
    views: 178,
  },
];

// Mock data for my shortlist
const myShortlist = [
  { id: 1, name: "Alpha Jalloh", position: "Forward", addedOn: "2 days ago" },
  { id: 2, name: "Musa Kamara", position: "Midfielder", addedOn: "1 week ago" },
  { id: 3, name: "John Mansaray", position: "Defender", addedOn: "2 weeks ago" },
];

// Mock data for recent messages
const recentMessages = [
  { id: 1, from: "Mohamed K.", message: "Thank you for the interest...", time: "2 hours ago", unread: true },
  { id: 2, from: "FC Kallon", message: "We'd like to discuss the player...", time: "5 hours ago", unread: true },
  { id: 3, from: "Ibrahim S.", message: "I'm available for trials next...", time: "1 day ago", unread: false },
];

export default function AgentDashboard() {
  const [searchQuery, setSearchQuery] = useState("");

  const stats = [
    { title: "Players Viewed", value: "156", change: "+23 this week", icon: Eye },
    { title: "Shortlisted", value: "12", change: "+3 new", icon: Heart },
    { title: "Active Deals", value: "4", change: "2 pending", icon: Briefcase },
    { title: "Messages", value: "8", change: "2 unread", icon: MessageSquare },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Agent Dashboard</h1>
          <p className="text-muted-foreground">
            Discover and connect with talented players
          </p>
        </div>
        <Button className="bg-[#FF5722] hover:bg-[#E64A19] text-white">
          <Search className="h-4 w-4 mr-2" />
          Find Players
        </Button>
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
                      {stat.change}
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
        {/* Recommended Players */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Recommended Players</CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search players..."
                      className="pl-9 w-48"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4">
                {recommendedPlayers.map((player) => (
                  <Card
                    key={player.id}
                    className="bg-background border-border hover:border-[#FF5722] transition-colors cursor-pointer"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-14 w-14">
                          <AvatarFallback className="bg-[#1E3A8A] text-white">
                            {player.name.split(" ").map((n) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-foreground truncate">
                              {player.name}
                            </h3>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                              <span className="text-sm font-medium">{player.rating}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {player.position}
                            </Badge>
                            <Badge
                              className={`text-xs ${
                                player.status === "Available"
                                  ? "bg-green-500/10 text-green-500 border-green-500/30"
                                  : "bg-yellow-500/10 text-yellow-500 border-yellow-500/30"
                              }`}
                            >
                              {player.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {player.age} yrs
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {player.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {player.views}
                            </span>
                          </div>
                          <div className="mt-3 space-y-2">
                            {Object.entries(player.skills).slice(0, 3).map(([skill, value]) => (
                              <div key={skill} className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground capitalize w-16">
                                  {skill}
                                </span>
                                <Progress value={value} className="h-1.5 flex-1" />
                                <span className="text-xs font-medium w-8">{value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button size="sm" className="flex-1 bg-[#FF5722] hover:bg-[#E64A19] text-white">
                          View Profile
                        </Button>
                        <Button size="sm" variant="outline">
                          <Heart className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Mail className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4 bg-transparent">
                View All Recommended Players
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* My Shortlist */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                My Shortlist
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {myShortlist.map((player) => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-background border border-border hover:border-[#FF5722] transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-[#1E3A8A] text-white text-xs">
                          {player.name.split(" ").map((n) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-foreground text-sm">
                          {player.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {player.position} - {player.addedOn}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4 bg-transparent">
                View Full Shortlist
              </Button>
            </CardContent>
          </Card>

          {/* Recent Messages */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-[#FF5722]" />
                Recent Messages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      msg.unread
                        ? "bg-[#FF5722]/5 border-[#FF5722]/30"
                        : "bg-background border-border"
                    } hover:border-[#FF5722]`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-foreground text-sm">
                        {msg.from}
                      </p>
                      {msg.unread && (
                        <span className="w-2 h-2 rounded-full bg-[#FF5722]" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {msg.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{msg.time}</p>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4 bg-transparent">
                View All Messages
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
