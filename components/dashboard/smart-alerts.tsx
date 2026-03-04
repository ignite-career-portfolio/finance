import { AlertCircle, CalendarClock, TrendingDown, Info, ShieldAlert } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { Card } from '@/components/ui/card';

interface SmartAlertsProps {
    reminders: any[];
    budgetStatus: any[];
    projectedMinBalance: number;
}

export function SmartAlerts({ reminders, budgetStatus, projectedMinBalance }: SmartAlertsProps) {
    const today = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(today.getDate() + 3);

    const criticalReminders = reminders?.filter(r => {
        const dueDate = new Date(r.due_date);
        return dueDate <= threeDaysFromNow && dueDate >= today && !r.is_completed;
    }) || [];

    const budgetWarnings = budgetStatus?.filter(b => b.spent >= b.limit * 0.8) || [];

    const hasAlerts = projectedMinBalance < 0 || budgetWarnings.length > 0 || criticalReminders.length > 0;

    if (!hasAlerts) {
        return (
            <Card className="p-6 bg-secondary/30 border-dashed border-2 flex flex-col items-center justify-center text-center space-y-2 opacity-60">
                <Info className="w-8 h-8 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground">Financial Status: Healthy</p>
                <p className="text-xs text-muted-foreground">No critical alerts or upcoming issues detected.</p>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4 px-1 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-primary" />
                Financial Intelligence
            </h2>

            {/* Critical Low Balance Warning */}
            {projectedMinBalance < 0 && (
                <div className="relative overflow-hidden group">
                    <div className="absolute inset-0 bg-destructive/5 group-hover:bg-destructive/10 transition-colors" />
                    <div className="relative p-4 border border-destructive/20 rounded-xl flex items-start gap-4">
                        <div className="p-2 bg-destructive/10 rounded-lg text-destructive">
                            <TrendingDown className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-black text-destructive uppercase tracking-tight">Critical Balance Warning</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Your balance is projected to drop below zero. Expected minimum: <span className="font-bold text-destructive">{formatCurrency(projectedMinBalance)}</span>
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Budget Overspending Warnings */}
            {budgetWarnings.map((budget, i) => {
                const isOver = budget.spent >= budget.limit;
                return (
                    <div key={`budget-${i}`} className="relative overflow-hidden group">
                        <div className={cn("absolute inset-0 transition-colors", isOver ? "bg-red-500/5 group-hover:bg-red-500/10" : "bg-amber-500/5 group-hover:bg-amber-500/10")} />
                        <div className={cn("relative p-4 border rounded-xl flex items-start gap-4", isOver ? "border-red-500/20" : "border-amber-500/20")}>
                            <div className={cn("p-2 rounded-lg", isOver ? "bg-red-500/10 text-red-500" : "bg-amber-500/10 text-amber-500")}>
                                <AlertCircle className="h-6 w-6" />
                            </div>
                            <div className="flex-1">
                                <p className={cn("text-sm font-black uppercase tracking-tight", isOver ? "text-red-500" : "text-amber-500")}>
                                    {isOver ? 'Budget Exceeded' : 'Budget Limit Nearing'}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    You've used <span className="font-bold text-foreground">{((budget.spent / budget.limit) * 100).toFixed(0)}%</span> of your <span className="font-bold capitalize">{budget.category}</span> budget.
                                </p>
                            </div>
                        </div>
                    </div>
                );
            })}

            {/* Upcoming Hot Reminders */}
            {criticalReminders.map((reminder, i) => (
                <div key={`reminder-${i}`} className="relative overflow-hidden group">
                    <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors" />
                    <div className="relative p-4 border border-primary/20 rounded-xl flex items-start gap-4">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <CalendarClock className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-black text-primary uppercase tracking-tight">Upcoming Payment Due</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                <span className="font-bold text-foreground">{reminder.title}</span> is due in {Math.ceil((new Date(reminder.due_date).getTime() - today.getTime()) / (1000 * 3600 * 24))} days.
                            </p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
