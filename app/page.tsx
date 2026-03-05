'use client';

import { useRouter } from 'next/navigation';
import { useUser } from '@/lib/user-context';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LineChart, LayoutDashboard, BellRing, Goal, Globe, ArrowRight, ShieldCheck, Zap, Activity, Smartphone, Lock, Rocket, CreditCard } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useUser();
  const [lang, setLang] = useState<'fr' | 'ar'>('fr');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const copy = {
    fr: {
      nav_login: 'Connexion',
      nav_register: 'Démarrer',
      hero_badge: 'Bienvenue dans la nouvelle ère financière',
      hero_title_1: 'La plateforme ultime pour ',
      hero_title_highlight: 'maîtriser votre argent.',
      hero_subtitle: 'De l\'analyse des dépenses à la planification de vos objectifs, prenez des décisions éclairées avec notre interface intelligente et prédictive.',
      cta_primary: 'Commencer gratuitement',
      cta_secondary: 'Découvrir la plateforme',
      feat_title: 'Tout ce dont vous avez besoin, et plus encore.',
      feat_subtitle: 'Une architecture de niveau bancaire associée à une expérience utilisateur primée.',
      features: {
        f1: { title: 'Analytique Avancée', desc: 'Des graphiques puissants pour voir exactement où va votre argent, en temps réel.' },
        f2: { title: 'Alertes Prédictives', desc: 'Notre IA vous prévient avant que vous ne dépassiez vos budgets.' },
        f3: { title: 'Sécurité Maximale', desc: 'Chiffrement de bout en bout. Vos données vous appartiennent à 100%.' },
        f4: { title: 'Objectifs Intelligents', desc: 'Automatisez votre épargne et regardez votre patrimoine grandir jour après jour.' },
      },
      cta_bottom_title: 'Prêt à changer de dimension ?',
      cta_bottom_subtitle: 'Rejoignez des milliers d\'utilisateurs qui ont déjà révolutionné leur gestion financière.',
      footer: '© 2026 FinanceFlow. L\'excellence financière. Made with ❤️ by Seif RAHMOUNI - SOFTWARE ENGINEER',
    },
    ar: {
      nav_login: 'تسجيل الدخول',
      nav_register: 'ابدأ الآن',
      hero_badge: 'مرحباً بك في العصر المالي الجديد',
      hero_title_1: 'المنصة المطلقة لـ ',
      hero_title_highlight: 'السيطرة على أموالك.',
      hero_subtitle: 'من تحليل النفقات إلى التخطيط لأهدافك، اتخذ قرارات مستنيرة من خلال واجهتنا الذكية والتنبؤية.',
      cta_primary: 'ابدأ مجاناً',
      cta_secondary: 'استكشف المنصة',
      feat_title: 'كل ما تحتاجه، وأكثر بكثير.',
      feat_subtitle: 'بنية تحتية بمستوى بنكي مقترنة بتجربة مستخدم حائزة على جوائز.',
      features: {
        f1: { title: 'تحليلات متقدمة', desc: 'رسومات بيانية قوية لرؤية أين تذهب أموالك بالضبط، في الوقت الفعلي.' },
        f2: { title: 'تنبيهات تنبؤية', desc: 'ينبهك الذكاء الاصطناعي لدينا قبل تجاوز ميزانيتك.' },
        f3: { title: 'أمان أقصى', desc: 'تشفير شامل. بياناتك ملك لك بنسبة 100%.' },
        f4: { title: 'أهداف ذكية', desc: 'أتمتت مدخراتك وشاهد ثروتك تنمو يوماً بعد يوم.' },
      },
      cta_bottom_title: 'مستعد لتغيير البعد؟',
      cta_bottom_subtitle: 'انضم إلى آلاف المستخدمين الذين أحدثوا ثورة في إدارتهم المالية.',
      footer: '© 2024 FinanceFlow. التميز المالي.',
    }
  };

  const isRtl = lang === 'ar';
  const textDir = isRtl ? 'rtl' : 'ltr';
  const t = copy[lang];

  return (
    <div dir={textDir} className="min-h-screen bg-zinc-950 text-zinc-50 font-sans selection:bg-primary/30 overflow-x-hidden">

      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[150px] rounded-full mix-blend-screen opacity-50 animate-float"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-600/20 blur-[150px] rounded-full mix-blend-screen opacity-40 animate-float" style={{ animationDelay: '3s' }}></div>
        <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] bg-purple-600/20 blur-[120px] rounded-full mix-blend-screen opacity-30 animate-float" style={{ animationDelay: '5s' }}></div>
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </div>

      {/* Modern Glass Header */}
      <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'bg-zinc-950/80 backdrop-blur-xl border-b border-white/10 py-3 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)]' : 'bg-transparent py-5'} px-4 sm:px-8`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-black text-lg shadow-[0_0_20px_rgba(var(--primary),0.4)] border border-primary/50 relative overflow-hidden group">
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              <span className="relative z-10">FF</span>
            </div>
            <span className="font-extrabold text-xl tracking-tight hidden sm:block bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">FinanceFlow</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLang(l => l === 'fr' ? 'ar' : 'fr')}
              className="flex items-center gap-2 bg-zinc-900/50 border-white/10 hover:bg-zinc-800 text-zinc-300 backdrop-blur-sm rounded-full h-9 px-4"
            >
              <Globe className="w-4 h-4 text-primary" />
              <span className="hidden sm:inline font-medium">{lang === 'fr' ? 'العربية' : 'Français'}</span>
            </Button>
            <Link href="/login">
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex text-zinc-300 hover:text-white hover:bg-white/5 rounded-full px-5 h-9 font-medium">
                {t.nav_login}
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="rounded-full bg-white text-zinc-950 hover:bg-zinc-200 h-9 px-5 font-bold shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-all">
                {t.nav_register}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex flex-col items-center">
        {/* HERO SECTION */}
        <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 pt-32 lg:pt-48 pb-20 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8 animate-in slide-in-from-bottom-5 duration-700 fade-in">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-sm font-medium text-zinc-300">{t.hero_badge}</span>
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tight leading-[1.1] mb-8 animate-in slide-in-from-bottom-8 duration-700 delay-100 fade-in max-w-5xl">
            {t.hero_title_1}
            <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-primary bg-300% animate-gradient">
              {t.hero_title_highlight}
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-zinc-400 font-medium leading-relaxed max-w-2xl mx-auto mb-10 animate-in slide-in-from-bottom-10 duration-700 delay-200 fade-in">
            {t.hero_subtitle}
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 animate-in slide-in-from-bottom-12 duration-700 delay-300 fade-in w-full sm:w-auto">
            <Link href="/register" className="w-full sm:w-auto">
              <Button size="lg" className="w-full h-14 px-8 text-base font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-[0_0_40px_-10px_rgba(var(--primary),0.8)] hover:shadow-[0_0_60px_-15px_rgba(var(--primary),1)] transition-all hover:-translate-y-1">
                {t.cta_primary}
                <ArrowRight className={`w-5 h-5 ${isRtl ? 'mr-2 rotate-180' : 'ml-2'}`} />
              </Button>
            </Link>
            <Link href="#features" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full h-14 px-8 text-base font-bold bg-zinc-950/50 border-white/10 text-white hover:bg-white/10 rounded-full backdrop-blur-md transition-all">
                {t.cta_secondary}
              </Button>
            </Link>
          </div>
        </section>

        {/* 3D DASHBOARD PREVIEW */}
        <section className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 relative my-10 animate-in zoom-in-95 duration-1000 delay-500 fade-in">
          {/* Glowing backplate for dashboard */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-transparent blur-[100px] -z-10 rounded-full"></div>

          <div className="relative w-full aspect-[16/10] md:aspect-[21/9] rounded-3xl overflow-hidden border border-white/10 bg-zinc-950/40 backdrop-blur-2xl shadow-[0_20px_80px_-20px_rgba(0,0,0,1)] ring-1 ring-white/5 transform-gpu transition-all duration-1000 perspective-1000 rotate-x-6 hover:rotate-x-0 group">

            {/* Window Controls */}
            <div className="absolute top-0 inset-x-0 h-14 border-b border-white/5 bg-white/[0.02] flex items-center px-6 gap-2">
              <div className="flex gap-2">
                <div className="w-3.5 h-3.5 rounded-full bg-zinc-700 group-hover:bg-red-500 transition-colors duration-500"></div>
                <div className="w-3.5 h-3.5 rounded-full bg-zinc-700 group-hover:bg-amber-500 transition-colors duration-500 delay-75"></div>
                <div className="w-3.5 h-3.5 rounded-full bg-zinc-700 group-hover:bg-green-500 transition-colors duration-500 delay-150"></div>
              </div>
            </div>

            {/* Mockup UI Interface */}
            <div className="absolute top-14 bottom-0 inset-x-0 p-6 sm:p-10 flex gap-8">
              {/* Sidebar */}
              <div className="hidden lg:flex w-64 flex-col gap-6">
                <div className="h-10 bg-white/5 rounded-xl border border-white/5 w-full flex items-center px-4 gap-3">
                  <div className="w-5 h-5 rounded bg-primary/80"></div>
                  <div className="h-3 w-24 bg-white/20 rounded-full"></div>
                </div>
                <div className="space-y-4 mt-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className={`h-10 rounded-lg flex items-center px-4 ${i === 1 ? 'bg-primary/10 border border-primary/20' : 'hover:bg-white/5 border border-transparent'}`}>
                      <div className={`h-3 rounded-full ${i === 1 ? 'w-20 bg-primary/60' : 'w-24 bg-white/10'}`}></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Main Canvas */}
              <div className="flex-1 flex flex-col gap-6">
                <div className="flex justify-between items-center">
                  <div className="h-8 w-48 bg-white/10 rounded-lg"></div>
                  <div className="hidden sm:flex h-10 w-32 bg-primary rounded-xl"></div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className={`p-6 rounded-2xl border ${i === 1 ? 'bg-gradient-to-br from-primary/20 to-primary/5 border-primary/30' : 'bg-white/5 border-white/5'} flex flex-col justify-between h-32`}>
                      <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
                        {i === 1 && <CreditCard className="w-5 h-5 text-primary" />}
                        {i === 2 && <Activity className="w-5 h-5 text-blue-400" />}
                        {i === 3 && <Goal className="w-5 h-5 text-purple-400" />}
                      </div>
                      <div>
                        <div className="h-6 w-24 bg-white/20 rounded-md mb-2"></div>
                        <div className="h-3 w-16 bg-white/10 rounded-full"></div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Big Chart Area */}
                <div className="flex-1 rounded-2xl bg-white/[0.02] border border-white/5 p-6 flex items-end gap-2 sm:gap-4 relative overflow-hidden">
                  {/* Grid lines */}
                  <div className="absolute inset-0 flex flex-col justify-between py-6 px-4">
                    {[1, 2, 3, 4].map(i => <div key={i} className="w-full h-px bg-white/5"></div>)}
                  </div>
                  {/* Bars */}
                  {[30, 50, 40, 70, 60, 90, 80, 100, 85, 95].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-gradient-to-t from-primary/80 to-blue-400/80 rounded-t-sm lg:rounded-t-md relative group/bar transition-all duration-500 hover:from-primary hover:to-blue-300"
                      style={{ height: `${h}%`, animation: `chartGrow 1.5s ease-out forwards`, animationDelay: `${i * 0.1}s`, transformOrigin: 'bottom', transform: 'scaleY(0)' }}
                    >
                      <div className="absolute top-0 inset-x-0 h-1 bg-white/50 rounded-t-md opacity-0 group-hover/bar:opacity-100"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Fade out bottom to blend */}
            <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent pointer-events-none"></div>
          </div>
        </section>

        {/* FEATURES BENTO GRID */}
        <section id="features" className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-32">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">{t.feat_title}</h2>
            <p className="text-lg text-zinc-400 max-w-2xl mx-auto">{t.feat_subtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 - Large spanning */}
            <div className="md:col-span-2 group relative p-8 rounded-3xl bg-zinc-900/50 border border-white/10 overflow-hidden hover:bg-zinc-900/80 transition-all duration-500">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] group-hover:bg-primary/20 transition-colors"></div>
              <div className="relative z-10 flex flex-col h-full justify-between gap-8">
                <div className="space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary/20 text-primary flex items-center justify-center border border-primary/20 shadow-inner group-hover:scale-110 transition-transform">
                    <LineChart className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">{t.features.f1.title}</h3>
                  <p className="text-zinc-400 text-lg leading-relaxed max-w-md">{t.features.f1.desc}</p>
                </div>
                {/* Micro illustration */}
                <div className="h-40 w-full rounded-xl bg-gradient-to-t from-black/50 to-transparent border border-white/5 relative overflow-hidden flex items-end px-6">
                  <div className="w-full h-[60%] border-t-2 border-primary border-dashed relative">
                    <div className="absolute top-[-6px] right-10 w-3 h-3 rounded-full bg-primary shadow-[0_0_10px_rgba(var(--primary),1)] animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group relative p-8 rounded-3xl bg-zinc-900/50 border border-white/10 overflow-hidden hover:bg-zinc-900/80 transition-all duration-500">
              <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/10 rounded-full blur-[60px] group-hover:bg-amber-500/20 transition-colors"></div>
              <div className="relative z-10 space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20 group-hover:rotate-12 transition-transform">
                  <BellRing className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold text-white">{t.features.f2.title}</h3>
                <p className="text-zinc-400 text-lg leading-relaxed">{t.features.f2.desc}</p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group relative p-8 rounded-3xl bg-zinc-900/50 border border-white/10 overflow-hidden hover:bg-zinc-900/80 transition-all duration-500">
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-zinc-400/10 rounded-full blur-[60px] group-hover:bg-zinc-400/20 transition-colors"></div>
              <div className="relative z-10 space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-zinc-800 text-zinc-300 flex items-center justify-center border border-zinc-700 group-hover:-rotate-12 transition-transform">
                  <Lock className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold text-white">{t.features.f3.title}</h3>
                <p className="text-zinc-400 text-lg leading-relaxed">{t.features.f3.desc}</p>
              </div>
            </div>

            {/* Feature 4 - Large spanning */}
            <div className="md:col-span-2 group relative p-8 rounded-3xl bg-gradient-to-br from-zinc-900/50 to-primary/5 border border-white/10 overflow-hidden hover:to-primary/10 transition-all duration-500">
              <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-8">
                <div className="space-y-4 flex-1">
                  <div className="w-14 h-14 rounded-2xl bg-green-500/10 text-green-500 flex items-center justify-center border border-green-500/20 group-hover:scale-110 transition-transform">
                    <Goal className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">{t.features.f4.title}</h3>
                  <p className="text-zinc-400 text-lg leading-relaxed">{t.features.f4.desc}</p>
                </div>
                <div className="w-32 h-32 shrink-0 rounded-full border-4 border-zinc-800 border-t-green-500 border-r-green-500 flex items-center justify-center relative rotate-45 group-hover:rotate-90 transition-transform duration-1000">
                  <div className="w-24 h-24 rounded-full bg-zinc-900 flex items-center justify-center -rotate-45 group-hover:-rotate-90 transition-transform duration-1000">
                    <span className="text-2xl font-bold text-white">75%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* BOTTOM CTA */}
        <section className="w-full px-4 sm:px-6 py-24 mb-10 relative">
          <div className="max-w-5xl mx-auto bg-gradient-to-r from-primary/20 via-blue-600/20 to-purple-600/20 rounded-[3rem] p-1 border border-white/10 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 mix-blend-overlay"></div>
            <div className="bg-zinc-950/80 backdrop-blur-3xl rounded-[2.8rem] px-6 py-16 sm:py-24 text-center relative z-10">
              <h2 className="text-4xl sm:text-5xl font-black text-white mb-6">{t.cta_bottom_title}</h2>
              <p className="text-xl text-zinc-400 mb-10 max-w-2xl mx-auto">{t.cta_bottom_subtitle}</p>
              <Link href="/register">
                <Button size="lg" className="h-16 px-10 rounded-full text-lg font-bold bg-white text-zinc-950 hover:bg-zinc-200 shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:shadow-[0_0_50px_rgba(255,255,255,0.5)] transition-all hover:scale-105">
                  <Rocket className={`w-6 h-6 ${isRtl ? 'ml-2' : 'mr-2'}`} />
                  {t.cta_primary}
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/5 py-12 px-6 text-center text-sm font-medium text-zinc-500 bg-zinc-950">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-zinc-800 flex items-center justify-center text-white font-bold text-[10px]">FF</div>
            <span className="text-zinc-300 font-semibold tracking-tight">FinanceFlow</span>
          </div>
          <p>{t.footer}</p>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-zinc-300 transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-zinc-300 transition-colors">Terms</Link>
            <Link href="#" className="hover:text-zinc-300 transition-colors">Contact</Link>
          </div>
        </div>
      </footer>

      {/* Global strict styles for custom animations */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes chartGrow {
          from { transform: scaleY(0); }
          to { transform: scaleY(1); }
        }
        .bg-300\\% {
          background-size: 300% 300%;
        }
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          animation: gradient 8s ease infinite;
        }
      `}} />
    </div>
  );
}
