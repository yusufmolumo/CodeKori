"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, CheckCircle, HelpCircle, Lightbulb, Send, Trophy, XCircle } from "lucide-react";
import Link from "next/link";

interface Challenge {
    id: string;
    title: string;
    description: string;
    difficulty: string;
    starterCode: string;
    hints: string[];
    xpReward: number;
    isSolved: boolean;
    attemptCount: number;
    showHint: boolean;
    userSubmission?: {
        submittedCode: string;
        passed: boolean;
    };
}

export default function ChallengeDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [challenge, setChallenge] = useState<Challenge | null>(null);
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState<{ passed: boolean; xpEarned: number; message: string } | null>(null);
    const [showHints, setShowHints] = useState(false);

    useEffect(() => {
        const fetchChallenge = async () => {
            try {
                const res = await api.get(`/challenges/${id}`);
                const data = res.data.data || res.data;
                setChallenge(data);
                setCode(data.userSubmission?.submittedCode || data.starterCode || "");
                if (data.showHint) setShowHints(true);
            } catch (error) {
                console.error("Failed to fetch challenge", error);
            } finally {
                setLoading(false);
            }
        };
        fetchChallenge();
    }, [id]);

    const handleSubmit = async () => {
        if (!code.trim()) return;

        setSubmitting(true);
        setResult(null);

        try {
            const res = await api.post(`/challenges/${id}/submit`, { code });
            const data = res.data.data;

            setResult({
                passed: data.passed,
                xpEarned: data.xpEarned,
                message: data.passed
                    ? data.alreadySolved
                        ? "Correct! (Already solved - no XP)"
                        : `Correct! +${data.xpEarned} XP!`
                    : "Not quite right. Try again!"
            });

            if (data.passed) {
                setChallenge(prev => prev ? { ...prev, isSolved: true } : null);
            }

            if (data.showHint) {
                setShowHints(true);
            }
        } catch (error) {
            console.error("Failed to submit", error);
            setResult({ passed: false, xpEarned: 0, message: "Error submitting. Please try again." });
        } finally {
            setSubmitting(false);
        }
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case "EASY": return "bg-green-500";
            case "MEDIUM": return "bg-yellow-500";
            case "HARD": return "bg-red-500";
            default: return "bg-gray-500";
        }
    };

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    if (!challenge) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">Challenge not found</p>
                <Link href="/dashboard/challenges">
                    <Button variant="outline" className="mt-4">Back to Challenges</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold">{challenge.title}</h1>
                            {challenge.isSolved && (
                                <Badge className="bg-green-500 gap-1">
                                    <CheckCircle className="h-3 w-3" />
                                    Solved
                                </Badge>
                            )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge className={getDifficultyColor(challenge.difficulty)}>
                                {challenge.difficulty}
                            </Badge>
                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                                <Trophy className="h-4 w-4" />
                                {challenge.xpReward} XP
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Description */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <HelpCircle className="h-5 w-5" />
                        Challenge Description
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="whitespace-pre-wrap">{challenge.description}</p>
                </CardContent>
            </Card>

            {/* Code Editor */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Your Solution</CardTitle>
                    <CardDescription>
                        Write your code below and click Submit when ready
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Textarea
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="Write your code here..."
                        className="font-mono text-sm min-h-[200px] bg-slate-950 text-green-400"
                        disabled={submitting}
                    />

                    <div className="flex items-center justify-between">
                        <Button
                            variant="outline"
                            onClick={() => setShowHints(!showHints)}
                            className="gap-2"
                        >
                            <Lightbulb className="h-4 w-4" />
                            {showHints ? "Hide Hints" : "Show Hints"}
                        </Button>

                        <Button
                            onClick={handleSubmit}
                            disabled={submitting || !code.trim()}
                            className="gap-2"
                        >
                            <Send className="h-4 w-4" />
                            {submitting ? "Checking..." : "Submit Solution"}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Result */}
            {result && (
                <Card className={result.passed ? "border-green-500" : "border-red-500"}>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            {result.passed ? (
                                <CheckCircle className="h-8 w-8 text-green-500" />
                            ) : (
                                <XCircle className="h-8 w-8 text-red-500" />
                            )}
                            <div>
                                <p className="font-bold text-lg">{result.message}</p>
                                {!result.passed && challenge.attemptCount >= 4 && (
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Need help? Check the hints or review the related course lessons.
                                    </p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Hints */}
            {showHints && challenge.hints.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Lightbulb className="h-5 w-5 text-yellow-500" />
                            Hints
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {challenge.hints.map((hint, index) => (
                                <li key={index} className="flex items-start gap-2">
                                    <span className="text-muted-foreground">{index + 1}.</span>
                                    <span>{hint}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
