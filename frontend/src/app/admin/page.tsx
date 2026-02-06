"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Users, BookOpen, Code2, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function AdminDashboard() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get("/admin/stats");
                setStats(res.data);
            } catch (error) {
                console.error("Failed to fetch admin stats", error);
                // Fallback or redirect if 403 (handled by layout mostly)
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-red-500" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100">Admin Dashboard</h1>
                <p className="text-muted-foreground">Platform overview and management.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <StatsCard
                    title="Total Users"
                    value={stats?.totalUsers || 0}
                    icon={Users}
                    colorClass="text-blue-500"
                    description="Registered learners"
                />
                <StatsCard
                    title="Active Courses"
                    value={stats?.totalCourses || 0}
                    icon={BookOpen}
                    colorClass="text-green-500"
                    description="Published content"
                />
                <StatsCard
                    title="Challenges"
                    value={stats?.totalChallenges || 0}
                    icon={Code2}
                    colorClass="text-purple-500"
                    description="Coding problems"
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Recent Signups
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {stats?.recentUsers?.map((user: any) => (
                                <div key={user.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">
                                            {user.profile?.username?.[0]?.toUpperCase() || "U"}
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">{user.profile?.username || user.email}</p>
                                            <p className="text-xs text-muted-foreground">{new Date(user.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-600">
                                        {user.role}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="flex items-center justify-center p-8 bg-slate-50 border-dashed">
                    <div className="text-center space-y-2">
                        <p className="text-muted-foreground">More analytics coming soon...</p>
                    </div>
                </Card>
            </div>
        </div>
    );
}
