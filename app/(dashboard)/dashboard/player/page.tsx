"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Eye,
  Heart,
  MessageSquare,
  TrendingUp,
  Video,
  Trophy,
  Calendar,
  MapPin,
  Edit,
  Upload,
  Star,
  Target,
  Activity,
  ChevronRight,
  Play,
} from "lucide-react";

// Mock player data
const playerProfile = {
  name: "Mohamed Kamara",
  position: "Forward",
  age: 19,
  location: "Freetown",
  bio: "Passionate striker with excellent finishing skills and pace.",
  stats: {
    pace: 88,
    shooting: 85,
    passing: 72,
    dribbling: 80,
    defending: 45,
    physical: 75,
  },
  careerStats: {
    matches: 45,
    goals: 32,
    assists: 12,
    cleanSheets: 0,
  },
};

// Mock engagement stats
const engagementStats = [
  { title: "Profile Views", value: "1,234", change: "+18%", icon: Eye },
  { title: "Shortlisted", value: "28", change: "+5 this week", icon: Heart },
  { title: "Messages", value: "15", change: "3 new", icon: MessageSquare },
  { title: "Video Views", value: "4,567", change: "+24%", icon: Video },
];

// Mock recent activity
const recentActivity = [
  { id: 1, type: "view", message: "Agent Ibrahim viewed your profile", time: "2 hours ago" },
  { id: 2, type: "shortlist", message: "FC Kallon added you to shortlist", time: "5 hours ago" },
  { id: 3, type: "message", message: "New message from Scout Ahmed", time: "1 day ago" },
  { id: 4, type: "view", message: "International Scout viewed your video", time: "2 days ago" },
];

// Mock highlight videos
const highlightVideos = [
  { id: 1, title: "Best Goals 2025", views: 1234, thumbnail: "goals" },
  { id: 2, title: "Skills & Dribbles", views: 890, thumbnail: "skills" },
  { id: 3, title: "Match Highlights vs Bo FC", views: 456, thumbnail: "match" },
];

// Mock upcoming matches
const upcomingMatches = [
  { id: 1, opponent: "Bo United FC", date: "Jan 30, 2026", location: "Freetown Stadium" },
  { id: 2, opponent: "Kenema Stars", date: "Feb 5, 2026", location: "Bo Stadium" },
];

export default function PlayerDashboard() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Player Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your profile and track your visibility
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
          <Button className="bg-[#FF5722] hover:bg-[#E64A19] text-white">
            <Upload className="h-4 w-4 mr-2" />
            Upload Video
          </Button>
        </div>
      </div>

      {/* Engagement Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {engagementStats.map((stat, index) => {
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
                    <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
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
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Overview */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">Profile Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-6">
                {/* Player Info */}
                <div className="flex items-start gap-4">
                  <Avatar className="h-24 w-24">
                    <AvatarFallback className="bg-gradient-to-br from-[#1E3A8A] to-[#FF5722] text-white text-2xl">
                      MK
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">
                      {playerProfile.name}
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className="bg-[#FF5722]/10 text-[#FF5722] border-[#FF5722]/30">
                        {playerProfile.position}
                      </Badge>
                      <Badge variant="outline" className="text-green-500 border-green-500/30">
                        Verified
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {playerProfile.age} years old
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {playerProfile.location}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {playerProfile.bio}
                    </p>
                  </div>
                </div>
              </div>

              {/* Skills Radar */}
              <div className="mt-6">
                <h3 className="text-sm font-medium text-foreground mb-4">Skills Rating</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(playerProfile.stats).map(([skill, value]) => (
                    <div key={skill} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground capitalize">
                          {skill}
                        </span>
                        <span className="text-sm font-medium text-foreground">{value}</span>
                      </div>
                      <Progress value={value} className="h-2" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Career Stats */}
              <div className="mt-6 grid grid-cols-4 gap-4">
                <div className="text-center p-4 rounded-lg bg-background border border-border">
                  <Trophy className="h-5 w-5 mx-auto text-[#FF5722] mb-2" />
                  <p className="text-2xl font-bold text-foreground">
                    {playerProfile.careerStats.matches}
                  </p>
                  <p className="text-xs text-muted-foreground">Matches</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-background border border-border">
                  <Target className="h-5 w-5 mx-auto text-[#FF5722] mb-2" />
                  <p className="text-2xl font-bold text-foreground">
                    {playerProfile.careerStats.goals}
                  </p>
                  <p className="text-xs text-muted-foreground">Goals</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-background border border-border">
                  <Activity className="h-5 w-5 mx-auto text-[#FF5722] mb-2" />
                  <p className="text-2xl font-bold text-foreground">
                    {playerProfile.careerStats.assists}
                  </p>
                  <p className="text-xs text-muted-foreground">Assists</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-background border border-border">
                  <Star className="h-5 w-5 mx-auto text-[#FF5722] mb-2" />
                  <p className="text-2xl font-bold text-foreground">4.8</p>
                  <p className="text-xs text-muted-foreground">Rating</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Highlight Videos */}
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Highlight Videos</CardTitle>
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Upload New
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-3 gap-4">
                {highlightVideos.map((video) => (
                  <div
                    key={video.id}
                    className="group relative aspect-video bg-[#1E3A8A]/20 rounded-lg overflow-hidden cursor-pointer"
                  >
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/50 transition-colors">
                      <div className="p-3 rounded-full bg-[#FF5722] group-hover:scale-110 transition-transform">
                        <Play className="h-6 w-6 text-white fill-white" />
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                      <p className="text-sm font-medium text-white">{video.title}</p>
                      <p className="text-xs text-gray-300">
                        {video.views.toLocaleString()} views
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Recent Activity */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5 text-[#FF5722]" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 pb-3 border-b border-border last:border-0 last:pb-0"
                  >
                    <div
                      className={`p-2 rounded-full ${
                        activity.type === "view"
                          ? "bg-blue-500/10"
                          : activity.type === "shortlist"
                          ? "bg-red-500/10"
                          : "bg-green-500/10"
                      }`}
                    >
                      {activity.type === "view" && <Eye className="h-4 w-4 text-blue-500" />}
                      {activity.type === "shortlist" && <Heart className="h-4 w-4 text-red-500" />}
                      {activity.type === "message" && <MessageSquare className="h-4 w-4 text-green-500" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-foreground">{activity.message}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Matches */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-[#FF5722]" />
                Upcoming Matches
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingMatches.map((match) => (
                  <div
                    key={match.id}
                    className="p-3 rounded-lg bg-background border border-border hover:border-[#FF5722] transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-foreground">{match.opponent}</p>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {match.date}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" />
                      {match.location}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Profile Completion */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">Profile Completion</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Overall</span>
                    <span className="text-sm font-medium text-foreground">85%</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Complete these to improve:</p>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-4 h-4 rounded border border-border" />
                    <span className="text-foreground">Add 2 more highlight videos</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-4 h-4 rounded border border-border" />
                    <span className="text-foreground">Complete physical measurements</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
