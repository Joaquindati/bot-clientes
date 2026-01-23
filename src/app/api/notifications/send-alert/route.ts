import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email-service';
import { render } from '@react-email/render';
import CriticalAlertEmail from '@/emails/critical-alert-template';

interface SendAlertRequest {
    userId: string;
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

// This API is called when a lead is updated to a critical state
export async function POST(request: Request) {
    try {
        const body: SendAlertRequest = await request.json();
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

        const emailHtml = await render(
            CriticalAlertEmail({
                userName: body.userName,
                lead: {
                    name: body.lead.name,
                    urgencyLevel: body.lead.urgencyLevel,
                    estimatedCloseDate: body.lead.estimatedCloseDate
                        ? new Date(body.lead.estimatedCloseDate).toLocaleDateString('es-ES')
                        : undefined,
                    nextActionDate: body.lead.nextActionDate
                        ? new Date(body.lead.nextActionDate).toLocaleDateString('es-ES')
                        : undefined,
                    reason: body.reason,
                },
                appUrl,
                leadId: body.lead.id,
            })
        );

        const result = await sendEmail({
            to: body.userEmail,
            subject: `🚨 Alerta Crítica: ${body.lead.name}`,
            html: emailHtml,
        });

        if (result.success) {
            return NextResponse.json({
                success: true,
                message: 'Alert email sent successfully',
            });
        } else {
            return NextResponse.json(
                { error: 'Failed to send alert email' },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Error sending alert:', error);
        return NextResponse.json(
            { error: 'Failed to send alert' },
            { status: 500 }
        );
    }
}
