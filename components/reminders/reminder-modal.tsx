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

interface ReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: any;
}

export function ReminderModal({ isOpen, onClose, onSubmit, initialData }: ReminderModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      // Format date for datetime-local input (YYYY-MM-DDTHH:mm)
      if (initialData.dueDate) {
        const date = new Date(initialData.dueDate);
        const formattedDate = date.toISOString().slice(0, 16);
        setDueDate(formattedDate);
      } else if (initialData.due_date) {
        const date = new Date(initialData.due_date);
        const formattedDate = date.toISOString().slice(0, 16);
        setDueDate(formattedDate);
      } else {
        setDueDate('');
      }
      setPriority(initialData.priority || 'medium');
    } else {
      setTitle('');
      setDescription('');
      setDueDate('');
      setPriority('medium');
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !dueDate) {
      return;
    }

    setIsLoading(true);
    await onSubmit({
      ...initialData,
      title,
      description,
      dueDate,
      priority,
      isCompleted: initialData?.isCompleted ?? false,
    });
    setIsLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Reminder' : 'Add Reminder'}</DialogTitle>
          <DialogDescription>
            {initialData ? 'Update your reminder details' : 'Create a reminder for important financial tasks'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Title</label>
            <Input
              placeholder="e.g., Pay credit card bill"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Description (optional)
            </label>
            <Input
              placeholder="Add details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Due Date & Time</label>
            <Input
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Priority</label>
            <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (initialData ? 'Saving...' : 'Creating...') : (initialData ? 'Save Changes' : 'Add Reminder')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
