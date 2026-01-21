import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
    try {
        console.log('[GET /api/leads] Fetching leads from database...');
        const leads = await prisma.lead.findMany({
            orderBy: { createdAt: 'desc' }
        });

        console.log(`[GET /api/leads] Found ${leads.length} leads`);

        // Parse JSON fields (emails, socials, techStack) for frontend usage
        const parsedLeads = leads.map(lead => ({
            ...lead,
            emails: JSON.parse(lead.emails),
            socials: JSON.parse(lead.socials),
            techStack: lead.techStack ? JSON.parse(lead.techStack) : [],
            scraped_data: {
                emails: JSON.parse(lead.emails),
                socials: JSON.parse(lead.socials),
                tech_stack: lead.techStack ? JSON.parse(lead.techStack) : [],
                has_ssl: lead.hasSsl,
                website_status: 'Success'
            }
        }));

        console.log('[GET /api/leads] Returning parsed leads:', parsedLeads.map(l => ({ name: l.name, place_id: l.place_id })));
        return NextResponse.json(parsedLeads);
    } catch (error) {
        console.error('[GET /api/leads] Error fetching leads:', error);
        return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        console.log('[POST /api/leads] Received request to save lead');
        const body = await request.json();
        console.log('[POST /api/leads] Request body:', JSON.stringify(body, null, 2));

        const {
            place_id, name, address, rating, phone, website,
            city, keyword, emails, socials, techStack, hasSsl
        } = body;

        // Check if exists
        const idAsString = String(place_id);
        console.log(`[POST /api/leads] Checking if lead exists with place_id: ${idAsString}`);

        const existing = await prisma.lead.findUnique({
            where: { place_id: idAsString }
        });

        if (existing) {
            console.log(`[POST /api/leads] Lead already exists:`, existing.name);
            return NextResponse.json({ message: 'Lead already exists', lead: existing });
        }

        console.log('[POST /api/leads] Creating new lead...');
        const newLead = await prisma.lead.create({
            data: {
                place_id: idAsString,
                name,
                address,
                rating: rating || 0,
                phone: phone || '',
                website: website || '',
                city: city || 'Unknown',
                keyword: keyword || 'Unknown',
                emails: JSON.stringify(emails || []),
                socials: JSON.stringify(socials || {}),
                techStack: JSON.stringify(techStack || []),
                hasSsl: hasSsl || false,
                status: 'NEW'
            }
        });

        console.log(`[POST /api/leads] ✅ Lead saved successfully! ID: ${newLead.id}, Name: ${newLead.name}`);
        return NextResponse.json({ message: 'Lead saved', lead: newLead });
    } catch (error) {
        console.error('[POST /api/leads] ❌ Error saving lead:', error);
        return NextResponse.json({ error: 'Failed to save lead' }, { status: 500 });
    }
}
