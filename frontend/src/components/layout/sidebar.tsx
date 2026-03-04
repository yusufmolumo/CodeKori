"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    BookOpen,
    Code2,
    Trophy,
    Users,
    User,
    Settings,
    LogOut,
    Menu,
    X,
    MessageSquare,
    Gamepad2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import api from "@/lib/api";

const learnerItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: BookOpen, label: "Courses", href: "/dashboard/courses" },
    { icon: Code2, label: "Challenges", href: "/dashboard/challenges" },
    { icon: Gamepad2, label: "Skill Lab", href: "/dashboard/skill-lab" },
    { icon: Trophy, label: "Leaderboard", href: "/dashboard/leaderboard" },
    { icon: Users, label: "Community", href: "/dashboard/community" },
    { icon: MessageSquare, label: "Mentorship", href: "/dashboard/mentorship" },
    { icon: User, label: "Profile", href: "/dashboard/profile" },
];

const mentorItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: BookOpen, label: "Courses", href: "/dashboard/mentor-courses" },
    { icon: Code2, label: "Challenges", href: "/dashboard/mentor-challenges" },
    { icon: Users, label: "Community", href: "/dashboard/community" },
    { icon: MessageSquare, label: "Mentorship", href: "/dashboard/mentorship" },
    { icon: User, label: "Profile", href: "/dashboard/profile" },
];

const adminItems = [
    { icon: LayoutDashboard, label: "Admin Panel", href: "/admin" },
    { icon: Users, label: "Manage Users", href: "/admin/users" },
    { icon: Gamepad2, label: "Toggle Skill Labs", href: "/admin/skill-lab" },
    { icon: BookOpen, label: "Create Courses", href: "/dashboard/mentor-courses" },
    { icon: Code2, label: "Create Challenges", href: "/dashboard/mentor-challenges" },
    { icon: Users, label: "Community Monitor", href: "/dashboard/community" },
    { icon: Trophy, label: "Leaderboard", href: "/dashboard/leaderboard" },
];

export function Sidebar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [role, setRole] = useState<string>("learner");
    const [unreadTotal, setUnreadTotal] = useState(0);

    useEffect(() => {
        const storedRole = localStorage.getItem("userRole");
        if (storedRole) setRole(storedRole);

        // Fetch unread chat counts
        const fetchUnread = async () => {
            try {
                const res = await api.get("/mentorship/chat/unread-counts");
                setUnreadTotal(res.data.data?.total || 0);
            } catch {
                // ignore
            }
        };

        // Send active session heartbeat
        const sendHeartbeat = async () => {
            try {
                await api.patch("/users/heartbeat");
            } catch {
                // ignore
            }
        };

        fetchUnread();
        sendHeartbeat();

        // Poll every 30 seconds for messages
        const unreadInterval = setInterval(fetchUnread, 30000);
        // Ping heartbeat every 1 minute
        const heartbeatInterval = setInterval(sendHeartbeat, 60000);

        return () => {
            clearInterval(unreadInterval);
            clearInterval(heartbeatInterval);
        };
    }, []);

    const sidebarItems = role === "admin" ? adminItems : role === "mentor" ? mentorItems : learnerItems;

    return (
        <>
            {/* Mobile Toggle */}
            <Button
                variant="ghost"
                size="icon"
                className="fixed top-4 left-4 z-50 md:hidden"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>

            {/* Sidebar Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar Container */}
            <aside
                className={cn(
                    "fixed top-0 left-0 z-40 h-screen w-64 transform bg-card border-r transition-transform duration-200 ease-in-out md:translate-x-0",
                    isOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="flex h-full flex-col">
                    {/* Logo */}
                    <div className="flex h-16 items-center border-b px-6">
                        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl text-primary">
                            <Code2 className="h-6 w-6" />
                            <span>CodeKori</span>
                        </Link>
                    </div>

                    {/* Role Badge */}
                    {role === "mentor" && (
                        <div className="px-6 py-2">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-500 border border-amber-500/30">
                                🧑‍🏫 Mentor Mode
                            </span>
                        </div>
                    )}

                    {/* Nav Items */}
                    <nav className="flex-1 space-y-1 p-4">
                        {sidebarItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;
                            const isMentorship = item.label === "Mentorship";

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsOpen(false)}
                                    className={cn(
                                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                                        isActive
                                            ? "bg-primary/10 text-primary"
                                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                    )}
                                >
                                    <Icon className="h-5 w-5" />
                                    {item.label}
                                    {isMentorship && unreadTotal > 0 && (
                                        <span className="ml-auto inline-flex items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white min-w-[18px]">
                                            {unreadTotal > 99 ? "99+" : unreadTotal}
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Bottom Actions */}
                    <div className="border-t p-4 space-y-1">
                        <Link
                            href="/dashboard/settings"
                            className={cn(
                                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                            )}
                        >
                            <Settings className="h-5 w-5" />
                            Settings
                        </Link>
                        <button
                            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
                            onClick={() => {
                                localStorage.removeItem('accessToken');
                                localStorage.removeItem('userRole');
                                window.location.href = '/login';
                            }}
                        >
                            <LogOut className="h-5 w-5" />
                            Logout
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}

