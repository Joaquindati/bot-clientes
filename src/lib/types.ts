export interface SocialLinks {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    twitter?: string;
    whatsapp_link?: string;
}

export interface ScrapedData {
    emails: string[];
    socials: SocialLinks;
    tech_stack: string[];
    has_ssl: boolean;
    website_status: 'Success' | 'Failed' | 'No URL';
}

export interface Lead {
    id: string;
    name: string;
    address: string;
    rating?: number;
    phone?: string;
    website?: string;
    google_maps_link: string;
    city: string;
    search_term: string;
    scraped_data: ScrapedData;
    lead_status: 'New' | 'Contacted' | 'Interested' | 'Client' | 'Rejected';
    created_at: string;
}
