'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';

interface NotificationContextType {
    remindersCount: number;
    todosCount: number;
    totalPending: number;
    refreshCounts: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
    const [remindersCount, setRemindersCount] = useState(0);
    const [todosCount, setTodosCount] = useState(0);

    const refreshCounts = useCallback(async () => {
        try {
            const [remResponse, todoResponse] = await Promise.all([
                apiClient.get<any[]>('/api/reminders'),
                apiClient.get<any[]>('/api/todos')
            ]);

            if (remResponse.data) {
                const raw = (remResponse.data as any).data ?? remResponse.data ?? [];
                const pending = raw.filter((r: any) => !(r.is_completed ?? r.isCompleted)).length;
                setRemindersCount(pending);
            }

            if (todoResponse.data) {
                const raw = (todoResponse.data as any).data ?? todoResponse.data ?? [];
                const pending = raw.filter((t: any) => !(t.is_completed ?? t.isCompleted)).length;
                setTodosCount(pending);
            }
        } catch (error) {
            console.error('Failed to fetch notification counts:', error);
        }
    }, []);

    useEffect(() => {
        refreshCounts();

        // Optional: Add a subtle poll or listener if needed, 
        // but the task asks for "on edit/add" which we will call manually.
    }, [refreshCounts]);

    const totalPending = remindersCount + todosCount;

    return (
        <NotificationContext.Provider value={{ remindersCount, todosCount, totalPending, refreshCounts }}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
}
