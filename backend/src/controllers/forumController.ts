import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../config/prisma';

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
                author: { select: { profile: { select: { username: true, avatarUrl: true } } } },
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

        const post = await prisma.forumPost.create({
            data: {
                title,
                content,
                categoryId,
                authorId: userId,
                tags: tags || []
            }
        });

        // Create notifications for other users (notify up to 20 recent users for performance in MVP)
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
        } catch (nError) {
            console.error("Failed to create post notifications", nError);
        }

        // Award XP (5 XP for posting)
        await prisma.userGamification.update({
            where: { userId },
            data: { totalXp: { increment: 5 } }
        });

        res.status(201).json({ data: post });
    } catch (error) {
        next(error);
    }
};

export const getPost = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id as string;
        const post = await prisma.forumPost.findUnique({
            where: { id },
            include: {
                author: { select: { profile: { select: { username: true, avatarUrl: true } } } },
                comments: {
                    include: {
                        author: { select: { profile: { select: { username: true } } } }
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
        await prisma.userGamification.update({
            where: { userId },
            data: { totalXp: { increment: 2 } }
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
