'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import {
  Plus,
  Trash2,
  Pencil,
  CheckCircle2,
  Circle,
  Check,
  X,
  ListTodo,
  Trophy,
  Lightbulb,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface Todo {
  id: string;
  title: string;
  isCompleted: boolean;
  createdAt: string;
}

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newTitle, setNewTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    const response = await apiClient.get<Todo[]>('/api/todos');
    if (response.data) {
      const raw = (response.data as any).data ?? response.data ?? [];
      setTodos(raw.map((t: any) => ({
        ...t,
        isCompleted: t.is_completed ?? t.isCompleted ?? false,
        createdAt: t.created_at ?? t.createdAt ?? new Date().toISOString(),
      })));
    }
    setIsLoading(false);
  };

  const handleAddTodo = async () => {
    if (!newTitle.trim()) return;

    setIsAdding(true);
    const response = await apiClient.post('/api/todos', {
      title: newTitle,
      is_completed: false,
    });

    if (response.data) {
      const added = response.data as any;
      setTodos([{
        ...added,
        isCompleted: added.is_completed ?? added.isCompleted ?? false,
        createdAt: added.created_at ?? added.createdAt ?? new Date().toISOString(),
      }, ...todos]);
      setNewTitle('');
      toast.success('Task added');
    } else {
      toast.error('Failed to add todo');
    }
    setIsAdding(false);
  };

  const handleToggleTodo = async (id: string, isCompleted: boolean) => {
    // Optimistic update for better UX
    setTodos(prev => prev.map(t => t.id === id ? { ...t, isCompleted: !isCompleted } : t));

    const response = await apiClient.patch(`/api/todos/${id}`, {
      is_completed: !isCompleted,
    });

    if (response.error) {
      // Revert if error
      setTodos(prev => prev.map(t => t.id === id ? { ...t, isCompleted: isCompleted } : t));
      toast.error('Failed to update status');
    } else {
      toast.success(isCompleted ? 'Task marked as active' : 'Task completed! 🚀', {
        duration: 2000,
        position: 'bottom-right'
      });
    }
  };

  const handleUpdateTodo = async (id: string) => {
    if (!editTitle.trim()) return;

    const response = await apiClient.patch(`/api/todos/${id}`, {
      title: editTitle.trim(),
    });

    if (response.data) {
      setTodos(todos.map((t) => (t.id === id ? { ...t, title: editTitle.trim() } : t)));
      setEditingId(null);
      toast.success('Task updated');
    } else {
      toast.error('Failed to update task');
    }
  };

  const handleDeleteTodo = async (id: string) => {
    const response = await apiClient.delete(`/api/todos/${id}`);
    if (response.data) {
      setTodos(todos.filter((t) => t.id !== id));
      toast.success('Todo deleted');
    }
  };

  const completedCount = todos.filter((t) => t.isCompleted).length;
  const pendingCount = todos.length - completedCount;
  const completionRate = todos.length > 0 ? Math.round((completedCount / todos.length) * 100) : 0;

  const sortedTodos = [...todos].sort((a, b) => {
    if (a.isCompleted !== b.isCompleted) {
      return a.isCompleted ? 1 : -1;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-foreground tracking-tight flex items-center gap-3">
            <ListTodo className="w-10 h-10 text-primary" />
            Task Management
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Organize your financial goals and daily check-ins.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-secondary/50 p-2 rounded-xl border border-border/50">
          <div className="px-4 py-2 text-center border-r border-border/50">
            <p className="text-2xl font-black text-primary">{todos.length}</p>
            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Total</p>
          </div>
          <div className="px-4 py-2 text-center">
            <p className="text-2xl font-black text-green-500">{completedCount}</p>
            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Done</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Task Column */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="p-6 shadow-2xl border-primary/10 relative overflow-hidden bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Zap className="w-32 h-32 text-primary" />
            </div>

            <div className="flex gap-3 mb-8 relative z-10">
              <div className="relative flex-1 group">
                <Input
                  placeholder="What needs to be done today?"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="h-12 pl-4 pr-12 text-lg bg-background/50 border-border/50 focus:border-primary/50 transition-all rounded-xl"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') handleAddTodo();
                  }}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 group-focus-within:opacity-50 transition-opacity">
                  <Plus className="w-5 h-5" />
                </div>
              </div>
              <Button
                onClick={handleAddTodo}
                disabled={isAdding || !newTitle.trim()}
                className="h-12 px-8 rounded-xl font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
              >
                Create Task
              </Button>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-muted-foreground font-medium animate-pulse">Syncing tasks...</p>
              </div>
            ) : sortedTodos.length === 0 ? (
              <div className="text-center py-20 bg-secondary/20 rounded-2xl border-2 border-dashed border-border/50">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <ListTodo className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Clean Slate!</h3>
                <p className="text-muted-foreground max-w-xs mx-auto mt-2 text-sm">
                  Your task list is empty. Add a new financial goal or reminder above to get started.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {sortedTodos.map((todo) => (
                  <div
                    key={todo.id}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 group",
                      todo.isCompleted
                        ? "bg-secondary/10 border-border/30 opacity-60"
                        : "bg-card border-border hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 shadow-sm"
                    )}
                  >
                    <button
                      onClick={() => handleToggleTodo(todo.id, todo.isCompleted)}
                      className={cn(
                        "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all shrink-0",
                        todo.isCompleted
                          ? "bg-green-500 border-green-500 text-white"
                          : "border-border hover:border-primary group-hover:scale-110"
                      )}
                    >
                      {todo.isCompleted ? <Check className="w-4 h-4 text-white" /> : <Circle className="w-4 h-4 opacity-0 group-hover:opacity-100" />}
                    </button>

                    <div className="flex-1 min-w-0">
                      {editingId === todo.id ? (
                        <div className="flex items-center gap-2">
                          <Input
                            autoFocus
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onBlur={() => handleUpdateTodo(todo.id)}
                            onKeyPress={(e) => e.key === 'Enter' && handleUpdateTodo(todo.id)}
                            className="h-8 py-0 focus-visible:ring-0 rounded-lg"
                          />
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-green-500" onClick={() => handleUpdateTodo(todo.id)}>
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => setEditingId(null)}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <p
                          className={cn(
                            "text-base font-semibold leading-tight truncate transition-all",
                            todo.isCompleted ? "text-muted-foreground line-through italic" : "text-foreground"
                          )}
                        >
                          {todo.title}
                        </p>
                      )}
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-1">
                        Added {new Date(todo.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!todo.isCompleted && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                          onClick={() => {
                            setEditingId(todo.id);
                            setEditTitle(todo.title);
                          }}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDeleteTodo(todo.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Intelligence Sidebar */}
        <div className="space-y-6">
          <Card className="p-6 border-primary/20 bg-primary/5">
            <h3 className="text-sm font-black uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Progress
            </h3>
            <div className="space-y-4">
              <div className="flex items-end justify-between">
                <p className="text-4xl font-black tracking-tighter">{completionRate}%</p>
                <p className="text-xs text-muted-foreground font-bold mb-1">Weekly Goal</p>
              </div>
              <Progress value={completionRate} className="h-2 bg-primary/10" />
              <p className="text-xs text-muted-foreground italic">
                {completionRate === 100
                  ? "Perfect! You've cleared everything."
                  : `You have ${pendingCount} active items to address today.`}
              </p>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-amber-500 mb-4 flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              AI Insights
            </h3>
            <div className="space-y-4">
              <div className="p-3 bg-secondary/30 rounded-lg space-y-1">
                <p className="text-xs font-bold text-foreground">Priority Suggestion</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {pendingCount > 0
                    ? `Try starting with your oldest task from ${sortedTodos.find(t => !t.isCompleted)?.createdAt ? new Date(sortedTodos.find(t => !t.isCompleted)!.createdAt).toLocaleDateString() : 'today'} to clear your backlog.`
                    : "You're all caught up! Great time to set new financial milestones for next month."}
                </p>
              </div>
              <div className="p-3 bg-secondary/30 rounded-lg space-y-1">
                <p className="text-xs font-bold text-foreground">Habit Builder</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Users who check off at least 3 tasks daily are 40% more likely to reach their savings goals early.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
