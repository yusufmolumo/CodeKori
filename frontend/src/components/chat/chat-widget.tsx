"use client";

import { useEffect, useState, useRef } from "react";
import { useSocket } from "@/context/socket-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, X, MessageCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area"; // Assume missing but simple enough to skip or mock
// I'll use a simple div with overflow-auto for now to avoid dependency issues if ScrollArea isn't setup.

interface Message {
    senderId: string;
    content: string;
    timestamp: Date;
}

export function ChatWidget() {
    const { socket, isConnected } = useSocket();
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!socket) return;

        socket.on('receive_message', (data: Message) => {
            setMessages((prev) => [...prev, data]);
        });

        return () => {
            socket.off('receive_message');
        };
    }, [socket]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const sendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (message.trim() && socket) {
            const payload = {
                roomId: "global", // For MVP, everyone is in global
                content: message
            };
            socket.emit('send_message', payload);
            setMessage("");
        }
    };

    if (!socket) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50">
            {isOpen ? (
                <Card className="w-80 h-96 shadow-xl flex flex-col">
                    <CardHeader className="p-3 border-b flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                            Community Chat
                        </CardTitle>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsOpen(false)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </CardHeader>
                    <CardContent className="flex-1 p-0 flex flex-col h-full overflow-hidden">
                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">
                            {messages.length === 0 && (
                                <p className="text-xs text-muted-foreground text-center mt-4">No messages yet.</p>
                            )}
                            {messages.map((msg, i) => (
                                <div key={i} className={`flex flex-col ${msg.senderId === 'me' ? 'items-end' : 'items-start'}`}>
                                    <div className="bg-muted px-3 py-2 rounded-lg text-sm max-w-[80%] break-words">
                                        {msg.content}
                                    </div>
                                    <span className="text-[10px] text-muted-foreground px-1">
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <form onSubmit={sendMessage} className="p-3 border-t flex gap-2">
                            <Input
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Type a message..."
                                className="h-8 text-sm"
                            />
                            <Button type="submit" size="icon" className="h-8 w-8" disabled={!isConnected}>
                                <Send className="h-4 w-4" />
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            ) : (
                <Button size="icon" className="h-12 w-12 rounded-full shadow-lg" onClick={() => {
                    setIsOpen(true);
                    socket.emit('join_room', 'global');
                }}>
                    <MessageCircle className="h-6 w-6" />
                </Button>
            )}
        </div>
    );
}
