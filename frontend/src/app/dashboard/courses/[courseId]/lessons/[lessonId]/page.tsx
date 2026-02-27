"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, CheckCircle, Clock, Trophy, PlayCircle, BookOpen } from "lucide-react";
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
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
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
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">{lesson.title}</h1>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        Reading + Video Lesson
                    </span>
                </div>
            </div>

            {/* Video Section */}
            {lesson.videoUrl && (
                <Card className="overflow-hidden border-primary/20">
                    <div className="p-4 border-b bg-muted/30 flex items-center gap-2">
                        <PlayCircle className="h-5 w-5 text-primary" />
                        <h2 className="font-semibold text-sm">Video Lesson</h2>
                        <span className="text-xs text-muted-foreground ml-auto">Watch the video, then read the notes below</span>
                    </div>
                    <CardContent className="p-0">
                        <div className="aspect-video bg-black">
                            <iframe
                                src={lesson.videoUrl}
                                className="w-full h-full"
                                allowFullScreen
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                title={`Video: ${lesson.title}`}
                            />
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Written Content Section */}
            <Card>
                <div className="p-4 border-b bg-muted/30 flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <h2 className="font-semibold text-sm">Written Notes</h2>
                </div>
                <CardContent className="pt-8 pb-10 px-8">
                    <div className="lesson-content">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                                h1: ({ children }) => (
                                    <h1 className="text-2xl font-bold mt-0 mb-6 text-foreground border-b border-border pb-3">{children}</h1>
                                ),
                                h2: ({ children }) => (
                                    <h2 className="text-xl font-bold mt-10 mb-4 text-foreground">{children}</h2>
                                ),
                                h3: ({ children }) => (
                                    <h3 className="text-lg font-semibold mt-8 mb-3 text-foreground">{children}</h3>
                                ),
                                h4: ({ children }) => (
                                    <h4 className="text-base font-semibold mt-6 mb-2 text-foreground">{children}</h4>
                                ),
                                p: ({ children }) => (
                                    <p className="text-[15px] leading-7 mb-5 text-foreground/90">{children}</p>
                                ),
                                ul: ({ children }) => (
                                    <ul className="list-disc pl-6 mb-6 space-y-2">{children}</ul>
                                ),
                                ol: ({ children }) => (
                                    <ol className="list-decimal pl-6 mb-6 space-y-2">{children}</ol>
                                ),
                                li: ({ children }) => (
                                    <li className="text-[15px] leading-7 text-foreground/90">{children}</li>
                                ),
                                blockquote: ({ children }) => (
                                    <blockquote className="border-l-4 border-primary/50 bg-primary/5 px-4 py-3 my-6 rounded-r-lg text-foreground/80 italic">{children}</blockquote>
                                ),
                                code: ({ className, children, ...props }) => {
                                    const isInline = !className;
                                    if (isInline) {
                                        return (
                                            <code className="bg-muted text-primary px-1.5 py-0.5 rounded text-[13px] font-mono font-medium" {...props}>
                                                {children}
                                            </code>
                                        );
                                    }
                                    return (
                                        <code className={`block bg-slate-950 text-green-400 p-5 rounded-lg text-sm font-mono leading-6 overflow-x-auto my-6 border border-border/50 ${className}`} {...props}>
                                            {children}
                                        </code>
                                    );
                                },
                                pre: ({ children }) => (
                                    <pre className="my-6 rounded-lg overflow-hidden">{children}</pre>
                                ),
                                table: ({ children }) => (
                                    <div className="overflow-x-auto my-6 rounded-lg border border-border">
                                        <table className="w-full text-sm">{children}</table>
                                    </div>
                                ),
                                thead: ({ children }) => (
                                    <thead className="bg-muted/70 text-foreground font-semibold">{children}</thead>
                                ),
                                th: ({ children }) => (
                                    <th className="px-4 py-3 text-left border-b border-border font-semibold text-sm">{children}</th>
                                ),
                                td: ({ children }) => (
                                    <td className="px-4 py-3 border-b border-border/50 text-foreground/80">{children}</td>
                                ),
                                hr: () => (
                                    <hr className="my-8 border-border" />
                                ),
                                strong: ({ children }) => (
                                    <strong className="font-bold text-foreground">{children}</strong>
                                ),
                                a: ({ href, children }) => (
                                    <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
                                        {children}
                                    </a>
                                ),
                            }}
                        >
                            {lesson.content}
                        </ReactMarkdown>
                    </div>
                </CardContent>
            </Card>

            {/* Navigation & Complete */}
            <div className="flex items-center justify-between border-t pt-8">
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
                            className="gap-2 shadow-lg shadow-primary/20"
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
