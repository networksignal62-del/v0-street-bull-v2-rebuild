"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Radio,
  Video,
  Camera,
  Users,
  Play,
  QrCode,
  Settings,
  Mic,
  Monitor,
  Wifi,
  ArrowRight,
  CheckCircle,
  Clock,
  MapPin,
  Trophy,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

const recentBroadcasts = [
  {
    id: 1,
    title: "FC Freetown vs Bo Rangers",
    date: "Jan 25, 2026",
    viewers: 2345,
    duration: "1h 45m",
    status: "completed",
  },
  {
    id: 2,
    title: "East End Lions vs Kallon FC",
    date: "Jan 22, 2026",
    viewers: 1876,
    duration: "1h 52m",
    status: "completed",
  },
  {
    id: 3,
    title: "Diamond Stars vs Mighty Blackpool",
    date: "Jan 20, 2026",
    viewers: 1543,
    duration: "1h 48m",
    status: "completed",
  },
];

export default function BroadcasterPage() {
  const [matchTitle, setMatchTitle] = useState("");
  const [homeTeam, setHomeTeam] = useState("");
  const [awayTeam, setAwayTeam] = useState("");
  const [venue, setVenue] = useState("");
  const [competition, setCompetition] = useState("");
  const [description, setDescription] = useState("");

  const isFormValid = matchTitle && homeTeam && awayTeam && venue && competition;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Radio className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold">Broadcast Center</h1>
          </div>
          <p className="text-muted-foreground">
            Set up and manage your live broadcasts with multi-camera support
          </p>
        </div>

        {/* How It Works */}
        <Card className="mb-8 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-lg">How Multi-Camera Broadcasting Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                  1
                </div>
                <div>
                  <p className="font-medium">Create Broadcast</p>
                  <p className="text-sm text-muted-foreground">
                    Set up your match details below
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                  2
                </div>
                <div>
                  <p className="font-medium">Add Camera Operators</p>
                  <p className="text-sm text-muted-foreground">
                    Share QR codes with cameramen
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                  3
                </div>
                <div>
                  <p className="font-medium">Switch Camera Views</p>
                  <p className="text-sm text-muted-foreground">
                    Control which feed viewers see
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                  4
                </div>
                <div>
                  <p className="font-medium">Go Live!</p>
                  <p className="text-sm text-muted-foreground">
                    Share viewer link with fans
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Create New Broadcast */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Create New Broadcast
                </CardTitle>
                <CardDescription>
                  Set up your match details to start broadcasting
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="matchTitle">Match Title</Label>
                  <Input
                    id="matchTitle"
                    placeholder="e.g., FC Freetown vs Bo Rangers"
                    value={matchTitle}
                    onChange={(e) => setMatchTitle(e.target.value)}
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="homeTeam">Home Team</Label>
                    <Input
                      id="homeTeam"
                      placeholder="Home team name"
                      value={homeTeam}
                      onChange={(e) => setHomeTeam(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="awayTeam">Away Team</Label>
                    <Input
                      id="awayTeam"
                      placeholder="Away team name"
                      value={awayTeam}
                      onChange={(e) => setAwayTeam(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="venue">Venue</Label>
                    <Select value={venue} onValueChange={setVenue}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select venue" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="national">National Stadium, Freetown</SelectItem>
                        <SelectItem value="siaka">Siaka Stevens Stadium</SelectItem>
                        <SelectItem value="bo">Bo Stadium</SelectItem>
                        <SelectItem value="kenema">Kenema Stadium</SelectItem>
                        <SelectItem value="makeni">Makeni Stadium</SelectItem>
                        <SelectItem value="koidu">Koidu Stadium</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="competition">Competition</Label>
                    <Select value={competition} onValueChange={setCompetition}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select competition" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="premier">Premier League</SelectItem>
                        <SelectItem value="fa-cup">FA Cup</SelectItem>
                        <SelectItem value="league-cup">League Cup</SelectItem>
                        <SelectItem value="friendly">Friendly</SelectItem>
                        <SelectItem value="street">Street Tournament</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Add match details, importance, or any other information..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>

                <Separator />

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/broadcast/control" className="flex-1">
                    <Button className="w-full gap-2" disabled={!isFormValid}>
                      <Radio className="h-4 w-4" />
                      Start Broadcasting
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button variant="outline" className="gap-2 bg-transparent">
                    <Clock className="h-4 w-4" />
                    Schedule for Later
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Camera Positions Guide */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Recommended Camera Positions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { name: "Goal Post A", desc: "Behind one goal, captures shots and saves" },
                    { name: "Goal Post B", desc: "Behind other goal, alternate angle" },
                    { name: "Crowd View", desc: "Shows fan reactions and atmosphere" },
                    { name: "Ball Tracker", desc: "Follows the ball and main action" },
                    { name: "Coach Bench", desc: "Captures tactical discussions" },
                    { name: "Sideline", desc: "Wide angle of the full pitch" },
                  ].map((camera, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-lg border bg-muted/50"
                    >
                      <p className="font-medium">{camera.name}</p>
                      <p className="text-xs text-muted-foreground">{camera.desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/broadcast/control" className="block">
                  <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
                    <Monitor className="h-4 w-4" />
                    Open Broadcast Control
                  </Button>
                </Link>
                <Link href="/camera/join" className="block">
                  <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
                    <Camera className="h-4 w-4" />
                    Join as Camera Operator
                  </Button>
                </Link>
                <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
                  <QrCode className="h-4 w-4" />
                  Generate Camera QR Code
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
                  <Settings className="h-4 w-4" />
                  Stream Settings
                </Button>
              </CardContent>
            </Card>

            {/* Recent Broadcasts */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Broadcasts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentBroadcasts.map((broadcast) => (
                    <div
                      key={broadcast.id}
                      className="p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-sm">{broadcast.title}</p>
                        <Badge variant="secondary" className="text-[10px]">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {broadcast.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{broadcast.date}</span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {broadcast.viewers.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {broadcast.duration}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <p className="text-2xl font-bold text-primary">23</p>
                    <p className="text-xs text-muted-foreground">Total Broadcasts</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <p className="text-2xl font-bold text-primary">45.2K</p>
                    <p className="text-xs text-muted-foreground">Total Views</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <p className="text-2xl font-bold text-primary">1,965</p>
                    <p className="text-xs text-muted-foreground">Avg. Viewers</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <p className="text-2xl font-bold text-primary">38h</p>
                    <p className="text-xs text-muted-foreground">Stream Time</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
