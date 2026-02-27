"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell, Shield, Palette, Eye, EyeOff, Loader2, Check, X } from "lucide-react";
import api from "@/lib/api";

export default function SettingsPage() {
    // ── Notification Preferences ──
    const [emailEnabled, setEmailEnabled] = useState(true);
    const [inAppEnabled, setInAppEnabled] = useState(true);
    const [prefsLoading, setPrefsLoading] = useState(true);
    const [prefsSaving, setPrefsSaving] = useState(false);

    // ── Password Change ──
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

    // ── Theme ──
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        fetchPreferences();
    }, []);

    const fetchPreferences = async () => {
        try {
            const res = await api.get("/notifications/preferences");
            const data = res.data.data;
            setEmailEnabled(data.emailEnabled);
            setInAppEnabled(data.inAppEnabled);
        } catch (error) {
            console.error("Failed to fetch preferences", error);
        } finally {
            setPrefsLoading(false);
        }
    };

    const togglePref = async (field: "emailEnabled" | "inAppEnabled", value: boolean) => {
        setPrefsSaving(true);
        try {
            if (field === "emailEnabled") setEmailEnabled(value);
            else setInAppEnabled(value);

            await api.put("/notifications/preferences", { [field]: value });
        } catch (error) {
            console.error("Failed to update preferences", error);
            // Revert
            if (field === "emailEnabled") setEmailEnabled(!value);
            else setInAppEnabled(!value);
        } finally {
            setPrefsSaving(false);
        }
    };

    const handleChangePassword = async () => {
        setPasswordMsg(null);

        if (!currentPassword || !newPassword || !confirmPassword) {
            setPasswordMsg({ type: "error", text: "All fields are required" });
            return;
        }
        if (newPassword.length < 8) {
            setPasswordMsg({ type: "error", text: "New password must be at least 8 characters" });
            return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordMsg({ type: "error", text: "New passwords do not match" });
            return;
        }

        setPasswordLoading(true);
        try {
            await api.put("/auth/change-password", { currentPassword, newPassword });
            setPasswordMsg({ type: "success", text: "Password changed successfully!" });
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setShowPasswordForm(false);
        } catch (error: any) {
            setPasswordMsg({
                type: "error",
                text: error.response?.data?.error?.message || "Failed to change password"
            });
        } finally {
            setPasswordLoading(false);
        }
    };

    return (
        <div className="space-y-8 max-w-4xl mx-auto pb-12">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">Manage your account preferences and system configuration.</p>
            </div>

            <div className="grid gap-6">
                {/* ─── Notifications ─── */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bell className="h-5 w-5" />
                            Notifications
                        </CardTitle>
                        <CardDescription>Configure how you receive updates and alerts.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-2 border-b">
                            <div>
                                <p className="font-medium">Email Notifications</p>
                                <p className="text-sm text-muted-foreground">
                                    Receive course updates, mentorship messages, and community post alerts via email.
                                </p>
                            </div>
                            {prefsLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Button
                                    variant={emailEnabled ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => togglePref("emailEnabled", !emailEnabled)}
                                    disabled={prefsSaving}
                                    className={emailEnabled ? "bg-green-600 hover:bg-green-700" : ""}
                                >
                                    {emailEnabled ? "Enabled" : "Disabled"}
                                </Button>
                            )}
                        </div>
                        <div className="flex items-center justify-between p-2">
                            <div>
                                <p className="font-medium">In-app Alerts</p>
                                <p className="text-sm text-muted-foreground">
                                    Show popup notifications for events, course updates, mentorship messages, and community posts.
                                </p>
                            </div>
                            {prefsLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Button
                                    variant={inAppEnabled ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => togglePref("inAppEnabled", !inAppEnabled)}
                                    disabled={prefsSaving}
                                    className={inAppEnabled ? "bg-green-600 hover:bg-green-700" : ""}
                                >
                                    {inAppEnabled ? "Enabled" : "Disabled"}
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* ─── Security ─── */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Security
                        </CardTitle>
                        <CardDescription>Update your password and manage security sessions.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {passwordMsg && (
                            <div className={`flex items-center gap-2 text-sm p-3 rounded-md ${passwordMsg.type === "success"
                                    ? "bg-green-500/10 text-green-400 border border-green-500/30"
                                    : "bg-red-500/10 text-red-400 border border-red-500/30"
                                }`}>
                                {passwordMsg.type === "success" ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                                {passwordMsg.text}
                            </div>
                        )}

                        {!showPasswordForm ? (
                            <Button variant="secondary" onClick={() => setShowPasswordForm(true)}>
                                Change Password
                            </Button>
                        ) : (
                            <div className="space-y-3 max-w-sm">
                                <div className="relative">
                                    <Input
                                        type={showCurrent ? "text" : "password"}
                                        placeholder="Current password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        onClick={() => setShowCurrent(!showCurrent)}
                                    >
                                        {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                <div className="relative">
                                    <Input
                                        type={showNew ? "text" : "password"}
                                        placeholder="New password (min 8 characters)"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        onClick={() => setShowNew(!showNew)}
                                    >
                                        {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                <Input
                                    type="password"
                                    placeholder="Confirm new password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                                <div className="flex gap-2">
                                    <Button onClick={handleChangePassword} disabled={passwordLoading}>
                                        {passwordLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                        Save Password
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        onClick={() => {
                                            setShowPasswordForm(false);
                                            setCurrentPassword("");
                                            setNewPassword("");
                                            setConfirmPassword("");
                                            setPasswordMsg(null);
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* ─── Appearance ─── */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Palette className="h-5 w-5" />
                            Appearance
                        </CardTitle>
                        <CardDescription>Customize the look and feel of your dashboard.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {mounted ? (
                            <div className="flex gap-4">
                                <Button
                                    variant="outline"
                                    className={theme === "light" ? "border-primary bg-primary/10 text-primary" : ""}
                                    onClick={() => setTheme("light")}
                                >
                                    ☀️ Light
                                </Button>
                                <Button
                                    variant="outline"
                                    className={theme === "dark" ? "border-primary bg-primary/10 text-primary" : ""}
                                    onClick={() => setTheme("dark")}
                                >
                                    🌙 Dark
                                </Button>
                                <Button
                                    variant="outline"
                                    className={theme === "system" ? "border-primary bg-primary/10 text-primary" : ""}
                                    onClick={() => setTheme("system")}
                                >
                                    💻 System
                                </Button>
                            </div>
                        ) : (
                            <div className="flex gap-4">
                                <Button variant="outline" disabled>Loading...</Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
