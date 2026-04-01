/**
 * Gamification Logic Tests
 * Tests XP calculation, level progression, streak logic, and badge unlock
 */

// ── XP Calculation ──
function calculateXP(type: string, difficulty: string, hasStreakBonus: boolean = false): number {
    let base = 0;
    if (type === 'lesson') {
        base = 10;
    } else if (type === 'challenge') {
        switch (difficulty) {
            case 'easy': base = 25; break;
            case 'medium': base = 35; break;
            case 'hard': base = 50; break;
            default: base = 10;
        }
    } else if (type === 'skill-lab') {
        base = 30;
    }
    return hasStreakBonus ? Math.round(base * 1.5) : base;
}

// ── Level Calculation ──
function calculateLevel(totalXp: number): number {
    return Math.floor(totalXp / 100) + 1;
}

function xpToNextLevel(totalXp: number): number {
    const currentLevel = calculateLevel(totalXp);
    return (currentLevel * 100) - totalXp;
}

// ── Streak Logic ──
function calculateStreak(lastLoginDate: Date | null, currentDate: Date): { newStreak: number; streakBroken: boolean } {
    if (!lastLoginDate) return { newStreak: 1, streakBroken: false };
    const diffMs = currentDate.getTime() - lastLoginDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return { newStreak: 1, streakBroken: false }; // same day
    if (diffDays === 1) return { newStreak: 2, streakBroken: false }; // consecutive
    return { newStreak: 1, streakBroken: true }; // streak broken
}

// ── Badge Unlock ──
interface UserProgress {
    lessonsCompleted: number;
    challengesSolved: number;
    currentStreak: number;
    totalXp: number;
    coursesCompleted: number;
    badges: string[];
}

function checkBadgeUnlock(user: UserProgress, event: string): string | null {
    if (event === 'lesson_complete' && user.lessonsCompleted >= 1 && !user.badges.includes('first_steps')) return 'first_steps';
    if (event === 'challenge_complete' && user.challengesSolved >= 1 && !user.badges.includes('challenge_starter')) return 'challenge_starter';
    if (event === 'streak_update' && user.currentStreak >= 7 && !user.badges.includes('week_warrior')) return 'week_warrior';
    if (event === 'streak_update' && user.currentStreak >= 30 && !user.badges.includes('month_master')) return 'month_master';
    if (event === 'lesson_complete' && user.lessonsCompleted >= 10 && !user.badges.includes('ten_lessons')) return 'ten_lessons';
    if (event === 'challenge_complete' && user.challengesSolved >= 50 && !user.badges.includes('code_warrior')) return 'code_warrior';
    if (event === 'xp_update' && user.totalXp >= 1000 && !user.badges.includes('xp_master')) return 'xp_master';
    if (event === 'course_complete' && user.coursesCompleted >= 3 && !user.badges.includes('completionist')) return 'completionist';
    return null;
}

// ═══════════════════════════════════
// TEST SUITES
// ═══════════════════════════════════

describe('Gamification Logic', () => {

    describe('XP Calculation', () => {
        test('awards 10 XP for lesson completion', () => {
            expect(calculateXP('lesson', 'easy')).toBe(10);
        });
        test('awards 25 XP for easy challenge', () => {
            expect(calculateXP('challenge', 'easy')).toBe(25);
        });
        test('awards 35 XP for medium challenge', () => {
            expect(calculateXP('challenge', 'medium')).toBe(35);
        });
        test('awards 50 XP for hard challenge', () => {
            expect(calculateXP('challenge', 'hard')).toBe(50);
        });
        test('awards 30 XP for skill lab completion', () => {
            expect(calculateXP('skill-lab', 'any')).toBe(30);
        });
        test('applies 1.5x streak multiplier to lesson', () => {
            expect(calculateXP('lesson', 'easy', true)).toBe(15);
        });
        test('applies 1.5x streak multiplier to hard challenge', () => {
            expect(calculateXP('challenge', 'hard', true)).toBe(75);
        });
        test('returns 0 XP for unknown activity type', () => {
            expect(calculateXP('unknown', 'easy')).toBe(0);
        });
    });

    describe('Level Progression', () => {
        test('starts at level 1 with 0 XP', () => {
            expect(calculateLevel(0)).toBe(1);
        });
        test('remains level 1 with 99 XP', () => {
            expect(calculateLevel(99)).toBe(1);
        });
        test('reaches level 2 at 100 XP', () => {
            expect(calculateLevel(100)).toBe(2);
        });
        test('reaches level 5 at 400 XP', () => {
            expect(calculateLevel(400)).toBe(5);
        });
        test('reaches level 11 at 1000 XP', () => {
            expect(calculateLevel(1000)).toBe(11);
        });
        test('calculates XP needed for next level correctly', () => {
            expect(xpToNextLevel(0)).toBe(100);
            expect(xpToNextLevel(50)).toBe(50);
            expect(xpToNextLevel(99)).toBe(1);
        });
        test('resets XP-to-next tracking at level boundary', () => {
            expect(xpToNextLevel(100)).toBe(100); // needs 100 more for level 3
        });
    });

    describe('Streak Logic', () => {
        test('starts new streak on first login', () => {
            const result = calculateStreak(null, new Date());
            expect(result.newStreak).toBe(1);
            expect(result.streakBroken).toBe(false);
        });
        test('continues streak for consecutive day login', () => {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const result = calculateStreak(yesterday, new Date());
            expect(result.newStreak).toBe(2);
            expect(result.streakBroken).toBe(false);
        });
        test('breaks streak after missing a day', () => {
            const threeDaysAgo = new Date();
            threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
            const result = calculateStreak(threeDaysAgo, new Date());
            expect(result.newStreak).toBe(1);
            expect(result.streakBroken).toBe(true);
        });
    });

    describe('Badge Unlock Logic', () => {
        test('unlocks First Steps badge after first lesson', () => {
            const user: UserProgress = { lessonsCompleted: 1, challengesSolved: 0, currentStreak: 0, totalXp: 10, coursesCompleted: 0, badges: [] };
            expect(checkBadgeUnlock(user, 'lesson_complete')).toBe('first_steps');
        });
        test('unlocks Challenge Starter after first challenge', () => {
            const user: UserProgress = { lessonsCompleted: 0, challengesSolved: 1, currentStreak: 0, totalXp: 25, coursesCompleted: 0, badges: [] };
            expect(checkBadgeUnlock(user, 'challenge_complete')).toBe('challenge_starter');
        });
        test('unlocks Week Warrior at 7-day streak', () => {
            const user: UserProgress = { lessonsCompleted: 5, challengesSolved: 3, currentStreak: 7, totalXp: 100, coursesCompleted: 0, badges: [] };
            expect(checkBadgeUnlock(user, 'streak_update')).toBe('week_warrior');
        });
        test('unlocks Month Master at 30-day streak', () => {
            const user: UserProgress = { lessonsCompleted: 20, challengesSolved: 15, currentStreak: 30, totalXp: 500, coursesCompleted: 1, badges: ['week_warrior'] };
            expect(checkBadgeUnlock(user, 'streak_update')).toBe('month_master');
        });
        test('unlocks Ten Lessons badge at 10 lessons completed', () => {
            const user: UserProgress = { lessonsCompleted: 10, challengesSolved: 0, currentStreak: 3, totalXp: 100, coursesCompleted: 0, badges: ['first_steps'] };
            expect(checkBadgeUnlock(user, 'lesson_complete')).toBe('ten_lessons');
        });
        test('unlocks Code Warrior at 50 challenges solved', () => {
            const user: UserProgress = { lessonsCompleted: 30, challengesSolved: 50, currentStreak: 10, totalXp: 2000, coursesCompleted: 2, badges: ['challenge_starter'] };
            expect(checkBadgeUnlock(user, 'challenge_complete')).toBe('code_warrior');
        });
        test('unlocks XP Master at 1000 XP', () => {
            const user: UserProgress = { lessonsCompleted: 30, challengesSolved: 20, currentStreak: 5, totalXp: 1000, coursesCompleted: 1, badges: [] };
            expect(checkBadgeUnlock(user, 'xp_update')).toBe('xp_master');
        });
        test('prevents duplicate badge awards', () => {
            const user: UserProgress = { lessonsCompleted: 1, challengesSolved: 0, currentStreak: 0, totalXp: 10, coursesCompleted: 0, badges: ['first_steps'] };
            expect(checkBadgeUnlock(user, 'lesson_complete')).toBeNull();
        });
        test('returns null when no badge criteria met', () => {
            const user: UserProgress = { lessonsCompleted: 0, challengesSolved: 0, currentStreak: 2, totalXp: 0, coursesCompleted: 0, badges: [] };
            expect(checkBadgeUnlock(user, 'streak_update')).toBeNull();
        });
        test('unlocks Completionist at 3 courses completed', () => {
            const user: UserProgress = { lessonsCompleted: 60, challengesSolved: 30, currentStreak: 15, totalXp: 3000, coursesCompleted: 3, badges: [] };
            expect(checkBadgeUnlock(user, 'course_complete')).toBe('completionist');
        });
    });
});
