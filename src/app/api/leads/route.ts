import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.log('[GET /api/leads] Fetching leads from database...');
        const leads = await prisma.lead.findMany({
            where: {
                userId: session.user.id
            },
            orderBy: { createdAt: 'desc' }
        });

        console.log(`[GET /api/leads] Found ${leads.length} leads`);

        // Parse JSON fields (emails, socials, techStack) for frontend usage
        const parsedLeads = leads.map(lead => ({
            ...lead,
            emails: JSON.parse(lead.emails),
            socials: JSON.parse(lead.socials),
            techStack: lead.techStack ? JSON.parse(lead.techStack) : [],
            lastContactDate: lead.lastContactDate ? lead.lastContactDate.toISOString() : null,
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
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;
        console.log('[POST /api/leads] Session userId:', userId);

        // Verify user exists in database
        const userExists = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!userExists) {
            console.error('[POST /api/leads] User not found in database:', userId);
            return NextResponse.json({ error: 'User not found. Please log out and log in again.' }, { status: 401 });
        }

        console.log('[POST /api/leads] User verified:', userExists.email);
        console.log('[POST /api/leads] Received request to save lead');
        const body = await request.json();
        console.log('[POST /api/leads] Request body:', JSON.stringify(body, null, 2));

        // Validate required fields
        if (!body.place_id || !body.name || !body.address) {
            console.error('[POST /api/leads] Missing required fields:', { place_id: body.place_id, name: body.name, address: body.address });
            return NextResponse.json({ error: 'Missing required fields: place_id, name, or address' }, { status: 400 });
        }

        const {
            place_id, name, address, rating, phone, website,
            city, state, country, keyword, emails, socials, techStack, hasSsl,
            user_ratings_total, // Added to extract from search results
            // NEW: Additional fields from enhanced Google API
            economyLevel, description, notes
        } = body;

        // Check if exists
        const idAsString = String(place_id);
        console.log(`[POST /api/leads] Checking if lead exists with place_id: ${idAsString}`);

        const existing = await prisma.lead.findUnique({
            where: { place_id: idAsString }
        });

        if (existing) {
            if (existing.userId !== session.user.id) {
                // Option: Allow users to "claim" leads or save duplicate?
                // For now, if place_id is unique globally in schema, this prevents multiple people from saving same lead.
                // Schema says: place_id String @unique.
                // This means a lead can only be saved by ONE user globally.
                // To allow multi-user saving same lead, we should have made place_id NOT unique, or unique per user.
                // Given the schema change, let's stick to simple first: tell user it exists.
                // OR better: check if existing belongs to user.
                console.log(`[POST /api/leads] Lead exists globally.`);
                if (existing.userId !== session.user.id) {
                    return NextResponse.json({ error: 'Lead is already saved by another user.' }, { status: 409 });
                }
            }
            console.log(`[POST /api/leads] Lead already exists:`, existing.name);
            return NextResponse.json({ message: 'Lead already exists', lead: existing });
        }

        console.log('[POST /api/leads] Creating new lead...');

        // Ensure proper data types and handle null/undefined values
        const leadData = {
            userId: session.user.id,
            place_id: idAsString,
            name: String(name),
            address: String(address),
            rating: rating !== undefined && rating !== null ? Number(rating) : 0,
            phone: phone ? String(phone) : '',
            website: website ? String(website) : '',
            city: city ? String(city) : null,
            state: state ? String(state) : null,
            country: country ? String(country) : null,
            keyword: keyword ? String(keyword) : null,
            emails: JSON.stringify(Array.isArray(emails) ? emails : []),
            socials: JSON.stringify(socials && typeof socials === 'object' ? socials : {}),
            techStack: JSON.stringify(Array.isArray(techStack) ? techStack : []),
            hasSsl: Boolean(hasSsl),
            status: 'NEW',
            lastContactDate: null,
            // NEW: Save additional fields from Google API
            economyLevel: economyLevel !== undefined && economyLevel !== null ? Number(economyLevel) : 0,
            description: description ? String(description) : null,
            notes: notes ? String(notes) : null
        };

        console.log('[POST /api/leads] Prepared lead data:', JSON.stringify(leadData, null, 2));

        const newLead = await prisma.lead.create({
            data: leadData
        });

        console.log(`[POST /api/leads] ✅ Lead saved successfully! ID: ${newLead.id}, Name: ${newLead.name}`);
        return NextResponse.json({ message: 'Lead saved', lead: newLead });
    } catch (error) {
        console.error('[POST /api/leads] ❌ Error saving lead:', error);
        // Return more detailed error information
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const errorStack = error instanceof Error ? error.stack : undefined;
        console.error('[POST /api/leads] Error stack:', errorStack);
        return NextResponse.json({
            error: 'Failed to save lead',
            details: errorMessage,
            hint: 'Check server logs for more information'
        }, { status: 500 });
    }
}
