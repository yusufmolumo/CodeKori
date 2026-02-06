import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import { Difficulty } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { updateUserGamification } from '../services/gamificationService';

export const getCourses = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { difficulty, search } = req.query;

        const where: any = {};
        if (difficulty) where.difficulty = difficulty as Difficulty;
        if (search) where.title = { contains: String(search), mode: 'insensitive' };

        const courses = await prisma.course.findMany({
            where,
            include: {
                _count: {
                    select: { modules: true }
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

export const createCourse = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { title, description, difficulty, durationHours, thumbnailUrl } = req.body;

        const course = await prisma.course.create({
            data: {
                title,
                description,
                difficulty,
                durationHours: Number(durationHours),
                thumbnailUrl
            }
        });

        res.status(201).json({ data: course });
    } catch (error) {
        next(error);
    }
};
