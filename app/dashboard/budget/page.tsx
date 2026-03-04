'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import { BudgetModal } from '@/components/budget/budget-modal';
import { formatCurrency } from '@/lib/utils';

interface BudgetCategory {
  id: string;
  category: string;
  limit: number;
  spent: number;
  month: string;
}

const categoryList = ['Groceries', 'Transport', 'Entertainment', 'Utilities', 'Food', 'Shopping'];

export default function BudgetPage() {
  const [budgets, setBudgets] = useState<BudgetCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    const response = await apiClient.get<BudgetCategory[]>('/api/budget');
    if (response.data) {
      const raw = (response.data as any).data ?? response.data ?? [];
      // DB returns budgeted_amount, UI uses limit
      setBudgets(raw.map((b: any) => ({
        ...b,
        limit: b.budgeted_amount ?? b.limit,
        spent: b.spent ?? 0,
      })));
    }
    setIsLoading(false);
  };

  const handleAddBudget = async (formData: any) => {
    const response = await apiClient.post('/api/budget', {
      category: formData.category,
      budgeted_amount: Math.round(parseFloat(formData.limit) * 1000),
    });

    if (response.data) {
      setBudgets([response.data as any, ...budgets]);
      toast.success('Budget created successfully');
      setIsModalOpen(false);
    } else {
      toast.error(response.error?.message || 'Failed to create budget');
    }
  };

  const handleDeleteBudget = async (id: string) => {
    const response = await apiClient.delete(`/api/budget/${id}`);
    if (response.data) {
      setBudgets(budgets.filter((b) => b.id !== id));
      toast.success('Budget deleted');
    } else {
      toast.error('Failed to delete budget');
    }
  };



  const getStatusColor = (spent: number, limit: number) => {
    const percentage = (spent / limit) * 100;
    if (percentage >= 100) return 'bg-destructive';
    if (percentage >= 80) return 'bg-yellow-500';
    return 'bg-primary';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Budget Planning</h1>
        <Button onClick={() => setIsModalOpen(true)}>Create Budget</Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading budgets...</p>
        </div>
      ) : budgets.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground mb-4">No budgets created yet</p>
          <Button onClick={() => setIsModalOpen(true)}>Create Your First Budget</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {budgets.map((budget) => {
            const percentage = Math.min((budget.spent / budget.limit) * 100, 100);
            const remaining = budget.limit - budget.spent;

            return (
              <Card key={budget.id} className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-foreground capitalize">
                      {budget.category}
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteBudget(budget.id)}
                    >
                      Delete
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">Spending Progress</p>
                      <p className="text-sm font-medium text-foreground">
                        {percentage.toFixed(0)}%
                      </p>
                    </div>
                    <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${getStatusColor(budget.spent, budget.limit)}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                    <div>
                      <p className="text-xs text-muted-foreground">Spent</p>
                      <p className="text-lg font-semibold text-destructive">
                        {formatCurrency(budget.spent)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Budget</p>
                      <p className="text-lg font-semibold text-foreground">
                        {formatCurrency(budget.limit)}
                      </p>
                    </div>
                  </div>

                  <div className="bg-secondary/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">Remaining</p>
                    <p
                      className={`text-xl font-bold ${remaining >= 0 ? 'text-green-600' : 'text-destructive'
                        }`}
                    >
                      {formatCurrency(Math.abs(remaining))}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <BudgetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddBudget}
        categories={categoryList}
      />
    </div>
  );
}
