'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '@/lib/user-context';
import { Button } from '@/components/ui/button';
import { Search, Bell, LogOut, Settings, User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const routeNames: Record<string, string> = {
  '/dashboard': 'Overview',
  '/dashboard/transactions': 'Transactions',
  '/dashboard/budget': 'Budget Planning',
  '/dashboard/savings': 'Savings Goals',
  '/dashboard/analytics': 'Analytics',
  '/dashboard/reminders': 'Reminders',
  '/dashboard/fixed-charges': 'Recurring Charges',
  '/dashboard/todos': 'Todo List',
};

export function TopNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useUser();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const pageTitle = routeNames[pathname] || 'Dashboard';

  return (
    <header className="sticky top-0 z-30 border-b border-border/40 bg-background/60 backdrop-blur-2xl px-6 py-4 flex items-center justify-between transition-all duration-300">

      {/* Search Bar / Command Palette (Left) */}
      <div className="flex items-center gap-4 flex-1">
        <div className="lg:hidden w-10 sm:w-16" aria-hidden="true" /> {/* Spacer for mobile menu button */}

        <div className="hidden md:flex items-center gap-2 max-w-sm w-full bg-muted/40 border border-border/50 rounded-xl px-3 py-2 text-sm text-muted-foreground shadow-sm hover:bg-muted/60 transition-colors focus-within:ring-1 focus-within:ring-primary focus-within:border-primary">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            type="text"
            placeholder="Search transactions, budgets..."
            className="bg-transparent border-none outline-none w-full placeholder:text-muted-foreground/70"
          />
          <div className="shrink-0 flex items-center gap-1 bg-background border border-border/60 rounded px-1.5 py-0.5 text-[10px] font-medium shadow-sm">
            <span className="text-muted-foreground">⌘</span>K
          </div>
        </div>

        {/* Dynamic Title for mobile/tablet when search is hidden */}
        <h1 className="md:hidden text-lg font-bold tracking-tight text-foreground">{pageTitle}</h1>
      </div>

      {/* Dynamic Title (Center for Desktop) */}
      <div className="hidden md:flex flex-1 justify-center">
        <h1 className="text-xl font-bold tracking-tight text-foreground relative">
          {pageTitle}
        </h1>
      </div>

      {/* Actions (Right) */}
      <div className="flex items-center justify-end gap-3 flex-1">

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-secondary w-9 h-9">
          <Bell className="w-4 h-4 text-muted-foreground" />
          <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-primary ring-2 ring-background"></span>
        </Button>

        {/* User Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="p-0 h-auto rounded-full group focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-shadow">
              <div className="relative">
                <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-primary to-blue-500 opacity-0 group-hover:opacity-30 blur-sm transition-opacity"></div>
                <div className="relative w-9 h-9 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white text-sm font-bold shadow-md border-2 border-background">
                  {user?.email?.charAt(0).toUpperCase()}
                </div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl shadow-xl border border-border/50 bg-background/95 backdrop-blur-3xl">
            <DropdownMenuLabel className="font-normal px-2 py-3">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-bold leading-none">{user?.name}</p>
                <p className="text-xs text-muted-foreground leading-none">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border/50 mx-2" />
            <div className="px-1 py-1 space-y-1">
              <DropdownMenuItem className="rounded-lg gap-2 focus:bg-primary/5 focus:text-primary cursor-pointer text-muted-foreground">
                <User className="w-4 h-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-lg gap-2 focus:bg-primary/5 focus:text-primary cursor-pointer text-muted-foreground">
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </DropdownMenuItem>
            </div>
            <DropdownMenuSeparator className="bg-border/50 mx-2" />
            <div className="px-1 py-1">
              <DropdownMenuItem className="rounded-lg gap-2 text-red-500 focus:bg-red-500/10 focus:text-red-600 cursor-pointer transition-colors" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
                <span className="font-medium">Logout</span>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
