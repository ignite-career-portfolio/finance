import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Bell, RefreshCw } from 'lucide-react';

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
  const [remindBefore, setRemindBefore] = useState('60'); // Minutes
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceInterval, setRecurrenceInterval] = useState('24'); // Hours
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      // Format date for datetime-local input (YYYY-MM-DDTHH:mm)
      if (initialData.dueDate || initialData.due_date) {
        const d = new Date(initialData.dueDate || initialData.due_date);
        const pad = (n: number) => n.toString().padStart(2, '0');
        const formattedDate = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
        setDueDate(formattedDate);
      } else {
        setDueDate('');
      }
      setPriority(initialData.priority || 'medium');
      setRemindBefore(String(initialData.remind_before_minutes ?? initialData.remindBefore ?? 60));
      setIsRecurring(!!(initialData.is_recurring ?? initialData.isRecurring));
      setRecurrenceInterval(String(initialData.recurrence_interval_hours ?? initialData.recurrenceInterval ?? 24));
    } else {
      setTitle('');
      setDescription('');
      setDueDate('');
      setPriority('medium');
      setRemindBefore('60');
      setIsRecurring(false);
      setRecurrenceInterval('24');
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
      dueDate: new Date(dueDate.replace('T', ' ')).toISOString(),
      priority,
      isCompleted: initialData?.isCompleted ?? false,
      remindBeforeMinutes: parseInt(remindBefore),
      isRecurring,
      recurrenceIntervalHours: parseInt(recurrenceInterval),
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Bell className="w-3.5 h-3.5 text-primary" />
                Remind me before
              </label>
              <Select value={remindBefore} onValueChange={setRemindBefore}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">At time of event</SelectItem>
                  <SelectItem value="5">5 minutes</SelectItem>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                  <SelectItem value="1440">1 day</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4 pt-1">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="recurring"
                  checked={isRecurring}
                  onCheckedChange={(v) => setIsRecurring(!!v)}
                />
                <Label htmlFor="recurring" className="text-sm font-medium flex items-center gap-2">
                  <RefreshCw className={cn("w-3.5 h-3.5", isRecurring && "animate-spin-slow")} />
                  Repeat this reminder
                </Label>
              </div>

              {isRecurring && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="text-xs font-medium text-muted-foreground">Every (hours)</label>
                  <Input
                    type="number"
                    value={recurrenceInterval}
                    onChange={(e) => setRecurrenceInterval(e.target.value)}
                    min="1"
                    className="h-8"
                  />
                </div>
              )}
            </div>
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
