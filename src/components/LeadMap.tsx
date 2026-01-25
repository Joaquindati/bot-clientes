'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { MapPin, Search } from 'lucide-react';
import { importLibrary, setOptions } from '@googlemaps/js-api-loader';

interface Lead {
    id: string;
    name: string;
    address: string;
    city: string | null;
    status: string;
}

const STATUS_COLORS = {
    NEW: '#3B82F6', // Blue
    CONTACTED: '#EAB308', // Yellow
    INTERESTED: '#22C55E', // Green
    CLIENT: '#A855F7', // Purple
    REJECTED: '#EF4444', // Red
};

export default function LeadMap() {
    const mapRef = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [leads, setLeads] = useState<Lead[]>([]);

    useEffect(() => {
        // Fetch leads
        const fetchLeads = async () => {
            try {
                const res = await fetch('/api/leads/map');
                if (!res.ok) throw new Error('Failed to fetch leads');
                const data = await res.json();
                setLeads(data);
                // If no leads, stop loading immediately
                if (data.length === 0) {
                    setLoading(false);
                }
            } catch (err) {
                console.error('Error fetching leads:', err);
                setError('Error al cargar los leads');
                setLoading(false);
            }
        };

        fetchLeads();
    }, []);

    useEffect(() => {
        const initMap = async () => {
            if (!mapRef.current || leads.length === 0) return;

            const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

            if (!apiKey) {
                setError('API Key de Google Maps no configurada. Agrega NEXT_PUBLIC_GOOGLE_MAPS_API_KEY a tu .env');
                setLoading(false);
                return;
            }

            try {
                // Configure global options
                console.log('Setting Google Maps options...');
                setOptions({
                    key: apiKey,
                    v: 'weekly',
                    libraries: ['places', 'maps', 'marker', 'geocoding'],
                });

                // Import required libraries
                const { Map } = await importLibrary('maps') as google.maps.MapsLibrary;
                const { Geocoder } = await importLibrary('geocoding') as google.maps.GeocodingLibrary;
                const { AdvancedMarkerElement, PinElement } = await importLibrary('marker') as google.maps.MarkerLibrary;

                // Default center (will be overridden if we have leads)
                let center = { lat: -34.6037, lng: -58.3816 }; // Buenos Aires default

                const map = new Map(mapRef.current, {
                    center,
                    zoom: 11,
                    mapId: 'lead_map',
                });

                const geocoder = new Geocoder();
                const bounds = new google.maps.LatLngBounds();
                let hasValidLeads = false;

                // Geocode and add markers for each lead
                for (const lead of leads) {
                    try {
                        const fullAddress = `${lead.address}, ${lead.city || ''}`.trim();
                        const result = await geocoder.geocode({ address: fullAddress });

                        if (result.results[0]) {
                            const position = result.results[0].geometry.location;
                            bounds.extend(position);
                            hasValidLeads = true;

                            // Create color-coded pin
                            const statusColor = STATUS_COLORS[lead.status as keyof typeof STATUS_COLORS] || STATUS_COLORS.NEW;

                            const pinElement = new PinElement({
                                background: statusColor,
                                borderColor: '#FFFFFF',
                                glyphColor: '#FFFFFF',
                                scale: 1.2,
                            });

                            const marker = new AdvancedMarkerElement({
                                map,
                                position,
                                content: pinElement.element,
                                title: lead.name,
                            });

                            // Add info window
                            const infoWindow = new google.maps.InfoWindow({
                                content: `
                  <div style="padding: 8px;">
                    <h3 style="margin: 0 0 4px 0; font-weight: 600; font-size: 14px;">${lead.name}</h3>
                    <p style="margin: 0; font-size: 12px; color: #666;">
                      <strong>Estado:</strong> ${lead.status}
                    </p>
                    <p style="margin: 4px 0 0 0; font-size: 11px; color: #888;">
                      ${lead.address}
                    </p>
                  </div>
                `,
                            });

                            marker.addListener('click', () => {
                                infoWindow.open(map, marker);
                            });
                        }
                    } catch (geocodeError) {
                        console.error(`Error geocoding ${lead.name}:`, geocodeError);
                    }
                }

                // Fit map to show all markers
                if (hasValidLeads) {
                    map.fitBounds(bounds);
                }

                setLoading(false);
            } catch (err) {
                console.error('Error initializing map:', err);
                setError('Error al cargar el mapa');
                setLoading(false);
            }
        };

        if (leads.length > 0) {
            initMap();
        }
    }, [leads]);

    if (error) {
        return (
            <div className="w-full h-[400px] flex items-center justify-center bg-gray-100 dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700">
                <div className="text-center p-6">
                    <p className="text-red-600 dark:text-red-400 font-medium mb-2">⚠️ {error}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Configura tu API key en el archivo .env
                    </p>
                </div>
            </div>
        );
    }

    if (!loading && leads.length === 0) {
        return (
            <div className="w-full h-[400px] flex items-center justify-center bg-gray-50 dark:bg-zinc-800/50 rounded-lg border border-gray-200 dark:border-zinc-700 border-dashed">
                <div className="text-center p-6 max-w-sm">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MapPin className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                        No hay leads para mostrar
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                        Debes agregar leads a tu lista para visualizarlos en el mapa interactivo.
                    </p>
                    <Link
                        href="/search"
                        className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                    >
                        <Search className="w-4 h-4 mr-2" />
                        Buscar Leads
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="relative w-full h-[400px] rounded-lg overflow-hidden border border-gray-200 dark:border-zinc-700">
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-zinc-800 z-10">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Cargando mapa...</p>
                    </div>
                </div>
            )}
            <div ref={mapRef} className="w-full h-full" />

            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-3 border border-gray-200 dark:border-zinc-700">
                <h4 className="text-xs font-semibold mb-2 text-gray-700 dark:text-gray-300">Estado de Leads</h4>
                <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: STATUS_COLORS.NEW }}></div>
                        <span className="text-gray-600 dark:text-gray-400">Nuevo</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: STATUS_COLORS.CONTACTED }}></div>
                        <span className="text-gray-600 dark:text-gray-400">Contactado</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: STATUS_COLORS.INTERESTED }}></div>
                        <span className="text-gray-600 dark:text-gray-400">Interesado</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: STATUS_COLORS.CLIENT }}></div>
                        <span className="text-gray-600 dark:text-gray-400">Cliente</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
