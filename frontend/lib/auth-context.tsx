'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, AuthState, UserRole } from './types';
import { BASE_API_URL } from './config';

interface AuthContextType extends AuthState {
  signUp: (email: string, password: string, role: UserRole, extraData?: any) => Promise<void>;
  signIn: (email: string, password: string, teacher?: boolean) => Promise<void>;
  studentSignIn: (rollNumber: string, teacherCode: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'phonics_bridge_auth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Initialize from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const userData = JSON.parse(stored);
        setState({
          user: userData,
          isLoading: false,
          isAuthenticated: true,
        });
      } catch (error) {
        setState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    } else {
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  }, []);

  const signUp = async (
    email: string,
    password: string,
    role: UserRole,
    extraData?: { 
      name?: string; 
      roleNumber?: string; 
      teacherCode?: string;
      schoolName?: string;
      principalEmail?: string;
      principalName?: string;
    }
  ) => {
    try {
      if (role === 'teacher' || role === 'learner') {
        const response = await fetch(`${BASE_API_URL}/signin`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            email, 
            password, 
            teacher: role === 'teacher',
            school_name: extraData?.schoolName || '',
            principal_email: extraData?.principalEmail || '',
            principal_name: extraData?.principalName || '',
          }),
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.msg || 'Sign up failed');
        }

        const data = await response.json();
        const newUser: User = {
          id: data.id,
          email: data.email,
          role: data.teacher ? 'teacher' : 'learner',
          teacherData: data.teacher ? {
            id: data.id,
            email: data.email,
            name: extraData?.name || data.email.split('@')[0],
            teacherCode: data.teacher_code,
            schoolName: data.school_name,
            principalEmail: data.principal_email,
            principalName: data.principal_name,
            createdAt: new Date().toISOString(),
          } : undefined,
          studentData: !data.teacher ? {
            id: data.id,
            name: extraData?.name || data.email.split('@')[0],
            roleNumber: '',
            teacherId: '',
            practiceStreak: 0,
            totalPracticeDays: 0,
            totalPracticeSessions: 0,
            createdAt: new Date().toISOString(),
          } : undefined,
          createdAt: new Date().toISOString(),
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
        setState({
          user: newUser,
          isLoading: false,
          isAuthenticated: true,
        });
      } else {
        // Student signup
        const response = await fetch(`${BASE_API_URL}/student-register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: extraData?.name || '',
            roleNumber: extraData?.roleNumber || '',
            teacherCode: extraData?.teacherCode || '',
          }),
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.msg || 'Student registration failed');
        }

        const data = await response.json();
        const newUser: User = {
          id: data.id,
          email: '',
          role: 'student',
          studentData: {
            id: data.id,
            name: data.name,
            roleNumber: data.role_number,
            teacherId: data.teacher_code,
            practiceStreak: 0,
            totalPracticeDays: 0,
            totalPracticeSessions: 0,
            createdAt: new Date().toISOString(),
          },
          createdAt: new Date().toISOString(),
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
        setState({
          user: newUser,
          isLoading: false,
          isAuthenticated: true,
        });
      }
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string, teacher: boolean = false) => {
    try {
      const response = await fetch(`${BASE_API_URL}/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, teacher }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.msg || 'Sign in failed');
      }

      const data = await response.json();

      let practiceStreak = 0;
      let totalPracticeDays = 0;
      let totalPracticeSessions = 0;

      if (!data.teacher) {
        try {
          const analyticsRes = await fetch(`${BASE_API_URL}/analytics?userId=${data.id}`);
          if (analyticsRes.ok) {
            const analyticsData = await analyticsRes.json();
            practiceStreak = analyticsData.streak || 0;
            totalPracticeDays = analyticsData.total_practice_days || 0;
            totalPracticeSessions = analyticsData.total_sessions || 0;
          }
        } catch (analyticsErr) {
          console.error('Failed to load learner analytics in login', analyticsErr);
        }
      }

      const newUser: User = {
        id: data.id,
        email: data.email,
        role: data.teacher ? 'teacher' : 'learner',
        teacherData: data.teacher ? {
          id: data.id,
          email: data.email,
          name: data.email.split('@')[0],
          teacherCode: data.teacher_code,
          schoolName: data.school_name,
          principalEmail: data.principal_email,
          principalName: data.principal_name,
          createdAt: new Date().toISOString(),
        } : undefined,
        studentData: !data.teacher ? {
          id: data.id,
          name: data.email.split('@')[0],
          roleNumber: '',
          teacherId: '',
          practiceStreak,
          totalPracticeDays,
          totalPracticeSessions,
          createdAt: new Date().toISOString(),
        } : undefined,
        createdAt: new Date().toISOString(),
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
      setState({
        user: newUser,
        isLoading: false,
        isAuthenticated: true,
      });
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const studentSignIn = async (rollNumber: string, teacherCode: string) => {
    try {
      const response = await fetch(`${BASE_API_URL}/find-student?rollNumber=${encodeURIComponent(rollNumber)}&teacherCode=${encodeURIComponent(teacherCode)}`, {
        method: 'GET',
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.msg || 'Student lookup failed');
      }

      const data = await response.json();

      let practiceStreak = 0;
      let totalPracticeDays = 0;
      let totalPracticeSessions = 0;
      try {
        const analyticsRes = await fetch(`${BASE_API_URL}/analytics?studentId=${data.id}`);
        if (analyticsRes.ok) {
          const analyticsData = await analyticsRes.json();
          practiceStreak = analyticsData.streak || 0;
          totalPracticeDays = analyticsData.total_practice_days || 0;
          totalPracticeSessions = analyticsData.total_sessions || 0;
        }
      } catch (analyticsErr) {
        console.error('Failed to load student analytics in login', analyticsErr);
      }

      const newUser: User = {
        id: data.id,
        email: '',
        role: 'student',
        studentData: {
          id: data.id,
          name: data.name,
          roleNumber: data.role_number,
          teacherId: data.teacher_code,
          practiceStreak,
          totalPracticeDays,
          totalPracticeSessions,
          createdAt: new Date().toISOString(),
        },
        createdAt: new Date().toISOString(),
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
      setState({
        user: newUser,
        isLoading: false,
        isAuthenticated: true,
      });
    } catch (error) {
      console.error('Student sign in error:', error);
      throw error;
    }
  };

  const signOut = () => {
    localStorage.removeItem(STORAGE_KEY);
    setState({
      user: null,
      isLoading: false,
      isAuthenticated: false,
    });
  };

  return (
    <AuthContext.Provider value={{ ...state, signUp, signIn, studentSignIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
