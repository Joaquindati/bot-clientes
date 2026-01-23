import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

// GET user preferences
export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                emailReminders: true,
                weeklyReport: true,
                leadAlerts: true
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error('Error fetching preferences:', error);
        return NextResponse.json({ error: 'Failed to fetch preferences' }, { status: 500 });
    }
}

// UPDATE user preferences
export async function PATCH(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        // Validate fields
        const updateData: any = {};
        if (typeof body.emailReminders === 'boolean') updateData.emailReminders = body.emailReminders;
        if (typeof body.weeklyReport === 'boolean') updateData.weeklyReport = body.weeklyReport;
        if (typeof body.leadAlerts === 'boolean') updateData.leadAlerts = body.leadAlerts;

        const user = await prisma.user.update({
            where: { id: session.user.id },
            data: updateData,
            select: {
                emailReminders: true,
                weeklyReport: true,
                leadAlerts: true
            }
        });

        return NextResponse.json(user);
    } catch (error) {
        console.error('Error updating preferences:', error);
        return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 });
    }
}
