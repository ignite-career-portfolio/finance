'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, CreditCard, PieChart, Target, LineChart, Bell, RefreshCw, CheckSquare, Menu, Settings, HelpCircle, Sparkles } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/transactions', label: 'Transactions', icon: CreditCard },
  { href: '/dashboard/budget', label: 'Budget', icon: PieChart },
  { href: '/dashboard/savings', label: 'Savings Goals', icon: Target },
  { href: '/dashboard/analytics', label: 'Analytics', icon: LineChart },
  { href: '/dashboard/reminders', label: 'Reminders', icon: Bell },
  { href: '/dashboard/fixed-charges', label: 'Recurring', icon: RefreshCw },
  { href: '/dashboard/todos', label: 'Todos', icon: CheckSquare },
];

const bottomItems = [
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
  { href: '/dashboard/help', label: 'Help Center', icon: HelpCircle },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const SidebarContent = ({ className, onItemClick }: { className?: string; onItemClick?: () => void }) => (
    <div className={cn("flex flex-col h-full bg-[#0A0A0A] text-zinc-300 relative overflow-hidden", className)}>
      {/* Background Glows */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none -translate-x-1/2 -translate-y-1/2"></div>

      {/* Branding */}
      <div className="p-6 relative z-10">
        <Link href="/dashboard" className="flex items-center gap-3 group" onClick={onItemClick}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-black text-lg shadow-[0_0_15px_rgba(var(--primary),0.3)] border border-white/10 relative overflow-hidden">
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            <span className="relative z-10">FF</span>
          </div>
          <span className="font-extrabold text-xl tracking-tight text-white group-hover:text-primary transition-colors">FinanceFlow</span>
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto scrollbar-none relative z-10">
        <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4 px-3">Main Menu</div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onItemClick}
              className={cn(
                'group flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 cursor-pointer overflow-hidden relative',
                active
                  ? 'text-white bg-white/10 shadow-sm border border-white/5'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              )}
            >
              {active && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-md shadow-[0_0_10px_rgba(var(--primary),1)]"></div>
              )}
              <div className="flex items-center gap-3 relative z-10">
                <Icon className={cn("w-5 h-5 transition-transform duration-300 group-hover:scale-110", active ? "text-primary animate-pulse" : "text-zinc-500 group-hover:text-zinc-300")} />
                {item.label}
              </div>
              {/* Hover effect highlight */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none"></div>
            </Link>
          );
        })}

        <div className="mt-8 mb-4">
          <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4 px-3">Preferences</div>
          {bottomItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onItemClick}
                className={cn(
                  'group flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 cursor-pointer',
                  active
                    ? 'text-white bg-white/10'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className={cn("w-5 h-5 transition-transform group-hover:rotate-12", active ? "text-primary" : "text-zinc-500")} />
                  {item.label}
                </div>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Pro Banner */}
      <div className="p-4 relative z-10">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/5 p-4 group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/20 rounded-full blur-[30px] group-hover:bg-primary/30 transition-colors"></div>
          <div className="relative z-10 flex flex-col gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-1">Go Premium</h4>
              <p className="text-xs text-zinc-400">Unlock advanced AI insights & unlimited goals.</p>
            </div>
            <Button className="w-full text-xs h-8 bg-white text-zinc-950 hover:bg-zinc-200 mt-1 shadow-[0_0_15px_rgba(255,255,255,0.2)]">
              Upgrade Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-[280px] border-r border-border/5 bg-[#0A0A0A] flex-col sticky top-0 h-screen shadow-2xl">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Trigger (Top Left Fixed) */}
      <div className="lg:hidden fixed top-3 left-4 z-50">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button size="icon" variant="ghost" className="w-10 h-10 rounded-xl shadow-sm bg-background/50 backdrop-blur-xl border border-border/50 hover:bg-background/80 transition-all">
              <Menu className="w-5 h-5 text-foreground" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-80 border-r-0 bg-[#0A0A0A]">
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
