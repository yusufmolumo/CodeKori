"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, User, Mail, MapPin, Github, Linkedin, Twitter, Save, Camera, ShieldCheck } from "lucide-react";

interface UserProfile {
    id: string;
    email: string;
    profile: {
        fullName: string | null;
        username: string;
        bio: string | null;
        location: string | null;
        avatarUrl: string | null;
        githubUrl: string | null;
        linkedinUrl: string | null;
        twitterUrl: string | null;
    };
    gamification: {
        totalXp: number;
        level: number;
    } | null;
}

export default function ProfilePage() {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const [formData, setFormData] = useState({
        fullName: "",
        bio: "",
        location: "Kigali, Rwanda",
        githubUrl: "",
        linkedinUrl: "",
        twitterUrl: "",
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get("/users/profile");
                const userData = res.data.data || res.data;
                setUser(userData);
                setFormData({
                    fullName: userData.profile?.fullName || "",
                    bio: userData.profile?.bio || "",
                    location: userData.profile?.location || "Kigali, Rwanda",
                    githubUrl: userData.profile?.githubUrl || "",
                    linkedinUrl: userData.profile?.linkedinUrl || "",
                    twitterUrl: userData.profile?.twitterUrl || "",
                });
            } catch (error) {
                console.error("Failed to fetch profile", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);
        try {
            await api.put("/users/profile", formData);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            // Reflect in local state
            if (user) {
                setUser({
                    ...user,
                    profile: {
                        ...user.profile,
                        ...formData
                    }
                });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-4xl mx-auto pb-12">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Your Profile</h1>
                <p className="text-muted-foreground">Personalize your learning experience and showcase your achievements.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Overview Card */}
                <Card className="lg:col-span-1 h-fit overflow-hidden border-primary/20 bg-primary/5">
                    <div className="h-24 bg-gradient-to-r from-primary/20 to-primary/10" />
                    <CardContent className="pt-0 relative -mt-12 flex flex-col items-center text-center">
                        <div className="relative group">
                            <div className="h-24 w-24 rounded-full border-4 border-background bg-background shadow-xl overflow-hidden group-hover:opacity-80 transition-opacity">
                                {user?.profile?.avatarUrl ? (
                                    <img src={user.profile.avatarUrl} alt="avatar" className="h-full w-full object-cover" />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center text-3xl font-bold text-primary/40 bg-muted">
                                        {user?.profile?.username?.[0]?.toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <button className="absolute bottom-0 right-0 p-1.5 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90">
                                <Camera className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="mt-4 space-y-1 px-4">
                            <h3 className="text-xl font-bold truncate">{user?.profile?.fullName || user?.profile?.username}</h3>
                            <p className="text-sm text-muted-foreground font-mono">@{user?.profile?.username}</p>
                            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-1">
                                <Mail className="h-3 w-3" /> {user?.email}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 w-full mt-6 pt-6 border-t border-primary/10">
                            <div className="text-center p-3 rounded-xl bg-background/50 backdrop-blur-sm border border-primary/5">
                                <p className="text-2xl font-black text-primary">{user?.gamification?.totalXp || 0}</p>
                                <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Total XP</p>
                            </div>
                            <div className="text-center p-3 rounded-xl bg-background/50 backdrop-blur-sm border border-primary/5">
                                <p className="text-2xl font-black text-primary">{user?.gamification?.level || 1}</p>
                                <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Level</p>
                            </div>
                        </div>

                        <div className="mt-4 w-full flex items-center justify-center gap-2 text-xs font-semibold py-2 rounded-full bg-green-500/10 text-green-600 border border-green-500/20">
                            <ShieldCheck className="h-3 w-3" /> Active Learner
                        </div>
                    </CardContent>
                </Card>

                {/* Edit Profile Form */}
                <Card className="lg:col-span-2 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Personal Information</CardTitle>
                        <CardDescription>Update your personal details and social links.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {message && (
                                <div className={`p-4 rounded-lg flex items-center gap-3 text-sm ${message.type === 'success' ? 'bg-green-500/10 text-green-600 border border-green-500/20' : 'bg-destructive/10 text-destructive border border-destructive/20'}`}>
                                    {message.text}
                                </div>
                            )}

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold flex items-center gap-2">
                                        Full Name
                                    </label>
                                    <Input
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        placeholder="Enter your full name"
                                        className="bg-muted/30 focus-visible:ring-primary/30"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-primary" /> Location
                                    </label>
                                    <Input
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        placeholder="e.g. Kigali, Rwanda"
                                        className="bg-muted/30 focus-visible:ring-primary/30"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold">Bio</label>
                                <textarea
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleChange}
                                    placeholder="Tell the community about your journey..."
                                    className="w-full min-h-[120px] px-3 py-2 border rounded-md bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 transition-all resize-none"
                                />
                            </div>

                            <div className="space-y-4 pt-4 border-t border-muted/50">
                                <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                    Social Profiles
                                </h4>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold flex items-center gap-2 text-muted-foreground">
                                            <Github className="h-3 w-3" /> GitHub
                                        </label>
                                        <Input
                                            name="githubUrl"
                                            value={formData.githubUrl}
                                            onChange={handleChange}
                                            placeholder="https://github.com/..."
                                            className="bg-muted/30 h-9"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold flex items-center gap-2 text-muted-foreground">
                                            <Linkedin className="h-3 w-3" /> LinkedIn
                                        </label>
                                        <Input
                                            name="linkedinUrl"
                                            value={formData.linkedinUrl}
                                            onChange={handleChange}
                                            placeholder="https://linkedin.com/in/..."
                                            className="bg-muted/30 h-9"
                                        />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-xs font-semibold flex items-center gap-2 text-muted-foreground">
                                            <Twitter className="h-3 w-3" /> Twitter
                                        </label>
                                        <Input
                                            name="twitterUrl"
                                            value={formData.twitterUrl}
                                            onChange={handleChange}
                                            placeholder="https://twitter.com/..."
                                            className="bg-muted/30 h-9"
                                        />
                                    </div>
                                </div>
                            </div>

                            <Button type="submit" className="w-full h-11 text-base font-bold shadow-lg shadow-primary/20" disabled={saving}>
                                {saving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                                Save Profile Changes
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
