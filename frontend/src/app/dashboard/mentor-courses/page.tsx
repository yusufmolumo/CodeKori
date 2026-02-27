"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Edit, Trash2, Eye, BookOpen, Users, Globe } from "lucide-react";
import { useRouter } from "next/navigation";

interface MentorCourse {
    id: string;
    title: string;
    description: string | null;
    difficulty: string | null;
    isPublished: boolean;
    createdAt: string;
    _count: { modules: number; enrollments: number };
}

export default function MentorCoursesPage() {
    const [courses, setCourses] = useState<MentorCourse[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const res = await api.get("/courses/my-courses");
            setCourses(res.data.data || []);
        } catch (error) {
            console.error("Failed to fetch courses", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this course? This cannot be undone.")) return;
        try {
            await api.delete(`/courses/${id}`);
            setCourses(prev => prev.filter(c => c.id !== id));
        } catch (error) {
            console.error("Failed to delete course", error);
        }
    };

    const handlePublish = async (id: string) => {
        try {
            await api.post(`/courses/${id}/publish`);
            setCourses(prev => prev.map(c => c.id === id ? { ...c, isPublished: true } : c));
        } catch (error) {
            console.error("Failed to publish course", error);
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
                    <h1 className="text-3xl font-bold tracking-tight">My Courses</h1>
                    <p className="text-muted-foreground">Create and manage your educational courses.</p>
                </div>
                <Button onClick={() => router.push("/dashboard/mentor-courses/create")} className="gap-2 shadow-lg shadow-primary/20">
                    <Plus className="h-4 w-4" /> Create Course
                </Button>
            </div>

            {courses.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                        <BookOpen className="h-12 w-12 text-muted-foreground/50 mb-4" />
                        <h3 className="text-lg font-semibold mb-1">No courses yet</h3>
                        <p className="text-sm text-muted-foreground mb-4">Create your first course to start teaching.</p>
                        <Button onClick={() => router.push("/dashboard/mentor-courses/create")} className="gap-2">
                            <Plus className="h-4 w-4" /> Create Your First Course
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {courses.map(course => (
                        <Card key={course.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-bold truncate">{course.title}</h3>
                                            {course.isPublished ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-500/10 text-green-600 border border-green-500/20">
                                                    <Globe className="h-3 w-3" /> Published
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                                                    Draft
                                                </span>
                                            )}
                                            {course.difficulty && (
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary">
                                                    {course.difficulty}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                            {course.description || "No description"}
                                        </p>
                                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <BookOpen className="h-3 w-3" /> {course._count.modules} modules
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Users className="h-3 w-3" /> {course._count.enrollments} enrolled
                                            </span>
                                            <span>Created {new Date(course.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        {!course.isPublished && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handlePublish(course.id)}
                                                className="gap-1 text-green-600 border-green-500/30 hover:bg-green-500/10"
                                            >
                                                <Eye className="h-3 w-3" /> Publish
                                            </Button>
                                        )}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => router.push(`/dashboard/mentor-courses/${course.id}/edit`)}
                                            className="gap-1"
                                        >
                                            <Edit className="h-3 w-3" /> Edit
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDelete(course.id)}
                                            className="gap-1 text-red-500 border-red-500/30 hover:bg-red-500/10"
                                        >
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
