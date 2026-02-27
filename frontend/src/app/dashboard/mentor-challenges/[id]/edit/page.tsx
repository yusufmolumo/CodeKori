"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ArrowLeft, Save, Eye, Code2, Plus, Trash2 } from "lucide-react";

export default function EditChallengePage() {
    const params = useParams();
    const router = useRouter();
    const challengeId = params.id as string;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        difficulty: "EASY",
        starterCode: "",
        xpReward: "50",
        isPublished: false
    });

    const [hints, setHints] = useState<string[]>([]);

    useEffect(() => {
        const fetchChallenge = async () => {
            try {
                const res = await api.get(`/challenges/${challengeId}`);
                const ch = res.data.data;
                setFormData({
                    title: ch.title || "",
                    description: ch.description || "",
                    difficulty: ch.difficulty || "EASY",
                    starterCode: ch.starterCode || "",
                    xpReward: ch.xpReward?.toString() || "50",
                    isPublished: ch.isPublished
                });
                setHints(ch.hints || []);
            } catch (error) {
                console.error("Failed to fetch challenge", error);
            } finally {
                setLoading(false);
            }
        };
        fetchChallenge();
    }, [challengeId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const addHint = () => setHints([...hints, ""]);
    const removeHint = (idx: number) => setHints(hints.filter((_, i) => i !== idx));
    const updateHint = (idx: number, value: string) => setHints(hints.map((h, i) => i === idx ? value : h));

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);
        try {
            await api.put(`/challenges/${challengeId}`, {
                ...formData,
                xpReward: Number(formData.xpReward),
                hints
            });
            setMessage({ type: 'success', text: 'Challenge saved!' });
        } catch (error: any) {
            setMessage({ type: 'error', text: error.response?.data?.error?.message || "Failed to save" });
        } finally {
            setSaving(false);
        }
    };

    const handlePublish = async () => {
        try {
            await api.post(`/challenges/${challengeId}/publish`);
            setFormData({ ...formData, isPublished: true });
            setMessage({ type: 'success', text: 'Challenge published!' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to publish' });
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
        <div className="space-y-6 max-w-3xl mx-auto pb-12">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/mentor-challenges")}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold tracking-tight">Edit Challenge</h1>
                    <p className="text-muted-foreground">Update your coding challenge.</p>
                </div>
                {!formData.isPublished && (
                    <Button onClick={handlePublish} className="gap-2 shadow-lg shadow-primary/20">
                        <Eye className="h-4 w-4" /> Publish
                    </Button>
                )}
            </div>

            {message && (
                <div className={`p-4 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-500/10 text-green-600 border border-green-500/20' : 'bg-red-500/10 text-red-600 border border-red-500/20'}`}>
                    {message.text}
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Code2 className="h-5 w-5 text-primary" /> Challenge Details
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Title *</label>
                            <Input name="title" value={formData.title} onChange={handleChange} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Difficulty *</label>
                            <select name="difficulty" value={formData.difficulty} onChange={handleChange} className="w-full h-10 rounded-md border bg-background px-3 text-sm">
                                <option value="EASY">Easy</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HARD">Hard</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold">Description *</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full min-h-[120px] px-3 py-2 border rounded-md bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 resize-none text-sm"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold">Starter Code</label>
                        <textarea
                            name="starterCode"
                            value={formData.starterCode}
                            onChange={handleChange}
                            className="w-full min-h-[120px] px-3 py-2 border rounded-md bg-muted/30 font-mono text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 resize-none"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold">XP Reward</label>
                        <Input name="xpReward" type="number" value={formData.xpReward} onChange={handleChange} className="w-32" />
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-semibold">Hints</label>
                            <Button variant="ghost" size="sm" onClick={addHint} className="gap-1 h-7 text-xs">
                                <Plus className="h-3 w-3" /> Add Hint
                            </Button>
                        </div>
                        {hints.map((hint, idx) => (
                            <div key={idx} className="flex gap-2">
                                <Input value={hint} onChange={(e) => updateHint(idx, e.target.value)} placeholder={`Hint ${idx + 1}`} className="flex-1" />
                                <Button variant="ghost" size="icon" onClick={() => removeHint(idx)} className="text-red-500 shrink-0">
                                    <Trash2 className="h-3 w-3" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <div className="flex items-center gap-3 pt-4 border-t">
                <Button onClick={handleSave} disabled={saving || !formData.title || !formData.description} className="gap-2 flex-1 shadow-lg shadow-primary/20">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save Changes
                </Button>
            </div>
        </div>
    );
}
