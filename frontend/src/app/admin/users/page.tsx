"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Shield, UserCog, Trash2 } from "lucide-react";

export default function AdminUsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        try {
            const res = await api.get("/admin/users");
            setUsers(res.data.data || []);
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleRoleUpdate = async (userId: string, newRole: string) => {
        try {
            await api.patch(`/admin/users/${userId}/role`, { role: newRole });
            // Optimistic update or refetch
            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
        } catch (error) {
            console.error("Failed to update role", error);
            alert("Failed to update role");
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm("Are you sure you want to permanently delete this user? This action cannot be undone.")) return;
        try {
            await api.delete(`/admin/users/${userId}`);
            setUsers(users.filter(u => u.id !== userId));
        } catch (error) {
            console.error("Failed to delete user", error);
            alert("Failed to delete user.");
        }
    };

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-red-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100">User Management</h1>
                <p className="text-muted-foreground">Manage user roles and permissions.</p>
            </div>

            <div className="rounded-md border bg-card">
                <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm text-left">
                        <thead className="[&_tr]:border-b">
                            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">User</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Role</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Status</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Activity</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {users.map((user) => (
                                <tr key={user.id} className="border-b transition-colors hover:bg-muted/50">
                                    <td className="p-4 align-middle">
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">
                                                {user.profile?.username?.[0]?.toUpperCase() || "U"}
                                            </div>
                                            <div>
                                                <div className="font-medium">{user.profile?.fullName || "No Name"}</div>
                                                <div className="text-xs text-muted-foreground">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 align-middle">
                                        <Badge variant={user.role === 'ADMIN' ? 'destructive' : user.role === 'MENTOR' ? 'default' : 'secondary'}>
                                            {user.role}
                                        </Badge>
                                    </td>
                                    <td className="p-4 align-middle">
                                        {user.isVerified ? (
                                            <span className="text-green-600 text-xs font-semibold">Verified</span>
                                        ) : (
                                            <span className="text-yellow-600 text-xs font-semibold">Pending</span>
                                        )}
                                    </td>
                                    <td className="p-4 align-middle">
                                        <div className="space-y-1 text-xs">
                                            {user.isOnline ? (
                                                <div className="flex items-center gap-1.5 text-green-600 font-medium">
                                                    <span className="relative flex h-2 w-2">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                                    </span>
                                                    Online
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                                                    <span className="relative flex h-2 w-2">
                                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-300"></span>
                                                    </span>
                                                    Offline
                                                </div>
                                            )}
                                            <div className="text-muted-foreground">
                                                Session: {user.sessionTimeSpent} {user.sessionTimeSpent === 1 ? 'min' : 'mins'}
                                            </div>
                                            <div className="text-muted-foreground opacity-80">
                                                Total: {user.totalTimeSpent} {user.totalTimeSpent === 1 ? 'min' : 'mins'}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 align-middle text-right">
                                        <div className="flex justify-end gap-2">
                                            {user.role !== 'ADMIN' && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-8 text-xs border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                                    onClick={() => {
                                                        if (confirm('Promote to Admin?')) handleRoleUpdate(user.id, 'ADMIN');
                                                    }}
                                                >
                                                    <Shield className="mr-1 h-3 w-3" />
                                                    Admin
                                                </Button>
                                            )}
                                            {user.role === 'LEARNER' && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-8 text-xs"
                                                    onClick={() => handleRoleUpdate(user.id, 'MENTOR')}
                                                >
                                                    <UserCog className="mr-1 h-3 w-3" />
                                                    Mentor
                                                </Button>
                                            )}
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 border-red-100"
                                                onClick={() => handleDeleteUser(user.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
