import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../config/prisma';

export const getGamificationStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as AuthRequest).user?.userId;
        if (!userId) {
            return res.status(401).json({ error: { message: 'Unauthorized' } });
        }

        const stats = await prisma.userGamification.findUnique({
            where: { userId },
            include: {
                user: {
                    select: {
                        badges: { include: { badge: true } }
                    }
                }
            }
        });

        res.json({ data: stats });
    } catch (error) {
        next(error);
    }
};

export const getLeaderboard = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Basic weekly leaderboard logic
        // For now, let's just return top users by totalXP as MVP approximation if weekly data isn't fully set
        const leaderboard = await prisma.userGamification.findMany({
            orderBy: { totalXp: 'desc' },
            take: 10,
            include: {
                user: {
                    select: {
                        profile: {
                            select: { username: true, avatarUrl: true }
                        }
                    }
                }
            }
        });

        res.json({ data: leaderboard });
    } catch (error) {
        next(error);
    }
};
