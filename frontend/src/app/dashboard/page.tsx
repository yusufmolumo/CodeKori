"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Zap, Trophy, Flame, Target } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Loader2 } from "lucide-react";

interface DashboardStats {
    totalXp: number;
    level: number;
    currentStreak: number;
}

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
    const [dailyQuest, setDailyQuest] = useState<any>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, userRes, enrollmentRes, questRes] = await Promise.all([
                    api.get("/gamification/me"),
                    api.get("/users/profile"),
                    api.get("/courses/enrolled"),
                    api.get("/challenges/daily-quest")
                ]);
                setStats(statsRes.data.data || statsRes.data);
                setUser(userRes.data.data || userRes.data);
                setEnrolledCourses(enrollmentRes.data.data || enrollmentRes.data);
                setDailyQuest(questRes.data.data || questRes.data);
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
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
            {/* Welcome Section */}
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">
                    Welcome back, {user?.profile?.fullName || "CodeWarrior"}!
                </h1>
                <p className="text-muted-foreground">
                    You're on a roll. Keep building your streak and earning XP.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Total XP"
                    value={stats?.totalXp || 0}
                    icon={Zap}
                    colorClass="text-yellow-500"
                    description="Lifetime earned XP"
                />
                <StatsCard
                    title="Current Level"
                    value={stats?.level || 1}
                    icon={Trophy}
                    colorClass="text-purple-500"
                    description="Keep pushing to level up!"
                />
                <StatsCard
                    title="Day Streak"
                    value={stats?.currentStreak || 0}
                    icon={Flame}
                    colorClass="text-orange-500"
                    description="Daily coding streak"
                />
                <StatsCard
                    title="Challenges Won"
                    value={0} // Placeholder until we have this data
                    icon={Target}
                    colorClass="text-red-500"
                    description="Coding challenges completed"
                />
            </div>

            {/* Main Content Areas */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Active Courses / Learning Path */}
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Continue Learning</CardTitle>
                        <CardDescription>
                            Pick up where you left off
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {enrolledCourses.length > 0 ? (
                            <div className="space-y-4">
                                {enrolledCourses.map((course) => (
                                    <div key={course.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded bg-primary/10 flex items-center justify-center overflow-hidden">
                                                {course.thumbnailUrl ? (
                                                    <img src={course.thumbnailUrl} alt={course.title} className="h-full w-full object-cover" />
                                                ) : (
                                                    <Zap className="h-6 w-6 text-primary" />
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="font-semibold">{course.title}</h4>
                                                <p className="text-xs text-muted-foreground">{course._count?.modules || 0} Modules</p>
                                            </div>
                                        </div>
                                        <Link href={`/dashboard/courses/${course.id}`}>
                                            <Button size="sm">Continue</Button>
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center space-y-4 py-8 text-center border-2 border-dashed rounded-lg">
                                <p className="text-muted-foreground">You haven't enrolled in any courses yet.</p>
                                <Link href="/dashboard/courses">
                                    <Button variant="outline">Browse Catalog</Button>
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Daily Challenge / Sidebar Widgets */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Daily Quest</CardTitle>
                        <CardDescription>
                            Complete today's challenge to earn XP
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {dailyQuest ? (
                            <div className="space-y-4">
                                <div className="rounded-lg bg-muted p-4">
                                    <h4 className="font-semibold">{dailyQuest.title}</h4>
                                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                        {dailyQuest.description}
                                    </p>
                                    <div className="mt-2 text-xs font-medium text-primary">
                                        {dailyQuest.difficulty} • {dailyQuest.xpReward} XP
                                    </div>
                                </div>
                                <Link href={`/dashboard/challenges/${dailyQuest.id}`}>
                                    <Button className="w-full">Start Challenge</Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="text-center py-8 border-2 border-dashed rounded-lg">
                                <p className="text-muted-foreground text-sm">Loading daily quest...</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
