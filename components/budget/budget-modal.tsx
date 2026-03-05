import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  categories: string[];
  initialData?: any;
}

export function BudgetModal({ isOpen, onClose, onSubmit, categories, initialData }: BudgetModalProps) {
  const [category, setCategory] = useState('');
  const [limit, setLimit] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setCategory(categories.find(c => c.toLowerCase() === initialData.category.toLowerCase()) || '');
      setLimit(String(initialData.limit / 1000));
      setNotes(initialData.notes || '');
    } else {
      setCategory('');
      setLimit('');
      setNotes('');
    }
  }, [initialData, isOpen, categories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!category || !limit) {
      return;
    }

    setIsLoading(true);
    await onSubmit({
      id: initialData?.id,
      category: category.toLowerCase(),
      limit,
      notes,
    });
    setIsLoading(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Budget' : 'Create Budget'}</DialogTitle>
          <DialogDescription>
            {initialData ? 'Update your spending limit and notes' : 'Set a monthly spending limit and add rationale'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Category</label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Monthly Limit (DT)</label>
            <Input
              type="number"
              placeholder="e.g. 250.000"
              step="0.001"
              min="0"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Notes / Rationale</label>
            <Input
              placeholder="e.g. Pourquoi ce choix..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (initialData ? 'Saving...' : 'Creating...') : (initialData ? 'Save Changes' : 'Create Budget')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
