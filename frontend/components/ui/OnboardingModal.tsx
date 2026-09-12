'use client';

import { useState, useEffect, useRef } from 'react';
import { X, BookOpen, CheckCircle, HelpCircle, AlertCircle } from 'lucide-react';

interface OnboardingModalProps {
  role: 'teacher' | 'student';
  isOpen: boolean;
  onClose: () => void;
}

// Local platform guide video (rendered walkthrough), served from /public.
const GUIDE_VIDEO_SRC = '/phonicsflow-intro.mp4';
const GUIDE_VIDEO_POSTER = '/phonicsflow-intro-poster.jpg';

export function OnboardingModal({ role, isOpen, onClose }: OnboardingModalProps) {
  const [mounted, setMounted] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    setMounted(true);
    return () => {
      if (videoRef.current) videoRef.current.pause();
    };
  }, []);

  // Auto-play the guide when the modal opens (muted so browsers allow autoplay).
  useEffect(() => {
    if (isOpen && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    } else if (!isOpen && videoRef.current) {
      videoRef.current.pause();
    }
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const handleComplete = () => {
    if (videoRef.current) videoRef.current.pause();
    localStorage.setItem(`phonics_bridge_onboarded_${role}`, 'true');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark backdrop blur */}
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(8px)',
        }}
        onClick={handleComplete} // Let them close by backdrop or forced finish
      />

      {/* Modal Card */}
      <div
        className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl transition-all duration-300 transform scale-100 flex flex-col max-h-[90vh]"
        style={{
          border: '1px solid #e2e8f0',
          animation: 'fade-in-up 0.3s ease-out'
        }}
      >
        {/* Header bar */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 bg-teal-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-gray-800" style={{ fontFamily: 'Outfit, sans-serif' }}>
                {role === 'teacher' ? 'Welcome to Phonics Bridge' : 'Welcome to Phonics Practice'}
              </h2>
              <p className="text-[10px] text-gray-500 font-medium">
                How to use the platform
              </p>
            </div>
          </div>

          <button
            onClick={handleComplete}
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal content body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Welcome Alert */}
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-100 flex gap-2.5 items-start">
            <AlertCircle className="w-4.5 h-4.5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-amber-900" style={{ fontFamily: 'Inter, sans-serif' }}>
                {role === 'teacher'
                  ? 'Welcome, Teacher! Here\'s how Phonics Bridge works.'
                  : 'Welcome! Here\'s a quick guide to using Phonics Practice.'}
              </p>
              <p className="text-[11px] text-amber-800/80 leading-relaxed mt-0.5">
                {role === 'teacher'
                  ? 'Watch this short walkthrough to see how students read aloud, get instant feedback, and how you can track your whole class.'
                  : 'Watch this short walkthrough to see how to read sentences aloud, record, and check your progress — in four simple steps.'}
              </p>
            </div>
          </div>

          {/* Platform guide video */}
          <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-inner">
            <video
              ref={videoRef}
              src={GUIDE_VIDEO_SRC}
              poster={GUIDE_VIDEO_POSTER}
              controls
              autoPlay
              muted
              playsInline
              className="w-full h-full object-contain bg-slate-900"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-100 px-6 py-4 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-gray-500 text-xs">
            <HelpCircle className="w-3.5 h-3.5 text-teal-600" />
            <span>You can watch this guide again from the ⓘ button anytime.</span>
          </div>

          <button
            onClick={handleComplete}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-bold text-white transition-all duration-150 hover:scale-105 shadow bg-teal-600 hover:bg-teal-700"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            Complete & Enter Platform
          </button>
        </div>
      </div>
    </div>
  );
}
