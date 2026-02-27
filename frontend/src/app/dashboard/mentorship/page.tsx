"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, MessageSquare, UserPlus, CheckCircle, XCircle, Users, Clock, Zap, Trophy, Flame } from "lucide-react";
import api from "@/lib/api";

// ─── Interfaces ──────────────────────────────────────
interface MentorProfile {
    id: string;
    fullName: string;
    username: string;
    avatarUrl: string;
    bio: string;
    role: string;
}

interface MenteeRequest {
    id: string;
    status: string;
    requestedAt: string;
    mentee: {
        id: string;
        email: string;
        profile: { username: string; fullName: string; avatarUrl: string; bio: string };
        gamification: { totalXp: number; level: number; currentStreak: number } | null;
    };
}

interface MenteeConnection {
    id: string;
    mentee: {
        id: string;
        profile: { username: string; fullName: string; avatarUrl: string };
        gamification: { totalXp: number; level: number; currentStreak: number; longestStreak: number; lastLoginDate: string | null } | null;
    };
}

interface LearnerRequest {
    id: string;
    status: string;
    mentor: {
        id: string;
        profile: { username: string; fullName: string; avatarUrl: string };
    };
}

// ─── Mentor View Component ───────────────────────────
function MentorMentorshipView() {
    const [requests, setRequests] = useState<MenteeRequest[]>([]);
    const [mentees, setMentees] = useState<MenteeConnection[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [unreadPerUser, setUnreadPerUser] = useState<Record<string, number>>({});

    useEffect(() => {
        fetchAll();
        fetchUnread();
    }, []);

    const fetchUnread = async () => {
        try {
            const res = await api.get("/mentorship/chat/unread-counts");
            setUnreadPerUser(res.data.data?.perUser || {});
        } catch { /* ignore */ }
    };

    const fetchAll = async () => {
        try {
            const [reqRes, menteeRes] = await Promise.all([
                api.get("/mentorship/requests"),
                api.get("/mentorship/mentees")
            ]);
            setRequests(reqRes.data.data || []);
            setMentees(menteeRes.data.data || []);
        } catch (error) {
            console.error("Failed to fetch mentorship data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id: string, action: "accept" | "decline") => {
        setActionLoading(id);
        try {
            await api.put(`/mentorship/requests/${id}/${action}`);
            setRequests(prev => prev.filter(r => r.id !== id));
            if (action === "accept") fetchAll();
        } catch (error) {
            console.error(`Failed to ${action} request`, error);
        } finally {
            setActionLoading(null);
        }
    };

    const handleRemoveMentee = async (menteeId: string, menteeName: string) => {
        if (!confirm(`Are you sure you want to remove ${menteeName}? They will be notified and will need to find a new mentor.`)) {
            return;
        }
        setActionLoading(menteeId);
        try {
            await api.delete(`/mentorship/mentees/${menteeId}`);
            setMentees(prev => prev.filter(c => c.mentee.id !== menteeId));
        } catch (error) {
            console.error("Failed to remove mentee", error);
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Mentorship</h1>
                <p className="text-muted-foreground mt-1">Manage your mentees and review requests.</p>
            </div>

            {/* Pending Requests */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-amber-500" />
                    <h2 className="text-xl font-semibold">Pending Requests</h2>
                    {requests.length > 0 && (
                        <span className="inline-flex items-center rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold text-amber-500 border border-amber-500/30">
                            {requests.length}
                        </span>
                    )}
                </div>

                {requests.length === 0 ? (
                    <Card className="border-dashed">
                        <CardContent className="py-8 text-center text-muted-foreground">
                            No pending requests at the moment.
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                        {requests.map((req) => (
                            <Card key={req.id} className="border border-amber-500/20 bg-amber-500/5">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-11 w-11">
                                            <AvatarImage src={req.mentee.profile?.avatarUrl} alt={req.mentee.profile?.username} />
                                            <AvatarFallback>{(req.mentee.profile?.username || "?").substring(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <CardTitle className="text-base">{req.mentee.profile?.fullName || req.mentee.profile?.username}</CardTitle>
                                            <CardDescription className="text-xs">@{req.mentee.profile?.username}</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="pb-3">
                                    <div className="flex gap-4 text-sm text-muted-foreground">
                                        <span className="flex items-center gap-1"><Zap className="h-3.5 w-3.5" /> {req.mentee.gamification?.totalXp || 0} XP</span>
                                        <span className="flex items-center gap-1"><Trophy className="h-3.5 w-3.5" /> Level {req.mentee.gamification?.level || 1}</span>
                                        <span className="flex items-center gap-1"><Flame className="h-3.5 w-3.5" /> {req.mentee.gamification?.currentStreak || 0} day streak</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-2">
                                        Requested {new Date(req.requestedAt).toLocaleDateString()}
                                    </p>
                                </CardContent>
                                <CardFooter className="gap-2">
                                    <Button
                                        size="sm"
                                        className="flex-1 bg-green-600 hover:bg-green-700"
                                        onClick={() => handleAction(req.id, "accept")}
                                        disabled={actionLoading === req.id}
                                    >
                                        {actionLoading === req.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-1" />}
                                        Accept
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="flex-1 border-red-500/50 text-red-500 hover:bg-red-500/10"
                                        onClick={() => handleAction(req.id, "decline")}
                                        disabled={actionLoading === req.id}
                                    >
                                        <XCircle className="h-4 w-4 mr-1" /> Decline
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Active Mentees */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-semibold">Active Mentees</h2>
                    <span className="inline-flex items-center rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-semibold text-primary border border-primary/30">
                        {mentees.length}
                    </span>
                </div>

                {mentees.length === 0 ? (
                    <Card className="border-dashed">
                        <CardContent className="py-8 text-center text-muted-foreground">
                            No active mentees yet. Accept a request to get started!
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {mentees.map((conn) => {
                            const m = conn.mentee;
                            const g = m.gamification;
                            return (
                                <Card key={conn.id} className="hover:border-primary/30 transition-colors">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10">
                                                <AvatarImage src={m.profile?.avatarUrl} alt={m.profile?.username} />
                                                <AvatarFallback>{(m.profile?.username || "?").substring(0, 2).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <CardTitle className="text-sm">{m.profile?.fullName || m.profile?.username}</CardTitle>
                                                <CardDescription className="text-xs">@{m.profile?.username}</CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                        <div className="grid grid-cols-3 gap-2 text-center">
                                            <div className="rounded-md bg-muted/50 p-1.5">
                                                <div className="text-[10px] text-muted-foreground">XP</div>
                                                <div className="font-bold text-xs">{g?.totalXp || 0}</div>
                                            </div>
                                            <div className="rounded-md bg-muted/50 p-1.5">
                                                <div className="text-[10px] text-muted-foreground">Level</div>
                                                <div className="font-bold text-xs">{g?.level || 1}</div>
                                            </div>
                                            <div className="rounded-md bg-muted/50 p-1.5">
                                                <div className="text-[10px] text-muted-foreground">Streak</div>
                                                <div className="font-bold text-xs">{g?.currentStreak || 0}🔥</div>
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="gap-2">
                                        <Button variant="outline" size="sm" className="flex-1 text-xs relative" onClick={() => window.location.href = `/dashboard/mentorship/chat/${m.id}`}>
                                            <MessageSquare className="h-3.5 w-3.5 mr-1" /> Chat
                                            {(unreadPerUser[m.id] || 0) > 0 && (
                                                <span className="absolute -top-1.5 -right-1.5 inline-flex items-center justify-center rounded-full bg-red-500 px-1 py-0.5 text-[9px] font-bold text-white min-w-[16px]">
                                                    {unreadPerUser[m.id]}
                                                </span>
                                            )}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs border-red-500/50 text-red-500 hover:bg-red-500/10"
                                            onClick={() => handleRemoveMentee(m.id, m.profile?.fullName || m.profile?.username || "this mentee")}
                                            disabled={actionLoading === m.id}
                                        >
                                            <XCircle className="h-3.5 w-3.5 mr-1" /> Remove
                                        </Button>
                                    </CardFooter>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Learner View Component ──────────────────────────
function LearnerMentorshipView() {
    const [mentors, setMentors] = useState<MentorProfile[]>([]);
    const [myRequests, setMyRequests] = useState<LearnerRequest[]>([]);
    const [activeMentor, setActiveMentor] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [requesting, setRequesting] = useState<string | null>(null);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        fetchData();
        // Fetch unread counts
        api.get("/mentorship/chat/unread-counts")
            .then(res => setUnreadCount(res.data.data?.total || 0))
            .catch(() => { });
    }, []);

    const fetchData = async () => {
        try {
            // First check if learner already has an active mentor
            const mentorRes = await api.get("/mentorship/my-mentor");
            if (mentorRes.data.data) {
                setActiveMentor(mentorRes.data.data);
                setLoading(false);
                return;
            }
        } catch {
            // No active mentor, continue to find-a-mentor view
        }

        try {
            const [mentorListRes, reqRes] = await Promise.all([
                api.get("/users/mentors"),
                api.get("/mentorship/my-requests")
            ]);
            setMentors(mentorListRes.data.data || []);
            setMyRequests(reqRes.data.data || []);
        } catch (error) {
            console.error("Failed to fetch mentorship data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleRequest = async (mentorId: string) => {
        setRequesting(mentorId);
        try {
            await api.post("/mentorship/request", { mentorId });
            fetchData();
        } catch (error: any) {
            console.error("Failed to request mentor", error);
            alert(error.response?.data?.error?.message || "Failed to send request");
        } finally {
            setRequesting(null);
        }
    };

    const getRequestStatus = (mentorId: string): string | null => {
        const req = myRequests.find(r => r.mentor?.id === mentorId);
        return req?.status || null;
    };

    if (loading) {
        return (
            <div className="flex justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    // ── Active mentor view ──
    if (activeMentor) {
        const mentor = activeMentor.mentor;
        const profile = mentor?.profile;
        return (
            <div className="space-y-6">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-100">My Mentor</h1>
                    <p className="text-muted-foreground">You are connected with a mentor. Chat and get guidance!</p>
                </div>

                <Card className="bg-slate-900/50 border-primary/30 max-w-2xl">
                    <CardHeader className="flex flex-row items-center gap-4">
                        <Avatar className="h-14 w-14 ring-2 ring-primary/40">
                            <AvatarImage src={profile?.avatarUrl} alt={profile?.username} />
                            <AvatarFallback>{(profile?.username || "?").substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0">
                            <CardTitle className="text-lg text-slate-100">{profile?.fullName || profile?.username}</CardTitle>
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm text-primary">@{profile?.username}</span>
                                <span className="inline-flex items-center rounded-full border border-green-500/50 bg-green-500/10 px-2 py-0.5 text-[10px] font-semibold text-green-400 whitespace-nowrap">
                                    ✓ CONNECTED
                                </span>
                            </div>
                        </div>
                    </CardHeader>
                    {profile?.bio && (
                        <CardContent className="pt-0">
                            <p className="text-sm text-slate-400">{profile.bio}</p>
                        </CardContent>
                    )}
                    <CardFooter>
                        <Button
                            className="w-full gap-2 relative"
                            onClick={() => window.location.href = `/dashboard/mentorship/chat/${mentor.id}`}
                        >
                            <MessageSquare className="h-4 w-4" /> Chat with Mentor
                            {unreadCount > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 inline-flex items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white min-w-[18px]">
                                    {unreadCount}
                                </span>
                            )}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    // ── Find a mentor view ──
    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-slate-100">Find a Mentor</h1>
                <p className="text-muted-foreground">Connect with experienced developers to guide your journey.</p>
            </div>

            {mentors.length === 0 ? (
                <div className="text-center p-12 text-slate-400 border border-slate-800 rounded-lg bg-slate-900/50">
                    <p className="text-lg mb-2">No mentors found yet.</p>
                    <p className="text-sm">Check back later or invite peers to join CodeKori!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mentors.map((mentor) => {
                        const status = getRequestStatus(mentor.id);
                        return (
                            <Card key={mentor.id} className="bg-slate-900/50 border-slate-800 hover:border-primary/50 transition-colors overflow-hidden">
                                <CardHeader className="flex flex-row items-center gap-4">
                                    <Avatar className="h-12 w-12 shrink-0">
                                        <AvatarImage src={mentor.avatarUrl} alt={mentor.username} />
                                        <AvatarFallback>{mentor.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col min-w-0">
                                        <CardTitle className="text-lg text-slate-100 truncate">{mentor.fullName || mentor.username}</CardTitle>
                                        <div className="flex items-center gap-1 flex-wrap">
                                            <span className="text-sm text-primary truncate">@{mentor.username}</span>
                                            <span className="inline-flex items-center rounded-full border border-primary/50 px-1.5 py-0.5 text-[10px] font-semibold text-primary whitespace-nowrap shrink-0">
                                                MENTOR
                                            </span>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-slate-400 line-clamp-3">
                                        {mentor.bio || "No bio available."}
                                    </p>
                                </CardContent>
                                <CardFooter className="flex justify-between gap-2">
                                    {status === "active" ? (
                                        <Button className="w-full bg-green-600 hover:bg-green-700" disabled>
                                            <CheckCircle className="mr-2 h-4 w-4" /> Your Mentor
                                        </Button>
                                    ) : status === "pending" ? (
                                        <Button className="w-full" variant="outline" disabled>
                                            <Clock className="mr-2 h-4 w-4" /> Request Pending
                                        </Button>
                                    ) : (
                                        <Button
                                            className="w-full bg-primary hover:bg-primary/90"
                                            onClick={() => handleRequest(mentor.id)}
                                            disabled={requesting === mentor.id}
                                        >
                                            {requesting === mentor.id ? (
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            ) : (
                                                <UserPlus className="mr-2 h-4 w-4" />
                                            )}
                                            Request Mentor
                                        </Button>
                                    )}
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// ─── Main Page (Route Handler) ───────────────────────
export default function MentorshipPage() {
    const [role, setRole] = useState<string>("learner");
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const storedRole = localStorage.getItem("userRole");
        if (storedRole) setRole(storedRole);
        setReady(true);
    }, []);

    if (!ready) {
        return (
            <div className="flex justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return role === "mentor" ? <MentorMentorshipView /> : <LearnerMentorshipView />;
}
