'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, Mail, Shield, User, Globe, Moon, Sun, Smartphone } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';

export default function SettingsPage() {
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [remindBefore, setRemindBefore] = useState('60');
    const [theme, setTheme] = useState('dark');
    const [currency, setCurrency] = useState('tnd');
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        const response = await apiClient.get<any>('/api/user/settings');
        if (response.data) {
            const data = response.data;
            setEmailNotifications(data.email_notifications ?? true);
            setRemindBefore(String(data.remind_before_default ?? 60));
            setTheme(data.theme ?? 'dark');
            setCurrency(data.preferred_currency ?? 'tnd');
        }
        setIsLoading(false);
    };

    const handleSave = async () => {
        setIsSaving(true);
        const response = await apiClient.patch('/api/user/settings', {
            email_notifications: emailNotifications,
            remind_before_default: parseInt(remindBefore),
            theme,
            preferred_currency: currency,
        });

        setIsSaving(false);
        if (!response.error) {
            toast.success('Settings updated successfully! 🚀');
        } else {
            toast.error('Failed to save settings');
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-4xl font-black text-foreground tracking-tight">Settings</h1>
                <p className="text-muted-foreground mt-2 text-lg">
                    Configure your preferences and notification logic.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">
                    {/* Notification Settings */}
                    <Card className="p-6 border-primary/10 bg-card/50 backdrop-blur-sm">
                        <h3 className="text-xl font-bold flex items-center gap-2 mb-6">
                            <Bell className="w-5 h-5 text-primary" />
                            Notification Preferences
                        </h3>

                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base font-bold">Email Notifications</Label>
                                    <p className="text-sm text-muted-foreground">Receive high-priority reminders via email.</p>
                                </div>
                                <Switch
                                    checked={emailNotifications}
                                    onCheckedChange={setEmailNotifications}
                                />
                            </div>

                            <div className="space-y-3">
                                <Label className="text-base font-bold">Default Reminder Offset</Label>
                                <p className="text-sm text-muted-foreground mb-4">When should we start notifying you before an event?</p>
                                <Select value={remindBefore} onValueChange={setRemindBefore}>
                                    <SelectTrigger className="w-full md:w-64">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="15">15 minutes before</SelectItem>
                                        <SelectItem value="30">30 minutes before</SelectItem>
                                        <SelectItem value="60">1 hour before</SelectItem>
                                        <SelectItem value="120">2 hours before</SelectItem>
                                        <SelectItem value="1440">1 day before</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </Card>

                    {/* Appearance */}
                    <Card className="p-6 border-primary/10 bg-card/50 backdrop-blur-sm">
                        <h3 className="text-xl font-bold flex items-center gap-2 mb-6">
                            <Moon className="w-5 h-5 text-primary" />
                            Display & Appearance
                        </h3>

                        <div className="grid grid-cols-3 gap-4">
                            <button
                                onClick={() => setTheme('light')}
                                className={`p-4 rounded-xl border transition-all ${theme === 'light' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
                            >
                                <Sun className="w-6 h-6 mx-auto mb-2" />
                                <span className="text-xs font-bold block">Light</span>
                            </button>
                            <button
                                onClick={() => setTheme('dark')}
                                className={`p-4 rounded-xl border transition-all ${theme === 'dark' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
                            >
                                <Moon className="w-6 h-6 mx-auto mb-2" />
                                <span className="text-xs font-bold block">Dark</span>
                            </button>
                            <button
                                onClick={() => setTheme('system')}
                                className={`p-4 rounded-xl border transition-all ${theme === 'system' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
                            >
                                <Smartphone className="w-6 h-6 mx-auto mb-2" />
                                <span className="text-xs font-bold block">System</span>
                            </button>
                        </div>
                    </Card>

                    <div className="flex justify-end">
                        <Button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="px-8 rounded-xl font-bold shadow-lg shadow-primary/20"
                        >
                            {isSaving ? 'Saving...' : 'Save All Changes'}
                        </Button>
                    </div>
                </div>

                <div className="space-y-6">
                    <Card className="p-6 border-primary/10 bg-primary/5 overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <Shield className="w-32 h-32 text-primary" />
                        </div>
                        <h3 className="text-sm font-black uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            Account Security
                        </h3>
                        <div className="space-y-4 relative z-10">
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Ensure your account is protected with two-factor authentication and high-entropy passwords.
                            </p>
                            <Button variant="outline" size="sm" className="w-full text-xs font-bold rounded-lg border-primary/20 text-primary hover:bg-primary/10">
                                Change Password
                            </Button>
                        </div>
                    </Card>

                    <Card className="p-6 border-border/50">
                        <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                            <Globe className="w-4 h-4" />
                            Region & Language
                        </h3>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-muted-foreground uppercase">Currency</Label>
                                <Select value={currency} onValueChange={setCurrency}>
                                    <SelectTrigger className="h-9">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="tnd">TND (Dinar)</SelectItem>
                                        <SelectItem value="usd">USD ($)</SelectItem>
                                        <SelectItem value="eur">EUR (€)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
