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
            select: {
                id: true,
                name: true,
                address: true,
                city: true,
                status: true,
            },
        });

        return NextResponse.json(leads);
    } catch (error) {
        console.error('Error fetching leads for map:', error);
        return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });
    }
}
