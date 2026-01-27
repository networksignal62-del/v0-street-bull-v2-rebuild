import React from "react"
// User and Authentication Types
export type UserRole = "admin" | "agent" | "player" | "club_manager";

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatar?: string;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
}

// Player Types
export type PlayerPosition =
  | "Forward"
  | "Midfielder"
  | "Defender"
  | "Goalkeeper";
export type PlayerStatus = "available" | "assigned" | "signed";

export interface Player {
  id: string;
  userId: string;
  fullName: string;
  position: PlayerPosition;
  club?: string;
  photo?: string;
  goals: number;
  assists: number;
  matches: number;
  marketValue: number;
  rating: number;
  status: PlayerStatus;
  height?: number;
  weight?: number;
  age: number;
  nationality: string;
  preferredFoot?: "Left" | "Right" | "Both";
  bio?: string;
  agentId?: string;
  createdAt: string;
  updatedAt: string;
}

// Agent Types
export interface Agent {
  id: string;
  userId: string;
  fullName: string;
  agencyName?: string;
  licenseNumber?: string;
  photo?: string;
  rating: number;
  playersManaged: number;
  isVerified: boolean;
  createdAt: string;
}

// Club Types
export interface Club {
  id: string;
  name: string;
  country: string;
  logo?: string;
  managerId?: string;
  createdAt: string;
}

// Formation Types
export interface FormationPosition {
  x: number;
  y: number;
  role: "GK" | "DEF" | "MID" | "FWD";
  playerId?: string;
  number?: number;
}

export interface Formation {
  id: string;
  name: string;
  positions: FormationPosition[];
  createdBy: string;
  createdAt: string;
}

// Stream Types
export interface Stream {
  id: string;
  roomId: string;
  title: string;
  isLive: boolean;
  viewerCount: number;
  peakViewers: number;
  broadcasterId: string;
  quality: "1080p" | "720p" | "480p";
  startedAt?: string;
  endedAt?: string;
}

// Dashboard Stats
export interface DashboardStats {
  totalPlayers: number;
  totalAgents: number;
  pendingApprovals: number;
  activeStreams: number;
  playersByPosition: {
    position: string;
    count: number;
  }[];
  playersByStatus: {
    status: string;
    count: number;
  }[];
}

// Activity Feed
export interface Activity {
  id: string;
  type:
    | "player_registered"
    | "player_assigned"
    | "player_signed"
    | "stream_started"
    | "approval_pending";
  message: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  timestamp: string;
}

// Navigation Types
export interface NavItem {
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: number;
  children?: NavItem[];
}
