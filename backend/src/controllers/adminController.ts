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
            include: { profile: true },
            orderBy: { createdAt: 'desc' },
            take: 100 // Limit for now
        });

        // Sanitize
        const safeUsers = users.map(user => {
            const { passwordHash, verificationToken, passwordResetToken, ...rest } = user;
            return rest;
        });

        res.json({ data: safeUsers });
    } catch (error) {
        next(error);
    }
};

export const promoteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req.params;
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
