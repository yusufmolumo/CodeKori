"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Loader2, AlertCircle } from "lucide-react";

interface GamificationMode {
    id: string;
    slug: string;
    title: string;
    description: string;
    icon: string;
    isActive: boolean;
    _count: { tasks: number };
}

export default function AdminSkillLabModes() {
    const [modes, setModes] = useState<GamificationMode[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchModes();
    }, []);

    const fetchModes = async () => {
        try {
            const res = await api.get('/admin/skill-lab-modes');
            setModes(res.data.data);
            setError(null);
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.error?.message || "Failed to load modes");
        } finally {
            setLoading(false);
        }
    };

    const toggleMode = async (modeId: string, currentStatus: boolean) => {
        // Optimistic UI update
        setModes(prev => prev.map(m => m.id === modeId ? { ...m, isActive: !currentStatus } : m));

        try {
            await api.patch(`/admin/skill-lab-modes/${modeId}/toggle`, {
                isActive: !currentStatus
            });
        } catch (err) {
            // Revert on failure
            setModes(prev => prev.map(m => m.id === modeId ? { ...m, isActive: currentStatus } : m));
            console.error("Failed to toggle mode:", err);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Skill Lab Modes</h1>
                <p className="text-slate-500 mt-2">
                    Manage the gamification learning modes available to students. Toggle a mode off to hide it from the learning dashboard.
                </p>
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3 text-red-600">
                    <AlertCircle className="h-5 w-5" />
                    <p>{error}</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
                {modes.map((mode) => (
                    <Card key={mode.id} className={`border transition-all ${!mode.isActive ? 'opacity-60 grayscale bg-slate-50 dark:bg-slate-900/50' : 'border-slate-200 dark:border-slate-800'}`}>
                        <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <span className="text-2xl">{mode.icon}</span>
                                    {mode.title}
                                </CardTitle>
                                <Switch
                                    checked={mode.isActive}
                                    onCheckedChange={() => toggleMode(mode.id, mode.isActive)}
                                />
                            </div>
                            <CardDescription className="line-clamp-2 mt-2">
                                {mode.description}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between text-sm text-slate-500">
                                <span>URL Slug: <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-xs">{mode.slug}</code></span>
                                <span className="font-medium">{mode._count?.tasks || 0} tasks</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {
                modes.length === 0 && !error && (
                    <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg text-slate-500">
                        No gamification modes found in the database.
                    </div>
                )
            }
        </div >
    );
}
