export interface Lead {
    place_id: string;
    name: string;
    address: string;
    phone: string;
    website: string | null;
    emails: string[];
    socials?: Record<string, string | undefined>;
    status: 'NEW' | 'CONTACTED' | 'INTERESTED' | 'CLIENT';
    notes: string | null;
    description?: string | null;
    city?: string;
    state?: string;
    country?: string;
    keyword?: string;
    lastContactDate?: string | null;
    economyLevel?: number;
    // Sales Intelligence
    decisionMaker?: string | null;
    decisionMakerRole?: string | null;
    estimatedCloseDate?: string | null;
    urgencyLevel?: string | null;
    painPoints?: string | null;
    leadSource?: string | null;
    bestContactTime?: string | null;
    preferredContactChannel?: string | null;
    employeeCount?: string | null;
    nextAction?: string | null;
    nextActionDate?: string | null;
    createdAt?: string;
}

export interface SearchResultLead {
    place_id: string;
    name: string;
    address: string;
    rating?: number;
    user_ratings_total?: number;
    website?: string | null;
    phone?: string;
    emails?: string[];
    socials?: Record<string, string | undefined>;
    city?: string;
    state?: string;
    country?: string;
    keyword?: string;
}

export const getLeads = async (): Promise<Lead[]> => {
    try {
        const res = await fetch('/api/leads');
        if (!res.ok) throw new Error('Failed to fetch');
        return await res.json();
    } catch (error) {
        console.error(error);
        return [];
    }
};

export const saveLead = async (lead: SearchResultLead) => {
    try {
        console.log('[saveLead] Attempting to save lead:', lead.name);
        const res = await fetch('/api/leads', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(lead)
        });

        console.log('[saveLead] Response status:', res.status);

        if (!res.ok) {
            const errorData = await res.json();
            console.error('[saveLead] Error response:', errorData);
            throw new Error('Failed to save');
        }

        const result = await res.json();
        console.log('[saveLead] ✅ Lead saved successfully:', result);
        return result;
    } catch (error) {
        console.error('[saveLead] ❌ Error:', error);
        throw error;
    }
};

export const updateLeadStatus = async (placeId: string, status: string) => {
    try {
        const res = await fetch(`/api/leads/${placeId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        return await res.json();
    } catch (error) {
        console.error(error);
    }
};

export const deleteLead = async (placeId: string) => {
    try {
        await fetch(`/api/leads/${placeId}`, { method: 'DELETE' });
    } catch (error) {
        console.error(error);
    }
};
