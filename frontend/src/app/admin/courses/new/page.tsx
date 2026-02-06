"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, ArrowLeft } from "lucide-react";
import { ImageUpload } from "@/components/ui/image-upload";
import api from "@/lib/api";

export default function NewCoursePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        difficulty: "BEGINNER",
        durationHours: 0,
        thumbnailUrl: ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageUpload = (url: string) => {
        setFormData({ ...formData, thumbnailUrl: url });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post("/courses", formData);
            router.push("/admin/courses");
        } catch (error) {
            console.error("Failed to create course", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <Link href="/admin/courses" className="flex items-center text-sm text-slate-400 hover:text-slate-100 transition-colors mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Courses
            </Link>

            <Card className="border-slate-800 bg-slate-900/50">
                <CardHeader>
                    <CardTitle className="text-2xl text-slate-100">Create New Course</CardTitle>
                    <CardDescription className="text-slate-400">Add a new learning track to the platform</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-200">Course Thumbnail</label>
                            <ImageUpload
                                onUploadComplete={handleImageUpload}
                                folder="course_thumbnails"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-200">Title</label>
                            <Input
                                name="title"
                                placeholder="e.g. Introduction to React"
                                required
                                value={formData.title}
                                onChange={handleChange}
                                className="bg-slate-950 border-slate-700 text-slate-100"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-200">Description</label>
                            <textarea
                                name="description"
                                placeholder="What will students learn?"
                                required
                                value={formData.description}
                                onChange={handleChange}
                                className="flex min-h-[100px] w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 ring-offset-background placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                                    <option value="BEGINNER">Beginner</option>
                                    <option value="INTERMEDIATE">Intermediate</option>
                                    <option value="ADVANCED">Advanced</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-200">Duration (Hours)</label>
                                <Input
                                    name="durationHours"
                                    type="number"
                                    min="0"
                                    required
                                    value={formData.durationHours}
                                    onChange={handleChange}
                                    className="bg-slate-950 border-slate-700 text-slate-100"
                                />
                            </div>
                        </div>

                        <div className="pt-4">
                            <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={loading}>
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Create Course"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
