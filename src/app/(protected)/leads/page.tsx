'use client';

import { useEffect, useState } from 'react';
import { Download, Trash2, MessageCircle, Sparkles, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Lead, getLeads, deleteLead, updateLeadStatus } from '@/lib/storage';
import { cn } from '@/lib/utils';
import Link from 'next/link';

import { PitchGenerator } from '@/components/PitchGenerator';

type SortField = 'name' | 'keyword' | 'city' | 'state' | 'country' | 'website' | 'economyLevel' | 'lastContactDate' | 'status';
type SortDirection = 'asc' | 'desc' | null;

export default function LeadsPage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [sortField, setSortField] = useState<SortField | null>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>(null);

    useEffect(() => {
        const fetchLeads = async () => {
            try {
                const data = await getLeads();
                setLeads(data);
            } catch (error) {
                console.error("Failed to load leads", error);
            }
        };
        fetchLeads();
    }, []);

    const handleDelete = async (placeId: string) => {
        if (confirm('¿Estás seguro de que quieres eliminar este lead?')) {
            await deleteLead(placeId);
            const data = await getLeads();
            setLeads(data);
        }
    };

    const [selectedLeadForPitch, setSelectedLeadForPitch] = useState<Lead | null>(null);

    const handleStatusChange = async (placeId: string, status: Lead['status']) => {
        await updateLeadStatus(placeId, status);
        // Optimistic update or refetch
        const data = await getLeads();
        setLeads(data);
    };

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            // Toggle direction: asc -> desc -> null
            if (sortDirection === 'asc') {
                setSortDirection('desc');
            } else if (sortDirection === 'desc') {
                setSortDirection(null);
                setSortField(null);
            }
        } else {
            // New field, start with asc
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const getSortedLeads = () => {
        if (!sortField || !sortDirection) {
            return leads;
        }

        return [...leads].sort((a, b) => {
            let aValue: any = a[sortField];
            let bValue: any = b[sortField];

            // Handle null/undefined values
            if (aValue === null || aValue === undefined) aValue = '';
            if (bValue === null || bValue === undefined) bValue = '';

            // Special handling for different field types
            if (sortField === 'lastContactDate') {
                aValue = aValue ? new Date(aValue).getTime() : 0;
                bValue = bValue ? new Date(bValue).getTime() : 0;
            } else if (sortField === 'economyLevel') {
                aValue = aValue || 0;
                bValue = bValue || 0;
            } else if (sortField === 'website') {
                aValue = aValue ? 1 : 0;
                bValue = bValue ? 1 : 0;
            } else if (typeof aValue === 'string') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }

            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    };

    const SortIcon = ({ field }: { field: SortField }) => {
        if (sortField !== field) {
            return <ArrowUpDown className="h-4 w-4 opacity-0 group-hover:opacity-50 transition-opacity" />;
        }
        if (sortDirection === 'asc') {
            return <ArrowUp className="h-4 w-4" />;
        }
        return <ArrowDown className="h-4 w-4" />;
    };

    const sortedLeads = getSortedLeads();

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
                                    <th
                                        className="px-6 py-3 font-medium text-gray-500 cursor-pointer select-none group hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                                        onClick={() => handleSort('name')}
                                    >
                                        <div className="flex items-center gap-2">
                                            Nombre
                                            <SortIcon field="name" />
                                        </div>
                                    </th>
                                    <th
                                        className="px-6 py-3 font-medium text-gray-500 cursor-pointer select-none group hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                                        onClick={() => handleSort('keyword')}
                                    >
                                        <div className="flex items-center gap-2">
                                            Rubro
                                            <SortIcon field="keyword" />
                                        </div>
                                    </th>
                                    <th
                                        className="px-6 py-3 font-medium text-gray-500 cursor-pointer select-none group hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                                        onClick={() => handleSort('city')}
                                    >
                                        <div className="flex items-center gap-2">
                                            Ciudad
                                            <SortIcon field="city" />
                                        </div>
                                    </th>
                                    <th
                                        className="px-6 py-3 font-medium text-gray-500 cursor-pointer select-none group hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                                        onClick={() => handleSort('state')}
                                    >
                                        <div className="flex items-center gap-2">
                                            Estado/Provincia
                                            <SortIcon field="state" />
                                        </div>
                                    </th>
                                    <th
                                        className="px-6 py-3 font-medium text-gray-500 cursor-pointer select-none group hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                                        onClick={() => handleSort('country')}
                                    >
                                        <div className="flex items-center gap-2">
                                            País
                                            <SortIcon field="country" />
                                        </div>
                                    </th>
                                    <th
                                        className="px-6 py-3 font-medium text-gray-500 cursor-pointer select-none group hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                                        onClick={() => handleSort('website')}
                                    >
                                        <div className="flex items-center gap-2">
                                            Web
                                            <SortIcon field="website" />
                                        </div>
                                    </th>
                                    <th
                                        className="px-6 py-3 font-medium text-gray-500 cursor-pointer select-none group hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                                        onClick={() => handleSort('economyLevel')}
                                    >
                                        <div className="flex items-center gap-2">
                                            Nivel Econ.
                                            <SortIcon field="economyLevel" />
                                        </div>
                                    </th>
                                    <th
                                        className="px-6 py-3 font-medium text-gray-500 cursor-pointer select-none group hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                                        onClick={() => handleSort('lastContactDate')}
                                    >
                                        <div className="flex items-center gap-2">
                                            Último Contacto
                                            <SortIcon field="lastContactDate" />
                                        </div>
                                    </th>
                                    <th
                                        className="px-6 py-3 font-medium text-gray-500 cursor-pointer select-none group hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                                        onClick={() => handleSort('status')}
                                    >
                                        <div className="flex items-center gap-2">
                                            Estado
                                            <SortIcon field="status" />
                                        </div>
                                    </th>
                                    <th className="px-6 py-3 font-medium text-gray-500 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                                {sortedLeads.map((lead) => (
                                    <tr key={lead.place_id} className="group hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                                        <td className="px-6 py-4">
                                            <Link href={`/leads/${lead.place_id}`} className="block">
                                                <div className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline">
                                                    {lead.name}
                                                </div>
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-gray-600 dark:text-gray-400 text-xs">
                                                {lead.keyword || '-'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-gray-600 dark:text-gray-400 text-xs">
                                                {lead.city || '-'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-gray-600 dark:text-gray-400 text-xs">
                                                {lead.state || '-'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-gray-600 dark:text-gray-400 text-xs">
                                                {lead.country || '-'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                                                lead.website
                                                    ? "bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20 dark:bg-green-900/20 dark:text-green-400"
                                                    : "bg-gray-50 text-gray-600 ring-1 ring-inset ring-gray-500/20 dark:bg-gray-800/20 dark:text-gray-400"
                                            )}>
                                                {lead.website ? 'Sí' : 'No'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-0.5">
                                                {[1, 2, 3].map((level) => (
                                                    <span
                                                        key={level}
                                                        className={`text-sm ${
                                                            (lead.economyLevel || 0) >= level
                                                                ? 'text-green-600 dark:text-green-400'
                                                                : 'text-gray-300 dark:text-gray-600'
                                                        }`}
                                                    >
                                                        $
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-gray-600 dark:text-gray-400 text-xs">
                                                {lead.lastContactDate
                                                    ? new Date(lead.lastContactDate).toLocaleDateString('es-ES', {
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        year: 'numeric'
                                                    })
                                                    : '-'
                                                }
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <select
                                                value={lead.status}
                                                onChange={(e) => handleStatusChange(lead.place_id, e.target.value as Lead['status'])}
                                                className={cn(
                                                    "rounded-full px-2.5 py-0.5 text-xs font-medium border-0 ring-1 ring-inset outline-none cursor-pointer appearance-none pr-6",
                                                    lead.status === 'NEW' && "bg-blue-50 text-blue-700 ring-blue-600/20",
                                                    lead.status === 'CONTACTED' && "bg-yellow-50 text-yellow-700 ring-yellow-600/20",
                                                    lead.status === 'INTERESTED' && "bg-orange-50 text-orange-700 ring-orange-600/20",
                                                    lead.status === 'CLIENT' && "bg-green-50 text-green-700 ring-green-600/20",
                                                )}
                                                style={{ backgroundImage: 'none' }}
                                            >
                                                <option value="NEW">Nuevo</option>
                                                <option value="CONTACTED">Contactado</option>
                                                <option value="INTERESTED">Interesado</option>
                                                <option value="CLIENT">Cliente</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => setSelectedLeadForPitch(lead)}
                                                    className="p-2 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-md transition-colors"
                                                    title="Generar Speech de Venta"
                                                >
                                                    <Sparkles className="h-4 w-4" />
                                                </button>
                                                {lead.phone && (
                                                    <a
                                                        href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
                                                        title="Enviar WhatsApp"
                                                    >
                                                        <MessageCircle className="h-4 w-4" />
                                                    </a>
                                                )}
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

            {selectedLeadForPitch && (
                <PitchGenerator
                    isOpen={!!selectedLeadForPitch}
                    onClose={() => setSelectedLeadForPitch(null)}
                    leadName={selectedLeadForPitch.name}
                    leadActivity={selectedLeadForPitch.keyword || 'Negocio'}
                    leadCity={selectedLeadForPitch.city || 'Su Ciudad'}
                />
            )}
        </div>
    );
}
