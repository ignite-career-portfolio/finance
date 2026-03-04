'use client';

import { Suspense, useMemo, useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { apiClient } from '@/lib/api-client';
import { useQuery } from '@tanstack/react-query';
import { ProjectionChart } from '@/components/dashboard/projection-chart';
import { SmartAlerts } from '@/components/dashboard/smart-alerts';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { RecentTransactions } from '@/components/dashboard/recent-transactions';
import { cn, formatCurrency } from '@/lib/utils';
import { addDays } from 'date-fns';
import { ShieldAlert } from 'lucide-react';



export default function DashboardPage() {
  const [projectionDays, setProjectionDays] = useState(90);

  const { data: dashboardData, isLoading: isDashboardLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => apiClient.get<any>('/api/dashboard').then(res => res.data)
  });

  const { data: fixedChargesList, isLoading: isChargesLoading } = useQuery({
    queryKey: ['fixedCharges'],
    queryFn: () => apiClient.get<any[]>('/api/fixed-charges').then(res => (res as any).data || [])
  });

  // Example mappings
  const currentBalance = dashboardData?.balance || 0;
  const reminders = dashboardData?.upcomingReminders || [];

  // Transform budget data to fit SmartAlerts component expectations
  const budgetStatus = useMemo(() => {
    if (!dashboardData?.budget) return [];
    return dashboardData.budget.map((b: any) => ({
      category: b.category,
      spent: b.spent || 0,
      limit: b.budgeted_amount
    }));
  }, [dashboardData]);

  const minProjectedBalance = useMemo(() => {
    if (!fixedChargesList) return currentBalance;

    let minBal = currentBalance;
    let runningBal = currentBalance;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Simulate based on selected window to find true minimum
    for (let i = 0; i <= projectionDays; i++) {
      const currentDate = addDays(today, i);
      const currentDay = currentDate.getDate();
      const dateStr = currentDate.toISOString().split('T')[0];
      let dailyChange = 0;

      // Fixed charges logic mirroring the chart
      fixedChargesList.forEach((charge: any) => {
        const startStr = charge.start_date?.split('T')[0] || today.toISOString().split('T')[0];
        const endStr = charge.end_date?.split('T')[0];

        if (dateStr < startStr || (endStr && dateStr > endStr)) return;

        const start = new Date(startStr);
        const freq = charge.frequency?.toLowerCase() || 'monthly';
        const targetDay = charge.due_date ? Number(charge.due_date) : start.getDate();

        // Fix: Snap start month for UTC shift
        const sYear = start.getFullYear();
        let sMonth = start.getMonth();
        if (start.getDate() > 25 && targetDay < 5) sMonth++;

        let isDue = false;
        if (freq === 'weekly') {
          const days = Math.floor((currentDate.getTime() - start.getTime()) / 86400000);
          isDue = days >= 0 && days % 7 === 0;
        } else {
          const mDiff = (currentDate.getFullYear() - sYear) * 12 + (currentDate.getMonth() - sMonth);
          const interval = freq === 'monthly' ? 1 : freq === 'quarterly' ? 3 : freq === 'semi-annually' ? 6 : freq === 'annually' ? 12 : 1;
          isDue = mDiff >= 0 && mDiff % interval === 0 && currentDay === targetDay;
        }

        if (isDue) {
          if (charge.type === 'income') dailyChange += charge.amount;
          else dailyChange -= charge.amount;
        }
      });

      // Include future one-off transactions too
      dashboardData?.futureTransactions?.forEach((item: any) => {
        const itemDate = (item.transaction_date || item.due_date)?.split('T')[0];
        if (itemDate === dateStr) {
          if (item.type === 'income') dailyChange += item.amount;
          else dailyChange -= item.amount;
        }
      });

      runningBal += dailyChange;
      if (runningBal < minBal) minBal = runningBal;
    }

    return minBal;
  }, [currentBalance, fixedChargesList, dashboardData?.futureTransactions, projectionDays]);

  if (isDashboardLoading || isChargesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px] animate-pulse">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 fade-in pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">Financial Overview</h1>
          <p className="text-sm text-muted-foreground">Track your progress and projections</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 sm:p-6 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent border-primary/20 shadow-2xl group hover:shadow-primary/20 transition-all relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <ShieldAlert className="w-12 h-12 text-primary" />
          </div>
          <div className="relative z-10 space-y-2">
            <p className="text-xs sm:text-sm font-bold text-primary tracking-widest uppercase opacity-70">Total Balance</p>
            <p className="text-3xl sm:text-4xl font-black text-foreground tracking-tighter">
              {formatCurrency(currentBalance)}
            </p>
          </div>
        </Card>

        <Card className="p-5 sm:p-6 shadow-md hover:shadow-lg transition-all border-white/5 bg-card/50 backdrop-blur-sm">
          <div className="space-y-2">
            <p className="text-xs sm:text-sm font-bold text-muted-foreground tracking-widest uppercase opacity-70">Monthly Income</p>
            <p className="text-2xl sm:text-3xl font-bold text-green-500">
              {formatCurrency(dashboardData?.income || 0)}
            </p>
          </div>
        </Card>

        <Card className="p-5 sm:p-6 shadow-md hover:shadow-lg transition-all border-white/5 bg-card/50 backdrop-blur-sm sm:p-6">
          <div className="space-y-2">
            <p className="text-xs sm:text-sm font-bold text-muted-foreground tracking-widest uppercase opacity-70">Monthly Expenses</p>
            <p className="text-2xl sm:text-3xl font-bold text-destructive">
              {formatCurrency(dashboardData?.expenses || 0)}
            </p>
          </div>
        </Card>

        <Card className="p-5 sm:p-6 shadow-md hover:shadow-lg transition-all border-white/5 bg-card/50 backdrop-blur-sm relative overflow-hidden">
          <div className="relative z-10 space-y-2">
            <p className="text-xs sm:text-sm font-bold text-muted-foreground tracking-widest uppercase opacity-70">Savings Progress</p>
            <p className="text-2xl sm:text-3xl font-bold text-primary">
              {dashboardData?.savings?.progress || 0}%
            </p>
          </div>
          <div
            className="absolute bottom-0 inset-x-0 bg-primary/10 transition-all duration-1000"
            style={{ height: `${dashboardData?.savings?.progress || 0}%` }}
          />
        </Card>
      </div>

      <SmartAlerts
        reminders={reminders}
        budgetStatus={budgetStatus}
        projectedMinBalance={minProjectedBalance}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="p-6 shadow-md border-border/50 h-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-foreground">{projectionDays}-Day Projection</h2>
                <p className="text-sm text-muted-foreground">Predicted balance based on fixed charges.</p>
              </div>
              <Tabs value={String(projectionDays)} onValueChange={(v) => setProjectionDays(Number(v))} className="w-full sm:w-auto">
                <TabsList className="grid grid-cols-4 w-full sm:w-80 bg-background/50 border border-border/50">
                  <TabsTrigger value="30" className="text-[10px] uppercase font-bold tracking-widest">1M</TabsTrigger>
                  <TabsTrigger value="90" className="text-[10px] uppercase font-bold tracking-widest">3M</TabsTrigger>
                  <TabsTrigger value="180" className="text-[10px] uppercase font-bold tracking-widest">6M</TabsTrigger>
                  <TabsTrigger value="365" className="text-[10px] uppercase font-bold tracking-widest">1Y</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            {/* The requirement: Show day-by-day projection as a line chart for selected range. Mark each day a charge is deducted with a dot on the chart. */}
            <ProjectionChart
              currentBalance={currentBalance}
              fixedCharges={fixedChargesList || []}
              upcomingCredits={dashboardData?.futureTransactions || []}
              rangeDays={projectionDays}
            />
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card className="p-6 shadow-md border-border/50 flex-1">
            <h2 className="text-xl font-bold text-foreground mb-6">Budget Overview</h2>
            <div className="space-y-6">
              {budgetStatus.length > 0 ? budgetStatus.map((budget: any) => (
                <div key={budget.category} className="space-y-2 group">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-foreground group-hover:text-primary transition-colors">{budget.category}</p>
                    <p className="text-sm font-medium text-muted-foreground table-tabular">
                      {formatCurrency(budget.spent)} / {formatCurrency(budget.limit)}
                    </p>
                  </div>
                  <div className="w-full h-2.5 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-700 ease-out ${(budget.spent / budget.limit) > 0.9
                        ? 'bg-destructive shadow-[0_0_10px_rgba(239,68,68,0.5)]'
                        : (budget.spent / budget.limit) > 0.7
                          ? 'bg-yellow-500'
                          : 'bg-primary'
                        }`}
                      style={{ width: `${Math.min((budget.spent / budget.limit) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-3">
                    <span className="text-2xl">📊</span>
                  </div>
                  <p className="text-muted-foreground">No budgets set</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {dashboardData?.recentTransactions && dashboardData.recentTransactions.length > 0 && (
        <Card className="p-6 shadow-md border-border/50">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-foreground">Recent Transactions</h2>
              <p className="text-sm text-muted-foreground">Your latest financial activity.</p>
            </div>
          </div>
          <RecentTransactions transactions={dashboardData.recentTransactions} />
        </Card>
      )}

      <QuickActions />
    </div>
  );
}
