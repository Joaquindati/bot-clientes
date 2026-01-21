import Link from "next/link";
import { Users, Mail, MapPin, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Dashboard</h1>
        <p className="text-muted-foreground text-gray-500">
          Resumen de actividad y rendimiento de captación.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Stat Card 1 */}
        <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-gray-500">Leads Totales</h3>
            <Users className="h-4 w-4 text-gray-500" />
          </div>
          <div className="text-2xl font-bold">0</div>
          <p className="text-xs text-gray-500 mt-1">+0% desde ayer</p>
        </div>

        {/* Stat Card 2 */}
        <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-gray-500">Emails Encontrados</h3>
            <Mail className="h-4 w-4 text-gray-500" />
          </div>
          <div className="text-2xl font-bold">0</div>
          <p className="text-xs text-gray-500 mt-1">Tasa de éxito: 0%</p>
        </div>

        {/* Stat Card 3 */}
        <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-gray-500">Búsquedas</h3>
            <MapPin className="h-4 w-4 text-gray-500" />
          </div>
          <div className="text-2xl font-bold">0</div>
          <p className="text-xs text-gray-500 mt-1">En la última semana</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4 rounded-xl border bg-white shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
          <div className="p-6">
            <h3 className="font-semibold text-lg mb-4">Empezar</h3>
            <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
              <div className="bg-blue-50 p-4 rounded-full dark:bg-blue-900/20">
                <MapPin className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h4 className="text-lg font-medium">Nueva Búsqueda de Clientes</h4>
              <p className="text-gray-500 max-w-sm">
                Encuentra clientes potenciales en Google Maps y extrae su información de contacto automáticamente.
              </p>
              <Link
                href="/search"
                className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
              >
                Comenzar Búsqueda
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        <div className="col-span-3 rounded-xl border bg-white shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
          <div className="p-6">
            <h3 className="font-semibold text-lg mb-4">Actividad Reciente</h3>
            <div className="space-y-8">
              <p className="text-sm text-gray-500">No hay actividad reciente.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
