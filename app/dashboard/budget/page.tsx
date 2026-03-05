'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { BudgetModal } from '@/components/budget/budget-modal';
import { formatCurrency } from '@/lib/utils';

interface BudgetCategory {
  id: string;
  category: string;
  limit: number;
  spent: number;
  month: string;
  notes?: string;
}

const categoryList = ['Groceries', 'Transport', 'Entertainment', 'Utilities', 'Food', 'Shopping'];

export default function BudgetPage() {
  const [budgets, setBudgets] = useState<BudgetCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<BudgetCategory | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BudgetCategory | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleFormSubmit = async (formData: any) => {
    const payload = {
      category: formData.category,
      budgeted_amount: Math.round(parseFloat(formData.limit) * 1000),
      month_year: new Date().toISOString().slice(0, 7), // Ensure month_year is sent
      notes: formData.notes
    };

    let response;
    if (formData.id) {
      response = await apiClient.patch(`/api/budget/${formData.id}`, payload);
    } else {
      response = await apiClient.post('/api/budget', payload);
    }

    if (!response.error) {
      toast.success(formData.id ? 'Budget updated successfully' : 'Budget created successfully');
      setEditTarget(null);
      setIsModalOpen(false);
      await fetchBudgets();
    } else {
      toast.error(response.error?.message || 'Action failed');
    }
  };

  const handleDeleteBudget = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    const response = await apiClient.delete(`/api/budget/${deleteTarget.id}`);
    if (response.data) {
      setBudgets(budgets.filter((b) => b.id !== deleteTarget.id));
      toast.success('Budget deleted successfully');
      setDeleteTarget(null);
      setDeleteConfirmText('');
    } else {
      toast.error('Failed to delete budget');
    }
    setIsDeleting(false);
  };

  const handleEditClick = (budget: BudgetCategory) => {
    setEditTarget(budget);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditTarget(null);
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
                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold text-foreground capitalize">
                        {budget.category}
                      </h3>
                      {budget.notes && (
                        <p className="text-xs text-muted-foreground italic line-clamp-2">
                          "{budget.notes}"
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditClick(budget)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => setDeleteTarget(budget)}
                      >
                        Delete
                      </Button>
                    </div>
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
                      <p className="text-lg font-semibold text-destructive tabular-nums">
                        {formatCurrency(budget.spent)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Budget</p>
                      <p className="text-lg font-semibold text-foreground tabular-nums">
                        {formatCurrency(budget.limit)}
                      </p>
                    </div>
                  </div>

                  <div className="bg-secondary/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">Remaining</p>
                    <p
                      className={`text-xl font-bold tabular-nums ${remaining >= 0 ? 'text-green-600' : 'text-destructive'
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
        onClose={handleCloseModal}
        onSubmit={handleFormSubmit}
        categories={categoryList}
        initialData={editTarget}
      />

      {/* Delete Confirmation Modal */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) { setDeleteTarget(null); setDeleteConfirmText(''); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">Delete Budget Category?</DialogTitle>
            <DialogDescription className="space-y-3 pt-2">
              <p>
                This action cannot be undone. This will permanently delete the <strong>{deleteTarget?.category}</strong> budget.
              </p>
              <div className="bg-destructive/10 border border-destructive/20 p-3 rounded-lg text-destructive text-xs font-semibold">
                ⚠️ Verification Required: Please type <strong>{deleteTarget?.category.toLowerCase()}</strong> to confirm.
              </div>
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">
            <Input
              placeholder="Type category name here..."
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              className="border-destructive/30 focus-visible:ring-destructive"
              autoFocus
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => { setDeleteTarget(null); setDeleteConfirmText(''); }}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteBudget}
              disabled={deleteConfirmText.toLowerCase() !== deleteTarget?.category.toLowerCase() || isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Confirm Deletion'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
