"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bug, Network, Cpu, Map, Timer, Terminal, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";

const iconMap: Record<string, any> = {
    Bug, Network, Cpu, Map, Timer, Terminal,
};

interface Mode {
    id: string;
    slug: string;
    title: string;
    description: string;
    icon: string;
    totalTasks: number;
    completedTasks: number;
}

export default function SkillLabPage() {
    const [modes, setModes] = useState<Mode[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchModes = async () => {
            try {
                const res = await api.get("/skill-lab/modes");
                setModes(res.data.data);
            } catch (err) {
                console.error("Failed to fetch modes:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchModes();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Skill Lab</h1>
                <p className="text-muted-foreground mt-2">
                    Sharpen your skills with interactive challenges. Choose a mode and start earning XP.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {modes.map((mode) => {
                    const Icon = iconMap[mode.icon] || Terminal;
                    const progress = mode.totalTasks > 0
                        ? Math.round((mode.completedTasks / mode.totalTasks) * 100)
                        : 0;

                    return (
                        <Card key={mode.id} className="group relative overflow-hidden border border-border/50 bg-card hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                                        <Icon className="h-6 w-6" />
                                    </div>
                                    <Badge variant="secondary" className="text-xs">
                                        {mode.completedTasks}/{mode.totalTasks} done
                                    </Badge>
                                </div>
                                <CardTitle className="text-lg mt-3">{mode.title}</CardTitle>
                                <CardDescription className="text-sm leading-relaxed">
                                    {mode.description}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-0">
                                {/* Progress bar */}
                                <div className="mb-4">
                                    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-primary transition-all duration-500"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </div>
                                <Link href={`/dashboard/skill-lab/${mode.id}`}>
                                    <Button className="w-full group/btn" variant={progress > 0 ? "default" : "outline"}>
                                        {progress > 0 ? "Continue" : "Enter"}
                                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
