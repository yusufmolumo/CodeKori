import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../config/prisma';
import { updateUserGamification } from '../services/gamificationService';

export const getChallenges = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as AuthRequest).user?.userId;

        const challenges = await prisma.codingChallenge.findMany({
            orderBy: { createdAt: 'asc' }
        });

        // Get user's solved challenges if logged in
        let solvedChallengeIds: string[] = [];
        if (userId) {
            const solved = await prisma.challengeSubmission.findMany({
                where: { userId, passed: true },
                select: { challengeId: true },
                distinct: ['challengeId']
            });
            solvedChallengeIds = solved.map(s => s.challengeId);
        }

        const challengesWithStatus = challenges.map(c => ({
            ...c,
            isSolved: solvedChallengeIds.includes(c.id)
        }));

        res.json({ data: challengesWithStatus });
    } catch (error) {
        next(error);
    }
};

export const getChallenge = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const userId = (req as AuthRequest).user?.userId;
        const challengeId = String(id);

        const challenge = await prisma.codingChallenge.findUnique({
            where: { id: challengeId as string }
        });

        if (!challenge) {
            return res.status(404).json({ error: { message: 'Challenge not found' } });
        }

        let userSubmission = null;
        let attemptCount = 0;
        let isSolved = false;

        if (userId) {
            // Get user's latest submission
            userSubmission = await prisma.challengeSubmission.findFirst({
                where: { userId, challengeId: challengeId },
                orderBy: { submittedAt: 'desc' }
            });

            // Count failed attempts
            attemptCount = await prisma.challengeSubmission.count({
                where: { userId, challengeId: challengeId, passed: false }
            });

            // Check if solved
            const solved = await prisma.challengeSubmission.findFirst({
                where: { userId, challengeId: challengeId, passed: true }
            });
            isSolved = !!solved;
        }

        res.json({
            data: {
                ...challenge,
                userSubmission,
                attemptCount,
                isSolved,
                showHint: attemptCount >= 5
            }
        });
    } catch (error) {
        next(error);
    }
};

export const submitChallenge = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as AuthRequest).user?.userId;
        const { challengeId } = req.params;
        const id = String(challengeId);
        const { code } = req.body;

        if (!userId) return res.status(401).json({ error: { message: 'Unauthorized' } });

        const challenge = await prisma.codingChallenge.findUnique({ where: { id } });
        if (!challenge) return res.status(404).json({ error: { message: 'Challenge not found' } });

        // Check if already solved (prevent double XP)
        const alreadySolved = await prisma.challengeSubmission.findFirst({
            where: { userId, challengeId: id, passed: true }
        });

        // Simple evaluation - check if code contains expected patterns
        // In production, use sandboxed code execution
        const passed = evaluateCode(code, challenge.title);
        const score = passed ? 100 : 0;

        const submission = await prisma.challengeSubmission.create({
            data: {
                userId,
                challengeId: id,
                submittedCode: code,
                score,
                passed,
                feedback: passed ? 'Correct! Great job!' : 'Not quite right. Try again!'
            }
        });

        // Award XP only on first solve
        let xpEarned = 0;
        if (passed && !alreadySolved) {
            await updateUserGamification(userId, challenge.xpReward);
            xpEarned = challenge.xpReward;
        }

        // Count failed attempts
        const attemptCount = await prisma.challengeSubmission.count({
            where: { userId, challengeId: id, passed: false }
        });

        res.json({
            data: {
                submission,
                passed,
                xpEarned,
                alreadySolved: !!alreadySolved,
                attemptCount,
                showHint: attemptCount >= 5
            }
        });
    } catch (error) {
        next(error);
    }
};

// Simple code evaluation (placeholder - in production use sandboxed execution)
function evaluateCode(code: string, challengeTitle: string): boolean {
    const codeClean = code.toLowerCase().trim();

    // Check for minimum code length and basic structure
    if (code.length < 10) return false;

    // Title-based checks
    if (challengeTitle.includes('Variable')) {
        return codeClean.includes('let') || codeClean.includes('const') || codeClean.includes('var');
    }
    if (challengeTitle.includes('Function')) {
        return codeClean.includes('function') || codeClean.includes('=>');
    }
    if (challengeTitle.includes('Loop')) {
        return codeClean.includes('for') || codeClean.includes('while');
    }
    if (challengeTitle.includes('Array')) {
        return codeClean.includes('[') && codeClean.includes(']');
    }
    if (challengeTitle.includes('Object')) {
        return codeClean.includes('{') && codeClean.includes(':');
    }
    if (challengeTitle.includes('HTML')) {
        return codeClean.includes('<') && codeClean.includes('>');
    }
    if (challengeTitle.includes('CSS')) {
        return codeClean.includes('{') && (codeClean.includes(':') || codeClean.includes(';'));
    }

    // Default: pass if code has reasonable content
    return code.length > 20;
}

export const getDailyQuest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as AuthRequest).user?.userId;

        // Fetch all easy/medium challenges
        const challenges = await prisma.codingChallenge.findMany({
            where: {
                difficulty: { in: ['EASY', 'MEDIUM'] }
            }
        });

        if (challenges.length === 0) {
            return res.status(404).json({ error: { message: 'No challenges found' } });
        }

        // Filter out solved ones if logged in
        let available = challenges;
        if (userId) {
            const solved = await prisma.challengeSubmission.findMany({
                where: { userId, passed: true },
                select: { challengeId: true }
            });
            const solvedIds = solved.map(s => s.challengeId);
            const unsolved = challenges.filter(c => !solvedIds.includes(c.id));
            if (unsolved.length > 0) available = unsolved;
        }

        // Return a random one
        const randomChallenge = available[Math.floor(Math.random() * available.length)];
        res.json({ data: randomChallenge });
    } catch (error) {
        next(error);
    }
};

export const createChallenge = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { title, description, difficulty, starterCode, hints, xpReward } = req.body;

        const challenge = await prisma.codingChallenge.create({
            data: {
                title,
                description,
                difficulty,
                starterCode,
                hints: hints || [],
                xpReward: xpReward || 50
            }
        });

        res.status(201).json({ data: challenge });
    } catch (error) {
        next(error);
    }
};
