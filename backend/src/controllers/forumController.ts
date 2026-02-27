import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../config/prisma';
import { sendBulkNotificationEmail } from '../services/emailService';

export const getForumCategories = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const categories = await prisma.forumCategory.findMany({
            include: {
                _count: { select: { posts: true } }
            }
        });
        res.json({ data: categories });
    } catch (error) {
        next(error);
    }
};

export const getPosts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const posts = await prisma.forumPost.findMany({
            include: {
                author: { select: { role: true, profile: { select: { username: true, fullName: true, avatarUrl: true } } } },
                category: { select: { name: true } },
                _count: { select: { comments: true } }
            },
            orderBy: { createdAt: 'desc' },
            take: 20
        });
        res.json({ data: posts });
    } catch (error) {
        next(error);
    }
};

export const createPost = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { title, content, categoryId, tags } = req.body;
        const userId = (req as AuthRequest).user?.userId;

        if (!userId) return res.status(401).json({ error: { message: 'Unauthorized' } });

        if (!title || !content) {
            return res.status(400).json({ error: { message: 'Title and content are required' } });
        }

        // Build create data - categoryId is optional in the request
        const createData: any = {
            title,
            content,
            authorId: userId,
            tags: tags || []
        };

        // Only add categoryId if it's a valid non-empty string
        if (categoryId && categoryId.trim() !== '') {
            createData.categoryId = categoryId;
        } else {
            // Find or use the first available category
            const defaultCategory = await prisma.forumCategory.findFirst();
            if (defaultCategory) {
                createData.categoryId = defaultCategory.id;
            } else {
                // Create a default category if none exists
                const newCategory = await prisma.forumCategory.create({
                    data: { name: 'General', description: 'General discussion' }
                });
                createData.categoryId = newCategory.id;
            }
        }

        const post = await prisma.forumPost.create({ data: createData });

        // Create notifications for other users (non-blocking)
        try {
            const recentUsers = await prisma.user.findMany({
                where: { id: { not: userId } },
                take: 20,
                orderBy: { createdAt: 'desc' }
            });

            if (recentUsers.length > 0) {
                await prisma.notification.createMany({
                    data: recentUsers.map(u => ({
                        userId: u.id,
                        type: 'FORUM_POST',
                        title: 'New Community Post',
                        content: `${title.substring(0, 30)}...`,
                        link: `/dashboard/community/${post.id}`
                    }))
                });
            }

            // Send emails
            if (recentUsers.length > 0) {
                const userIds = recentUsers.map(u => u.id);
                sendBulkNotificationEmail(userIds, 'New Community Post', `<p>A new post was shared in the CodeKori community: <strong>${title.substring(0, 50)}</strong></p><p><a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/community/${post.id}" style="color:#8b5cf6;">View Post →</a></p>`);
            }
        } catch (nError) {
            console.error("Failed to create post notifications", nError);
        }

        // Award XP (non-blocking)
        try {
            await prisma.userGamification.upsert({
                where: { userId },
                update: { totalXp: { increment: 5 } },
                create: { userId, totalXp: 5 }
            });
        } catch (xpError) {
            console.error("Failed to award XP for post", xpError);
        }

        res.status(201).json({ data: post });
    } catch (error) {
        console.error("createPost error:", error);
        next(error);
    }
};

export const getPost = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id as string;
        const post = await prisma.forumPost.findUnique({
            where: { id },
            include: {
                author: { select: { role: true, profile: { select: { username: true, fullName: true, avatarUrl: true } } } },
                comments: {
                    include: {
                        author: { select: { role: true, profile: { select: { username: true, fullName: true } } } }
                    },
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!post) return res.status(404).json({ error: { message: 'Post not found' } });

        res.json({ data: post });
    } catch (error) {
        next(error);
    }
}

export const addComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const postId = req.params.postId as string;
        const { content } = req.body;
        const userId = (req as AuthRequest).user?.userId;

        if (!userId) return res.status(401).json({ error: { message: 'Unauthorized' } });

        const post = await prisma.forumPost.findUnique({ where: { id: postId } });
        if (!post) return res.status(404).json({ error: { message: 'Post not found' } });

        const comment = await prisma.forumComment.create({
            data: {
                content,
                postId,
                authorId: userId
            },
            include: {
                author: { select: { profile: { select: { username: true, avatarUrl: true } } } }
            }
        });

        // Award XP (2 XP for commenting)
        await prisma.userGamification.upsert({
            where: { userId },
            update: { totalXp: { increment: 2 } },
            create: { userId, totalXp: 2 }
        });

        res.status(201).json({ data: comment });
    } catch (error) {
        next(error);
    }
};

export const toggleVote = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const postId = req.body.postId as string | undefined;
        const commentId = req.body.commentId as string | undefined;
        const { type } = req.body; // 'upvote' or 'downvote'
        const userId = (req as AuthRequest).user?.userId;

        if (!userId) return res.status(401).json({ error: { message: 'Unauthorized' } });

        const voteType = type === 'upvote' ? 'upvote' : 'downvote';

        // Find existing vote
        const existingVote = await prisma.forumVote.findFirst({
            where: {
                userId,
                postId: postId || null,
                commentId: commentId || null
            }
        });

        if (existingVote) {
            if (existingVote.voteType === voteType) {
                // Remove vote if same type (toggle off)
                await prisma.forumVote.delete({ where: { id: existingVote.id } });

                // Update counts
                if (postId) {
                    await prisma.forumPost.update({
                        where: { id: postId },
                        data: voteType === 'upvote' ? { upvotes: { decrement: 1 } } : { downvotes: { decrement: 1 } }
                    });
                }
            } else {
                // Change vote type
                await prisma.forumVote.update({
                    where: { id: existingVote.id },
                    data: { voteType }
                });

                if (postId) {
                    await prisma.forumPost.update({
                        where: { id: postId },
                        data: voteType === 'upvote'
                            ? { upvotes: { increment: 1 }, downvotes: { decrement: 1 } }
                            : { upvotes: { decrement: 1 }, downvotes: { increment: 1 } }
                    });
                }
            }
        } else {
            // New vote
            await prisma.forumVote.create({
                data: {
                    userId,
                    postId: postId || undefined,
                    commentId: commentId || undefined,
                    voteType
                }
            });

            if (postId) {
                await prisma.forumPost.update({
                    where: { id: postId },
                    data: voteType === 'upvote' ? { upvotes: { increment: 1 } } : { downvotes: { increment: 1 } }
                });
            }
        }

        res.json({ message: 'Vote updated' });
    } catch (error) {
        next(error);
    }
};

export const deletePost = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as AuthRequest).user?.userId;
        const userRole = (req as AuthRequest).user?.role;
        const { id } = req.params;

        if (!userId) return res.status(401).json({ error: { message: 'Unauthorized' } });

        const post = await prisma.forumPost.findUnique({ where: { id } });
        if (!post) return res.status(404).json({ error: { message: 'Post not found' } });

        // Only allow deletion by post author, mentors, or admins
        if (post.authorId !== userId && userRole !== 'mentor' && userRole !== 'admin') {
            return res.status(403).json({ error: { message: 'You can only delete your own posts' } });
        }

        await prisma.forumPost.delete({ where: { id } });
        res.json({ message: 'Post deleted' });
    } catch (error) {
        next(error);
    }
};
