import jwt from 'jsonwebtoken';
import { Response } from 'express';

interface TokenPayload {
    userId: string;
    role: string;
}

export const generateTokens = (userId: string, role: string) => {
    const accessToken = jwt.sign({ userId, role }, process.env.JWT_SECRET!, {
        expiresIn: '1h',
    });

    const refreshToken = jwt.sign({ userId, role }, process.env.JWT_REFRESH_SECRET!, {
        expiresIn: '7d', // Default 7 days
    });

    return { accessToken, refreshToken };
};

export const verifyToken = (token: string, secret: string): TokenPayload => {
    return jwt.verify(token, secret) as TokenPayload;
};

export const setRefreshTokenCookie = (res: Response, token: string, rememberMe: boolean = false) => {
    const expiresIn = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000; // 30 days vs 7 days

    res.cookie('refreshToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: expiresIn,
    });
};
