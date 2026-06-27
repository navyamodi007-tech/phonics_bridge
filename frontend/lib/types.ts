// User types
export type UserRole = 'teacher' | 'student' | 'learner';

export interface Teacher {
  id: string;
  email: string;
  name: string;
  teacherCode: string;
  createdAt: string;
}

export interface StudentProfile {
  id: string;
  name: string;
  roleNumber: string;
  teacherId: string;
  practiceStreak: number;
  totalPracticeDays: number;
  totalPracticeSessions: number;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  teacherData?: Teacher;
  studentData?: StudentProfile;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// Student profile (backward compatible)
export interface Student {
  id: string;
  name: string;
  practiceStreak: number;
  totalPracticeDays: number;
  totalPracticeSessions: number;
}

// Phoneme pattern (e.g., "v/w confusion", "short-e", "th sounds")
export interface PhonemePattern {
  id: string;
  name: string;
  description: string;
  errorCount: number;
  lastSeen: string;
  status: 'resolved' | 'improving' | 'needs-work';
}

// Word in practice list
export interface PracticeWord {
  id: string;
  word: string;
  errorCount: number;
  totalAttempts: number;
  trend: 'improving' | 'declining' | 'stable';
  lastPracticed: string;
}

// Daily accuracy data point
export interface AccuracyDataPoint {
  date: string;
  accuracy: number;
}

// Practice paragraph
export interface PracticeParagraph {
  id: string;
  text: string;
  targetWords: {
    word: string;
    startIndex?: number;
    endIndex?: number;
    phoneme: string;
  }[];
}

// Word result from a practice session
export interface WordResult {
  word: string;
  correct: boolean;
  said?: string;
  phonemeFocus: string;
  explanation?: string;
}

// Practice session results
export interface PracticeSessionResult {
  paragraphId: string;
  results: WordResult[];
  timestamp: string;
  accuracy: number;
}

// Phoneme error frequency for charts
export interface ErrorFrequency {
  pattern: string;
  count: number;
}
