import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';

export const globalSearch = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { q } = req.query;
        if (!q) return res.json({ data: { courses: [], challenges: [] } });

        const searchTerm = String(q);

        const [courses, challenges] = await Promise.all([
            prisma.course.findMany({
                where: {
                    OR: [
                        { title: { contains: searchTerm, mode: 'insensitive' } },
                        { description: { contains: searchTerm, mode: 'insensitive' } }
                    ]
                },
                take: 5
            }),
            prisma.codingChallenge.findMany({
                where: {
                    OR: [
                        { title: { contains: searchTerm, mode: 'insensitive' } },
                        { description: { contains: searchTerm, mode: 'insensitive' } }
                    ]
                },
                take: 5
            })
        ]);

        res.json({
            data: {
                courses,
                challenges
            }
        });
    } catch (error) {
        next(error);
    }
};
