"use client";

import { useState } from "react";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  User,
  MessageSquare,
  Trophy,
  Calendar,
  AlertCircle,
  Settings,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const notifications = [
  {
    id: 1,
    type: "message",
    title: "New message from Mohamed Kamara",
    description: "Thanks for the opportunity! I'm excited to...",
    time: "2 minutes ago",
    read: false,
    icon: MessageSquare,
  },
  {
    id: 2,
    type: "player",
    title: "New player registration",
    description: "Ibrahim Sesay has registered and awaiting approval",
    time: "15 minutes ago",
    read: false,
    icon: User,
  },
  {
    id: 3,
    type: "match",
    title: "Upcoming match reminder",
    description: "FC Freetown vs Bo Rangers starts in 2 hours",
    time: "1 hour ago",
    read: false,
    icon: Calendar,
  },
  {
    id: 4,
    type: "achievement",
    title: "Achievement unlocked!",
    description: "You've reached 25 players managed",
    time: "3 hours ago",
    read: true,
    icon: Trophy,
  },
  {
    id: 5,
    type: "alert",
    title: "Profile incomplete",
    description: "Complete your profile to increase visibility",
    time: "1 day ago",
    read: true,
    icon: AlertCircle,
  },
  {
    id: 6,
    type: "message",
    title: "New message from FC Freetown",
    description: "We're interested in discussing...",
    time: "2 days ago",
    read: true,
    icon: MessageSquare,
  },
];

const getNotificationColor = (type: string) => {
  switch (type) {
    case "message":
      return "bg-blue-500/10 text-blue-500";
    case "player":
      return "bg-green-500/10 text-green-500";
    case "match":
      return "bg-purple-500/10 text-purple-500";
    case "achievement":
      return "bg-yellow-500/10 text-yellow-500";
    case "alert":
      return "bg-red-500/10 text-red-500";
    default:
      return "bg-muted text-muted-foreground";
  }
};

export default function NotificationsPage() {
  const [notificationsList, setNotificationsList] = useState(notifications);
  const [filter, setFilter] = useState("all");

  const unreadCount = notificationsList.filter((n) => !n.read).length;

  const markAsRead = (id: number) => {
    setNotificationsList(
      notificationsList.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotificationsList(notificationsList.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id: number) => {
    setNotificationsList(notificationsList.filter((n) => n.id !== id));
  };

  const filteredNotifications =
    filter === "all"
      ? notificationsList
      : filter === "unread"
        ? notificationsList.filter((n) => !n.read)
        : notificationsList.filter((n) => n.type === filter);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">
            Stay updated with your latest activities
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              onClick={markAllAsRead}
              className="gap-2 bg-transparent"
            >
              <CheckCheck className="h-4 w-4" />
              Mark all as read
            </Button>
          )}
          <Button variant="outline" className="gap-2 bg-transparent">
            <Settings className="h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/10 p-3">
                <Bell className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{notificationsList.length}</p>
                <p className="text-sm text-muted-foreground">
                  Total Notifications
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-blue-500/10 p-3">
                <MessageSquare className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{unreadCount}</p>
                <p className="text-sm text-muted-foreground">Unread</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-green-500/10 p-3">
                <Check className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {notificationsList.length - unreadCount}
                </p>
                <p className="text-sm text-muted-foreground">Read</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications List */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>All Notifications</CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                  <Filter className="h-4 w-4" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setFilter("all")}>
                  All
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("unread")}>
                  Unread
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("message")}>
                  Messages
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("player")}>
                  Players
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("match")}>
                  Matches
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            {filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="font-medium">No notifications</p>
                <p className="text-sm text-muted-foreground">
                  {"You're all caught up!"}
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`flex items-start gap-4 p-4 transition-colors hover:bg-muted/50 ${
                      !notification.read ? "bg-primary/5" : ""
                    }`}
                  >
                    <div
                      className={`rounded-full p-2 ${getNotificationColor(notification.type)}`}
                    >
                      <notification.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p
                            className={`font-medium ${!notification.read ? "text-foreground" : "text-muted-foreground"}`}
                          >
                            {notification.title}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">
                            {notification.description}
                          </p>
                        </div>
                        {!notification.read && (
                          <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-2" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {notification.time}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => markAsRead(notification.id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => deleteNotification(notification.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
