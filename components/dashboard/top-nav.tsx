'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '@/lib/user-context';
import { Button } from '@/components/ui/button';
import { Search, Bell, LogOut, Settings, User, CheckCircle2, Circle, Clock, ListTodo } from 'lucide-react';
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNotifications } from '@/lib/notification-context';

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
  const { totalPending, refreshCounts } = useNotifications();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const [reminders, setReminders] = useState<any[]>([]);
  const [todos, setTodos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [remResponse, todoResponse] = await Promise.all([
        apiClient.get<any[]>('/api/reminders'),
        apiClient.get<any[]>('/api/todos')
      ]);

      if (remResponse.data) {
        const raw = (remResponse.data as any).data ?? remResponse.data ?? [];
        setReminders(raw.map((r: any) => ({
          ...r,
          dueDate: r.due_date ?? r.dueDate,
          isCompleted: r.is_completed ?? r.isCompleted ?? false,
        })));
      }

      if (todoResponse.data) {
        const raw = (todoResponse.data as any).data ?? todoResponse.data ?? [];
        setTodos(raw.map((t: any) => ({
          ...t,
          isCompleted: t.is_completed ?? t.isCompleted ?? false,
        })));
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
      refreshCounts();
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleReminder = async (id: string, currentStatus: boolean) => {
    const response = await apiClient.patch(`/api/reminders/${id}`, {
      is_completed: !currentStatus,
    });
    if (!response.error) {
      setReminders(prev => prev.map(r => r.id === id ? { ...r, isCompleted: !currentStatus } : r));
      toast.success(currentStatus ? 'Reminder unmarked' : 'Reminder completed');
      refreshCounts();
    }
  };

  const toggleTodo = async (id: string, currentStatus: boolean) => {
    const response = await apiClient.patch(`/api/todos/${id}`, {
      is_completed: !currentStatus,
    });
    if (!response.error) {
      setTodos(prev => prev.map(t => t.id === id ? { ...t, isCompleted: !currentStatus } : t));
      toast.success(currentStatus ? 'Task active' : 'Task completed! 🚀');
      refreshCounts();
    }
  };

  const pendingReminders = reminders.filter(r => !r.isCompleted);
  const pendingTodos = todos.filter(t => !t.isCompleted);
  // Using global totalPending for the badge, but local counts for dropdown UI elements if needed

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
        <DropdownMenu onOpenChange={(open) => open && fetchData()}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-secondary w-9 h-9 transition-all active:scale-95">
              <Bell className={cn("w-4 h-4 text-muted-foreground", totalPending > 0 && "animate-none")} />
              {totalPending > 0 && (
                <span className="absolute -top-1 -right-0.5 flex items-center justify-center bg-primary text-[10px] font-black text-primary-foreground min-w-[18px] h-[18px] px-1 rounded-full ring-2 ring-background shadow-lg shadow-primary/20 animate-in zoom-in-50 duration-300">
                  {totalPending > 99 ? '99+' : totalPending}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 p-0 overflow-hidden rounded-2xl shadow-2xl border border-border/50 bg-background/95 backdrop-blur-3xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-border/50 bg-muted/30">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-bold text-sm">Notifications</h2>
                {totalPending > 0 && (
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-[10px] font-bold h-5">
                    {totalPending} PENDING
                  </Badge>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground">Manage your reminders and tasks</p>
            </div>

            <Tabs defaultValue="reminders" className="w-full">
              <TabsList className="w-full justify-start rounded-none border-b border-border/50 bg-transparent h-10 p-0 px-2 gap-2">
                <TabsTrigger value="reminders" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent h-10 px-3 text-xs font-bold transition-all">
                  Reminders
                </TabsTrigger>
                <TabsTrigger value="todos" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent h-10 px-3 text-xs font-bold transition-all">
                  Tasks
                </TabsTrigger>
              </TabsList>

              <TabsContent value="reminders" className="m-0">
                <ScrollArea className="h-[300px]">
                  <div className="p-2 space-y-1">
                    {reminders.length === 0 ? (
                      <div className="py-10 text-center space-y-2">
                        <Clock className="w-8 h-8 mx-auto text-muted-foreground/30" />
                        <p className="text-xs text-muted-foreground">No reminders found</p>
                      </div>
                    ) : (
                      reminders.sort((a, b) => Number(a.isCompleted) - Number(b.isCompleted)).map(reminder => (
                        <div
                          key={reminder.id}
                          className={cn(
                            "flex items-start gap-3 p-2 rounded-lg transition-colors group cursor-pointer hover:bg-muted/50",
                            reminder.isCompleted && "opacity-50"
                          )}
                          onClick={() => toggleReminder(reminder.id, reminder.isCompleted)}
                        >
                          <div className="mt-1">
                            {reminder.isCompleted ? (
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                            ) : (
                              <Circle className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            )}
                          </div>
                          <div className="space-y-1 flex-1">
                            <p className={cn("text-xs font-medium leading-none", reminder.isCompleted && "line-through text-muted-foreground")}>
                              {reminder.title}
                            </p>
                            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                              {new Date(reminder.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="todos" className="m-0">
                <ScrollArea className="h-[300px]">
                  <div className="p-2 space-y-1">
                    {todos.length === 0 ? (
                      <div className="py-10 text-center space-y-2">
                        <ListTodo className="w-8 h-8 mx-auto text-muted-foreground/30" />
                        <p className="text-xs text-muted-foreground">No tasks found</p>
                      </div>
                    ) : (
                      todos.sort((a, b) => Number(a.isCompleted) - Number(b.isCompleted)).map(todo => (
                        <div
                          key={todo.id}
                          className={cn(
                            "flex items-start gap-3 p-2 rounded-lg transition-colors group cursor-pointer hover:bg-muted/50",
                            todo.isCompleted && "opacity-50"
                          )}
                          onClick={() => toggleTodo(todo.id, todo.isCompleted)}
                        >
                          <div className="mt-1">
                            {todo.isCompleted ? (
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                            ) : (
                              <Circle className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            )}
                          </div>
                          <div className="space-y-1 flex-1">
                            <p className={cn("text-xs font-medium leading-none", todo.isCompleted && "line-through text-muted-foreground")}>
                              {todo.title}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              Added {new Date(todo.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>

            <div className="p-2 border-t border-border/50 bg-muted/10">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-center text-[11px] font-bold text-muted-foreground hover:text-primary hover:bg-primary/5 h-8 gap-2"
                onClick={() => router.push('/dashboard/reminders')}
              >
                View all activity
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

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
