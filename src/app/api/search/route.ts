import { NextResponse } from 'next/server';
import { Client } from '@googlemaps/google-maps-services-js';
import { scrapeWebsite } from '@/lib/scraper';

// Helper function to extract state and country from address
function parseAddress(address: string): { state: string | null; country: string | null } {
    if (!address) return { state: null, country: null };

    const parts = address.split(',').map(p => p.trim());

    // Usually Google Maps format: Street, City, State/Province, Country
    // Example: "Av. Pellegrini 1295, S2000BTM Rosario, Santa Fe, Argentina"
    // Example: "123 Main St, New York, NY 10001, USA"

    let state: string | null = null;
    let country: string | null = null;

    if (parts.length >= 2) {
        country = parts[parts.length - 1]; // Last part is usually country
    }

    if (parts.length >= 3) {
        // Second to last part is state/province
        state = parts[parts.length - 2];
    }

    return { state, country };
}

export async function POST(request: Request) {
    const { keyword, city, apiKey } = await request.json();
    const query = `${keyword} in ${city}`;

    // 1. MOCK MODE (If no API Key provided)
    if (!apiKey) {
        const mockResults = [
            {
                place_id: '1',
                name: `${keyword} Premium ${city}`,
                address: `Av. Principal 123, ${city}, Buenos Aires, Argentina`,
                rating: 4.8,
                user_ratings_total: 120,
                website: 'https://www.example.com',
                phone: '+1 234 567 890',
                types: [keyword.toLowerCase(), 'business'],
                emails: ['contacto@ejemplo.com'], // Simulated scraped data
                socials: { instagram: 'https://instagram.com/ejemplo' },
                city: city,
                state: 'Buenos Aires',
                country: 'Argentina',
                keyword: keyword,
                // NEW: Enhanced fields
                economyLevel: 3, // High-end
                businessStatus: 'OPERATIONAL',
                openingHours: 'Lunes: 9:00–18:00\nMartes: 9:00–18:00\nMiércoles: 9:00–18:00',
                description: 'Un establecimiento premium con excelente servicio y atención al cliente.'
            },
            {
                place_id: '2',
                name: `${keyword} Express`,
                address: `Calle Secundaria 45, ${city}, Buenos Aires, Argentina`,
                rating: 3.5,
                user_ratings_total: 45,
                website: 'http://wix-site-example.com',
                phone: '+1 987 654 321',
                types: [keyword.toLowerCase()],
                emails: [],
                socials: { facebook: 'https://facebook.com/express' },
                city: city,
                state: 'Buenos Aires',
                country: 'Argentina',
                keyword: keyword,
                // NEW: Enhanced fields
                economyLevel: 1, // Budget
                businessStatus: 'OPERATIONAL',
                openingHours: 'Lunes a Viernes: 8:00–20:00',
                description: null
            },
            {
                place_id: '3',
                name: `Dr. ${keyword} Especialista`,
                address: `Torre Médica Piso 4, ${city}, Buenos Aires, Argentina`,
                rating: 5.0,
                user_ratings_total: 12,
                website: null, // No website example
                phone: '+1 555 123 456',
                types: ['health', keyword.toLowerCase()],
                emails: [],
                socials: {},
                city: city,
                state: 'Buenos Aires',
                country: 'Argentina',
                keyword: keyword,
                // NEW: Enhanced fields
                economyLevel: 2, // Medium
                businessStatus: 'OPERATIONAL',
                openingHours: 'Lunes a Viernes: 10:00–19:00\nSábado: 10:00–14:00',
                description: 'Profesional con más de 10 años de experiencia en el rubro.'
            }
        ];

        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate delay
        return NextResponse.json({ status: 'ok', results: mockResults, mode: 'mock' });
    }

    // 2. REAL MODE (With API Key)
    try {
        const client = new Client({});

        // A. Text Search (Find places with Pagination)
        let places: Array<Record<string, unknown>> = [];
        let nextPageToken: string | undefined = undefined;

        // Loop to fetch pages until we have 50 results or no more token
        do {
            const params: Record<string, string> = { query, key: apiKey as string };
            if (nextPageToken) {
                params.pagetoken = nextPageToken;
                // Google requires a short delay before the token is valid
                await new Promise(resolve => setTimeout(resolve, 2000));
            }

            const textSearchRes = await client.textSearch({
                params,
                timeout: 10000,
            });

            if (textSearchRes.data.status !== 'OK' && textSearchRes.data.status !== 'ZERO_RESULTS') {
                throw new Error(`Google API Error: ${textSearchRes.data.status}`);
            }

            const newPlaces = textSearchRes.data.results;
            places = [...places, ...newPlaces];

            nextPageToken = textSearchRes.data.next_page_token;

        } while (nextPageToken && places.length < 50);

        const limitedPlaces = places.slice(0, 50); // Hard limit to 50 requested by user

        // B. Enrichment Loop (Parallel)
        const enrichedResults = await Promise.all(limitedPlaces.map(async (place) => {
            const address = place.formatted_address || '';
            const { state, country } = parseAddress(address);

            const finalPlace = {
                place_id: place.place_id!,
                name: place.name,
                address: address,
                rating: place.rating || 0,
                user_ratings_total: place.user_ratings_total || 0,
                website: null as string | null,
                phone: '',
                emails: [] as string[],
                socials: {} as Record<string, string | undefined>,
                city: city, // Add context for DB
                state: state, // Extracted from address
                country: country, // Extracted from address
                keyword: keyword, // Add context for DB
                // NEW: Additional fields from Google API
                types: [] as string[], // Business categories
                economyLevel: 0, // Mapped from price_level (0-4 -> 0-3)
                businessStatus: '' as string, // OPERATIONAL, CLOSED_TEMPORARILY, CLOSED_PERMANENTLY
                openingHours: null as string | null, // Opening hours text
                description: null as string | null // Editorial summary if available
            };

            // Get Place Details with expanded fields
            try {
                const detailsRes = await client.placeDetails({
                    params: {
                        place_id: place.place_id!,
                        fields: [
                            'formatted_phone_number',
                            'international_phone_number',
                            'website',
                            'type',
                            'price_level',
                            'business_status',
                            'opening_hours',
                            'editorial_summary'
                        ],
                        key: apiKey as string
                    }
                });

                if (detailsRes.data.result) {
                    const result = detailsRes.data.result;

                    // Basic contact info
                    finalPlace.website = result.website || null;
                    finalPlace.phone = result.formatted_phone_number || result.international_phone_number || '';

                    // Business types/categories
                    if (result.types) {
                        finalPlace.types = result.types as string[];
                    }

                    // Map price_level (0-4) to economyLevel (0-3)
                    // Google: 0=Free, 1=$, 2=$$, 3=$$$, 4=$$$$
                    // Our DB: 0=Not set, 1=$, 2=$$, 3=$$$
                    if (result.price_level !== undefined && result.price_level !== null) {
                        const priceLevel = result.price_level as number;
                        if (priceLevel === 0) {
                            finalPlace.economyLevel = 1; // Free = Low cost
                        } else if (priceLevel >= 1 && priceLevel <= 2) {
                            finalPlace.economyLevel = priceLevel; // 1->1, 2->2
                        } else if (priceLevel >= 3) {
                            finalPlace.economyLevel = 3; // 3 or 4 -> 3 (high)
                        }
                    }

                    // Business status
                    if (result.business_status) {
                        finalPlace.businessStatus = result.business_status as string;
                    }

                    // Opening hours (get the formatted weekday text)
                    if (result.opening_hours?.weekday_text) {
                        finalPlace.openingHours = (result.opening_hours.weekday_text as string[]).join('\n');
                    }

                    // Editorial summary as description
                    if ((result as Record<string, unknown>).editorial_summary) {
                        const summary = (result as Record<string, unknown>).editorial_summary as { overview?: string };
                        if (summary.overview) {
                            finalPlace.description = summary.overview;
                        }
                    }
                }
            } catch (e) {
                console.error(`Error fetching details for ${place.place_id}`, e);
            }

            // C. Scraping (If website exists)
            if (finalPlace.website) {
                try {
                    const scrapeData = await scrapeWebsite(finalPlace.website);
                    finalPlace.emails = scrapeData.emails;
                    finalPlace.socials = scrapeData.socials;
                } catch (scrapeError) {
                    console.error(`Scraping failed for ${finalPlace.website}`, scrapeError);
                }
            }

            return finalPlace;
        }));

        return NextResponse.json({ status: 'ok', results: enrichedResults, mode: 'real' });

    } catch (error) {
        console.error('Real Search API Error:', error);
        return NextResponse.json({ status: 'error', message: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
    }
}
