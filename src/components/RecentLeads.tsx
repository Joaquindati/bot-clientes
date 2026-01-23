'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Clock, CheckCircle2, User, Phone } from 'lucide-react';

interface RecentLead {
    id: string;
    name: string;
    status: string;
    lastContactDate: string | null;
    city: string | null;
}

const STATUS_ICONS = {
    NEW: <User className="h-4 w-4 text-blue-500" />,
    CONTACTED: <Phone className="h-4 w-4 text-yellow-500" />,
    INTERESTED: <CheckCircle2 className="h-4 w-4 text-green-500" />,
    CLIENT: <CheckCircle2 className="h-4 w-4 text-purple-500" />,
};

export default function RecentLeads() {
    const [leads, setLeads] = useState<RecentLead[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecentLeads = async () => {
            try {
                const res = await fetch('/api/leads/recent');
                if (res.ok) {
                    const data = await res.json();
                    setLeads(data);
                }
            } catch (error) {
                console.error('Error fetching recent leads:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecentLeads();
    }, []);

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
            <h3 className="font-semibold text-lg mb-4">Contactados Recientemente</h3>

            {loading ? (
                <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            ) : leads.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                    No hay leads contactados recientemente.
                </div>
            ) : (
                <div className="space-y-3">
                    {leads.map((lead) => (
                        <div
                            key={lead.id}
                            className="flex items-center justify-between p-3 rounded-lg border bg-gray-50 dark:bg-zinc-800/50 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-full bg-white dark:bg-zinc-900 border dark:border-zinc-700 shadow-sm">
                                    {STATUS_ICONS[lead.status as keyof typeof STATUS_ICONS] || <User className="h-4 w-4 text-gray-400" />}
                                </div>
                                <div>
                                    <Link href={`/leads/${lead.id}`} className="font-medium text-sm hover:underline hover:text-blue-600 block">
                                        {lead.name}
                                    </Link>
                                    <p className="text-xs text-gray-500">
                                        {lead.city || 'Ubicación desconocida'} • {lead.status}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="flex items-center justify-end text-xs text-gray-500 mb-1">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {getTimeSince(lead.lastContactDate)}
                                </div>
                            </div>
                        </div>
                    ))}

                    <div className="pt-2 text-center">
                        <Link
                            href="/leads"
                            className="text-xs text-blue-600 hover:text-blue-700 font-medium hover:underline"
                        >
                            Ver todos los leads →
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
