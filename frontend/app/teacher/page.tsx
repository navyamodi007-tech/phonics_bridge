'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { BASE_API_URL } from '@/lib/config';
import { Button } from '@/components/ui/button';
import { Copy, BookOpen, Users, Check, GraduationCap, ChevronRight, Send, Loader2, Info } from 'lucide-react';
import { PreviousSessions } from '@/components/dashboard/PreviousSessions';
import { OnboardingModal } from '@/components/ui/OnboardingModal';
import { IntroVideoModal } from '@/components/ui/IntroVideoModal';

export default function TeacherDashboard() {
  const router = useRouter();
  const { user, signOut, isLoading } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isIntroOpen, setIsIntroOpen] = useState(false);
  const [sendingReport, setSendingReport] = useState(false);
  const [reportMsg, setReportMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    if (!isLoading && user?.role === 'teacher') {
      const onboarded = localStorage.getItem('phonics_bridge_onboarded_teacher');
      if (onboarded !== 'true') {
        setIsOnboardingOpen(true);
      }
    }
  }, [user, isLoading]);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'teacher')) {
      router.push('/signin');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user?.id) {
      setLoadingStudents(true);
      fetch(`${BASE_API_URL}/teacher-students?userId=${user.id}`)
        .then((res) => {
          if (!res.ok) throw new Error('Failed to fetch students');
          return res.json();
        })
        .then((data) => setStudents(data))
        .catch((err) => console.error(err))
        .finally(() => setLoadingStudents(false));

      setLoadingSessions(true);
      fetch(`${BASE_API_URL}/sessions?userId=${user.id}`)
        .then((res) => {
          if (!res.ok) throw new Error('Failed to fetch sessions');
          return res.json();
        })
        .then((data) => setSessions(data.sessions || []))
        .catch((err) => console.error(err))
        .finally(() => setLoadingSessions(false));
    }
  }, [user?.id]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="spinner" />
          <p className="text-sm" style={{ color: '#6b7280' }}>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user?.teacherData) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(user.teacherData!.teacherCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendReport = async () => {
    if (!user?.id || sendingReport) return;
    setSendingReport(true);
    setReportMsg(null);
    try {
      const res = await fetch(`${BASE_API_URL}/send-principal-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
      const data = await res.json();
      setReportMsg({ ok: !!data.success, text: data.msg || (data.success ? 'Report sent.' : 'Could not send report.') });
    } catch {
      setReportMsg({ ok: false, text: 'Something went wrong. Please try again.' });
    } finally {
      setSendingReport(false);
      setTimeout(() => setReportMsg(null), 6000);
    }
  };

  const teacherName = user.teacherData.name?.split(' ')[0] || 'Teacher';

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in-up">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-md"
              style={{ background: 'linear-gradient(135deg, #0d9488, #0f766e)' }}
            >
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <h1
              className="text-3xl md:text-4xl font-extrabold leading-tight"
              style={{ fontFamily: 'Outfit, sans-serif', color: '#1f2937', letterSpacing: '-0.02em' }}
            >
              Welcome back,{' '}
              <span style={{ color: '#0d9488' }}>{teacherName}!</span>
            </h1>
            <button
              id="intro-video-btn"
              onClick={() => setIsIntroOpen(true)}
              aria-label="Watch intro video"
              title="Watch intro video"
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
              style={{
                background: 'rgba(13,148,136,0.08)',
                border: '1px solid #99f6e4',
                color: '#0d9488',
              }}
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
          <p className="ml-12 text-sm" style={{ color: '#6b7280', fontFamily: 'Inter, sans-serif' }}>
            {students.length} student{students.length !== 1 ? 's' : ''} in your class
          </p>
          {/* Accent underline */}
          <div
            className="ml-12 mt-2"
            style={{
              height: 3,
              width: 100,
              background: 'linear-gradient(90deg, #0d9488, #fbbf24, transparent)',
              borderRadius: 9999,
            }}
          />
        </div>

        <div className="flex flex-col items-stretch sm:items-end gap-2">
          <div className="flex items-center gap-2">
            <Button
              id="send-principal-report-btn"
              onClick={handleSendReport}
              disabled={sendingReport}
              variant="outline"
              size="default"
            >
              {sendingReport ? (
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-1.5" />
              )}
              {sendingReport ? 'Sending...' : 'Email Principal Report'}
            </Button>
            <Button
              id="take-test-btn"
              onClick={() => router.push('/practice')}
              size="default"
            >
              <BookOpen className="w-4 h-4 mr-1.5" />
              Take Test
            </Button>
          </div>
          {reportMsg && (
            <p
              className="text-xs font-medium animate-fade-in text-right"
              style={{ color: reportMsg.ok ? '#059669' : '#dc2626' }}
            >
              {reportMsg.ok ? '✓ ' : '⚠ '}
              {reportMsg.text}
            </p>
          )}
        </div>
      </div>

      {/* ── Teacher Code Card ── */}
      <div
        className="glass-card p-6 animate-fade-in-up delay-100 relative overflow-hidden"
      >
        {/* Background teal blob */}
        <div
          className="absolute -top-8 -right-8 w-32 h-32 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(13,148,136,0.08) 0%, transparent 70%)' }}
        />

        <div className="flex items-center gap-2.5 mb-4">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #f0fdfa, #ccfbf1)' }}
          >
            <Users className="w-4 h-4" style={{ color: '#0d9488' }} />
          </div>
          <div>
            <h2
              className="text-lg font-bold leading-tight"
              style={{ fontFamily: 'Outfit, sans-serif', color: '#1f2937' }}
            >
              Your Teacher Code
            </h2>
            <p className="text-xs" style={{ color: '#6b7280' }}>
              Share with students so they can join your class
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div
            className="flex-1 rounded-2xl py-4 px-6 text-center"
            style={{
              background: 'linear-gradient(135deg, #f0fdfa, #fffaf4)',
              border: '2px dashed rgba(13,148,136,0.25)',
            }}
          >
            <p className="teacher-code">{user.teacherData.teacherCode}</p>
          </div>
          <button
            id="copy-teacher-code-btn"
            onClick={handleCopyCode}
            className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200 hover:scale-105"
            style={{
              background: copied ? 'rgba(5,150,105,0.1)' : 'rgba(13,148,136,0.08)',
              border: `1px solid ${copied ? '#bbf7d0' : '#99f6e4'}`,
              color: copied ? '#059669' : '#0d9488',
            }}
            aria-label="Copy teacher code"
          >
            {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
          </button>
        </div>

        {copied && (
          <p
            className="text-xs text-center mt-2 animate-fade-in font-medium"
            style={{ color: '#059669' }}
          >
            ✓ Copied to clipboard!
          </p>
        )}
      </div>

      {/* ── Students Section ── */}
      <div className="animate-fade-in-up delay-200">
        <h2
          className="text-2xl font-bold mb-5"
          style={{ fontFamily: 'Outfit, sans-serif', color: '#1f2937' }}
        >
          Your Students
          {students.length > 0 && (
            <span
              className="ml-2 text-base font-semibold px-2.5 py-0.5 rounded-full"
              style={{ background: 'rgba(13,148,136,0.1)', color: '#0d9488', fontFamily: 'Inter, sans-serif' }}
            >
              {students.length}
            </span>
          )}
        </h2>

        {loadingStudents ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <div className="spinner" />
            <p className="text-sm font-medium animate-pulse" style={{ color: '#6b7280', fontFamily: 'Inter, sans-serif' }}>
              Loading students...
            </p>
          </div>
        ) : students.length === 0 ? (
          <div
            className="glass-card py-16 px-8 text-center"
            style={{ background: 'rgba(255,250,244,0.8)' }}
          >
            {/* Empty state illustration */}
            <div
              className="w-20 h-20 rounded-full mx-auto mb-5 flex items-center justify-center text-4xl"
              style={{ background: 'linear-gradient(135deg, #f0fdfa, #ccfbf1)' }}
            >
              📚
            </div>
            <p
              className="text-xl font-bold mb-2"
              style={{ fontFamily: 'Outfit, sans-serif', color: '#1f2937' }}
            >
              No students yet
            </p>
            <p
              className="max-w-sm mx-auto text-sm"
              style={{ color: '#6b7280', fontFamily: 'Inter, sans-serif' }}
            >
              Share your teacher code above with your students. They&apos;ll appear here once they sign up.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {students.map((student, i) => (
              <div
                key={student.id}
                id={`student-card-${student.id}`}
                className="glass-card p-5 cursor-pointer transition-all duration-250 animate-fade-in-up"
                style={{ animationDelay: `${0.2 + i * 0.05}s` }}
                onClick={() => router.push(`/teacher/student/${student.id}`)}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px) scale(1.01)';
                  (e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 40px rgba(0,0,0,0.09)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.transform = '';
                  (e.currentTarget as HTMLDivElement).style.boxShadow = '';
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Avatar */}
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }}
                  >
                    {student.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || '??'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-bold text-base truncate"
                      style={{ fontFamily: 'Outfit, sans-serif', color: '#1f2937' }}
                    >
                      {student.name}
                    </p>
                    <p className="text-xs" style={{ color: '#6b7280' }}>
                      Role #{student.roleNumber}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: '#9ca3af' }} />
                </div>

                {/* Stats */}
                <div
                  className="mt-4 pt-4 grid grid-cols-3 gap-2"
                  style={{ borderTop: '1px solid #ece7df' }}
                >
                  <div className="text-center">
                    <p
                      className="text-lg font-extrabold"
                      style={{ fontFamily: 'Outfit, sans-serif', color: '#0d9488' }}
                    >
                      {student.practiceStreak}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>day streak 🔥</p>
                  </div>
                  <div className="text-center">
                    <p
                      className="text-lg font-extrabold"
                      style={{ fontFamily: 'Outfit, sans-serif', color: '#1f2937' }}
                    >
                      {student.totalPracticeDays}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>practice days</p>
                  </div>
                  <div className="text-center">
                    <p
                      className="text-lg font-extrabold"
                      style={{ fontFamily: 'Outfit, sans-serif', color: '#1f2937' }}
                    >
                      {student.totalPracticeSessions}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>sessions</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Teacher's Own Previous Sessions */}
      <div className="animate-fade-in-up delay-300 pt-4" style={{ borderTop: '1px solid #ece7df' }}>
        <PreviousSessions sessions={sessions} isLoading={loadingSessions} title="Your Own Practice Sessions" />
      </div>

      {/* Onboarding walk-through modal */}
      <OnboardingModal role="teacher" isOpen={isOnboardingOpen} onClose={() => setIsOnboardingOpen(false)} />

      {/* Intro video modal (opened from the "i" button) */}
      <IntroVideoModal isOpen={isIntroOpen} onClose={() => setIsIntroOpen(false)} />
    </div>
  );
}
