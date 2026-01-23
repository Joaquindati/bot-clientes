import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendEmail } from '@/lib/email-service';
import { render } from '@react-email/render';
import WeeklyReportEmail from '@/emails/weekly-report-template';

// This API is called by a cron job weekly (Mondays)
export async function GET(request: Request) {
    try {
        // Verify cron secret
        const authHeader = request.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        // Get all users with weekly report enabled
        const users = await prisma.user.findMany({
            where: {
                weeklyReport: true
            },
            select: {
                id: true,
                name: true,
                email: true,
            },
        });

        const results = [];

        for (const user of users) {
            // Get user's leads stats
            const totalLeads = await prisma.lead.count({
                where: { userId: user.id },
            });

            const newLeads = await prisma.lead.count({
                where: {
                    userId: user.id,
                    createdAt: {
                        gte: oneWeekAgo,
                    },
                },
            });

            const contactedLeads = await prisma.lead.count({
                where: {
                    userId: user.id,
                    lastContactDate: {
                        gte: oneWeekAgo,
                    },
                },
            });

            const byStatus = {
                NEW: await prisma.lead.count({ where: { userId: user.id, status: 'NEW' } }),
                CONTACTED: await prisma.lead.count({ where: { userId: user.id, status: 'CONTACTED' } }),
                INTERESTED: await prisma.lead.count({ where: { userId: user.id, status: 'INTERESTED' } }),
                CLIENT: await prisma.lead.count({ where: { userId: user.id, status: 'CLIENT' } }),
            };

            // Get upcoming deadlines (next 7 days)
            const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
            const upcomingDeadlines = await prisma.lead.findMany({
                where: {
                    userId: user.id,
                    estimatedCloseDate: {
                        gte: now,
                        lte: sevenDaysFromNow,
                    },
                },
                select: {
                    name: true,
                    estimatedCloseDate: true,
                },
                orderBy: {
                    estimatedCloseDate: 'asc',
                },
                take: 5,
            });

            const upcomingDeadlinesData = upcomingDeadlines.map(lead => ({
                name: lead.name,
                estimatedCloseDate: lead.estimatedCloseDate
                    ? new Date(lead.estimatedCloseDate).toLocaleDateString('es-ES')
                    : '',
                daysUntilClose: lead.estimatedCloseDate
                    ? Math.ceil((new Date(lead.estimatedCloseDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                    : 0,
            }));

            const emailHtml = await render(
                WeeklyReportEmail({
                    userName: user.name || 'Usuario',
                    stats: {
                        totalLeads,
                        newLeads,
                        contactedLeads,
                        clients: byStatus.CLIENT,
                        byStatus,
                        upcomingDeadlines: upcomingDeadlinesData,
                    },
                    appUrl,
                })
            );

            const result = await sendEmail({
                to: user.email,
                subject: '📊 Reporte Semanal - Resumen de tu actividad',
                html: emailHtml,
            });

            results.push({
                userId: user.id,
                email: user.email,
                totalLeads,
                success: result.success,
            });
        }

        return NextResponse.json({
            success: true,
            emailsSent: results.length,
            results,
        });
    } catch (error) {
        console.error('Error sending weekly reports:', error);
        return NextResponse.json(
            { error: 'Failed to send weekly reports' },
            { status: 500 }
        );
    }
}
