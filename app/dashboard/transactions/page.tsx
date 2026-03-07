'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import { Pencil, Trash2, Bell } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ReminderModal } from '@/components/reminders/reminder-modal';

interface Transaction {
  id: string;
  description: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  date: string;
}

const categoryOptions = {
  expense: ['groceries', 'transport', 'entertainment', 'utilities', 'food', 'shopping', 'other'],
  income: ['salary', 'freelance', 'investment', 'bonus', 'other'],
};

const fmt = (millimes: number) => formatCurrency(millimes);

const fmtDate = (d: string) =>
  d
    ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '—';

function TransactionForm({
  initial,
  onSubmit,
  onCancel,
  isLoading,
}: {
  initial?: Partial<Transaction>;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [type, setType] = useState<'income' | 'expense'>(initial?.type ?? 'expense');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [amount, setAmount] = useState(initial?.amount ? String(initial.amount / 1000) : '');
  const [category, setCategory] = useState(initial?.category ?? '');
  const [date, setDate] = useState(
    initial?.date ? new Date(initial.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
  );
  const [createReminder, setCreateReminder] = useState(false);

  const currentCategories = categoryOptions[type];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !category) {
      toast.error('Please fill in all required fields');
      return;
    }
    onSubmit({ type, description, amount, category, date, createReminder });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Type</label>
        <Select value={type} onValueChange={(v: any) => { setType(v); setCategory(''); }}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="expense">Expense</SelectItem>
            <SelectItem value="income">Income</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Description</label>
        <Input
          placeholder="e.g., Grocery shopping"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Amount (DT)</label>
        <Input
          type="number"
          placeholder="0.000"
          step="0.001"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Category</label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
          <SelectContent>
            {currentCategories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Date</label>
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>

      {type === 'expense' && !initial?.id && (
        <div className="flex items-center space-x-2 pt-2">
          <Checkbox
            id="createReminder"
            checked={createReminder}
            onCheckedChange={(v) => setCreateReminder(!!v)}
          />
          <Label htmlFor="createReminder" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Create a reminder for this expense
          </Label>
        </div>
      )}

      <div className="flex gap-2 justify-end pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : initial?.id ? 'Save Changes' : 'Add Transaction'}
        </Button>
      </div>
    </form>
  );
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Transaction | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [reminderTarget, setReminderTarget] = useState<Transaction | null>(null);

  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => { fetchTransactions(); }, []);

  const fetchTransactions = async () => {
    setIsLoading(true);
    const response = await apiClient.get<any>('/api/transactions');
    if (response.data) {
      const raw: any[] = (response.data as any).data ?? response.data ?? [];
      setTransactions(
        raw.map((t: any) => ({
          ...t,
          date: t.transaction_date ?? t.date,
        }))
      );
    }
    setIsLoading(false);
  };

  const handleAdd = async (formData: any) => {
    setIsSaving(true);
    const response = await apiClient.post('/api/transactions', {
      type: formData.type,
      description: formData.description,
      category: formData.category,
      transaction_date: formData.date,
      amount: Math.round(parseFloat(formData.amount) * 1000),
    });

    if (!response.error) {
      if (formData.createReminder) {
        // Create an automatic reminder for tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(9, 0, 0, 0);

        await apiClient.post('/api/reminders', {
          title: `Reminder: ${formData.description}`,
          description: `Automatic reminder for expense: ${formData.description} (${formData.category})`,
          dueDate: tomorrow.toISOString(),
          priority: 'medium',
        });
      }

      toast.success('Transaction added');
      setIsAddOpen(false);
      await fetchTransactions();
    } else {
      toast.error(response.error.message || 'Failed to add transaction');
    }
    setIsSaving(false);
  };

  const handleCreateReminder = async (formData: any) => {
    setIsSaving(true);
    const response = await apiClient.post('/api/reminders', {
      title: formData.title,
      description: formData.description,
      dueDate: formData.dueDate,
      priority: formData.priority,
    });

    if (!response.error) {
      toast.success('Reminder added');
      setReminderTarget(null);
    } else {
      toast.error(response.error.message || 'Failed to add reminder');
    }
    setIsSaving(false);
  };

  const handleEdit = async (formData: any) => {
    if (!editTarget) return;
    setIsSaving(true);
    const response = await apiClient.patch(`/api/transactions/${editTarget.id}`, {
      type: formData.type,
      description: formData.description,
      category: formData.category,
      transaction_date: formData.date,
      amount: Math.round(parseFloat(formData.amount) * 1000),
    });

    if (!response.error) {
      toast.success('Transaction updated');
      setEditTarget(null);
      await fetchTransactions();
    } else {
      toast.error(response.error.message || 'Failed to update transaction');
    }
    setIsSaving(false);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const response = await apiClient.delete(`/api/transactions/${id}`);
    if (!response.error) {
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      toast.success('Transaction deleted');
    } else {
      toast.error('Failed to delete transaction');
    }
    setDeletingId(null);
  };

  const filtered = transactions.filter((t) => {
    if (typeFilter !== 'all' && t.type !== typeFilter) return false;
    if (categoryFilter !== 'all' && t.category?.toLowerCase() !== categoryFilter) return false;
    if (searchQuery && !t.description.toLowerCase().includes(searchQuery.toLowerCase()) && !t.category.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const allCategories = [...new Set([...categoryOptions.expense, ...categoryOptions.income])];

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Transactions</h1>
        <Button onClick={() => setIsAddOpen(true)}>+ Add Transaction</Button>
      </div>

      <Card className="p-6">
        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex gap-2">
            <Select value={typeFilter} onValueChange={(v: any) => setTypeFilter(v)}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {allCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">💸</p>
            <p className="font-medium text-foreground mb-1">No transactions yet</p>
            <p className="text-sm text-muted-foreground">Click "Add Transaction" to record one.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between p-4 rounded-xl border border-border hover:bg-muted/40 transition-colors group"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div
                    className={`w-2 h-10 rounded-full flex-shrink-0 ${t.type === 'income' ? 'bg-green-500' : 'bg-destructive'}`}
                  />
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground truncate">{t.description}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {t.category} · {fmtDate(t.date)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <p
                    className={`font-bold text-base tabular-nums ${t.type === 'income' ? 'text-green-600' : 'text-destructive'}`}
                  >
                    {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
                  </p>

                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {t.type === 'expense' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                        onClick={() => setReminderTarget(t)}
                        title="Add Reminder"
                      >
                        <Bell className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={() => setEditTarget(t)}
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(t.id)}
                      disabled={deletingId === t.id}
                      title="Delete"
                    >
                      {deletingId === t.id ? (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Add Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Transaction</DialogTitle>
            <DialogDescription>Record a new income or expense</DialogDescription>
          </DialogHeader>
          <TransactionForm
            onSubmit={handleAdd}
            onCancel={() => setIsAddOpen(false)}
            isLoading={isSaving}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editTarget} onOpenChange={(open) => { if (!open) setEditTarget(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
            <DialogDescription>Update the transaction details</DialogDescription>
          </DialogHeader>
          {editTarget && (
            <TransactionForm
              initial={editTarget}
              onSubmit={handleEdit}
              onCancel={() => setEditTarget(null)}
              isLoading={isSaving}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Reminder Dialog */}
      {reminderTarget && (
        <ReminderModal
          isOpen={!!reminderTarget}
          onClose={() => setReminderTarget(null)}
          onSubmit={handleCreateReminder}
          initialData={{
            title: `Reminder: ${reminderTarget.description}`,
            description: `Reminder for expense: ${reminderTarget.description}`,
            priority: 'medium'
          }}
        />
      )}
    </div>
  );
}
