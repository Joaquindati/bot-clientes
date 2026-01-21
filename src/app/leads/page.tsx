'use client';

import { useEffect, useState } from 'react';
import { Download, Trash2, Mail, ExternalLink, MessageCircle } from 'lucide-react';
import { Lead, getLeads, deleteLead, updateLeadStatus } from '@/lib/storage';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function LeadsPage() {
    const [leads, setLeads] = useState<Lead[]>([]);

    useEffect(() => {
        setLeads(getLeads());
    }, []);

    const handleDelete = (placeId: string) => {
        if (confirm('¿Estás seguro de que quieres eliminar este lead?')) {
            deleteLead(placeId);
            setLeads(getLeads());
        }
    };

    const handleStatusChange = (placeId: string, status: Lead['status']) => {
        updateLeadStatus(placeId, status);
        setLeads(getLeads());
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Mis Leads</h1>
                    <p className="text-muted-foreground text-gray-500">
                        Gestiona y exporta tus clientes potenciales guardados.
                    </p>
                </div>
                <button className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none dark:bg-zinc-800 dark:border-zinc-700 dark:text-gray-300 dark:hover:bg-zinc-700">
                    <Download className="mr-2 h-4 w-4" />
                    Exportar CSV
                </button>
            </div>

            <div className="rounded-xl border bg-white shadow-sm dark:bg-zinc-900 dark:border-zinc-800 overflow-hidden">
                {leads.length === 0 ? (
                    <div className="p-12 text-center text-gray-500 flex flex-col items-center">
                        <p className="mb-4">No tienes leads guardados todavía.</p>
                        <Link
                            href="/search"
                            className="text-blue-600 hover:underline"
                        >
                            Ir al Buscador
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 dark:bg-zinc-800/50">
                                <tr>
                                    <th className="px-6 py-3 font-medium text-gray-500">Nombre</th>
                                    <th className="px-6 py-3 font-medium text-gray-500">Contacto</th>
                                    <th className="px-6 py-3 font-medium text-gray-500">Emails</th>
                                    <th className="px-6 py-3 font-medium text-gray-500">Estado</th>
                                    <th className="px-6 py-3 font-medium text-gray-500 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                                {leads.map((lead) => (
                                    <tr key={lead.place_id} className="group hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900 dark:text-gray-100">{lead.name}</div>
                                            <div className="text-xs text-gray-500 truncate max-w-[200px]">{lead.address}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                {lead.phone && <span className="text-gray-600 dark:text-gray-400 text-xs">{lead.phone}</span>}
                                                {lead.website && (
                                                    <a href={lead.website} target="_blank" rel="noreferrer" className="flex items-center text-blue-600 hover:underline text-xs">
                                                        Sitio Web <ExternalLink className="ml-1 h-3 w-3" />
                                                    </a>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {lead.emails.length > 0 ? (
                                                <div className="flex flex-col gap-1">
                                                    {lead.emails.map(email => (
                                                        <span key={email} className="inline-flex items-center text-xs text-gray-600 dark:text-gray-400">
                                                            <Mail className="mr-1 h-3 w-3" /> {email}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 text-xs">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <select
                                                value={lead.status}
                                                onChange={(e) => handleStatusChange(lead.place_id, e.target.value as any)}
                                                className={cn(
                                                    "rounded-full px-2.5 py-0.5 text-xs font-medium border-0 ring-1 ring-inset outline-none cursor-pointer appearance-none pr-6",
                                                    lead.status === 'new' && "bg-blue-50 text-blue-700 ring-blue-600/20",
                                                    lead.status === 'contacted' && "bg-yellow-50 text-yellow-700 ring-yellow-600/20",
                                                    lead.status === 'interested' && "bg-orange-50 text-orange-700 ring-orange-600/20",
                                                    lead.status === 'client' && "bg-green-50 text-green-700 ring-green-600/20",
                                                )}
                                                style={{ backgroundImage: 'none' }}
                                            >
                                                <option value="new">Nuevo</option>
                                                <option value="contacted">Contactado</option>
                                                <option value="interested">Interesado</option>
                                                <option value="client">Cliente</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors" title="Enviar WhatsApp">
                                                    <MessageCircle className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(lead.place_id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Eliminar"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
