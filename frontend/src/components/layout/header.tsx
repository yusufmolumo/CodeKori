"use client";

import { Button } from "@/components/ui/button";
import { UserCircle, Bell, MessageSquare, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import Link from "next/link";

export function Header() {
    const [user, setUser] = useState<{ profile?: { fullName: string; avatarUrl: string | null } } | null>(null);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any>(null);
    const [showSearch, setShowSearch] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await api.get('/users/profile');
                setUser(res.data.data || res.data);
            } catch (error) {
                console.error("Failed to fetch user for header", error);
            }
        };
        const fetchNotifications = async () => {
            try {
                const res = await api.get('/notifications');
                setNotifications(res.data.data || []);
            } catch (error) {
                console.error("Failed to fetch notifications", error);
            }
        };
        fetchUser();
        fetchNotifications();
    }, []);

    const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const q = e.target.value;
        setSearchQuery(q);
        if (q.length > 2) {
            try {
                const res = await api.get(`/search?q=${q}`);
                setSearchResults(res.data.data);
                setShowSearch(true);
            } catch (error) {
                console.error("Search failed", error);
            }
        } else {
            setShowSearch(false);
        }
    };

    const markAsRead = async (id: string) => {
        try {
            await api.post(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        } catch (error) {
            console.error("Failed to mark as read", error);
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center gap-4 flex-1 relative">
                <div className="relative w-full max-w-md hidden md:block">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                        type="search"
                        placeholder="Search courses, challenges..."
                        value={searchQuery}
                        onChange={handleSearch}
                        className="w-full rounded-full border bg-muted/50 py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />

                    {showSearch && searchResults && (
                        <div className="absolute top-full left-0 mt-2 w-full bg-background border rounded-lg shadow-xl p-2 z-50">
                            {searchResults.courses?.length > 0 && (
                                <div className="mb-2">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase px-2 mb-1">Courses</p>
                                    {searchResults.courses.map((c: any) => (
                                        <button
                                            key={c.id}
                                            onClick={() => { router.push(`/dashboard/courses/${c.id}`); setShowSearch(false); }}
                                            className="w-full text-left px-2 py-1.5 text-sm hover:bg-muted rounded"
                                        >
                                            {c.title}
                                        </button>
                                    ))}
                                </div>
                            )}
                            {searchResults.challenges?.length > 0 && (
                                <div>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase px-2 mb-1">Challenges</p>
                                    {searchResults.challenges.map((c: any) => (
                                        <button
                                            key={c.id}
                                            onClick={() => { router.push(`/dashboard/challenges/${c.id}`); setShowSearch(false); }}
                                            className="w-full text-left px-2 py-1.5 text-sm hover:bg-muted rounded"
                                        >
                                            {c.title}
                                        </button>
                                    ))}
                                </div>
                            )}
                            {searchResults.courses?.length === 0 && searchResults.challenges?.length === 0 && (
                                <p className="text-center py-2 text-sm text-muted-foreground">No matches found</p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="relative text-muted-foreground hover:text-primary"
                        onClick={() => setShowNotifications(!showNotifications)}
                    >
                        <Bell className="h-5 w-5" />
                        {unreadCount > 0 && (
                            <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-background animate-pulse" />
                        )}
                    </Button>

                    {showNotifications && (
                        <div className="absolute right-0 mt-2 w-80 bg-background border rounded-lg shadow-xl z-50 overflow-hidden">
                            <div className="p-3 border-b flex justify-between items-center">
                                <h4 className="font-bold text-sm">Notifications</h4>
                                <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">{unreadCount} New</span>
                            </div>
                            <div className="max-h-64 overflow-y-auto">
                                {notifications.length > 0 ? (
                                    notifications.map((n) => (
                                        <div
                                            key={n.id}
                                            className={`p-3 border-b last:border-0 hover:bg-muted/50 cursor-pointer transition-colors ${!n.read ? 'bg-primary/5' : ''}`}
                                            onClick={() => {
                                                if (!n.read) markAsRead(n.id);
                                                if (n.link) router.push(n.link);
                                                setShowNotifications(false);
                                            }}
                                        >
                                            <p className="text-xs font-bold">{n.title}</p>
                                            <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">{n.content}</p>
                                            <p className="text-[9px] text-muted-foreground mt-1">{new Date(n.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-8 text-center text-sm text-muted-foreground">All caught up!</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="h-6 w-px bg-border mx-2" />

                {user ? (
                    <Link href="/dashboard/profile" className="flex items-center gap-3 group">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold leading-none group-hover:text-primary transition-colors">
                                {user.profile?.fullName || "Student"}
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-1">View Profile</p>
                        </div>
                        <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden border-2 border-transparent group-hover:border-primary/20 transition-all">
                            {user.profile?.avatarUrl ? (
                                <img src={user.profile.avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                            ) : (
                                <UserCircle className="h-7 w-7 text-primary" />
                            )}
                        </div>
                    </Link>
                ) : (
                    <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center">
                        <UserCircle className="h-7 w-7 text-primary" />
                    </div>
                )}
            </div>
        </header>
    );
}


