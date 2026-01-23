import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const leads = await prisma.lead.findMany({
            where: {
                userId: session.user.id
            },
            orderBy: {
                lastContactDate: 'desc',
            },
            take: 5,
            select: {
                id: true,
                name: true,
                status: true,
                lastContactDate: true,
                city: true,
            },
        });

        return NextResponse.json(leads);
    } catch (error) {
        console.error('Error fetching recent leads:', error);
        return NextResponse.json({ error: 'Failed to fetch recent leads' }, { status: 500 });
    }
}
