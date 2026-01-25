'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';

interface RecentLead {
    id: string;
    name: string;
    status: string;
    lastContactDate: string | null;
    city: string | null;
    urgencyLevel: string | null;
}

export default function RecentLeads() {
    const [leads, setLeads] = useState<RecentLead[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRecentLeads = async () => {
            try {
                const res = await fetch('/api/leads/recent');
                if (res.ok) {
                    const data = await res.json();
                    setLeads(data);
                } else if (res.status === 401) {
                    setError('Sesión expirada. Por favor, inicia sesión nuevamente.');
                } else {
                    setError('Error al cargar los leads recientes.');
                }
            } catch (error) {
                console.error('Error fetching recent leads:', error);
                setError('Error de conexión. Intenta nuevamente.');
            } finally {
                setLoading(false);
            }
        };

        fetchRecentLeads();
    }, []);

    // Check if lead has urgency (HIGH urgency or no contact in 30+ days)
    const hasUrgency = (lead: RecentLead) => {
        if (lead.urgencyLevel === 'HIGH') return true;
        if (!lead.lastContactDate) {
            // No contact date = urgent
            return true;
        }
        const date = new Date(lead.lastContactDate);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays > 30;
    };

    const getTimeSince = (dateString: string | null) => {
        if (!dateString) return 'Sin contacto';
        const date = new Date(dateString);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Hoy';
        if (diffDays === 1) return 'Ayer';
        return `Hace ${diffDays} días`;
    };

    return (
        <div className="h-full">
            <h3 className="font-semibold text-base md:text-lg mb-3 md:mb-4">Contactados Recientemente</h3>

            {loading ? (
                <div className="flex justify-center py-6 md:py-8">
                    <div className="animate-spin rounded-full h-6 w-6 md:h-8 md:w-8 border-b-2 border-blue-600"></div>
                </div>
            ) : error ? (
                <div className="text-center py-6 md:py-8">
                    <p className="text-red-500 dark:text-red-400 text-sm">{error}</p>
                </div>
            ) : leads.length === 0 ? (
                <div className="text-center py-6 md:py-8 text-gray-500 text-sm">
                    No hay leads contactados recientemente.
                </div>
            ) : (
                <div className="space-y-2 md:space-y-3">
                    {leads.map((lead) => {
                        const isUrgent = hasUrgency(lead);
                        return (
                            <Link
                                key={lead.id}
                                href={`/leads/${lead.id}`}
                                className="flex items-center justify-between p-2 md:p-3 rounded-lg border bg-gray-50 dark:bg-zinc-800/50 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                            >
                                {/* Mobile: Just name + urgency icon */}
                                <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                                    <AlertCircle
                                        className={`h-4 w-4 flex-shrink-0 ${isUrgent
                                                ? 'text-red-500'
                                                : 'text-gray-300 dark:text-gray-600'
                                            }`}
                                    />
                                    <span className="font-medium text-sm truncate">
                                        {lead.name}
                                    </span>
                                </div>

                                {/* Desktop: Show additional info */}
                                <div className="hidden md:block text-right flex-shrink-0">
                                    <p className="text-xs text-gray-500">
                                        {lead.city || 'Sin ubicación'}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        {getTimeSince(lead.lastContactDate)}
                                    </p>
                                </div>
                            </Link>
                        );
                    })}

                    <div className="pt-2 text-center">
                        <Link
                            href="/leads"
                            className="text-xs text-blue-600 hover:text-blue-700 font-medium hover:underline"
                        >
                            Ver todos →
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
