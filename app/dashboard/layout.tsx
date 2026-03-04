'use client';

import { useRouter } from 'next/navigation';
import { useUser } from '@/lib/user-context';
import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/dashboard/sidebar';
import { TopNav } from '@/components/dashboard/top-nav';

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
    <div className="flex h-screen bg-background overflow-hidden relative">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <TopNav />
        <main className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-primary/10">
          <div className="container mx-auto px-4 sm:px-6 py-6 max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
