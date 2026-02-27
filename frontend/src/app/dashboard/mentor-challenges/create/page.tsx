"use client";

import { useState } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ArrowLeft, Save, Eye, Code2, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CreateChallengePage() {
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [publishing, setPublishing] = useState(false);
    const [challengeId, setChallengeId] = useState<string | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        difficulty: "EASY",
        starterCode: "",
        xpReward: "50"
    });

    const [hints, setHints] = useState<string[]>([]);

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
            const payload = { ...formData, xpReward: Number(formData.xpReward), hints };

            if (!challengeId) {
                const res = await api.post("/challenges", payload);
                setChallengeId(res.data.data.id);
            } else {
                await api.put(`/challenges/${challengeId}`, payload);
            }

            setMessage({ type: 'success', text: 'Challenge saved as draft!' });
        } catch (error: any) {
            setMessage({ type: 'error', text: error.response?.data?.error?.message || "Failed to save" });
        } finally {
            setSaving(false);
        }
    };

    const handlePublish = async () => {
        if (!challengeId) await handleSave();
        setPublishing(true);
        try {
            if (challengeId) {
                await api.post(`/challenges/${challengeId}/publish`);
                setMessage({ type: 'success', text: 'Challenge published!' });
                setTimeout(() => router.push("/dashboard/mentor-challenges"), 1500);
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to publish' });
        } finally {
            setPublishing(false);
        }
    };

    return (
        <div className="space-y-6 max-w-3xl mx-auto pb-12">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/mentor-challenges")}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Create Challenge</h1>
                    <p className="text-muted-foreground">Design a new coding challenge for learners.</p>
                </div>
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
                            <Input name="title" value={formData.title} onChange={handleChange} placeholder="e.g. Build a Counter" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Difficulty *</label>
                            <select
                                name="difficulty"
                                value={formData.difficulty}
                                onChange={handleChange}
                                className="w-full h-10 rounded-md border bg-background px-3 text-sm"
                            >
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
                            placeholder="Describe what the learner needs to do..."
                            className="w-full min-h-[120px] px-3 py-2 border rounded-md bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 resize-none text-sm"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold">Starter Code</label>
                        <textarea
                            name="starterCode"
                            value={formData.starterCode}
                            onChange={handleChange}
                            placeholder="// Write your starter code here..."
                            className="w-full min-h-[120px] px-3 py-2 border rounded-md bg-muted/30 font-mono text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 resize-none"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold">XP Reward</label>
                        <Input name="xpReward" type="number" value={formData.xpReward} onChange={handleChange} className="w-32" />
                    </div>

                    {/* Hints */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-semibold">Hints</label>
                            <Button variant="ghost" size="sm" onClick={addHint} className="gap-1 h-7 text-xs">
                                <Plus className="h-3 w-3" /> Add Hint
                            </Button>
                        </div>
                        {hints.map((hint, idx) => (
                            <div key={idx} className="flex gap-2">
                                <Input
                                    value={hint}
                                    onChange={(e) => updateHint(idx, e.target.value)}
                                    placeholder={`Hint ${idx + 1}`}
                                    className="flex-1"
                                />
                                <Button variant="ghost" size="icon" onClick={() => removeHint(idx)} className="text-red-500 shrink-0">
                                    <Trash2 className="h-3 w-3" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <div className="flex items-center gap-3 pt-4 border-t">
                <Button onClick={handleSave} disabled={saving || !formData.title || !formData.description} variant="outline" className="gap-2 flex-1">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save Draft
                </Button>
                <Button onClick={handlePublish} disabled={publishing || !formData.title || !formData.description} className="gap-2 flex-1 shadow-lg shadow-primary/20">
                    {publishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
                    Publish Challenge
                </Button>
            </div>
        </div>
    );
}
