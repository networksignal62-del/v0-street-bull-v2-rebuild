"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  UserCheck,
  ShieldAlert,
  TrendingUp,
  Activity,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Eye,
  MoreHorizontal,
  AlertTriangle,
  Radio,
  DollarSign,
} from "lucide-react";

// Mock data for pending approvals
const pendingApprovals = [
  {
    id: 1,
    name: "Mohamed Kamara",
    type: "Player",
    email: "m.kamara@email.com",
    registeredAt: "2026-01-25",
    status: "pending",
    documents: true,
  },
  {
    id: 2,
    name: "Ibrahim Sesay",
    type: "Agent",
    email: "i.sesay@email.com",
    registeredAt: "2026-01-24",
    status: "pending",
    documents: true,
  },
  {
    id: 3,
    name: "Fatmata Conteh",
    type: "Player",
    email: "f.conteh@email.com",
    registeredAt: "2026-01-24",
    status: "pending",
    documents: false,
  },
  {
    id: 4,
    name: "Alpha FC",
    type: "Club",
    email: "admin@alphafc.com",
    registeredAt: "2026-01-23",
    status: "pending",
    documents: true,
  },
  {
    id: 5,
    name: "Samuel Bangura",
    type: "Scout",
    email: "s.bangura@email.com",
    registeredAt: "2026-01-22",
    status: "pending",
    documents: true,
  },
];

// Mock data for recent activity
const recentActivity = [
  { id: 1, action: "New player registered", user: "Mohamed K.", time: "5 min ago" },
  { id: 2, action: "Agent profile approved", user: "Admin", time: "15 min ago" },
  { id: 3, action: "Live stream started", user: "Bo District", time: "30 min ago" },
  { id: 4, action: "Player profile updated", user: "Ibrahim S.", time: "1 hour ago" },
  { id: 5, action: "New club registered", user: "FC Kallon", time: "2 hours ago" },
];

// Mock reports
const reports = [
  { id: 1, type: "Spam Content", reportedBy: "User123", status: "new" },
  { id: 2, type: "Fake Profile", reportedBy: "Agent45", status: "investigating" },
  { id: 3, type: "Inappropriate Video", reportedBy: "Scout12", status: "new" },
];

export default function AdminDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");

  const stats = [
    {
      title: "Total Users",
      value: "2,547",
      change: "+12%",
      changeType: "positive",
      icon: Users,
    },
    {
      title: "Pending Approvals",
      value: "23",
      change: "+5",
      changeType: "warning",
      icon: UserCheck,
    },
    {
      title: "Active Streams",
      value: "4",
      change: "Live",
      changeType: "positive",
      icon: Radio,
    },
    {
      title: "Reports",
      value: "8",
      change: "3 new",
      changeType: "negative",
      icon: ShieldAlert,
    },
    {
      title: "Revenue (SLL)",
      value: "15.2M",
      change: "+18%",
      changeType: "positive",
      icon: DollarSign,
    },
    {
      title: "Platform Health",
      value: "98.5%",
      change: "Excellent",
      changeType: "positive",
      icon: Activity,
    },
  ];

  const filteredApprovals = pendingApprovals.filter((approval) => {
    const matchesSearch =
      approval.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      approval.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === "all" || approval.type.toLowerCase() === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage users, approvals, and platform settings
          </p>
        </div>
        <Badge variant="outline" className="w-fit bg-green-500/10 text-green-500 border-green-500/30">
          <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse" />
          System Online
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                  <Badge
                    variant="outline"
                    className={
                      stat.changeType === "positive"
                        ? "text-green-500 border-green-500/30"
                        : stat.changeType === "warning"
                        ? "text-yellow-500 border-yellow-500/30"
                        : "text-red-500 border-red-500/30"
                    }
                  >
                    {stat.change}
                  </Badge>
                </div>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.title}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Pending Approvals Table */}
        <div className="lg:col-span-2">
          <Card className="bg-card border-border">
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle className="text-lg">Pending Approvals</CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search..."
                      className="pl-9 w-full sm:w-48"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-32">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="player">Players</SelectItem>
                      <SelectItem value="agent">Agents</SelectItem>
                      <SelectItem value="club">Clubs</SelectItem>
                      <SelectItem value="scout">Scouts</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Documents</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApprovals.map((approval) => (
                    <TableRow key={approval.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium text-foreground">
                            {approval.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {approval.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{approval.type}</Badge>
                      </TableCell>
                      <TableCell>
                        {approval.documents ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {approval.registeredAt}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button size="sm" variant="ghost">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            className="bg-green-500 hover:bg-green-600 text-white"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="destructive">
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
                    <div className="w-2 h-2 mt-2 rounded-full bg-[#FF5722]" />
                    <div className="flex-1">
                      <p className="text-sm text-foreground">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.user} - {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Reports */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                Recent Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-background border border-border"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {report.type}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        by {report.reportedBy}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        report.status === "new"
                          ? "text-red-500 border-red-500/30"
                          : "text-yellow-500 border-yellow-500/30"
                      }
                    >
                      {report.status}
                    </Badge>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4 bg-transparent">
                View All Reports
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
