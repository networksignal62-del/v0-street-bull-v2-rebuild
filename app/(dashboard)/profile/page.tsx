"use client";

import { useState } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Camera,
  Edit2,
  Save,
  X,
  Link as LinkIcon,
  Twitter,
  Instagram,
  Facebook,
  Award,
  Briefcase,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

const profileData = {
  name: "John Doe",
  email: "john.doe@streetbull.sl",
  phone: "+232 78 348219",
  role: "Agent",
  location: "Freetown, Sierra Leone",
  joined: "January 2024",
  bio: "Professional football agent with 10+ years of experience in African football. Specializing in discovering and developing young talent from Sierra Leone.",
  website: "https://johndoe-agent.com",
  twitter: "@johndoe_agent",
  instagram: "@johndoe_agent",
  facebook: "johndoe.agent",
  stats: {
    playersManaged: 25,
    successfulTransfers: 12,
    activeDeals: 5,
    yearsExperience: 10,
  },
};

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(profileData);

  const handleSave = () => {
    // Save profile changes
    setIsEditing(false);
  };

  const handleCancel = () => {
    setProfile(profileData);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Profile</h1>
          <p className="text-muted-foreground">
            Manage your personal information
          </p>
        </div>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)} className="gap-2">
            <Edit2 className="h-4 w-4" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleCancel} className="gap-2 bg-transparent">
              <X className="h-4 w-4" />
              Cancel
            </Button>
            <Button onClick={handleSave} className="gap-2">
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </div>
        )}
      </div>

      {/* Profile Header Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-6 sm:flex-row">
            {/* Avatar */}
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarFallback className="text-2xl">
                  {profile.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <Button
                  size="icon"
                  className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Basic Info */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col items-center gap-2 sm:flex-row">
                <h2 className="text-2xl font-bold">{profile.name}</h2>
                <Badge>{profile.role}</Badge>
              </div>
              <p className="mt-1 text-muted-foreground">{profile.email}</p>
              <div className="mt-2 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground sm:justify-start">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {profile.location}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Joined {profile.joined}
                </span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">
                  {profile.stats.playersManaged}
                </p>
                <p className="text-xs text-muted-foreground">Players</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">
                  {profile.stats.successfulTransfers}
                </p>
                <p className="text-xs text-muted-foreground">Transfers</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">
                  {profile.stats.activeDeals}
                </p>
                <p className="text-xs text-muted-foreground">Active Deals</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">
                  {profile.stats.yearsExperience}
                </p>
                <p className="text-xs text-muted-foreground">Years Exp.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Details */}
      <Tabs defaultValue="info" className="space-y-4">
        <TabsList>
          <TabsTrigger value="info">Personal Info</TabsTrigger>
          <TabsTrigger value="social">Social Links</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
              <CardDescription>Your basic profile information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  {isEditing ? (
                    <Input
                      id="name"
                      value={profile.name}
                      onChange={(e) =>
                        setProfile({ ...profile, name: e.target.value })
                      }
                    />
                  ) : (
                    <p className="text-muted-foreground">{profile.name}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  {isEditing ? (
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) =>
                        setProfile({ ...profile, email: e.target.value })
                      }
                    />
                  ) : (
                    <p className="text-muted-foreground">{profile.email}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  {isEditing ? (
                    <Input
                      id="phone"
                      value={profile.phone}
                      onChange={(e) =>
                        setProfile({ ...profile, phone: e.target.value })
                      }
                    />
                  ) : (
                    <p className="text-muted-foreground">{profile.phone}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  {isEditing ? (
                    <Input
                      id="location"
                      value={profile.location}
                      onChange={(e) =>
                        setProfile({ ...profile, location: e.target.value })
                      }
                    />
                  ) : (
                    <p className="text-muted-foreground">{profile.location}</p>
                  )}
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                {isEditing ? (
                  <Textarea
                    id="bio"
                    value={profile.bio}
                    onChange={(e) =>
                      setProfile({ ...profile, bio: e.target.value })
                    }
                    rows={4}
                  />
                ) : (
                  <p className="text-muted-foreground">{profile.bio}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="h-5 w-5" />
                Social Links
              </CardTitle>
              <CardDescription>
                Connect your social media profiles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <LinkIcon className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <Label>Website</Label>
                    {isEditing ? (
                      <Input
                        value={profile.website}
                        onChange={(e) =>
                          setProfile({ ...profile, website: e.target.value })
                        }
                      />
                    ) : (
                      <p className="text-muted-foreground text-sm">
                        {profile.website}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Twitter className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <Label>Twitter</Label>
                    {isEditing ? (
                      <Input
                        value={profile.twitter}
                        onChange={(e) =>
                          setProfile({ ...profile, twitter: e.target.value })
                        }
                      />
                    ) : (
                      <p className="text-muted-foreground text-sm">
                        {profile.twitter}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Instagram className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <Label>Instagram</Label>
                    {isEditing ? (
                      <Input
                        value={profile.instagram}
                        onChange={(e) =>
                          setProfile({ ...profile, instagram: e.target.value })
                        }
                      />
                    ) : (
                      <p className="text-muted-foreground text-sm">
                        {profile.instagram}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Facebook className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <Label>Facebook</Label>
                    {isEditing ? (
                      <Input
                        value={profile.facebook}
                        onChange={(e) =>
                          setProfile({ ...profile, facebook: e.target.value })
                        }
                      />
                    ) : (
                      <p className="text-muted-foreground text-sm">
                        {profile.facebook}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>Your recent actions on the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    action: "Added new player to roster",
                    detail: "Mohamed Kamara",
                    time: "2 hours ago",
                    icon: User,
                  },
                  {
                    action: "Completed player verification",
                    detail: "Ibrahim Sesay",
                    time: "1 day ago",
                    icon: Shield,
                  },
                  {
                    action: "Initiated transfer discussion",
                    detail: "FC Freetown",
                    time: "2 days ago",
                    icon: Briefcase,
                  },
                  {
                    action: "Received achievement badge",
                    detail: "Top Agent 2024",
                    time: "1 week ago",
                    icon: Award,
                  },
                ].map((activity, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="rounded-full bg-primary/10 p-2">
                      <activity.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{activity.action}</p>
                      <p className="text-sm text-muted-foreground">
                        {activity.detail}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {activity.time}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
