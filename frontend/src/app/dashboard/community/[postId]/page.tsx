"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, ArrowLeft, Send, MessageSquare, User as UserIcon, Calendar, ThumbsUp, ThumbsDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Comment {
    id: string;
    content: string;
    createdAt: string;
    author: {
        profile: {
            username: string;
            avatarUrl: string;
        };
    };
}

interface Post {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    upvotes: number;
    downvotes: number;
    author: {
        profile: {
            username: string;
            avatarUrl: string;
        };
    };
    category: {
        name: string;
    };
    comments: Comment[];
}

export default function PostDetailPage() {
    const { postId } = useParams();
    const router = useRouter();
    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true);
    const [commentContent, setCommentContent] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [voting, setVoting] = useState(false);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const res = await api.get(`/forum/posts/${postId}`);
                setPost(res.data.data || res.data);
            } catch (error) {
                console.error("Failed to fetch post", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPost();
    }, [postId]);

    const handleVote = async (type: 'upvote' | 'downvote') => {
        if (!post || voting) return;
        setVoting(true);
        try {
            await api.post('/forum/vote', { postId: post.id, type });
            // Refresh post data to get new counts
            const res = await api.get(`/forum/posts/${postId}`);
            setPost(res.data.data || res.data);
        } catch (error) {
            console.error("Failed to vote", error);
        } finally {
            setVoting(false);
        }
    };

    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentContent.trim()) return;

        setSubmitting(true);
        try {
            const res = await api.post(`/forum/posts/${postId}/comments`, {
                content: commentContent
            });
            const newComment = res.data.data || res.data;
            setPost(prev => prev ? {
                ...prev,
                comments: [newComment, ...prev.comments]
            } : null);
            setCommentContent("");
        } catch (error) {
            console.error("Failed to add comment", error);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!post) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">Post not found</p>
                <Button variant="outline" className="mt-4" onClick={() => router.back()}>
                    Go Back
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <Button variant="ghost" onClick={() => router.back()} className="gap-2">
                <ArrowLeft className="h-4 w-4" /> Back to Forums
            </Button>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-start gap-4">
                        <div className="space-y-1">
                            <CardTitle className="text-2xl">{post.title}</CardTitle>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <UserIcon className="h-3 w-3" />
                                    {post.author?.profile?.username || "Anonymous"}
                                </div>
                                <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(post.createdAt).toLocaleDateString()}
                                </div>
                                <Badge variant="secondary">{post.category?.name || "General"}</Badge>
                            </div>
                        </div>
                        <div className="h-12 w-12 rounded-full overflow-hidden bg-primary/10">
                            {post.author?.profile?.avatarUrl ? (
                                <img src={post.author.profile.avatarUrl} alt="avatar" className="h-full w-full object-cover" />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center text-primary font-bold">
                                    {post.author?.profile?.username?.[0]?.toUpperCase() || "U"}
                                </div>
                            )}
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="whitespace-pre-wrap leading-relaxed mb-6">{post.content}</p>

                    <div className="flex items-center gap-2 border-t pt-4">
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-1 h-8"
                            onClick={() => handleVote('upvote')}
                            disabled={voting}
                        >
                            <ThumbsUp className="h-4 w-4" />
                            <span>{post.upvotes || 0}</span>
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-1 h-8"
                            onClick={() => handleVote('downvote')}
                            disabled={voting}
                        >
                            <ThumbsDown className="h-4 w-4" />
                            <span>{post.downvotes || 0}</span>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Comments ({post.comments?.length || 0})
                </h3>

                {/* Add Comment */}
                <Card>
                    <CardContent className="pt-6">
                        <form onSubmit={handleAddComment} className="space-y-4">
                            <textarea
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="Add a helpful comment..."
                                value={commentContent}
                                onChange={e => setCommentContent(e.target.value)}
                                required
                            />
                            <div className="flex justify-end">
                                <Button type="submit" disabled={submitting} className="gap-2">
                                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Send className="h-4 w-4" /> Post Comment</>}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Comment List */}
                <div className="space-y-4">
                    {post.comments?.map(comment => (
                        <Card key={comment.id}>
                            <CardContent className="pt-6">
                                <div className="flex items-start gap-3">
                                    <div className="h-8 w-8 rounded-full overflow-hidden bg-primary/10 shrink-0">
                                        {comment.author?.profile?.avatarUrl ? (
                                            <img src={comment.author.profile.avatarUrl} alt="avatar" className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center text-xs text-primary font-bold">
                                                {comment.author?.profile?.username?.[0]?.toUpperCase() || "U"}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-semibold">{comment.author?.profile?.username || "Anonymous"}</span>
                                            <span className="text-[10px] text-muted-foreground">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-sm">{comment.content}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {post.comments?.length === 0 && (
                        <p className="text-center text-muted-foreground py-4">No comments yet. Be the first to reply!</p>
                    )}
                </div>
            </div>
        </div>
    );
}
