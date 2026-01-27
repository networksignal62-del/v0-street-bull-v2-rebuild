"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MoreHorizontal, Eye, UserPlus, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Player {
  id: string;
  name: string;
  position: string;
  club: string;
  status: "available" | "assigned" | "signed";
}

const recentPlayers: Player[] = [
  {
    id: "1",
    name: "Mohamed Kamara",
    position: "Forward",
    club: "East End Lions",
    status: "available",
  },
  {
    id: "2",
    name: "Ibrahim Sesay",
    position: "Midfielder",
    club: "FC Kallon",
    status: "assigned",
  },
  {
    id: "3",
    name: "Alhaji Conteh",
    position: "Defender",
    club: "Mighty Blackpool",
    status: "signed",
  },
  {
    id: "4",
    name: "Abubakar Bangura",
    position: "Goalkeeper",
    club: "Bo Rangers",
    status: "available",
  },
  {
    id: "5",
    name: "Samuel Kargbo",
    position: "Midfielder",
    club: "Diamond Stars",
    status: "assigned",
  },
];

const statusVariants: Record<string, "default" | "secondary" | "outline"> = {
  available: "default",
  assigned: "secondary",
  signed: "outline",
};

const statusColors: Record<string, string> = {
  available: "bg-[#FF5722] text-white hover:bg-[#FF5722]/80",
  assigned: "bg-[#1E3A8A] text-white hover:bg-[#1E3A8A]/80",
  signed: "bg-[#10B981] text-white hover:bg-[#10B981]/80",
};

export function RecentPlayers() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Recent Players</CardTitle>
        <Button variant="outline" size="sm">
          View All
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Position</TableHead>
              <TableHead className="hidden sm:table-cell">Club</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentPlayers.map((player) => (
              <TableRow key={player.id}>
                <TableCell className="font-medium">{player.name}</TableCell>
                <TableCell>
                  <Badge variant="outline">{player.position}</Badge>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {player.club}
                </TableCell>
                <TableCell>
                  <Badge className={statusColors[player.status]}>
                    {player.status.charAt(0).toUpperCase() +
                      player.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                        View Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Assign Agent
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
