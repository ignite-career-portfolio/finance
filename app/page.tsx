'use client';

import { useRouter } from 'next/navigation';
import { useUser } from '@/lib/user-context';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LineChart, LayoutDashboard, BellRing, Goal, Globe } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useUser();
  const [lang, setLang] = useState<'fr' | 'ar'>('fr');

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  const copy = {
    fr: {
      title: 'Prenez le contrôle de vos ',
      highlight: 'finances',
      subtitle: 'Suivez vos dépenses, planifiez vos budgets et atteignez vos objectifs financiers avec notre tableau de bord intelligent et proactif.',
      startFree: 'Commencer gratuitement',
      login: 'Se connecter',
      features: {
        f1: { title: 'Prévisions Intelligentes', desc: 'Visualisez votre solde sur 90 jours et anticipez les imprévus.' },
        f2: { title: 'Alertes Proactives', desc: 'Soyez notifié avant d\'être à découvert ou de dépasser votre budget.' },
        f3: { title: 'Objectifs d\'Épargne', desc: 'Définissez et atteignez vos rêves pas à pas avec notre suivi dédié.' },
      },
      footer: '© 2024 FinanceFlow. Construit pour la liberté financière.'
    },
    ar: {
      title: 'سيطر على أموالك و',
      highlight: 'مصاريفك',
      subtitle: 'تتبع نفقاتك، خطط ميزانيتك، وحقق أهدافك المالية من خلال لوحة البيانات الذكية والاستباقية لدينا.',
      startFree: 'ابدأ مجاناً',
      login: 'تسجيل الدخول',
      features: {
        f1: { title: 'توقعات ذكية', desc: 'تصور رصيدك على مدار 90 يومًا وتوقع التكاليف غير المتوقعة.' },
        f2: { title: 'تنبيهات استباقية', desc: 'تلقى إشعارات قبل تجاوز ميزانيتك أو الرصيد السلبي.' },
        f3: { title: 'أهداف التوفير', desc: 'حدد أحلامك وحققها خطوة بخطوة مع تتبعنا المخصص.' },
      },
      footer: '© 2024 FinanceFlow. بني من أجل الحرية المالية.'
    }
  };

  const isRtl = lang === 'ar';
  const textDir = isRtl ? 'rtl' : 'ltr';

  return (
    <div dir={textDir} className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/30 font-sans selection:bg-primary/20">
      <header className="fixed top-0 inset-x-0 z-50 flex items-center justify-between border-b border-border/40 bg-background/80 backdrop-blur-md px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg shadow-xl shadow-primary/20">
            FF
          </div>
          <span className="font-bold text-lg sm:text-xl tracking-tight text-foreground hidden sm:inline">FinanceFlow</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLang(l => l === 'fr' ? 'ar' : 'fr')}
            className="flex items-center gap-2"
          >
            <Globe className="w-4 h-4" />
            <span className="hidden sm:inline">{lang === 'fr' ? 'العربية' : 'Français'}</span>
          </Button>
          <Link href="/login">
            <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
              {copy[lang].login}
            </Button>
          </Link>
          <Link href="/register">
            <Button size="sm" className="rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow">
              {copy[lang].startFree}
            </Button>
          </Link>
        </div>
      </header>

      <main className="pt-24 pb-12 px-4 sm:px-6 flex flex-col items-center min-h-screen">
        <div className="w-full max-w-5xl flex flex-col items-center text-center space-y-8 mt-10">
          <div className="space-y-6 max-w-3xl animate-in slide-in-from-bottom-8 duration-700 fade-in">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-foreground">
              {copy[lang].title} <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500">{copy[lang].highlight}</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              {copy[lang].subtitle}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center w-full sm:w-auto animate-in slide-in-from-bottom-10 duration-700 delay-150 fade-in">
            <Link href="/register" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto rounded-full text-base h-14 px-8 shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all">
                {copy[lang].startFree}
              </Button>
            </Link>
          </div>

          {/* Dashboard Mockup Component */}
          <div className="w-full mt-16 relative perspective-[2000px] animate-in zoom-in-95 duration-1000 delay-300 fade-in">
            <div className={`relative w-full aspect-video md:aspect-[21/9] bg-card rounded-2xl border border-border shadow-2xl overflow-hidden ${isRtl ? 'rotate-y-[-2deg]' : 'rotate-y-[2deg]'} transform-gpu hover:rotate-y-0 transition-transform duration-700`}>
              <div className="absolute top-0 inset-x-0 h-12 border-b border-border bg-muted/30 flex items-center px-4 gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
              </div>
              <div className="absolute top-12 bottom-0 inset-x-0 bg-background/50 backdrop-blur-sm p-4 sm:p-8 flex gap-4 sm:gap-8">
                {/* Mockup Sidebar */}
                <div className="hidden sm:block w-48 bg-muted/20 border border-border rounded-xl p-4 space-y-4">
                  <div className="h-8 bg-muted rounded w-2/3"></div>
                  <div className="h-4 bg-muted/60 rounded w-full mt-8"></div>
                  <div className="h-4 bg-muted/60 rounded w-4/5"></div>
                  <div className="h-4 bg-muted/60 rounded w-5/6"></div>
                </div>
                {/* Mockup Main content */}
                <div className="flex-1 flex flex-col gap-4 sm:gap-6">
                  <div className="flex gap-4">
                    <div className="h-24 sm:h-32 flex-1 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/20"></div>
                    <div className="h-24 sm:h-32 flex-1 bg-muted/20 rounded-xl border border-border"></div>
                    <div className="hidden md:block h-24 sm:h-32 flex-1 bg-muted/20 rounded-xl border border-border"></div>
                  </div>
                  <div className="flex-1 bg-card rounded-xl border border-border flex items-end p-4 gap-2">
                    {/* Fake Chart Bars */}
                    {[40, 70, 45, 90, 65, 100, 30, 85].map((h, i) => (
                      <div key={i} className="flex-1 bg-primary/40 rounded-t-sm" style={{ height: `${h}%` }}></div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Overlay gradient for fade out */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 pt-20 w-full">
            <div className="group flex flex-col items-center gap-4 p-8 rounded-2xl border border-border/50 bg-card/30 hover:bg-card/80 transition-colors">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center group-hover:scale-110 group-hover:-rotate-3 transition-transform">
                <LineChart className="w-7 h-7" />
              </div>
              <h3 className="font-semibold text-lg text-foreground">{copy[lang].features.f1.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {copy[lang].features.f1.desc}
              </p>
            </div>

            <div className="group flex flex-col items-center gap-4 p-8 rounded-2xl border border-border/50 bg-card/30 hover:bg-card/80 transition-colors">
              <div className="w-14 h-14 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform">
                <BellRing className="w-7 h-7" />
              </div>
              <h3 className="font-semibold text-lg text-foreground">{copy[lang].features.f2.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {copy[lang].features.f2.desc}
              </p>
            </div>

            <div className="group flex flex-col items-center gap-4 p-8 rounded-2xl border border-border/50 bg-card/30 hover:bg-card/80 transition-colors">
              <div className="w-14 h-14 rounded-2xl bg-green-500/10 text-green-500 flex items-center justify-center group-hover:scale-110 group-hover:-rotate-3 transition-transform">
                <Goal className="w-7 h-7" />
              </div>
              <h3 className="font-semibold text-lg text-foreground">{copy[lang].features.f3.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {copy[lang].features.f3.desc}
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-border/40 py-8 px-6 text-center text-sm text-muted-foreground bg-muted/10">
        <p>{copy[lang].footer}</p>
      </footer>
    </div>
  );
}
