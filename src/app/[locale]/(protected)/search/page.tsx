'use client';

import { useState, useEffect } from 'react';
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

interface SearchFormData {
    keyword: string;
    city: string;
    country: string;
}

const STORAGE_KEYS = {
    FORM_DATA: 'search_form_data',
    RESULTS: 'search_results',
    SAVED_IDS: 'search_saved_ids',
    HAS_SEARCHED: 'search_has_searched'
};

export default function SearchPage() {
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<SearchResult[]>([]);
    const [hasSearched, setHasSearched] = useState(false);
    const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
    const [formData, setFormData] = useState<SearchFormData>({
        keyword: '',
        city: '',
        country: '',
    });

    // Cargar datos guardados al montar el componente
    useEffect(() => {
        const loadSavedData = () => {
            try {
                // Cargar datos del formulario
                const savedFormData = localStorage.getItem(STORAGE_KEYS.FORM_DATA);
                if (savedFormData) {
                    const parsedData = JSON.parse(savedFormData);
                    // Filter out apiKey if it exists in old saved data
                    const { apiKey, ...cleanData } = parsedData;
                    setFormData(cleanData);
                }

                // Cargar resultados
                const savedResults = localStorage.getItem(STORAGE_KEYS.RESULTS);
                if (savedResults) {
                    setResults(JSON.parse(savedResults));
                }

                // Cargar IDs guardados
                const savedIdsData = localStorage.getItem(STORAGE_KEYS.SAVED_IDS);
                if (savedIdsData) {
                    setSavedIds(new Set(JSON.parse(savedIdsData)));
                }

                // Cargar estado de búsqueda
                const savedHasSearched = localStorage.getItem(STORAGE_KEYS.HAS_SEARCHED);
                if (savedHasSearched) {
                    setHasSearched(JSON.parse(savedHasSearched));
                }
            } catch (error) {
                console.error('Error loading saved search data:', error);
            }
        };

        loadSavedData();
    }, []);

    // Guardar resultados cuando cambien
    useEffect(() => {
        if (results.length > 0) {
            localStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify(results));
        }
    }, [results]);

    // Guardar IDs guardados cuando cambien
    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.SAVED_IDS, JSON.stringify([...savedIds]));
    }, [savedIds]);

    // Guardar estado de búsqueda
    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.HAS_SEARCHED, JSON.stringify(hasSearched));
    }, [hasSearched]);

    const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setHasSearched(false);
        setResults([]);

        const formDataObj = new FormData(e.currentTarget);
        const keyword = formDataObj.get('keyword') as string;
        const city = formDataObj.get('city') as string;
        const country = formDataObj.get('country') as string;

        // Use environment variable directly
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

        // Guardar datos del formulario en state y localStorage
        const searchFormData: SearchFormData = { keyword, city, country };
        setFormData(searchFormData);
        localStorage.setItem(STORAGE_KEYS.FORM_DATA, JSON.stringify(searchFormData));

        try {
            const res = await fetch('/api/search', {
                method: 'POST',
                body: JSON.stringify({ keyword, city, country, apiKey }),
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
        <div className="space-y-6 min-w-0 overflow-hidden">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Buscador</h1>
                <p className="text-muted-foreground text-gray-500">
                    Busca empresas en Google Maps y extrae sus datos de contacto.
                </p>
            </div>

            <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
                <form onSubmit={handleSearch} className="space-y-6">
                    {/* API Key field removed as per user request */}

                    <div className="grid gap-6 md:grid-cols-8">
                        <div className="md:col-span-3 space-y-2">
                            <label className="text-sm font-medium leading-none">
                                Palabra Clave (Rubro)
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <input
                                    name="keyword"
                                    value={formData.keyword}
                                    onChange={(e) => setFormData({ ...formData, keyword: e.target.value })}
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
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-800 dark:border-zinc-700"
                                    placeholder="Ej. Santiago, Buenos Aires, Madrid"
                                    required
                                />
                            </div>
                        </div>

                        <div className="md:col-span-2 space-y-2">
                            <label className="text-sm font-medium leading-none">
                                País
                            </label>
                            <div className="relative">
                                <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <input
                                    name="country"
                                    value={formData.country}
                                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-800 dark:border-zinc-700"
                                    placeholder="Ej. Argentina, España"
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
                    <div className="grid gap-3 md:gap-4 grid-cols-1 lg:grid-cols-2 min-w-0">
                        {results.map((result) => {
                            const isSaved = savedIds.has(result.place_id);
                            return (
                                <div key={result.place_id} className="relative flex flex-col rounded-xl border bg-white p-3 md:p-6 shadow-sm transition-all hover:shadow-md dark:bg-zinc-900 dark:border-zinc-800 min-w-0 overflow-hidden">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                                            <div className="hidden md:flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 flex-shrink-0">
                                                <Building2 className="h-5 w-5" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h3 className="font-semibold text-sm md:text-lg leading-tight dark:text-gray-100 truncate">{result.name}</h3>
                                                <p className="text-xs md:text-sm text-gray-500 flex items-center mt-0.5">
                                                    <Star className="h-3 w-3 text-yellow-500 mr-1 fill-yellow-500" />
                                                    {result.rating} ({result.user_ratings_total})
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleSave(result)}
                                            disabled={isSaved}
                                            className={cn(
                                                "flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-full transition-colors flex-shrink-0 ml-2",
                                                isSaved
                                                    ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                                                    : "bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600 dark:bg-zinc-800 dark:text-gray-400 dark:hover:bg-zinc-700"
                                            )}
                                        >
                                            {isSaved ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                                        </button>
                                    </div>

                                    {/* Desktop details - hidden on mobile */}
                                    <div className="hidden md:block space-y-2 text-sm text-gray-600 dark:text-gray-400 my-4 flex-1">
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

                                    {/* Footer with socials and email */}
                                    <div className="border-t pt-2 md:pt-4 mt-2 md:mt-auto dark:border-zinc-800">
                                        <div className="flex items-center justify-between gap-2">
                                            {/* Socials - hidden on mobile */}
                                            <div className="hidden md:flex gap-2">
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

                                            {/* Email badge - always visible */}
                                            {result.emails.length > 0 ? (
                                                <button
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(result.emails[0]);
                                                        alert(`Email copiado: ${result.emails[0]}`);
                                                    }}
                                                    className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 cursor-pointer transition-colors truncate max-w-full md:max-w-none"
                                                    title="Clic para copiar"
                                                >
                                                    <span className="truncate">{result.emails[0]}</span>
                                                </button>
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
