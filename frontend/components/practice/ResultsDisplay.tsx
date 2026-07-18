'use client';

import { useState } from 'react';
import { WordResult } from '@/lib/types';
import { CheckCircle2, XCircle } from 'lucide-react';
import { PhonemeAnimation } from './PhonemeAnimation';

interface ResultsDisplayProps {
  results: WordResult[];
  accuracy: number;
}

export function ResultsDisplay({ results, accuracy }: ResultsDisplayProps) {
  const [activeAnimationIndex, setActiveAnimationIndex] = useState<number | null>(null);

  const getAccuracyTheme = (acc: number) => {
    if (acc >= 80) return { stroke: '#059669', text: '#059669', bg: 'rgba(5,150,105,0.08)', label: 'Excellent work! 🎉', sublabel: 'Your phonics is on point!' };
    if (acc >= 60) return { stroke: '#fbbf24', text: '#d97706', bg: 'rgba(251,191,36,0.08)', label: 'Good effort! 💪', sublabel: 'Keep practicing to reach 80%+' };
    return { stroke: '#fb7185', text: '#e11d48', bg: 'rgba(251,113,133,0.08)', label: 'Keep going! 📚', sublabel: "Every session makes you better" };
  };

  const theme = getAccuracyTheme(accuracy);
  const circumference = 2 * Math.PI * 44;
  const strokeDashoffset = circumference - (accuracy / 100) * circumference;

  return (
    <div className="space-y-5 animate-fade-in-up">

      {/* ── Score Card ── */}
      <div
        className="glass-card p-8 flex flex-col items-center gap-4"
        style={{ background: `rgba(255,255,255,0.92)` }}
      >
        <h2
          className="text-xl font-bold"
          style={{ fontFamily: 'Outfit, sans-serif', color: '#1f2937' }}
        >
          Your Score
        </h2>

        {/* SVG ring */}
        <div className="relative w-36 h-36">
          {/* Background circle */}
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="44" fill="none" stroke="#ece7df" strokeWidth="6" />
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke={theme.stroke}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="score-ring"
            />
          </svg>
          {/* Score text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className="text-3xl font-extrabold leading-none"
              style={{ fontFamily: 'Outfit, sans-serif', color: theme.text }}
            >
              {accuracy}%
            </span>
          </div>
        </div>

        {/* Feedback */}
        <div className="text-center">
          <p
            className="text-lg font-bold"
            style={{ fontFamily: 'Outfit, sans-serif', color: '#1f2937' }}
          >
            {theme.label}
          </p>
          <p className="text-sm mt-1" style={{ color: '#6b7280' }}>
            {theme.sublabel}
          </p>
        </div>

        {/* Mini progress bar */}
        <div
          className="w-full max-w-xs h-2 rounded-full overflow-hidden"
          style={{ background: '#ece7df' }}
        >
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${accuracy}%`,
              background: `linear-gradient(90deg, ${theme.stroke}, ${theme.stroke}99)`,
              transitionDelay: '0.5s',
            }}
          />
        </div>
      </div>

      {/* ── Word-by-word results ── */}
      <div className="glass-card p-6">
        <h3
          className="text-lg font-bold mb-4"
          style={{ fontFamily: 'Outfit, sans-serif', color: '#1f2937' }}
        >
          Word Results
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {results.map((result, index) => {
            const isExpanded = activeAnimationIndex === index;
            return (
              <div
                key={index}
                className={`flex items-start gap-3 p-4 rounded-2xl transition-all duration-200 hover:scale-[1.015] ${
                  isExpanded ? 'sm:col-span-2' : ''
                }`}
                style={
                  result.correct
                    ? {
                        background: 'rgba(240,253,244,0.8)',
                        border: '1px solid #bbf7d0',
                      }
                    : {
                        background: 'rgba(255,241,242,0.8)',
                        border: '1px solid #fecdd3',
                      }
                }
              >
                <div className="mt-0.5 flex-shrink-0">
                  {result.correct ? (
                    <CheckCircle2 className="w-5 h-5" style={{ color: '#059669' }} />
                  ) : (
                    <XCircle className="w-5 h-5" style={{ color: '#fb7185' }} />
                  )}
                </div>
                <div className="flex-1 min-w-0 w-full">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <p
                      className="font-bold text-sm"
                      style={{ color: result.correct ? '#166534' : '#be123c', fontFamily: 'Inter, sans-serif' }}
                    >
                      {result.word}
                    </p>
                    
                    {!result.correct && (
                      <button
                        onClick={() => setActiveAnimationIndex(isExpanded ? null : index)}
                        className="text-xs font-semibold px-2.5 py-1 rounded-full transition-all duration-150 hover:scale-105"
                        style={{
                          backgroundColor: isExpanded ? '#0d9488' : 'rgba(13,148,136,0.08)',
                          color: isExpanded ? '#ffffff' : '#0d9488',
                        }}
                      >
                        {isExpanded ? 'Hide Mouth Guide' : 'Show Mouth Guide'}
                      </button>
                    )}
                  </div>
                  {!result.correct && result.said && (
                    <p className="text-xs mt-0.5" style={{ color: '#e11d48' }}>
                      You said: &ldquo;{result.said}&rdquo;
                    </p>
                  )}
                  <p className="text-xs mt-0.5" style={{ color: '#6b7280' }}>
                    Focus: /{result.phonemeFocus}/
                  </p>
                  {!result.correct && result.explanation && (
                    <p className="text-xs mt-1 italic" style={{ color: '#9b1c1c', opacity: 0.8 }}>
                      {result.explanation}
                    </p>
                  )}
                  
                  {!result.correct && isExpanded && (
                    <div className="mt-4 pt-3 border-t border-rose-200/40 w-full">
                      <PhonemeAnimation 
                        word={result.word} 
                        phonemeFocus={result.phonemeFocus} 
                        hindiBreakdown={result.hindiBreakdown} 
                        soundsLike={result.soundsLike} 
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

