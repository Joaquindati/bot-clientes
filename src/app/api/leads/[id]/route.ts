import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { sendLeadAlertEmail } from '@/lib/email-service';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        const lead = await prisma.lead.findUnique({
            where: { place_id: id }
        });

        if (!lead) {
            return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
        }

        // Verify ownership
        if (lead.userId !== session.user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Parse JSON fields
        const parsedLead = {
            ...lead,
            emails: JSON.parse(lead.emails),
            socials: JSON.parse(lead.socials),
            techStack: lead.techStack ? JSON.parse(lead.techStack) : [],
            lastContactDate: lead.lastContactDate ? lead.lastContactDate.toISOString() : null,
            estimatedCloseDate: lead.estimatedCloseDate ? lead.estimatedCloseDate.toISOString() : null,
            nextActionDate: lead.nextActionDate ? lead.nextActionDate.toISOString() : null
        };

        return NextResponse.json(parsedLead);
    } catch (error) {
        console.error('Error fetching lead:', error);
        return NextResponse.json({ error: 'Failed to fetch lead' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        // Verify existence and ownership first
        const lead = await prisma.lead.findUnique({
            where: { place_id: id }
        });

        if (!lead) {
            return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
        }

        if (lead.userId !== session.user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        await prisma.lead.delete({
            where: { place_id: id }
        });

        return NextResponse.json({ message: 'Lead deleted' });
    } catch (error) {
        console.error('Error deleting lead:', error);
        return NextResponse.json({ error: 'Failed to delete lead' }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        // Verify existence and ownership
        const lead = await prisma.lead.findUnique({
            where: { place_id: id }
        });

        if (!lead) {
            return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
        }

        if (lead.userId !== session.user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await request.json();

        // Prepare update data
        const updateData: any = {};

        // Handle simple fields
        if (body.name !== undefined) updateData.name = body.name;
        if (body.address !== undefined) updateData.address = body.address;
        if (body.phone !== undefined) updateData.phone = body.phone;
        if (body.website !== undefined) updateData.website = body.website;
        if (body.city !== undefined) updateData.city = body.city;
        if (body.state !== undefined) updateData.state = body.state;
        if (body.country !== undefined) updateData.country = body.country;
        if (body.keyword !== undefined) updateData.keyword = body.keyword;
        if (body.rating !== undefined) updateData.rating = body.rating;
        if (body.status !== undefined) updateData.status = body.status;
        if (body.notes !== undefined) updateData.notes = body.notes;
        if (body.description !== undefined) updateData.description = body.description;
        if (body.hasSsl !== undefined) updateData.hasSsl = body.hasSsl;
        if (body.lastContactDate !== undefined) updateData.lastContactDate = body.lastContactDate ? new Date(body.lastContactDate) : null;
        if (body.economyLevel !== undefined) updateData.economyLevel = body.economyLevel;

        // Sales Intelligence fields
        if (body.decisionMaker !== undefined) updateData.decisionMaker = body.decisionMaker;
        if (body.decisionMakerRole !== undefined) updateData.decisionMakerRole = body.decisionMakerRole;
        if (body.estimatedCloseDate !== undefined) updateData.estimatedCloseDate = body.estimatedCloseDate ? new Date(body.estimatedCloseDate) : null;
        if (body.urgencyLevel !== undefined) updateData.urgencyLevel = body.urgencyLevel;
        if (body.painPoints !== undefined) updateData.painPoints = body.painPoints;
        if (body.leadSource !== undefined) updateData.leadSource = body.leadSource;
        if (body.bestContactTime !== undefined) updateData.bestContactTime = body.bestContactTime;
        if (body.preferredContactChannel !== undefined) updateData.preferredContactChannel = body.preferredContactChannel;
        if (body.employeeCount !== undefined) updateData.employeeCount = body.employeeCount;
        if (body.nextAction !== undefined) updateData.nextAction = body.nextAction;
        if (body.nextActionDate !== undefined) updateData.nextActionDate = body.nextActionDate ? new Date(body.nextActionDate) : null;

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

        // Check for critical alerts
        try {
            // Trigger if urgency changed to HIGH or if it is HIGH and status changed
            // For now, let's trigger on urgency change to HIGH
            const isHighUrgency = updateData.urgencyLevel === 'HIGH';
            const wasHighUrgency = lead.urgencyLevel === 'HIGH';

            if (isHighUrgency && !wasHighUrgency) {
                // Fetch user settings for alerts
                const userSettings = await prisma.user.findUnique({
                    where: { id: session.user.id },
                    select: { leadAlerts: true, name: true, email: true }
                });

                if (userSettings?.leadAlerts) {
                    await sendLeadAlertEmail({
                        userEmail: userSettings.email,
                        userName: userSettings.name || 'Usuario',
                        lead: {
                            ...updatedLead,
                            urgencyLevel: updatedLead.urgencyLevel || undefined,
                        },
                        reason: 'El nivel de urgencia ha cambiado a ALTO'
                    });
                }
            }
        } catch (alertError) {
            console.error('Error sending alert email:', alertError);
            // Don't fail the request if email fails
        }

        // Parse JSON fields for response
        const parsedLead = {
            ...updatedLead,
            emails: JSON.parse(updatedLead.emails),
            socials: JSON.parse(updatedLead.socials),
            techStack: updatedLead.techStack ? JSON.parse(updatedLead.techStack) : [],
            lastContactDate: updatedLead.lastContactDate ? updatedLead.lastContactDate.toISOString() : null,
            estimatedCloseDate: updatedLead.estimatedCloseDate ? updatedLead.estimatedCloseDate.toISOString() : null,
            nextActionDate: updatedLead.nextActionDate ? updatedLead.nextActionDate.toISOString() : null
        };

        return NextResponse.json({ message: 'Lead updated', lead: parsedLead });
    } catch (error) {
        console.error('Error updating lead:', error);
        return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 });
    }
}
