"use client";

import React from "react"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  ClipboardList,
  Building2,
  Settings,
  Radio,
  MessageSquare,
  User,
  Trophy,
  Heart,
  Calendar,
  ChevronLeft,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { UserRole } from "@/lib/types";

interface SidebarProps {
  role?: UserRole;
  isCollapsed?: boolean;
  onToggle?: () => void;
  user?: {
    name: string;
    email: string;
    avatar?: string;
    role: string;
  };
}

const navigationByRole: Record<UserRole, { label: string; href: string; icon: React.ComponentType<{ className?: string }> }[]> = {
  admin: [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Players", href: "/dashboard/players", icon: Users },
    { label: "Agents", href: "/dashboard/agents", icon: UserCheck },
    { label: "Approvals", href: "/dashboard/approvals", icon: ClipboardList },
    { label: "Clubs", href: "/dashboard/clubs", icon: Building2 },
    { label: "Live Streams", href: "/dashboard/streams", icon: Radio },
    { label: "Settings", href: "/dashboard/settings", icon: Settings },
  ],
  agent: [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "My Players", href: "/dashboard/my-players", icon: Users },
    { label: "Assignments", href: "/dashboard/assignments", icon: ClipboardList },
    { label: "Messages", href: "/dashboard/messages", icon: MessageSquare },
    { label: "Profile", href: "/dashboard/profile", icon: User },
    { label: "Settings", href: "/dashboard/settings", icon: Settings },
  ],
  player: [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "My Profile", href: "/dashboard/profile", icon: User },
    { label: "Statistics", href: "/dashboard/statistics", icon: Trophy },
    { label: "My Agent", href: "/dashboard/my-agent", icon: UserCheck },
    { label: "Media", href: "/dashboard/media", icon: Radio },
    { label: "Messages", href: "/dashboard/messages", icon: MessageSquare },
    { label: "Settings", href: "/dashboard/settings", icon: Settings },
  ],
  club_manager: [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Browse Players", href: "/dashboard/browse", icon: Users },
    { label: "Favorites", href: "/dashboard/favorites", icon: Heart },
    { label: "Schedule", href: "/dashboard/schedule", icon: Calendar },
    { label: "Messages", href: "/dashboard/messages", icon: MessageSquare },
    { label: "Settings", href: "/dashboard/settings", icon: Settings },
  ],
};

export function DashboardSidebar({
  role = "admin",
  isCollapsed = false,
  onToggle,
  user,
}: SidebarProps) {
  const pathname = usePathname();
  const navigation = navigationByRole[role] || navigationByRole.admin;

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary">
            <span className="text-lg font-bold text-primary-foreground">SB</span>
          </div>
          {!isCollapsed && (
            <span className="text-lg font-bold text-sidebar-foreground">
              STREET BULL
            </span>
          )}
        </Link>
        {onToggle && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="h-8 w-8 text-sidebar-foreground"
          >
            <ChevronLeft
              className={cn("h-4 w-4 transition-transform", isCollapsed && "rotate-180")}
            />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile */}
      <div className="border-t border-sidebar-border p-3">
        {user ? (
          <div
            className={cn(
              "flex items-center gap-3 rounded-lg p-2",
              isCollapsed ? "justify-center" : ""
            )}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
              {user.avatar ? (
                <img
                  src={user.avatar || "/placeholder.svg"}
                  alt={user.name}
                  className="h-9 w-9 rounded-full object-cover"
                />
              ) : (
                <User className="h-4 w-4" />
              )}
            </div>
            {!isCollapsed && (
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium text-sidebar-foreground">
                  {user.name}
                </p>
                <p className="truncate text-xs text-sidebar-foreground/60">
                  {user.role}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <div className="h-9 w-9 animate-pulse rounded-full bg-sidebar-accent" />
          </div>
        )}
        <Button
          variant="ghost"
          className={cn(
            "mt-2 w-full justify-start text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            isCollapsed && "justify-center px-0"
          )}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!isCollapsed && <span className="ml-3">Sign Out</span>}
        </Button>
      </div>
    </aside>
  );
}
