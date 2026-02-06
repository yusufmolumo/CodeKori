"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Code2, CheckCircle, Trophy } from "lucide-react";
import Link from "next/link";

interface Challenge {
    id: string;
    title: string;
    description: string;
    difficulty: string;
    xpReward: number;
    isSolved: boolean;
}

export default function ChallengesPage() {
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>("ALL");

    useEffect(() => {
        const fetchChallenges = async () => {
            try {
                const res = await api.get("/challenges");
                setChallenges(res.data.data || res.data || []);
            } catch (error) {
                console.error("Failed to fetch challenges", error);
            } finally {
                setLoading(false);
            }
        };
        fetchChallenges();
    }, []);

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case "EASY": return "bg-green-500 hover:bg-green-600";
            case "MEDIUM": return "bg-yellow-500 hover:bg-yellow-600";
            case "HARD": return "bg-red-500 hover:bg-red-600";
            default: return "bg-gray-500";
        }
    };

    const filteredChallenges = filter === "ALL"
        ? challenges
        : filter === "SOLVED"
            ? challenges.filter(c => c.isSolved)
            : challenges.filter(c => c.difficulty === filter);

    const solvedCount = challenges.filter(c => c.isSolved).length;
    const totalXP = challenges.filter(c => c.isSolved).reduce((acc, c) => acc + c.xpReward, 0);

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Coding Challenges</h1>
                    <p className="text-muted-foreground">Test your skills with our curated problems.</p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>{solvedCount}/{challenges.length} Solved</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Trophy className="h-4 w-4 text-yellow-500" />
                        <span>{totalXP} XP Earned</span>
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2">
                {["ALL", "EASY", "MEDIUM", "HARD", "SOLVED"].map(tab => (
                    <Button
                        key={tab}
                        variant={filter === tab ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilter(tab)}
                    >
                        {tab === "ALL" ? "All" : tab.charAt(0) + tab.slice(1).toLowerCase()}
                        {tab !== "ALL" && tab !== "SOLVED" && (
                            <span className="ml-1">
                                ({challenges.filter(c => c.difficulty === tab).length})
                            </span>
                        )}
                        {tab === "SOLVED" && <span className="ml-1">({solvedCount})</span>}
                    </Button>
                ))}
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredChallenges.map((challenge) => (
                    <Card key={challenge.id} className={`flex flex-col ${challenge.isSolved ? 'border-green-500/50' : ''}`}>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <CardTitle className="line-clamp-1">{challenge.title}</CardTitle>
                                <div className="flex items-center gap-2">
                                    {challenge.isSolved && (
                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                    )}
                                    <Badge className={getDifficultyColor(challenge.difficulty)}>
                                        {challenge.difficulty}
                                    </Badge>
                                </div>
                            </div>
                            <CardDescription className="line-clamp-2">{challenge.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Trophy className="h-4 w-4" />
                                <span>{challenge.xpReward} XP</span>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Link href={`/dashboard/challenges/${challenge.id}`} className="w-full">
                                <Button className="w-full" variant={challenge.isSolved ? "outline" : "default"}>
                                    {challenge.isSolved ? "View Solution" : "Solve Challenge"}
                                </Button>
                            </Link>
                        </CardFooter>
                    </Card>
                ))}

                {filteredChallenges.length === 0 && (
                    <div className="col-span-full py-12 text-center text-muted-foreground">
                        No challenges found for this filter.
                    </div>
                )}
            </div>
        </div>
    );
}
