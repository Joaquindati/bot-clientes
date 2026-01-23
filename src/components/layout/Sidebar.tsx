'use client';

import { useState } from 'react';
import { Link, usePathname } from '@/i18n/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { LayoutDashboard, Search, Users, Settings, LogOut, Map, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const t = useTranslations('Sidebar');
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isExpanded, setIsExpanded] = useState(false);

  const navigation = [
    { name: t('dashboard'), href: '/', icon: LayoutDashboard },
    { name: t('search'), href: '/search', icon: Search },
    { name: t('leads'), href: '/leads', icon: Users },
  ];

  const handleSignOut = () => {
    signOut({ callbackUrl: '/login' });
  };

  const handleNavClick = () => {
    setIsExpanded(false);
  };

  return (
    <div
      className={cn(
        "flex h-full flex-col bg-white border-r border-gray-200 dark:bg-zinc-900 dark:border-zinc-800 transition-all duration-300",
        "w-14 md:w-16",
        isExpanded && "md:w-64"
      )}
    >
      {/* Header */}
      <div className={cn(
        "flex h-14 items-center border-b border-gray-200 dark:border-zinc-800",
        isExpanded ? "md:justify-between md:px-4" : "justify-center"
      )}>
        <div className="flex items-center gap-2">
          <Map className="h-5 w-5 md:h-6 md:w-6 text-blue-600 flex-shrink-0" />
          {isExpanded && (
            <span className="hidden md:block text-lg font-bold text-gray-900 dark:text-white whitespace-nowrap">Maps Bot</span>
          )}
        </div>
        {isExpanded && (
          <button
            onClick={() => setIsExpanded(false)}
            className="hidden md:block p-1 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Toggle button - desktop only */}
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="hidden md:flex justify-center py-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      )}

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-0.5 md:px-2 py-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleNavClick}
              className={cn(
                'group flex items-center justify-center rounded-md py-2 text-sm font-medium transition-colors',
                isExpanded ? 'md:justify-start md:px-3' : 'px-1',
                isActive
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-zinc-800'
              )}
              title={item.name}
            >
              <item.icon
                className={cn(
                  'h-5 w-5 flex-shrink-0',
                  isExpanded && 'md:mr-3',
                  isActive
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-400 group-hover:text-gray-500 dark:text-gray-500'
                )}
              />
              {isExpanded && <span className="hidden md:block">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-200 py-2 px-0.5 md:px-2 dark:border-zinc-800">
        {/* User Info - expanded desktop only */}
        {session?.user && isExpanded && (
          <div className="hidden md:flex items-center gap-3 px-3 py-2 mb-2">
            {session.user.image ? (
              <img
                src={session.user.image}
                alt={session.user.name || 'Avatar'}
                className="h-8 w-8 rounded-full flex-shrink-0"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 flex-shrink-0">
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

        {/* User avatar - collapsed or mobile */}
        {session?.user && (!isExpanded || true) && (
          <div className={cn("flex justify-center py-2 mb-1", isExpanded && "md:hidden")}>
            {session.user.image ? (
              <img
                src={session.user.image}
                alt={session.user.name || 'Avatar'}
                className="h-7 w-7 md:h-8 md:w-8 rounded-full"
                title={session.user.name || 'Usuario'}
              />
            ) : (
              <div className="flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30" title={session.user.name || 'Usuario'}>
                <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            )}
          </div>
        )}

        {/* Settings link */}
        <Link
          href="/settings"
          onClick={handleNavClick}
          className={cn(
            "group flex w-full items-center justify-center rounded-md py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-zinc-800",
            isExpanded ? "md:justify-start md:px-3" : "px-1",
            pathname === '/settings' && "bg-gray-100 dark:bg-zinc-800"
          )}
          title={t('settings')}
        >
          <Settings className={cn("h-5 w-5 text-gray-400 group-hover:text-gray-500", isExpanded && "md:mr-3")} />
          {isExpanded && <span className="hidden md:block">{t('settings')}</span>}
        </Link>

        {/* Logout button */}
        <button
          onClick={handleSignOut}
          className={cn(
            "mt-1 group flex w-full items-center justify-center rounded-md py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20",
            isExpanded ? "md:justify-start md:px-3" : "px-1"
          )}
          title={t('logout')}
        >
          <LogOut className={cn("h-5 w-5 text-red-500 group-hover:text-red-600", isExpanded && "md:mr-3")} />
          {isExpanded && <span className="hidden md:block">{t('logout')}</span>}
        </button>
      </div>
    </div>
  );
}
