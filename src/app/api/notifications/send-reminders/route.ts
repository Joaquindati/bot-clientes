import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendEmail } from '@/lib/email-service';
import { render } from '@react-email/render';
import ReminderEmail from '@/emails/reminder-template';

// This API is called by a cron job daily
export async function GET(request: Request) {
    try {
        // Verify cron secret to prevent unauthorized access
        const authHeader = request.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const reminderThresholdDays = 3; // Days without contact before sending reminder
        const now = new Date();
        const thresholdDate = new Date(now.getTime() - reminderThresholdDays * 24 * 60 * 60 * 1000);

        // Get all users with email reminders enabled
        const usersQuery = await prisma.user.findMany({
            where: {
                emailReminders: true
            },
            select: {
                id: true,
                name: true,
                email: true,
                leads: {
                    where: {
                        OR: [
                            {
                                lastContactDate: {
                                    lt: thresholdDate,
                                },
                            },
                            {
                                lastContactDate: null,
                                createdAt: {
                                    lt: thresholdDate,
                                },
                            },
                        ],
                        status: {
                            not: 'CLIENT', // Don't remind about clients
                        },
                    },
                    select: {
                        id: true,
                        name: true,
                        lastContactDate: true,
                        createdAt: true,
                    },
                },
            },
        });

        const results = [];

        for (const user of usersQuery) {
            // Check if user has email reminders enabled (from localStorage settings)
            // For now, we'll send to all users. In production, you'd store settings in DB
            if (user.leads.length === 0) continue;

            const leadsData = user.leads.map(lead => {
                const referenceDate = lead.lastContactDate || lead.createdAt;
                const daysSinceContact = Math.floor(
                    (now.getTime() - new Date(referenceDate).getTime()) / (1000 * 60 * 60 * 24)
                );

                return {
                    name: lead.name,
                    lastContactDate: lead.lastContactDate
                        ? new Date(lead.lastContactDate).toLocaleDateString('es-ES')
                        : null,
                    daysSinceContact,
                };
            });

            const emailHtml = await render(
                ReminderEmail({
                    userName: user.name || 'Usuario',
                    leads: leadsData,
                    appUrl,
                })
            );

            const result = await sendEmail({
                to: user.email,
                subject: `🔔 Recordatorio: ${leadsData.length} lead${leadsData.length > 1 ? 's' : ''} ${leadsData.length > 1 ? 'requieren' : 'requiere'} seguimiento`,
                html: emailHtml,
            });

            results.push({
                userId: user.id,
                email: user.email,
                leadsCount: leadsData.length,
                success: result.success,
            });
        }

        return NextResponse.json({
            success: true,
            emailsSent: results.length,
            results,
        });
    } catch (error) {
        console.error('Error sending reminders:', error);
        return NextResponse.json(
            { error: 'Failed to send reminders' },
            { status: 500 }
        );
    }
}
