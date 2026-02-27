"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Send, Loader2 } from "lucide-react";

interface ChatMessage {
    id: string;
    content: string;
    senderId: string;
    createdAt: string;
}

interface UserProfile {
    id: string;
    profile: { username: string; fullName: string; avatarUrl: string };
}

export default function MentorshipChatPage() {
    const params = useParams();
    const router = useRouter();
    const userId = params.userId as string;
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [sending, setSending] = useState(false);
    const [loading, setLoading] = useState(true);
    const [otherUser, setOtherUser] = useState<UserProfile | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string>("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchChat = async () => {
            try {
                // Fetch chat messages
                const res = await api.get(`/mentorship/chat/${userId}`);
                setMessages(res.data.data?.messages || []);
                setOtherUser(res.data.data?.otherUser || null);
                setCurrentUserId(res.data.data?.currentUserId || "");
                // Mark chat notifications from this user as read
                await api.post(`/mentorship/chat/${userId}/read`).catch(() => { });
            } catch (error) {
                console.error("Failed to load chat", error);
            } finally {
                setLoading(false);
            }
        };
        fetchChat();
    }, [userId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async () => {
        if (!newMessage.trim()) return;
        setSending(true);
        try {
            const res = await api.post(`/mentorship/chat/${userId}`, { content: newMessage });
            setMessages(prev => [...prev, res.data.data]);
            setNewMessage("");
        } catch (error) {
            console.error("Failed to send message", error);
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-6rem)] max-w-3xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4 pb-4 border-b">
                <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/mentorship")}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                {otherUser && (
                    <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                            <AvatarImage src={otherUser.profile?.avatarUrl} />
                            <AvatarFallback>{(otherUser.profile?.username || "?").substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h2 className="font-semibold text-sm">{otherUser.profile?.fullName || otherUser.profile?.username}</h2>
                            <p className="text-xs text-muted-foreground">@{otherUser.profile?.username}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                        No messages yet. Start the conversation!
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${msg.senderId === currentUserId
                                ? 'bg-primary text-primary-foreground rounded-br-md'
                                : 'bg-muted rounded-bl-md'
                                }`}>
                                <p>{msg.content}</p>
                                <p className={`text-[10px] mt-1 ${msg.senderId === currentUserId ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="flex items-center gap-2 pt-4 mt-4 border-t">
                <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1"
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                />
                <Button onClick={handleSend} disabled={sending || !newMessage.trim()} size="icon" className="shadow-lg shadow-primary/20">
                    {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
            </div>
        </div>
    );
}
