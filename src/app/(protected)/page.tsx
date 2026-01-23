'use client';

import Link from "next/link";
import { Clock, AlertTriangle, Search as SearchIcon, MapPin, ArrowRight, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import LeadMap from "@/components/LeadMap";
import RecentLeads from "@/components/RecentLeads";
import FaqSection from "@/components/FaqSection";

interface DashboardStats {
  leadsNoContact: number;
  urgentCloseCount: number;
  lastSearch: {
    keyword: string;
    city: string;
    date: string;
  } | null;
  mostUrgentLead: {
    id: string;
    name: string;
    nextActionDate: string | null;
    estimatedCloseDate: string | null;
  } | null;
}

export default function Home() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/dashboard/stats');
        const data = await res.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Sin fecha';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getTimeSince = (dateString: string | null) => {
    if (!dateString) return 'Nunca';
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Hace 1 día';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
    return `Hace ${Math.floor(diffDays / 30)} meses`;
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Dashboard</h1>
        <p className="text-muted-foreground text-gray-500">
          Resumen de actividad y rendimiento de captación.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Clientes sin contacto +1 mes */}
        <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-gray-500">Sin Contacto +30 días</h3>
            <Clock className="h-4 w-4 text-orange-500" />
          </div>
          <div className="text-2xl font-bold">
            {loading ? '...' : stats?.leadsNoContact || 0}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {loading ? 'Cargando...' : stats?.leadsNoContact ? 'Requieren seguimiento' : 'Todo al día'}
          </p>
        </div>

        {/* Card 2: Clientes con cierre urgente < 1 semana */}
        <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-gray-500">Cierre Urgente</h3>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </div>
          <div className="text-2xl font-bold">
            {loading ? '...' : stats?.urgentCloseCount || 0}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {loading ? 'Cargando...' : stats?.urgentCloseCount ? 'Cierre en < 7 días' : 'Sin urgencias'}
          </p>
        </div>

        {/* Card 3: Última búsqueda */}
        <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-gray-500">Última Búsqueda</h3>
            <SearchIcon className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-sm font-bold truncate">
            {loading ? '...' : stats?.lastSearch
              ? `${stats.lastSearch.keyword} - ${stats.lastSearch.city}`
              : 'Sin búsquedas'}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {loading ? 'Cargando...' : stats?.lastSearch
              ? getTimeSince(stats.lastSearch.date)
              : 'Realiza tu primera búsqueda'}
          </p>
        </div>

        {/* Card 4: Cliente más urgente */}
        <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-gray-500">Más Urgente</h3>
            <TrendingUp className="h-4 w-4 text-yellow-500" />
          </div>
          <div className="text-sm font-bold truncate">
            {loading ? '...' : stats?.mostUrgentLead
              ? <Link
                href={`/leads/${stats.mostUrgentLead.id}`}
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
              >
                {stats.mostUrgentLead.name}
              </Link>
              : 'Sin leads urgentes'}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {loading ? 'Cargando...' : stats?.mostUrgentLead?.nextActionDate
              ? `Acción: ${formatDate(stats.mostUrgentLead.nextActionDate)}`
              : stats?.mostUrgentLead?.estimatedCloseDate
                ? `Cierre: ${formatDate(stats.mostUrgentLead.estimatedCloseDate)}`
                : 'Marca leads como urgentes'}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4 rounded-xl border bg-white shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
          <div className="p-6">
            <h3 className="font-semibold text-lg mb-4">Mapa de Leads</h3>
            <LeadMap />
          </div>
        </div>

        <div className="col-span-3 rounded-xl border bg-white shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
          <div className="p-6 h-full">
            <RecentLeads />
          </div>
        </div>
      </div>

      <FaqSection />
    </div>
  );
}
