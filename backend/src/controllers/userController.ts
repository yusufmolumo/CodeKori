import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../config/prisma';

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as AuthRequest).user?.userId;
        if (!userId) return res.status(401).json({ error: { message: 'Unauthorized' } });

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                profile: true,
                gamification: true,
                badges: { include: { badge: true } }
            }
        });

        if (!user) return res.status(404).json({ error: { message: 'User not found' } });

        // Exclude passwordHash and sensitive data
        const { passwordHash, verificationToken, passwordResetToken, ...safeUser } = user;
        res.json({ data: safeUser });
    } catch (error) {
        next(error);
    }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as AuthRequest).user?.userId;
        const { bio, location, githubUrl, linkedinUrl, twitterUrl, avatarUrl, fullName } = req.body;

        if (!userId) return res.status(401).json({ error: { message: 'Unauthorized' } });

        const updatedProfile = await prisma.userProfile.update({
            where: { userId },
            data: {
                bio,
                location,
                githubUrl,
                linkedinUrl,
                twitterUrl,
                avatarUrl,
                fullName
            }
        });

        res.json({ data: updatedProfile });
    } catch (error) {
        next(error);
    }
};

export const getMentors = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const mentors = await prisma.user.findMany({
            where: { role: 'mentor' },
            include: {
                profile: true
            }
        });

        // Sanitize sensitive data
        const sanitizedMentors = mentors.map((user: any) => ({
            id: user.id,
            fullName: user.profile?.fullName,
            username: user.profile?.username,
            avatarUrl: user.profile?.avatarUrl,
            bio: user.profile?.bio,
            role: user.role
        }));

        res.json({ data: sanitizedMentors });
    } catch (error) {
        next(error);
    }
};
