'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Home, CreditCard, PieChart, Target, LineChart, Bell, RefreshCw, CheckSquare, Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/dashboard/transactions', label: 'Transactions', icon: CreditCard },
  { href: '/dashboard/budget', label: 'Budget', icon: PieChart },
  { href: '/dashboard/savings', label: 'Savings Goals', icon: Target },
  { href: '/dashboard/analytics', label: 'Analytics', icon: LineChart },
  { href: '/dashboard/reminders', label: 'Reminders', icon: Bell },
  { href: '/dashboard/fixed-charges', label: 'Recurring', icon: RefreshCw },
  { href: '/dashboard/todos', label: 'Todos', icon: CheckSquare },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const SidebarContent = ({ className, onItemClick }: { className?: string; onItemClick?: () => void }) => (
    <div className={cn("flex flex-col h-full bg-card", className)}>
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center gap-2 group" onClick={onItemClick}>
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
            FF
          </div>
          <span className="font-bold text-xl tracking-tight text-foreground">FinanceFlow</span>
        </Link>
      </div>

      <nav className="flex-1 px-4 py-2 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onItemClick}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200',
                active
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20 translate-x-1'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              )}
            >
              <Icon className={cn("w-5 h-5", active ? "animate-pulse" : "")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-border/50">
        <div className="bg-primary/5 rounded-2xl p-4 text-center">
          <p className="text-[10px] font-black uppercase tracking-widest text-primary/60">Version 2.0 Premium</p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 border-r border-border/50 bg-card flex-col sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Trigger (Top Left Fixed) */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button size="icon" variant="outline" className="w-10 h-10 rounded-xl shadow-lg bg-card/80 backdrop-blur-md border-border/50">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-80 border-r-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation Menu</SheetTitle>
            </SheetHeader>
            <SidebarContent onItemClick={() => setIsOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
