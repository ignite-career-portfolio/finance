'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, Zap, LineChart } from 'lucide-react';
import { register } from '@/lib/auth';
import { toast } from 'sonner';
import { useUser } from '@/lib/user-context';

export default function RegisterPage() {
  const router = useRouter();
  const { setUser } = useUser();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);

    const result = await register(email, password, name);

    if (result.success && result.data) {
      setUser({
        id: result.data.userId,
        email: result.data.email,
        name: result.data.name,
      });
      toast.success('Account created successfully!');
      router.push('/dashboard');
    } else {
      toast.error(result.error?.message || 'Registration failed');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen w-full flex bg-background overflow-hidden">
      {/* Right Panel - Branding/Marketing (Hidden on mobile) */}
      <div className="hidden lg:flex w-[45%] relative bg-zinc-950 overflow-hidden items-center justify-center p-12 order-2 animate-in fade-in slide-in-from-right-10 duration-1000 fill-mode-both">
        {/* Abstract Background Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-500/20 blur-[130px] rounded-full animate-float"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full animate-float" style={{ animationDelay: '1.5s' }}></div>
        </div>

        <div className="relative z-10 w-full max-w-lg space-y-12 text-white">
          <div className="space-y-6">
            <h1 className="text-4xl font-extrabold tracking-tight leading-tight">
              Start building your<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-primary">financial foundation.</span>
            </h1>
            <p className="text-lg text-zinc-400 font-medium">
              Create a free account and start tracking your expenses, setting budgets, and achieving your financial goals.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0 border border-primary/30">
                <LineChart className="w-5 h-5 text-primary" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-white tracking-tight">Advanced Tracking</h3>
                <p className="text-sm text-zinc-400">See exactly where your money goes with detailed transaction categorization.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0 border border-primary/30">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-white tracking-tight">Smart Budgets</h3>
                <p className="text-sm text-zinc-400">Set dynamic budgets and receive alerts before you overspend.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0 border border-primary/30">
                <ShieldCheck className="w-5 h-5 text-primary" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-white tracking-tight">Bank-Level Security</h3>
                <p className="text-sm text-zinc-400">Your financial data is encrypted and protected with industry-standard protocols.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Left Panel - Form container */}
      <div className="w-full lg:w-[55%] flex items-center justify-center p-4 sm:p-8 lg:p-12 relative order-1 animate-in fade-in slide-in-from-bottom-10 lg:slide-in-from-left-10 duration-1000 fill-mode-both delay-150">
        {/* Mobile background elements */}
        <div className="absolute inset-0 z-0 lg:hidden overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[100px] rounded-full"></div>
        </div>

        <div className="w-full max-w-md space-y-8 relative z-10 bg-background/60 backdrop-blur-xl p-8 sm:p-10 rounded-3xl border border-border shadow-2xl">
          <div className="space-y-2 text-center lg:text-left">
            {/* Mobile logo */}
            <div className="flex justify-center lg:justify-start items-center mb-6">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg shadow-primary/30 lg:hidden">
                FF
              </div>
              <div className="hidden lg:flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg shadow-md border border-primary/20">
                  FF
                </div>
                <span className="font-bold tracking-tight text-xl text-foreground">FinanceFlow</span>
              </div>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Create account</h2>
            <p className="text-sm text-muted-foreground">
              Enter your details to get started with your free account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 mt-8">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-foreground">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 h-12 bg-background border-muted-foreground/20 focus-visible:ring-primary shadow-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                </div>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 bg-background border-muted-foreground/20 focus-visible:ring-primary shadow-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-foreground">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-muted-foreground" />
                </div>
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-12 bg-background border-muted-foreground/20 focus-visible:ring-primary shadow-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {password && password.length < 8 && (
                <p className="text-xs text-amber-500 font-medium pt-1">Password must be at least 8 characters</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="confirm" className="text-sm font-medium text-foreground">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-muted-foreground" />
                </div>
                <Input
                  id="confirm"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`pl-10 pr-10 h-12 bg-background focus-visible:ring-primary shadow-sm ${confirmPassword && password !== confirmPassword
                    ? 'border-red-500/50 focus-visible:ring-red-500'
                    : 'border-muted-foreground/20'
                    }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full mt-4 h-12 text-base font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all">
              {isLoading ? 'Creating account...' : 'Create Account'}
              {!isLoading && <ArrowRight className="ml-2 w-4 h-4" />}
            </Button>

            <p className="text-xs text-center text-muted-foreground mt-4">
              By clicking "Create Account", you agree to our Terms of Service and Privacy Policy.
            </p>
          </form>

          <div className="mt-8 text-center lg:text-left text-sm pt-6 mt-8 border-t border-border">
            <span className="text-muted-foreground cursor-default">Already have an account? </span>
            <Link href="/login" className="text-primary font-semibold hover:underline">
              Sign in Instead
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
