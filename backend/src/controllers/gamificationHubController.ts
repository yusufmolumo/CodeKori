import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../config/prisma';
import { updateUserGamification } from '../services/gamificationService';

export const getModes = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as AuthRequest).user?.userId;

        const modes = await prisma.gamificationMode.findMany({
            where: { isActive: true },
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
        let attemptCount = 0;
        if (userId) {
            submission = await prisma.gamificationSubmission.findUnique({
                where: { userId_taskId: { userId, taskId: taskId as string } }
            });
            // Extract attempt count from response
            if (submission?.response && typeof submission.response === 'object') {
                attemptCount = (submission.response as any).attemptCount || 0;
            }
        }

        // For bug-hunter, algorithm-arena, and dev-simulator tasks, include hint info based on attempt count
        const taskData = task.taskData as any;
        const isBugHunter = task.mode?.slug === 'bug-hunter';
        const isAlgorithmArena = task.mode?.slug === 'algorithm-arena';
        const isDevSimulator = task.mode?.slug === 'dev-simulator';
        const supportsHints = isBugHunter || isAlgorithmArena || isDevSimulator;

        let hintText: string | null = null;
        let correctAnswer: string | null = null;

        if (supportsHints && !submission?.passed) {
            // After 3 attempts, provide a hint
            if (attemptCount >= 3) {
                if (taskData?.expectedKeywords?.length) {
                    hintText = `Think about using: ${taskData.expectedKeywords[0]}`;
                } else if (taskData?.correctAnswer) {
                    hintText = `The answer is related to: ${String(taskData.correctAnswer).substring(0, 10)}...`;
                }
            }
            // After 6 attempts, reveal the answer
            if (attemptCount >= 6) {
                correctAnswer = taskData?.fullAnswer || taskData?.correctAnswer || null;
            }
        }

        res.json({
            data: {
                ...task,
                userSubmission: submission,
                attemptCount,
                hintText,
                correctAnswer: correctAnswer
            }
        });
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
            where: { id: taskId as string },
            include: { mode: true }
        });

        if (!task) return res.status(404).json({ error: { message: 'Task not found' } });

        // Check if already completed
        const existing = await prisma.gamificationSubmission.findUnique({
            where: { userId_taskId: { userId, taskId: taskId as string } }
        });

        if (existing?.passed) {
            return res.json({ data: { alreadyCompleted: true, passed: true, xpEarned: 0 } });
        }

        // Get current attempt count
        let attemptCount = 0;
        if (existing?.response && typeof existing.response === 'object') {
            attemptCount = (existing.response as any).attemptCount || 0;
        }
        attemptCount += 1;

        // Evaluate answer against taskData
        const taskData = task.taskData as any;
        const isBugHunter = task.mode?.slug === 'bug-hunter';
        const isAlgorithmArena = task.mode?.slug === 'algorithm-arena';
        const supportsHints = isBugHunter || isAlgorithmArena;
        const passed = evaluateAnswer(answer, taskData, isBugHunter || isAlgorithmArena);
        const score = passed ? 100 : 0;

        const submission = await prisma.gamificationSubmission.upsert({
            where: { userId_taskId: { userId, taskId: taskId as string } },
            update: { passed, score, response: { answer, attemptCount } },
            create: { userId, taskId: taskId as string, passed, score, response: { answer, attemptCount } }
        });

        let xpEarned = 0;
        if (passed) {
            await updateUserGamification(userId, task.xpReward);
            xpEarned = task.xpReward;
        }

        // Build hint/answer info for modes that support it
        let hintText: string | null = null;
        let correctAnswer: string | null = null;

        if (supportsHints && !passed) {
            if (attemptCount >= 3) {
                if (taskData?.expectedKeywords?.length) {
                    hintText = `Think about using: ${taskData.expectedKeywords[0]}`;
                } else if (taskData?.correctAnswer) {
                    hintText = `The answer is related to: ${String(taskData.correctAnswer).substring(0, 10)}...`;
                }
            }
            if (attemptCount >= 6) {
                correctAnswer = taskData?.fullAnswer || taskData?.correctAnswer || null;
            }
        }

        const modeName = isBugHunter ? 'bug' : 'algorithm';

        res.json({
            data: {
                submission,
                passed,
                xpEarned,
                attemptCount,
                hintText,
                correctAnswer,
                feedback: passed
                    ? isBugHunter ? 'Correct! Great work! The bug has been squashed!' : 'Correct! Your algorithm works perfectly!'
                    : attemptCount >= 6
                        ? 'Not quite right. Try again!'
                        : attemptCount >= 3
                            ? 'Not quite right. A hint is now available - check above!'
                            : isBugHunter ? 'Not quite right. Review the bug report and try again.' : 'Not quite right. Review the problem and try again.'
            }
        });
    } catch (error) {
        next(error);
    }
};

function evaluateAnswer(answer: any, taskData: any, isBugHunter: boolean = false): boolean {
    if (!answer || !taskData) return false;

    const answerStr = String(answer).trim();

    // Reject empty answers
    if (answerStr.length === 0) return false;

    // Accept if user pasted the full correct answer
    if (taskData.fullAnswer) {
        const normalizeCode = (s: string) => s.replace(/\s+/g, ' ').trim().toLowerCase();
        if (normalizeCode(answerStr) === normalizeCode(taskData.fullAnswer)) return true;
        // Also pass if answer contains all significant lines of the full answer
        const fullLines = String(taskData.fullAnswer).split('\n').map((l: string) => l.trim().toLowerCase()).filter((l: string) => l.length > 0);
        const answerLower = answerStr.toLowerCase();
        const matchedLines = fullLines.filter((line: string) => answerLower.includes(line));
        if (matchedLines.length >= Math.ceil(fullLines.length * 0.8)) return true;
    }

    // For multiple-choice tasks (A, B, C, D)
    if (taskData.correctOption !== undefined) {
        return answerStr === String(taskData.correctOption);
    }

    // For tasks with exact correct answer (e.g., bug-hunter with correctAnswer)
    if (taskData.correctAnswer !== undefined) {
        const correct = String(taskData.correctAnswer).trim().toLowerCase();
        const given = answerStr.toLowerCase();
        // Exact match or contains the correct answer
        if (given === correct) return true;
        if (given.includes(correct)) return true;
    }

    // For code-based / keyword tasks
    if (taskData.expectedKeywords && Array.isArray(taskData.expectedKeywords)) {
        const answerLower = answerStr.toLowerCase();

        // For bug-hunter: more lenient â€” check if answer contains at least one keyword
        if (isBugHunter) {
            // Check if the answer contains the correct fix
            if (taskData.correctAnswer) {
                const correct = String(taskData.correctAnswer).trim().toLowerCase();
                if (answerLower.includes(correct)) return true;
            }
            // Check keywords â€” need at least 50% for bug-hunter
            const matched = taskData.expectedKeywords.filter((kw: string) => answerLower.includes(kw.toLowerCase()));
            return matched.length >= Math.ceil(taskData.expectedKeywords.length * 0.5);
        }

        // For non-bug-hunter: stricter
        if (answerStr.length < 10) return false;
        if (!/[;{}()=<>]/.test(answerStr)) return false;
        const matched = taskData.expectedKeywords.filter((kw: string) => answerLower.includes(kw.toLowerCase()));
        return matched.length >= Math.ceil(taskData.expectedKeywords.length * 0.7);
    }

    // Default: fail
    return false;
}

// ==========================================
// CHALLENGE ARENA â€” Note-based question generation
// ==========================================

interface GeneratedQuestion {
    id: number;
    question: string;
    options: string[];
    correctIndex: number;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
    xpReward: number;
    timeLimit: number; // seconds
}

// Topic-specific question templates
const QUESTION_TEMPLATES: Record<string, { questions: { q: string; options: string[]; correctIndex: number }[] }> = {
    javascript: {
        questions: [
            { q: 'What is the correct way to declare a variable in modern JavaScript?', options: ['var x = 1', 'let x = 1', 'variable x = 1', 'int x = 1'], correctIndex: 1 },
            { q: 'Which method adds an element to the end of an array?', options: ['.push()', '.pop()', '.shift()', '.unshift()'], correctIndex: 0 },
            { q: 'What does === check in JavaScript?', options: ['Value only', 'Type only', 'Value and type', 'Reference only'], correctIndex: 2 },
            { q: 'What is a closure in JavaScript?', options: ['A way to close browser tabs', 'A function with access to outer scope variables', 'A loop structure', 'A CSS property'], correctIndex: 1 },
            { q: 'What does JSON.parse() do?', options: ['Converts object to string', 'Converts string to object', 'Validates JSON', 'Creates JSON file'], correctIndex: 1 },
            { q: 'Which keyword creates an asynchronous function?', options: ['sync', 'await', 'async', 'promise'], correctIndex: 2 },
            { q: 'What is the output of typeof null?', options: ['"null"', '"undefined"', '"object"', '"boolean"'], correctIndex: 2 },
            { q: 'Which method removes the last element from an array?', options: ['.push()', '.pop()', '.shift()', '.splice()'], correctIndex: 1 },
        ]
    },
    css: {
        questions: [
            { q: 'Which CSS property makes elements flow horizontally?', options: ['display: block', 'display: flex', 'display: grid', 'position: absolute'], correctIndex: 1 },
            { q: 'What does "em" unit reference?', options: ['Root font size', 'Parent font size', 'Viewport width', 'Pixel density'], correctIndex: 1 },
            { q: 'Which has the highest CSS specificity?', options: ['.class', '#id', 'element', '* (universal)'], correctIndex: 1 },
            { q: 'How do you center a div horizontally?', options: ['margin: auto', 'text-align: center', 'float: center', 'align: center'], correctIndex: 0 },
            { q: 'Which property controls element stacking order?', options: ['order', 'z-index', 'stack', 'layer'], correctIndex: 1 },
            { q: 'What does @media (min-width: 768px) target?', options: ['Screens smaller than 768px', 'Screens 768px and wider', 'Exactly 768px', 'Print only'], correctIndex: 1 },
        ]
    },
    react: {
        questions: [
            { q: 'Which hook handles side effects in React?', options: ['useState', 'useEffect', 'useMemo', 'useRef'], correctIndex: 1 },
            { q: 'What is the virtual DOM?', options: ['A browser API', 'A lightweight copy of the real DOM', 'A CSS framework', 'A testing tool'], correctIndex: 1 },
            { q: 'How do you pass data from parent to child in React?', options: ['State', 'Props', 'Context', 'Redux'], correctIndex: 1 },
            { q: 'What does useState return?', options: ['A single value', 'An array with value and setter', 'A promise', 'An object'], correctIndex: 1 },
            { q: 'When should you use useCallback?', options: ['Always', 'To memoize functions passed as props', 'To fetch data', 'To style components'], correctIndex: 1 },
            { q: 'What causes a React component to re-render?', options: ['CSS changes', 'State or prop changes', 'HTML changes', 'URL changes'], correctIndex: 1 },
        ]
    },
    database: {
        questions: [
            { q: 'Which SQL command retrieves data?', options: ['INSERT', 'UPDATE', 'SELECT', 'DELETE'], correctIndex: 2 },
            { q: 'What does a PRIMARY KEY enforce?', options: ['Uniqueness only', 'Not null only', 'Both uniqueness and not null', 'Foreign reference'], correctIndex: 2 },
            { q: 'Which join returns only matching rows from both tables?', options: ['LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'FULL JOIN'], correctIndex: 2 },
            { q: 'What does database indexing improve?', options: ['Storage space', 'Query read speed', 'Write speed', 'Data integrity'], correctIndex: 1 },
            { q: 'What is database normalization?', options: ['Making data bigger', 'Reducing data redundancy', 'Encrypting data', 'Compressing data'], correctIndex: 1 },
            { q: 'Which type of database stores data in documents?', options: ['Relational (SQL)', 'NoSQL (MongoDB)', 'Graph (Neo4j)', 'Time-series'], correctIndex: 1 },
        ]
    },
    html: {
        questions: [
            { q: 'Which HTML element is best for navigation?', options: ['<div>', '<nav>', '<span>', '<section>'], correctIndex: 1 },
            { q: 'What does the "alt" attribute on images provide?', options: ['Styling', 'Alternative text for accessibility', 'Link target', 'Animation'], correctIndex: 1 },
            { q: 'Which is a semantic HTML element?', options: ['<div>', '<span>', '<article>', '<b>'], correctIndex: 2 },
            { q: 'What is the purpose of the <head> element?', options: ['Page content', 'Metadata and links', 'Navigation', 'Footer'], correctIndex: 1 },
            { q: 'Which input type is for email validation?', options: ['type="text"', 'type="email"', 'type="url"', 'type="validation"'], correctIndex: 1 },
        ]
    },
    api: {
        questions: [
            { q: 'Which HTTP method retrieves data?', options: ['POST', 'PUT', 'GET', 'DELETE'], correctIndex: 2 },
            { q: 'What does HTTP status 404 mean?', options: ['Success', 'Not Found', 'Server Error', 'Forbidden'], correctIndex: 1 },
            { q: 'What does REST stand for?', options: ['Real-time Exchange Standard Transfer', 'Representational State Transfer', 'Remote Service Technology', 'Resource Endpoint Standard Type'], correctIndex: 1 },
            { q: 'Which format is most common for API responses?', options: ['XML', 'JSON', 'CSV', 'YAML'], correctIndex: 1 },
            { q: 'What is CORS?', options: ['A CSS framework', 'Cross-Origin Resource Sharing', 'A database type', 'A testing tool'], correctIndex: 1 },
            { q: 'What HTTP status indicates server error?', options: ['2xx', '3xx', '4xx', '5xx'], correctIndex: 3 },
        ]
    },
    general: {
        questions: [
            { q: 'What is version control used for?', options: ['Styling', 'Tracking code changes', 'Database management', 'Networking'], correctIndex: 1 },
            { q: 'What is the purpose of a code review?', options: ['Slow down development', 'Catch bugs and share knowledge', 'Replace testing', 'Assign blame'], correctIndex: 1 },
            { q: 'What does DRY stand for?', options: ['Do Run Yearly', 'Don\'t Repeat Yourself', 'Data Request Yield', 'Debug Runtime Yield'], correctIndex: 1 },
            { q: 'What is refactoring?', options: ['Adding new features', 'Restructuring code without changing behavior', 'Deleting code', 'Testing code'], correctIndex: 1 },
            { q: 'What is technical debt?', options: ['Money owed to tech companies', 'Accumulated shortcuts that slow future development', 'Hardware costs', 'Software licenses'], correctIndex: 1 },
            { q: 'What is an IDE?', options: ['Internet Data Exchange', 'Integrated Development Environment', 'Internal Debug Engine', 'Input Device Editor'], correctIndex: 1 },
            { q: 'What is pair programming?', options: ['Two computers working together', 'Two developers working on the same code', 'Programming in two languages', 'Writing code twice'], correctIndex: 1 },
            { q: 'What does CI/CD stand for?', options: ['Code Integration/Code Delivery', 'Continuous Integration/Continuous Deployment', 'Central Interface/Central Data', 'Client Integration/Client Deployment'], correctIndex: 1 },
        ]
    }
};

function detectTopics(notes: string): string[] {
    const lower = notes.toLowerCase();
    const topics: string[] = [];
    if (/javascript|js |const |let |var |function |arrow|async|await|promise|callback|closure|prototype|dom /i.test(lower)) topics.push('javascript');
    if (/css|style|flexbox|grid|media query|selector|specificity|responsive|animation|transition/i.test(lower)) topics.push('css');
    if (/react|component|hook|usestate|useeffect|jsx|props|state|virtual dom|render/i.test(lower)) topics.push('react');
    if (/sql|database|query|table|index|join|nosql|mongodb|postgres|mysql|schema|migration/i.test(lower)) topics.push('database');
    if (/html|element|tag|semantic|attribute|form|input|div|span|head|body/i.test(lower)) topics.push('html');
    if (/api|rest|endpoint|http|request|response|json|cors|status code|fetch/i.test(lower)) topics.push('api');
    if (topics.length === 0) topics.push('general');
    return topics;
}

function generateQuestionsFromNotes(notes: string, count: number = 20): GeneratedQuestion[] {
    const topics = detectTopics(notes);
    const questions: GeneratedQuestion[] = [];
    const usedIndices: Record<string, Set<number>> = {};

    // Collect all available questions from detected topics
    const allQs: { topic: string; idx: number; q: typeof QUESTION_TEMPLATES.general.questions[0] }[] = [];
    for (const topic of topics) {
        const tpl = QUESTION_TEMPLATES[topic];
        if (tpl) {
            tpl.questions.forEach((q, idx) => allQs.push({ topic, idx, q }));
        }
    }
    // Add general questions as filler
    QUESTION_TEMPLATES.general.questions.forEach((q, idx) => allQs.push({ topic: 'general', idx, q }));

    // Shuffle
    const shuffled = allQs.sort(() => Math.random() - 0.5);

    // Pick unique questions up to count
    const seen = new Set<string>();
    for (const item of shuffled) {
        if (questions.length >= count) break;
        const key = `${item.topic}-${item.idx}`;
        if (seen.has(key)) continue;
        seen.add(key);

        const i = questions.length;
        const difficulty: 'EASY' | 'MEDIUM' | 'HARD' = i < 7 ? 'EASY' : i < 14 ? 'MEDIUM' : 'HARD';
        questions.push({
            id: i + 1,
            question: item.q.q,
            options: item.q.options,
            correctIndex: item.q.correctIndex,
            difficulty,
            xpReward: difficulty === 'EASY' ? 10 : difficulty === 'MEDIUM' ? 20 : 30,
            timeLimit: difficulty === 'EASY' ? 30 : difficulty === 'MEDIUM' ? 25 : 20
        });
    }

    // If still not enough, duplicate with variations
    while (questions.length < count) {
        const base = questions[questions.length % Math.max(questions.length, 1)];
        questions.push({ ...base, id: questions.length + 1 });
    }

    return questions;
}

export const generateChallenges = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { notes } = req.body;
        if (!notes || typeof notes !== 'string' || notes.trim().length < 10) {
            return res.status(400).json({ error: { message: 'Please provide notes with at least 10 characters.' } });
        }
        const questions = generateQuestionsFromNotes(notes, 20);
        const topics = detectTopics(notes);
        res.json({ data: { questions, topics, noteLength: notes.length } });
    } catch (error) {
        next(error);
    }
};

export const submitArenaResult = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as AuthRequest).user?.userId;
        if (!userId) return res.status(401).json({ error: { message: 'Not authenticated' } });

        const { correctCount, totalQuestions, streak, topics } = req.body;
        const correct = Number(correctCount) || 0;
        const total = Number(totalQuestions) || 20;
        const streakBonus = Number(streak) || 0;

        // Calculate XP: base per correct + streak bonus
        const baseXp = correct * 15;
        const streakXp = streakBonus * 5;
        const totalXp = baseXp + streakXp;

        if (totalXp > 0) {
            await updateUserGamification(userId, totalXp);
        }

        res.json({
            data: {
                passed: correct >= Math.ceil(total * 0.5),
                correctCount: correct,
                totalQuestions: total,
                streak: streakBonus,
                baseXp,
                streakXp,
                totalXp,
                feedback: correct >= Math.ceil(total * 0.8)
                    ? `Outstanding! ${correct}/${total} correct with ${streakBonus} streak bonus!`
                    : correct >= Math.ceil(total * 0.5)
                        ? `Good job! ${correct}/${total} correct. Keep practicing!`
                        : `${correct}/${total} correct. Review your notes and try again!`,
                topics: topics || []
            }
        });
    } catch (error) {
        next(error);
    }
};
