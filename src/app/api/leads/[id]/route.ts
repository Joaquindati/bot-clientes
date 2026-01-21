import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = await params;

        const lead = await prisma.lead.findUnique({
            where: { place_id: id }
        });

        if (!lead) {
            return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
        }

        // Parse JSON fields
        const parsedLead = {
            ...lead,
            emails: JSON.parse(lead.emails),
            socials: JSON.parse(lead.socials),
            techStack: lead.techStack ? JSON.parse(lead.techStack) : []
        };

        return NextResponse.json(parsedLead);
    } catch (error) {
        console.error('Error fetching lead:', error);
        return NextResponse.json({ error: 'Failed to fetch lead' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = await params; // Next.js 15+ needs await for params

        await prisma.lead.delete({
            where: { place_id: id } // Using place_id for frontend compatibility initially, or ID? Frontend sends place_id.
        });

        return NextResponse.json({ message: 'Lead deleted' });
    } catch (error) {
        console.error('Error deleting lead:', error);
        return NextResponse.json({ error: 'Failed to delete lead' }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        // Prepare update data
        const updateData: any = {};

        // Handle simple fields
        if (body.name !== undefined) updateData.name = body.name;
        if (body.address !== undefined) updateData.address = body.address;
        if (body.phone !== undefined) updateData.phone = body.phone;
        if (body.website !== undefined) updateData.website = body.website;
        if (body.city !== undefined) updateData.city = body.city;
        if (body.keyword !== undefined) updateData.keyword = body.keyword;
        if (body.rating !== undefined) updateData.rating = body.rating;
        if (body.status !== undefined) updateData.status = body.status;
        if (body.notes !== undefined) updateData.notes = body.notes;
        if (body.hasSsl !== undefined) updateData.hasSsl = body.hasSsl;

        // Handle JSON fields
        if (body.emails !== undefined) {
            updateData.emails = JSON.stringify(body.emails);
        }
        if (body.socials !== undefined) {
            updateData.socials = JSON.stringify(body.socials);
        }
        if (body.techStack !== undefined) {
            updateData.techStack = JSON.stringify(body.techStack);
        }

        const updatedLead = await prisma.lead.update({
            where: { place_id: id },
            data: updateData
        });

        // Parse JSON fields for response
        const parsedLead = {
            ...updatedLead,
            emails: JSON.parse(updatedLead.emails),
            socials: JSON.parse(updatedLead.socials),
            techStack: updatedLead.techStack ? JSON.parse(updatedLead.techStack) : []
        };

        return NextResponse.json({ message: 'Lead updated', lead: parsedLead });
    } catch (error) {
        console.error('Error updating lead:', error);
        return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 });
    }
}
