'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api-client';
import { FixedChargeModal } from '@/components/dashboard/fixed-charge-modal';
import { toast } from 'sonner';
import { Trash2, Pencil, Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface FixedCharge {
    id: string;
    name: string;
    amount: number;
    frequency: string;
    due_date: number;
    type: 'income' | 'expense';
    start_date?: string;
    end_date?: string;
}

export default function FixedChargesPage() {
    const [charges, setCharges] = useState<FixedCharge[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCharge, setSelectedCharge] = useState<FixedCharge | null>(null);

    useEffect(() => {
        fetchCharges();
    }, []);

    const fetchCharges = async () => {
        setIsLoading(true);
        const response = await apiClient.get<FixedCharge[]>('/api/fixed-charges');
        if (response.data) {
            setCharges((response.data as any).data ?? response.data ?? []);
        }
        setIsLoading(false);
    };

    const handleSave = async (data: any) => {
        let response;
        if (data.id) {
            response = await apiClient.patch(`/api/fixed-charges/${data.id}`, data);
        } else {
            response = await apiClient.post('/api/fixed-charges', data);
        }

        if (!response.error) {
            toast.success(data.id ? 'Fixed charge updated' : 'Fixed charge added');
            setIsModalOpen(false);
            setSelectedCharge(null);
            fetchCharges();
        } else {
            toast.error(response.error.message || 'Failed to save');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this recurring item?')) return;
        const response = await apiClient.delete(`/api/fixed-charges/${id}`);
        if (!response.error) {
            setCharges(charges.filter(c => c.id !== id));
            toast.success('Deleted successfully');
        }
    };



    const getMonthlyAmount = (charge: FixedCharge) => {
        const freq = charge.frequency?.toLowerCase() || 'monthly';
        switch (freq) {
            case 'weekly': return (charge.amount * 52) / 12;
            case 'quarterly': return charge.amount / 3;
            case 'semi-annually': return charge.amount / 6;
            case 'annually': return charge.amount / 12;
            case 'monthly':
            default: return charge.amount;
        }
    };

    const incomeTotal = charges.filter(c => c.type === 'income').reduce((acc, c) => acc + getMonthlyAmount(c), 0);
    const expenseTotal = charges.filter(c => c.type === 'expense').reduce((acc, c) => acc + getMonthlyAmount(c), 0);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Fixed Charges</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Manage your recurring monthly income and expenses
                    </p>
                </div>
                <Button onClick={() => {
                    setSelectedCharge(null);
                    setIsModalOpen(true);
                }}>+ Add New</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4 flex items-center gap-4 bg-green-500/5 border-green-500/20">
                    <div className="p-3 bg-green-500/10 rounded-xl text-green-600">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Avg. Monthly Income</p>
                        <p className="text-2xl font-bold text-green-600">{formatCurrency(incomeTotal)}</p>
                    </div>
                </Card>
                <Card className="p-4 flex items-center gap-4 bg-destructive/5 border-destructive/20">
                    <div className="p-3 bg-destructive/10 rounded-xl text-destructive">
                        <TrendingDown className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Avg. Monthly Expenses</p>
                        <p className="text-2xl font-bold text-destructive">{formatCurrency(expenseTotal)}</p>
                    </div>
                </Card>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            ) : charges.length === 0 ? (
                <Card className="p-12 text-center border-dashed">
                    <p className="text-muted-foreground mb-4">You haven't set up any recurring charges yet.</p>
                    <Button variant="outline" onClick={() => setIsModalOpen(true)}>Add your first one</Button>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {charges.map((charge) => (
                        <Card key={charge.id} className="p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
                            <div>
                                <div className="flex items-start justify-between mb-2">
                                    <div className={`p-2 rounded-lg ${charge.type === 'income' ? 'bg-green-500/10 text-green-600' : 'bg-destructive/10 text-destructive'}`}>
                                        {charge.type === 'income' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                    </div>
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                                            setSelectedCharge(charge);
                                            setIsModalOpen(true);
                                        }}>
                                            <Pencil className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(charge.id)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                                <h3 className="font-bold text-lg">{charge.name}</h3>
                                <p className={`text-xl font-bold mt-1 ${charge.type === 'income' ? 'text-green-600' : 'text-destructive'}`}>
                                    {charge.type === 'income' ? '+' : '-'}{formatCurrency(charge.amount)}
                                </p>
                            </div>

                            <div className="mt-4 pt-4 border-t space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-1 text-muted-foreground">
                                        <Calendar className="w-4 h-4" />
                                        <span>Starts {charge.start_date ? new Date(charge.start_date).toLocaleDateString() : 'Today'}</span>
                                    </div>
                                    <span className="capitalize font-medium text-primary bg-primary/5 px-2 py-0.5 rounded text-[10px] tracking-widest">{charge.frequency}</span>
                                </div>
                                {charge.end_date && (
                                    <div className="flex items-center gap-1 text-[10px] text-destructive font-bold uppercase tracking-tighter">
                                        <span>Expires: {new Date(charge.end_date).toLocaleDateString()}</span>
                                    </div>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            <FixedChargeModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedCharge(null);
                }}
                onSubmit={handleSave}
                initialData={selectedCharge}
            />
        </div>
    );
}
