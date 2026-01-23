'use client';

import { useState } from 'react';
import { ChevronDown, BookOpen, Database, Zap, Lightbulb } from "lucide-react";

export default function FaqSection() {
    const [openFaq, setOpenFaq] = useState<string | null>(null);

    const toggleFaq = (id: string) => {
        setOpenFaq(openFaq === id ? null : id);
    };

    return (
        <div className="rounded-xl border bg-white shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
            <div className="p-6">
                <h3 className="font-semibold text-lg mb-6 flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                    Guía Rápida y Preguntas Frecuentes
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Column 1: Basics & Data */}
                    <div className="space-y-6">

                        {/* Section 1: Primeros Pasos */}
                        <div>
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <Zap className="h-3 w-3" /> Primeros Pasos
                            </h4>
                            <div className="space-y-2">
                                <FaqItem
                                    id="how-it-works"
                                    title="¿Cómo funciona la aplicación?"
                                    isOpen={openFaq === 'how-it-works'}
                                    onClick={() => toggleFaq('how-it-works')}
                                >
                                    <p className="mb-2">
                                        Esta plataforma automatiza la búsqueda de clientes potenciales. El flujo básico es:
                                    </p>
                                    <ol className="list-decimal list-inside space-y-1 ml-2">
                                        <li><strong>Buscas</strong> rubros (ej: "pizzerías") en una ciudad.</li>
                                        <li>La app <strong>extrae</strong> datos de Maps y sitios web.</li>
                                        <li>Obtienes una lista de <strong>leads enriquecidos</strong> (emails, redes, teléfonos).</li>
                                    </ol>
                                </FaqItem>

                                <FaqItem
                                    id="search-clients"
                                    title="¿Cómo realizo mi primera búsqueda?"
                                    isOpen={openFaq === 'search-clients'}
                                    onClick={() => toggleFaq('search-clients')}
                                >
                                    <ol className="list-decimal list-inside space-y-1 ml-2">
                                        <li>Ve a la sección <strong>"Buscador"</strong> en el menú lateral.</li>
                                        <li>Escribe el tipo de negocio (ej: "abogados", "gimnasios").</li>
                                        <li>Escribe la ciudad o zona (ej: "Madrid", "Buenos Aires").</li>
                                        <li>Pulsa <strong>Buscar</strong> y espera unos segundos mientras el bot trabaja.</li>
                                        <li>¡Listo! Los resultados aparecerán en tu lista de leads.</li>
                                    </ol>
                                </FaqItem>
                            </div>
                        </div>

                        {/* Section 2: Entendiendo los Datos */}
                        <div>
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <Database className="h-3 w-3" /> Entendiendo los Datos
                            </h4>
                            <div className="space-y-2">
                                <FaqItem
                                    id="dashboard-cards"
                                    title="¿Qué significan las tarjetas del dashboard?"
                                    isOpen={openFaq === 'dashboard-cards'}
                                    onClick={() => toggleFaq('dashboard-cards')}
                                >
                                    <ul className="space-y-2">
                                        <li><strong className="text-orange-600">Sin Contacto:</strong> Leads olvidados (+30 días).</li>
                                        <li><strong className="text-red-600">Cierre Urgente:</strong> Ventas por cerrar esta semana.</li>
                                        <li><strong className="text-blue-600">Última Búsqueda:</strong> Acceso rápido a tu historial.</li>
                                        <li><strong className="text-yellow-600">Más Urgente:</strong> El lead que requiere atención inmediata.</li>
                                    </ul>
                                </FaqItem>

                                <FaqItem
                                    id="lead-fields"
                                    title="¿Qué información tiene cada lead?"
                                    isOpen={openFaq === 'lead-fields'}
                                    onClick={() => toggleFaq('lead-fields')}
                                >
                                    <p className="mb-2 font-medium">Datos Automáticos:</p>
                                    <p className="text-xs text-gray-500 mb-2">Google Maps info, Emails, Redes (FB, IG, LI), Web Tech Stack, SSL.</p>
                                    <p className="mb-2 font-medium">Tus Datos de Gestión:</p>
                                    <ul className="space-y-1 ml-2 list-disc">
                                        <li><strong>Estado:</strong> Nuevo, Contactado, Interesado, Cliente.</li>
                                        <li><strong>Urgencia:</strong> Alta/Media/Baja.</li>
                                        <li><strong>Fechas:</strong> Próximo seguimiento, Cierre estimado.</li>
                                        <li><strong>Notas:</strong> Bitácora de conversaciones.</li>
                                    </ul>
                                </FaqItem>
                            </div>
                        </div>
                    </div>

                    {/* Column 2: Actions & Tips */}
                    <div className="space-y-6">

                        {/* Section 3: Gestión y Acciones */}
                        <div>
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <Zap className="h-3 w-3" /> Gestión Diaria
                            </h4>
                            <div className="space-y-2">
                                <FaqItem
                                    id="manage-leads"
                                    title="¿Cómo gestiono mis leads día a día?"
                                    isOpen={openFaq === 'manage-leads'}
                                    onClick={() => toggleFaq('manage-leads')}
                                >
                                    <p>Usa la tabla de "Mis Leads" como tu centro de comando:</p>
                                    <ul className="list-disc list-inside space-y-1 mt-2">
                                        <li>Usa los <strong>filtros</strong> para ver solo "Nuevos" o "Interesados".</li>
                                        <li>Ordena por <strong>Urgencia</strong> para priorizar tu día.</li>
                                        <li>Entra al detalle de cada lead para registrar llamadas o notas.</li>
                                        <li>Mueve el estado a <strong>"Client"</strong> cuando cierres una venta.</li>
                                    </ul>
                                </FaqItem>

                                <FaqItem
                                    id="actions-buttons"
                                    title="¿Para qué sirven las acciones rápidas?"
                                    isOpen={openFaq === 'actions-buttons'}
                                    onClick={() => toggleFaq('actions-buttons')}
                                >
                                    <ul className="space-y-2">
                                        <li><strong>✨ Generar Speech:</strong> Crea un mensaje de venta personalizado usando IA.</li>
                                        <li><strong>💬 WhatsApp:</strong> Abre el chat sin guardar el número.</li>
                                        <li><strong>📧 Email:</strong> Copia o abre el cliente de correo.</li>
                                        <li><strong>🌐 Web/Maps:</strong> Investiga al cliente antes de llamar.</li>
                                    </ul>
                                </FaqItem>
                            </div>
                        </div>

                        {/* Section 4: Tips Avanzados (New) */}
                        <div>
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <Lightbulb className="h-3 w-3" /> Tips Pro
                            </h4>
                            <div className="space-y-2">
                                <FaqItem
                                    id="ai-speech"
                                    title="¿Cómo mejorar el Speech de ventas con IA?"
                                    isOpen={openFaq === 'ai-speech'}
                                    onClick={() => toggleFaq('ai-speech')}
                                >
                                    <p className="mb-2">Para obtener mejores resultados del generador de speech:</p>
                                    <ul className="list-disc list-inside space-y-1">
                                        <li>Asegúrate de que el lead tenga bien definido su <strong>Rubro/Actividad</strong>.</li>
                                        <li>Agrega una <strong>Nota</strong> con detalles específicos que hayas observado en su web.</li>
                                        <li>La IA usará estos datos para personalizar el mensaje y aumentar la tasa de respuesta.</li>
                                    </ul>
                                </FaqItem>

                                <FaqItem
                                    id="whatsapp-best-practices"
                                    title="Mejores prácticas para contactar"
                                    isOpen={openFaq === 'whatsapp-best-practices'}
                                    onClick={() => toggleFaq('whatsapp-best-practices')}
                                >
                                    <ul className="space-y-2">
                                        <li><strong>No seas invasivo:</strong> Preséntate brevemente y menciona cómo encontraste su negocio.</li>
                                        <li><strong>Aporta valor:</strong> Menciona un problema específico que su negocio podría tener (ej: "vi que no tienen SSL").</li>
                                        <li><strong>Usa el Speech IA:</strong> Genera varias opciones (Corto, Profesional, Amigable) según el perfil del cliente.</li>
                                    </ul>
                                </FaqItem>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}

function FaqItem({ id, title, children, isOpen, onClick }: { id: string, title: string, children: React.ReactNode, isOpen: boolean, onClick: () => void }) {
    return (
        <div className="border dark:border-zinc-800 rounded-lg overflow-hidden h-fit transition-all duration-200 hover:shadow-sm">
            <button
                onClick={onClick}
                className="w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors"
                aria-expanded={isOpen}
            >
                <h4 className="font-medium text-gray-900 dark:text-gray-100 text-left text-sm">
                    {title}
                </h4>
                <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-500' : ''}`} />
            </button>
            {isOpen && (
                <div className="px-3 pb-3 text-gray-600 dark:text-gray-400 text-xs leading-relaxed animate-in fade-in slide-in-from-top-1 duration-200 border-t dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/20">
                    <div className="pt-2">
                        {children}
                    </div>
                </div>
            )}
        </div>
    );
}
