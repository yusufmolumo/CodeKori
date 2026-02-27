"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, MessageSquare, Plus, User as UserIcon, Trash2, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

export default function CommunityPage() {
    const router = useRouter();
    const [categories, setCategories] = useState<any[]>([]);
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showNewPost, setShowNewPost] = useState(false);
    const [userRole, setUserRole] = useState<string>("learner");
    const [deleting, setDeleting] = useState<string | null>(null);

    // New Post Form
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const role = localStorage.getItem("userRole");
        if (role) setUserRole(role);

        const fetchData = async () => {
            try {
                const [catRes, postRes] = await Promise.all([
                    api.get("/forum/categories"),
                    api.get("/forum/posts")
                ]);
                setCategories(catRes.data.data || catRes.data || []);
                setPosts(postRes.data.data || postRes.data || []);
            } catch (error) {
                console.error("Failed to fetch community data", error);
                setCategories([{ id: '1', name: 'General' }, { id: '2', name: 'Help' }]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleCreatePost = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await api.post("/forum/posts", {
                title,
                content,
                categoryId: selectedCategory || categories[0]?.id
            });
            setPosts([res.data.data, ...posts]);
            setShowNewPost(false);
            setTitle("");
            setContent("");
        } catch (error) {
            console.error("Failed to create post", error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeletePost = async (e: React.MouseEvent, postId: string) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to delete this post?")) return;
        setDeleting(postId);
        try {
            await api.delete(`/forum/posts/${postId}`);
            setPosts(prev => prev.filter(p => p.id !== postId));
        } catch (error) {
            console.error("Failed to delete post", error);
        } finally {
            setDeleting(null);
        }
    };

    const isMentor = userRole === "mentor" || userRole === "admin";

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Community Forum</h1>
                    <p className="text-muted-foreground">Discuss, ask questions, and share knowledge.</p>
                </div>
                <div className="flex items-center gap-2">
                    {isMentor && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-500 border border-amber-500/30">
                            <Shield className="h-3 w-3" /> Moderator
                        </span>
                    )}
                    <Button onClick={() => setShowNewPost(!showNewPost)}>
                        {showNewPost ? "Cancel" : <><Plus className="mr-2 h-4 w-4" /> New Post</>}
                    </Button>
                </div>
            </div>

            {showNewPost && (
                <Card className="border-primary/50">
                    <CardHeader>
                        <CardTitle>Create a Discussion</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreatePost} className="space-y-4">
                            <div className="space-y-2">
                                <Input
                                    placeholder="Title"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    required
                                />
                            </div>
                            <Textarea
                                placeholder="What's on your mind?"
                                value={content}
                                onChange={e => setContent(e.target.value)}
                                required
                                className="min-h-[100px]"
                            />
                            <div className="flex gap-2">
                                {categories.map(cat => (
                                    <Badge
                                        key={cat.id}
                                        variant={selectedCategory === cat.id ? "default" : "outline"}
                                        className="cursor-pointer"
                                        onClick={() => setSelectedCategory(cat.id)}
                                    >
                                        {cat.name}
                                    </Badge>
                                ))}
                            </div>
                            <Button type="submit" disabled={submitting}>
                                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Post Discussion"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            )}

            <div className="grid gap-4">
                {posts.map(post => {
                    const isAuthorMentor = post.author?.role === "mentor";
                    return (
                        <Card
                            key={post.id}
                            className="hover:bg-muted/50 transition-colors cursor-pointer"
                            onClick={() => router.push(`/dashboard/community/${post.id}`)}
                        >
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-lg">{post.title}</CardTitle>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="secondary">{post.category?.name || "General"}</Badge>
                                        {isMentor && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                                                onClick={(e) => handleDeletePost(e, post.id)}
                                                disabled={deleting === post.id}
                                            >
                                                {deleting === post.id ? (
                                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                ) : (
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                )}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                    <UserIcon className="h-3 w-3" />
                                    <span>{post.author?.profile?.fullName || post.author?.profile?.username || "Anonymous"}</span>
                                    {isAuthorMentor && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-500 border border-amber-500/30">
                                            <Shield className="h-2.5 w-2.5" /> MENTOR
                                        </span>
                                    )}
                                    <span>•</span>
                                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                                </div>
                            </CardHeader>
                            <CardContent className="pb-2">
                                <p className="text-sm text-foreground/80 line-clamp-2">{post.content}</p>
                            </CardContent>
                            <CardFooter className="pt-0 flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <MessageSquare className="h-3 w-3" />
                                        <span>{post._count?.comments || 0} comments</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <Plus className="h-3 w-3 text-green-500" />
                                        <span>{post.upvotes || 0}</span>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" className="text-xs h-7">Read More</Button>
                            </CardFooter>
                        </Card>
                    );
                })}

                {posts.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        No discussions yet. Start the conversation!
                    </div>
                )}
            </div>
        </div>
    );
}
