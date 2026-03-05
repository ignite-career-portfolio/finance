'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff, Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { login } from '@/lib/auth';
import { toast } from 'sonner';
import { useUser } from '@/lib/user-context';

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await login(email, password);

    if (result.success && result.data) {
      setUser({
        id: result.data.userId,
        email: result.data.email,
        name: result.data.name,
      });
      toast.success('Welcome back!');
      router.push('/dashboard');
    } else {
      toast.error(result.error?.message || 'Login failed');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen w-full flex bg-background overflow-hidden">
      {/* Left Panel - Branding/Marketing (Hidden on mobile) */}
      <div className="hidden lg:flex w-1/2 relative bg-zinc-950 overflow-hidden items-center justify-center p-12 animate-in fade-in slide-in-from-left-10 duration-1000 fill-mode-both">
        {/* Abstract Background Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary/20 blur-[130px] rounded-full animate-float"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/20 blur-[120px] rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="relative z-10 w-full max-w-lg space-y-8 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg shadow-lg shadow-primary/20 border border-primary/20">
              FF
            </div>
            <span className="text-2xl font-bold tracking-tight">FinanceFlow</span>
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight leading-[1.15]">
            Master your money,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">shape your future.</span>
          </h1>
          <p className="text-lg text-zinc-400 font-medium">
            Join thousands of smart individuals taking control of their finances with our intuitive platform.
          </p>

          <div className="pt-8 flex items-center gap-6 text-sm text-zinc-300 font-medium">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <span>Bank-level security</span>
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-700"></div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <span>100% Data Privacy</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form container */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 lg:p-12 relative animate-in fade-in slide-in-from-bottom-10 lg:slide-in-from-right-10 duration-1000 fill-mode-both delay-150">
        {/* Mobile background elements */}
        <div className="absolute inset-0 z-0 lg:hidden overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[100px] rounded-full"></div>
        </div>

        <div className="w-full max-w-md space-y-8 relative z-10 bg-background/60 backdrop-blur-xl p-8 sm:p-10 rounded-3xl border border-border shadow-2xl">
          <div className="space-y-2 text-center lg:text-left">
            {/* Mobile logo */}
            <div className="flex lg:hidden justify-center lg:justify-start mb-6">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg shadow-primary/30">
                FF
              </div>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Welcome back</h2>
            <p className="text-sm text-muted-foreground">
              Enter your credentials to access your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 mt-8">
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
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium text-foreground">Password</label>
                <Link href="#" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                  Forgot password?
                </Link>
              </div>
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
            </div>

            <div className="flex items-center space-x-2 pt-1 pb-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                className="border-muted-foreground/30 data-[state=checked]:bg-primary"
              />
              <label htmlFor="remember" className="text-sm font-medium leading-none cursor-pointer text-muted-foreground">
                Keep me logged in
              </label>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all">
              {isLoading ? 'Signing in...' : 'Sign In'}
              {!isLoading && <ArrowRight className="ml-2 w-4 h-4" />}
            </Button>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground font-semibold">
                  Or continue with
                </span>
              </div>
            </div>

            <Button variant="outline" type="button" className="w-full h-12 bg-background border-border hover:bg-muted/50 transition-colors font-medium">
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Google
            </Button>
          </form>

          <div className="mt-8 text-center lg:text-left text-sm">
            <span className="text-muted-foreground cursor-default">Don't have an account? </span>
            <Link href="/register" className="text-primary font-semibold hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
