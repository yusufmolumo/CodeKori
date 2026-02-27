"use client";

import { useState } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ArrowLeft, Plus, Trash2, Save, Eye, BookOpen, GripVertical } from "lucide-react";
import { useRouter } from "next/navigation";

interface LessonDraft {
    id?: string;
    title: string;
    content: string;
    videoUrl: string;
    xpReward: number;
}

interface ModuleDraft {
    id?: string;
    title: string;
    description: string;
    lessons: LessonDraft[];
}

export default function CreateCoursePage() {
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [publishing, setPublishing] = useState(false);
    const [courseId, setCourseId] = useState<string | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const [courseData, setCourseData] = useState({
        title: "",
        description: "",
        difficulty: "BEGINNER",
        durationHours: "",
        thumbnailUrl: ""
    });

    const [modules, setModules] = useState<ModuleDraft[]>([]);

    const handleCourseChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setCourseData({ ...courseData, [e.target.name]: e.target.value });
    };

    const addModule = () => {
        setModules([...modules, { title: "", description: "", lessons: [] }]);
    };

    const removeModule = (idx: number) => {
        setModules(modules.filter((_, i) => i !== idx));
    };

    const updateModule = (idx: number, field: string, value: string) => {
        setModules(modules.map((m, i) => i === idx ? { ...m, [field]: value } : m));
    };

    const addLesson = (modIdx: number) => {
        setModules(modules.map((m, i) =>
            i === modIdx
                ? { ...m, lessons: [...m.lessons, { title: "", content: "", videoUrl: "", xpReward: 10 }] }
                : m
        ));
    };

    const removeLesson = (modIdx: number, lesIdx: number) => {
        setModules(modules.map((m, i) =>
            i === modIdx
                ? { ...m, lessons: m.lessons.filter((_, j) => j !== lesIdx) }
                : m
        ));
    };

    const updateLesson = (modIdx: number, lesIdx: number, field: string, value: string | number) => {
        setModules(modules.map((m, i) =>
            i === modIdx
                ? { ...m, lessons: m.lessons.map((l, j) => j === lesIdx ? { ...l, [field]: value } : l) }
                : m
        ));
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);
        try {
            let id = courseId;

            // Create or update course
            if (!id) {
                const res = await api.post("/courses", courseData);
                id = res.data.data.id;
                setCourseId(id);
            } else {
                await api.put(`/courses/${id}`, courseData);
            }

            // Create modules and lessons
            for (const mod of modules) {
                if (!mod.id) {
                    const modRes = await api.post(`/courses/${id}/modules`, {
                        title: mod.title,
                        description: mod.description
                    });
                    const modId = modRes.data.data.id;
                    mod.id = modId;

                    for (const lesson of mod.lessons) {
                        if (!lesson.id) {
                            const lesRes = await api.post(`/courses/modules/${modId}/lessons`, lesson);
                            lesson.id = lesRes.data.data.id;
                        }
                    }
                }
            }

            setMessage({ type: 'success', text: 'Course saved as draft!' });
        } catch (error: any) {
            setMessage({ type: 'error', text: error.response?.data?.error?.message || "Failed to save course" });
        } finally {
            setSaving(false);
        }
    };

    const handlePublish = async () => {
        if (!courseId) {
            await handleSave();
        }
        setPublishing(true);
        try {
            if (courseId) {
                await api.post(`/courses/${courseId}/publish`);
                setMessage({ type: 'success', text: 'Course published! Learners can now see it.' });
                setTimeout(() => router.push("/dashboard/mentor-courses"), 1500);
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to publish course' });
        } finally {
            setPublishing(false);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-12">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/mentor-courses")}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Create Course</h1>
                    <p className="text-muted-foreground">Build a new educational course with modules and lessons.</p>
                </div>
            </div>

            {message && (
                <div className={`p-4 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-500/10 text-green-600 border border-green-500/20' : 'bg-red-500/10 text-red-600 border border-red-500/20'}`}>
                    {message.text}
                </div>
            )}

            {/* Course Info */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-primary" /> Course Information
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Title *</label>
                            <Input name="title" value={courseData.title} onChange={handleCourseChange} placeholder="e.g. Introduction to React" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Difficulty</label>
                            <select
                                name="difficulty"
                                value={courseData.difficulty}
                                onChange={handleCourseChange}
                                className="w-full h-10 rounded-md border bg-background px-3 text-sm"
                            >
                                <option value="BEGINNER">Beginner</option>
                                <option value="INTERMEDIATE">Intermediate</option>
                                <option value="ADVANCED">Advanced</option>
                            </select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold">Description</label>
                        <textarea
                            name="description"
                            value={courseData.description}
                            onChange={handleCourseChange}
                            placeholder="What will learners gain from this course?"
                            className="w-full min-h-[100px] px-3 py-2 border rounded-md bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 resize-none text-sm"
                        />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Duration (hours)</label>
                            <Input name="durationHours" type="number" value={courseData.durationHours} onChange={handleCourseChange} placeholder="e.g. 8" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Thumbnail URL</label>
                            <Input name="thumbnailUrl" value={courseData.thumbnailUrl} onChange={handleCourseChange} placeholder="https://..." />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Modules */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold">Modules</h2>
                    <Button variant="outline" size="sm" onClick={addModule} className="gap-2">
                        <Plus className="h-4 w-4" /> Add Module
                    </Button>
                </div>

                {modules.length === 0 && (
                    <Card className="border-dashed">
                        <CardContent className="py-10 text-center text-sm text-muted-foreground">
                            No modules yet. Click "Add Module" to get started.
                        </CardContent>
                    </Card>
                )}

                {modules.map((mod, modIdx) => (
                    <Card key={modIdx} className="border-primary/20">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm font-bold text-primary">
                                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                                    Module {modIdx + 1}
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => removeModule(modIdx)} className="h-7 w-7 text-red-500">
                                    <Trash2 className="h-3 w-3" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold">Module Title</label>
                                    <Input
                                        value={mod.title}
                                        onChange={(e) => updateModule(modIdx, "title", e.target.value)}
                                        placeholder="e.g. Getting Started"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold">Description</label>
                                    <Input
                                        value={mod.description}
                                        onChange={(e) => updateModule(modIdx, "description", e.target.value)}
                                        placeholder="Brief description"
                                    />
                                </div>
                            </div>

                            {/* Lessons */}
                            <div className="space-y-3 mt-4">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Lessons</p>
                                    <Button variant="ghost" size="sm" onClick={() => addLesson(modIdx)} className="gap-1 h-7 text-xs">
                                        <Plus className="h-3 w-3" /> Add Lesson
                                    </Button>
                                </div>

                                {mod.lessons.map((lesson, lesIdx) => (
                                    <div key={lesIdx} className="p-3 rounded-lg border bg-muted/20 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-semibold text-muted-foreground">Lesson {lesIdx + 1}</span>
                                            <Button variant="ghost" size="icon" onClick={() => removeLesson(modIdx, lesIdx)} className="h-6 w-6 text-red-500">
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                        <div className="grid md:grid-cols-2 gap-3">
                                            <Input
                                                value={lesson.title}
                                                onChange={(e) => updateLesson(modIdx, lesIdx, "title", e.target.value)}
                                                placeholder="Lesson title"
                                                className="h-8 text-sm"
                                            />
                                            <Input
                                                value={lesson.videoUrl}
                                                onChange={(e) => updateLesson(modIdx, lesIdx, "videoUrl", e.target.value)}
                                                placeholder="Video URL (optional)"
                                                className="h-8 text-sm"
                                            />
                                        </div>
                                        <textarea
                                            value={lesson.content}
                                            onChange={(e) => updateLesson(modIdx, lesIdx, "content", e.target.value)}
                                            placeholder="Lesson content..."
                                            className="w-full min-h-[80px] px-3 py-2 text-sm border rounded-md bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 resize-none"
                                        />
                                        <div className="flex items-center gap-2">
                                            <label className="text-xs font-semibold text-muted-foreground">XP Reward:</label>
                                            <Input
                                                type="number"
                                                value={lesson.xpReward}
                                                onChange={(e) => updateLesson(modIdx, lesIdx, "xpReward", Number(e.target.value))}
                                                className="h-7 w-20 text-xs"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-4 border-t">
                <Button onClick={handleSave} disabled={saving || !courseData.title} variant="outline" className="gap-2 flex-1">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save Draft
                </Button>
                <Button onClick={handlePublish} disabled={publishing || !courseData.title} className="gap-2 flex-1 shadow-lg shadow-primary/20">
                    {publishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
                    Publish Course
                </Button>
            </div>
        </div>
    );
}
