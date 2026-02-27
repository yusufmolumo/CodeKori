"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, CheckCircle2, Loader2, Zap, Lightbulb, Send, PartyPopper } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";

interface TaskData {
    id: string;
    title: string;
    description: string;
    scenario: string;
    difficulty: string;
    xpReward: number;
    taskData: any;
    mode: { id: string; title: string; slug: string };
    userSubmission: { passed: boolean; score: number } | null;
}

export default function TaskPage() {
    const params = useParams();
    const router = useRouter();
    const modeId = params.modeId as string;
    const taskId = params.taskId as string;

    const [task, setTask] = useState<TaskData | null>(null);
    const [loading, setLoading] = useState(true);
    const [answer, setAnswer] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState<{ passed: boolean; xpEarned: number; feedback: string } | null>(null);

    useEffect(() => {
        const fetchTask = async () => {
            try {
                const res = await api.get(`/skill-lab/tasks/${taskId}`);
                setTask(res.data.data);
            } catch (err) {
                console.error("Failed to fetch task:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchTask();
    }, [taskId]);

    const handleSubmit = async () => {
        if (!answer.trim()) return;
        setSubmitting(true);
        setResult(null);
        try {
            const res = await api.post(`/skill-lab/tasks/${taskId}/submit`, { answer });
            setResult(res.data.data);
            if (res.data.data.passed) {
                setTask(prev => prev ? { ...prev, userSubmission: { passed: true, score: 100 } } : prev);
            }
        } catch (err) {
            console.error("Submission failed:", err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleSelectOption = (option: string) => {
        setAnswer(option);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!task) {
        return <div className="text-center text-muted-foreground py-12">Task not found.</div>;
    }

    const isCompleted = task.userSubmission?.passed;
    const hasOptions = task.taskData?.correctOption;
    const options = hasOptions ? ["A", "B", "C", "D"] : null;

    // Extract option labels from scenario text
    const getOptionLabel = (scenario: string, letter: string) => {
        const regex = new RegExp(`${letter}\\)\\s*(.+?)(?:\\n|$)`);
        const match = scenario.match(regex);
        return match ? match[1].trim() : letter;
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href={`/dashboard/skill-lab/${modeId}`}>
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold">{task.title}</h1>
                        {isCompleted && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                        <Badge variant="secondary" className="text-xs">{task.mode.title}</Badge>
                        <Badge variant="outline" className="text-xs">{task.difficulty}</Badge>
                        <span className="flex items-center gap-1 text-sm text-amber-500 font-medium">
                            <Zap className="h-3.5 w-3.5" /> {task.xpReward} XP
                        </span>
                    </div>
                </div>
            </div>

            {/* Scenario */}
            <Card className="border-primary/20">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-amber-500" />
                        Scenario
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <pre className="whitespace-pre-wrap text-sm text-muted-foreground font-mono bg-muted/50 rounded-lg p-4 leading-relaxed">
                        {task.scenario}
                    </pre>
                </CardContent>
            </Card>

            {/* Answer Section */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">Your Answer</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {options ? (
                        <div className="grid gap-3 sm:grid-cols-2">
                            {options.map((opt) => (
                                <button
                                    key={opt}
                                    onClick={() => handleSelectOption(opt)}
                                    disabled={!!isCompleted}
                                    className={`text-left p-4 rounded-lg border-2 transition-all text-sm ${answer === opt
                                            ? "border-primary bg-primary/10 text-foreground"
                                            : "border-border hover:border-primary/40 text-muted-foreground hover:text-foreground"
                                        } ${isCompleted ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                                >
                                    <span className="font-bold mr-2">{opt})</span>
                                    {getOptionLabel(task.scenario, opt)}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <Textarea
                            placeholder="Type your answer here..."
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            rows={5}
                            disabled={!!isCompleted}
                            className="font-mono text-sm"
                        />
                    )}

                    {/* Submit / Result */}
                    {!isCompleted && (
                        <Button
                            onClick={handleSubmit}
                            disabled={!answer.trim() || submitting}
                            className="w-full sm:w-auto"
                        >
                            {submitting ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Send className="mr-2 h-4 w-4" />
                            )}
                            Submit Answer
                        </Button>
                    )}

                    {result && (
                        <div className={`p-4 rounded-lg border ${result.passed
                                ? "bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-400"
                                : "bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-400"
                            }`}>
                            <div className="flex items-center gap-2 font-semibold">
                                {result.passed ? (
                                    <><PartyPopper className="h-5 w-5" /> Correct!</>
                                ) : (
                                    "Not Quite Right"
                                )}
                            </div>
                            <p className="text-sm mt-1">{result.feedback}</p>
                            {result.xpEarned > 0 && (
                                <p className="text-sm mt-1 flex items-center gap-1 font-medium">
                                    <Zap className="h-4 w-4 text-amber-500" /> +{result.xpEarned} XP earned!
                                </p>
                            )}
                        </div>
                    )}

                    {isCompleted && !result && (
                        <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-400">
                            <div className="flex items-center gap-2 font-semibold">
                                <CheckCircle2 className="h-5 w-5" /> Already Completed
                            </div>
                            <p className="text-sm mt-1">You&apos;ve already solved this task. Great work!</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
