"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, MessageSquare, UserPlus } from "lucide-react";
import api from "@/lib/api";
import { useSocket } from "@/context/socket-context";

interface Mentor {
    id: string;
    fullName: string;
    username: string;
    avatarUrl: string;
    bio: string;
    role: string;
}

export default function MentorshipPage() {
    const [mentors, setMentors] = useState<Mentor[]>([]);
    const [loading, setLoading] = useState(true);
    const { socket } = useSocket();

    useEffect(() => {
        fetchMentors();
    }, []);

    const fetchMentors = async () => {
        try {
            const res = await api.get("/users/mentors");
            setMentors(res.data.data);
        } catch (error) {
            console.error("Failed to fetch mentors", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStartChat = (mentorId: string) => {
        console.log("Start chat with", mentorId);
        // Dispatch custom event to open chat widget or handle via context
        // This relies on the ChatWidget listening for this event or explicit router navigation
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-slate-100">Find a Mentor</h1>
                <p className="text-muted-foreground">Connect with experienced developers to guide your journey.</p>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : mentors.length === 0 ? (
                <div className="text-center p-12 text-slate-400 border border-slate-800 rounded-lg bg-slate-900/50">
                    <p className="text-lg mb-2">No mentors found yet.</p>
                    <p className="text-sm">Check back later or invite peers to join CodeKori!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mentors.map((mentor) => (
                        <Card key={mentor.id} className="bg-slate-900/50 border-slate-800 hover:border-primary/50 transition-colors">
                            <CardHeader className="flex flex-row items-center gap-4">
                                <Avatar className="h-12 w-12">
                                    <AvatarImage src={mentor.avatarUrl} alt={mentor.username} />
                                    <AvatarFallback>{mentor.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                    <CardTitle className="text-lg text-slate-100">{mentor.fullName || mentor.username}</CardTitle>
                                    <CardDescription className="text-primary flex items-center gap-1">
                                        @{mentor.username}
                                        <Badge variant="outline" className="ml-2 text-xs border-primary/50 text-primary">MENTOR</Badge>
                                    </CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-slate-400 line-clamp-3">
                                    {mentor.bio || "No bio available."}
                                </p>
                            </CardContent>
                            <CardFooter className="flex justify-between gap-2">
                                <Button variant="outline" className="w-full" onClick={() => handleStartChat(mentor.id)}>
                                    <MessageSquare className="mr-2 h-4 w-4" /> Chat
                                </Button>
                                <Button className="w-full bg-primary hover:bg-primary/90">
                                    <UserPlus className="mr-2 h-4 w-4" /> Request
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
