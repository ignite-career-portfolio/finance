'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import { ReminderModal } from '@/components/reminders/reminder-modal';
import { useNotifications } from '@/lib/notification-context';

interface Reminder {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  isCompleted: boolean;
}

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(null);
  const { refreshCounts } = useNotifications();

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    const response = await apiClient.get<Reminder[]>('/api/reminders');
    if (response.data) {
      const raw = (response.data as any).data ?? response.data ?? [];
      setReminders(raw.map((r: any) => ({
        ...r,
        dueDate: r.due_date ?? r.dueDate,
        isCompleted: r.is_completed ?? r.isCompleted ?? false,
        priority: r.priority ?? 'medium',
      })));
    }
    setIsLoading(false);
  };

  const handleSaveReminder = async (formData: any) => {
    let response;
    if (formData.id) {
      // Edit mode
      response = await apiClient.patch(`/api/reminders/${formData.id}`, {
        title: formData.title,
        description: formData.description,
        due_date: formData.dueDate,
        priority: formData.priority,
      });
    } else {
      // Add mode
      response = await apiClient.post('/api/reminders', formData);
    }

    if (response.data) {
      toast.success(formData.id ? 'Reminder updated' : 'Reminder created');
      setIsModalOpen(false);
      setSelectedReminder(null);
      fetchReminders();
      refreshCounts();
    } else {
      toast.error(response.error?.message || 'Failed to save reminder');
    }
  };

  const handleToggleComplete = async (id: string, isCompleted: boolean) => {
    const response = await apiClient.patch(`/api/reminders/${id}`, {
      is_completed: !isCompleted,
    });

    if (response.data) {
      setReminders(
        reminders.map((r) => (r.id === id ? { ...r, isCompleted: !isCompleted } : r))
      );
      toast.success(isCompleted ? 'Reminder unmarked' : 'Reminder completed');
      refreshCounts();
    }
  };

  const handleDeleteReminder = async (id: string) => {
    const response = await apiClient.delete(`/api/reminders/${id}`);
    if (response.data) {
      setReminders(reminders.filter((r) => r.id !== id));
      toast.success('Reminder deleted');
      refreshCounts();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-destructive/10 text-destructive';
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-600';
      case 'low':
        return 'bg-green-500/10 text-green-600';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const sortedReminders = [...reminders].sort((a, b) => {
    if (a.isCompleted !== b.isCompleted) {
      return a.isCompleted ? 1 : -1;
    }
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Reminders</h1>
        <Button onClick={() => {
          setSelectedReminder(null);
          setIsModalOpen(true);
        }}>Add Reminder</Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : sortedReminders.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground mb-4">No reminders yet</p>
          <Button onClick={() => {
            setSelectedReminder(null);
            setIsModalOpen(true);
          }}>Create Your First Reminder</Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {sortedReminders.map((reminder) => (
            <Card
              key={reminder.id}
              className={`p-4 transition-all hover:shadow-md ${reminder.isCompleted ? 'opacity-60' : ''}`}
            >
              <div className="flex items-start gap-4">
                <input
                  type="checkbox"
                  checked={reminder.isCompleted}
                  onChange={() => handleToggleComplete(reminder.id, reminder.isCompleted)}
                  className="mt-1.5 w-5 h-5 cursor-pointer rounded border-border"
                />

                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3
                        className={`font-semibold text-lg ${reminder.isCompleted
                          ? 'text-muted-foreground line-through'
                          : 'text-foreground'
                          }`}
                      >
                        {reminder.title}
                      </h3>
                      {reminder.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {reminder.description}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedReminder(reminder);
                          setIsModalOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => handleDeleteReminder(reminder.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-3">
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${getPriorityColor(reminder.priority)}`}>
                      {reminder.priority} Priority
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-muted-foreground"></span>
                      {formatDate(reminder.dueDate)}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ReminderModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedReminder(null);
        }}
        onSubmit={handleSaveReminder}
        initialData={selectedReminder}
      />
    </div>
  );
}

