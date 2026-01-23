'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, ExternalLink, Mail, Phone, MapPin, Calendar, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface Lead {
    place_id: string;
    name: string;
    address: string;
    phone: string;
    website: string | null;
    rating: number;
    city: string;
    state: string | null;
    country: string | null;
    keyword: string;
    emails: string[];
    socials: Record<string, string | undefined>;
    techStack: string[];
    hasSsl: boolean;
    status: 'NEW' | 'CONTACTED' | 'INTERESTED' | 'CLIENT';
    notes: string | null;
    description: string | null;
    lastContactDate: string | null;
    economyLevel: number;
    // Sales Intelligence
    decisionMaker: string | null;
    decisionMakerRole: string | null;
    estimatedCloseDate: string | null;
    urgencyLevel: string | null;
    painPoints: string | null;
    leadSource: string | null;
    bestContactTime: string | null;
    preferredContactChannel: string | null;
    employeeCount: string | null;
    nextAction: string | null;
    nextActionDate: string | null;
    createdAt: string;
    updatedAt: string;
}

export default function LeadDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [lead, setLead] = useState<Lead | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editMode, setEditMode] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        phone: '',
        website: '',
        rating: 0,
        city: '',
        state: '',
        country: '',
        keyword: '',
        emails: [] as string[],
        socials: {} as Record<string, string>,
        techStack: [] as string[],
        hasSsl: false,
        status: 'NEW' as Lead['status'],
        notes: '',
        description: '',
        lastContactDate: null as string | null,
        economyLevel: 0,
        // Sales Intelligence
        decisionMaker: '',
        decisionMakerRole: '',
        estimatedCloseDate: null as string | null,
        urgencyLevel: '',
        painPoints: '',
        leadSource: '',
        bestContactTime: '',
        preferredContactChannel: '',
        employeeCount: '',
        nextAction: '',
        nextActionDate: null as string | null
    });

    // New field inputs
    const [newEmail, setNewEmail] = useState('');
    const [newSocialKey, setNewSocialKey] = useState('');
    const [newSocialValue, setNewSocialValue] = useState('');
    const [newTech, setNewTech] = useState('');

    useEffect(() => {
        if (params.id) {
            fetchLead();
        }
    }, [params.id]);

    const fetchLead = async () => {
        try {
            const res = await fetch(`/api/leads/${params.id}`);
            if (!res.ok) throw new Error('Failed to fetch lead');
            const data = await res.json();
            setLead(data);
            setFormData({
                name: data.name || '',
                address: data.address || '',
                phone: data.phone || '',
                website: data.website || '',
                rating: data.rating || 0,
                city: data.city || '',
                state: data.state || '',
                country: data.country || '',
                keyword: data.keyword || '',
                emails: data.emails || [],
                socials: data.socials || {},
                techStack: data.techStack || [],
                hasSsl: data.hasSsl || false,
                status: data.status || 'NEW',
                notes: data.notes || '',
                description: data.description || '',
                lastContactDate: data.lastContactDate || null,
                economyLevel: data.economyLevel || 0,
                // Sales Intelligence
                decisionMaker: data.decisionMaker || '',
                decisionMakerRole: data.decisionMakerRole || '',
                estimatedCloseDate: data.estimatedCloseDate || null,
                urgencyLevel: data.urgencyLevel || '',
                painPoints: data.painPoints || '',
                leadSource: data.leadSource || '',
                bestContactTime: data.bestContactTime || '',
                preferredContactChannel: data.preferredContactChannel || '',
                employeeCount: data.employeeCount || '',
                nextAction: data.nextAction || '',
                nextActionDate: data.nextActionDate || null
            });
        } catch (error) {
            console.error('Error fetching lead:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch(`/api/leads/${params.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!res.ok) throw new Error('Failed to update lead');

            const result = await res.json();
            setLead(result.lead);
            setEditMode(false);
            alert('Lead actualizado exitosamente');
        } catch (error) {
            console.error('Error updating lead:', error);
            alert('Error al actualizar el lead');
        } finally {
            setSaving(false);
        }
    };

    const addEmail = () => {
        if (newEmail && !formData.emails.includes(newEmail)) {
            setFormData({ ...formData, emails: [...formData.emails, newEmail] });
            setNewEmail('');
        }
    };

    const removeEmail = (email: string) => {
        setFormData({ ...formData, emails: formData.emails.filter(e => e !== email) });
    };

    const addSocial = () => {
        if (newSocialKey && newSocialValue) {
            setFormData({
                ...formData,
                socials: { ...formData.socials, [newSocialKey]: newSocialValue }
            });
            setNewSocialKey('');
            setNewSocialValue('');
        }
    };

    const removeSocial = (key: string) => {
        const { [key]: _, ...rest } = formData.socials;
        setFormData({ ...formData, socials: rest });
    };

    const addTech = () => {
        if (newTech && !formData.techStack.includes(newTech)) {
            setFormData({ ...formData, techStack: [...formData.techStack, newTech] });
            setNewTech('');
        }
    };

    const removeTech = (tech: string) => {
        setFormData({ ...formData, techStack: formData.techStack.filter(t => t !== tech) });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-gray-500">Cargando...</div>
            </div>
        );
    }

    if (!lead) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                <div className="text-gray-500">Lead no encontrado</div>
                <Link href="/leads" className="text-blue-600 hover:underline">
                    Volver a Leads
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/leads"
                        className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                            {editMode ? (
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="border border-gray-300 dark:border-zinc-700 rounded-lg px-3 py-2 bg-white dark:bg-zinc-900 w-full"
                                />
                            ) : (
                                lead.name
                            )}
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">
                            {lead.keyword} • {lead.city}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {editMode ? (
                        <>
                            <button
                                onClick={() => {
                                    setEditMode(false);
                                    setFormData({
                                        name: lead.name || '',
                                        address: lead.address || '',
                                        phone: lead.phone || '',
                                        website: lead.website || '',
                                        rating: lead.rating || 0,
                                        city: lead.city || '',
                                        state: lead.state || '',
                                        country: lead.country || '',
                                        keyword: lead.keyword || '',
                                        emails: lead.emails || [],
                                        socials: lead.socials || {},
                                        techStack: lead.techStack || [],
                                        hasSsl: lead.hasSsl || false,
                                        status: lead.status || 'NEW',
                                        notes: lead.notes || '',
                                        description: lead.description || '',
                                        lastContactDate: lead.lastContactDate || null,
                                        economyLevel: lead.economyLevel || 0,
                                        // Sales Intelligence
                                        decisionMaker: lead.decisionMaker || '',
                                        decisionMakerRole: lead.decisionMakerRole || '',
                                        estimatedCloseDate: lead.estimatedCloseDate || null,
                                        urgencyLevel: lead.urgencyLevel || '',
                                        painPoints: lead.painPoints || '',
                                        leadSource: lead.leadSource || '',
                                        bestContactTime: lead.bestContactTime || '',
                                        preferredContactChannel: lead.preferredContactChannel || '',
                                        employeeCount: lead.employeeCount || '',
                                        nextAction: lead.nextAction || '',
                                        nextActionDate: lead.nextActionDate || null
                                    });
                                }}
                                className="px-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                            >
                                <Save className="h-4 w-4" />
                                {saving ? 'Guardando...' : 'Guardar'}
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => setEditMode(true)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Editar
                        </button>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Info Card */}
                    <div className="bg-white dark:bg-zinc-900 rounded-xl border dark:border-zinc-800 p-6 space-y-4">
                        <h2 className="text-xl font-semibold mb-4">Información Básica</h2>

                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-medium text-gray-500 block mb-1">Dirección</label>
                                {editMode ? (
                                    <input
                                        type="text"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        className="w-full border border-gray-300 dark:border-zinc-700 rounded-lg px-3 py-2 bg-white dark:bg-zinc-800"
                                    />
                                ) : (
                                    <div className="flex items-start gap-2 text-gray-900 dark:text-gray-100">
                                        <MapPin className="h-4 w-4 mt-1 text-gray-400" />
                                        {lead.address}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-500 block mb-1">Teléfono</label>
                                {editMode ? (
                                    <input
                                        type="text"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full border border-gray-300 dark:border-zinc-700 rounded-lg px-3 py-2 bg-white dark:bg-zinc-800"
                                    />
                                ) : (
                                    <div className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                                        <Phone className="h-4 w-4 text-gray-400" />
                                        {lead.phone || 'No disponible'}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-500 block mb-1">Sitio Web</label>
                                {editMode ? (
                                    <input
                                        type="text"
                                        value={formData.website}
                                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                        className="w-full border border-gray-300 dark:border-zinc-700 rounded-lg px-3 py-2 bg-white dark:bg-zinc-800"
                                    />
                                ) : (
                                    lead.website ? (
                                        <a
                                            href={lead.website}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex items-center gap-2 text-blue-600 hover:underline"
                                        >
                                            {lead.website}
                                            <ExternalLink className="h-4 w-4" />
                                        </a>
                                    ) : (
                                        <span className="text-gray-400">No disponible</span>
                                    )
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500 block mb-1">Ciudad</label>
                                    {editMode ? (
                                        <input
                                            type="text"
                                            value={formData.city}
                                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                            className="w-full border border-gray-300 dark:border-zinc-700 rounded-lg px-3 py-2 bg-white dark:bg-zinc-800"
                                        />
                                    ) : (
                                        <div className="text-gray-900 dark:text-gray-100">{lead.city}</div>
                                    )}
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-500 block mb-1">Estado/Provincia</label>
                                    {editMode ? (
                                        <input
                                            type="text"
                                            value={formData.state}
                                            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                            className="w-full border border-gray-300 dark:border-zinc-700 rounded-lg px-3 py-2 bg-white dark:bg-zinc-800"
                                        />
                                    ) : (
                                        <div className="text-gray-900 dark:text-gray-100">{lead.state || '-'}</div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500 block mb-1">País</label>
                                    {editMode ? (
                                        <input
                                            type="text"
                                            value={formData.country}
                                            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                            className="w-full border border-gray-300 dark:border-zinc-700 rounded-lg px-3 py-2 bg-white dark:bg-zinc-800"
                                        />
                                    ) : (
                                        <div className="text-gray-900 dark:text-gray-100">{lead.country || '-'}</div>
                                    )}
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-500 block mb-1">Categoría</label>
                                    {editMode ? (
                                        <input
                                            type="text"
                                            value={formData.keyword}
                                            onChange={(e) => setFormData({ ...formData, keyword: e.target.value })}
                                            className="w-full border border-gray-300 dark:border-zinc-700 rounded-lg px-3 py-2 bg-white dark:bg-zinc-800"
                                        />
                                    ) : (
                                        <div className="text-gray-900 dark:text-gray-100">{lead.keyword}</div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-500 block mb-1">Rating</label>
                                {editMode ? (
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        max="5"
                                        value={formData.rating}
                                        onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })}
                                        className="w-full border border-gray-300 dark:border-zinc-700 rounded-lg px-3 py-2 bg-white dark:bg-zinc-800"
                                    />
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <span className="text-yellow-500">★</span>
                                        <span className="text-gray-900 dark:text-gray-100">{lead.rating || 'N/A'}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Description Card */}
                    <div className="bg-white dark:bg-zinc-900 rounded-xl border dark:border-zinc-800 p-6">
                        <h2 className="text-xl font-semibold mb-4">Descripción</h2>
                        {editMode ? (
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={6}
                                placeholder="Agrega una descripción detallada del lead..."
                                className="w-full border border-gray-300 dark:border-zinc-700 rounded-lg px-3 py-2 bg-white dark:bg-zinc-800 resize-none"
                            />
                        ) : (
                            <div className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                                {lead.description || <span className="text-gray-400">No hay descripción</span>}
                            </div>
                        )}
                    </div>

                    {/* Contact & Sales Info - 2 Column Grid */}
                    <div className="bg-white dark:bg-zinc-900 rounded-xl border dark:border-zinc-800 p-6">
                        <div className="grid grid-cols-2 gap-6">
                            {/* Último Contacto */}
                            <div>
                                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    Último Contacto
                                </h3>
                                {editMode ? (
                                    <input
                                        type="date"
                                        value={formData.lastContactDate ? new Date(formData.lastContactDate).toISOString().split('T')[0] : ''}
                                        onChange={(e) => setFormData({ ...formData, lastContactDate: e.target.value ? new Date(e.target.value).toISOString() : null })}
                                        className="w-full border border-gray-300 dark:border-zinc-700 rounded-lg px-3 py-2 bg-white dark:bg-zinc-800"
                                    />
                                ) : (
                                    <div className="text-gray-900 dark:text-gray-100">
                                        {lead.lastContactDate
                                            ? new Date(lead.lastContactDate).toLocaleDateString('es-ES', {
                                                day: '2-digit',
                                                month: 'long',
                                                year: 'numeric'
                                            })
                                            : <span className="text-gray-400">No registrado</span>
                                        }
                                    </div>
                                )}
                            </div>

                            {/* Nota */}
                            <div>
                                <h3 className="text-lg font-semibold mb-3">Nota</h3>
                                {editMode ? (
                                    <textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        rows={4}
                                        placeholder="Agrega notas sobre este lead..."
                                        className="w-full border border-gray-300 dark:border-zinc-700 rounded-lg px-3 py-2 bg-white dark:bg-zinc-800 resize-none"
                                    />
                                ) : (
                                    <div className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                                        {lead.notes || <span className="text-gray-400">No hay notas</span>}
                                    </div>
                                )}
                            </div>

                            {/* Tomador de Decisiones */}
                            <div>
                                <h3 className="text-lg font-semibold mb-3">Tomador de Decisiones</h3>
                                <div className="space-y-2">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500 block mb-1">Nombre</label>
                                        {editMode ? (
                                            <input
                                                type="text"
                                                value={formData.decisionMaker}
                                                onChange={(e) => setFormData({ ...formData, decisionMaker: e.target.value })}
                                                placeholder="Nombre del contacto"
                                                className="w-full border border-gray-300 dark:border-zinc-700 rounded-lg px-3 py-2 bg-white dark:bg-zinc-800"
                                            />
                                        ) : (
                                            <div className="text-gray-900 dark:text-gray-100">
                                                {lead.decisionMaker || <span className="text-gray-400">No registrado</span>}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500 block mb-1">Cargo</label>
                                        {editMode ? (
                                            <input
                                                type="text"
                                                value={formData.decisionMakerRole}
                                                onChange={(e) => setFormData({ ...formData, decisionMakerRole: e.target.value })}
                                                placeholder="Ej: Dueño, Gerente"
                                                className="w-full border border-gray-300 dark:border-zinc-700 rounded-lg px-3 py-2 bg-white dark:bg-zinc-800"
                                            />
                                        ) : (
                                            <div className="text-gray-900 dark:text-gray-100">
                                                {lead.decisionMakerRole || <span className="text-gray-400">No registrado</span>}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Fuente de Contacto */}
                            <div>
                                <h3 className="text-lg font-semibold mb-3">Fuente de Contacto</h3>
                                <div>
                                    <label className="text-sm font-medium text-gray-500 block mb-1">Fuente</label>
                                    {editMode ? (
                                        <select
                                            value={formData.leadSource}
                                            onChange={(e) => setFormData({ ...formData, leadSource: e.target.value })}
                                            className="w-full border border-gray-300 dark:border-zinc-700 rounded-lg px-3 py-2 bg-white dark:bg-zinc-800"
                                        >
                                            <option value="">Seleccionar...</option>
                                            <option value="Google Maps">Google Maps</option>
                                            <option value="Referido">Referido</option>
                                            <option value="LinkedIn">LinkedIn</option>
                                            <option value="Facebook">Facebook</option>
                                            <option value="Instagram">Instagram</option>
                                            <option value="Web">Sitio Web</option>
                                            <option value="Otro">Otro</option>
                                        </select>
                                    ) : (
                                        <div className="text-gray-900 dark:text-gray-100">
                                            {lead.leadSource || <span className="text-gray-400">No registrado</span>}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Emails Card */}
                    <div className="bg-white dark:bg-zinc-900 rounded-xl border dark:border-zinc-800 p-6">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <Mail className="h-5 w-5" />
                            Emails
                        </h2>
                        <div className="space-y-2">
                            {formData.emails.map((email, index) => (
                                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-zinc-800 rounded-lg">
                                    <span className="text-gray-900 dark:text-gray-100">{email}</span>
                                    {editMode && (
                                        <button
                                            onClick={() => removeEmail(email)}
                                            className="text-red-600 hover:text-red-700 text-sm"
                                        >
                                            Quitar
                                        </button>
                                    )}
                                </div>
                            ))}
                            {editMode && (
                                <div className="flex gap-2 mt-3">
                                    <input
                                        type="email"
                                        value={newEmail}
                                        onChange={(e) => setNewEmail(e.target.value)}
                                        placeholder="nuevo@email.com"
                                        className="flex-1 border border-gray-300 dark:border-zinc-700 rounded-lg px-3 py-2 bg-white dark:bg-zinc-800"
                                    />
                                    <button
                                        onClick={addEmail}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                    >
                                        Agregar
                                    </button>
                                </div>
                            )}
                            {formData.emails.length === 0 && !editMode && (
                                <p className="text-gray-400 text-sm">No hay emails disponibles</p>
                            )}
                        </div>
                    </div>

                    {/* Social Links Card */}
                    <div className="bg-white dark:bg-zinc-900 rounded-xl border dark:border-zinc-800 p-6">
                        <h2 className="text-xl font-semibold mb-4">Redes Sociales</h2>
                        <div className="space-y-2">
                            {Object.entries(formData.socials).map(([key, value]) => (
                                <div key={key} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-zinc-800 rounded-lg">
                                    <div className="flex-1">
                                        <span className="font-medium text-gray-900 dark:text-gray-100 capitalize">{key}:</span>
                                        <a href={value} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline ml-2 text-sm">
                                            {value}
                                        </a>
                                    </div>
                                    {editMode && (
                                        <button
                                            onClick={() => removeSocial(key)}
                                            className="text-red-600 hover:text-red-700 text-sm"
                                        >
                                            Quitar
                                        </button>
                                    )}
                                </div>
                            ))}
                            {editMode && (
                                <div className="space-y-2 mt-3">
                                    <input
                                        type="text"
                                        value={newSocialKey}
                                        onChange={(e) => setNewSocialKey(e.target.value)}
                                        placeholder="Plataforma (ej: facebook)"
                                        className="w-full border border-gray-300 dark:border-zinc-700 rounded-lg px-3 py-2 bg-white dark:bg-zinc-800"
                                    />
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newSocialValue}
                                            onChange={(e) => setNewSocialValue(e.target.value)}
                                            placeholder="URL"
                                            className="flex-1 border border-gray-300 dark:border-zinc-700 rounded-lg px-3 py-2 bg-white dark:bg-zinc-800"
                                        />
                                        <button
                                            onClick={addSocial}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                        >
                                            Agregar
                                        </button>
                                    </div>
                                </div>
                            )}
                            {Object.keys(formData.socials).length === 0 && !editMode && (
                                <p className="text-gray-400 text-sm">No hay redes sociales disponibles</p>
                            )}
                        </div>
                    </div>

                    {/* Tech Stack Card */}
                    <div className="bg-white dark:bg-zinc-900 rounded-xl border dark:border-zinc-800 p-6">
                        <h2 className="text-xl font-semibold mb-4">Stack Tecnológico</h2>
                        <div className="flex flex-wrap gap-2">
                            {formData.techStack.map((tech, index) => (
                                <div
                                    key={index}
                                    className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-sm flex items-center gap-2"
                                >
                                    {tech}
                                    {editMode && (
                                        <button
                                            onClick={() => removeTech(tech)}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>
                            ))}
                            {formData.techStack.length === 0 && !editMode && (
                                <p className="text-gray-400 text-sm">No hay tecnologías detectadas</p>
                            )}
                        </div>
                        {editMode && (
                            <div className="flex gap-2 mt-3">
                                <input
                                    type="text"
                                    value={newTech}
                                    onChange={(e) => setNewTech(e.target.value)}
                                    placeholder="Tecnología (ej: WordPress)"
                                    className="flex-1 border border-gray-300 dark:border-zinc-700 rounded-lg px-3 py-2 bg-white dark:bg-zinc-800"
                                />
                                <button
                                    onClick={addTech}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Agregar
                                </button>
                            </div>
                        )}
                        {editMode && (
                            <div className="mt-4">
                                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                    <input
                                        type="checkbox"
                                        checked={formData.hasSsl}
                                        onChange={(e) => setFormData({ ...formData, hasSsl: e.target.checked })}
                                        className="rounded"
                                    />
                                    Tiene SSL
                                </label>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column - Sales Intelligence */}
                <div className="space-y-6">
                    {/* Next Action Card - MOST CRITICAL */}
                    <div className="bg-white dark:bg-zinc-900 rounded-xl border dark:border-zinc-800 p-6 border-l-4 border-l-blue-500">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            ⚡ Próxima Acción
                        </h2>
                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-medium text-gray-500 block mb-1">Siguiente Paso</label>
                                {editMode ? (
                                    <input
                                        type="text"
                                        value={formData.nextAction}
                                        onChange={(e) => setFormData({ ...formData, nextAction: e.target.value })}
                                        placeholder="Ej: Enviar propuesta, Llamar para demo"
                                        className="w-full border border-gray-300 dark:border-zinc-700 rounded-lg px-3 py-2 bg-white dark:bg-zinc-800"
                                    />
                                ) : (
                                    <div className="text-gray-900 dark:text-gray-100 font-medium">
                                        {lead.nextAction || <span className="text-gray-400 font-normal">No definida</span>}
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500 block mb-1">Fecha de Seguimiento</label>
                                {editMode ? (
                                    <input
                                        type="date"
                                        value={formData.nextActionDate ? new Date(formData.nextActionDate).toISOString().split('T')[0] : ''}
                                        onChange={(e) => setFormData({ ...formData, nextActionDate: e.target.value ? new Date(e.target.value).toISOString() : null })}
                                        className="w-full border border-gray-300 dark:border-zinc-700 rounded-lg px-3 py-2 bg-white dark:bg-zinc-800"
                                    />
                                ) : (
                                    <div className="text-gray-900 dark:text-gray-100">
                                        {lead.nextActionDate
                                            ? new Date(lead.nextActionDate).toLocaleDateString('es-ES', {
                                                day: '2-digit',
                                                month: 'long',
                                                year: 'numeric'
                                            })
                                            : <span className="text-gray-400">No programada</span>
                                        }
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Status Card */}
                    <div className="bg-white dark:bg-zinc-900 rounded-xl border dark:border-zinc-800 p-6">
                        <h2 className="text-xl font-semibold mb-4">Estado</h2>
                        {editMode ? (
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value as Lead['status'] })}
                                className="w-full border border-gray-300 dark:border-zinc-700 rounded-lg px-3 py-2 bg-white dark:bg-zinc-800"
                            >
                                <option value="NEW">Nuevo</option>
                                <option value="CONTACTED">Contactado</option>
                                <option value="INTERESTED">Interesado</option>
                                <option value="CLIENT">Cliente</option>
                            </select>
                        ) : (
                            <span
                                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${lead.status === 'NEW' ? 'bg-blue-50 text-blue-700' :
                                    lead.status === 'CONTACTED' ? 'bg-yellow-50 text-yellow-700' :
                                        lead.status === 'INTERESTED' ? 'bg-orange-50 text-orange-700' :
                                            'bg-green-50 text-green-700'
                                    }`}
                            >
                                {lead.status === 'NEW' ? 'Nuevo' :
                                    lead.status === 'CONTACTED' ? 'Contactado' :
                                        lead.status === 'INTERESTED' ? 'Interesado' : 'Cliente'}
                            </span>
                        )}
                    </div>

                    {/* Timing & Urgency Card */}
                    <div className="bg-white dark:bg-zinc-900 rounded-xl border dark:border-zinc-800 p-6">
                        <h2 className="text-xl font-semibold mb-4">Timing & Urgencia</h2>
                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-medium text-gray-500 block mb-1">Fecha Est. Cierre</label>
                                {editMode ? (
                                    <input
                                        type="date"
                                        value={formData.estimatedCloseDate ? new Date(formData.estimatedCloseDate).toISOString().split('T')[0] : ''}
                                        onChange={(e) => setFormData({ ...formData, estimatedCloseDate: e.target.value ? new Date(e.target.value).toISOString() : null })}
                                        className="w-full border border-gray-300 dark:border-zinc-700 rounded-lg px-3 py-2 bg-white dark:bg-zinc-800"
                                    />
                                ) : (
                                    <div className="text-gray-900 dark:text-gray-100">
                                        {lead.estimatedCloseDate
                                            ? new Date(lead.estimatedCloseDate).toLocaleDateString('es-ES', {
                                                day: '2-digit',
                                                month: 'long',
                                                year: 'numeric'
                                            })
                                            : <span className="text-gray-400">No registrada</span>
                                        }
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500 block mb-1">Nivel de Urgencia</label>
                                {editMode ? (
                                    <select
                                        value={formData.urgencyLevel}
                                        onChange={(e) => setFormData({ ...formData, urgencyLevel: e.target.value })}
                                        className="w-full border border-gray-300 dark:border-zinc-700 rounded-lg px-3 py-2 bg-white dark:bg-zinc-800"
                                    >
                                        <option value="">Sin definir</option>
                                        <option value="HIGH">🔥 Alta</option>
                                        <option value="MEDIUM">⚡ Media</option>
                                        <option value="LOW">📅 Baja</option>
                                    </select>
                                ) : (
                                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${lead.urgencyLevel === 'HIGH' ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400' :
                                        lead.urgencyLevel === 'MEDIUM' ? 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400' :
                                            lead.urgencyLevel === 'LOW' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' :
                                                'bg-gray-50 text-gray-600'
                                        }`}>
                                        {lead.urgencyLevel === 'HIGH' ? '🔥 Alta' :
                                            lead.urgencyLevel === 'MEDIUM' ? '⚡ Media' :
                                                lead.urgencyLevel === 'LOW' ? '📅 Baja' : 'Sin definir'}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>


                    {/* Economy Level Card */}
                    <div className="bg-white dark:bg-zinc-900 rounded-xl border dark:border-zinc-800 p-6">
                        <h2 className="text-xl font-semibold mb-4">Nivel Económico</h2>
                        <div className="flex gap-1">
                            {[1, 2, 3].map((level) => (
                                <button
                                    key={level}
                                    onClick={() => editMode && setFormData({ ...formData, economyLevel: level })}
                                    disabled={!editMode}
                                    className={`text-2xl transition-all ${formData.economyLevel >= level
                                        ? 'text-green-600 dark:text-green-400'
                                        : 'text-gray-300 dark:text-gray-600'
                                        } ${editMode ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}
                                    title={
                                        level === 1 ? 'Bajo' :
                                            level === 2 ? 'Medio' :
                                                'Alto'
                                    }
                                >
                                    $
                                </button>
                            ))}
                        </div>
                        {formData.economyLevel === 0 && !editMode && (
                            <p className="text-xs text-gray-400 mt-2">No establecido</p>
                        )}
                        {formData.economyLevel > 0 && (
                            <p className="text-xs text-gray-500 mt-2">
                                {formData.economyLevel === 1 ? 'Poder adquisitivo bajo' :
                                    formData.economyLevel === 2 ? 'Poder adquisitivo medio' :
                                        'Poder adquisitivo alto'}
                            </p>
                        )}
                    </div>

                    {/* Pain Points Card */}
                    <div className="bg-white dark:bg-zinc-900 rounded-xl border dark:border-zinc-800 p-6">
                        <h2 className="text-xl font-semibold mb-4">Pain Points</h2>
                        {editMode ? (
                            <textarea
                                value={formData.painPoints}
                                onChange={(e) => setFormData({ ...formData, painPoints: e.target.value })}
                                rows={4}
                                placeholder="¿Qué problema enfrenta? ¿Qué quiere lograr?"
                                className="w-full border border-gray-300 dark:border-zinc-700 rounded-lg px-3 py-2 bg-white dark:bg-zinc-800 resize-none"
                            />
                        ) : (
                            <div className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap text-sm">
                                {lead.painPoints || <span className="text-gray-400">No registrado</span>}
                            </div>
                        )}
                    </div>

                    {/* Contact Preferences Card */}
                    <div className="bg-white dark:bg-zinc-900 rounded-xl border dark:border-zinc-800 p-6">
                        <h2 className="text-xl font-semibold mb-4">Preferencias de Contacto</h2>
                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-medium text-gray-500 block mb-1">Mejor Horario</label>
                                {editMode ? (
                                    <select
                                        value={formData.bestContactTime}
                                        onChange={(e) => setFormData({ ...formData, bestContactTime: e.target.value })}
                                        className="w-full border border-gray-300 dark:border-zinc-700 rounded-lg px-3 py-2 bg-white dark:bg-zinc-800"
                                    >
                                        <option value="">Seleccionar...</option>
                                        <option value="Mañana">Mañana</option>
                                        <option value="Tarde">Tarde</option>
                                        <option value="Noche">Noche</option>
                                    </select>
                                ) : (
                                    <div className="text-gray-900 dark:text-gray-100">
                                        {lead.bestContactTime || <span className="text-gray-400">No registrado</span>}
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500 block mb-1">Canal Preferido</label>
                                {editMode ? (
                                    <select
                                        value={formData.preferredContactChannel}
                                        onChange={(e) => setFormData({ ...formData, preferredContactChannel: e.target.value })}
                                        className="w-full border border-gray-300 dark:border-zinc-700 rounded-lg px-3 py-2 bg-white dark:bg-zinc-800"
                                    >
                                        <option value="">Seleccionar...</option>
                                        <option value="WhatsApp">WhatsApp</option>
                                        <option value="Email">Email</option>
                                        <option value="Llamada">Llamada</option>
                                        <option value="Videollamada">Videollamada</option>
                                    </select>
                                ) : (
                                    <div className="text-gray-900 dark:text-gray-100">
                                        {lead.preferredContactChannel || <span className="text-gray-400">No registrado</span>}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Company Size Card */}
                    <div className="bg-white dark:bg-zinc-900 rounded-xl border dark:border-zinc-800 p-6">
                        <h2 className="text-xl font-semibold mb-4">Tamaño del Lead</h2>
                        <label className="text-sm font-medium text-gray-500 block mb-1">Empleados Estimados</label>
                        {editMode ? (
                            <select
                                value={formData.employeeCount}
                                onChange={(e) => setFormData({ ...formData, employeeCount: e.target.value })}
                                className="w-full border border-gray-300 dark:border-zinc-700 rounded-lg px-3 py-2 bg-white dark:bg-zinc-800"
                            >
                                <option value="">Seleccionar...</option>
                                <option value="1-5">1-5 empleados</option>
                                <option value="6-20">6-20 empleados</option>
                                <option value="21-50">21-50 empleados</option>
                                <option value="50+">50+ empleados</option>
                            </select>
                        ) : (
                            <div className="text-gray-900 dark:text-gray-100">
                                {lead.employeeCount || <span className="text-gray-400">No registrado</span>}
                            </div>
                        )}
                    </div>


                    {/* Metadata Card */}
                    <div className="bg-white dark:bg-zinc-900 rounded-xl border dark:border-zinc-800 p-6">
                        <h2 className="text-xl font-semibold mb-4">Información</h2>
                        <div className="space-y-3 text-sm">
                            <div>
                                <span className="text-gray-500">Creado:</span>
                                <div className="text-gray-900 dark:text-gray-100 mt-1">
                                    {new Date(lead.createdAt).toLocaleString('es-ES')}
                                </div>
                            </div>
                            <div>
                                <span className="text-gray-500">Actualizado:</span>
                                <div className="text-gray-900 dark:text-gray-100 mt-1">
                                    {new Date(lead.updatedAt).toLocaleString('es-ES')}
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
