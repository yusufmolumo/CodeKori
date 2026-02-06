"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Loader2 } from "lucide-react";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [authorized, setAuthorized] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAdmin = async () => {
            try {
                const res = await api.get("/users/profile");
                // Check if user has ADMIN role
                // Note: The backend needs to return the 'role' field in getProfile for this to work.
                // I previously saw getProfile excludes sensitive data but role is safe-ish.
                // Wait, looking at the userController.ts I viewed earlier:
                // const { passwordHash, verificationToken, passwordResetToken, ...safeUser } = user;
                // safeUser likely includes 'role'.

                if (res.data?.role === 'ADMIN') {
                    setAuthorized(true);
                } else {
                    // Redirect non-admins
                    router.push("/dashboard");
                }
            } catch (error) {
                // Not logged in or error
                router.push("/login");
            } finally {
                setLoading(false);
            }
        };
        checkAdmin();
    }, [router]);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
                <Loader2 className="h-8 w-8 animate-spin text-red-500" />
            </div>
        );
    }

    if (!authorized) {
        return null; // Will redirect
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <AdminSidebar />
            <div className="flex flex-col md:pl-64 transition-all duration-200 ease-in-out">
                <main className="flex-1 p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
