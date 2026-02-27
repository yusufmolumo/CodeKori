"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Users, Zap, Flame, Trophy, AlertTriangle, CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface Mentee {
    id: string;
    mentee: {
        id: string;
        profile: { username: string; fullName: string; avatarUrl: string };
        gamification: { totalXp: number; level: number; currentStreak: number; longestStreak: number; lastLoginDate: string | null } | null;
    };
}

function getEngagementStatus(lastLogin: string | null, streak: number) {
    if (!lastLogin) return { label: "New", color: "bg-blue-500/15 text-blue-500 border-blue-500/30" };
    const daysSince = Math.floor((Date.now() - new Date(lastLogin).getTime()) / (1000 * 60 * 60 * 24));
    if (daysSince <= 1 && streak > 0) return { label: "Active", color: "bg-green-500/15 text-green-500 border-green-500/30" };
    if (daysSince <= 3) return { label: "Moderate", color: "bg-amber-500/15 text-amber-500 border-amber-500/30" };
    return { label: "Needs Attention", color: "bg-red-500/15 text-red-500 border-red-500/30" };
}

export default function MentorDashboardPage() {
    const [mentees, setMentees] = useState<Mentee[]>([]);
    const [pendingCount, setPendingCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [menteesRes, requestsRes] = await Promise.all([
                    api.get("/mentorship/mentees"),
                    api.get("/mentorship/requests")
                ]);
                setMentees(menteesRes.data.data || []);
                setPendingCount((requestsRes.data.data || []).length);
            } catch (error) {
                console.error("Failed to fetch mentor dashboard data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Mentor Dashboard</h1>
                <p className="text-muted-foreground mt-1">Track your mentees' progress and engagement.</p>
            </div>

            {/* Stats Row */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-card border border-border/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Active Mentees</CardTitle>
                        <Users className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{mentees.length}</div>
                    </CardContent>
                </Card>
                <Card className="bg-card border border-border/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Pending Requests</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{pendingCount}</div>
                        {pendingCount > 0 && (
                            <Link href="/dashboard/mentorship">
                                <Button variant="link" className="p-0 h-auto text-xs text-primary">Review requests →</Button>
                            </Link>
                        )}
                    </CardContent>
                </Card>
                <Card className="bg-card border border-border/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Needs Attention</CardTitle>
                        <Flame className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">
                            {mentees.filter(m => {
                                const status = getEngagementStatus(
                                    m.mentee.gamification?.lastLoginDate || null,
                                    m.mentee.gamification?.currentStreak || 0
                                );
                                return status.label === "Needs Attention";
                            }).length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Mentees List */}
            {mentees.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
                        <h3 className="text-lg font-semibold">No Mentees Yet</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            When learners request you as their mentor, they'll appear here.
                        </p>
                        {pendingCount > 0 && (
                            <Link href="/dashboard/mentorship">
                                <Button className="mt-4">Review {pendingCount} Pending Request{pendingCount > 1 ? "s" : ""}</Button>
                            </Link>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {mentees.map((connection) => {
                        const m = connection.mentee;
                        const gam = m.gamification;
                        const engagement = getEngagementStatus(gam?.lastLoginDate || null, gam?.currentStreak || 0);

                        return (
                            <Card key={connection.id} className="group overflow-hidden border border-border/50 hover:border-primary/30 transition-all">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-11 w-11">
                                            <AvatarImage src={m.profile?.avatarUrl} alt={m.profile?.username} />
                                            <AvatarFallback>{(m.profile?.username || "?").substring(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <CardTitle className="text-base truncate">{m.profile?.fullName || m.profile?.username}</CardTitle>
                                            <CardDescription className="text-xs">@{m.profile?.username}</CardDescription>
                                        </div>
                                        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${engagement.color}`}>
                                            {engagement.label}
                                        </span>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3 pt-0">
                                    <div className="grid grid-cols-3 gap-2 text-center">
                                        <div className="rounded-md bg-muted/50 p-2">
                                            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-0.5">
                                                <Zap className="h-3 w-3" /> XP
                                            </div>
                                            <div className="font-bold text-sm">{gam?.totalXp || 0}</div>
                                        </div>
                                        <div className="rounded-md bg-muted/50 p-2">
                                            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-0.5">
                                                <Trophy className="h-3 w-3" /> Level
                                            </div>
                                            <div className="font-bold text-sm">{gam?.level || 1}</div>
                                        </div>
                                        <div className="rounded-md bg-muted/50 p-2">
                                            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-0.5">
                                                <Flame className="h-3 w-3" /> Streak
                                            </div>
                                            <div className="font-bold text-sm">{gam?.currentStreak || 0}🔥</div>
                                        </div>
                                    </div>
                                    <Link href={`/dashboard/mentorship`}>
                                        <Button variant="outline" className="w-full text-xs h-8 mt-2">
                                            View Details
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
