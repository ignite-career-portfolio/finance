'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', balance: 24000 },
  { name: 'Feb', balance: 26500 },
  { name: 'Mar', balance: 25800 },
  { name: 'Apr', balance: 28200 },
  { name: 'May', balance: 30100 },
  { name: 'Jun', balance: 32500 },
  { name: 'Jul', balance: 34800 },
];

export function BalanceChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
        <XAxis
          dataKey="name"
          stroke="var(--color-muted-foreground)"
          style={{ fontSize: '12px' }}
        />
        <YAxis
          stroke="var(--color-muted-foreground)"
          style={{ fontSize: '12px' }}
          tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--color-card)',
            border: '1px solid var(--color-border)',
            borderRadius: '0.5rem',
          }}
          formatter={(value) => `$${(value / 100).toFixed(2)}`}
        />
        <Line
          type="monotone"
          dataKey="balance"
          stroke="var(--color-primary)"
          strokeWidth={2}
          dot={{ fill: 'var(--color-primary)', r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
