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

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const fmt = (millimes: number) => formatCurrency(millimes);

export default function AnalyticsPage() {
  const [spendingByCategory, setSpendingByCategory] = useState<Array<{ category: string; amount: number }>>([]);
  const [incomeVsExpense, setIncomeVsExpense] = useState<Array<{ month: string; income: number; expense: number }>>([]);
  const [balancePrediction, setBalancePrediction] = useState<Array<{ day: string; balance: number }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        // Fetch transactions
        const txRes = await apiClient.get<any>('/api/transactions');
        const rawTransactions: any[] = (txRes.data as any)?.data ?? txRes.data ?? [];

        // Build spending by category and income vs expense maps
        const catMap: Record<string, number> = {};
        const monthMap: Record<string, { income: number; expense: number }> = {};

        rawTransactions.forEach((t: any) => {
          const amount = Number(t.amount ?? 0);
          const date = new Date(t.transaction_date ?? t.date ?? Date.now());
          const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });

          if (!monthMap[monthKey]) monthMap[monthKey] = { income: 0, expense: 0 };

          if (t.type === 'expense') {
            const cat = (t.category ?? 'Other').toLowerCase();
            catMap[cat] = (catMap[cat] ?? 0) + amount;
            monthMap[monthKey].expense += amount;
          } else {
            monthMap[monthKey].income += amount;
          }
        });

        setSpendingByCategory(
          Object.entries(catMap)
            .map(([category, amount]) => ({ category, amount }))
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 6)
        );

        setIncomeVsExpense(
          Object.entries(monthMap)
            .slice(-6)
            .map(([month, vals]) => ({ month, ...vals }))
        );

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

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 fade-in">
      <h1 className="text-3xl font-bold text-foreground">Analytics &amp; Insights</h1>

      {noData && (
        <Card className="p-12 text-center">
          <p className="text-4xl mb-3">📊</p>
          <p className="text-lg font-semibold text-foreground mb-1">No data yet</p>
          <p className="text-muted-foreground">Add some transactions to see your spending insights here.</p>
        </Card>
      )}

      {spendingByCategory.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-6">Spending by Category</h2>
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
                >
                  {spendingByCategory.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => fmt(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          {incomeVsExpense.length > 0 && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-6">Income vs Expense</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={incomeVsExpense}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)} DT`} />
                  <Tooltip formatter={(value: any) => fmt(Number(value))} />
                  <Legend />
                  <Bar dataKey="income" fill="#22c55e" name="Income" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" fill="#ef4444" name="Expense" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}
        </div>
      )}

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-6">90-Day Balance Forecast</h2>
        {balancePrediction.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-muted-foreground">
            No balance data — add transactions to see the forecast.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={balancePrediction}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11 }}
                interval={Math.floor(balancePrediction.length / 10)}
              />
              <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)} DT`} />
              <Tooltip
                formatter={(value: any) => fmt(Number(value))}
                labelFormatter={(l) => `Date: ${l}`}
              />
              <Line
                type="monotone"
                dataKey="balance"
                stroke="#6366f1"
                strokeWidth={2}
                dot={false}
                name="Projected Balance"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
        <p className="text-sm text-muted-foreground mt-4">
          Projection based on your current balance and scheduled fixed charges.
        </p>
      </Card>
    </div>
  );
}
