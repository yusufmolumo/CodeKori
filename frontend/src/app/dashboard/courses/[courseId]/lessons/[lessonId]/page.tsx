"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, CheckCircle, Clock, Trophy } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Lesson {
    id: string;
    title: string;
    content: string;
    videoUrl: string | null;
    xpReward: number;
    readingTimeMinutes: number;
    isCompleted: boolean;
    previousLessonId: string | null;
    nextLessonId: string | null;
    module: {
        title: string;
        course: {
            id: string;
            title: string;
        };
    };
}

export default function LessonPage() {
    const { courseId, lessonId } = useParams();
    const router = useRouter();
    const [lesson, setLesson] = useState<Lesson | null>(null);
    const [loading, setLoading] = useState(true);
    const [completing, setCompleting] = useState(false);

    useEffect(() => {
        const fetchLesson = async () => {
            try {
                const res = await api.get(`/courses/lessons/${lessonId}`);
                setLesson(res.data.data || res.data);
            } catch (error) {
                console.error("Failed to fetch lesson", error);
            } finally {
                setLoading(false);
            }
        };
        fetchLesson();
    }, [lessonId]);

    const handleComplete = async () => {
        setCompleting(true);
        try {
            const res = await api.post(`/courses/lessons/${lessonId}/complete`);
            setLesson(prev => prev ? { ...prev, isCompleted: true } : null);

            // Show XP earned
            if (res.data.xpEarned) {
                // Could add a toast notification here
            }
        } catch (error) {
            console.error("Failed to complete lesson", error);
        } finally {
            setCompleting(false);
        }
    };

    const navigateTo = (targetLessonId: string | null) => {
        if (targetLessonId) {
            router.push(`/dashboard/courses/${courseId}/lessons/${targetLessonId}`);
        }
    };

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    if (!lesson) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">Lesson not found</p>
                <Button variant="outline" className="mt-4" onClick={() => router.back()}>
                    Go Back
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Navigation Header */}
            <div className="flex items-center justify-between">
                <Button
                    variant="ghost"
                    onClick={() => router.push(`/dashboard/courses/${courseId}`)}
                    className="gap-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Course
                </Button>
                <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="gap-1">
                        <Clock className="h-3 w-3" />
                        {lesson.readingTimeMinutes} min
                    </Badge>
                    <Badge variant="secondary" className="gap-1">
                        <Trophy className="h-3 w-3" />
                        {lesson.xpReward} XP
                    </Badge>
                    {lesson.isCompleted && (
                        <Badge className="gap-1 bg-green-500">
                            <CheckCircle className="h-3 w-3" />
                            Completed
                        </Badge>
                    )}
                </div>
            </div>

            {/* Breadcrumb */}
            <div className="text-sm text-muted-foreground">
                {lesson.module.course.title} → {lesson.module.title}
            </div>

            {/* Lesson Title */}
            <h1 className="text-3xl font-bold">{lesson.title}</h1>

            {/* Video (if exists) */}
            {lesson.videoUrl && (
                <Card>
                    <CardContent className="pt-6">
                        <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                            <iframe
                                src={lesson.videoUrl}
                                className="w-full h-full"
                                allowFullScreen
                            />
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Lesson Content */}
            <Card>
                <CardContent className="pt-6 prose prose-slate dark:prose-invert max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {lesson.content}
                    </ReactMarkdown>
                </CardContent>
            </Card>

            {/* Navigation & Complete */}
            <div className="flex items-center justify-between border-t pt-6">
                <Button
                    variant="outline"
                    onClick={() => navigateTo(lesson.previousLessonId)}
                    disabled={!lesson.previousLessonId}
                    className="gap-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Previous
                </Button>

                <div className="flex gap-2">
                    {!lesson.isCompleted ? (
                        <Button
                            onClick={handleComplete}
                            disabled={completing}
                            className="gap-2"
                        >
                            <CheckCircle className="h-4 w-4" />
                            {completing ? "Completing..." : "Mark as Complete"}
                        </Button>
                    ) : lesson.nextLessonId ? (
                        <Button
                            onClick={() => navigateTo(lesson.nextLessonId)}
                            className="gap-2"
                        >
                            Next Lesson
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    ) : (
                        <Button
                            onClick={() => router.push(`/dashboard/courses/${courseId}`)}
                            className="gap-2 bg-green-500 hover:bg-green-600"
                        >
                            <Trophy className="h-4 w-4" />
                            Course Complete!
                        </Button>
                    )}
                </div>

                <Button
                    variant="outline"
                    onClick={() => navigateTo(lesson.nextLessonId)}
                    disabled={!lesson.nextLessonId || !lesson.isCompleted}
                    className="gap-2"
                >
                    Next
                    <ArrowRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
