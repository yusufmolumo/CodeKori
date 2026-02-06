import nodemailer from 'nodemailer';

interface EmailPayload {
    to: string;
    name: string;
    subject: string;
    htmlContent: string;
}

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 465,
    secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export const sendEmail = async ({ to, name, subject, htmlContent }: EmailPayload): Promise<boolean> => {
    try {
        const info = await transporter.sendMail({
            from: `"${process.env.APP_NAME || 'CodeKori'}" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
            to: `"${name}" <${to}>`,
            subject,
            html: htmlContent,
        });

        console.log('Email sent successfully:', info.messageId);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};

interface TemplateEmailPayload {
    to: string;
    name: string;
    templateId: number;
    params?: Record<string, any>;
}

export const sendTemplateEmail = async ({ to, name, templateId, params }: TemplateEmailPayload): Promise<boolean> => {
    // Since we are no longer using Brevo templates, we manually construct the email based on context
    // We infer context from params
    let subject = 'Notification from CodeKori';
    let htmlContent = '<p>You have a new notification.</p>';

    if (params && params.verify_url) {
        subject = 'Welcome to CodeKori! Verify your Email';
        htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                <h2 style="color: #E05D26;">Welcome to CodeKori, ${params.username || name}!</h2>
                <p>We are thrilled to have you join our community of learners.</p>
                <p>Please verify your email address to get started by clicking the button below:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${params.verify_url}" style="background-color: #E05D26; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Email</a>
                </div>
                <p>Or copy and paste this link into your browser:</p>
                <p><a href="${params.verify_url}">${params.verify_url}</a></p>
                <p>Happy Coding!</p>
                <p>The CodeKori Team</p>
            </div>
        `;
    }

    return sendEmail({ to, name, subject, htmlContent });
};
