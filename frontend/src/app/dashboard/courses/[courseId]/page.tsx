"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BookOpen, CheckCircle, Clock, Lock, Play, Trophy } from "lucide-react";
import Link from "next/link";

interface Lesson {
    id: string;
    title: string;
    orderIndex: number;
    xpReward: number;
    readingTimeMinutes: number;
}

interface Module {
    id: string;
    title: string;
    description: string;
    orderIndex: number;
    lessons: Lesson[];
}

interface Course {
    id: string;
    title: string;
    description: string;
    difficulty: string;
    durationHours: number;
    thumbnailUrl: string;
    modules: Module[];
    isEnrolled: boolean;
    completedLessonIds: string[];
}

export default function CourseDetailPage() {
    const { courseId } = useParams();
    const router = useRouter();
    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    const [enrolling, setEnrolling] = useState(false);

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const res = await api.get(`/courses/${courseId}`);
                setCourse(res.data.data || res.data);
            } catch (error) {
                console.error("Failed to fetch course", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourse();
    }, [courseId]);

    const handleEnroll = async () => {
        setEnrolling(true);
        try {
            await api.post(`/courses/${courseId}/enroll`);
            setCourse(prev => prev ? { ...prev, isEnrolled: true } : null);
        } catch (error) {
            console.error("Failed to enroll", error);
        } finally {
            setEnrolling(false);
        }
    };

    const isLessonUnlocked = (moduleIndex: number, lessonIndex: number): boolean => {
        if (!course?.isEnrolled) return false;
        // User requested lessons be accessible to revisit and continue from where they stopped.
        // We permit all lessons for enrolled users for now, or we could keep the progression.
        // Let's keep progression but ensure completed lessons are always unlocked.
        if (moduleIndex === 0 && lessonIndex === 0) return true;

        const allLessons: { id: string; moduleIdx: number; lessonIdx: number }[] = [];
        course.modules.forEach((mod, mIdx) => {
            mod.lessons.forEach((lesson, lIdx) => {
                allLessons.push({ id: lesson.id, moduleIdx: mIdx, lessonIdx: lIdx });
            });
        });

        const currentPosition = allLessons.findIndex(
            l => l.moduleIdx === moduleIndex && l.lessonIdx === lessonIndex
        );

        if (currentPosition === 0) return true;

        // A lesson is unlocked if it's already completed OR the previous lesson is completed.
        const currentLessonId = allLessons[currentPosition].id;
        if (course.completedLessonIds.includes(currentLessonId)) return true;

        const previousLesson = allLessons[currentPosition - 1];
        return course.completedLessonIds.includes(previousLesson.id);
    };

    const isLessonCompleted = (lessonId: string): boolean => {
        return course?.completedLessonIds.includes(lessonId) || false;
    };

    const getTotalLessons = (): number => {
        return course?.modules.reduce((acc, mod) => acc + mod.lessons.length, 0) || 0;
    };

    const getCompletedCount = (): number => {
        return course?.completedLessonIds.length || 0;
    };

    const getProgressPercent = (): number => {
        const total = getTotalLessons();
        if (total === 0) return 0;
        return Math.round((getCompletedCount() / total) * 100);
    };

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    if (!course) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">Course not found</p>
                <Link href="/dashboard/courses">
                    <Button variant="outline" className="mt-4">Back to Courses</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold">{course.title}</h1>
                    <p className="text-muted-foreground">{course.description}</p>
                </div>
            </div>

            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-wrap items-center gap-4">
                        <Badge variant="secondary">{course.difficulty}</Badge>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            {course.durationHours} hours
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <BookOpen className="h-4 w-4" />
                            {getTotalLessons()} lessons
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Trophy className="h-4 w-4" />
                            {course.modules.reduce((acc, m) => acc + m.lessons.reduce((a, l) => a + l.xpReward, 0), 0)} XP total
                        </div>
                    </div>

                    {course.isEnrolled ? (
                        <div className="mt-4">
                            <div className="flex items-center justify-between text-sm mb-2">
                                <span className="text-muted-foreground">Progress</span>
                                <span className="font-medium">{getCompletedCount()} / {getTotalLessons()} completed</span>
                            </div>
                            <div className="h-2 rounded-full bg-secondary">
                                <div
                                    className="h-full rounded-full bg-primary transition-all"
                                    style={{ width: `${getProgressPercent()}%` }}
                                />
                            </div>
                        </div>
                    ) : (
                        <Button className="mt-4" onClick={handleEnroll} disabled={enrolling}>
                            {enrolling ? "Enrolling..." : "Enroll Now - Free"}
                        </Button>
                    )}
                </CardContent>
            </Card>

            <div className="space-y-4">
                {course.modules.sort((a, b) => a.orderIndex - b.orderIndex).map((module, moduleIndex) => (
                    <Card key={module.id}>
                        <CardHeader>
                            <CardTitle className="text-lg">
                                Module {module.orderIndex}: {module.title}
                            </CardTitle>
                            <CardDescription>{module.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {module.lessons.sort((a, b) => a.orderIndex - b.orderIndex).map((lesson, lessonIndex) => {
                                const unlocked = isLessonUnlocked(moduleIndex, lessonIndex);
                                const completed = isLessonCompleted(lesson.id);

                                return (
                                    <div
                                        key={lesson.id}
                                        className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${unlocked
                                            ? "hover:bg-accent cursor-pointer"
                                            : "opacity-60 cursor-not-allowed bg-muted/50"
                                            }`}
                                        onClick={() => unlocked && router.push(`/dashboard/courses/${courseId}/lessons/${lesson.id}`)}
                                    >
                                        <div className={`flex h-8 w-8 items-center justify-center rounded-full ${completed
                                            ? "bg-green-500 text-white"
                                            : unlocked
                                                ? "bg-primary text-primary-foreground"
                                                : "bg-muted text-muted-foreground"
                                            }`}>
                                            {completed ? (
                                                <CheckCircle className="h-4 w-4" />
                                            ) : unlocked ? (
                                                <Play className="h-4 w-4" />
                                            ) : (
                                                <Lock className="h-4 w-4" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium">{lesson.title}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {lesson.readingTimeMinutes} min • {lesson.xpReward} XP
                                            </p>
                                        </div>
                                        {completed && (
                                            <Badge variant="outline" className="text-green-600 border-green-600">
                                                Completed
                                            </Badge>
                                        )}
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
