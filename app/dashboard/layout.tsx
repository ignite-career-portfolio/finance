'use client';

import { useRouter } from 'next/navigation';
import { useUser } from '@/lib/user-context';
import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/dashboard/sidebar';
import { TopNav } from '@/components/dashboard/top-nav';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { NotificationProvider } from '@/lib/notification-context';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useUser();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isLoading && !isAuthenticated) {
      router.push('/login');
    }

    // Automated Reminder Check (Heart-beat)
    let interval: NodeJS.Timeout;
    if (isAuthenticated) {
      const checkReminders = () => {
        fetch('/api/cron/reminders', {
          headers: { 'x-user-id': sessionStorage.getItem('userId') || '' }
        }).catch(err => console.error('Automated check failed:', err));
      };

      // Initial check after mount
      checkReminders();
      // Set periodic check (every 45 seconds for demo purposes)
      interval = setInterval(checkReminders, 45000);
    }

    return () => clearInterval(interval);
  }, [isAuthenticated, isLoading, mounted, router]);

  if (!mounted || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-lg bg-primary animate-pulse mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <NotificationProvider>
      <div className="flex h-screen bg-background overflow-hidden relative">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          <TopNav />
          <main className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-primary/10">
            <div className="container mx-auto px-4 sm:px-6 py-6 max-w-7xl relative">
              {children}
            </div>
          </main>
        </div>
        <QuickActions />
      </div>
    </NotificationProvider>
  );
}
