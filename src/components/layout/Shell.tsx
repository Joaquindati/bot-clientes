import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';

interface ShellProps {
    children: ReactNode;
}

export function Shell({ children }: ShellProps) {
    return (
        <div className="flex h-screen bg-gray-50 dark:bg-black">
            <Sidebar />
            <main className="flex-1 overflow-y-auto px-8 py-8">
                <div className="mx-auto max-w-7xl">
                    {children}
                </div>
            </main>
        </div>
    );
}
