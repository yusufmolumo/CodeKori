import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../config/prisma';
import { updateUserGamification } from '../services/gamificationService';

export const getChallenges = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as AuthRequest).user?.userId;

        const challenges = await prisma.codingChallenge.findMany({
            where: { isPublished: true },
            include: {
                author: { select: { profile: { select: { username: true, fullName: true } } } }
            },
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
            where: { id: challengeId as string },
            include: {
                author: { select: { profile: { select: { username: true, fullName: true } } } }
            }
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

// Code evaluation — validates submitted code against challenge requirements
function evaluateCode(code: string, challengeTitle: string): boolean {
    if (!code || typeof code !== 'string') return false;

    const codeClean = code.trim();
    const codeLower = codeClean.toLowerCase();

    // Reject empty or trivially short submissions
    if (codeClean.length < 10) return false;

    // Reject submissions that are just random characters or no code structure
    const hasCodeStructure = /[;{}()=]/.test(codeClean) || /<\w+/.test(codeClean);
    if (!hasCodeStructure) return false;

    // Title-based validation — each challenge type requires specific syntax
    if (challengeTitle.includes('Variable')) {
        const hasDeclaration = codeLower.includes('let ') || codeLower.includes('const ') || codeLower.includes('var ');
        const hasAssignment = codeClean.includes('=');
        return hasDeclaration && hasAssignment;
    }
    if (challengeTitle.includes('Function')) {
        const hasFunction = codeLower.includes('function ') || codeClean.includes('=>');
        const hasParens = codeClean.includes('(') && codeClean.includes(')');
        const hasBody = codeClean.includes('{') && codeClean.includes('}');
        return hasFunction && hasParens && hasBody;
    }
    if (challengeTitle.includes('Loop')) {
        const hasLoop = codeLower.includes('for') || codeLower.includes('while');
        const hasParens = codeClean.includes('(') && codeClean.includes(')');
        const hasBody = codeClean.includes('{') && codeClean.includes('}');
        return hasLoop && hasParens && hasBody;
    }
    if (challengeTitle.includes('Array')) {
        const hasBrackets = codeClean.includes('[') && codeClean.includes(']');
        const hasDeclaration = codeLower.includes('let ') || codeLower.includes('const ') || codeLower.includes('var ');
        return hasBrackets && hasDeclaration;
    }
    if (challengeTitle.includes('Object')) {
        const hasBraces = codeClean.includes('{') && codeClean.includes('}');
        const hasColon = codeClean.includes(':');
        const hasDeclaration = codeLower.includes('let ') || codeLower.includes('const ') || codeLower.includes('var ');
        return hasBraces && hasColon && hasDeclaration;
    }
    if (challengeTitle.includes('HTML')) {
        const hasOpenTag = /<\w+/.test(codeClean);
        const hasCloseTag = /<\/\w+>/.test(codeClean) || /\/>/.test(codeClean);
        return hasOpenTag && hasCloseTag;
    }
    if (challengeTitle.includes('CSS')) {
        const hasSelector = /[\w.#]\s*\{/.test(codeClean);
        const hasProperty = /:\s*.+;/.test(codeClean);
        return hasSelector && hasProperty;
    }
    if (challengeTitle.includes('Conditional') || challengeTitle.includes('If')) {
        return codeLower.includes('if') && codeClean.includes('(') && codeClean.includes('{');
    }

    // Default: require minimum length + code-like structure
    return codeClean.length >= 30 && hasCodeStructure;
}

export const getDailyQuest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as AuthRequest).user?.userId;

        // Fetch all easy/medium challenges
        const challenges = await prisma.codingChallenge.findMany({
            where: {
                difficulty: { in: ['EASY', 'MEDIUM'] },
                isPublished: true
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

// ===== MENTOR CRUD =====

export const createChallenge = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as AuthRequest).user?.userId;
        const { title, description, difficulty, starterCode, hints, xpReward } = req.body;

        const challenge = await prisma.codingChallenge.create({
            data: {
                title,
                description,
                difficulty,
                starterCode,
                hints: hints || [],
                xpReward: xpReward || 50,
                authorId: userId,
                isPublished: false
            }
        });

        res.status(201).json({ data: challenge });
    } catch (error) {
        next(error);
    }
};

export const getMyChallenges = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as AuthRequest).user?.userId;
        if (!userId) return res.status(401).json({ error: { message: 'Unauthorized' } });

        const challenges = await prisma.codingChallenge.findMany({
            where: { authorId: userId },
            include: {
                _count: { select: { submissions: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Get pass/fail stats for each
        const challengesWithStats = await Promise.all(challenges.map(async (c) => {
            const passCount = await prisma.challengeSubmission.count({
                where: { challengeId: c.id, passed: true }
            });
            const failCount = await prisma.challengeSubmission.count({
                where: { challengeId: c.id, passed: false }
            });
            return { ...c, passCount, failCount };
        }));

        res.json({ data: challengesWithStats });
    } catch (error) {
        next(error);
    }
};

export const updateChallenge = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as AuthRequest).user?.userId;
        const { id } = req.params;
        const { title, description, difficulty, starterCode, hints, xpReward } = req.body;

        if (!userId) return res.status(401).json({ error: { message: 'Unauthorized' } });

        const challenge = await prisma.codingChallenge.findUnique({ where: { id } });
        if (!challenge) return res.status(404).json({ error: { message: 'Challenge not found' } });
        if (challenge.authorId !== userId) return res.status(403).json({ error: { message: 'Not your challenge' } });

        const updated = await prisma.codingChallenge.update({
            where: { id },
            data: {
                title: title ?? challenge.title,
                description: description ?? challenge.description,
                difficulty: difficulty ?? challenge.difficulty,
                starterCode: starterCode !== undefined ? starterCode : challenge.starterCode,
                hints: hints ?? challenge.hints,
                xpReward: xpReward ? Number(xpReward) : challenge.xpReward,
            }
        });

        res.json({ data: updated });
    } catch (error) {
        next(error);
    }
};

export const deleteChallenge = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as AuthRequest).user?.userId;
        const { id } = req.params;

        if (!userId) return res.status(401).json({ error: { message: 'Unauthorized' } });

        const challenge = await prisma.codingChallenge.findUnique({ where: { id } });
        if (!challenge) return res.status(404).json({ error: { message: 'Challenge not found' } });
        if (challenge.authorId !== userId) return res.status(403).json({ error: { message: 'Not your challenge' } });

        await prisma.codingChallenge.delete({ where: { id } });
        res.json({ message: 'Challenge deleted' });
    } catch (error) {
        next(error);
    }
};

export const publishChallenge = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as AuthRequest).user?.userId;
        const { id } = req.params;

        if (!userId) return res.status(401).json({ error: { message: 'Unauthorized' } });

        const challenge = await prisma.codingChallenge.findUnique({ where: { id } });
        if (!challenge) return res.status(404).json({ error: { message: 'Challenge not found' } });
        if (challenge.authorId !== userId) return res.status(403).json({ error: { message: 'Not your challenge' } });

        const updated = await prisma.codingChallenge.update({
            where: { id },
            data: { isPublished: true }
        });

        res.json({ data: updated });
    } catch (error) {
        next(error);
    }
};

export const getChallengeSubmitters = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as AuthRequest).user?.userId;
        const { id } = req.params;

        if (!userId) return res.status(401).json({ error: { message: 'Unauthorized' } });

        const challenge = await prisma.codingChallenge.findUnique({ where: { id } });
        if (!challenge || challenge.authorId !== userId) {
            return res.status(403).json({ error: { message: 'Not your challenge' } });
        }

        const submissions = await prisma.challengeSubmission.findMany({
            where: { challengeId: id },
            include: {
                user: { select: { profile: { select: { username: true, fullName: true } } } }
            },
            orderBy: { submittedAt: 'desc' },
            distinct: ['userId']
        });

        res.json({ data: submissions });
    } catch (error) {
        next(error);
    }
};
