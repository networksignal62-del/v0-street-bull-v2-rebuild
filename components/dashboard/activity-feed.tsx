"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, UserPlus, Trophy, Radio, Clock } from "lucide-react";

interface Activity {
  id: string;
  type: "player_registered" | "player_assigned" | "player_signed" | "stream_started";
  message: string;
  userName: string;
  timestamp: string;
}

const activities: Activity[] = [
  {
    id: "1",
    type: "player_registered",
    message: "New player registered",
    userName: "Mohamed Kamara",
    timestamp: "5 minutes ago",
  },
  {
    id: "2",
    type: "player_assigned",
    message: "Player assigned to agent",
    userName: "Ibrahim Sesay",
    timestamp: "1 hour ago",
  },
  {
    id: "3",
    type: "stream_started",
    message: "Live stream started",
    userName: "Street Bull Arena",
    timestamp: "2 hours ago",
  },
  {
    id: "4",
    type: "player_signed",
    message: "Player signed contract",
    userName: "Alhaji Conteh",
    timestamp: "5 hours ago",
  },
  {
    id: "5",
    type: "player_registered",
    message: "New player registered",
    userName: "Abubakar Bangura",
    timestamp: "1 day ago",
  },
];

const iconMap = {
  player_registered: UserPlus,
  player_assigned: User,
  player_signed: Trophy,
  stream_started: Radio,
};

const colorMap = {
  player_registered: "bg-blue-500/10 text-blue-500",
  player_assigned: "bg-purple-500/10 text-purple-500",
  player_signed: "bg-green-500/10 text-green-500",
  stream_started: "bg-red-500/10 text-red-500",
};

export function ActivityFeed() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity) => {
          const Icon = iconMap[activity.type];
          return (
            <div key={activity.id} className="flex items-start gap-4">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${colorMap[activity.type]}`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">{activity.message}</p>
                <p className="text-sm text-muted-foreground">
                  {activity.userName}
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{activity.timestamp}</span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
