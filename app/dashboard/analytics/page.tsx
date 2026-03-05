'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { apiClient } from '@/lib/api-client';
import { formatCurrency } from '@/lib/utils';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowRight,
  Info,
  Calendar,
  Layers,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const fmt = (millimes: number) => formatCurrency(millimes);

export default function AnalyticsPage() {
  const [spendingByCategory, setSpendingByCategory] = useState<Array<{ category: string; amount: number }>>([]);
  const [incomeVsExpense, setIncomeVsExpense] = useState<Array<{ month: string; income: number; expense: number }>>([]);
  const [balancePrediction, setBalancePrediction] = useState<Array<{ day: string; balance: number }>>([]);
  const [monthComparison, setMonthComparison] = useState<{
    current: { income: number; expense: number; month: string; categories: Record<string, number> };
    previous: { income: number; expense: number; month: string; categories: Record<string, number> };
    hasPrev: boolean;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        // Fetch transactions
        const txRes = await apiClient.get<any>('/api/transactions');
        const rawTransactions: any[] = (txRes.data as any)?.data ?? txRes.data ?? [];

        // Build spending by category and income vs expense maps
        const catMap: Record<string, number> = {};
        const monthMap: Record<string, { income: number; expense: number; categories: Record<string, number> }> = {};

        rawTransactions.forEach((t: any) => {
          const amount = Number(t.amount ?? 0);
          const date = new Date(t.transaction_date ?? t.date ?? Date.now());
          const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });

          if (!monthMap[monthKey]) monthMap[monthKey] = { income: 0, expense: 0, categories: {} };

          if (t.type === 'expense') {
            const cat = (t.category ?? 'Other').toLowerCase();
            catMap[cat] = (catMap[cat] ?? 0) + amount;
            monthMap[monthKey].expense += amount;
            monthMap[monthKey].categories[cat] = (monthMap[monthKey].categories[cat] ?? 0) + amount;
          } else {
            monthMap[monthKey].income += amount;
          }
        });

        // Set spending components
        setSpendingByCategory(
          Object.entries(catMap)
            .map(([category, amount]) => ({ category, amount }))
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 6)
        );

        const sortedMonths = Object.entries(monthMap).sort((a, b) => {
          const [monA, yrA] = a[0].split(' ');
          const [monB, yrB] = b[0].split(' ');
          return new Date(a[0]).getTime() - new Date(b[0]).getTime();
        });

        setIncomeVsExpense(
          sortedMonths.slice(-6).map(([month, vals]) => ({ month, income: vals.income, expense: vals.expense }))
        );

        // Prep month comparison
        if (sortedMonths.length >= 1) {
          const currIdx = sortedMonths.length - 1;
          const prevIdx = sortedMonths.length - 2;
          const current = sortedMonths[currIdx];
          const previous = sortedMonths[prevIdx] || [null, { income: 0, expense: 0, categories: {} }];

          setMonthComparison({
            current: { month: current[0], ...current[1] },
            previous: { month: previous[0] || 'Previous', ...previous[1] },
            hasPrev: !!sortedMonths[prevIdx],
          });
        }

        // 90-day balance projection
        const chargesRes = await apiClient.get<any>('/api/fixed-charges');
        const charges: any[] = (chargesRes.data as any)?.data ?? chargesRes.data ?? [];

        const dashRes = await apiClient.get<any>('/api/dashboard');
        const currentBalance = Number((dashRes.data as any)?.balance ?? 0);

        let balance = currentBalance;
        const today = new Date();
        const projection: Array<{ day: string; balance: number }> = [];

        for (let i = 0; i < 90; i++) {
          const d = new Date(today);
          d.setDate(today.getDate() + i);
          const dom = d.getDate();

          charges.forEach((c: any) => {
            if (Number(c.due_day ?? c.dueDay ?? 0) === dom) {
              balance -= Number(c.amount ?? 0);
            }
          });

          projection.push({
            day: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            balance,
          });
        }

        setBalancePrediction(projection);
      } catch (err) {
        console.error('Analytics load error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const noData = spendingByCategory.length === 0 && incomeVsExpense.length === 0;

  const getPercentageChange = (curr: number, prev: number) => {
    if (prev === 0) return curr > 0 ? 100 : 0;
    return Math.round(((curr - prev) / prev) * 100);
  };

  const TrendBadge = ({ current, previous, type }: { current: number, previous: number, type: 'income' | 'expense' }) => {
    const change = getPercentageChange(current, previous);
    const isGood = type === 'income' ? change >= 0 : change <= 0;
    const isNeutral = change === 0;

    return (
      <div className={cn(
        "flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter",
        isNeutral ? "bg-muted text-muted-foreground" :
          isGood ? "bg-green-500/10 text-green-500 border border-green-500/20" :
            "bg-red-500/10 text-red-500 border border-red-500/20"
      )}>
        {isNeutral ? <Minus className="w-2.5 h-2.5" /> : change > 0 ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
        {Math.abs(change)}%
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 fade-in pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-foreground tracking-tight flex items-center gap-3">
            <Activity className="w-10 h-10 text-primary" />
            Financial Intelligence
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">Compare your performance and track spending shifts.</p>
        </div>
      </div>

      {noData ? (
        <Card className="p-12 text-center border-dashed border-2">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Layers className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold text-foreground">Awaiting Data Core</h3>
          <p className="text-muted-foreground max-w-xs mx-auto mt-2 text-sm">
            We need more transaction history to generate comparisons. Start logging your activities to unlock insights.
          </p>
        </Card>
      ) : (
        <>
          {/* Comparison Dashboard */}
          {monthComparison && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-6 relative overflow-hidden group hover:shadow-xl transition-all border-white/5">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <TrendingUp className="w-16 h-16 text-green-500" />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Monthly Income</p>
                    {monthComparison.hasPrev && <TrendBadge current={monthComparison.current.income} previous={monthComparison.previous.income} type="income" />}
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-foreground tracking-tighter">
                      {fmt(monthComparison.current.income)}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      vs {fmt(monthComparison.previous.income)} ({monthComparison.previous.month})
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 relative overflow-hidden group hover:shadow-xl transition-all border-white/5">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <TrendingDown className="w-16 h-16 text-red-500" />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Monthly Expenses</p>
                    {monthComparison.hasPrev && <TrendBadge current={monthComparison.current.expense} previous={monthComparison.previous.expense} type="expense" />}
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-foreground tracking-tighter">
                      {fmt(monthComparison.current.expense)}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      vs {fmt(monthComparison.previous.expense)} ({monthComparison.previous.month})
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 relative overflow-hidden group hover:shadow-xl transition-all border-primary/10 bg-primary/5">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Activity className="w-16 h-16 text-primary" />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary">Monthly Savings</p>
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-foreground tracking-tighter">
                      {fmt(monthComparison.current.income - monthComparison.current.expense)}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-muted-foreground">
                        Efficiency: {monthComparison.current.income > 0 ? Math.round(((monthComparison.current.income - monthComparison.current.expense) / monthComparison.current.income) * 100) : 0}%
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Detailed Category Shifts */}
          {monthComparison?.hasPrev && (
            <Card className="p-6 border-white/5 overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">Category Performance Shifts</h2>
                <div className="text-[10px] font-bold text-muted-foreground flex items-center gap-2 uppercase tracking-widest">
                  {monthComparison.previous.month} <ArrowRight className="w-3 h-3" /> {monthComparison.current.month}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.keys({ ...monthComparison.current.categories, ...monthComparison.previous.categories }).slice(0, 6).map(cat => {
                  const curr = monthComparison.current.categories[cat] || 0;
                  const prev = monthComparison.previous.categories[cat] || 0;
                  const change = curr - prev;
                  if (curr === 0 && prev === 0) return null;

                  return (
                    <div key={cat} className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-white/5">
                      <div>
                        <p className="text-xs font-bold capitalize text-foreground">{cat}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{fmt(curr)} total</p>
                      </div>
                      <div className={cn(
                        "flex flex-col items-end",
                        change > 0 ? "text-red-500" : change < 0 ? "text-green-500" : "text-muted-foreground"
                      )}>
                        <p className="text-xs font-black">{change > 0 ? '+' : ''}{fmt(change)}</p>
                        <p className="text-[9px] uppercase font-bold opacity-80">{change > 0 ? 'Increase' : change < 0 ? 'Reduced' : 'No Change'}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6 transition-all border-white/5">
              <h2 className="text-xl font-bold text-foreground mb-6">Spending by Category</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={spendingByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, percent }) =>
                      percent > 0.05 ? `${category} ${(percent * 100).toFixed(0)}%` : ''
                    }
                    outerRadius={110}
                    dataKey="amount"
                    nameKey="category"
                    stroke="none"
                  >
                    {spendingByCategory.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => fmt(Number(value))}
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '12px', border: '1px solid hsl(var(--border))' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            {incomeVsExpense.length > 0 && (
              <Card className="p-6 transition-all border-white/5">
                <h2 className="text-xl font-bold text-foreground mb-6">Income vs Expense History</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={incomeVsExpense}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)} DT`} />
                    <Tooltip
                      formatter={(value: any) => fmt(Number(value))}
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '12px', border: '1px solid hsl(var(--border))' }}
                    />
                    <Legend />
                    <Bar dataKey="income" fill="#22c55e" name="Income" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expense" fill="#ef4444" name="Expense" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            )}
          </div>
        </>
      )}

      {!noData && (
        <Card className="p-6 transition-all border-white/5">
          <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            90-Day Balance Forecast
          </h2>
          {balancePrediction.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-muted-foreground border-2 border-dashed rounded-xl">
              No balance data — add transactions to see the forecast.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={balancePrediction}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 11 }}
                  interval={Math.floor(balancePrediction.length / 10)}
                />
                <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)} DT`} />
                <Tooltip
                  formatter={(value: any) => fmt(Number(value))}
                  labelFormatter={(l) => `Date: ${l}`}
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '12px', border: '1px solid hsl(var(--border))' }}
                />
                <Line
                  type="monotone"
                  dataKey="balance"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={false}
                  name="Projected Balance"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
          <p className="text-sm text-muted-foreground mt-4 italic">
            Projection based on your current balance and scheduled fixed charges.
          </p>
        </Card>
      )}
    </div>
  );
}
