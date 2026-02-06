"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Trophy, Medal, Crown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function LeaderboardPage() {
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const res = await api.get("/gamification/leaderboard");
                setLeaderboard(res.data.data || res.data || []);
            } catch (error) {
                console.error("Failed to fetch leaderboard", error);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, []);

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="text-center md:text-left">
                <h1 className="text-3xl font-bold tracking-tight">Leaderboard</h1>
                <p className="text-muted-foreground">See who's topping the charts this week.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Trophy className="h-6 w-6 text-yellow-500" />
                        Top Learners
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {leaderboard.map((entry, index) => {
                            let RankIcon = null;
                            let rankClass = "text-muted-foreground font-medium";

                            if (index === 0) {
                                RankIcon = Crown;
                                rankClass = "text-yellow-500 font-bold";
                            } else if (index === 1) {
                                RankIcon = Medal;
                                rankClass = "text-gray-400 font-bold";
                            } else if (index === 2) {
                                RankIcon = Medal;
                                rankClass = "text-amber-700 font-bold";
                            }

                            return (
                                <div key={entry.id || `entry-${index}`} className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-8 text-center text-lg ${rankClass}`}>
                                            {RankIcon ? <RankIcon className="h-6 w-6 mx-auto" /> : `#${index + 1}`}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-primary/20 overflow-hidden">
                                                {entry.user?.profile?.avatarUrl ? (
                                                    <img src={entry.user.profile.avatarUrl} alt={entry.user.profile.username} className="h-full w-full object-cover" />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center text-primary font-bold">
                                                        {entry.user?.profile?.username?.[0]?.toUpperCase() || "U"}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-semibold">{entry.user?.profile?.username || "Anonymous"}</p>
                                                <p className="text-xs text-muted-foreground">Level {entry.level}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <Badge variant="secondary" className="text-sm">
                                            {entry.totalXp} XP
                                        </Badge>
                                    </div>
                                </div>
                            );
                        })}

                        {leaderboard.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                                No active learners yet. Be the first!
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
