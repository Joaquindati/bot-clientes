import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
    try {
        const leads = await prisma.lead.findMany({
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
