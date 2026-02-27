"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ArrowLeft, Plus, Trash2, Save, Eye, BookOpen, GripVertical } from "lucide-react";

interface LessonData {
    id?: string;
    title: string;
    content: string;
    videoUrl: string;
    xpReward: number;
    isNew?: boolean;
}

interface ModuleData {
    id?: string;
    title: string;
    description: string;
    lessons: LessonData[];
    isNew?: boolean;
}

export default function EditCoursePage() {
    const params = useParams();
    const router = useRouter();
    const courseId = params.courseId as string;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const [courseData, setCourseData] = useState({
        title: "",
        description: "",
        difficulty: "BEGINNER",
        durationHours: "",
        thumbnailUrl: "",
        isPublished: false
    });

    const [modules, setModules] = useState<ModuleData[]>([]);

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const res = await api.get(`/courses/${courseId}`);
                const course = res.data.data;
                setCourseData({
                    title: course.title || "",
                    description: course.description || "",
                    difficulty: course.difficulty || "BEGINNER",
                    durationHours: course.durationHours?.toString() || "",
                    thumbnailUrl: course.thumbnailUrl || "",
                    isPublished: course.isPublished
                });

                if (course.modules) {
                    setModules(course.modules.map((m: any) => ({
                        id: m.id,
                        title: m.title || "",
                        description: m.description || "",
                        lessons: (m.lessons || []).map((l: any) => ({
                            id: l.id,
                            title: l.title || "",
                            content: l.content || "",
                            videoUrl: l.videoUrl || "",
                            xpReward: l.xpReward || 10
                        }))
                    })));
                }
            } catch (error) {
                console.error("Failed to fetch course", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourse();
    }, [courseId]);

    const handleCourseChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setCourseData({ ...courseData, [e.target.name]: e.target.value });
    };

    const addModule = () => {
        setModules([...modules, { title: "", description: "", lessons: [], isNew: true }]);
    };

    const removeModule = async (idx: number) => {
        const mod = modules[idx];
        if (mod.id && !mod.isNew) {
            try {
                await api.delete(`/courses/modules/${mod.id}`);
            } catch (error) {
                console.error("Failed to delete module", error);
            }
        }
        setModules(modules.filter((_, i) => i !== idx));
    };

    const updateModule = (idx: number, field: string, value: string) => {
        setModules(modules.map((m, i) => i === idx ? { ...m, [field]: value } : m));
    };

    const addLesson = (modIdx: number) => {
        setModules(modules.map((m, i) =>
            i === modIdx
                ? { ...m, lessons: [...m.lessons, { title: "", content: "", videoUrl: "", xpReward: 10, isNew: true }] }
                : m
        ));
    };

    const removeLesson = async (modIdx: number, lesIdx: number) => {
        const les = modules[modIdx].lessons[lesIdx];
        if (les.id && !les.isNew) {
            try {
                await api.delete(`/courses/lessons/${les.id}`);
            } catch (error) {
                console.error("Failed to delete lesson", error);
            }
        }
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
            await api.put(`/courses/${courseId}`, courseData);

            for (const mod of modules) {
                if (mod.isNew && !mod.id) {
                    const modRes = await api.post(`/courses/${courseId}/modules`, { title: mod.title, description: mod.description });
                    mod.id = modRes.data.data.id;
                    mod.isNew = false;

                    for (const lesson of mod.lessons) {
                        if (!lesson.id) {
                            const lesRes = await api.post(`/courses/modules/${mod.id}/lessons`, lesson);
                            lesson.id = lesRes.data.data.id;
                            lesson.isNew = false;
                        }
                    }
                } else if (mod.id) {
                    await api.put(`/courses/modules/${mod.id}`, { title: mod.title, description: mod.description });

                    for (const lesson of mod.lessons) {
                        if (lesson.isNew && !lesson.id) {
                            const lesRes = await api.post(`/courses/modules/${mod.id}/lessons`, lesson);
                            lesson.id = lesRes.data.data.id;
                            lesson.isNew = false;
                        } else if (lesson.id) {
                            await api.put(`/courses/lessons/${lesson.id}/edit`, lesson);
                        }
                    }
                }
            }

            setMessage({ type: 'success', text: 'Course saved!' });
        } catch (error: any) {
            setMessage({ type: 'error', text: error.response?.data?.error?.message || "Failed to save" });
        } finally {
            setSaving(false);
        }
    };

    const handlePublish = async () => {
        try {
            await api.post(`/courses/${courseId}/publish`);
            setCourseData({ ...courseData, isPublished: true });
            setMessage({ type: 'success', text: 'Course published!' });
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
        <div className="space-y-6 max-w-4xl mx-auto pb-12">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/mentor-courses")}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold tracking-tight">Edit Course</h1>
                    <p className="text-muted-foreground">Update your course content and structure.</p>
                </div>
                {!courseData.isPublished && (
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

            {/* Course Info */}
            <Card>
                <CardHeader><CardTitle className="text-lg flex items-center gap-2"><BookOpen className="h-5 w-5 text-primary" /> Course Information</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Title *</label>
                            <Input name="title" value={courseData.title} onChange={handleCourseChange} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Difficulty</label>
                            <select name="difficulty" value={courseData.difficulty} onChange={handleCourseChange} className="w-full h-10 rounded-md border bg-background px-3 text-sm">
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
                            className="w-full min-h-[100px] px-3 py-2 border rounded-md bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 resize-none text-sm"
                        />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Duration (hours)</label>
                            <Input name="durationHours" type="number" value={courseData.durationHours} onChange={handleCourseChange} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Thumbnail URL</label>
                            <Input name="thumbnailUrl" value={courseData.thumbnailUrl} onChange={handleCourseChange} />
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

                {modules.map((mod, modIdx) => (
                    <Card key={modIdx} className="border-primary/20">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm font-bold text-primary">
                                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                                    Module {modIdx + 1} {mod.isNew && <span className="text-[10px] bg-amber-500/10 text-amber-600 px-1.5 rounded">New</span>}
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
                                    <Input value={mod.title} onChange={(e) => updateModule(modIdx, "title", e.target.value)} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold">Description</label>
                                    <Input value={mod.description} onChange={(e) => updateModule(modIdx, "description", e.target.value)} />
                                </div>
                            </div>

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
                                            <span className="text-xs font-semibold text-muted-foreground">
                                                Lesson {lesIdx + 1} {lesson.isNew && <span className="bg-amber-500/10 text-amber-600 px-1 rounded text-[9px]">New</span>}
                                            </span>
                                            <Button variant="ghost" size="icon" onClick={() => removeLesson(modIdx, lesIdx)} className="h-6 w-6 text-red-500">
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                        <Input value={lesson.title} onChange={(e) => updateLesson(modIdx, lesIdx, "title", e.target.value)} placeholder="Lesson title" className="h-8 text-sm" />
                                        <textarea
                                            value={lesson.content}
                                            onChange={(e) => updateLesson(modIdx, lesIdx, "content", e.target.value)}
                                            placeholder="Lesson content..."
                                            className="w-full min-h-[80px] px-3 py-2 text-sm border rounded-md bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 resize-none"
                                        />
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2">
                                                <label className="text-xs font-semibold text-muted-foreground">Video URL:</label>
                                                <Input value={lesson.videoUrl} onChange={(e) => updateLesson(modIdx, lesIdx, "videoUrl", e.target.value)} className="h-7 text-xs w-64" />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <label className="text-xs font-semibold text-muted-foreground">XP:</label>
                                                <Input type="number" value={lesson.xpReward} onChange={(e) => updateLesson(modIdx, lesIdx, "xpReward", Number(e.target.value))} className="h-7 w-20 text-xs" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Save Button */}
            <div className="flex items-center gap-3 pt-4 border-t">
                <Button onClick={handleSave} disabled={saving || !courseData.title} className="gap-2 flex-1 shadow-lg shadow-primary/20">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save Changes
                </Button>
            </div>
        </div>
    );
}
