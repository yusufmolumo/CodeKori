import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { Prisma } from '@prisma/client'; // Import Prisma types
import prisma from '../config/prisma';
import { generateTokens, setRefreshTokenCookie, verifyToken } from '../utils/jwt';
import { sendEmail, sendTemplateEmail } from '../utils/email';

export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password, fullName, username } = req.body;

        // Check for existing user
        const existingUser = await prisma.user.findFirst({
            where: { OR: [{ email }, { profile: { username } }] }
        });

        if (existingUser) {
            return res.status(400).json({ error: { message: 'Email or Username already exists' } });
        }

        // Hash Password
        const passwordHash = await bcrypt.hash(password, 10);
        const verificationToken = crypto.randomBytes(32).toString('hex');

        // Transaction to create User and Profile
        const user = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            const newUser = await tx.user.create({
                data: {
                    email,
                    passwordHash,
                    verificationToken,
                    profile: {
                        create: {
                            username,
                            fullName,
                            profileVisibility: 'PUBLIC'
                        }
                    },
                    gamification: {
                        create: {}
                    },
                    notificationSettings: {
                        create: {}
                    }
                },
                include: { profile: true }
            });
            return newUser;
        });

        // Send Verification Email
        const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
        // Use Template ID 1 for Welcome/Verify (Placeholder)
        // If templateId is not set in env, fall back to basic html or just log warning (handled by helper)
        await sendTemplateEmail({
            to: email,
            name: fullName || username,
            templateId: Number(process.env.BREVO_WELCOME_TEMPLATE_ID) || 1,
            params: {
                verify_url: verifyUrl,
                username: username
            }
        });

        res.status(201).json({ message: 'Registration successful! Please check your email.', userId: user.id });
    } catch (error) {
        next(error);
    }
};

export const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { token } = req.body;
        const user = await prisma.user.findFirst({ where: { verificationToken: token } });

        if (!user) {
            return res.status(400).json({ error: { message: 'Invalid token' } });
        }

        await prisma.user.update({
            where: { id: user.id },
            data: { isVerified: true, verificationToken: null }
        });

        res.status(200).json({ message: 'Email verified successfully!' });
    } catch (error) {
        next(error);
    }
}

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password, rememberMe } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.isVerified) {
            // Note: In production you might want to obscure exact reason for security, but for now we need clarity
            if (user && !user.isVerified) return res.status(401).json({ error: { message: 'Please verify your email first.' } });
            return res.status(401).json({ error: { message: 'Invalid credentials' } });
        }

        const validPassword = await bcrypt.compare(password, user.passwordHash);
        if (!validPassword) {
            return res.status(401).json({ error: { message: 'Invalid credentials' } });
        }

        const { accessToken, refreshToken } = generateTokens(user.id, user.role);

        setRefreshTokenCookie(res, refreshToken, rememberMe);

        // Update last login
        await prisma.userGamification.update({
            where: { userId: user.id },
            data: { lastLoginDate: new Date() }
        });

        res.status(200).json({
            message: 'Login successful',
            accessToken,
            user: { id: user.id, email: user.email, role: user.role }
        });

    } catch (error) {
        next(error);
    }
}

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return res.status(200).json({ message: 'If that email is registered, we have sent a password reset link.' }); // Security best practice
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        await prisma.user.update({
            where: { id: user.id },
            data: {
                passwordResetToken: resetToken,
                passwordResetExpires: expires
            }
        });

        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
        await sendEmail({
            to: email,
            name: user.profile?.fullName || user.email,
            subject: 'Reset your CodeKori password',
            htmlContent: `<p>Click the link below to reset your password. Valid for 1 hour.</p><a href="${resetUrl}">Reset Password</a>`
        });

        res.status(200).json({ message: 'If that email is registered, we have sent a password reset link.' });
    } catch (error) {
        next(error);
    }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { token, newPassword } = req.body;

        const user = await prisma.user.findFirst({
            where: {
                passwordResetToken: token,
                passwordResetExpires: { gt: new Date() }
            }
        });

        if (!user) {
            return res.status(400).json({ error: { message: 'Invalid or expired token' } });
        }

        const passwordHash = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                passwordHash,
                passwordResetToken: null,
                passwordResetExpires: null
            }
        });

        res.status(200).json({ message: 'Password reset successful. Please login.' });
    } catch (error) {
        next(error);
    }
};
