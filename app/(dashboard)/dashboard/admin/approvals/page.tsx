"use client";

import React, { useState } from "react";
import {
    Check,
    X,
    Shield,
    Clock,
    User,
    Building2,
    Briefcase,
    MoreHorizontal,
    Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock Data
const MOCK_REQUESTS = [
    { id: 1, name: "Alpha Kamara", email: "alpha.k@example.com", role: "player", status: "pending", date: "2 mins ago", details: "Forward, 19yo" },
    { id: 2, name: "NextGen Sports", email: "contact@nextgen.sl", role: "agent", status: "pending", date: "1 hour ago", details: "License: AG-2024-882" },
    { id: 3, name: "Freetown City FC", email: "admin@fcfc.sl", role: "club_manager", status: "pending", date: "3 hours ago", details: "Premier League Club" },
    { id: 4, name: "Ibrahim S", email: "ibrahim@test.com", role: "player", status: "rejected", date: "1 day ago", details: "Midfielder" },
    { id: 5, name: "Sarah B.", email: "sarah@agent.com", role: "agent", status: "approved", date: "2 days ago", details: "Top Talent Agency" },
];

export default function AdminApprovalsPage() {
    const [requests, setRequests] = useState(MOCK_REQUESTS);
    const [search, setSearch] = useState("");

    const handleAction = (id: number, status: string) => {
        setRequests(requests.map(r => r.id === id ? { ...r, status } : r));
    };

    const filteredRequests = requests.filter(r =>
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.email.toLowerCase().includes(search.toLowerCase())
    );

    const pendingRequests = filteredRequests.filter(r => r.status === "pending");
    const historyRequests = filteredRequests.filter(r => r.status !== "pending");

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'player': return <User className="h-4 w-4 text-blue-500" />;
            case 'agent': return <Briefcase className="h-4 w-4 text-purple-500" />;
            case 'club_manager': return <Building2 className="h-4 w-4 text-orange-500" />;
            default: return <User className="h-4 w-4" />;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Account Approvals</h1>
                    <p className="text-muted-foreground">Review and manage new user registration requests.</p>
                </div>
            </div>

            <div className="flex items-center gap-4 bg-card p-4 rounded-lg border">
                <Search className="h-5 w-5 text-muted-foreground" />
                <Input
                    placeholder="Search requests..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="border-none shadow-none focus-visible:ring-0 bg-transparent"
                />
            </div>

            <Tabs defaultValue="pending" className="w-full">
                <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                    <TabsTrigger value="pending">Pending ({pendingRequests.length})</TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>

                <TabsContent value="pending" className="mt-6 space-y-4">
                    {pendingRequests.length === 0 ? (
                        <div className="text-center py-10 opacity-50">
                            <Shield className="h-12 w-12 mx-auto mb-3" />
                            <p>No pending requests</p>
                        </div>
                    ) : (
                        pendingRequests.map(req => (
                            <Card key={req.id}>
                                <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-12 w-12 border">
                                            <AvatarFallback>{req.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-lg">{req.name}</h3>
                                                <Badge variant="outline" className="flex items-center gap-1">
                                                    {getRoleIcon(req.role)}
                                                    <span className="capitalize">{req.role.replace('_', ' ')}</span>
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground">{req.email}</p>
                                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                                <Clock className="h-3 w-3" /> Requested {req.date} • {req.details}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 w-full sm:w-auto">
                                        <Button variant="outline" className="flex-1 sm:flex-none border-red-500 hover:bg-red-500/10 text-red-500" onClick={() => handleAction(req.id, "rejected")}>
                                            <X className="h-4 w-4 mr-2" /> Reject
                                        </Button>
                                        <Button className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white" onClick={() => handleAction(req.id, "approved")}>
                                            <Check className="h-4 w-4 mr-2" /> Approve
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </TabsContent>

                <TabsContent value="history" className="mt-6 space-y-4">
                    {historyRequests.map(req => (
                        <Card key={req.id} className="opacity-70 hover:opacity-100 transition-opacity">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${req.status === 'approved' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                        {req.status === 'approved' ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}
                                    </div>
                                    <div>
                                        <h4 className="font-bold">{req.name}</h4>
                                        <p className="text-xs text-muted-foreground capitalize">{req.role.replace('_', ' ')} • {req.status}</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm">Details</Button>
                            </CardContent>
                        </Card>
                    ))}
                </TabsContent>
            </Tabs>
        </div>
    );
}
