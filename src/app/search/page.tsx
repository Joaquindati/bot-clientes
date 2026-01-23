'use client';

import { useState } from 'react';
import { Search, MapPin, Loader2, Play, Globe, Phone, Star, Building2, Facebook, Instagram, Linkedin, Plus, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { saveLead } from '@/lib/storage';

interface SearchResult {
    place_id: string;
    name: string;
    address: string;
    rating: number;
    user_ratings_total: number;
    website: string | null;
    phone: string;
    emails: string[];
    socials: { [key: string]: string };
    city?: string;
    state?: string;
    country?: string;
    keyword?: string;
}

export default function SearchPage() {
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<SearchResult[]>([]);
    const [hasSearched, setHasSearched] = useState(false);
    const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

    const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setHasSearched(false);
        setResults([]);

        const formData = new FormData(e.currentTarget);
        const keyword = formData.get('keyword');
        const city = formData.get('city');
        const apiKey = formData.get('apiKey');

        try {
            const res = await fetch('/api/search', {
                method: 'POST',
                body: JSON.stringify({ keyword, city, apiKey }),
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await res.json();
            setResults(data.results || []);
        } catch (error) {
            console.error('Search failed', error);
        } finally {
            setLoading(false);
            setHasSearched(true);
        }
    };

    const handleSave = async (result: SearchResult) => {
        try {
            console.log('Saving lead:', result);
            await saveLead(result);
            setSavedIds(prev => new Set([...prev, result.place_id]));
            console.log('Lead saved successfully');
        } catch (error) {
            console.error('Error saving lead', error);
            alert('Error al guardar el lead. Revisa la consola para más detalles.');
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Buscador</h1>
                <p className="text-muted-foreground text-gray-500">
                    Busca empresas en Google Maps y extrae sus datos de contacto.
                </p>
            </div>

            <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
                <form onSubmit={handleSearch} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none">
                            Google Maps API Key (Opcional)
                        </label>
                        <input
                            name="apiKey"
                            type="password"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-800 dark:border-zinc-700"
                            placeholder="Pegar tu API Key aquí para búsqueda real"
                        />
                        <p className="text-xs text-muted-foreground text-gray-400">
                            Si se deja vacío, se usará el modo Demo con datos de prueba.
                        </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-7">
                        <div className="md:col-span-3 space-y-2">
                            <label className="text-sm font-medium leading-none">
                                Palabra Clave (Rubro)
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <input
                                    name="keyword"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-800 dark:border-zinc-700"
                                    placeholder="Ej. Abogados, Pizzería, Dentista"
                                    required
                                />
                            </div>
                        </div>

                        <div className="md:col-span-3 space-y-2">
                            <label className="text-sm font-medium leading-none">
                                Ciudad / Ubicación
                            </label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <input
                                    name="city"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-800 dark:border-zinc-700"
                                    placeholder="Ej. Santiago, Buenos Aires, Madrid"
                                    required
                                />
                            </div>
                        </div>

                        <div className="md:col-span-1 flex items-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex h-10 w-full items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
                                Buscar
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            <div className="space-y-4">
                {hasSearched && results.length === 0 ? (
                    <div className="rounded-xl border bg-white p-12 text-center text-gray-500 dark:bg-zinc-900 dark:border-zinc-800">
                        No se encontraron resultados para esta búsqueda.
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
                        {results.map((result) => {
                            const isSaved = savedIds.has(result.place_id);
                            return (
                                <div key={result.place_id} className="relative flex flex-col rounded-xl border bg-white p-6 shadow-sm transition-all hover:shadow-md dark:bg-zinc-900 dark:border-zinc-800">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                                                <Building2 className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-lg leading-tight dark:text-gray-100">{result.name}</h3>
                                                <p className="text-sm text-gray-500 truncate flex items-center mt-1">
                                                    <Star className="h-3 w-3 text-yellow-500 mr-1 fill-yellow-500" />
                                                    {result.rating} ({result.user_ratings_total})
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleSave(result)}
                                            disabled={isSaved}
                                            className={cn(
                                                "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
                                                isSaved
                                                    ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                                                    : "bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600 dark:bg-zinc-800 dark:text-gray-400 dark:hover:bg-zinc-700"
                                            )}
                                        >
                                            {isSaved ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                                        </button>
                                    </div>

                                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-6 flex-1">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-gray-400" />
                                            <span className="truncate">{result.address}</span>
                                        </div>
                                        {result.phone && (
                                            <div className="flex items-center gap-2">
                                                <Phone className="h-4 w-4 text-gray-400" />
                                                <span>{result.phone}</span>
                                            </div>
                                        )}
                                        {result.website && (
                                            <div className="flex items-center gap-2">
                                                <Globe className="h-4 w-4 text-gray-400" />
                                                <a href={result.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline dark:text-blue-400">
                                                    Visitar Sitio Web
                                                </a>
                                            </div>
                                        )}
                                    </div>

                                    <div className="border-t pt-4 mt-auto dark:border-zinc-800">
                                        <div className="flex items-center justify-between">
                                            <div className="flex gap-2">
                                                {result.socials.facebook && (
                                                    <a href={result.socials.facebook} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                                                        <Facebook className="h-4 w-4 text-blue-600" />
                                                    </a>
                                                )}
                                                {result.socials.instagram && (
                                                    <a href={result.socials.instagram} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                                                        <Instagram className="h-4 w-4 text-pink-600" />
                                                    </a>
                                                )}
                                                {result.socials.linkedin && (
                                                    <a href={result.socials.linkedin} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                                                        <Linkedin className="h-4 w-4 text-blue-700" />
                                                    </a>
                                                )}
                                            </div>

                                            {result.emails.length > 0 ? (
                                                <div className="flex gap-1">
                                                    {result.emails.map((email, idx) => (
                                                        <button
                                                            key={idx}
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(email);
                                                                // Optional: Visual feedback could be added here
                                                                alert(`Email copiado: ${email}`);
                                                            }}
                                                            className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 cursor-pointer transition-colors"
                                                            title="Clic para copiar"
                                                        >
                                                            {email}
                                                        </button>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10 dark:bg-gray-800 dark:text-gray-400">
                                                    Sin Emails
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
