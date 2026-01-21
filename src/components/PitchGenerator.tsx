import { useState } from 'react';
import { Copy, Sparkles, X } from 'lucide-react';

interface PitchGeneratorProps {
    leadName: string;
    leadActivity: string; // keyword
    leadCity: string;
    isOpen: boolean;
    onClose: () => void;
}

export function PitchGenerator({ leadName, leadActivity, leadCity, isOpen, onClose }: PitchGeneratorProps) {
    const [template, setTemplate] = useState<'whatsapp' | 'email'>('whatsapp');

    if (!isOpen) return null;

    const generatePitch = () => {
        if (template === 'whatsapp') {
            return `Hola ${leadName} 👋, vi que tienen un excelente servicio de ${leadActivity} en ${leadCity}.\n\nAyudamos a negocios como el suyo a conseguir más clientes automáticamente. ¿Te gustaría ver una demo rápida de 5 min?`;
        } else {
            return `Asunto: Propuesta para ${leadName}\n\nEstimados,\n\nNavegando por la web encontré su negocio de ${leadActivity} en ${leadCity} y me pareció muy interesante su propuesta.\n\nNos especializamos en posicionar negocios locales y aumentar su facturación. Me encantaría compartirles algunas ideas que podrían aplicar esta misma semana.\n\n¿Tienen disponibilidad para una breve llamada mañana?\n\nSaludos.`;
        }
    };

    const pitch = generatePitch();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md bg-white rounded-xl shadow-lg dark:bg-zinc-900 border dark:border-zinc-800 p-6 animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-yellow-500" />
                        Generador de Speech
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex gap-2 mb-4">
                    <button
                        onClick={() => setTemplate('whatsapp')}
                        className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${template === 'whatsapp'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-gray-400'
                            }`}
                    >
                        WhatsApp
                    </button>
                    <button
                        onClick={() => setTemplate('email')}
                        className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${template === 'email'
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                : 'bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-gray-400'
                            }`}
                    >
                        Formal
                    </button>
                </div>

                <div className="relative">
                    <textarea
                        readOnly
                        value={pitch}
                        className="w-full h-40 p-3 text-sm bg-gray-50 border rounded-md dark:bg-zinc-950 dark:border-zinc-800 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(pitch);
                            alert('Copiado al portapapeles');
                        }}
                        className="absolute bottom-3 right-3 p-2 bg-white rounded-md shadow-sm border border-gray-200 hover:bg-gray-50 dark:bg-zinc-900 dark:border-zinc-700 dark:hover:bg-zinc-800 transition-colors"
                        title="Copiar texto"
                    >
                        <Copy className="h-4 w-4 text-gray-500" />
                    </button>
                </div>
            </div>
        </div>
    );
}
