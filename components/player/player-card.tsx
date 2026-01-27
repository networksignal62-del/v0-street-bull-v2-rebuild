"use client";

import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Trophy, Target, Calendar, Heart, Eye } from "lucide-react";
import type { Player } from "@/lib/types";

interface PlayerCardProps {
  player: Player;
  onFavorite?: (id: string) => void;
  isFavorite?: boolean;
}

const statusColors: Record<string, string> = {
  available: "bg-[#FF5722] text-white",
  assigned: "bg-[#1E3A8A] text-white",
  signed: "bg-[#10B981] text-white",
};

export function PlayerCard({ player, onFavorite, isFavorite }: PlayerCardProps) {
  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
      {/* Image Section */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-[#1E3A8A] to-[#0A1128]">
        {player.photo ? (
          <img
            src={player.photo || "/placeholder.svg"}
            alt={player.fullName}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/10">
              <User className="h-10 w-10 text-white/60" />
            </div>
          </div>
        )}
        
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        
        {/* Status Badge */}
        <Badge
          className={`absolute right-3 top-3 ${statusColors[player.status]}`}
        >
          {player.status.charAt(0).toUpperCase() + player.status.slice(1)}
        </Badge>

        {/* Favorite Button */}
        {onFavorite && (
          <button
            onClick={() => onFavorite(player.id)}
            className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
          >
            <Heart
              className={`h-4 w-4 ${isFavorite ? "fill-red-500 text-red-500" : ""}`}
            />
          </button>
        )}
      </div>

      {/* Content Section */}
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold">{player.fullName}</h3>
              <Badge variant="outline" className="mt-1">
                {player.position}
              </Badge>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">{player.club || "Free Agent"}</p>
              <p className="text-xs text-muted-foreground">{player.nationality}</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center justify-between border-t border-border pt-3">
            <div className="flex items-center gap-1 text-sm">
              <Trophy className="h-4 w-4 text-[#FF5722]" />
              <span className="font-medium">{player.goals}</span>
              <span className="text-muted-foreground">Goals</span>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <Target className="h-4 w-4 text-[#1E3A8A]" />
              <span className="font-medium">{player.assists}</span>
              <span className="text-muted-foreground">Assists</span>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <Calendar className="h-4 w-4 text-[#10B981]" />
              <span className="font-medium">{player.matches}</span>
              <span className="text-muted-foreground">Games</span>
            </div>
          </div>

          {/* Rating & Value */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(player.rating / 2)
                      ? "text-yellow-500"
                      : "text-muted"
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
              <span className="ml-1 text-sm text-muted-foreground">
                {player.rating}/10
              </span>
            </div>
            <p className="text-sm font-semibold text-primary">
              ${player.marketValue.toLocaleString()}
            </p>
          </div>
        </div>
      </CardContent>

      {/* Footer Actions */}
      <CardFooter className="flex gap-2 p-4 pt-0">
        <Link href={`/players/${player.id}`} className="flex-1">
          <Button variant="outline" className="w-full bg-transparent">
            <Eye className="mr-2 h-4 w-4" />
            View Profile
          </Button>
        </Link>
        <Button className="flex-1 bg-[#FF5722] text-white hover:bg-[#FF5722]/90">
          Contact
        </Button>
      </CardFooter>
    </Card>
  );
}
