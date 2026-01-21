import { NextResponse } from 'next/server';
import { Client } from '@googlemaps/google-maps-services-js';
import { scrapeWebsite } from '@/lib/scraper';

export async function POST(request: Request) {
    const { keyword, city, apiKey } = await request.json();
    const query = `${keyword} in ${city}`;

    // 1. MOCK MODE (If no API Key provided)
    if (!apiKey) {
        const mockResults = [
            {
                place_id: '1',
                name: `${keyword} Premium ${city}`,
                address: `Av. Principal 123, ${city}`,
                rating: 4.8,
                user_ratings_total: 120,
                website: 'https://www.example.com',
                phone: '+1 234 567 890',
                types: [keyword.toLowerCase(), 'business'],
                emails: ['contacto@ejemplo.com'], // Simulated scraped data
                socials: { instagram: 'https://instagram.com/ejemplo' },
                city: city,
                keyword: keyword
            },
            {
                place_id: '2',
                name: `${keyword} Express`,
                address: `Calle Secundaria 45, ${city}`,
                rating: 3.5,
                user_ratings_total: 45,
                website: 'http://wix-site-example.com',
                phone: '+1 987 654 321',
                types: [keyword.toLowerCase()],
                emails: [],
                socials: { facebook: 'https://facebook.com/express' },
                city: city,
                keyword: keyword
            },
            {
                place_id: '3',
                name: `Dr. ${keyword} Especialista`,
                address: `Torre Médica Piso 4, ${city}`,
                rating: 5.0,
                user_ratings_total: 12,
                website: null, // No website example
                phone: '+1 555 123 456',
                types: ['health', keyword.toLowerCase()],
                emails: [],
                socials: {},
                city: city,
                keyword: keyword
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
            const finalPlace = {
                place_id: place.place_id!,
                name: place.name,
                address: place.formatted_address || '',
                rating: place.rating || 0,
                user_ratings_total: place.user_ratings_total || 0,
                website: null as string | null,
                phone: '',
                emails: [] as string[],
                socials: {} as Record<string, string | undefined>,
                city: city, // Add context for DB
                keyword: keyword // Add context for DB
            };

            // Get Place Details (Phone & Website often missing in Text Search)
            try {
                const detailsRes = await client.placeDetails({
                    params: {
                        place_id: place.place_id!,
                        fields: ['formatted_phone_number', 'website'],
                        key: apiKey as string
                    }
                });

                if (detailsRes.data.result) {
                    finalPlace.website = detailsRes.data.result.website || null;
                    finalPlace.phone = detailsRes.data.result.formatted_phone_number || '';
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
