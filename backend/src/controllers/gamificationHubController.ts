import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../config/prisma';
import { updateUserGamification } from '../services/gamificationService';

export const getModes = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as AuthRequest).user?.userId;

        const modes = await prisma.gamificationMode.findMany({
            orderBy: { orderIndex: 'asc' },
            include: {
                _count: { select: { tasks: true } }
            }
        });

        // Get user completion counts per mode
        let completionMap: Record<string, number> = {};
        if (userId) {
            const submissions = await prisma.gamificationSubmission.findMany({
                where: { userId, passed: true },
                include: { task: { select: { modeId: true } } }
            });
            for (const sub of submissions) {
                const modeId = sub.task.modeId;
                completionMap[modeId] = (completionMap[modeId] || 0) + 1;
            }
        }

        const modesWithProgress = modes.map(mode => ({
            ...mode,
            totalTasks: mode._count.tasks,
            completedTasks: completionMap[mode.id] || 0
        }));

        res.json({ data: modesWithProgress });
    } catch (error) {
        next(error);
    }
};

export const getModeTasks = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { modeId } = req.params;
        const userId = (req as AuthRequest).user?.userId;

        const mode = await prisma.gamificationMode.findUnique({
            where: { id: modeId as string }
        });

        if (!mode) {
            return res.status(404).json({ error: { message: 'Mode not found' } });
        }

        const tasks = await prisma.gamificationTask.findMany({
            where: { modeId: modeId as string },
            orderBy: { orderIndex: 'asc' }
        });

        let completedTaskIds: string[] = [];
        if (userId) {
            const submissions = await prisma.gamificationSubmission.findMany({
                where: { userId, passed: true, task: { modeId: modeId as string } },
                select: { taskId: true }
            });
            completedTaskIds = submissions.map(s => s.taskId);
        }

        const tasksWithStatus = tasks.map(task => ({
            ...task,
            isCompleted: completedTaskIds.includes(task.id)
        }));

        res.json({ data: { mode, tasks: tasksWithStatus } });
    } catch (error) {
        next(error);
    }
};

export const getTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { taskId } = req.params;
        const userId = (req as AuthRequest).user?.userId;

        const task = await prisma.gamificationTask.findUnique({
            where: { id: taskId as string },
            include: { mode: true }
        });

        if (!task) {
            return res.status(404).json({ error: { message: 'Task not found' } });
        }

        let submission = null;
        if (userId) {
            submission = await prisma.gamificationSubmission.findUnique({
                where: { userId_taskId: { userId, taskId: taskId as string } }
            });
        }

        res.json({ data: { ...task, userSubmission: submission } });
    } catch (error) {
        next(error);
    }
};

export const submitTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as AuthRequest).user?.userId;
        const { taskId } = req.params;
        const { answer } = req.body;

        if (!userId) return res.status(401).json({ error: { message: 'Unauthorized' } });

        const task = await prisma.gamificationTask.findUnique({
            where: { id: taskId as string }
        });

        if (!task) return res.status(404).json({ error: { message: 'Task not found' } });

        // Check if already completed
        const existing = await prisma.gamificationSubmission.findUnique({
            where: { userId_taskId: { userId, taskId: taskId as string } }
        });

        if (existing?.passed) {
            return res.json({ data: { alreadyCompleted: true, passed: true, xpEarned: 0 } });
        }

        // Evaluate answer against taskData
        const taskData = task.taskData as any;
        const passed = evaluateAnswer(answer, taskData);
        const score = passed ? 100 : 0;

        const submission = await prisma.gamificationSubmission.upsert({
            where: { userId_taskId: { userId, taskId: taskId as string } },
            update: { passed, score, response: answer },
            create: { userId, taskId: taskId as string, passed, score, response: answer }
        });

        let xpEarned = 0;
        if (passed) {
            await updateUserGamification(userId, task.xpReward);
            xpEarned = task.xpReward;
        }

        res.json({
            data: {
                submission,
                passed,
                xpEarned,
                feedback: passed
                    ? 'Correct! Great work!'
                    : 'Not quite right. Review the scenario and try again.'
            }
        });
    } catch (error) {
        next(error);
    }
};

function evaluateAnswer(answer: any, taskData: any): boolean {
    if (!answer || !taskData) return false;

    // For multiple-choice tasks
    if (taskData.correctAnswer !== undefined) {
        return String(answer).trim().toLowerCase() === String(taskData.correctAnswer).trim().toLowerCase();
    }

    // For code-based tasks: check if answer contains expected keywords
    if (taskData.expectedKeywords && Array.isArray(taskData.expectedKeywords)) {
        const answerLower = String(answer).toLowerCase();
        const matched = taskData.expectedKeywords.filter((kw: string) => answerLower.includes(kw.toLowerCase()));
        return matched.length >= Math.ceil(taskData.expectedKeywords.length * 0.6);
    }

    // For decision-based tasks
    if (taskData.correctOption !== undefined) {
        return String(answer) === String(taskData.correctOption);
    }

    // Default: generous pass for non-empty substantive answers
    return String(answer).trim().length > 20;
}
