'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { User, Bell, Palette, Save, Check, ChevronDown } from 'lucide-react';

interface UserSettings {
    name: string;
    email: string;
    notifications: {
        emailReminders: boolean;
        weeklyReport: boolean;
        leadAlerts: boolean;
    };
    language: 'es' | 'en' | 'pt';
}

export default function SettingsPage() {
    const t = useTranslations('Settings');
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const { data: session } = useSession();
    const { theme, setTheme } = useTheme();
    const [saved, setSaved] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const [deleting, setDeleting] = useState(false);
    // Password change states
    const [hasPassword, setHasPassword] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [changingPassword, setChangingPassword] = useState(false);
    const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    // Collapsible card states (for mobile)
    const [expandedCards, setExpandedCards] = useState({
        profile: true,
        notifications: false,
        appearance: false,
        language: false,
        danger: false,
    });
    const [settings, setSettings] = useState<UserSettings>({
        name: '',
        email: '',
        notifications: {
            emailReminders: true,
            weeklyReport: false,
            leadAlerts: true,
        },
        language: locale as 'es' | 'en' | 'pt',
    });

    useEffect(() => {
        if (session?.user) {
            setSettings(prev => ({
                ...prev,
                name: session.user.name || '',
                email: session.user.email || '',
            }));
        }

        // Load preferences from API
        const loadPreferences = async () => {
            try {
                const res = await fetch('/api/user/preferences');
                if (res.ok) {
                    const data = await res.json();
                    setSettings(prev => ({
                        ...prev,
                        notifications: {
                            emailReminders: data.emailReminders,
                            weeklyReport: data.weeklyReport,
                            leadAlerts: data.leadAlerts
                        }
                    }));
                }
            } catch (e) {
                console.error('Error loading preferences:', e);
            }
        };
        loadPreferences();

        // Check if user has password
        const checkHasPassword = async () => {
            try {
                const res = await fetch('/api/user/has-password');
                if (res.ok) {
                    const data = await res.json();
                    setHasPassword(data.hasPassword);
                }
            } catch (e) {
                console.error('Error checking password:', e);
            }
        };
        checkHasPassword();
    }, [session]);

    const handleSave = async () => {
        // Save language preference to API/LocalStorage if needed (optional since URL drives it)
        // But let's save notifications
        try {
            await fetch('/api/user/preferences', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings.notifications),
            });
        } catch (e) {
            console.error('Error saving preferences:', e);
        }

        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const handleLanguageChange = (newLocale: string) => {
        setSettings({ ...settings, language: newLocale as 'es' | 'en' | 'pt' });
        router.replace(pathname, { locale: newLocale });
    };

    const handleDeleteAccount = async () => {
        setDeleting(true);
        try {
            const res = await fetch('/api/user/delete', {
                method: 'DELETE',
            });

            if (res.ok) {
                window.location.href = '/login?deleted=true';
            } else {
                const data = await res.json();
                alert('Error: ' + (data.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error deleting account:', error);
            alert('Error deleting account.');
        } finally {
            setDeleting(false);
            setShowDeleteModal(false);
            setDeleteConfirmText('');
        }
    };

    const handleChangePassword = async () => {
        if (newPassword !== confirmPassword) {
            setPasswordMessage({ type: 'error', text: 'Las contraseñas no coinciden' }); // TODO: Translate validation msgs
            return;
        }
        if (newPassword.length < 6) {
            setPasswordMessage({ type: 'error', text: 'La contraseña debe tener al menos 6 caracteres' });
            return;
        }

        setChangingPassword(true);
        setPasswordMessage(null);

        try {
            const res = await fetch('/api/user/change-password', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword, newPassword }),
            });

            const data = await res.json();

            if (res.ok) {
                setPasswordMessage({ type: 'success', text: 'Contraseña actualizada correctamente' });
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                setPasswordMessage({ type: 'error', text: data.error || 'Error al cambiar contraseña' });
            }
        } catch (error) {
            console.error('Error changing password:', error);
            setPasswordMessage({ type: 'error', text: 'Error al cambiar contraseña' });
        } finally {
            setChangingPassword(false);
        }
    };

    return (
        <div className="space-y-6 min-w-0 overflow-hidden">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">{t('title')}</h1>
                <p className="text-muted-foreground text-gray-500 text-sm md:text-base">
                    {t('subtitle')}
                </p>
            </div>

            <div className="space-y-4 md:space-y-6">
                {/* Profile Section */}
                <div className="rounded-xl border bg-white shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
                    <button
                        onClick={() => setExpandedCards(prev => ({ ...prev, profile: !prev.profile }))}
                        className="w-full p-4 md:p-6 flex items-center justify-between md:cursor-default"
                    >
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                                <User className="h-5 w-5" />
                            </div>
                            <div className="text-left">
                                <h2 className="text-lg font-semibold dark:text-gray-100">{t('profile.title')}</h2>
                                <p className="text-sm text-gray-500">{t('profile.subtitle')}</p>
                            </div>
                        </div>
                        <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform md:hidden ${expandedCards.profile ? 'rotate-180' : ''}`} />
                    </button>

                    <div className={`${expandedCards.profile ? 'block' : 'hidden md:block'} px-4 pb-4 md:px-6 md:pb-6 md:pt-0 space-y-4`}>
                        <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('profile.name')}</label>
                            <input
                                type="text"
                                value={settings.name}
                                onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                                className="mt-1 flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:bg-zinc-800 dark:border-zinc-700 dark:text-gray-100"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('profile.email')}</label>
                            <input
                                type="email"
                                value={settings.email}
                                disabled
                                className="mt-1 flex h-10 w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-500 dark:bg-zinc-800/50 dark:border-zinc-700 dark:text-gray-400 cursor-not-allowed"
                            />
                            <p className="text-xs text-gray-400 mt-1">{t('profile.emailNote')}</p>
                        </div>

                        {/* Password Change - Only for users with password */}
                        {hasPassword && (
                            <>
                                <div className="border-t pt-4 mt-4 dark:border-zinc-700">
                                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                                        <span className="text-base">🔒</span>
                                        {t('profile.changePassword')}
                                    </h3>

                                    {passwordMessage && (
                                        <div className={`mb-4 p-3 rounded-md text-sm ${passwordMessage.type === 'success'
                                            ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                            : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                            }`}>
                                            {passwordMessage.text}
                                        </div>
                                    )}

                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('profile.currentPassword')}</label>
                                            <input
                                                type="password"
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                                className="mt-1 flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:bg-zinc-800 dark:border-zinc-700 dark:text-gray-100"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('profile.newPassword')}</label>
                                            <input
                                                type="password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="mt-1 flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:bg-zinc-800 dark:border-zinc-700 dark:text-gray-100"
                                                placeholder="Mínimo 6 caracteres"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('profile.confirmPassword')}</label>
                                            <input
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="mt-1 flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:bg-zinc-800 dark:border-zinc-700 dark:text-gray-100"
                                                placeholder="Repite la contraseña"
                                            />
                                        </div>
                                        <button
                                            onClick={handleChangePassword}
                                            disabled={changingPassword || !currentPassword || !newPassword || !confirmPassword}
                                            className="inline-flex items-center justify-center gap-2 rounded-md bg-orange-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {changingPassword ? 'Cambiando...' : t('profile.savePassword')}
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>


                {/* Notifications Section */}
                <div className="rounded-xl border bg-white shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
                    <button
                        onClick={() => setExpandedCards(prev => ({ ...prev, notifications: !prev.notifications }))}
                        className="w-full p-4 md:p-6 flex items-center justify-between md:cursor-default"
                    >
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400">
                                <Bell className="h-5 w-5" />
                            </div>
                            <div className="text-left">
                                <h2 className="text-lg font-semibold dark:text-gray-100">{t('notifications.title')}</h2>
                                <p className="text-sm text-gray-500">{t('notifications.subtitle')}</p>
                            </div>
                        </div>
                        <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform md:hidden ${expandedCards.notifications ? 'rotate-180' : ''}`} />
                    </button>

                    <div className={`${expandedCards.notifications ? 'block' : 'hidden md:block'} px-4 pb-4 md:px-6 md:pb-6 md:pt-0 space-y-4`}>
                        <label className="flex items-center justify-between cursor-pointer">
                            <div>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('notifications.emailReminders')}</span>
                                <p className="text-xs text-gray-500">{t('notifications.emailRemindersDesc')}</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={settings.notifications.emailReminders}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    notifications: { ...settings.notifications, emailReminders: e.target.checked }
                                })}
                                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                        </label>

                        <label className="flex items-center justify-between cursor-pointer">
                            <div>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('notifications.weeklyReport')}</span>
                                <p className="text-xs text-gray-500">{t('notifications.weeklyReportDesc')}</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={settings.notifications.weeklyReport}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    notifications: { ...settings.notifications, weeklyReport: e.target.checked }
                                })}
                                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                        </label>

                        <label className="flex items-center justify-between cursor-pointer">
                            <div>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('notifications.leadAlerts')}</span>
                                <p className="text-xs text-gray-500">{t('notifications.leadAlertsDesc')}</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={settings.notifications.leadAlerts}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    notifications: { ...settings.notifications, leadAlerts: e.target.checked }
                                })}
                                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                        </label>
                    </div>
                </div>

                {/* Appearance Section */}
                <div className="rounded-xl border bg-white shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
                    <button
                        onClick={() => setExpandedCards(prev => ({ ...prev, appearance: !prev.appearance }))}
                        className="w-full p-4 md:p-6 flex items-center justify-between md:cursor-default"
                    >
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                                <Palette className="h-5 w-5" />
                            </div>
                            <div className="text-left">
                                <h2 className="text-lg font-semibold dark:text-gray-100">{t('appearance.title')}</h2>
                                <p className="text-sm text-gray-500">{t('appearance.subtitle')}</p>
                            </div>
                        </div>
                        <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform md:hidden ${expandedCards.appearance ? 'rotate-180' : ''}`} />
                    </button>

                    <div className={`${expandedCards.appearance ? 'block' : 'hidden md:block'} px-4 pb-4 md:px-6 md:pb-6 md:pt-0`}>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('appearance.theme')}</label>
                        <select
                            value={theme}
                            onChange={(e) => setTheme(e.target.value)}
                            className="mt-1 flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:bg-zinc-800 dark:border-zinc-700 dark:text-gray-100"
                        >
                            <option value="system">{t('appearance.system')}</option>
                            <option value="light">{t('appearance.light')}</option>
                            <option value="dark">{t('appearance.dark')}</option>
                        </select>
                    </div>
                </div>

                {/* Language Section */}
                <div className="rounded-xl border bg-white shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
                    <button
                        onClick={() => setExpandedCards(prev => ({ ...prev, language: !prev.language }))}
                        className="w-full p-4 md:p-6 flex items-center justify-between md:cursor-default"
                    >
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                                <span className="text-lg">🌐</span>
                            </div>
                            <div className="text-left">
                                <h2 className="text-lg font-semibold dark:text-gray-100">{t('language.title')}</h2>
                                <p className="text-sm text-gray-500">{t('language.subtitle')}</p>
                            </div>
                        </div>
                        <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform md:hidden ${expandedCards.language ? 'rotate-180' : ''}`} />
                    </button>

                    <div className={`${expandedCards.language ? 'block' : 'hidden md:block'} px-4 pb-4 md:px-6 md:pb-6 md:pt-0`}>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('language.label')}</label>
                        <select
                            value={settings.language}
                            onChange={(e) => handleLanguageChange(e.target.value)}
                            className="mt-1 flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:bg-zinc-800 dark:border-zinc-700 dark:text-gray-100"
                        >
                            <option value="es">🇪🇸 Español</option>
                            <option value="en">🇺🇸 English</option>
                            <option value="pt">🇧🇷 Português</option>
                        </select>
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="rounded-xl border border-red-200 bg-red-50 shadow-sm dark:bg-red-900/10 dark:border-red-900/30">
                    <button
                        onClick={() => setExpandedCards(prev => ({ ...prev, danger: !prev.danger }))}
                        className="w-full p-4 md:p-6 flex items-center justify-between md:cursor-default"
                    >
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                                <span className="text-lg">⚠️</span>
                            </div>
                            <div className="text-left">
                                <h2 className="text-lg font-semibold text-red-700 dark:text-red-400">{t('danger.title')}</h2>
                                <p className="text-sm text-red-600 dark:text-red-400/80">{t('danger.subtitle')}</p>
                            </div>
                        </div>
                        <ChevronDown className={`h-5 w-5 text-red-400 transition-transform md:hidden ${expandedCards.danger ? 'rotate-180' : ''}`} />
                    </button>

                    <div className={`${expandedCards.danger ? 'block' : 'hidden md:block'} px-4 pb-4 md:px-6 md:pb-6 md:pt-0`}>
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('danger.deleteAccount')}</p>
                                <p className="text-xs text-gray-500">{t('danger.deleteDesc')}</p>
                            </div>
                            <button
                                onClick={() => setShowDeleteModal(true)}
                                className="inline-flex items-center justify-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
                            >
                                {t('danger.button')}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <button
                    onClick={handleSave}
                    className="w-full md:w-auto inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                >
                    {saved ? (
                        <>
                            <Check className="h-4 w-4" />
                            {t('saved')}
                        </>
                    ) : (
                        <>
                            <Save className="h-4 w-4" />
                            {t('save')}
                        </>
                    )}
                </button>
            </div>

            {/* Delete Account Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 max-w-md w-full shadow-xl">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                            {t('danger.deleteAccount')}?
                        </h3>
                        <p className="text-sm text-gray-500 mb-4">
                            {t('danger.deleteDesc')}
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                            Escribe <strong className="text-red-600">ELIMINAR</strong> para confirmar:
                        </p>
                        <input
                            type="text"
                            value={deleteConfirmText}
                            onChange={(e) => setDeleteConfirmText(e.target.value)}
                            className="w-full h-10 rounded-md border border-gray-300 px-3 py-2 text-sm dark:bg-zinc-800 dark:border-zinc-700 dark:text-gray-100 mb-4"
                            placeholder="Escribe ELIMINAR"
                        />
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setDeleteConfirmText('');
                                }}
                                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md dark:text-gray-300 dark:hover:bg-zinc-800"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDeleteAccount}
                                disabled={deleteConfirmText !== 'ELIMINAR' || deleting}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {deleting ? 'Eliminando...' : t('danger.button')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
