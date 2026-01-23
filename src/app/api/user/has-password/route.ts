import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { password: true }
        });

        return NextResponse.json({
            hasPassword: !!user?.password
        });
    } catch (error) {
        console.error('Error checking password:', error);
        return NextResponse.json({ error: 'Error interno' }, { status: 500 });
    }
}
