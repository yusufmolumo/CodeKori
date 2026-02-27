"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle2, Circle, Loader2, Zap } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";

interface Task {
    id: string;
    title: string;
    description: string;
    difficulty: string;
    xpReward: number;
    orderIndex: number;
    isCompleted: boolean;
}

interface ModeData {
    id: string;
    title: string;
    description: string;
    slug: string;
}

export default function ModeTasksPage() {
    const params = useParams();
    const modeId = params.modeId as string;
    const [mode, setMode] = useState<ModeData | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const res = await api.get(`/skill-lab/modes/${modeId}/tasks`);
                setMode(res.data.data.mode);
                setTasks(res.data.data.tasks);
            } catch (err) {
                console.error("Failed to fetch tasks:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchTasks();
    }, [modeId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const completedCount = tasks.filter(t => t.isCompleted).length;

    const difficultyColor = (d: string) => {
        switch (d) {
            case "EASY": return "bg-green-500/10 text-green-600 border-green-500/20";
            case "MEDIUM": return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
            case "HARD": return "bg-red-500/10 text-red-600 border-red-500/20";
            default: return "bg-muted text-muted-foreground";
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/skill-lab">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{mode?.title}</h1>
                    <p className="text-muted-foreground mt-1">
                        {completedCount}/{tasks.length} tasks completed • {mode?.description}
                    </p>
                </div>
            </div>

            {/* Progress overview */}
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${tasks.length ? (completedCount / tasks.length) * 100 : 0}%` }}
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {tasks.map((task) => (
                    <Card
                        key={task.id}
                        className={`relative transition-all hover:shadow-md ${task.isCompleted
                                ? "border-green-500/30 bg-green-500/5"
                                : "border-border/50 hover:border-primary/30"
                            }`}
                    >
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    {task.isCompleted ? (
                                        <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                                    ) : (
                                        <Circle className="h-5 w-5 text-muted-foreground shrink-0" />
                                    )}
                                    <CardTitle className="text-base">
                                        #{task.orderIndex} {task.title}
                                    </CardTitle>
                                </div>
                                <Badge variant="outline" className={difficultyColor(task.difficulty)}>
                                    {task.difficulty}
                                </Badge>
                            </div>
                            <CardDescription className="ml-7">{task.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0 flex items-center justify-between ml-7">
                            <div className="flex items-center gap-1 text-sm text-amber-500 font-medium">
                                <Zap className="h-4 w-4" />
                                {task.xpReward} XP
                            </div>
                            <Link href={`/dashboard/skill-lab/${modeId}/${task.id}`}>
                                <Button size="sm" variant={task.isCompleted ? "outline" : "default"}>
                                    {task.isCompleted ? "Review" : "Start"}
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
