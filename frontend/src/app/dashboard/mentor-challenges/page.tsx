"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Edit, Trash2, Eye, Globe, Code2, Users, CheckCircle, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface MentorChallenge {
    id: string;
    title: string;
    description: string;
    difficulty: string;
    isPublished: boolean;
    xpReward: number;
    createdAt: string;
    passCount: number;
    failCount: number;
    _count: { submissions: number };
}

export default function MentorChallengesPage() {
    const [challenges, setChallenges] = useState<MentorChallenge[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => { fetchChallenges(); }, []);

    const fetchChallenges = async () => {
        try {
            const res = await api.get("/challenges/my-challenges");
            setChallenges(res.data.data || []);
        } catch (error) {
            console.error("Failed to fetch challenges", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this challenge?")) return;
        try {
            await api.delete(`/challenges/${id}`);
            setChallenges(prev => prev.filter(c => c.id !== id));
        } catch (error) {
            console.error("Failed to delete challenge", error);
        }
    };

    const handlePublish = async (id: string) => {
        try {
            await api.post(`/challenges/${id}/publish`);
            setChallenges(prev => prev.map(c => c.id === id ? { ...c, isPublished: true } : c));
        } catch (error) {
            console.error("Failed to publish challenge", error);
        }
    };

    const difficultyColor = (d: string) => {
        switch (d) {
            case 'EASY': return 'bg-green-500/10 text-green-600 border-green-500/20';
            case 'MEDIUM': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
            case 'HARD': return 'bg-red-500/10 text-red-600 border-red-500/20';
            default: return 'bg-primary/10 text-primary border-primary/20';
        }
    };

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Challenges</h1>
                    <p className="text-muted-foreground">Create and manage coding challenges for learners.</p>
                </div>
                <Button onClick={() => router.push("/dashboard/mentor-challenges/create")} className="gap-2 shadow-lg shadow-primary/20">
                    <Plus className="h-4 w-4" /> Create Challenge
                </Button>
            </div>

            {challenges.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                        <Code2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
                        <h3 className="text-lg font-semibold mb-1">No challenges yet</h3>
                        <p className="text-sm text-muted-foreground mb-4">Create your first coding challenge.</p>
                        <Button onClick={() => router.push("/dashboard/mentor-challenges/create")} className="gap-2">
                            <Plus className="h-4 w-4" /> Create Your First Challenge
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {challenges.map(ch => (
                        <Card key={ch.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-bold truncate">{ch.title}</h3>
                                            {ch.isPublished ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-500/10 text-green-600 border border-green-500/20">
                                                    <Globe className="h-3 w-3" /> Published
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                                                    Draft
                                                </span>
                                            )}
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${difficultyColor(ch.difficulty)}`}>
                                                {ch.difficulty}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                            {ch.description}
                                        </p>
                                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Users className="h-3 w-3" /> {ch._count.submissions} submissions
                                            </span>
                                            <span className="flex items-center gap-1 text-green-600">
                                                <CheckCircle className="h-3 w-3" /> {ch.passCount} passed
                                            </span>
                                            <span className="flex items-center gap-1 text-red-500">
                                                <XCircle className="h-3 w-3" /> {ch.failCount} failed
                                            </span>
                                            <span className="text-primary font-semibold">{ch.xpReward} XP</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        {!ch.isPublished && (
                                            <Button variant="outline" size="sm" onClick={() => handlePublish(ch.id)} className="gap-1 text-green-600 border-green-500/30 hover:bg-green-500/10">
                                                <Eye className="h-3 w-3" /> Publish
                                            </Button>
                                        )}
                                        <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/mentor-challenges/${ch.id}/edit`)} className="gap-1">
                                            <Edit className="h-3 w-3" /> Edit
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={() => handleDelete(ch.id)} className="gap-1 text-red-500 border-red-500/30 hover:bg-red-500/10">
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
