"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, ArrowLeft } from "lucide-react";
import api from "@/lib/api";

export default function NewChallengePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        difficulty: "EASY",
        category: "Algorithms",
        starterCode: "// Write your code here",
        points: 50
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post("/challenges", formData);
            router.push("/admin/challenges");
        } catch (error) {
            console.error("Failed to create challenge", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-3xl mx-auto">
            <Link href="/admin/challenges" className="flex items-center text-sm text-slate-400 hover:text-slate-100 transition-colors mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Challenges
            </Link>

            <Card className="border-slate-800 bg-slate-900/50">
                <CardHeader>
                    <CardTitle className="text-2xl text-slate-100">Create New Challenge</CardTitle>
                    <CardDescription className="text-slate-400">Create a coding problem for students to solve</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-200">Title</label>
                                <Input
                                    name="title"
                                    placeholder="e.g. Two Sum"
                                    required
                                    value={formData.title}
                                    onChange={handleChange}
                                    className="bg-slate-950 border-slate-700 text-slate-100"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-200">Category</label>
                                <Input
                                    name="category"
                                    placeholder="e.g. Algorithms"
                                    required
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="bg-slate-950 border-slate-700 text-slate-100"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-200">Description (Markdown supported)</label>
                            <textarea
                                name="description"
                                placeholder="Problem description..."
                                required
                                value={formData.description}
                                onChange={handleChange}
                                className="flex min-h-[150px] w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 font-mono ring-offset-background placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-200">Starter Code</label>
                            <textarea
                                name="starterCode"
                                placeholder="function solution() { ... }"
                                required
                                value={formData.starterCode}
                                onChange={handleChange}
                                className="flex min-h-[150px] w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 font-mono ring-offset-background placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-200">Difficulty</label>
                                <select
                                    name="difficulty"
                                    value={formData.difficulty}
                                    onChange={handleChange}
                                    className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                >
                                    <option value="EASY">Easy</option>
                                    <option value="MEDIUM">Medium</option>
                                    <option value="HARD">Hard</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-200">XP Points</label>
                                <Input
                                    name="points"
                                    type="number"
                                    min="10"
                                    required
                                    value={formData.points}
                                    onChange={handleChange}
                                    className="bg-slate-950 border-slate-700 text-slate-100"
                                />
                            </div>
                        </div>

                        <div className="pt-4">
                            <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={loading}>
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Create Challenge"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
