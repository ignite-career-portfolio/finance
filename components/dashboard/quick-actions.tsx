'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, ListTodo, CalendarClock, Receipt, ArrowRightLeft } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { TransactionModal } from '@/components/transactions/transaction-modal';
import { ReminderModal } from '@/components/reminders/reminder-modal';
import { TodoModal } from '@/components/todos/todo-modal';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

export function QuickActions() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeModal, setActiveModal] = useState<'transaction' | 'expense' | 'reminder' | 'todo' | null>(null);
    const queryClient = useQueryClient();

    const handleTransactionSubmit = async (data: any) => {
        const response = await apiClient.post('/api/transactions', {
            ...data,
            amount: Math.round(parseFloat(data.amount) * 1000),
            transaction_date: data.date
        });

        if (!response.error) {
            toast.success('Transaction added');
            setActiveModal(null);
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        } else {
            toast.error(response.error.message);
        }
    };

    const handleReminderSubmit = async (data: any) => {
        const response = await apiClient.post('/api/reminders', data);
        if (!response.error) {
            toast.success('Reminder added');
            setActiveModal(null);
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        } else {
            toast.error(response.error.message);
        }
    };

    const handleTodoSubmit = async (data: any) => {
        const response = await apiClient.post('/api/todos', data);
        if (!response.error) {
            toast.success('Task added');
            setActiveModal(null);
        } else {
            toast.error(response.error.message);
        }
    };

    const actions = [
        { id: 'transaction', name: 'Income', icon: <Plus className="w-5 h-5" />, color: 'bg-green-500/10 text-green-600' },
        { id: 'expense', name: 'Expense', icon: <Receipt className="w-5 h-5" />, color: 'bg-red-500/10 text-red-600' },
        { id: 'reminder', name: 'Reminder', icon: <CalendarClock className="w-5 h-5" />, color: 'bg-amber-500/10 text-amber-600' },
        { id: 'todo', name: 'Todo', icon: <ListTodo className="w-5 h-5" />, color: 'bg-purple-500/10 text-purple-600' }
    ];

    return (
        <>
            <Dialog open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <DialogTrigger asChild>
                    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-3 group animate-float">
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-background/80 backdrop-blur-md border border-border px-3 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase shadow-xl pointer-events-none">
                            Quick Actions
                        </span>
                        <div className="relative">
                            {/* Pulse Effect Rings */}
                            <div className="absolute -inset-2 bg-primary/20 rounded-full animate-pulse blur-md" />
                            <div className="absolute -inset-1 bg-primary/30 rounded-full animate-ping blur-sm opacity-20" />

                            <Button
                                className="h-16 w-16 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] z-10 hover:scale-110 active:scale-95 transition-all duration-300 bg-gradient-to-br from-primary via-primary to-indigo-600 text-primary-foreground border-none"
                                size="icon"
                            >
                                <Plus className={`w-8 h-8 transition-transform duration-500 ${isMenuOpen ? 'rotate-45' : ''}`} />
                            </Button>
                        </div>
                    </div>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Quick Actions</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4 py-4">
                        {actions.map((action) => (
                            <Button
                                key={action.id}
                                variant="outline"
                                className="h-24 flex flex-col items-center justify-center gap-3 rounded-xl border-dashed hover:border-solid hover:bg-muted/50 transition-all"
                                onClick={() => {
                                    setActiveModal(action.id as any);
                                    setIsMenuOpen(false);
                                }}
                            >
                                <div className={`p-3 rounded-xl ${action.color}`}>
                                    {action.icon}
                                </div>
                                <span className="font-medium">Add {action.name}</span>
                            </Button>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>

            <TransactionModal
                isOpen={activeModal === 'transaction' || activeModal === 'expense'}
                onClose={() => setActiveModal(null)}
                onSubmit={handleTransactionSubmit}
                defaultType={activeModal === 'transaction' ? 'income' : 'expense'}
            />

            <ReminderModal
                isOpen={activeModal === 'reminder'}
                onClose={() => setActiveModal(null)}
                onSubmit={handleReminderSubmit}
            />

            <TodoModal
                isOpen={activeModal === 'todo'}
                onClose={() => setActiveModal(null)}
                onSubmit={handleTodoSubmit}
            />
        </>
    );
}
