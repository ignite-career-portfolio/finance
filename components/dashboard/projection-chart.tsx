'use client';

import { useMemo } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
    ReferenceArea,
} from 'recharts';
import { format, addDays, parseISO } from 'date-fns';
import { cn, formatCurrency } from '@/lib/utils';



interface Charge {
    id: string;
    amount: number;
    due_date?: number | string;
    transaction_date?: string;
    start_date?: string;
    end_date?: string;
    frequency?: string;
    name?: string;
    description?: string;
    type?: 'income' | 'expense';
}
interface ProjectionChartProps {
    currentBalance: number;
    fixedCharges: Charge[];
    upcomingCredits?: Charge[];
    rangeDays?: number;
}

export function ProjectionChart({ currentBalance, fixedCharges, upcomingCredits = [], rangeDays = 90 }: ProjectionChartProps) {
    // Generate projection data
    const data = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let balance = currentBalance;
        const points = [];

        for (let i = 0; i <= rangeDays; i++) {
            const currentDate = addDays(today, i);
            const currentDay = currentDate.getDate();
            const dateStr = format(currentDate, 'yyyy-MM-dd');
            let hasEvent = false;
            let dailyChange = 0;
            const events: { name: string, type: 'income' | 'expense' }[] = [];

            // Fixed charges/incomes with advanced recurrence
            fixedCharges.forEach(charge => {
                const startDateStr = charge.start_date ? charge.start_date.split('T')[0] : format(today, 'yyyy-MM-dd');
                const endDateStr = charge.end_date ? charge.end_date.split('T')[0] : null;

                // Range check using strings to avoid timezone hour issues
                if (dateStr < startDateStr || (endDateStr && dateStr > endDateStr)) return;

                const start = parseISO(startDateStr);
                const freq = charge.frequency?.toLowerCase() || 'monthly';
                const targetDueDay = charge.due_date ? Number(charge.due_date) : start.getDate();

                // Snapping the start month to fix UTC/Timezone shift (e.g. Apr 1 stored as Mar 31)
                const startYear = start.getFullYear();
                let startMonth = start.getMonth();
                if (start.getDate() > 25 && targetDueDay < 5) startMonth++;

                let isDue = false;

                if (freq === 'weekly') {
                    const daysDiff = Math.floor((currentDate.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
                    isDue = daysDiff % 7 === 0;
                } else {
                    // For monthly, quarterly, semi-annually, annually
                    const monthDiff = (currentDate.getFullYear() - startYear) * 12 + (currentDate.getMonth() - startMonth);
                    const interval = freq === 'monthly' ? 1 : freq === 'quarterly' ? 3 : freq === 'semi-annually' ? 6 : freq === 'annually' ? 12 : 1;

                    isDue = (monthDiff >= 0 && monthDiff % interval === 0) && currentDay === targetDueDay;
                }

                if (isDue) {
                    hasEvent = true;
                    const type = charge.type || 'expense';
                    if (type === 'income') {
                        dailyChange += charge.amount;
                    } else {
                        dailyChange -= charge.amount;
                    }
                    events.push({ name: charge.name || 'Recurring Item', type });
                }
            });

            // Add future transactions (one-off credits/debits)
            upcomingCredits.forEach(item => {
                const itemDate = item.transaction_date || item.due_date;
                const itemName = item.description || item.name;
                const itemType = item.type || 'income';

                if (typeof itemDate === 'string' && itemDate.startsWith(dateStr)) {
                    hasEvent = true;
                    if (itemType === 'income') {
                        dailyChange += item.amount;
                    } else {
                        dailyChange -= item.amount;
                    }
                    events.push({ name: itemName || 'Transaction', type: itemType });
                }
            });

            balance += dailyChange;

            points.push({
                date: format(currentDate, 'MMM dd'),
                fullDate: dateStr,
                balance: balance / 1000,
                hasEvent,
                events,
                dailyChange: dailyChange / 1000,
                dotSize: hasEvent ? 6 : 0,
            });
        }

        return points;
    }, [currentBalance, fixedCharges, upcomingCredits, rangeDays]);

    const chartColor = 'hsl(var(--primary))';

    return (
        <div className="h-[400px] w-full mt-4 bg-card rounded-xl p-4 border border-border/50 shadow-sm relative group">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={chartColor} stopOpacity={0.15} />
                            <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="hsl(var(--border))"
                    />
                    <XAxis
                        dataKey="date"
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        tickMargin={15}
                        minTickGap={40}
                        interval="preserveStartEnd"
                    />
                    <YAxis
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(value) => `${value} DT`}
                        width={80}
                    />

                    <ReferenceLine y={0} stroke="hsl(var(--destructive))" strokeOpacity={0.5} strokeDasharray="3 3" />

                    <Tooltip
                        cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '4 4' }}
                        content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                    <div className="bg-card border border-border p-4 rounded-xl shadow-xl min-w-[220px]">
                                        <div className="flex justify-between items-center mb-4 border-b border-border pb-2">
                                            <p className="text-sm font-bold text-foreground">{data.date}</p>
                                            <p className={cn("text-xs font-bold", data.dailyChange >= 0 ? "text-green-500" : "text-destructive")}>
                                                {data.dailyChange >= 0 ? '+' : ''}{formatCurrency(data.dailyChange * 1000)}
                                            </p>
                                        </div>

                                        <div className="mb-2">
                                            <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">Projected Balance</p>
                                            <p className="text-2xl font-black text-foreground tracking-tight">
                                                {formatCurrency(data.balance * 1000)}
                                            </p>
                                        </div>

                                        {data.hasEvent && (
                                            <div className="space-y-1.5 pt-2 mt-2 border-t border-border/50">
                                                {data.events.map((e: any, idx: number) => (
                                                    <div key={idx} className="flex items-center gap-2 text-xs">
                                                        <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", e.type === 'income' ? "bg-green-500" : "bg-destructive")} />
                                                        <span className="text-muted-foreground truncate flex-1">{e.name}</span>
                                                        <span className={cn("font-medium", e.type === 'income' ? "text-green-600" : "text-destructive")}>
                                                            {e.type === 'income' ? 'Income' : 'Expense'}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            }
                            return null;
                        }}
                    />

                    <Area
                        type="monotone"
                        dataKey="balance"
                        stroke={chartColor}
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorBalance)"
                        activeDot={{ r: 5, fill: chartColor, stroke: 'hsl(var(--background))', strokeWidth: 3 }}
                        dot={(props: any) => {
                            const { cx, cy, payload } = props;
                            if (payload.hasEvent) {
                                return (
                                    <circle
                                        cx={cx}
                                        cy={cy}
                                        r={3.5}
                                        fill={payload.events.some((e: any) => e.type === 'income') ? '#10b981' : '#ef4444'}
                                        stroke="hsl(var(--background))"
                                        strokeWidth={1.5}
                                    />
                                );
                            }
                            return <svg></svg>;
                        }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
