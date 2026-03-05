'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import { SavingsModal } from '@/components/savings/savings-modal';
import { Plus } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: string;
}

export default function SavingsPage() {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isContributionOpen, setIsContributionOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null);
  const [contributionAmount, setContributionAmount] = useState('');
  const [recordAsTransaction, setRecordAsTransaction] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    setIsLoading(true);
    const response = await apiClient.get<SavingsGoal[]>('/api/savings-goals');
    if (response.data) {
      const raw = (response.data as any).data ?? response.data ?? [];
      setGoals(raw.map((g: any) => ({
        ...g,
        targetAmount: g.target_amount ?? g.targetAmount,
        currentAmount: g.current_amount ?? g.currentAmount,
      })));
    }
    setIsLoading(false);
  };

  const handleAddGoal = async (formData: any) => {
    setIsSaving(true);
    const response = await apiClient.post('/api/savings-goals', {
      name: formData.name,
      target_amount: Math.round(parseFloat(formData.targetAmount) * 1000),
      current_amount: Math.round(parseFloat(formData.currentAmount || 0) * 1000),
      deadline: formData.deadline,
    });

    if (response.data) {
      toast.success('Savings goal created');
      setIsAddOpen(false);
      await fetchGoals();
    } else {
      toast.error(response.error?.message || 'Failed to create goal');
    }
    setIsSaving(false);
  };

  const handleContribution = async () => {
    if (!selectedGoal || !contributionAmount) return;

    setIsSaving(true);
    const additionalAmount = Math.round(parseFloat(contributionAmount) * 1000);
    const newTotal = selectedGoal.currentAmount + additionalAmount;

    try {
      // 1. If dynamic transfer is enabled, record as a transaction first
      if (recordAsTransaction) {
        await apiClient.post('/api/transactions', {
          type: 'expense',
          description: `Goal Funding: ${selectedGoal.name}`,
          category: 'other', // Or 'goal' if category exists
          amount: additionalAmount,
          transaction_date: new Date().toISOString().split('T')[0],
        });
      }

      // 2. Update the goal progress
      const response = await apiClient.patch(`/api/savings-goals/${selectedGoal.id}`, {
        current_amount: newTotal,
      });

      if (!response.error) {
        toast.success(
          recordAsTransaction
            ? `Transferred ${formatCurrency(additionalAmount)} to ${selectedGoal.name} (Balance Updated)`
            : `Added ${formatCurrency(additionalAmount)} to ${selectedGoal.name}`
        );
        setIsContributionOpen(false);
        setContributionAmount('');
        setRecordAsTransaction(false);
        setSelectedGoal(null);
        await fetchGoals();
      } else {
        toast.error('Failed to update progress');
      }
    } catch (error) {
      toast.error('Dynamic update failed');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteGoal = async (id: string) => {
    const response = await apiClient.delete(`/api/savings-goals/${id}`);
    if (response.data) {
      setGoals(goals.filter((g) => g.id !== id));
      toast.success('Goal deleted');
    } else {
      toast.error('Failed to delete goal');
    }
  };



  const formatDate = (dateString: string) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const calculateDaysLeft = (deadline: string) => {
    if (!deadline) return 0;
    const today = new Date();
    const target = new Date(deadline);
    const diff = target.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Savings Goals</h1>
        <Button onClick={() => setIsAddOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Add Goal
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : goals.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground mb-4">No savings goals yet</p>
          <Button onClick={() => setIsAddOpen(true)}>Create Your First Goal</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => {
            const percentage = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
            const daysLeft = calculateDaysLeft(goal.deadline);
            const amountLeft = Math.max(0, goal.targetAmount - goal.currentAmount);

            return (
              <Card key={goal.id} className="p-6 hover:shadow-md transition-shadow">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-foreground truncate h-6">{goal.name}</h3>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2"
                        onClick={() => {
                          setSelectedGoal(goal);
                          setIsContributionOpen(true);
                        }}
                      >
                        Add Funds
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDeleteGoal(goal.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-bold">{percentage.toFixed(0)}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-secondary rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-1000 ${percentage >= 100 ? 'bg-green-500' : 'bg-primary'
                          }`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Saved</p>
                      <p className="font-bold text-primary">{formatCurrency(goal.currentAmount)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Target</p>
                      <p className="font-bold">{formatCurrency(goal.targetAmount)}</p>
                    </div>
                  </div>

                  <div className="bg-muted/40 rounded-xl p-3 grid grid-cols-2 gap-2 text-center">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Remaining</p>
                      <p className="text-sm font-bold">{formatCurrency(amountLeft)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Deadline</p>
                      <p className={`text-sm font-bold ${daysLeft > 0 ? '' : 'text-destructive'}`}>
                        {daysLeft > 0 ? `${daysLeft}d left` : 'Due'}
                      </p>
                    </div>
                  </div>

                  <p className="text-[10px] text-muted-foreground text-center">
                    Target Date: {formatDate(goal.deadline)}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Goal Modal */}
      <SavingsModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSubmit={handleAddGoal}
      />

      {/* Contribution Dialog */}
      <Dialog open={isContributionOpen} onOpenChange={(open) => {
        if (!open) {
          setIsContributionOpen(false);
          setContributionAmount('');
          setSelectedGoal(null);
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Funds</DialogTitle>
            <DialogDescription>
              Increase your progress for <strong>{selectedGoal?.name}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Contribution Amount (DT)</label>
              <Input
                type="number"
                placeholder="0.000"
                step="0.001"
                value={contributionAmount}
                onChange={(e) => setContributionAmount(e.target.value)}
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                Current total: {selectedGoal ? formatCurrency(selectedGoal.currentAmount) : '0,000 DT'}
              </p>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-primary/5 border border-primary/10 gap-4">
              <div className="space-y-0.5">
                <Label className="text-sm font-bold">Smart Transfer</Label>
                <p className="text-[10px] text-muted-foreground leading-tight">
                  Automatically decrease your main balance and record this as an expense transaction.
                </p>
              </div>
              <Switch
                checked={recordAsTransaction}
                onCheckedChange={setRecordAsTransaction}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsContributionOpen(false)}>Cancel</Button>
            <Button
              onClick={handleContribution}
              disabled={!contributionAmount || isSaving}
            >
              {isSaving ? 'Updating...' : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

