import { Resend } from 'resend';

import { render } from '@react-email/render';
import CriticalAlertEmail from '@/emails/critical-alert-template';

// Initialize Resend lazily or check inside functions
const resend = process.env.RESEND_API_KEY
    ? new Resend(process.env.RESEND_API_KEY)
    : null;

export const emailConfig = {
    from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
    replyTo: process.env.EMAIL_REPLY_TO || 'noreply@example.com',
};

interface SendEmailParams {
    to: string;
    subject: string;
    html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
    if (!resend) {
        console.warn('RESEND_API_KEY is not defined. Email sending is disabled.');
        return { success: false, error: 'RESEND_API_KEY missing' };
    }

    try {
        const data = await resend.emails.send({
            from: emailConfig.from,
            to: [to],
            subject,
            html,
        });

        return { success: true, data };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error };
    }
}


interface AlertEmailParams {
    userEmail: string;
    userName: string;
    lead: {
        id: string;
        name: string;
        urgencyLevel?: string;
        estimatedCloseDate?: string;
        nextActionDate?: string;
    };
    reason: string;
}

export async function sendLeadAlertEmail({ userEmail, userName, lead, reason }: AlertEmailParams) {
    try {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

        const emailHtml = await render(
            CriticalAlertEmail({
                userName,
                lead: {
                    name: lead.name,
                    urgencyLevel: lead.urgencyLevel,
                    estimatedCloseDate: lead.estimatedCloseDate
                        ? new Date(lead.estimatedCloseDate).toLocaleDateString('es-ES')
                        : undefined,
                    nextActionDate: lead.nextActionDate
                        ? new Date(lead.nextActionDate).toLocaleDateString('es-ES')
                        : undefined,
                    reason,
                },
                appUrl,
                leadId: lead.id,
            })
        );

        return await sendEmail({
            to: userEmail,
            subject: `🚨 Alerta Crítica: ${lead.name}`,
            html: emailHtml,
        });
    } catch (error) {
        console.error('Error rendering/sending alert email:', error);
        return { success: false, error };
    }
}

export { resend };
