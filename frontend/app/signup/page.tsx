'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, GraduationCap, BookOpen, Users, Sparkles } from 'lucide-react';
import Link from 'next/link';


export default function SignUpPage() {
  const router = useRouter();
  const { signUp, isLoading, isAuthenticated, user } = useAuth();
  const [role, setRole] = useState<'teacher' | 'student' | 'learner'>('teacher');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [roleNumber, setRoleNumber] = useState('');
  const [teacherCode, setTeacherCode] = useState('');

  // Principal Details (for Teacher role)
  const [schoolName, setSchoolName] = useState('');
  const [principalName, setPrincipalName] = useState('');
  const [principalEmail, setPrincipalEmail] = useState('');

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      if (user.role === 'teacher') {
        router.push('/teacher');
      } else {
        router.push('/');
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Trim all text fields
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedRoleNumber = roleNumber.trim();
    const trimmedTeacherCode = teacherCode.trim();

    if (!trimmedName) {
      setError('Please enter your name');
      return;
    }

    if (role === 'teacher' || role === 'learner') {
      if (!trimmedEmail) { setError('Please enter your email'); return; }
      if (!password.trim()) { setError('Please enter a password'); return; }
      if (password !== confirmPassword) { setError('Passwords do not match'); return; }
      if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
      if (role === 'teacher') {
        if (!schoolName.trim()) { setError('Please enter your school name'); return; }
        if (!principalName.trim()) { setError('Please enter the principal\'s name'); return; }
        if (!principalEmail.trim()) { setError('Please enter the principal\'s email'); return; }
      }
    } else {
      if (!trimmedRoleNumber) { setError('Please enter your role number'); return; }
      if (!trimmedTeacherCode) { setError('Please enter your teacher code'); return; }
    }

    setLoading(true);

    try {
      const metadata = (role === 'teacher' || role === 'learner')
        ? { 
            name: trimmedName,
            schoolName: role === 'teacher' ? schoolName.trim() : undefined,
            principalEmail: role === 'teacher' ? principalEmail.trim() : undefined,
            principalName: role === 'teacher' ? principalName.trim() : undefined,
          }
        : { name: trimmedName, roleNumber: trimmedRoleNumber, teacherCode: trimmedTeacherCode };

      await signUp(trimmedEmail, password, role, metadata);

      if (role === 'teacher') {
        router.push('/teacher');
      } else {
        router.push('/');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-8 relative"
    >

      <div className="relative z-10 w-full max-w-md animate-fade-in-up">

        {/* ── Logo ── */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-6 sm:mb-8">
          <div
            className="w-10 h-10 sm:w-14 sm:h-14 rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-lg flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #0d9488, #0f766e)' }}
          >
            <GraduationCap className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <div>
            <h1
              className="text-2xl sm:text-3xl font-extrabold leading-none"
              style={{ fontFamily: 'Outfit, sans-serif', color: '#1f2937', letterSpacing: '-0.02em' }}
            >
              Phonics<span style={{ color: '#0d9488' }}> Bridge</span>
            </h1>
          </div>
        </div>

        {/* ── Card ── */}
        <div
          className="glass-card-flat p-5 sm:p-8"
          style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.08)' }}
        >
          {/* Card header */}
          <div className="text-center mb-7">
            <h2
              className="text-2xl font-bold"
              style={{ fontFamily: 'Outfit, sans-serif', color: '#1f2937' }}
            >
              Create Account
            </h2>
            <p className="text-sm mt-1" style={{ color: '#6b7280', fontFamily: 'Inter, sans-serif' }}>
              Join PhonicsFlow and start learning
            </p>
          </div>

          {/* ── Role Toggle ── */}
          <div className="pill-tab-container mb-6">
            <button
              id="role-teacher-signup-btn"
              type="button"
              onClick={() => { setRole('teacher'); setError(''); }}
              className={`pill-tab ${role === 'teacher' ? 'active' : ''}`}
            >
              <span className="flex items-center justify-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                Teacher
              </span>
            </button>
            <button
              id="role-student-signup-btn"
              type="button"
              onClick={() => { setRole('student'); setError(''); }}
              className={`pill-tab ${role === 'student' ? 'active' : ''}`}
            >
              <span className="flex items-center justify-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                Student
              </span>
            </button>
            <button
              id="role-learner-signup-btn"
              type="button"
              onClick={() => { setRole('learner'); setError(''); }}
              className={`pill-tab ${role === 'learner' ? 'active' : ''}`}
            >
              <span className="flex items-center justify-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Learner
              </span>
            </button>
          </div>

          {/* ── Form ── */}
          <form id="signup-form" onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div
                className="flex items-center gap-2 p-3 rounded-2xl text-sm animate-fade-in"
                style={{ background: '#fff1f2', border: '1px solid #fecdd3', color: '#e11d48' }}
              >
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span style={{ fontFamily: 'Inter, sans-serif' }}>{error}</span>
              </div>
            )}

            {/* Name (always shown) */}
            <div className="space-y-1.5">
              <label
                htmlFor="signup-name"
                className="text-sm font-semibold block"
                style={{ color: '#374151', fontFamily: 'Inter, sans-serif' }}
              >
                Full Name
              </label>
              <Input
                id="signup-name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            {role === 'teacher' || role === 'learner' ? (
              <>
                {role === 'teacher' && (
                  <>
                    <div className="space-y-1.5 animate-fade-in">
                      <label
                        htmlFor="signup-school"
                        className="text-sm font-semibold block"
                        style={{ color: '#374151', fontFamily: 'Inter, sans-serif' }}
                      >
                        School Name
                      </label>
                      <Input
                        id="signup-school"
                        type="text"
                        placeholder="e.g. Modinagar Primary School"
                        value={schoolName}
                        onChange={(e) => setSchoolName(e.target.value)}
                        disabled={loading}
                        required
                      />
                    </div>
                    <div className="space-y-1.5 animate-fade-in">
                      <label
                        htmlFor="signup-principal-name"
                        className="text-sm font-semibold block"
                        style={{ color: '#374151', fontFamily: 'Inter, sans-serif' }}
                      >
                        Principal Name
                      </label>
                      <Input
                        id="signup-principal-name"
                        type="text"
                        placeholder="e.g. Dr. Narendra Modi"
                        value={principalName}
                        onChange={(e) => setPrincipalName(e.target.value)}
                        disabled={loading}
                        required
                      />
                    </div>
                    <div className="space-y-1.5 animate-fade-in">
                      <label
                        htmlFor="signup-principal-email"
                        className="text-sm font-semibold block"
                        style={{ color: '#374151', fontFamily: 'Inter, sans-serif' }}
                      >
                        Principal Email
                      </label>
                      <Input
                        id="signup-principal-email"
                        type="email"
                        placeholder="principal@school.com"
                        value={principalEmail}
                        onChange={(e) => setPrincipalEmail(e.target.value)}
                        disabled={loading}
                        required
                      />
                    </div>
                  </>
                )}
                <div className="space-y-1.5">
                  <label
                    htmlFor="signup-email"
                    className="text-sm font-semibold block"
                    style={{ color: '#374151', fontFamily: 'Inter, sans-serif' }}
                  >
                    Email
                  </label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="your@school.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label
                    htmlFor="signup-password"
                    className="text-sm font-semibold block"
                    style={{ color: '#374151', fontFamily: 'Inter, sans-serif' }}
                  >
                    Password
                  </label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label
                    htmlFor="signup-confirm-password"
                    className="text-sm font-semibold block"
                    style={{ color: '#374151', fontFamily: 'Inter, sans-serif' }}
                  >
                    Confirm Password
                  </label>
                  <Input
                    id="signup-confirm-password"
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-1.5">
                  <label
                    htmlFor="signup-role-number"
                    className="text-sm font-semibold block"
                    style={{ color: '#374151', fontFamily: 'Inter, sans-serif' }}
                  >
                    Role Number
                  </label>
                  <Input
                    id="signup-role-number"
                    type="text"
                    placeholder="e.g., RN123"
                    value={roleNumber}
                    onChange={(e) => setRoleNumber(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label
                    htmlFor="signup-teacher-code"
                    className="text-sm font-semibold block"
                    style={{ color: '#374151', fontFamily: 'Inter, sans-serif' }}
                  >
                    Teacher Code
                  </label>
                  <Input
                    id="signup-teacher-code"
                    type="text"
                    placeholder="Ask your teacher for this code"
                    value={teacherCode}
                    onChange={(e) => setTeacherCode(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
              </>
            )}

            <Button
              id="signup-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>

            <p
              className="text-center text-sm"
              style={{ color: '#9ca3af', fontFamily: 'Inter, sans-serif' }}
            >
              Already have an account?{' '}
              <Link
                href="/signin"
                className="font-bold hover:underline transition-colors"
                style={{ color: '#0d9488' }}
              >
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
