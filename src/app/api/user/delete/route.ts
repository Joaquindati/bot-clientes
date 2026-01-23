import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function DELETE() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;

        // Delete all user data in order (respecting foreign keys)
        // 1. Delete all leads
        await prisma.lead.deleteMany({
            where: { userId }
        });

        // 2. Delete all accounts (OAuth connections)
        await prisma.account.deleteMany({
            where: { userId }
        });

        // 3. Delete all sessions
        await prisma.session.deleteMany({
            where: { userId }
        });

        // 4. Finally delete the user
        await prisma.user.delete({
            where: { id: userId }
        });

        return NextResponse.json({ success: true, message: 'Account deleted successfully' });
    } catch (error) {
        console.error('Error deleting account:', error);
        return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
    }
}
