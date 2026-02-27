import nodemailer from 'nodemailer';
import prisma from '../config/prisma';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

/**
 * Send a notification email to a user if they have email notifications enabled.
 * This is non-blocking — errors are logged but don't propagate.
 */
export async function sendNotificationEmail(
    userId: string,
    subject: string,
    html: string
): Promise<void> {
    try {
        // Check if user has email notifications enabled
        const prefs = await prisma.notificationPreferences.findUnique({ where: { userId } });
        if (prefs && !prefs.emailEnabled) {
            return; // User has disabled email notifications
        }

        // Get user's email
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { email: true }
        });
        if (!user?.email) return;

        await transporter.sendMail({
            from: `"CodeKori" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
            to: user.email,
            subject,
            html: wrapInTemplate(subject, html),
        });
    } catch (error) {
        console.error(`Failed to send email to user ${userId}:`, error);
    }
}

/**
 * Send notification emails to multiple users.
 */
export async function sendBulkNotificationEmail(
    userIds: string[],
    subject: string,
    html: string
): Promise<void> {
    // Send in parallel, non-blocking
    await Promise.allSettled(
        userIds.map(id => sendNotificationEmail(id, subject, html))
    );
}

/**
 * Wrap email content in a styled HTML template
 */
function wrapInTemplate(subject: string, body: string): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0;padding:0;background-color:#0a0a0a;font-family:Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a;padding:40px 20px;">
            <tr>
                <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="background-color:#1a1a2e;border-radius:12px;overflow:hidden;">
                        <!-- Header -->
                        <tr>
                            <td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:24px 32px;">
                                <h1 style="margin:0;color:#fff;font-size:20px;">🚀 CodeKori</h1>
                            </td>
                        </tr>
                        <!-- Body -->
                        <tr>
                            <td style="padding:32px;">
                                <h2 style="color:#e2e8f0;margin:0 0 16px 0;font-size:18px;">${subject}</h2>
                                <div style="color:#94a3b8;font-size:14px;line-height:1.6;">
                                    ${body}
                                </div>
                            </td>
                        </tr>
                        <!-- Footer -->
                        <tr>
                            <td style="padding:16px 32px;border-top:1px solid #2d2d44;">
                                <p style="color:#64748b;font-size:12px;margin:0;text-align:center;">
                                    You received this because you have email notifications enabled on CodeKori.
                                    <br>You can disable them in Settings → Notifications.
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>`;
}
