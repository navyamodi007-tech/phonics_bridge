'use client';

import { useState, useEffect } from 'react';
import { X, Play, BookOpen, CheckCircle, HelpCircle, AlertCircle, Languages } from 'lucide-react';

interface OnboardingModalProps {
  role: 'teacher' | 'student';
  isOpen: boolean;
  onClose: () => void;
}

export function OnboardingModal({ role, isOpen, onClose }: OnboardingModalProps) {
  const [lang, setLang] = useState<'english' | 'hindi'>('english');
  const [videoPlay, setVideoPlay] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  // Video embeds (placeholders that can be played inside the iframe)
  const videos = {
    teacher: {
      english: 'https://www.youtube.com/embed/gT8wN1cGAy0?autoplay=1',
      hindi: 'https://www.youtube.com/embed/q6t8c-B3Uws?autoplay=1'
    },
    student: {
      english: 'https://www.youtube.com/embed/F7737S4GvEY?autoplay=1',
      hindi: 'https://www.youtube.com/embed/33vI51A4HGo?autoplay=1'
    }
  };

  const currentVideoUrl = videos[role][lang];

  const handleComplete = () => {
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
                {role === 'teacher' ? 'Teacher Onboarding Tutorial' : 'Student Phonics Tutorial'}
              </h2>
              <p className="text-[10px] text-gray-500 font-medium">
                Mandatory Platform Walkthrough
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
                  ? 'Welcome, Teacher! Let\'s get you set up.' 
                  : 'Welcome to your Phonics Practice! Let\'s learn how to use it.'}
              </p>
              <p className="text-[11px] text-amber-800/80 leading-relaxed mt-0.5">
                {role === 'teacher'
                  ? 'This mandatory training explains how students submit sound readings, how the AI tags phonetic difficulties, and how principal PDF reports are scheduled.'
                  : 'Watch this short guide to learn how to read sentences aloud and check your Hindi/English breakdowns.'}
              </p>
            </div>
          </div>

          {/* Language Toggle tabs */}
          <div className="flex items-center justify-between bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
            <div className="flex items-center gap-1.5 text-gray-500 pl-2">
              <Languages className="w-4 h-4" />
              <span className="text-xs font-bold">Tutorial Language:</span>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => { setLang('english'); setVideoPlay(false); }}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all duration-150 ${
                  lang === 'english' ? 'bg-teal-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                English
              </button>
              <button
                onClick={() => { setLang('hindi'); setVideoPlay(false); }}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all duration-150 ${
                  lang === 'hindi' ? 'bg-teal-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                हिन्दी (Hindi)
              </button>
            </div>
          </div>

          {/* Video Player card */}
          <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center group shadow-inner">
            {videoPlay ? (
              <iframe
                src={currentVideoUrl}
                title="Phonics Bridge Onboarding Video"
                className="w-full h-full border-none"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <>
                {/* Simulated Thumbnail background */}
                <div 
                  className="absolute inset-0 opacity-60 bg-cover bg-center transition-all duration-300 group-hover:scale-105"
                  style={{
                    backgroundImage: 'linear-gradient(to bottom, rgba(13,148,136,0.2) 0%, rgba(15,23,42,0.8) 100%)',
                  }}
                />
                
                {/* Play controls overlay */}
                <div className="relative z-10 text-center space-y-3 px-4">
                  <button
                    onClick={() => setVideoPlay(true)}
                    className="w-16 h-16 rounded-full bg-teal-500 hover:bg-teal-600 text-white flex items-center justify-center mx-auto shadow-lg hover:shadow-teal-500/20 hover:scale-110 transition-all duration-200"
                    aria-label="Play video tutorial"
                  >
                    <Play className="w-6 h-6 fill-white ml-1" />
                  </button>
                  <div>
                    <p className="text-white font-extrabold text-sm" style={{ fontFamily: 'Outfit, sans-serif' }}>
                      Play Tutorial Video ({lang === 'english' ? 'English' : 'हिन्दी'})
                    </p>
                    <p className="text-slate-300 text-xs mt-0.5">
                      Approx. 2 mins • Screencast Walkthrough
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-100 px-6 py-4 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-gray-500 text-xs">
            <HelpCircle className="w-3.5 h-3.5 text-teal-600" />
            <span>You can watch this tutorial again from the help button anytime.</span>
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
