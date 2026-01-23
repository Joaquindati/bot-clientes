'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { LayoutDashboard, Search, Users, Settings, LogOut, Map, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Buscador', href: '/search', icon: Search },
  { name: 'Mis Leads', href: '/leads', icon: Users },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const handleSignOut = () => {
    signOut({ callbackUrl: '/login' });
  };

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-gray-200 dark:bg-zinc-900 dark:border-zinc-800">
      <div className="flex h-16 items-center gap-2 px-6 border-b border-gray-200 dark:border-zinc-800">
        <Map className="h-6 w-6 text-blue-600" />
        <span className="text-lg font-bold text-gray-900 dark:text-white">Maps Bot</span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-zinc-800'
              )}
            >
              <item.icon
                className={cn(
                  'mr-3 h-5 w-5 flex-shrink-0',
                  isActive
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-400 group-hover:text-gray-500 dark:text-gray-500'
                )}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-gray-200 p-4 dark:border-zinc-800">
        {/* User Info */}
        {session?.user && (
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            {session.user.image ? (
              <img
                src={session.user.image}
                alt={session.user.name || 'Avatar'}
                className="h-8 w-8 rounded-full"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {session.user.name || 'Usuario'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {session.user.email}
              </p>
            </div>
          </div>
        )}

        <button className="group flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-zinc-800">
          <Settings className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
          Configuración
        </button>
        <button
          onClick={handleSignOut}
          className="mt-1 group flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
        >
          <LogOut className="mr-3 h-5 w-5 text-red-500 group-hover:text-red-600" />
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}
