import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
    try {
        const now = new Date();
        const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        // 1. Clientes sin contacto hace más de 1 mes
        const leadsNoContactCount = await prisma.lead.count({
            where: {
                OR: [
                    { lastContactDate: null },
                    { lastContactDate: { lt: oneMonthAgo } }
                ]
            }
        });

        // 2. Clientes con cierre urgente (estimatedCloseDate < 1 semana)
        const urgentCloseCount = await prisma.lead.count({
            where: {
                estimatedCloseDate: {
                    gte: now,
                    lte: oneWeekFromNow
                }
            }
        });

        // 3. Última búsqueda realizada (lead más reciente)
        const lastSearch = await prisma.lead.findFirst({
            orderBy: { createdAt: 'desc' },
            select: {
                keyword: true,
                city: true,
                createdAt: true
            }
        });

        // 4. Cliente que requiere más urgencia (urgencyLevel HIGH + próxima acción cercana)
        const mostUrgentLead = await prisma.lead.findFirst({
            where: {
                urgencyLevel: 'HIGH'
            },
            orderBy: [
                { nextActionDate: 'asc' },
                { estimatedCloseDate: 'asc' }
            ],
            select: {
                id: true,
                place_id: true,
                name: true,
                urgencyLevel: true,
                nextActionDate: true,
                estimatedCloseDate: true
            }
        });

        return NextResponse.json({
            leadsNoContact: leadsNoContactCount,
            urgentCloseCount: urgentCloseCount,
            lastSearch: lastSearch ? {
                keyword: lastSearch.keyword || 'Sin especificar',
                city: lastSearch.city || 'Sin especificar',
                date: lastSearch.createdAt
            } : null,
            mostUrgentLead: mostUrgentLead ? {
                id: mostUrgentLead.place_id,
                name: mostUrgentLead.name,
                nextActionDate: mostUrgentLead.nextActionDate,
                estimatedCloseDate: mostUrgentLead.estimatedCloseDate
            } : null
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch dashboard stats' },
            { status: 500 }
        );
    }
}
