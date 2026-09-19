'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { BASE_API_URL } from '@/lib/config';
import { Button } from '@/components/ui/button';
import { DashboardWelcome } from '@/components/dashboard/DashboardWelcome';
import { StatsRow } from '@/components/dashboard/StatsRow';
import { WeakSounds } from '@/components/dashboard/WeakSounds';
import { SoundsFixed } from '@/components/dashboard/SoundsFixed';
import { AccuracyChart } from '@/components/dashboard/AccuracyChart';
import { WordsList } from '@/components/dashboard/WordsList';
import { PreviousSessions } from '@/components/dashboard/PreviousSessions';
import { OnboardingModal } from '@/components/ui/OnboardingModal';
import Link from 'next/link';
import { BookOpen, ArrowRight, Mic, BarChart2, Target, Users, Sparkles, Play } from 'lucide-react';

function Footer() {
  return (
    <footer
      className="w-full mt-12 py-8 px-4 text-center border-t transition-all duration-200"
      style={{
        borderColor: '#ece7df',
        background: 'rgba(255, 255, 255, 0.4)',
        backdropFilter: 'blur(8px)',
        fontFamily: 'Inter, sans-serif'
      }}
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm" style={{ color: '#6b7280' }}>
          &copy; {new Date().getFullYear()} PhonicsFlow. All rights reserved.
        </p>
        <p className="text-sm" style={{ color: '#4b5563', fontWeight: 500 }}>
          If you have any queries, contact us at:{' '}
          <a
            href="mailto:phonicsflow3@gmail.com"
            className="font-semibold transition-colors duration-150 hover:underline"
            style={{ color: '#0d9488' }}
          >
            phonicsflow3@gmail.com
          </a>
        </p>
      </div>
    </footer>
  );
}

/* ─── Landing Page for unauthenticated users ─── */
function LandingPage() {
  return (
    <div className="relative">
      {/* ── HERO SECTION ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left — copy */}
          <div className="space-y-7">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold" style={{ background: 'rgba(13,148,136,0.1)', color: '#0d9488', border: '1px solid rgba(13,148,136,0.2)', fontFamily: 'Inter, sans-serif' }}>
              <Sparkles className="w-4 h-4" />
              AI-Powered Phonics Practice
            </div>

            {/* Headline */}
            <div>
              <h1 className="text-5xl sm:text-6xl font-extrabold leading-[1.1] tracking-tight" style={{ fontFamily: 'Outfit, sans-serif', color: '#1a2332' }}>
                Stronger Sounds.
              </h1>
              <h1 className="text-5xl sm:text-6xl font-extrabold leading-[1.1] tracking-tight mt-1" style={{ fontFamily: 'Outfit, sans-serif', color: '#0d9488' }}>
                Brighter Futures.
              </h1>
            </div>

            {/* Sub */}
            <p className="text-lg leading-relaxed max-w-md" style={{ color: '#4b5563', fontFamily: 'Inter, sans-serif' }}>
              PhonicsFlow helps students improve phonics, build confidence, and track progress — one sound at a time.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4">
              <Link href="/signup">
                <button
                  className="flex items-center gap-2.5 px-7 py-3.5 rounded-full text-base font-bold text-white transition-all duration-200 hover:scale-105 hover:shadow-xl"
                  style={{ background: '#0d9488', boxShadow: '0 6px 24px rgba(13,148,136,0.38)', fontFamily: 'Inter, sans-serif' }}
                >
                  <BookOpen className="w-5 h-5" />
                  Get Started
                </button>
              </Link>
              {/* <button
                className="flex items-center gap-2.5 px-7 py-3.5 rounded-full text-base font-semibold border-2 transition-all duration-200 hover:bg-gray-50"
                style={{ borderColor: '#d1d5db', color: '#374151', fontFamily: 'Inter, sans-serif' }}
              >
                <Play className="w-4 h-4" />
                Watch Demo
              </button> */}
            </div>
          </div>

          {/* Right — hero visual */}
          <div className="relative flex items-center justify-center">
            {/* Large teal circle backdrop */}
            <div
              className="absolute"
              style={{
                width: '420px',
                height: '420px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(119, 13, 148, 0.13) 0%, rgba(13,148,136,0.04) 70%, transparent 100%)',
                border: '2px dashed rgba(13,148,136,0.2)',
              }}
            />

            {/* Central image placeholder — student with tablet */}
            <div
              className="relative z-10 flex items-center justify-center"
              style={{
                width: '320px',
                height: '360px',
                borderRadius: '50% 50% 48% 52%',
                background: 'linear-gradient(160deg, rgba(13,148,136,0.15) 0%, rgba(13,148,136,0.05) 100%)',
                border: '1px solid rgba(13,148,136,0.12)',
                overflow: 'hidden',
              }}
            >
              {/* Stylized student icon */}
              <div className="text-center space-y-3">
                <div
                  className="w-24 h-24 rounded-full mx-auto flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #967886, #0f766e)' }}
                >
                  <BookOpen className="w-12 h-12 text-white" />
                </div>
                <p className="text-sm font-semibold" style={{ color: '#0f766e', fontFamily: 'Inter, sans-serif' }}>Ready to Practice!</p>
              </div>
            </div>

            {/* Floating card — Accuracy */}
            <div
              className="absolute top-4 left-0 lg:-left-8 glass-card-flat p-4 animate-fade-in-up"
              style={{ minWidth: '130px', boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }}
            >
              <p className="text-xs font-semibold mb-2" style={{ color: '#6b7280', fontFamily: 'Inter, sans-serif' }}>Accuracy</p>
              {/* Donut */}
              <div className="flex items-center gap-3">
                <svg width="52" height="52" viewBox="0 0 52 52">
                  <circle cx="26" cy="26" r="20" fill="none" stroke="#e5e7eb" strokeWidth="6"/>
                  <circle cx="26" cy="26" r="20" fill="none" stroke="#0d9488" strokeWidth="6"
                    strokeDasharray={`${0.87 * 125.6} ${125.6}`}
                    strokeDashoffset="31.4"
                    strokeLinecap="round"
                    transform="rotate(-90 26 26)"
                  />
                  <text x="26" y="30" textAnchor="middle" fontSize="11" fontWeight="800" fill="#0d9488" fontFamily="Outfit, sans-serif">87%</text>
                </svg>
                <div>
                  <p className="text-xs font-medium" style={{ color: '#374151', fontFamily: 'Inter, sans-serif' }}>Great job!</p>
                </div>
              </div>
            </div>

            {/* Floating card — Practice Streak */}
            <div
              className="absolute top-6 right-0 lg:-right-4 glass-card-flat p-4 animate-fade-in-up delay-150"
              style={{ minWidth: '140px', boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }}
            >
              <p className="text-xs font-semibold mb-1" style={{ color: '#6b7280', fontFamily: 'Inter, sans-serif' }}>Practice Streak</p>
              <div className="flex items-center gap-1.5">
                <span style={{ fontSize: '22px' }}>🔥</span>
                <span className="text-3xl font-extrabold" style={{ color: '#1f2937', fontFamily: 'Outfit, sans-serif' }}>12</span>
              </div>
              <p className="text-xs mt-0.5" style={{ color: '#6b7280', fontFamily: 'Inter, sans-serif' }}>days</p>
              <p className="text-xs font-semibold mt-1" style={{ color: '#059669', fontFamily: 'Inter, sans-serif' }}>↑ Keep it up!</p>
            </div>

            {/* Floating card — Weak Sounds */}
            <div
              className="absolute bottom-4 right-0 lg:-right-4 glass-card-flat p-4 animate-fade-in-up delay-300"
              style={{ minWidth: '160px', boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }}
            >
              <p className="text-xs font-semibold mb-3" style={{ color: '#374151', fontFamily: 'Inter, sans-serif' }}>Weak Sounds</p>
              <div className="space-y-2">
                {[{sound:'/th/', errors:7,color:'#ef4444'},{sound:'/r/', errors:4,color:'#f59e0b'},{sound:'/v/', errors:2,color:'#10b981'}].map(item => (
                  <div key={item.sound} className="flex items-center justify-between gap-4">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full inline-block" style={{ background: item.color }} />
                      <span className="text-xs font-semibold" style={{ color: '#374151', fontFamily: 'Outfit, sans-serif' }}>{item.sound}</span>
                    </span>
                    <span className="text-xs" style={{ color: '#9ca3af', fontFamily: 'Inter, sans-serif' }}>{item.errors} errors</span>
                  </div>
                ))}
              </div>
              <button className="text-xs font-semibold mt-3 block" style={{ color: '#0d9488', fontFamily: 'Inter, sans-serif' }}>View all</button>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURE CARDS ROW ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div
          className="rounded-3xl p-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
          style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(12px)', border: '1px solid rgba(236,231,223,0.8)', boxShadow: '0 4px 30px rgba(0,0,0,0.05)' }}
        >
          {[
            {
              icon: <Mic className="w-7 h-7" />,
              iconBg: 'rgba(13,148,136,0.12)',
              iconColor: '#0d9488',
              title: 'Speak & Practice',
              desc: 'Record your voice and get instant phonics feedback.',
            },
            {
              icon: <BarChart2 className="w-7 h-7" />,
              iconBg: 'rgba(13,148,136,0.12)',
              iconColor: '#0d9488',
              title: 'Track Progress',
              desc: 'See your accuracy improve over time with smart analytics.',
            },
            {
              icon: <Target className="w-7 h-7" />,
              iconBg: 'rgba(251,113,133,0.12)',
              iconColor: '#e11d48',
              title: 'Focus on Weak Sounds',
              desc: 'Personalized insights help you target the sounds you need most.',
            },
            {
              icon: <Users className="w-7 h-7" />,
              iconBg: 'rgba(13,148,136,0.12)',
              iconColor: '#0d9488',
              title: 'Built for Classrooms',
              desc: 'Teachers can monitor student progress and support every learner.',
            },
          ].map((f, i) => (
            <div key={i} className="flex flex-col gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: f.iconBg, color: f.iconColor }}
              >
                {f.icon}
              </div>
              <div>
                <h3 className="font-bold text-base mb-1.5" style={{ color: '#1f2937', fontFamily: 'Outfit, sans-serif' }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#6b7280', fontFamily: 'Inter, sans-serif' }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      <Footer />
    </div>
  );
}

/* ─── Student Dashboard (authenticated students) ─── */
export default function RootPage() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuth();
  const [analytics, setAnalytics] = useState<any>(null);
  const [improvedWords, setImprovedWords] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated && (user?.role === 'student' || user?.role === 'learner')) {
      const onboarded = localStorage.getItem('phonics_bridge_onboarded_student');
      if (onboarded !== 'true') {
        setIsOnboardingOpen(true);
      }
    }
  }, [user, isLoading, isAuthenticated]);

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && user?.role === 'teacher') {
        router.push('/teacher');
      } else if (isAuthenticated && (user?.role === 'student' || user?.role === 'learner')) {
        setLoadingStats(true);
        const queryParam = user.role === 'student' ? `studentId=${user.id}` : `userId=${user.id}`;
        Promise.all([
          fetch(`${BASE_API_URL}/analytics?${queryParam}`).then((res) => {
            if (!res.ok) throw new Error('Failed to fetch analytics');
            return res.json();
          }),
          fetch(`${BASE_API_URL}/improved_words?${queryParam}`).then((res) => {
            if (!res.ok) throw new Error('Failed to fetch improved words');
            return res.json();
          }),
          fetch(`${BASE_API_URL}/sessions?${queryParam}`).then((res) => {
            if (!res.ok) throw new Error('Failed to fetch sessions');
            return res.json();
          }),
        ])
          .then(([analyticsData, improvedWordsData, sessionsData]) => {
            setAnalytics(analyticsData);
            setImprovedWords(improvedWordsData.improved_words || []);
            setSessions(sessionsData.sessions || []);
          })
          .catch((err) => {
            console.error('Failed to load dashboard data:', err);
          })
          .finally(() => {
            setLoadingStats(false);
          });
      } else {
        // Not authenticated — show landing, no loading needed
        setLoadingStats(false);
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  // Show landing for unauthenticated
  if (!isLoading && !isAuthenticated) {
    return <LandingPage />;
  }

  if (isLoading || (isAuthenticated && (user?.role === 'student' || user?.role === 'learner') && loadingStats)) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="spinner" />
          <p className="text-sm font-medium" style={{ color: '#6b7280', fontFamily: 'Inter, sans-serif' }}>
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || (user?.role !== 'student' && user?.role !== 'learner')) {
    return <LandingPage />;
  }

  // Parse analytics data
  const fixedSounds = (analytics?.weak_sounds || []).filter(
    (s: any) => s.errorCount === 0 || s.status === 'resolved'
  );
  const weakSoundsData = (analytics?.weak_sounds || []).filter(
    (s: any) => s.errorCount > 0 && s.status !== 'resolved'
  );

  const mappedWords = improvedWords.map((w: any, index: number) => {
    const attempts = w.sessions_practiced || 1;
    const latestAcc = w.latest_accuracy || 0;
    const errorCount = Math.round(attempts * (1 - latestAcc / 100));
    const lastSession =
      w.history && w.history.length > 0 ? w.history[w.history.length - 1] : null;
    const lastPracticed = lastSession
      ? new Date(lastSession.time_created).toLocaleDateString()
      : 'Recently';

    return {
      id: `word-${index}`,
      word: w.word,
      errorCount,
      totalAttempts: attempts,
      trend:
        w.improvement > 0
          ? ('improving' as const)
          : w.improvement < 0
          ? ('declining' as const)
          : ('stable' as const),
      lastPracticed,
    };
  });

  const mappedChartData =
    analytics?.session_history?.map((s: any) => ({
      date: new Date(s.time_created).toLocaleDateString(undefined, { weekday: 'short' }),
      // Azure's composite pronunciation score, matching the session ring
      // and the dashboard history cards.
      accuracy: Math.round(s.pronunciation ?? s.accuracy ?? 0),
    })) || [];

  const avgAccuracy =
    mappedChartData.length > 0
      ? Math.round(
          mappedChartData.reduce((a: number, b: any) => a + b.accuracy, 0) /
            mappedChartData.length
        )
      : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6 p-4 md:p-8">
      <DashboardWelcome />
      <StatsRow
        streak={analytics?.streak || user?.studentData?.practiceStreak || 0}
        totalSessions={analytics?.total_sessions || user?.studentData?.totalPracticeSessions || 0}
        averageAccuracy={avgAccuracy}
      />
      <div className="flex justify-center animate-fade-in-up delay-200">
        <Link href="/practice" id="start-practice-link">
          <Button
            id="start-practice-btn"
            size="lg"
            className="px-10 py-6 text-base shadow-lg gap-2"
            style={{ boxShadow: '0 8px 28px rgba(13,148,136,0.3)' }}
          >
            <BookOpen className="h-5 w-5" />
            Start Practice Session
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      </div>
      <WeakSounds weakSounds={weakSoundsData} />
      <AccuracyChart accuracyData={mappedChartData} />
      <WordsList words={mappedWords} />
      <PreviousSessions sessions={sessions} isLoading={loadingStats} />
      <SoundsFixed soundsFixed={fixedSounds} />
      <Footer />
      
      {/* Student Onboarding modal popup */}
      <OnboardingModal role="student" isOpen={isOnboardingOpen} onClose={() => setIsOnboardingOpen(false)} />
    </div>
  );
}
