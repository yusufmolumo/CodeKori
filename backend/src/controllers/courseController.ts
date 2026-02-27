import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import { Difficulty } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { updateUserGamification } from '../services/gamificationService';
import { sendNotificationEmail } from '../services/emailService';

export const getCourses = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { difficulty, search } = req.query;

        const where: any = { isPublished: true };
        if (difficulty) where.difficulty = difficulty as Difficulty;
        if (search) where.title = { contains: String(search), mode: 'insensitive' };

        const courses = await prisma.course.findMany({
            where,
            include: {
                _count: {
                    select: { modules: true }
                },
                author: {
                    select: { profile: { select: { username: true, fullName: true } } }
                }
            }
        });

        res.json({ data: courses });
    } catch (error) {
        next(error);
    }
};

export const getCourse = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const userId = (req as AuthRequest).user?.userId;

        const course = await prisma.course.findUnique({
            where: { id: id as string },
            include: {
                modules: {
                    include: {
                        lessons: {
                            orderBy: { orderIndex: 'asc' }
                        }
                    },
                    orderBy: { orderIndex: 'asc' }
                },
                author: {
                    select: { profile: { select: { username: true, fullName: true } } }
                }
            }
        });

        if (!course) return res.status(404).json({ error: { message: 'Course not found' } });

        // Get enrollment status and progress if user is logged in
        let enrollment = null;
        let completedLessonIds: string[] = [];

        if (userId) {
            enrollment = await prisma.courseEnrollment.findUnique({
                where: { userId_courseId: { userId, courseId: id as string } }
            });

            const progress = await prisma.userLessonProgress.findMany({
                where: { userId, lesson: { module: { courseId: id as string } }, completed: true },
                select: { lessonId: true }
            });
            completedLessonIds = progress.map(p => p.lessonId);
        }

        res.json({
            data: {
                ...course,
                isEnrolled: !!enrollment,
                completedLessonIds
            }
        });
    } catch (error) {
        next(error);
    }
};

export const enrollInCourse = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const userId = (req as AuthRequest).user?.userId;

        if (!userId) return res.status(401).json({ error: { message: 'Unauthorized' } });

        const existing = await prisma.courseEnrollment.findUnique({
            where: { userId_courseId: { userId, courseId: id as string } }
        });

        if (existing) {
            return res.json({ data: existing, message: 'Already enrolled' });
        }

        const enrollment = await prisma.courseEnrollment.create({
            data: { userId, courseId: id as string }
        });

        // Create enrollment notification + email
        try {
            const course = await prisma.course.findUnique({ where: { id: id as string }, select: { title: true } });
            const courseTitle = course?.title || 'a course';
            await prisma.notification.create({
                data: {
                    userId,
                    type: 'COURSE_ENROLLED',
                    title: 'Course Enrolled! 📚',
                    content: `You have enrolled in "${courseTitle}". Start learning now!`,
                    link: `/dashboard/courses/${id}`
                }
            });
            sendNotificationEmail(userId, 'Course Enrolled! 📚', `<p>You have enrolled in <strong>${courseTitle}</strong>.</p><p><a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/courses/${id}" style="color:#8b5cf6;">Start Learning →</a></p>`);
        } catch (e) {
            console.error('Failed to create enrollment notification', e);
        }

        res.status(201).json({ data: enrollment });
    } catch (error) {
        next(error);
    }
};

export const completeLesson = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { lessonId } = req.params;
        const userId = (req as AuthRequest).user?.userId;

        if (!userId) return res.status(401).json({ error: { message: 'Unauthorized' } });

        const lesson = await prisma.lesson.findUnique({
            where: { id: lessonId as string },
            include: { module: { include: { course: true } } }
        });

        if (!lesson) return res.status(404).json({ error: { message: 'Lesson not found' } });

        // Check enrollment
        const enrollment = await prisma.courseEnrollment.findUnique({
            where: { userId_courseId: { userId, courseId: (lesson as any).module.courseId } }
        });

        if (!enrollment) {
            return res.status(403).json({ error: { message: 'Not enrolled in this course' } });
        }

        // Create or update progress
        const progress = await prisma.userLessonProgress.upsert({
            where: { userId_lessonId: { userId, lessonId: lessonId as string } },
            update: { completed: true, completedAt: new Date() },
            create: { userId, lessonId: lessonId as string, completed: true, completedAt: new Date() }
        });

        // Award XP and update level/streak
        await updateUserGamification(userId, lesson.xpReward);

        // Create lesson completion notification + email
        try {
            const courseTitle = (lesson as any).module?.course?.title || 'your course';
            await prisma.notification.create({
                data: {
                    userId,
                    type: 'LESSON_COMPLETED',
                    title: 'Lesson Completed! ✅',
                    content: `You completed a lesson in "${courseTitle}" and earned ${lesson.xpReward} XP!`,
                    link: `/dashboard/courses/${(lesson as any).module?.courseId}`
                }
            });
            sendNotificationEmail(userId, 'Lesson Completed! ✅', `<p>You completed a lesson in <strong>${courseTitle}</strong> and earned <strong>${lesson.xpReward} XP</strong>!</p><p><a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/courses/${(lesson as any).module?.courseId}" style="color:#8b5cf6;">Continue Learning →</a></p>`);
        } catch (e) {
            console.error('Failed to create lesson notification', e);
        }

        res.json({ data: progress, xpEarned: lesson.xpReward });
    } catch (error) {
        next(error);
    }
};

export const getLesson = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { lessonId } = req.params;
        const userId = (req as AuthRequest).user?.userId;

        const lesson = await prisma.lesson.findUnique({
            where: { id: lessonId as string },
            include: {
                module: {
                    include: {
                        course: true,
                        lessons: { orderBy: { orderIndex: 'asc' }, select: { id: true, orderIndex: true } }
                    }
                }
            }
        });

        if (!lesson) return res.status(404).json({ error: { message: 'Lesson not found' } });

        let isCompleted = false;
        if (userId) {
            const progress = await prisma.userLessonProgress.findUnique({
                where: { userId_lessonId: { userId, lessonId: lessonId as string } }
            });
            isCompleted = progress?.completed || false;
        }

        // Find previous and next lessons
        const allLessons = (lesson as any).module.lessons;
        const currentIndex = allLessons.findIndex((l: any) => l.id === lessonId);
        const previousLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
        const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

        res.json({
            data: {
                ...lesson,
                isCompleted,
                previousLessonId: previousLesson?.id,
                nextLessonId: nextLesson?.id
            }
        });
    } catch (error) {
        next(error);
    }
};

export const getEnrolledCourses = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as AuthRequest).user?.userId;
        if (!userId) return res.status(401).json({ error: { message: 'Unauthorized' } });

        const enrollments = await prisma.courseEnrollment.findMany({
            where: { userId },
            include: {
                course: {
                    include: {
                        _count: {
                            select: { modules: true }
                        }
                    }
                }
            }
        });

        const courses = enrollments.map(e => e.course);
        res.json({ data: courses });
    } catch (error) {
        next(error);
    }
};

// ===== MENTOR CRUD =====

export const createCourse = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as AuthRequest).user?.userId;
        const { title, description, difficulty, durationHours, thumbnailUrl } = req.body;

        const course = await prisma.course.create({
            data: {
                title,
                description,
                difficulty,
                durationHours: durationHours ? Number(durationHours) : null,
                thumbnailUrl,
                authorId: userId,
                isPublished: false
            }
        });

        res.status(201).json({ data: course });
    } catch (error) {
        next(error);
    }
};

export const getMyCourses = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as AuthRequest).user?.userId;
        if (!userId) return res.status(401).json({ error: { message: 'Unauthorized' } });

        const courses = await prisma.course.findMany({
            where: { authorId: userId },
            include: {
                _count: { select: { modules: true, enrollments: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json({ data: courses });
    } catch (error) {
        next(error);
    }
};

export const updateCourse = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as AuthRequest).user?.userId;
        const { id } = req.params;
        const { title, description, difficulty, durationHours, thumbnailUrl } = req.body;

        if (!userId) return res.status(401).json({ error: { message: 'Unauthorized' } });

        const course = await prisma.course.findUnique({ where: { id } });
        if (!course) return res.status(404).json({ error: { message: 'Course not found' } });
        if (course.authorId !== userId) return res.status(403).json({ error: { message: 'Not your course' } });

        const updated = await prisma.course.update({
            where: { id },
            data: {
                title: title ?? course.title,
                description: description ?? course.description,
                difficulty: difficulty ?? course.difficulty,
                durationHours: durationHours ? Number(durationHours) : course.durationHours,
                thumbnailUrl: thumbnailUrl ?? course.thumbnailUrl,
            }
        });

        res.json({ data: updated });
    } catch (error) {
        next(error);
    }
};

export const deleteCourse = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as AuthRequest).user?.userId;
        const { id } = req.params;

        if (!userId) return res.status(401).json({ error: { message: 'Unauthorized' } });

        const course = await prisma.course.findUnique({ where: { id } });
        if (!course) return res.status(404).json({ error: { message: 'Course not found' } });
        if (course.authorId !== userId) return res.status(403).json({ error: { message: 'Not your course' } });

        await prisma.course.delete({ where: { id } });
        res.json({ message: 'Course deleted' });
    } catch (error) {
        next(error);
    }
};

export const publishCourse = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as AuthRequest).user?.userId;
        const { id } = req.params;

        if (!userId) return res.status(401).json({ error: { message: 'Unauthorized' } });

        const course = await prisma.course.findUnique({ where: { id } });
        if (!course) return res.status(404).json({ error: { message: 'Course not found' } });
        if (course.authorId !== userId) return res.status(403).json({ error: { message: 'Not your course' } });

        const updated = await prisma.course.update({
            where: { id },
            data: { isPublished: true }
        });

        res.json({ data: updated });
    } catch (error) {
        next(error);
    }
};

// ===== MODULE CRUD =====

export const createModule = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as AuthRequest).user?.userId;
        const { courseId } = req.params;
        const { title, description } = req.body;

        if (!userId) return res.status(401).json({ error: { message: 'Unauthorized' } });

        const course = await prisma.course.findUnique({ where: { id: courseId } });
        if (!course || course.authorId !== userId) {
            return res.status(403).json({ error: { message: 'Not your course' } });
        }

        const maxOrder = await prisma.module.aggregate({ where: { courseId }, _max: { orderIndex: true } });
        const orderIndex = (maxOrder._max.orderIndex ?? -1) + 1;

        const mod = await prisma.module.create({
            data: { courseId, title, description, orderIndex }
        });

        res.status(201).json({ data: mod });
    } catch (error) {
        next(error);
    }
};

export const updateModule = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as AuthRequest).user?.userId;
        const { moduleId } = req.params;
        const { title, description } = req.body;

        if (!userId) return res.status(401).json({ error: { message: 'Unauthorized' } });

        const mod = await prisma.module.findUnique({ where: { id: moduleId }, include: { course: true } });
        if (!mod || mod.course.authorId !== userId) {
            return res.status(403).json({ error: { message: 'Not your module' } });
        }

        const updated = await prisma.module.update({
            where: { id: moduleId },
            data: { title: title ?? mod.title, description: description ?? mod.description }
        });

        res.json({ data: updated });
    } catch (error) {
        next(error);
    }
};

export const deleteModule = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as AuthRequest).user?.userId;
        const { moduleId } = req.params;

        if (!userId) return res.status(401).json({ error: { message: 'Unauthorized' } });

        const mod = await prisma.module.findUnique({ where: { id: moduleId }, include: { course: true } });
        if (!mod || mod.course.authorId !== userId) {
            return res.status(403).json({ error: { message: 'Not your module' } });
        }

        await prisma.module.delete({ where: { id: moduleId } });
        res.json({ message: 'Module deleted' });
    } catch (error) {
        next(error);
    }
};

// ===== LESSON CRUD =====

export const createLesson = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as AuthRequest).user?.userId;
        const { moduleId } = req.params;
        const { title, content, videoUrl, xpReward, readingTimeMinutes } = req.body;

        if (!userId) return res.status(401).json({ error: { message: 'Unauthorized' } });

        const mod = await prisma.module.findUnique({ where: { id: moduleId }, include: { course: true } });
        if (!mod || mod.course.authorId !== userId) {
            return res.status(403).json({ error: { message: 'Not your module' } });
        }

        const maxOrder = await prisma.lesson.aggregate({ where: { moduleId }, _max: { orderIndex: true } });
        const orderIndex = (maxOrder._max.orderIndex ?? -1) + 1;

        const lesson = await prisma.lesson.create({
            data: {
                moduleId,
                title,
                content: content || '',
                videoUrl,
                orderIndex,
                xpReward: xpReward ? Number(xpReward) : 10,
                readingTimeMinutes: readingTimeMinutes ? Number(readingTimeMinutes) : null
            }
        });

        res.status(201).json({ data: lesson });
    } catch (error) {
        next(error);
    }
};

export const updateLesson = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as AuthRequest).user?.userId;
        const { lessonId } = req.params;
        const { title, content, videoUrl, xpReward, readingTimeMinutes } = req.body;

        if (!userId) return res.status(401).json({ error: { message: 'Unauthorized' } });

        const lesson = await prisma.lesson.findUnique({
            where: { id: lessonId },
            include: { module: { include: { course: true } } }
        });
        if (!lesson || (lesson as any).module.course.authorId !== userId) {
            return res.status(403).json({ error: { message: 'Not your lesson' } });
        }

        const updated = await prisma.lesson.update({
            where: { id: lessonId },
            data: {
                title: title ?? lesson.title,
                content: content ?? lesson.content,
                videoUrl: videoUrl !== undefined ? videoUrl : lesson.videoUrl,
                xpReward: xpReward ? Number(xpReward) : lesson.xpReward,
                readingTimeMinutes: readingTimeMinutes ? Number(readingTimeMinutes) : lesson.readingTimeMinutes,
            }
        });

        res.json({ data: updated });
    } catch (error) {
        next(error);
    }
};

export const deleteLesson = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as AuthRequest).user?.userId;
        const { lessonId } = req.params;

        if (!userId) return res.status(401).json({ error: { message: 'Unauthorized' } });

        const lesson = await prisma.lesson.findUnique({
            where: { id: lessonId },
            include: { module: { include: { course: true } } }
        });
        if (!lesson || (lesson as any).module.course.authorId !== userId) {
            return res.status(403).json({ error: { message: 'Not your lesson' } });
        }

        await prisma.lesson.delete({ where: { id: lessonId } });
        res.json({ message: 'Lesson deleted' });
    } catch (error) {
        next(error);
    }
};
