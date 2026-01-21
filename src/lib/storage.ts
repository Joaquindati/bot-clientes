export interface Lead {
    place_id: string;
    name: string;
    address: string;
    phone: string;
    website: string | null;
    emails: string[];
    status: 'new' | 'contacted' | 'interested' | 'client';
    notes: string;
    savedAt: string;
}

const STORAGE_KEY = 'maps-bot-leads';

export const getLeads = (): Lead[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
};

export const saveLead = (lead: Omit<Lead, 'savedAt' | 'status' | 'notes'>) => {
    const leads = getLeads();
    if (leads.some(l => l.place_id === lead.place_id)) return;

    const newLead: Lead = {
        ...lead,
        status: 'new',
        notes: '',
        savedAt: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify([newLead, ...leads]));
    return newLead;
};

export const updateLeadStatus = (placeId: string, status: Lead['status']) => {
    const leads = getLeads();
    const updated = leads.map(l => l.place_id === placeId ? { ...l, status } : l);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};

export const deleteLead = (placeId: string) => {
    const leads = getLeads();
    const filtered = leads.filter(l => l.place_id !== placeId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};
