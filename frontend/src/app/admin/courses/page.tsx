"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Loader2, BookOpen } from "lucide-react";
import api from "@/lib/api";

interface Course {
    id: string;
    title: string;
    difficulty: string;
    _count: {
        modules: number;
    };
}

export default function AdminCoursesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const res = await api.get("/courses");
            setCourses(res.data.data);
        } catch (error) {
            console.error("Failed to fetch courses", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-slate-100">Course Management</h1>
                <Link href="/admin/courses/new">
                    <Button className="bg-primary hover:bg-primary/90">
                        <Plus className="mr-2 h-4 w-4" /> New Course
                    </Button>
                </Link>
            </div>

            <Card className="border-slate-800 bg-slate-900/50">
                <CardHeader>
                    <CardTitle className="text-slate-100 flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-primary" />
                        All Courses
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : courses.length === 0 ? (
                        <div className="text-center p-8 text-slate-400">
                            No courses found. Create your first one.
                        </div>
                    ) : (
                        <div className="relative w-full overflow-auto">
                            <table className="w-full caption-bottom text-sm text-left">
                                <thead className="[&_tr]:border-b [&_tr]:border-slate-700">
                                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                        <th className="h-12 px-4 align-middle font-medium text-slate-400">Title</th>
                                        <th className="h-12 px-4 align-middle font-medium text-slate-400">Difficulty</th>
                                        <th className="h-12 px-4 align-middle font-medium text-slate-400">Modules</th>
                                        <th className="h-12 px-4 align-middle font-medium text-slate-400 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="[&_tr:last-child]:border-0">
                                    {courses.map((course) => (
                                        <tr key={course.id} className="border-b border-slate-800 transition-colors hover:bg-slate-800/50">
                                            <td className="p-4 align-middle font-medium text-slate-200">{course.title}</td>
                                            <td className="p-4 align-middle text-slate-300 capitalize">{course.difficulty.toLowerCase()}</td>
                                            <td className="p-4 align-middle text-slate-300">{course._count?.modules || 0}</td>
                                            <td className="p-4 align-middle text-right">
                                                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                                                    Edit
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
