'use client';

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

interface FixedChargeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => Promise<void>;
    initialData?: any;
}

export function FixedChargeModal({ isOpen, onClose, onSubmit, initialData }: FixedChargeModalProps) {
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [frequency, setFrequency] = useState('monthly');
    const [type, setType] = useState<'income' | 'expense'>('expense');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (initialData) {
            setName(initialData.name || '');
            setAmount(initialData.amount ? String(initialData.amount / 1000) : '');
            setDueDate(String(initialData.due_date ?? initialData.dueDate ?? '1'));
            setFrequency(initialData.frequency || 'monthly');
            setType(initialData.type || 'expense');
            setStartDate(initialData.start_date ? new Date(initialData.start_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
            setEndDate(initialData.end_date ? new Date(initialData.end_date).toISOString().split('T')[0] : '');
        } else {
            setName('');
            setAmount('');
            setDueDate('1');
            setFrequency('monthly');
            setType('expense');
            setStartDate(new Date().toISOString().split('T')[0]);
            setEndDate('');
        }
    }, [initialData, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name || !amount || !dueDate) {
            return;
        }

        setIsLoading(true);
        await onSubmit({
            ...initialData,
            name,
            amount: Math.round(parseFloat(amount) * 1000),
            due_date: parseInt(dueDate),
            frequency,
            type,
            start_date: startDate,
            end_date: endDate || null,
        });
        setIsLoading(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{initialData ? 'Edit Fixed Charge' : 'Add Fixed Charge'}</DialogTitle>
                    <DialogDescription>
                        {initialData ? 'Update recurring income or expense' : 'Set up a repeating monthly income or expense'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Type</label>
                        <Select value={type} onValueChange={(v: any) => setType(v)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="expense">Expense (Bill)</SelectItem>
                                <SelectItem value="income">Income (Salary)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Name</label>
                        <Input
                            placeholder="e.g., Monthly Salary, Rent, Netflix"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Amount</label>
                        <Input
                            type="number"
                            placeholder="0.000"
                            step="0.001"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Frequency</label>
                            <Select value={frequency} onValueChange={setFrequency}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="weekly">Weekly</SelectItem>
                                    <SelectItem value="monthly">Monthly</SelectItem>
                                    <SelectItem value="quarterly">Quarterly (3 Months)</SelectItem>
                                    <SelectItem value="semi-annually">6 Months</SelectItem>
                                    <SelectItem value="annually">Annually</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground flex justify-between">
                                <span>Day of Month</span>
                            </label>
                            <Input
                                type="number"
                                min="1"
                                max="31"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Start Date</label>
                            <Input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">End Date (Optional)</label>
                            <Input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                placeholder="Never"
                            />
                        </div>
                    </div>

                    <div className="flex gap-2 justify-end pt-2">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Saving...' : initialData ? 'Save Changes' : 'Add Charge'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
