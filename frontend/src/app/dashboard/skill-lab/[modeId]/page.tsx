"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
    ArrowLeft, CheckCircle2, Circle, Loader2, Zap, Upload, Timer, Flame,
    PartyPopper, AlertTriangle, SkipForward, RotateCcw, FileText
} from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";

interface Task {
    id: string;
    title: string;
    description: string;
    difficulty: string;
    xpReward: number;
    orderIndex: number;
    isCompleted: boolean;
}

interface ModeData {
    id: string;
    title: string;
    description: string;
    slug: string;
}

interface GeneratedQuestion {
    id: number;
    question: string;
    options: string[];
    correctIndex: number;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
    xpReward: number;
    timeLimit: number;
}

// ==========================================
// CHALLENGE ARENA — Note Upload & Timed Quiz
// ==========================================

function ChallengeArenaUI({ modeId }: { modeId: string }) {
    const [notes, setNotes] = useState("");
    const [generating, setGenerating] = useState(false);
    const [questions, setQuestions] = useState<GeneratedQuestion[]>([]);
    const [topics, setTopics] = useState<string[]>([]);
    const [currentQ, setCurrentQ] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [correctCount, setCorrectCount] = useState(0);
    const [streak, setStreak] = useState(0);
    const [maxStreak, setMaxStreak] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);
    const [quizDone, setQuizDone] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [arenaResult, setArenaResult] = useState<any>(null);
    const [answers, setAnswers] = useState<(number | null)[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Timer logic
    useEffect(() => {
        if (questions.length > 0 && !quizDone && !showFeedback && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        // Time's up — auto-skip
                        handleTimeout();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [questions.length, currentQ, quizDone, showFeedback, timeLeft]);

    const handleTimeout = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        setSelectedAnswer(-1); // timeout
        setShowFeedback(true);
        setStreak(0);
        setAnswers(prev => [...prev, null]);
    };

    const handleGenerate = async () => {
        if (notes.trim().length < 10) return;
        setGenerating(true);
        try {
            const res = await api.post("/skill-lab/challenge-arena/generate", { notes });
            setQuestions(res.data.data.questions);
            setTopics(res.data.data.topics);
            setCurrentQ(0);
            setCorrectCount(0);
            setStreak(0);
            setMaxStreak(0);
            setQuizDone(false);
            setArenaResult(null);
            setAnswers([]);
            setTimeLeft(res.data.data.questions[0]?.timeLimit || 30);
        } catch (err) {
            console.error("Failed to generate challenges:", err);
        } finally {
            setGenerating(false);
        }
    };

    const handleAnswer = (idx: number) => {
        if (selectedAnswer !== null) return;
        if (timerRef.current) clearInterval(timerRef.current);
        setSelectedAnswer(idx);
        setShowFeedback(true);
        setAnswers(prev => [...prev, idx]);
        const q = questions[currentQ];
        if (idx === q.correctIndex) {
            setCorrectCount(prev => prev + 1);
            setStreak(prev => {
                const newStreak = prev + 1;
                setMaxStreak(ms => Math.max(ms, newStreak));
                return newStreak;
            });
        } else {
            setStreak(0);
        }
    };

    const nextQuestion = () => {
        if (currentQ < questions.length - 1) {
            setCurrentQ(prev => prev + 1);
            setSelectedAnswer(null);
            setShowFeedback(false);
            setTimeLeft(questions[currentQ + 1]?.timeLimit || 30);
        } else {
            setQuizDone(true);
            submitResults();
        }
    };

    const submitResults = async () => {
        setSubmitting(true);
        try {
            const res = await api.post("/skill-lab/challenge-arena/submit", {
                correctCount,
                totalQuestions: questions.length,
                streak: maxStreak,
                topics,
            });
            setArenaResult(res.data.data);
        } catch (err) {
            console.error("Failed to submit:", err);
        } finally {
            setSubmitting(false);
        }
    };

    const resetArena = () => {
        setQuestions([]);
        setNotes("");
        setCurrentQ(0);
        setSelectedAnswer(null);
        setShowFeedback(false);
        setCorrectCount(0);
        setStreak(0);
        setMaxStreak(0);
        setQuizDone(false);
        setArenaResult(null);
        setAnswers([]);
    };

    // ---- UPLOAD SCREEN ----
    if (questions.length === 0) {
        return (
            <div className="space-y-6 max-w-2xl mx-auto">
                <Card className="border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-red-500/5">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Upload className="h-5 w-5 text-orange-500" />
                            Paste Your Notes
                        </CardTitle>
                        <CardDescription>
                            Paste your study notes below and we&apos;ll detect the topics and generate 20 interactive timed challenges for you!
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Textarea
                            placeholder="Paste your notes here...

Example: Today I learned about JavaScript closures, async/await patterns, and how React hooks like useState and useEffect work. I also studied CSS flexbox layout and media queries for responsive design..."
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            rows={8}
                            className="text-sm"
                        />
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                                {notes.length} characters {notes.length < 10 && notes.length > 0 ? '(minimum 10)' : ''}
                            </span>
                            <Button onClick={handleGenerate} disabled={notes.trim().length < 10 || generating} className="gap-2">
                                {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                                Generate 20 Challenges
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-dashed border-2 border-muted">
                    <CardContent className="py-6">
                        <div className="text-center space-y-2">
                            <FileText className="h-10 w-10 mx-auto text-muted-foreground/50" />
                            <h3 className="font-semibold text-sm">How it works</h3>
                            <div className="grid gap-3 text-xs text-muted-foreground max-w-md mx-auto text-left">
                                <div className="flex gap-2"><Badge className="h-5 w-5 p-0 flex items-center justify-center text-[10px] shrink-0">1</Badge> Paste your study notes or lecture content</div>
                                <div className="flex gap-2"><Badge className="h-5 w-5 p-0 flex items-center justify-center text-[10px] shrink-0">2</Badge> System detects topics (JS, CSS, React, SQL, etc.)</div>
                                <div className="flex gap-2"><Badge className="h-5 w-5 p-0 flex items-center justify-center text-[10px] shrink-0">3</Badge> 20 timed challenges generated based on your content</div>
                                <div className="flex gap-2"><Badge className="h-5 w-5 p-0 flex items-center justify-center text-[10px] shrink-0">4</Badge> Answer within the time limit to earn XP + streak bonuses</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // ---- RESULTS SCREEN ----
    if (quizDone) {
        const pct = Math.round((correctCount / questions.length) * 100);
        return (
            <div className="space-y-6 max-w-2xl mx-auto">
                <Card className={`border-2 ${pct >= 80 ? 'border-green-500/30 bg-green-500/5' : pct >= 50 ? 'border-amber-500/30 bg-amber-500/5' : 'border-red-500/30 bg-red-500/5'}`}>
                    <CardContent className="py-8 text-center space-y-4">
                        <div className="text-5xl">{pct >= 80 ? '🏆' : pct >= 50 ? '⭐' : '📚'}</div>
                        <h2 className="text-2xl font-bold">{pct >= 80 ? 'Challenge Mastered!' : pct >= 50 ? 'Good Effort!' : 'Keep Studying!'}</h2>
                        <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-500">{correctCount}</div>
                                <div className="text-xs text-muted-foreground">Correct</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-red-500">{questions.length - correctCount}</div>
                                <div className="text-xs text-muted-foreground">Incorrect</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-orange-500 flex items-center justify-center gap-1"><Flame className="h-5 w-5" />{maxStreak}</div>
                                <div className="text-xs text-muted-foreground">Best Streak</div>
                            </div>
                        </div>
                        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                            Topics: {topics.map(t => <Badge key={t} variant="secondary" className="text-xs capitalize">{t}</Badge>)}
                        </div>

                        {submitting && <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />}
                        {arenaResult && (
                            <div className={`p-4 rounded-lg border mx-auto max-w-md ${arenaResult.passed ? 'bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-400'}`}>
                                <p className="text-sm font-semibold flex items-center justify-center gap-2">
                                    {arenaResult.passed ? <PartyPopper className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                                    {arenaResult.feedback}
                                </p>
                                <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
                                    <div>Base XP: <span className="font-bold text-amber-500">+{arenaResult.baseXp}</span></div>
                                    <div>Streak Bonus: <span className="font-bold text-orange-500">+{arenaResult.streakXp}</span></div>
                                    <div>Total XP: <span className="font-bold text-primary">+{arenaResult.totalXp}</span></div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Answer Review */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">📋 Answer Review</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-2">
                            {questions.map((q, i) => {
                                const userAnswer = answers[i];
                                const wasCorrect = userAnswer === q.correctIndex;
                                const wasTimeout = userAnswer === null;
                                return (
                                    <div key={i} className={`flex items-center gap-3 p-2 rounded-lg text-xs ${wasCorrect ? 'bg-green-500/5' : wasTimeout ? 'bg-muted' : 'bg-red-500/5'}`}>
                                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border shrink-0 ${wasCorrect ? 'bg-green-500/20 border-green-500 text-green-600' :
                                            wasTimeout ? 'bg-muted-foreground/10 border-muted-foreground/30 text-muted-foreground' :
                                                'bg-red-500/20 border-red-500 text-red-600'
                                            }`}>{i + 1}</span>
                                        <span className="flex-1 truncate">{q.question}</span>
                                        <span className="shrink-0">
                                            {wasCorrect ? '✅' : wasTimeout ? '⏰' : `❌ → ${q.options[q.correctIndex]}`}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                <Button onClick={resetArena} variant="outline" className="w-full gap-2">
                    <RotateCcw className="h-4 w-4" /> Paste New Notes
                </Button>
            </div>
        );
    }

    // ---- QUIZ SCREEN ----
    const q = questions[currentQ];
    const timerPct = (timeLeft / q.timeLimit) * 100;
    const timerColor = timeLeft <= 5 ? 'bg-red-500' : timeLeft <= 10 ? 'bg-amber-500' : 'bg-green-500';

    return (
        <div className="space-y-5 max-w-2xl mx-auto">
            {/* Top Stats */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Badge variant="outline" className="text-xs">Q {currentQ + 1}/{questions.length}</Badge>
                    <Badge variant="outline" className={`text-xs ${q.difficulty === 'EASY' ? 'bg-green-500/10 text-green-600 border-green-500/30' : q.difficulty === 'MEDIUM' ? 'bg-amber-500/10 text-amber-600 border-amber-500/30' : 'bg-red-500/10 text-red-600 border-red-500/30'}`}>
                        {q.difficulty}
                    </Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1"><Zap className="h-3 w-3 text-amber-500" />{q.xpReward} XP</span>
                </div>
                <div className="flex items-center gap-3">
                    {streak > 0 && (
                        <Badge className="bg-orange-500/20 text-orange-500 border-orange-500/30 text-xs gap-1">
                            <Flame className="h-3 w-3" /> {streak} streak
                        </Badge>
                    )}
                    <span className="text-xs text-green-500 font-mono">{correctCount} ✓</span>
                </div>
            </div>

            {/* Timer Bar */}
            <div className="relative">
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-1000 ${timerColor}`}
                        style={{ width: `${timerPct}%` }}
                    />
                </div>
                <div className="flex items-center justify-between mt-1">
                    <span className={`text-xs font-mono flex items-center gap-1 ${timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-muted-foreground'}`}>
                        <Timer className="h-3 w-3" /> {timeLeft}s
                    </span>
                    <span className="text-xs text-muted-foreground">{Math.round(((currentQ) / questions.length) * 100)}% complete</span>
                </div>
            </div>

            {/* Question Card */}
            <Card className="border-primary/20">
                <CardContent className="py-6">
                    <p className="text-base font-medium leading-relaxed">{q.question}</p>
                </CardContent>
            </Card>

            {/* Options */}
            <div className="grid gap-3">
                {q.options.map((opt, idx) => {
                    const isSelected = selectedAnswer === idx;
                    const isRevealed = selectedAnswer !== null;
                    const isCorrect = idx === q.correctIndex;
                    let borderClass = 'border-border hover:border-primary/40';
                    let bgClass = '';
                    if (isRevealed) {
                        if (isCorrect) {
                            borderClass = 'border-green-500';
                            bgClass = 'bg-green-500/10';
                        } else if (isSelected && !isCorrect) {
                            borderClass = 'border-red-500';
                            bgClass = 'bg-red-500/10';
                        } else {
                            borderClass = 'border-border opacity-50';
                        }
                    }
                    return (
                        <button key={idx} onClick={() => handleAnswer(idx)} disabled={isRevealed}
                            className={`text-left p-4 rounded-lg border-2 transition-all ${borderClass} ${bgClass} ${isRevealed ? 'cursor-default' : 'cursor-pointer'}`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border ${isRevealed && isCorrect ? 'bg-green-500 border-green-500 text-white' :
                                        isRevealed && isSelected ? 'bg-red-500 border-red-500 text-white' :
                                            'border-border text-muted-foreground'
                                        }`}>{String.fromCharCode(65 + idx)}</span>
                                    <span className="text-sm">{opt}</span>
                                </div>
                                {isRevealed && isCorrect && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                                {isRevealed && isSelected && !isCorrect && <AlertTriangle className="h-4 w-4 text-red-500" />}
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Timeout indicator */}
            {selectedAnswer === -1 && (
                <div className="p-3 rounded-lg bg-muted border border-muted-foreground/20 text-center text-sm text-muted-foreground">
                    ⏰ Time&apos;s up! The correct answer was: <span className="font-semibold text-foreground">{q.options[q.correctIndex]}</span>
                </div>
            )}

            {/* Next Button */}
            {showFeedback && (
                <Button onClick={nextQuestion} className="w-full gap-2">
                    {currentQ < questions.length - 1
                        ? <><SkipForward className="h-4 w-4" /> Next Question</>
                        : <><PartyPopper className="h-4 w-4" /> Finish Challenge</>
                    }
                </Button>
            )}
        </div>
    );
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function ModeTasksPage() {
    const params = useParams();
    const modeId = params.modeId as string;
    const [mode, setMode] = useState<ModeData | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const res = await api.get(`/skill-lab/modes/${modeId}/tasks`);
                setMode(res.data.data.mode);
                setTasks(res.data.data.tasks);
            } catch (err) {
                console.error("Failed to fetch tasks:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchTasks();
    }, [modeId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    // ======== CHALLENGE ARENA MODE ========
    if (mode?.slug === 'challenge-arena') {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/skill-lab">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                            <Timer className="h-7 w-7 text-orange-500" /> {mode.title}
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Paste your notes → Get 20 timed challenges → Earn XP + streak bonuses
                        </p>
                    </div>
                </div>
                <ChallengeArenaUI modeId={modeId} />
            </div>
        );
    }

    // ======== DEFAULT MODE: TASK LIST ========
    const completedCount = tasks.filter(t => t.isCompleted).length;

    const difficultyColor = (d: string) => {
        switch (d) {
            case "EASY": return "bg-green-500/10 text-green-600 border-green-500/20";
            case "MEDIUM": return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
            case "HARD": return "bg-red-500/10 text-red-600 border-red-500/20";
            default: return "bg-muted text-muted-foreground";
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/skill-lab">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{mode?.title}</h1>
                    <p className="text-muted-foreground mt-1">
                        {completedCount}/{tasks.length} tasks completed • {mode?.description}
                    </p>
                </div>
            </div>

            {/* Progress overview */}
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${tasks.length ? (completedCount / tasks.length) * 100 : 0}%` }}
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {tasks.map((task) => (
                    <Card
                        key={task.id}
                        className={`relative transition-all hover:shadow-md ${task.isCompleted
                            ? "border-green-500/30 bg-green-500/5"
                            : "border-border/50 hover:border-primary/30"
                            }`}
                    >
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    {task.isCompleted ? (
                                        <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                                    ) : (
                                        <Circle className="h-5 w-5 text-muted-foreground shrink-0" />
                                    )}
                                    <CardTitle className="text-base">
                                        #{task.orderIndex} {task.title}
                                    </CardTitle>
                                </div>
                                <Badge variant="outline" className={difficultyColor(task.difficulty)}>
                                    {task.difficulty}
                                </Badge>
                            </div>
                            <CardDescription className="ml-7">{task.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0 flex items-center justify-between ml-7">
                            <div className="flex items-center gap-1 text-sm text-amber-500 font-medium">
                                <Zap className="h-4 w-4" />
                                {task.xpReward} XP
                            </div>
                            <Link href={`/dashboard/skill-lab/${modeId}/${task.id}`}>
                                <Button size="sm" variant={task.isCompleted ? "outline" : "default"}>
                                    {task.isCompleted ? "Review" : "Start"}
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
