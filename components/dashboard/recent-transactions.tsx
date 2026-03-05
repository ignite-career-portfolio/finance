'use client';

import { formatCurrency } from '@/lib/utils';

interface Transaction {
  id: string;
  description: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  date?: string;
  transaction_date?: string;
}

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {


  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '—';

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      groceries: '🛒',
      transport: '🚗',
      entertainment: '🎬',
      utilities: '💡',
      salary: '💼',
      freelance: '💻',
      investment: '📈',
      other: '📌',
    };
    return icons[category.toLowerCase()] || '📌';
  };

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No transactions yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((transaction) => (
        <div
          key={transaction.id}
          className="flex items-center justify-between py-3 px-3 rounded-lg hover:bg-secondary/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="text-2xl">{getCategoryIcon(transaction.category)}</div>
            <div>
              <p className="text-sm font-medium text-foreground">{transaction.description}</p>
              <p className="text-xs text-muted-foreground">{formatDate(transaction.transaction_date ?? transaction.date)}</p>
            </div>
          </div>
          <p
            className={`text-sm font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-destructive'
              }`}
          >
            {transaction.type === 'income' ? '+' : '-'}
            {formatCurrency(transaction.amount)}
          </p>
        </div>
      ))}
    </div>
  );
}
