"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
    ArrowLeft, CheckCircle2, Loader2, Zap, Lightbulb, Send, PartyPopper,
    Bug, AlertTriangle, Eye, EyeOff, RotateCcw,
    Server, Database, Globe, Shield, HardDrive, Wifi, Network, Cpu, Trash2, Play, Activity,
    SkipForward, Pause, RefreshCw, BarChart3, Timer
} from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";

// ==========================================
// TYPES
// ==========================================

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
    attemptCount: number;
    hintText: string | null;
    correctAnswer: string | null;
}

interface CanvasComponent {
    id: string;
    type: string;
    label: string;
    x: number;
    y: number;
    icon: string;
}

interface Connection {
    from: string;
    to: string;
}

interface SimulationResult {
    status: "success" | "warning" | "failure";
    message: string;
    bottlenecks: string[];
    score: number;
}

// ==========================================
// COMPONENT PALETTE
// ==========================================

const AVAILABLE_COMPONENTS = [
    { type: "client", label: "Client/Browser", icon: "Globe" },
    { type: "loadbalancer", label: "Load Balancer", icon: "Network" },
    { type: "webserver", label: "Web Server", icon: "Server" },
    { type: "appserver", label: "App Server", icon: "Cpu" },
    { type: "database", label: "Database", icon: "Database" },
    { type: "cache", label: "Cache (Redis)", icon: "HardDrive" },
    { type: "cdn", label: "CDN", icon: "Globe" },
    { type: "queue", label: "Message Queue", icon: "Wifi" },
    { type: "firewall", label: "Firewall/WAF", icon: "Shield" },
];

const getComponentIcon = (iconName: string) => {
    const iconMap: Record<string, any> = {
        Globe, Network, Server, Cpu, Database, HardDrive, Wifi, Shield,
    };
    const IconComp = iconMap[iconName] || Server;
    return IconComp;
};

const getComponentColor = (type: string): string => {
    const colors: Record<string, string> = {
        client: "#3b82f6",
        loadbalancer: "#8b5cf6",
        webserver: "#10b981",
        appserver: "#f59e0b",
        database: "#ef4444",
        cache: "#ec4899",
        cdn: "#06b6d4",
        queue: "#f97316",
        firewall: "#6366f1",
    };
    return colors[type] || "#6b7280";
};

// ==========================================
// TRAFFIC SIMULATION LOGIC
// ==========================================

function simulateTraffic(components: CanvasComponent[], connections: Connection[]): SimulationResult {
    const types = components.map(c => c.type);
    const bottlenecks: string[] = [];
    let score = 0;

    const hasClient = types.includes("client");
    const hasServer = types.includes("webserver") || types.includes("appserver");
    const hasDB = types.includes("database");
    const hasLB = types.includes("loadbalancer");
    const hasCache = types.includes("cache");
    const hasCDN = types.includes("cdn");
    const hasQueue = types.includes("queue");
    const hasFirewall = types.includes("firewall");

    // Basic architecture checks
    if (!hasServer) {
        bottlenecks.push("âš ï¸ No web/app server â€” requests have nowhere to go!");
        return { status: "failure", message: "Architecture needs at least one server to handle requests.", bottlenecks, score: 0 };
    }

    if (!hasDB) {
        bottlenecks.push("âš ï¸ No database â€” where will data be stored?");
        return { status: "failure", message: "Most systems need a database to persist data.", bottlenecks, score: 10 };
    }

    // Check connections
    if (connections.length === 0) {
        bottlenecks.push("âš ï¸ No connections â€” components aren't linked!");
        return { status: "failure", message: "Connect your components! Data needs to flow between them.", bottlenecks, score: 5 };
    }

    // Score the architecture
    score += 20; // Has server
    score += 15; // Has database

    if (hasClient) {
        score += 5;
    }

    if (hasLB) {
        score += 15;
    } else {
        bottlenecks.push("ðŸ’¡ No load balancer â€” single point of failure under heavy traffic");
    }

    if (hasCache) {
        score += 15;
    } else {
        bottlenecks.push("ðŸ’¡ No cache â€” database will be hit on every request (slow reads)");
    }

    if (hasCDN) {
        score += 10;
    } else {
        bottlenecks.push("ðŸ’¡ No CDN â€” static assets served from origin server (high latency)");
    }

    if (hasQueue) {
        score += 10;
    }

    if (hasFirewall) {
        score += 5;
    } else {
        bottlenecks.push("ðŸ’¡ No firewall â€” API is exposed without protection");
    }

    // Connection quality bonus
    const connScore = Math.min(connections.length * 3, 15);
    score += connScore;

    // Multiple servers bonus
    const serverCount = types.filter(t => t === "webserver" || t === "appserver").length;
    if (serverCount > 1) {
        score += 5;
    }

    score = Math.min(score, 100);

    if (score >= 80) {
        return { status: "success", message: "Excellent architecture! Traffic flows smoothly with good redundancy and performance.", bottlenecks, score };
    } else if (score >= 50) {
        return { status: "warning", message: "Decent architecture but has some bottlenecks. Consider the suggestions below.", bottlenecks, score };
    } else {
        return { status: "failure", message: "Architecture has critical gaps. Add more components and connections.", bottlenecks, score };
    }
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function TaskPage() {
    const params = useParams();
    const router = useRouter();
    const modeId = params.modeId as string;
    const taskId = params.taskId as string;

    const [task, setTask] = useState<TaskData | null>(null);
    const [loading, setLoading] = useState(true);
    const [answer, setAnswer] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState<{
        passed: boolean; xpEarned: number; feedback: string;
        attemptCount?: number; hintText?: string | null; correctAnswer?: string | null;
    } | null>(null);
    const [attemptCount, setAttemptCount] = useState(0);
    const [showHint, setShowHint] = useState(false);
    const [showAnswer, setShowAnswer] = useState(false);
    const [hintText, setHintText] = useState<string | null>(null);
    const [correctAnswer, setCorrectAnswer] = useState<string | null>(null);
    const [activeLineIndex, setActiveLineIndex] = useState<number | null>(null);
    const [breakpoints, setBreakpoints] = useState<Set<number>>(new Set());

    // System Architect state
    const [canvasComponents, setCanvasComponents] = useState<CanvasComponent[]>([]);
    const [connections, setConnections] = useState<Connection[]>([]);
    const [draggingFrom, setDraggingFrom] = useState<string | null>(null);
    const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
    const [simulation, setSimulation] = useState<SimulationResult | null>(null);
    const [simulating, setSimulating] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const canvasRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchTask = async () => {
            try {
                const res = await api.get(`/skill-lab/tasks/${taskId}`);
                const data = res.data.data;
                setTask(data);
                setAttemptCount(data.attemptCount || 0);
                if (data.hintText) setHintText(data.hintText);
                if (data.correctAnswer) setCorrectAnswer(data.correctAnswer);
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
            const data = res.data.data;
            setResult(data);
            setAttemptCount(data.attemptCount || attemptCount + 1);
            if (data.hintText) setHintText(data.hintText);
            if (data.correctAnswer) setCorrectAnswer(data.correctAnswer);
            if (data.passed) {
                setTask(prev => prev ? { ...prev, userSubmission: { passed: true, score: 100 } } : prev);
            } else {
                // Re-fetch the task to get updated attemptCount, hintText, correctAnswer
                try {
                    const refreshed = await api.get(`/skill-lab/tasks/${taskId}`);
                    const freshData = refreshed.data.data;
                    setTask(freshData);
                    setAttemptCount(freshData.attemptCount || 0);
                    if (freshData.hintText) setHintText(freshData.hintText);
                    if (freshData.correctAnswer) setCorrectAnswer(freshData.correctAnswer);
                } catch (_) { /* silently ignore refresh error */ }
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

    // ==========================================
    // System Architect - Canvas
    // ==========================================

    const addToCanvas = (type: string, label: string, icon: string) => {
        const id = `${type}-${Date.now()}`;
        const x = 100 + Math.random() * 300;
        const y = 80 + Math.random() * 200;
        setCanvasComponents(prev => [...prev, { id, type, label, icon, x, y }]);
    };

    const removeFromCanvas = (id: string) => {
        setCanvasComponents(prev => prev.filter(c => c.id !== id));
        setConnections(prev => prev.filter(c => c.from !== id && c.to !== id));
    };

    const handleCanvasMouseMove = useCallback((e: React.MouseEvent) => {
        if (!draggingFrom || !canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left - dragOffset.x;
        const y = e.clientY - rect.top - dragOffset.y;
        setCanvasComponents(prev =>
            prev.map(c => c.id === draggingFrom ? { ...c, x: Math.max(0, x), y: Math.max(0, y) } : c)
        );
    }, [draggingFrom, dragOffset]);

    const handleCanvasMouseUp = useCallback(() => {
        setDraggingFrom(null);
    }, []);

    const startDragging = (id: string, e: React.MouseEvent) => {
        const comp = canvasComponents.find(c => c.id === id);
        if (!comp) return;
        setDragOffset({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY });
        setDraggingFrom(id);
    };

    const handleConnect = (targetId: string) => {
        if (!connectingFrom || connectingFrom === targetId) {
            setConnectingFrom(null);
            return;
        }
        // Check if connection already exists
        const exists = connections.some(
            c => (c.from === connectingFrom && c.to === targetId) ||
                (c.from === targetId && c.to === connectingFrom)
        );
        if (!exists) {
            setConnections(prev => [...prev, { from: connectingFrom, to: targetId }]);
        }
        setConnectingFrom(null);
    };

    const runSimulation = () => {
        setSimulating(true);
        setSimulation(null);
        // Simulate a delay for realism
        setTimeout(() => {
            const result = simulateTraffic(canvasComponents, connections);
            setSimulation(result);
            setSimulating(false);
        }, 1500);
    };

    const clearCanvas = () => {
        setCanvasComponents([]);
        setConnections([]);
        setSimulation(null);
        setConnectingFrom(null);
    };

    const toggleBreakpoint = (lineIndex: number) => {
        setBreakpoints(prev => {
            const next = new Set(prev);
            if (next.has(lineIndex)) next.delete(lineIndex);
            else next.add(lineIndex);
            return next;
        });
    };

    // ==========================================
    // LOADING / NOT FOUND
    // ==========================================

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
    const isBugHunter = task.mode?.slug === 'bug-hunter';
    const isSystemArchitect = task.mode?.slug === 'system-architect';
    const isAlgorithmArena = task.mode?.slug === 'algorithm-arena';
    const isCodeQuest = task.mode?.slug === 'code-quest';
    const isDevSimulator = task.mode?.slug === 'dev-simulator';
    const hasOptions = task.taskData?.correctOption;
    const options = hasOptions ? ["A", "B", "C", "D"] : null;

    const getOptionLabel = (scenario: string, letter: string) => {
        const regex = new RegExp(`${letter}\\)\\s*(.+?)(?:\\n|$)`);
        const match = scenario.match(regex);
        return match ? match[1].trim() : letter;
    };

    // ==========================================
    // BUG HUNTER UI
    // ==========================================

    if (isBugHunter) {
        const parseBugHunterScenario = (scenario: string) => {
            const lines = scenario.split('\n');
            let bugReport = '';
            let codeLines: string[] = [];
            let inCode = false;
            for (const line of lines) {
                if (line.startsWith('Code:') || line.startsWith('Code snippet:')) { inCode = true; continue; }
                if (inCode) codeLines.push(line);
                else bugReport += line + '\n';
            }
            return { bugReport: bugReport.trim(), codeLines: codeLines.filter(l => l.trim() !== '') };
        };

        const { bugReport, codeLines } = parseBugHunterScenario(task.scenario);
        const canShowHint = attemptCount >= 3;
        const canShowAnswer = attemptCount >= 6;

        return (
            <div className="space-y-6 max-w-4xl mx-auto pb-12">
                <div className="flex items-center gap-4">
                    <Link href={`/dashboard/skill-lab/${modeId}`}>
                        <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
                    </Link>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <Bug className="h-5 w-5 text-red-500" />
                            <h1 className="text-2xl font-bold">{task.title}</h1>
                            {isCompleted && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                            <Badge variant="secondary" className="text-xs gap-1"><Bug className="h-3 w-3" /> Bug Hunter</Badge>
                            <Badge variant="outline" className="text-xs">{task.difficulty}</Badge>
                            <span className="flex items-center gap-1 text-sm text-amber-500 font-medium"><Zap className="h-3.5 w-3.5" /> {task.xpReward} XP</span>
                            {attemptCount > 0 && <span className="text-xs text-muted-foreground">Attempts: {attemptCount}</span>}
                        </div>
                    </div>
                </div>

                <Card className="border-red-500/30 bg-red-500/5">
                    <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2 text-red-500"><AlertTriangle className="h-4 w-4" /> Bug Report</CardTitle></CardHeader>
                    <CardContent><div className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">{bugReport}</div></CardContent>
                </Card>

                <Card className="overflow-hidden">
                    <div className="bg-slate-950 p-1 border-b border-slate-800 flex items-center gap-2 px-4 py-2">
                        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-red-500"></div><div className="w-3 h-3 rounded-full bg-yellow-500"></div><div className="w-3 h-3 rounded-full bg-green-500"></div></div>
                        <span className="text-xs text-slate-400 ml-2 font-mono">broken_code.js â€” Click line numbers to set breakpoints</span>
                    </div>
                    <div className="bg-slate-950 p-0 overflow-x-auto">
                        {codeLines.map((line, i) => (
                            <div key={i} className={`flex items-stretch font-mono text-sm cursor-pointer transition-colors ${activeLineIndex === i ? 'bg-yellow-500/20' : breakpoints.has(i) ? 'bg-red-500/10' : 'hover:bg-slate-800/50'}`} onClick={() => setActiveLineIndex(activeLineIndex === i ? null : i)}>
                                <div className="w-10 flex items-center justify-center shrink-0 border-r border-slate-800 cursor-pointer select-none" onClick={(e) => { e.stopPropagation(); toggleBreakpoint(i); }}>
                                    {breakpoints.has(i) ? <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.5)]"></div> : <span className="text-slate-600 text-xs">{i + 1}</span>}
                                </div>
                                <pre className="flex-1 px-4 py-1 text-green-400 text-[13px] leading-6">{line || ' '}</pre>
                            </div>
                        ))}
                    </div>
                    {activeLineIndex !== null && (
                        <div className="bg-slate-900 border-t border-slate-800 px-4 py-2 text-xs text-slate-300 font-mono">
                            <span className="text-yellow-400">Inspecting Line {activeLineIndex + 1}:</span>{' '}
                            <span className="text-slate-400">{codeLines[activeLineIndex]?.trim()}</span>
                        </div>
                    )}
                </Card>

                {canShowHint && hintText && (
                    <Card className="border-amber-500/30 bg-amber-500/5">
                        <CardContent className="py-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2"><Lightbulb className="h-5 w-5 text-amber-500" /><span className="font-semibold text-sm text-amber-600 dark:text-amber-400">Hint Available</span></div>
                                <Button variant="outline" size="sm" onClick={() => setShowHint(!showHint)} className="gap-1 text-amber-600 border-amber-500/30 hover:bg-amber-500/10">{showHint ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}{showHint ? 'Hide Hint' : 'Show Hint'}</Button>
                            </div>
                            {showHint && <p className="mt-3 text-sm text-foreground/80 bg-amber-500/10 rounded-lg p-3 border border-amber-500/20">ðŸ’¡ {hintText}</p>}
                        </CardContent>
                    </Card>
                )}

                {canShowAnswer && correctAnswer && (
                    <Card className="border-blue-500/30 bg-blue-500/5">
                        <CardContent className="py-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2"><Eye className="h-5 w-5 text-blue-500" /><span className="font-semibold text-sm text-blue-600 dark:text-blue-400">Answer Available</span></div>
                                <Button variant="outline" size="sm" onClick={() => setShowAnswer(!showAnswer)} className="gap-1 text-blue-600 border-blue-500/30 hover:bg-blue-500/10">{showAnswer ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}{showAnswer ? 'Hide Answer' : 'Show Answer'}</Button>
                            </div>
                            {showAnswer && <div className="mt-3"><pre className="bg-slate-950 rounded-lg p-4 border border-blue-500/20 font-mono text-sm text-green-400 whitespace-pre-wrap overflow-x-auto">{correctAnswer}</pre></div>}
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2">ðŸ”§ Your Fix</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="relative">
                            <Textarea placeholder="Type your fix here..." value={answer} onChange={(e) => setAnswer(e.target.value)} rows={4} disabled={!!isCompleted} className="font-mono text-sm bg-slate-950 text-green-400 border-slate-700 placeholder:text-slate-600" />
                            {answer && !isCompleted && <Button variant="ghost" size="sm" onClick={() => setAnswer("")} className="absolute top-2 right-2 h-6 w-6 p-0 text-slate-500"><RotateCcw className="h-3 w-3" /></Button>}
                        </div>
                        {!isCompleted && (
                            <div className="flex items-center gap-3">
                                <Button onClick={handleSubmit} disabled={!answer.trim() || submitting} className="gap-2">{submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}Submit Fix</Button>
                                <span className="text-xs text-muted-foreground">{attemptCount === 0 ? 'First attempt' : `Attempt #${attemptCount + 1}`}</span>
                            </div>
                        )}
                        {result && (
                            <div className={`p-4 rounded-lg border ${result.passed ? "bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-400" : "bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-400"}`}>
                                <div className="flex items-center gap-2 font-semibold">{result.passed ? <><PartyPopper className="h-5 w-5" /> Bug Squashed! ðŸ›</> : <><Bug className="h-5 w-5" /> Bug Still Present</>}</div>
                                <p className="text-sm mt-1">{result.feedback}</p>
                                {result.xpEarned > 0 && <p className="text-sm mt-1 flex items-center gap-1 font-medium"><Zap className="h-4 w-4 text-amber-500" /> +{result.xpEarned} XP earned!</p>}
                            </div>
                        )}
                        {isCompleted && !result && (
                            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-400">
                                <div className="flex items-center gap-2 font-semibold"><CheckCircle2 className="h-5 w-5" /> Bug Already Squashed!</div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        );
    }

    // ==========================================
    // SYSTEM ARCHITECT UI â€” Drag & Drop Canvas
    // ==========================================

    if (isSystemArchitect) {
        // Parse scenario to extract the requirement description and options
        const scenarioLines = task.scenario.split('\n');
        const requirementLines: string[] = [];
        const optionLines: string[] = [];
        let inOptions = false;

        for (const line of scenarioLines) {
            if (/^[A-D]\)/.test(line.trim())) {
                inOptions = true;
            }
            if (inOptions) {
                optionLines.push(line);
            } else {
                requirementLines.push(line);
            }
        }
        const requirement = requirementLines.join('\n').trim();

        return (
            <div className="space-y-6 max-w-6xl mx-auto pb-12">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href={`/dashboard/skill-lab/${modeId}`}>
                        <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
                    </Link>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <Network className="h-5 w-5 text-purple-500" />
                            <h1 className="text-2xl font-bold">{task.title}</h1>
                            {isCompleted && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                            <Badge variant="secondary" className="text-xs gap-1"><Network className="h-3 w-3" /> System Architect</Badge>
                            <Badge variant="outline" className="text-xs">{task.difficulty}</Badge>
                            <span className="flex items-center gap-1 text-sm text-amber-500 font-medium"><Zap className="h-3.5 w-3.5" /> {task.xpReward} XP</span>
                        </div>
                    </div>
                </div>

                {/* Requirement Card */}
                <Card className="border-purple-500/20 bg-purple-500/5">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2 text-purple-600 dark:text-purple-400">
                            <Lightbulb className="h-4 w-4" /> System Requirement
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">{requirement}</p>
                    </CardContent>
                </Card>

                {/* Component Palette */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">Component Palette â€” Drag onto canvas</CardTitle>
                        <p className="text-xs text-muted-foreground mt-1">Click a component to add it to the canvas. Build your architecture, then simulate traffic.</p>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {AVAILABLE_COMPONENTS.map((comp) => {
                                const IconComp = getComponentIcon(comp.icon);
                                const color = getComponentColor(comp.type);
                                return (
                                    <button
                                        key={comp.type}
                                        onClick={() => addToCanvas(comp.type, comp.label, comp.icon)}
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg border-2 border-dashed transition-all hover:shadow-md hover:scale-105 text-xs font-medium cursor-pointer"
                                        style={{ borderColor: color + '40', backgroundColor: color + '10', color }}
                                    >
                                        <IconComp className="h-4 w-4" />
                                        {comp.label}
                                    </button>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Architecture Canvas */}
                <Card className="overflow-hidden">
                    <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            </div>
                            <span className="text-xs text-slate-400 ml-2 font-mono">architecture_canvas</span>
                        </div>
                        <div className="flex items-center gap-2">
                            {connectingFrom && (
                                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-[10px] animate-pulse">
                                    ðŸ”— Click another component to connect
                                </Badge>
                            )}
                            <Button variant="ghost" size="sm" onClick={clearCanvas} className="text-xs text-slate-400 hover:text-slate-200 gap-1 h-7">
                                <Trash2 className="h-3 w-3" /> Clear
                            </Button>
                        </div>
                    </div>
                    <div
                        ref={canvasRef}
                        className="relative bg-[#0a0a1a] overflow-hidden select-none"
                        style={{ height: 420, backgroundImage: 'radial-gradient(circle, #1a1a3a 1px, transparent 1px)', backgroundSize: '20px 20px' }}
                        onMouseMove={handleCanvasMouseMove}
                        onMouseUp={handleCanvasMouseUp}
                        onMouseLeave={handleCanvasMouseUp}
                    >
                        {/* Connection Lines */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
                            {connections.map((conn, i) => {
                                const from = canvasComponents.find(c => c.id === conn.from);
                                const to = canvasComponents.find(c => c.id === conn.to);
                                if (!from || !to) return null;

                                const x1 = from.x + 60;
                                const y1 = from.y + 30;
                                const x2 = to.x + 60;
                                const y2 = to.y + 30;

                                // Animated dashes for traffic simulation
                                const isSimSuccess = simulation?.status === 'success';
                                const strokeColor = simulation
                                    ? (isSimSuccess ? '#10b981' : simulation.status === 'warning' ? '#f59e0b' : '#ef4444')
                                    : '#6366f1';

                                return (
                                    <g key={i}>
                                        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={strokeColor} strokeWidth={2} strokeDasharray={simulation ? "6 4" : "none"} opacity={0.6}>
                                            {simulation && <animate attributeName="stroke-dashoffset" values="20;0" dur="1s" repeatCount="indefinite" />}
                                        </line>
                                        {/* Arrow head */}
                                        <circle cx={x2} cy={y2} r={4} fill={strokeColor} opacity={0.8} />
                                    </g>
                                );
                            })}
                        </svg>

                        {/* Placed Components */}
                        {canvasComponents.map((comp) => {
                            const IconComp = getComponentIcon(comp.icon);
                            const color = getComponentColor(comp.type);
                            const isConnecting = connectingFrom === comp.id;

                            return (
                                <div
                                    key={comp.id}
                                    className={`absolute flex flex-col items-center cursor-grab active:cursor-grabbing transition-shadow ${isConnecting ? 'ring-2 ring-blue-400 ring-offset-2 ring-offset-[#0a0a1a]' : ''}`}
                                    style={{
                                        left: comp.x,
                                        top: comp.y,
                                        width: 120,
                                        zIndex: draggingFrom === comp.id ? 50 : 10,
                                    }}
                                    onMouseDown={(e) => {
                                        if (connectingFrom) {
                                            handleConnect(comp.id);
                                        } else {
                                            startDragging(comp.id, e);
                                        }
                                    }}
                                >
                                    <div
                                        className="w-14 h-14 rounded-xl flex items-center justify-center shadow-lg transition-transform hover:scale-110"
                                        style={{ backgroundColor: color + '20', border: `2px solid ${color}`, boxShadow: `0 0 15px ${color}30` }}
                                    >
                                        <IconComp className="h-6 w-6" style={{ color }} />
                                    </div>
                                    <span className="text-[10px] text-slate-300 mt-1 text-center font-medium leading-tight">{comp.label}</span>
                                    {/* Action buttons */}
                                    <div className="flex gap-1 mt-1">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setConnectingFrom(comp.id); }}
                                            className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 hover:bg-blue-500/40 transition-colors"
                                        >
                                            ðŸ”— Connect
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); removeFromCanvas(comp.id); }}
                                            className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 hover:bg-red-500/40 transition-colors"
                                        >
                                            âœ•
                                        </button>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Empty state */}
                        {canvasComponents.length === 0 && (
                            <div className="absolute inset-0 flex items-center justify-center text-slate-600 text-sm">
                                <div className="text-center">
                                    <Network className="h-10 w-10 mx-auto mb-2 opacity-30" />
                                    <p>Click components above to add them here</p>
                                    <p className="text-xs mt-1 text-slate-700">Design your system architecture</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Canvas footer */}
                    <div className="bg-slate-950 px-4 py-3 border-t border-slate-800 flex items-center justify-between">
                        <span className="text-xs text-slate-500">
                            {canvasComponents.length} component{canvasComponents.length !== 1 ? 's' : ''} â€¢ {connections.length} connection{connections.length !== 1 ? 's' : ''}
                        </span>
                        <Button
                            onClick={runSimulation}
                            disabled={canvasComponents.length < 2 || simulating}
                            size="sm"
                            className="gap-2 bg-purple-600 hover:bg-purple-700 text-white"
                        >
                            {simulating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
                            {simulating ? 'Simulating...' : 'Simulate Traffic'}
                        </Button>
                    </div>
                </Card>

                {/* Simulation Results */}
                {simulation && (
                    <Card className={`border-2 ${simulation.status === 'success' ? 'border-green-500/30 bg-green-500/5' : simulation.status === 'warning' ? 'border-yellow-500/30 bg-yellow-500/5' : 'border-red-500/30 bg-red-500/5'}`}>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Activity className="h-5 w-5" />
                                Traffic Simulation Results
                                <Badge className={`ml-2 ${simulation.status === 'success' ? 'bg-green-500' : simulation.status === 'warning' ? 'bg-yellow-500 text-black' : 'bg-red-500'}`}>
                                    {simulation.score}/100
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <p className="text-sm font-medium">{simulation.message}</p>
                            {/* Traffic animation bar */}
                            <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-1000 ${simulation.status === 'success' ? 'bg-green-500' : simulation.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'}`}
                                    style={{ width: `${simulation.score}%` }}
                                />
                            </div>
                            {simulation.bottlenecks.length > 0 && (
                                <div className="space-y-1.5 mt-2">
                                    <p className="text-xs font-semibold text-muted-foreground uppercase">Bottlenecks & Suggestions</p>
                                    {simulation.bottlenecks.map((b, i) => (
                                        <p key={i} className="text-sm text-foreground/80 pl-2 border-l-2 border-yellow-500/40">{b}</p>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Answer Question */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">ðŸ“ Answer the Question</CardTitle>
                        <p className="text-xs text-muted-foreground mt-1">After building your architecture above, answer the question below to earn XP.</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <pre className="whitespace-pre-wrap text-sm text-muted-foreground font-mono bg-muted/50 rounded-lg p-4 leading-relaxed">
                            {task.scenario}
                        </pre>

                        {options && (
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
                        )}

                        {!isCompleted && (
                            <Button onClick={handleSubmit} disabled={!answer.trim() || submitting} className="gap-2">
                                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                Submit Answer
                            </Button>
                        )}

                        {result && (
                            <div className={`p-4 rounded-lg border ${result.passed ? "bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-400" : "bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-400"}`}>
                                <div className="flex items-center gap-2 font-semibold">{result.passed ? <><PartyPopper className="h-5 w-5" /> Correct!</> : "Not Quite Right"}</div>
                                <p className="text-sm mt-1">{result.feedback}</p>
                                {result.xpEarned > 0 && <p className="text-sm mt-1 flex items-center gap-1 font-medium"><Zap className="h-4 w-4 text-amber-500" /> +{result.xpEarned} XP earned!</p>}
                            </div>
                        )}

                        {isCompleted && !result && (
                            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-400">
                                <div className="flex items-center gap-2 font-semibold"><CheckCircle2 className="h-5 w-5" /> Already Completed</div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        );
    }

    // ==========================================
    // ALGORITHM ARENA UI â€” Step-by-Step Visualization
    // ==========================================

    if (isAlgorithmArena) {
        const titleLower = task.title.toLowerCase();
        const isSorting = titleLower.includes('sort');
        const isSearch = titleLower.includes('search');
        const isFibonacci = titleLower.includes('fibonacci');
        const isFactorial = titleLower.includes('factorial');
        const isStack = titleLower.includes('stack');
        const isQueue = titleLower.includes('queue');
        const isReverse = titleLower.includes('reverse');
        const isPalindrome = titleLower.includes('palindrome');
        const hasVisualization = isSorting || isSearch || isFibonacci || isFactorial || isStack || isQueue || isReverse || isPalindrome;

        const canShowHint = attemptCount >= 3;
        const canShowAnswer = attemptCount >= 6;

        const extractArray = (scenario: string): number[] => {
            const match = scenario.match(/\[([\\d,\\s]+)\]/);
            if (match) return match[1].split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
            return [5, 3, 8, 1, 9, 2, 7, 4];
        };
        const arr = extractArray(task.scenario);

        // ---- Sorting Visualizer (runs after submission) ----
        const SortingVisualizer = ({ passed: vizPassed }: { passed: boolean }) => {
            const [steps, setSteps] = useState<{ arr: number[]; comparing: number[]; swapped: number[]; sorted: number[]; label: string }[]>([]);
            const [currentStep, setCurrentStep] = useState(0);
            const [playing, setPlaying] = useState(false);
            const [speed, setSpeed] = useState(500);
            const intervalRef = useRef<NodeJS.Timeout | null>(null);

            useEffect(() => {
                const genSteps: typeof steps = [];
                const a = [...arr];
                genSteps.push({ arr: [...a], comparing: [], swapped: [], sorted: [], label: 'Initial array' });

                if (vizPassed) {
                    // Correct answer: full sort animation
                    if (titleLower.includes('bubble')) {
                        for (let i = 0; i < a.length - 1; i++) {
                            for (let j = 0; j < a.length - i - 1; j++) {
                                genSteps.push({ arr: [...a], comparing: [j, j + 1], swapped: [], sorted: [], label: `Comparing ${a[j]} and ${a[j + 1]}` });
                                if (a[j] > a[j + 1]) {
                                    [a[j], a[j + 1]] = [a[j + 1], a[j]];
                                    genSteps.push({ arr: [...a], comparing: [], swapped: [j, j + 1], sorted: [], label: `Swapped ${a[j + 1]} and ${a[j]}` });
                                }
                            }
                            genSteps.push({ arr: [...a], comparing: [], swapped: [], sorted: Array.from({ length: i + 1 }, (_, k) => a.length - 1 - k), label: `Pass ${i + 1} complete` });
                        }
                    } else if (titleLower.includes('selection')) {
                        for (let i = 0; i < a.length - 1; i++) {
                            let minIdx = i;
                            for (let j = i + 1; j < a.length; j++) {
                                genSteps.push({ arr: [...a], comparing: [minIdx, j], swapped: [], sorted: Array.from({ length: i }, (_, k) => k), label: `Comparing min(${a[minIdx]}) with ${a[j]}` });
                                if (a[j] < a[minIdx]) minIdx = j;
                            }
                            if (minIdx !== i) {
                                [a[i], a[minIdx]] = [a[minIdx], a[i]];
                                genSteps.push({ arr: [...a], comparing: [], swapped: [i, minIdx], sorted: Array.from({ length: i }, (_, k) => k), label: `Placed ${a[i]} at position ${i}` });
                            }
                        }
                    } else {
                        for (let i = 0; i < a.length - 1; i++) {
                            for (let j = 0; j < a.length - i - 1; j++) {
                                genSteps.push({ arr: [...a], comparing: [j, j + 1], swapped: [], sorted: [], label: `Comparing ${a[j]} and ${a[j + 1]}` });
                                if (a[j] > a[j + 1]) {
                                    [a[j], a[j + 1]] = [a[j + 1], a[j]];
                                    genSteps.push({ arr: [...a], comparing: [], swapped: [j, j + 1], sorted: [], label: `Swapped` });
                                }
                            }
                        }
                    }
                    genSteps.push({ arr: [...a], comparing: [], swapped: [], sorted: a.map((_, i) => i), label: 'âœ… Algorithm works! Array is sorted!' });
                } else {
                    // Wrong answer: show failure - shuffle the array randomly and show error
                    genSteps.push({ arr: [...a], comparing: [0, 1], swapped: [], sorted: [], label: 'âš ï¸ Running your algorithm...' });
                    const shuffled = [...a].sort(() => Math.random() - 0.5);
                    genSteps.push({ arr: shuffled, comparing: [], swapped: [0, 1, 2], sorted: [], label: 'âŒ Algorithm failed! Array is not sorted correctly.' });
                    genSteps.push({ arr: shuffled, comparing: [], swapped: a.map((_, i) => i), sorted: [], label: 'âŒ Your solution does not produce the correct result. Try again!' });
                }
                setSteps(genSteps);
                setPlaying(true);
            }, [vizPassed]);

            useEffect(() => {
                if (playing && steps.length > 0) {
                    intervalRef.current = setInterval(() => {
                        setCurrentStep(prev => {
                            if (prev >= steps.length - 1) { setPlaying(false); return prev; }
                            return prev + 1;
                        });
                    }, speed);
                }
                return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
            }, [playing, speed, steps.length]);

            if (steps.length === 0) return null;
            const step = steps[currentStep];
            const maxVal = Math.max(...arr);
            const totalComparisons = steps.filter(s => s.comparing.length > 0).length;
            const totalSwaps = steps.filter(s => s.swapped.length > 0).length;

            return (
                <Card className="overflow-hidden">
                    <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <BarChart3 className="h-4 w-4 text-cyan-400" />
                            <span className="text-xs text-slate-400 font-mono">algorithm_visualizer â€” {vizPassed ? 'âœ… Correct' : 'âŒ Failed'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-[10px]">Comparisons: {totalComparisons}</Badge>
                            <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px]">Swaps: {totalSwaps}</Badge>
                        </div>
                    </div>
                    <div className="bg-[#0a0a1a] p-6" style={{ minHeight: 220 }}>
                        <div className="flex items-end justify-center gap-2 h-40">
                            {step.arr.map((val, i) => {
                                const heightPercent = (val / maxVal) * 100;
                                const isComparing = step.comparing.includes(i);
                                const isSwapped = step.swapped.includes(i);
                                const isSorted = step.sorted.includes(i);
                                let bg = 'bg-indigo-500';
                                if (isComparing) bg = 'bg-yellow-400';
                                if (isSwapped) bg = vizPassed ? 'bg-orange-500' : 'bg-red-500';
                                if (isSorted) bg = 'bg-green-500';
                                return (
                                    <div key={i} className="flex flex-col items-center gap-1" style={{ flex: 1, maxWidth: 60 }}>
                                        <div className={`${bg} rounded-t-md w-full transition-all duration-300 relative`} style={{ height: `${heightPercent}%`, minHeight: 20 }}>
                                            <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] text-slate-300 font-mono font-bold">{val}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className="bg-slate-950 px-4 py-3 border-t border-slate-800">
                        <p className={`text-xs font-mono mb-3 ${vizPassed ? 'text-cyan-400' : 'text-red-400'}`}>{step.label}</p>
                        <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => { setCurrentStep(0); setPlaying(false); }}><RefreshCw className="h-3 w-3" /> Reset</Button>
                            <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => setPlaying(!playing)} disabled={currentStep >= steps.length - 1}>
                                {playing ? <><Pause className="h-3 w-3" /> Pause</> : <><Play className="h-3 w-3" /> Play</>}
                            </Button>
                            <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => setCurrentStep(prev => Math.min(prev + 1, steps.length - 1))} disabled={currentStep >= steps.length - 1}>
                                <SkipForward className="h-3 w-3" /> Step
                            </Button>
                            <div className="ml-auto flex items-center gap-2">
                                <span className="text-[10px] text-slate-500">Speed:</span>
                                <select className="bg-slate-800 text-slate-300 text-[10px] rounded px-1 py-0.5 border border-slate-700" value={speed} onChange={e => setSpeed(Number(e.target.value))}>
                                    <option value={1000}>Slow</option>
                                    <option value={500}>Normal</option>
                                    <option value={200}>Fast</option>
                                    <option value={50}>Ultra</option>
                                </select>
                            </div>
                            <span className="text-[10px] text-slate-500 ml-2">Step {currentStep + 1}/{steps.length}</span>
                        </div>
                    </div>
                </Card>
            );
        };

        // ---- Search Visualizer (runs after submission) ----
        const SearchVisualizer = ({ passed: vizPassed }: { passed: boolean }) => {
            const searchArr = extractArray(task.scenario);
            const targetMatch = task.scenario.match(/(?:find|index of|search for)\s+(\d+)/i);
            const target = targetMatch ? parseInt(targetMatch[1]) : 7;
            const [steps, setSteps] = useState<{ arr: number[]; low: number; high: number; mid: number; found: boolean; label: string }[]>([]);
            const [currentStep, setCurrentStep] = useState(0);
            const [playing, setPlaying] = useState(false);
            const intervalRef = useRef<NodeJS.Timeout | null>(null);

            useEffect(() => {
                const genSteps: typeof steps = [];
                const sorted = [...searchArr].sort((a, b) => a - b);
                if (vizPassed) {
                    let low = 0, high = sorted.length - 1;
                    genSteps.push({ arr: sorted, low, high, mid: -1, found: false, label: `Searching for ${target}` });
                    while (low <= high) {
                        const mid = Math.floor((low + high) / 2);
                        genSteps.push({ arr: sorted, low, high, mid, found: false, label: `Check middle: arr[${mid}] = ${sorted[mid]}` });
                        if (sorted[mid] === target) {
                            genSteps.push({ arr: sorted, low, high, mid, found: true, label: `âœ… Found ${target} at index ${mid}!` });
                            break;
                        } else if (sorted[mid] < target) {
                            low = mid + 1;
                            genSteps.push({ arr: sorted, low, high, mid: -1, found: false, label: `${sorted[mid]} < ${target}, search right` });
                        } else {
                            high = mid - 1;
                            genSteps.push({ arr: sorted, low, high, mid: -1, found: false, label: `${sorted[mid]} > ${target}, search left` });
                        }
                    }
                } else {
                    genSteps.push({ arr: sorted, low: 0, high: sorted.length - 1, mid: -1, found: false, label: 'âš ï¸ Running your algorithm...' });
                    genSteps.push({ arr: sorted, low: 0, high: 0, mid: 0, found: false, label: 'âŒ Algorithm failed! Incorrect search result.' });
                }
                setSteps(genSteps);
                setPlaying(true);
            }, [vizPassed]);

            useEffect(() => {
                if (playing && steps.length > 0) {
                    intervalRef.current = setInterval(() => {
                        setCurrentStep(prev => { if (prev >= steps.length - 1) { setPlaying(false); return prev; } return prev + 1; });
                    }, 700);
                }
                return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
            }, [playing, steps.length]);

            if (steps.length === 0) return null;
            const step = steps[currentStep];

            return (
                <Card className="overflow-hidden">
                    <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-green-400" />
                        <span className="text-xs text-slate-400 font-mono">search_visualizer â€” Target: {target} â€” {vizPassed ? 'âœ…' : 'âŒ'}</span>
                    </div>
                    <div className="bg-[#0a0a1a] p-6">
                        <div className="flex items-center justify-center gap-1">
                            {step.arr.map((val, i) => {
                                const inRange = i >= step.low && i <= step.high;
                                const isMid = i === step.mid;
                                const isFound = isMid && step.found;
                                let bg = 'bg-slate-700';
                                if (inRange) bg = 'bg-indigo-500/60';
                                if (isMid) bg = vizPassed ? 'bg-yellow-400' : 'bg-red-400';
                                if (isFound) bg = 'bg-green-500';
                                return (
                                    <div key={i} className={`${bg} rounded-md px-3 py-2 text-center transition-all duration-300 min-w-[40px]`}>
                                        <span className="text-xs text-slate-400 block">{i}</span>
                                        <span className={`text-sm font-bold ${isFound ? 'text-white' : isMid ? 'text-black' : inRange ? 'text-white' : 'text-slate-500'}`}>{val}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className="bg-slate-950 px-4 py-3 border-t border-slate-800">
                        <p className={`text-xs font-mono mb-3 ${vizPassed ? 'text-green-400' : 'text-red-400'}`}>{step.label}</p>
                        <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => { setCurrentStep(0); setPlaying(false); }}><RefreshCw className="h-3 w-3" /> Reset</Button>
                            <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => setPlaying(!playing)} disabled={currentStep >= steps.length - 1}>
                                {playing ? <><Pause className="h-3 w-3" /> Pause</> : <><Play className="h-3 w-3" /> Play</>}
                            </Button>
                            <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => setCurrentStep(prev => Math.min(prev + 1, steps.length - 1))} disabled={currentStep >= steps.length - 1}>
                                <SkipForward className="h-3 w-3" /> Step
                            </Button>
                            <span className="text-[10px] text-slate-500 ml-auto">Step {currentStep + 1}/{steps.length}</span>
                        </div>
                    </div>
                </Card>
            );
        };

        // ---- Step Trace (Fibonacci, Stack, Queue, etc. â€” runs after submission) ----
        const StepTrace = ({ passed: vizPassed }: { passed: boolean }) => {
            const [traceSteps, setTraceSteps] = useState<string[]>([]);
            const [revealed, setRevealed] = useState(0);
            const [playing, setPlaying] = useState(false);
            const intervalRef = useRef<NodeJS.Timeout | null>(null);

            useEffect(() => {
                const stps: string[] = [];
                if (vizPassed) {
                    if (isFibonacci) { stps.push('fib(0) = 0'); stps.push('fib(1) = 1'); let a = 0, b = 1; for (let i = 2; i < 8; i++) { const c = a + b; stps.push(`fib(${i}) = ${b} + ${a} = ${c}`); a = b; b = c; } stps.push('âœ… Result: 0,1,1,2,3,5,8,13'); }
                    else if (isFactorial) { stps.push('factorial(6)'); stps.push('= 6 Ã— factorial(5)'); stps.push('= 6 Ã— 5 Ã— factorial(4)'); stps.push('= 6 Ã— 5 Ã— 4 Ã— 3 Ã— 2 Ã— 1'); stps.push('âœ… = 720'); }
                    else if (isStack) { stps.push('Stack: []'); stps.push('push(1) â†’ [1]'); stps.push('push(2) â†’ [1,2]'); stps.push('push(3) â†’ [1,2,3] â† top'); stps.push('pop() â†’ removed 3'); stps.push('âœ… Stack: [1,2] â† top is 2'); }
                    else if (isQueue) { stps.push('Queue: []'); stps.push('enqueue(A) â†’ [A]'); stps.push('enqueue(B) â†’ [A,B]'); stps.push('enqueue(C) â†’ [A,B,C]'); stps.push('dequeue() â†’ removed A'); stps.push('âœ… Queue: [B,C] â† front is B'); }
                    else if (isReverse) { const s = 'hello world'; stps.push(`Input: "${s}"`); let r = ''; for (let i = s.length - 1; i >= 0; i--) { r += s[i]; stps.push(`Take '${s[i]}' â†’ "${r}"`); } stps.push(`âœ… Result: "${r}"`); }
                    else if (isPalindrome) { const s = 'racecar'; stps.push(`Input: "${s}"`); for (let i = 0; i < 3; i++) { const j = s.length - 1 - i; stps.push(`Compare '${s[i]}' with '${s[j]}' â†’ âœ… Match`); } stps.push('âœ… All match â†’ palindrome!'); }
                } else {
                    stps.push('âš ï¸ Running your algorithm...');
                    stps.push('âŒ Algorithm produced incorrect output.');
                    stps.push('âŒ Your answer does not match the expected result.');
                    stps.push('Review the problem and try a different approach.');
                }
                setTraceSteps(stps);
                setPlaying(true);
            }, [vizPassed]);

            useEffect(() => {
                if (playing && traceSteps.length > 0) {
                    intervalRef.current = setInterval(() => {
                        setRevealed(prev => { if (prev >= traceSteps.length) { setPlaying(false); return prev; } return prev + 1; });
                    }, 600);
                }
                return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
            }, [playing, traceSteps.length]);

            return (
                <Card className="overflow-hidden">
                    <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex items-center gap-2">
                        <Timer className="h-4 w-4 text-purple-400" />
                        <span className="text-xs text-slate-400 font-mono">step_trace â€” {vizPassed ? 'âœ…' : 'âŒ'}</span>
                    </div>
                    <div className="bg-[#0a0a1a] p-4 font-mono text-sm space-y-1 min-h-[100px]">
                        {traceSteps.slice(0, revealed).map((s, i) => (
                            <div key={i} className={`py-1 px-2 rounded transition-all duration-300 ${i === revealed - 1 ? (vizPassed ? 'bg-purple-500/20 text-purple-300' : 'bg-red-500/20 text-red-300') : 'text-slate-400'}`}>
                                <span className="text-slate-600 mr-2">{i + 1}.</span>{s}
                            </div>
                        ))}
                        {revealed === 0 && <div className="text-slate-600 text-center py-4">Submit your answer to see the visualization</div>}
                    </div>
                    <div className="bg-slate-950 px-4 py-3 border-t border-slate-800 flex items-center gap-2">
                        <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => { setRevealed(0); setPlaying(false); }}><RefreshCw className="h-3 w-3" /> Reset</Button>
                        <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => setPlaying(!playing)} disabled={revealed >= traceSteps.length}>
                            {playing ? <><Pause className="h-3 w-3" /> Pause</> : <><Play className="h-3 w-3" /> Play</>}
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => setRevealed(prev => Math.min(prev + 1, traceSteps.length))} disabled={revealed >= traceSteps.length}>
                            <SkipForward className="h-3 w-3" /> Step
                        </Button>
                        <span className="text-[10px] text-slate-500 ml-auto">{revealed}/{traceSteps.length} steps</span>
                    </div>
                </Card>
            );
        };

        return (
            <div className="space-y-6 max-w-4xl mx-auto pb-12">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href={`/dashboard/skill-lab/${modeId}`}>
                        <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
                    </Link>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <Cpu className="h-5 w-5 text-cyan-500" />
                            <h1 className="text-2xl font-bold">{task.title}</h1>
                            {isCompleted && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                            <Badge variant="secondary" className="text-xs gap-1"><Cpu className="h-3 w-3" /> Algorithm Arena</Badge>
                            <Badge variant="outline" className="text-xs">{task.difficulty}</Badge>
                            <span className="flex items-center gap-1 text-sm text-amber-500 font-medium"><Zap className="h-3.5 w-3.5" /> {task.xpReward} XP</span>
                            {attemptCount > 0 && <span className="text-xs text-muted-foreground">Attempts: {attemptCount}</span>}
                        </div>
                    </div>
                </div>

                {/* Problem Statement */}
                <Card className="border-cyan-500/20 bg-cyan-500/5">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2 text-cyan-600 dark:text-cyan-400">
                            <Lightbulb className="h-4 w-4" /> Problem
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <pre className="whitespace-pre-wrap text-sm text-foreground/90 font-mono leading-relaxed">{task.scenario}</pre>
                    </CardContent>
                </Card>

                {/* Hint Section (appears after 3 failed attempts) */}
                {canShowHint && hintText && (
                    <Card className="border-amber-500/30 bg-amber-500/5">
                        <CardContent className="py-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Lightbulb className="h-5 w-5 text-amber-500" />
                                    <span className="font-semibold text-sm text-amber-600 dark:text-amber-400">Hint Available</span>
                                    <Badge variant="outline" className="text-xs text-amber-600 border-amber-500/30">After {attemptCount} attempts</Badge>
                                </div>
                                <Button variant="outline" size="sm" onClick={() => setShowHint(!showHint)} className="gap-1 text-amber-600 border-amber-500/30 hover:bg-amber-500/10">
                                    {showHint ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                    {showHint ? 'Hide Hint' : 'Show Hint'}
                                </Button>
                            </div>
                            {showHint && <p className="mt-3 text-sm text-foreground/80 bg-amber-500/10 rounded-lg p-3 border border-amber-500/20">ðŸ’¡ {hintText}</p>}
                        </CardContent>
                    </Card>
                )}

                {/* Show Answer Section (appears after 6 failed attempts) */}
                {canShowAnswer && correctAnswer && (
                    <Card className="border-blue-500/30 bg-blue-500/5">
                        <CardContent className="py-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Eye className="h-5 w-5 text-blue-500" />
                                    <span className="font-semibold text-sm text-blue-600 dark:text-blue-400">Answer Available</span>
                                    <Badge variant="outline" className="text-xs text-blue-600 border-blue-500/30">After {attemptCount} attempts</Badge>
                                </div>
                                <Button variant="outline" size="sm" onClick={() => setShowAnswer(!showAnswer)} className="gap-1 text-blue-600 border-blue-500/30 hover:bg-blue-500/10">
                                    {showAnswer ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                    {showAnswer ? 'Hide Answer' : 'Show Answer'}
                                </Button>
                            </div>
                            {showAnswer && (
                                <div className="mt-3">
                                    <pre className="bg-slate-950 rounded-lg p-4 border border-blue-500/20 font-mono text-sm text-green-400 whitespace-pre-wrap overflow-x-auto">{correctAnswer}</pre>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Answer Input */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">ðŸ“ Your Answer</CardTitle>
                        <p className="text-xs text-muted-foreground mt-1">Type the answer, then submit to see your algorithm visualized step-by-step.</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {options ? (
                            <div className="grid gap-3 sm:grid-cols-2">
                                {options.map((opt) => (
                                    <button key={opt} onClick={() => handleSelectOption(opt)} disabled={!!isCompleted}
                                        className={`text-left p-4 rounded-lg border-2 transition-all text-sm ${answer === opt ? "border-primary bg-primary/10 text-foreground" : "border-border hover:border-primary/40 text-muted-foreground hover:text-foreground"} ${isCompleted ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}>
                                        <span className="font-bold mr-2">{opt})</span>
                                        {getOptionLabel(task.scenario, opt)}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="relative">
                                <Textarea placeholder="Type your answer here..." value={answer} onChange={(e) => setAnswer(e.target.value)} rows={4} disabled={!!isCompleted} className="font-mono text-sm bg-slate-950 text-green-400 border-slate-700 placeholder:text-slate-600" />
                                {answer && !isCompleted && (
                                    <Button variant="ghost" size="sm" onClick={() => setAnswer("")} className="absolute top-2 right-2 h-6 w-6 p-0 text-slate-500"><RotateCcw className="h-3 w-3" /></Button>
                                )}
                            </div>
                        )}

                        {!isCompleted && (
                            <div className="flex items-center gap-3">
                                <Button onClick={handleSubmit} disabled={!answer.trim() || submitting} className="gap-2">
                                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                    Submit &amp; Visualize
                                </Button>
                                <span className="text-xs text-muted-foreground">
                                    {attemptCount === 0 ? 'First attempt' : `Attempt #${attemptCount + 1}`}
                                    {attemptCount >= 1 && attemptCount < 3 && ` â€” Hint unlocks after ${3 - attemptCount} more`}
                                    {attemptCount >= 3 && attemptCount < 6 && ` â€” Answer unlocks after ${6 - attemptCount} more`}
                                </span>
                            </div>
                        )}

                        {/* Result feedback */}
                        {result && (
                            <div className={`p-4 rounded-lg border ${result.passed ? "bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-400" : "bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-400"}`}>
                                <div className="flex items-center gap-2 font-semibold">{result.passed ? <><PartyPopper className="h-5 w-5" /> Correct! âš¡</> : <><AlertTriangle className="h-5 w-5" /> Incorrect</>}</div>
                                <p className="text-sm mt-1">{result.feedback}</p>
                                {result.xpEarned > 0 && <p className="text-sm mt-1 flex items-center gap-1 font-medium"><Zap className="h-4 w-4 text-amber-500" /> +{result.xpEarned} XP earned!</p>}
                            </div>
                        )}

                        {isCompleted && !result && (
                            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-400">
                                <div className="flex items-center gap-2 font-semibold"><CheckCircle2 className="h-5 w-5" /> Already Completed</div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Visualization (appears AFTER submission) */}
                {result && hasVisualization && (
                    <div>
                        <h3 className="text-sm font-semibold mb-2 flex items-center gap-2 text-muted-foreground">
                            <BarChart3 className="h-4 w-4" /> Algorithm Visualization â€” {result.passed ? 'âœ… Success' : 'âŒ Failed'}
                        </h3>
                        {isSorting && <SortingVisualizer passed={result.passed} />}
                        {isSearch && <SearchVisualizer passed={result.passed} />}
                        {(isFibonacci || isFactorial || isStack || isQueue || isReverse || isPalindrome) && <StepTrace passed={result.passed} />}
                    </div>
                )}
            </div>
        );
    }

    // ==========================================
    // CODE QUEST UI — Branching Decision Quests
    // ==========================================

    if (isCodeQuest) {
        const questStages = task.taskData?.questStages || [];
        const hasQuestData = questStages.length > 0;

        const QuestUI = () => {
            const [currentStage, setCurrentStage] = useState(0);
            const [selectedOption, setSelectedOption] = useState<number | null>(null);
            const [totalScore, setTotalScore] = useState(0);
            const [stageResults, setStageResults] = useState<{ stage: number; optionIdx: number; points: number; correct: boolean }[]>([]);
            const [questComplete, setQuestComplete] = useState(false);
            const [showFeedback, setShowFeedback] = useState(false);

            if (!hasQuestData) return null;

            const stage = questStages[currentStage];
            const maxPossibleScore = questStages.reduce((sum: number, s: any) => {
                const best = Math.max(...s.options.map((o: any) => o.points));
                return sum + best;
            }, 0);

            const handleChoice = (idx: number) => {
                if (selectedOption !== null) return;
                setSelectedOption(idx);
                const opt = stage.options[idx];
                setTotalScore(prev => prev + opt.points);
                setStageResults(prev => [...prev, { stage: currentStage, optionIdx: idx, points: opt.points, correct: opt.correct }]);
                setShowFeedback(true);
            };

            const advanceStage = () => {
                if (currentStage < questStages.length - 1) {
                    setCurrentStage(prev => prev + 1);
                    setSelectedOption(null);
                    setShowFeedback(false);
                } else {
                    setQuestComplete(true);
                }
            };

            if (questComplete) {
                const scorePercent = Math.round((totalScore / maxPossibleScore) * 100);
                const stars = scorePercent >= 90 ? 3 : scorePercent >= 60 ? 2 : scorePercent >= 30 ? 1 : 0;
                return (
                    <div className="space-y-6">
                        <Card className={`border-2 ${scorePercent >= 90 ? 'border-green-500/30 bg-green-500/5' : scorePercent >= 60 ? 'border-amber-500/30 bg-amber-500/5' : 'border-red-500/30 bg-red-500/5'}`}>
                            <CardContent className="py-8 text-center space-y-4">
                                <div className="text-4xl">{'⭐'.repeat(stars)}{'☆'.repeat(3 - stars)}</div>
                                <h2 className="text-2xl font-bold">{scorePercent >= 90 ? 'Quest Mastered!' : scorePercent >= 60 ? 'Quest Completed!' : 'Quest Finished'}</h2>
                                <p className="text-muted-foreground">You scored <span className="font-bold text-foreground">{totalScore}</span> out of <span className="font-bold">{maxPossibleScore}</span> points ({scorePercent}%)</p>
                                <div className="flex justify-center gap-2 mt-4">
                                    {stageResults.map((r, i) => (
                                        <div key={i} className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold border-2 ${r.correct ? 'bg-green-500/20 border-green-500 text-green-500' : r.points > 0 ? 'bg-amber-500/20 border-amber-500 text-amber-500' : 'bg-red-500/20 border-red-500 text-red-500'}`}>
                                            +{r.points}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Submit for XP */}
                        <Card>
                            <CardContent className="py-4 space-y-4">
                                <p className="text-sm text-muted-foreground">Submit your quest result to earn XP. Answer the question below based on your quest experience:</p>
                                {options ? (
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        {options.map((opt) => (
                                            <button key={opt} onClick={() => handleSelectOption(opt)} disabled={!!isCompleted}
                                                className={`text-left p-4 rounded-lg border-2 transition-all text-sm ${answer === opt ? "border-primary bg-primary/10 text-foreground" : "border-border hover:border-primary/40 text-muted-foreground hover:text-foreground"} ${isCompleted ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}>
                                                <span className="font-bold mr-2">{opt})</span>
                                                {getOptionLabel(task.scenario, opt)}
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <Textarea placeholder="Type your answer..." value={answer} onChange={e => setAnswer(e.target.value)} rows={2} disabled={!!isCompleted} className="font-mono text-sm" />
                                )}
                                {!isCompleted && (
                                    <Button onClick={handleSubmit} disabled={!answer.trim() || submitting} className="gap-2">
                                        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                        Complete Quest
                                    </Button>
                                )}
                                {result && (
                                    <div className={`p-4 rounded-lg border ${result.passed ? "bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-400" : "bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-400"}`}>
                                        <div className="flex items-center gap-2 font-semibold">{result.passed ? <><PartyPopper className="h-5 w-5" /> Quest Complete!</> : "Not Quite Right"}</div>
                                        <p className="text-sm mt-1">{result.feedback}</p>
                                        {result.xpEarned > 0 && <p className="text-sm mt-1 flex items-center gap-1 font-medium"><Zap className="h-4 w-4 text-amber-500" /> +{result.xpEarned} XP earned!</p>}
                                    </div>
                                )}
                                {isCompleted && !result && (
                                    <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-400">
                                        <div className="flex items-center gap-2 font-semibold"><CheckCircle2 className="h-5 w-5" /> Already Completed</div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                );
            }

            return (
                <div className="space-y-5">
                    {/* Progress */}
                    <div className="flex items-center gap-3">
                        {questStages.map((_: any, i: number) => (
                            <div key={i} className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${i < currentStage ? 'bg-green-500 border-green-500 text-white' :
                                    i === currentStage ? 'bg-primary border-primary text-primary-foreground' :
                                        'bg-muted border-border text-muted-foreground'
                                    }`}>{i + 1}</div>
                                {i < questStages.length - 1 && <div className={`w-8 h-0.5 ${i < currentStage ? 'bg-green-500' : 'bg-border'}`} />}
                            </div>
                        ))}
                        <span className="ml-auto text-xs text-muted-foreground font-mono">Score: {totalScore}</span>
                    </div>

                    {/* Stage Title & Scenario */}
                    <Card className="border-violet-500/20 bg-violet-500/5">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm text-violet-600 dark:text-violet-400">{stage.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">{stage.scenario}</p>
                        </CardContent>
                    </Card>

                    {/* Decision Options */}
                    <div className="grid gap-3">
                        {stage.options.map((opt: any, idx: number) => {
                            const isSelected = selectedOption === idx;
                            const isRevealed = selectedOption !== null;
                            let borderClass = 'border-border hover:border-primary/40';
                            let bgClass = '';
                            if (isRevealed) {
                                if (opt.correct) {
                                    borderClass = 'border-green-500';
                                    bgClass = isSelected ? 'bg-green-500/10' : 'bg-green-500/5';
                                } else if (isSelected && !opt.correct) {
                                    borderClass = opt.points > 0 ? 'border-amber-500' : 'border-red-500';
                                    bgClass = opt.points > 0 ? 'bg-amber-500/10' : 'bg-red-500/10';
                                } else {
                                    borderClass = 'border-border opacity-50';
                                }
                            }
                            return (
                                <button key={idx} onClick={() => handleChoice(idx)} disabled={isRevealed}
                                    className={`text-left p-4 rounded-lg border-2 transition-all ${borderClass} ${bgClass} ${isRevealed ? 'cursor-default' : 'cursor-pointer'}`}>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">{opt.text}</span>
                                        {isRevealed && (
                                            <Badge className={`text-[10px] ml-2 ${opt.correct ? 'bg-green-500/20 text-green-500 border-green-500/30' : opt.points > 0 ? 'bg-amber-500/20 text-amber-500 border-amber-500/30' : 'bg-red-500/20 text-red-500 border-red-500/30'}`}>
                                                {opt.correct ? '✅ Best' : opt.points > 0 ? `+${opt.points}` : '❌ 0'}
                                            </Badge>
                                        )}
                                    </div>
                                    {isRevealed && isSelected && (
                                        <p className={`text-xs mt-2 ${opt.correct ? 'text-green-600 dark:text-green-400' : opt.points > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}`}>
                                            {opt.feedback}
                                        </p>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Next Stage Button */}
                    {showFeedback && (
                        <Button onClick={advanceStage} className="w-full gap-2">
                            {currentStage < questStages.length - 1 ? <><SkipForward className="h-4 w-4" /> Next Stage</> : <><PartyPopper className="h-4 w-4" /> Finish Quest</>}
                        </Button>
                    )}
                </div>
            );
        };

        return (
            <div className="space-y-6 max-w-4xl mx-auto pb-12">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href={`/dashboard/skill-lab/${modeId}`}>
                        <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
                    </Link>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <Globe className="h-5 w-5 text-violet-500" />
                            <h1 className="text-2xl font-bold">{task.title}</h1>
                            {isCompleted && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                            <Badge variant="secondary" className="text-xs gap-1"><Globe className="h-3 w-3" /> Code Quest</Badge>
                            <Badge variant="outline" className="text-xs">{task.difficulty}</Badge>
                            <span className="flex items-center gap-1 text-sm text-amber-500 font-medium"><Zap className="h-3.5 w-3.5" /> {task.xpReward} XP</span>
                        </div>
                    </div>
                </div>

                {/* Quest Description */}
                <Card className="border-violet-500/20 bg-gradient-to-r from-violet-500/5 to-purple-500/5">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2 text-violet-600 dark:text-violet-400">
                            🗺️ Quest Briefing
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-foreground/80">{task.description}</p>
                        <p className="text-xs text-muted-foreground mt-2">Complete all {questStages.length} stages. Your decisions affect your score. Choose wisely!</p>
                    </CardContent>
                </Card>

                {/* Quest Stages */}
                <QuestUI />

                {/* Fallback for completed quests without quest data */}
                {isCompleted && !hasQuestData && (
                    <Card>
                        <CardContent className="py-4">
                            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-400">
                                <div className="flex items-center gap-2 font-semibold"><CheckCircle2 className="h-5 w-5" /> Already Completed</div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        );
    }

    // ==========================================
    // DEV SIMULATOR UI — Real-World Missions
    // ==========================================

    if (isDevSimulator) {
        // Parse scenario into sections
        const scenarioText = task.scenario || '';
        const missionRole = task.taskData?.missionRole || 'Developer';
        const missionCompany = task.taskData?.missionCompany || 'Tech Company';
        const errorLog = task.taskData?.errorLog || null;
        const codeSnippet = task.taskData?.codeSnippet || null;

        // Extract the mission description from scenario
        const missionLines = scenarioText.split('\n').filter((l: string) => l.trim());
        const missionDesc = missionLines.find((l: string) => l.startsWith('Mission:'))?.replace('Mission: ', '') || task.description;

        // Extract code from scenario if not in taskData
        let displayCode = codeSnippet;
        if (!displayCode) {
            const codeMatch = scenarioText.match(/Code[:\s]*\n([\s\S]*?)(?:\n\n|What|How|$)/);
            if (codeMatch) displayCode = codeMatch[1].trim();
        }

        // Extract error from scenario if not in taskData  
        let displayError = errorLog;
        if (!displayError) {
            const errorMatch = scenarioText.match(/Error[^:]*:\s*"([^"]+)"/);
            if (errorMatch) displayError = errorMatch[1];
        }

        // Extract the question from scenario
        const questionMatch = scenarioText.match(/(What|How|Why)[^?]*\?/);
        const missionQuestion = questionMatch ? questionMatch[0] : 'Identify the bug and suggest a fix.';

        return (
            <div className="space-y-5 max-w-4xl mx-auto pb-12">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href={`/dashboard/skill-lab/${modeId}`}>
                        <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
                    </Link>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <Activity className="h-5 w-5 text-emerald-500" />
                            <h1 className="text-2xl font-bold">{task.title}</h1>
                            {isCompleted && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                            <Badge variant="secondary" className="text-xs gap-1"><Activity className="h-3 w-3" /> Dev Simulator</Badge>
                            <Badge variant="outline" className="text-xs">{task.difficulty}</Badge>
                            <span className="flex items-center gap-1 text-sm text-amber-500 font-medium"><Zap className="h-3.5 w-3.5" /> {task.xpReward} XP</span>
                        </div>
                    </div>
                </div>

                {/* Mission Briefing */}
                <Card className="border-emerald-500/20 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 overflow-hidden">
                    <div className="bg-emerald-600 dark:bg-emerald-700 px-4 py-2 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        <span className="text-xs font-mono text-emerald-50 uppercase tracking-wider">🎯 Mission Briefing</span>
                    </div>
                    <CardContent className="pt-4 space-y-3">
                        <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400">👤 {missionRole}</Badge>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400">🏢 {missionCompany}</Badge>
                            </div>
                        </div>
                        <p className="text-sm text-foreground/90 leading-relaxed">{missionDesc}</p>
                    </CardContent>
                </Card>

                {/* Error Log Panel */}
                {displayError && (
                    <Card className="border-red-500/30 bg-red-500/5">
                        <div className="bg-red-600/90 dark:bg-red-800 px-4 py-1.5 flex items-center gap-2">
                            <AlertTriangle className="h-3.5 w-3.5 text-red-100" />
                            <span className="text-xs font-mono text-red-100 uppercase tracking-wider">Error Log</span>
                        </div>
                        <CardContent className="pt-3">
                            <pre className="text-xs font-mono text-red-600 dark:text-red-400 whitespace-pre-wrap bg-red-500/5 p-3 rounded-lg border border-red-500/20">
                                {displayError}
                            </pre>
                        </CardContent>
                    </Card>
                )}

                {/* Code Snippet Panel */}
                {displayCode && (
                    <Card className="border-zinc-700/30 bg-zinc-950 overflow-hidden">
                        <div className="bg-zinc-800 px-4 py-1.5 flex items-center gap-2">
                            <div className="flex gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                                <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                            </div>
                            <span className="text-xs font-mono text-zinc-400 ml-2">source code</span>
                        </div>
                        <CardContent className="py-3 px-0">
                            <pre className="text-sm font-mono text-green-400 whitespace-pre-wrap px-4 leading-relaxed overflow-x-auto">
                                {displayCode}
                            </pre>
                        </CardContent>
                    </Card>
                )}

                {/* Mission Objective */}
                <Card className="border-amber-500/20 bg-amber-500/5">
                    <CardContent className="py-3">
                        <p className="text-sm font-semibold flex items-center gap-2 text-amber-600 dark:text-amber-400">
                            ❓ {missionQuestion}
                        </p>
                    </CardContent>
                </Card>

                {/* Attempt Counter */}
                {!isCompleted && task.attemptCount > 0 && (
                    <div className="text-xs text-muted-foreground text-center">
                        Attempt #{task.attemptCount + 1}
                        {task.attemptCount < 3 && ` — Hint button unlocks after ${3 - task.attemptCount} more failed attempt${3 - task.attemptCount > 1 ? 's' : ''}`}
                        {task.attemptCount >= 3 && task.attemptCount < 6 && ` — Show Answer button unlocks after ${6 - task.attemptCount} more failed attempt${6 - task.attemptCount > 1 ? 's' : ''}`}
                    </div>
                )}

                {/* Show Hint Button (after 3+ fails) */}
                {task.hintText && !isCompleted && (
                    <div className="space-y-2">
                        {!showHint ? (
                            <Button variant="outline" onClick={() => setShowHint(true)} className="w-full gap-2 border-amber-500/30 text-amber-600 hover:bg-amber-500/10">
                                <Lightbulb className="h-4 w-4" /> Show Hint
                            </Button>
                        ) : (
                            <Card className="border-amber-500/30 bg-amber-500/5">
                                <CardContent className="py-3">
                                    <p className="text-sm flex items-center gap-2">
                                        <Lightbulb className="h-4 w-4 text-amber-500 shrink-0" />
                                        <span className="text-amber-700 dark:text-amber-300">{task.hintText}</span>
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}

                {/* Show Answer Button (after 6+ fails) */}
                {task.correctAnswer && !isCompleted && (
                    <div className="space-y-2">
                        {!showAnswer ? (
                            <Button variant="outline" onClick={() => setShowAnswer(true)} className="w-full gap-2 border-blue-500/30 text-blue-600 hover:bg-blue-500/10">
                                <Eye className="h-4 w-4" /> Show Answer
                            </Button>
                        ) : (
                            <Card className="border-blue-500/30 bg-blue-500/5">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm flex items-center gap-2 text-blue-600 dark:text-blue-400">
                                        <Eye className="h-4 w-4" /> Correct Answer
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <pre className="text-xs font-mono whitespace-pre-wrap bg-zinc-950 text-green-400 p-4 rounded-lg border border-zinc-700/50 leading-relaxed max-h-80 overflow-y-auto select-all">
                                        {task.correctAnswer}
                                    </pre>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}

                {/* Solution Submission */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm">💡 Your Solution</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="relative">
                            <Textarea
                                placeholder="Explain the bug and your proposed fix...

Example: The bug is... The fix is to..."
                                value={answer}
                                onChange={e => setAnswer(e.target.value)}
                                rows={5}
                                disabled={!!isCompleted}
                                className="font-mono text-sm bg-zinc-950 text-green-400 border-zinc-700/50 placeholder:text-zinc-600"
                            />
                            {answer.trim() && !isCompleted && (
                                <button onClick={() => setAnswer('')} className="absolute top-2 right-2 text-xs text-zinc-500 hover:text-zinc-300">Clear</button>
                            )}
                        </div>

                        {!isCompleted && (
                            <Button onClick={handleSubmit} disabled={!answer.trim() || submitting} className="w-full gap-2">
                                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                Submit Solution
                            </Button>
                        )}

                        {result && (
                            <div className={`p-4 rounded-lg border ${result.passed ? "bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-400" : "bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-400"}`}>
                                <div className="flex items-center gap-2 font-semibold">
                                    {result.passed ? <><PartyPopper className="h-5 w-5" /> Mission Complete!</> : <><AlertTriangle className="h-5 w-5" /> Incorrect Solution</>}
                                </div>
                                <p className="text-sm mt-1">{result.feedback}</p>
                                {result.xpEarned > 0 && <p className="text-sm mt-1 flex items-center gap-1 font-medium"><Zap className="h-4 w-4 text-amber-500" /> +{result.xpEarned} XP earned!</p>}
                            </div>
                        )}

                        {isCompleted && !result && (
                            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-400">
                                <div className="flex items-center gap-2 font-semibold"><CheckCircle2 className="h-5 w-5" /> Mission Already Completed</div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        );
    }

    // ==========================================
    // GENERIC UI (other modes)
    // ==========================================

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
                <Link href={`/dashboard/skill-lab/${modeId}`}>
                    <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
                </Link>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold">{task.title}</h1>
                        {isCompleted && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                        <Badge variant="secondary" className="text-xs">{task.mode.title}</Badge>
                        <Badge variant="outline" className="text-xs">{task.difficulty}</Badge>
                        <span className="flex items-center gap-1 text-sm text-amber-500 font-medium"><Zap className="h-3.5 w-3.5" /> {task.xpReward} XP</span>
                    </div>
                </div>
            </div>

            <Card className="border-primary/20">
                <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Lightbulb className="h-4 w-4 text-amber-500" /> Scenario</CardTitle></CardHeader>
                <CardContent>
                    <pre className="whitespace-pre-wrap text-sm text-muted-foreground font-mono bg-muted/50 rounded-lg p-4 leading-relaxed">{task.scenario}</pre>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-3"><CardTitle className="text-base">Your Answer</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    {options ? (
                        <div className="grid gap-3 sm:grid-cols-2">
                            {options.map((opt) => (
                                <button key={opt} onClick={() => handleSelectOption(opt)} disabled={!!isCompleted}
                                    className={`text-left p-4 rounded-lg border-2 transition-all text-sm ${answer === opt ? "border-primary bg-primary/10 text-foreground" : "border-border hover:border-primary/40 text-muted-foreground hover:text-foreground"} ${isCompleted ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}>
                                    <span className="font-bold mr-2">{opt})</span>
                                    {getOptionLabel(task.scenario, opt)}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <Textarea placeholder="Type your answer here..." value={answer} onChange={(e) => setAnswer(e.target.value)} rows={5} disabled={!!isCompleted} className="font-mono text-sm" />
                    )}

                    {!isCompleted && (
                        <Button onClick={handleSubmit} disabled={!answer.trim() || submitting} className="w-full sm:w-auto">
                            {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}Submit Answer
                        </Button>
                    )}

                    {result && (
                        <div className={`p-4 rounded-lg border ${result.passed ? "bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-400" : "bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-400"}`}>
                            <div className="flex items-center gap-2 font-semibold">{result.passed ? <><PartyPopper className="h-5 w-5" /> Correct!</> : "Not Quite Right"}</div>
                            <p className="text-sm mt-1">{result.feedback}</p>
                            {result.xpEarned > 0 && <p className="text-sm mt-1 flex items-center gap-1 font-medium"><Zap className="h-4 w-4 text-amber-500" /> +{result.xpEarned} XP earned!</p>}
                        </div>
                    )}

                    {isCompleted && !result && (
                        <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-400">
                            <div className="flex items-center gap-2 font-semibold"><CheckCircle2 className="h-5 w-5" /> Already Completed</div>
                            <p className="text-sm mt-1">You&apos;ve already solved this task. Great work!</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
