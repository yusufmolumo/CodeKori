import prisma from '../config/prisma';

export const updateUserGamification = async (userId: string, xpToAdd: number) => {
    const gamification = await prisma.userGamification.findUnique({
        where: { userId }
    });

    if (!gamification) return null;

    const now = new Date();
    const lastLogin = gamification.lastLoginDate;

    let newStreak = gamification.currentStreak;
    let newLongestStreak = gamification.longestStreak;

    if (lastLogin) {
        const diffInMs = now.getTime() - lastLogin.getTime();
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

        if (diffInDays === 1) {
            // Consecutive day
            newStreak += 1;
        } else if (diffInDays > 1) {
            // Streak broken
            newStreak = 1;
        } else if (diffInDays === 0) {
            // Same day, keep streak as is but ensure it's at least 1 if they did something
            if (newStreak === 0) newStreak = 1;
        }
    } else {
        newStreak = 1;
    }

    if (newStreak > newLongestStreak) {
        newLongestStreak = newStreak;
    }

    const newTotalXp = gamification.totalXp + xpToAdd;
    const newLevel = Math.floor(newTotalXp / 1000) + 1;

    return await prisma.userGamification.update({
        where: { userId },
        data: {
            totalXp: newTotalXp,
            level: newLevel,
            currentStreak: newStreak,
            longestStreak: newLongestStreak,
            lastLoginDate: now
        }
    });
};
