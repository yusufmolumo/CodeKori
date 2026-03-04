import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';

export const getAdminStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const [userCount, courseCount, challengeCount, recentUsers] = await Promise.all([
            prisma.user.count(),
            prisma.course.count(),
            prisma.codingChallenge.count(),
            prisma.user.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: { profile: true }
            })
        ]);

        res.json({
            data: {
                totalUsers: userCount,
                totalCourses: courseCount,
                totalChallenges: challengeCount,
                recentUsers
            }
        });
    } catch (error) {
        next(error);
    }
};

export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const users = await prisma.user.findMany({
            include: { profile: true, gamification: true },
            orderBy: { createdAt: 'desc' },
            take: 100 // Limit for now
        });

        // Sanitize
        const safeUsers = users.map(user => {
            const { passwordHash, verificationToken, passwordResetToken, ...rest } = user;

            // Calculate session / online metrics
            const now = new Date();
            const lastActive = rest.gamification?.lastActiveAt;
            const lastLogin = rest.gamification?.lastLoginDate;

            // Online if active within last 5 minutes
            const isOnline = lastActive ? (now.getTime() - lastActive.getTime() < 5 * 60 * 1000) : false;

            let sessionTimeMins = 0;
            if (lastLogin && lastActive && lastActive > lastLogin) {
                // Approximate session time
                sessionTimeMins = Math.round((lastActive.getTime() - lastLogin.getTime()) / 60000);
            }

            return {
                ...rest,
                isOnline,
                sessionTimeSpent: sessionTimeMins,
                totalTimeSpent: rest.gamification?.totalTimeSpent || 0
            };
        });

        res.json({ data: safeUsers });
    } catch (error) {
        next(error);
    }
};

export const promoteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.params.userId as string;
        const { role } = req.body; // 'ADMIN' or 'MENTOR'

        const user = await prisma.user.update({
            where: { id: userId },
            data: { role }
        });

        res.json({ data: user });
    } catch (error) {
        next(error);
    }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.params.userId as string;

        // Prevent admin from deleting themselves
        if ((req as any).user?.userId === userId) {
            return res.status(400).json({ error: { message: "Cannot delete your own admin account." } });
        }

        await prisma.user.delete({
            where: { id: userId }
        });

        res.json({ success: true, message: "User deleted successfully." });
    } catch (error) {
        next(error);
    }
};

export const getSkillLabModes = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const modes = await prisma.gamificationMode.findMany({
            orderBy: { orderIndex: 'asc' },
            include: {
                _count: { select: { tasks: true } }
            }
        });
        res.json({ data: modes });
    } catch (error) {
        next(error);
    }
};

export const toggleSkillLabMode = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const modeId = req.params.modeId as string;
        const { isActive } = req.body;

        const mode = await prisma.gamificationMode.update({
            where: { id: modeId },
            data: { isActive }
        });

        res.json({ data: mode });
    } catch (error) {
        next(error);
    }
};
