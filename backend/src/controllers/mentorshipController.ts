import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../config/prisma';
import { sendNotificationEmail } from '../services/emailService';

// Learner requests a mentor
export const requestMentor = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as AuthRequest).user?.userId;
        const { mentorId } = req.body;

        if (!userId) return res.status(401).json({ error: { message: 'Unauthorized' } });
        if (!mentorId) return res.status(400).json({ error: { message: 'mentorId is required' } });

        // Check mentor exists and is a mentor
        const mentor = await prisma.user.findUnique({ where: { id: mentorId } });
        if (!mentor || mentor.role !== 'mentor') {
            return res.status(404).json({ error: { message: 'Mentor not found' } });
        }

        // Check for existing connection
        const existing = await prisma.mentorshipConnection.findUnique({
            where: { menteeId_mentorId: { menteeId: userId, mentorId } }
        });
        if (existing) {
            return res.status(400).json({ error: { message: `Request already ${existing.status}` } });
        }

        const connection = await prisma.mentorshipConnection.create({
            data: { menteeId: userId, mentorId, status: 'pending' }
        });

        // Create notification for mentor
        try {
            const menteeProfile = await prisma.userProfile.findUnique({ where: { userId } });
            await prisma.notification.create({
                data: {
                    userId: mentorId,
                    type: 'MENTORSHIP_REQUEST',
                    title: 'New Mentee Request',
                    content: `${menteeProfile?.fullName || menteeProfile?.username || 'A learner'} wants you as their mentor`,
                    link: '/dashboard/mentorship'
                }
            });
            // Send email
            const menteeName = menteeProfile?.fullName || menteeProfile?.username || 'A learner';
            sendNotificationEmail(mentorId, 'New Mentee Request', `<p><strong>${menteeName}</strong> wants you as their mentor on CodeKori.</p><p><a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/mentorship" style="color:#8b5cf6;">View Requests →</a></p>`);
        } catch (e) {
            console.error("Failed to create mentorship notification", e);
        }

        res.status(201).json({ data: connection });
    } catch (error) {
        next(error);
    }
};

// Mentor gets pending requests
export const getMyRequests = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as AuthRequest).user?.userId;
        if (!userId) return res.status(401).json({ error: { message: 'Unauthorized' } });

        const requests = await prisma.mentorshipConnection.findMany({
            where: { mentorId: userId, status: 'pending' },
            include: {
                mentee: {
                    select: {
                        id: true,
                        email: true,
                        profile: { select: { username: true, fullName: true, avatarUrl: true, bio: true } },
                        gamification: { select: { totalXp: true, level: true, currentStreak: true } }
                    }
                }
            },
            orderBy: { requestedAt: 'desc' }
        });

        res.json({ data: requests });
    } catch (error) {
        next(error);
    }
};

// Mentor accepts a request
export const acceptRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as AuthRequest).user?.userId;
        const { id } = req.params;

        if (!userId) return res.status(401).json({ error: { message: 'Unauthorized' } });

        const connection = await prisma.mentorshipConnection.findUnique({ where: { id } });
        if (!connection || connection.mentorId !== userId) {
            return res.status(404).json({ error: { message: 'Request not found' } });
        }

        const updated = await prisma.mentorshipConnection.update({
            where: { id },
            data: { status: 'active', approvedAt: new Date() }
        });

        // Notify mentee
        try {
            await prisma.notification.create({
                data: {
                    userId: connection.menteeId,
                    type: 'MENTORSHIP_ACCEPTED',
                    title: 'Mentor Request Accepted! 🎉',
                    content: 'Your mentorship request has been accepted.',
                    link: '/dashboard/mentorship'
                }
            });
            // Send email
            sendNotificationEmail(connection.menteeId, 'Mentor Request Accepted! 🎉', `<p>Your mentorship request has been accepted! You can now chat with your mentor.</p><p><a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/mentorship" style="color:#8b5cf6;">Go to Mentorship →</a></p>`);
        } catch (e) {
            console.error("Failed to notify mentee", e);
        }

        res.json({ data: updated });
    } catch (error) {
        next(error);
    }
};

// Mentor declines a request
export const declineRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as AuthRequest).user?.userId;
        const { id } = req.params;

        if (!userId) return res.status(401).json({ error: { message: 'Unauthorized' } });

        const connection = await prisma.mentorshipConnection.findUnique({ where: { id } });
        if (!connection || connection.mentorId !== userId) {
            return res.status(404).json({ error: { message: 'Request not found' } });
        }

        const updated = await prisma.mentorshipConnection.update({
            where: { id },
            data: { status: 'declined' }
        });

        res.json({ data: updated });
    } catch (error) {
        next(error);
    }
};

// Mentor's active mentees
export const getMyMentees = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as AuthRequest).user?.userId;
        if (!userId) return res.status(401).json({ error: { message: 'Unauthorized' } });

        const connections = await prisma.mentorshipConnection.findMany({
            where: { mentorId: userId, status: 'active' },
            include: {
                mentee: {
                    select: {
                        id: true,
                        profile: { select: { username: true, fullName: true, avatarUrl: true } },
                        gamification: { select: { totalXp: true, level: true, currentStreak: true, longestStreak: true, lastLoginDate: true } }
                    }
                }
            }
        });

        res.json({ data: connections });
    } catch (error) {
        next(error);
    }
};

// Mentor gets detailed stats for a specific mentee
export const getMenteeStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as AuthRequest).user?.userId;
        const menteeId = req.params.id;

        if (!userId) return res.status(401).json({ error: { message: 'Unauthorized' } });

        // Verify mentor-mentee relationship
        const connection = await prisma.mentorshipConnection.findFirst({
            where: { mentorId: userId, menteeId, status: 'active' }
        });
        if (!connection) {
            return res.status(403).json({ error: { message: 'Not your mentee' } });
        }

        // Gather comprehensive stats
        const [profile, gamification, enrollments, challengesSubs, skillLabSubs, leaderboardEntry] = await Promise.all([
            prisma.userProfile.findUnique({ where: { userId: menteeId } }),
            prisma.userGamification.findUnique({ where: { userId: menteeId } }),
            prisma.courseEnrollment.findMany({
                where: { userId: menteeId },
                include: { course: { select: { title: true } } }
            }),
            prisma.challengeSubmission.findMany({
                where: { userId: menteeId, passed: true }
            }),
            prisma.gamificationSubmission.findMany({
                where: { userId: menteeId, passed: true }
            }),
            prisma.leaderboard.findFirst({
                where: { userId: menteeId },
                orderBy: { weekStart: 'desc' }
            })
        ]);

        const completedLessons = await prisma.userLessonProgress.count({
            where: { userId: menteeId, completed: true }
        });

        res.json({
            data: {
                profile,
                gamification,
                coursesEnrolled: enrollments.length,
                courses: enrollments.map((e: any) => ({ title: e.course?.title, completed: e.completed })),
                challengesCompleted: challengesSubs.length,
                skillLabCompleted: skillLabSubs.length,
                lessonsCompleted: completedLessons,
                leaderboardRank: leaderboardEntry?.rank || null,
                lastActive: gamification?.lastLoginDate || null
            }
        });
    } catch (error) {
        next(error);
    }
};

// Learner gets their mentor info
export const getMyMentor = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as AuthRequest).user?.userId;
        if (!userId) return res.status(401).json({ error: { message: 'Unauthorized' } });

        const connection = await prisma.mentorshipConnection.findFirst({
            where: { menteeId: userId, status: 'active' },
            include: {
                mentor: {
                    select: {
                        id: true,
                        profile: { select: { username: true, fullName: true, avatarUrl: true, bio: true } }
                    }
                }
            }
        });

        res.json({ data: connection });
    } catch (error) {
        next(error);
    }
};

// Learner gets their pending requests
export const getMyPendingRequests = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as AuthRequest).user?.userId;
        if (!userId) return res.status(401).json({ error: { message: 'Unauthorized' } });

        const requests = await prisma.mentorshipConnection.findMany({
            where: { menteeId: userId },
            include: {
                mentor: {
                    select: {
                        id: true,
                        profile: { select: { username: true, fullName: true, avatarUrl: true } }
                    }
                }
            }
        });

        res.json({ data: requests });
    } catch (error) {
        next(error);
    }
};

// Get chat messages between current user and another user
export const getChatMessages = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as AuthRequest).user?.userId;
        const otherUserId = req.params.userId as string;

        // Find the mentorship connection between the two users
        const connection = await prisma.mentorshipConnection.findFirst({
            where: {
                OR: [
                    { mentorId: userId, menteeId: otherUserId },
                    { mentorId: otherUserId, menteeId: userId }
                ],
                status: 'active'
            }
        });

        if (!connection) {
            return res.status(404).json({ error: { message: 'No active mentorship connection found' } });
        }

        const messages = await prisma.mentorshipMessage.findMany({
            where: { connectionId: connection.id },
            orderBy: { sentAt: 'asc' }
        });

        const otherUser = await prisma.user.findUnique({
            where: { id: otherUserId },
            select: {
                id: true,
                profile: {
                    select: { username: true, fullName: true, avatarUrl: true }
                }
            }
        });

        res.json({ data: { messages, otherUser, currentUserId: userId } });
    } catch (error) {
        next(error);
    }
};

// Send a chat message
export const sendChatMessage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as AuthRequest).user?.userId;
        const otherUserId = req.params.userId as string;
        const { content } = req.body;

        if (!content?.trim()) {
            return res.status(400).json({ error: { message: 'Message content is required' } });
        }

        // Find the mentorship connection
        const connection = await prisma.mentorshipConnection.findFirst({
            where: {
                OR: [
                    { mentorId: userId, menteeId: otherUserId },
                    { mentorId: otherUserId, menteeId: userId }
                ],
                status: 'active'
            }
        });

        if (!connection) {
            return res.status(404).json({ error: { message: 'No active mentorship connection found' } });
        }

        const message = await prisma.mentorshipMessage.create({
            data: {
                connectionId: connection.id,
                senderId: userId!,
                content: content.trim()
            }
        });

        // Create notification for the receiver
        try {
            const sender = await prisma.user.findUnique({
                where: { id: userId },
                select: { profile: { select: { username: true } } }
            });
            await prisma.notification.create({
                data: {
                    userId: otherUserId,
                    type: 'chat_message',
                    title: 'New Message',
                    content: `${sender?.profile?.username || 'Someone'} sent you a message`,
                    link: `/dashboard/mentorship/chat/${userId}`
                }
            });
            // Send email
            const senderName = sender?.profile?.username || 'Someone';
            sendNotificationEmail(otherUserId, 'New Mentorship Message', `<p><strong>${senderName}</strong> sent you a message on CodeKori.</p><p><a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/mentorship/chat/${userId}" style="color:#8b5cf6;">Read Message →</a></p>`);
        } catch (e) {
            console.error("Failed to create chat notification", e);
        }

        res.status(201).json({ data: message });
    } catch (error) {
        next(error);
    }
};

// Mentor removes/kicks a mentee
export const removeMentee = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const mentorId = (req as AuthRequest).user?.userId;
        const menteeId = req.params.id as string;

        if (!mentorId) return res.status(401).json({ error: { message: 'Unauthorized' } });

        const connection = await prisma.mentorshipConnection.findFirst({
            where: { mentorId, menteeId, status: 'active' }
        });

        if (!connection) {
            return res.status(404).json({ error: { message: 'No active mentorship with this mentee' } });
        }

        // Update connection status to declined
        await prisma.mentorshipConnection.update({
            where: { id: connection.id },
            data: { status: 'declined' }
        });

        // Create notification for the learner
        try {
            const mentor = await prisma.user.findUnique({
                where: { id: mentorId },
                select: { profile: { select: { username: true, fullName: true } } }
            });
            await prisma.notification.create({
                data: {
                    userId: menteeId,
                    type: 'mentorship_removed',
                    title: 'Mentorship Ended',
                    content: `Your mentor ${mentor?.profile?.fullName || mentor?.profile?.username || ''} has ended the mentorship. You can find a new mentor.`,
                    link: '/dashboard/mentorship'
                }
            });
            // Send email
            const mentorName = mentor?.profile?.fullName || mentor?.profile?.username || 'Your mentor';
            sendNotificationEmail(menteeId, 'Mentorship Ended', `<p><strong>${mentorName}</strong> has ended the mentorship. You can find a new mentor.</p><p><a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/mentorship" style="color:#8b5cf6;">Find a Mentor →</a></p>`);
        } catch (e) {
            console.error("Failed to create removal notification", e);
        }

        res.json({ message: 'Mentee removed successfully' });
    } catch (error) {
        next(error);
    }
};

// Get unread chat message counts (for badges)
export const getUnreadChatCounts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as AuthRequest).user?.userId;
        if (!userId) return res.status(401).json({ error: { message: 'Unauthorized' } });

        // Count unread chat_message notifications grouped by sender (via link field)
        const unreadNotifications = await prisma.notification.findMany({
            where: {
                userId,
                type: 'chat_message',
                read: false
            },
            select: { link: true }
        });

        // Total unread count
        const total = unreadNotifications.length;

        // Per-user counts: the link contains `/dashboard/mentorship/chat/<senderId>`
        const perUser: Record<string, number> = {};
        for (const n of unreadNotifications) {
            if (n.link) {
                const parts = n.link.split('/');
                const senderId = parts[parts.length - 1];
                perUser[senderId] = (perUser[senderId] || 0) + 1;
            }
        }

        res.json({ data: { total, perUser } });
    } catch (error) {
        next(error);
    }
};

// Mark chat notifications from a specific user as read
export const markChatRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as AuthRequest).user?.userId;
        if (!userId) return res.status(401).json({ error: { message: 'Unauthorized' } });

        const senderId = req.params.userId;
        const link = `/dashboard/mentorship/chat/${senderId}`;

        await prisma.notification.updateMany({
            where: {
                userId,
                type: 'chat_message',
                read: false,
                link
            },
            data: { read: true }
        });

        res.json({ message: 'Chat notifications marked as read' });
    } catch (error) {
        next(error);
    }
};
