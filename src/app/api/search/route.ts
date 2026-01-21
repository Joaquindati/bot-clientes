import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const { keyword, city } = await request.json();

    // MOCK DATA: Simulate finding businesses
    // In production, this would call Google Maps API
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
            socials: { instagram: 'https://instagram.com/ejemplo' }
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
            socials: { facebook: 'https://facebook.com/express' }
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
            socials: {}
        }
    ];

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    return NextResponse.json({
        status: 'ok',
        results: mockResults
    });
}
