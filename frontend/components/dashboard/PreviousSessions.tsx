'use client';

import { useState } from 'react';
import { Calendar, ChevronDown, ChevronUp, Trophy, AlertTriangle, Sparkles, Smile } from 'lucide-react';
import { PhonemeAnimation } from '../practice/PhonemeAnimation';

interface Phoneme {
  phoneme: string;
  accuracyScore: number;
}

interface WordDetail {
  word: string;
  accuracyScore: number;
  errorType: string;
  phonemes?: Phoneme[];
}

interface Session {
  id: string;
  accuracy: number | null;
  fluency: number | null;
  completeness: number | null;
  pronunciation: number | null;
  error: string | null; // JSON array of error types
  words: string | null; // JSON array of WordDetail
  analysis: string | null;
  time_created: string;
}

const cleanAnalysisText = (analysis: string | null): string => {
  if (!analysis) return "Excellent job! No specific pronunciation errors were detected. Keep practicing and building your reading skills!";
  
  // Try to remove markdown json codeblock wrappers if they exist
  let cleanStr = analysis.trim();
  if (cleanStr.startsWith("```")) {
    // Remove opening ```json or ```
    cleanStr = cleanStr.replace(/^```(?:json)?\s*/i, "");
    // Remove closing ```
    cleanStr = cleanStr.replace(/\s*```$/, "");
    cleanStr = cleanStr.trim();
  }

  try {
    const parsed = JSON.parse(cleanStr);
    if (parsed && typeof parsed === 'object') {
      let text = "";
      if (typeof parsed.analysis === 'string') text = parsed.analysis.trim();
      else if (typeof parsed.feedback === 'string') text = parsed.feedback.trim();
      else if (typeof parsed.explanation === 'string') text = parsed.explanation.trim();
      
      if (!text) {
        return "Excellent job! No specific pronunciation errors were detected. Keep practicing and building your reading skills!";
      }
      return text;
    }
  } catch (e) {
    // Not valid JSON, return the cleaned string
  }

  if (!cleanStr) {
    return "Excellent job! No specific pronunciation errors were detected. Keep practicing and building your reading skills!";
  }
  return cleanStr;
};

interface PreviousSessionsProps {
  sessions: Session[];
  isLoading: boolean;
  title?: string;
}

export function PreviousSessions({ sessions, isLoading, title = "Previous Practice Sessions" }: PreviousSessionsProps) {
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);
  const [sessionAnimWords, setSessionAnimWords] = useState<Record<string, string>>({});

  const toggleExpand = (id: string) => {
    setExpandedSessionId(expandedSessionId === id ? null : id);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="glass-card p-8 flex flex-col items-center justify-center gap-3">
        <div className="spinner animate-spin" />
        <p className="text-sm font-medium" style={{ color: '#6b7280' }}>Loading session history...</p>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="glass-card p-12 text-center" style={{ background: 'rgba(255,250,244,0.6)' }}>
        <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl" style={{ background: 'linear-gradient(135deg, #f0fdfa, #ccfbf1)' }}>
          🎙️
        </div>
        <h3 className="text-lg font-bold mb-1" style={{ fontFamily: 'Outfit, sans-serif', color: '#1f2937' }}>No practice sessions yet</h3>
        <p className="text-sm text-[var(--foreground-secondary)] max-w-sm mx-auto">
          Start recording practice paragraphs to see your speaking history and detailed AI analysis here!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold font-['Outfit'] text-[var(--foreground)] flex items-center gap-2">
        <span>{title}</span>
        <span className="text-sm font-semibold px-2.5 py-0.5 rounded-full" style={{ background: 'rgba(13,148,136,0.1)', color: '#0d9488' }}>
          {sessions.length}
        </span>
      </h2>

      <div className="space-y-3.5">
        {sessions.map((session, idx) => {
          const isExpanded = expandedSessionId === session.id;
          let parsedWords: WordDetail[] = [];
          try {
            if (session.words) {
              parsedWords = JSON.parse(session.words);
            }
          } catch (e) {
            console.error('Failed to parse session words', e);
          }

          let parsedErrors: string[] = [];
          try {
            if (session.error) {
              parsedErrors = JSON.parse(session.error);
            }
          } catch (e) {
            console.error('Failed to parse session errors', e);
          }

          const overallScore = Math.round(session.pronunciation ?? session.accuracy ?? 0);

          return (
            <div
              key={session.id}
              className="glass-card overflow-hidden transition-all duration-200"
              style={{
                borderColor: isExpanded ? 'rgba(13,148,136,0.3)' : '#ece7df',
                boxShadow: isExpanded ? '0 10px 30px rgba(13,148,136,0.06)' : 'none',
              }}
            >
              {/* Header block clickable */}
              <div
                className="p-5 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 select-none"
                onClick={() => toggleExpand(session.id)}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-extrabold flex-shrink-0 text-white shadow-sm"
                    style={{
                      background: overallScore >= 80 
                        ? 'linear-gradient(135deg, #0d9488, #059669)' 
                        : overallScore >= 60 
                        ? 'linear-gradient(135deg, #fbbf24, #d97706)' 
                        : 'linear-gradient(135deg, #fb7185, #e11d48)'
                    }}
                  >
                    {overallScore}%
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold" style={{ fontFamily: 'Outfit, sans-serif', color: '#1f2937' }}>
                        Session #{sessions.length - idx}
                      </span>
                      <span
                        className="text-xs px-2.5 py-0.5 rounded-full font-medium"
                        style={{
                          background: overallScore >= 80 ? 'rgba(5,150,105,0.1)' : overallScore >= 60 ? 'rgba(217,119,6,0.1)' : 'rgba(225,29,72,0.1)',
                          color: overallScore >= 80 ? '#059669' : overallScore >= 60 ? '#d97706' : '#e11d48'
                        }}
                      >
                        {overallScore >= 80 ? 'Excellent' : overallScore >= 60 ? 'Developing' : 'Needs Practice'}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs mt-1" style={{ color: '#6b7280' }}>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(session.time_created)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Score breakdown metrics */}
                <div className="flex items-center gap-6 md:gap-8 ml-14 md:ml-0">
                  <div className="flex items-center gap-4 text-center">
                    <div>
                      <p className="text-[10px] uppercase font-semibold tracking-wider" style={{ color: '#6b7280' }}>Accuracy</p>
                      <p className="text-sm font-bold" style={{ color: '#1f2937' }}>{Math.round(session.accuracy ?? 0)}%</p>
                    </div>
                    <div className="w-px h-6" style={{ background: '#ece7df' }} />
                    <div>
                      <p className="text-[10px] uppercase font-semibold tracking-wider" style={{ color: '#6b7280' }}>Fluency</p>
                      <p className="text-sm font-bold" style={{ color: '#1f2937' }}>{Math.round(session.fluency ?? 0)}%</p>
                    </div>
                    <div className="w-px h-6" style={{ background: '#ece7df' }} />
                    <div>
                      <p className="text-[10px] uppercase font-semibold tracking-wider" style={{ color: '#6b7280' }}>Complete</p>
                      <p className="text-sm font-bold" style={{ color: '#1f2937' }}>{Math.round(session.completeness ?? 0)}%</p>
                    </div>
                  </div>

                  <div className="hover:text-[var(--primary)] p-1 rounded-lg" style={{ color: '#9ca3af' }}>
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>
              </div>

              {/* Collapsible details section */}
              {isExpanded && (
                <div
                  className="px-5 pb-6 pt-1 space-y-5 animate-fade-in"
                  style={{ borderTop: '1px solid #ece7df', background: 'rgba(253,248,240,0.3)' }}
                >
                  {/* Spoken Text Breakdown */}
                  {parsedWords.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5" style={{ color: '#6b7280' }}>
                        <Trophy className="w-3.5 h-3.5 text-teal-600" />
                        Phonics Breakdown
                      </h4>
                      <div className="flex flex-wrap gap-2 p-4 rounded-2xl bg-white border" style={{ borderColor: '#ece7df' }}>
                        {parsedWords.map((wordObj, wIdx) => {
                          const wAcc = wordObj.accuracyScore;
                          const hasErr = wordObj.errorType && wordObj.errorType !== 'None';
                          let badgeBg = 'rgba(5, 150, 105, 0.08)';
                          let badgeBorder = '1px solid rgba(5, 150, 105, 0.15)';
                          let badgeColor = '#059669';

                          if (hasErr) {
                            if (wordObj.errorType === 'Omission') {
                              badgeBg = 'rgba(107, 114, 128, 0.08)';
                              badgeBorder = '1px dashed rgba(107, 114, 128, 0.3)';
                              badgeColor = '#6b7280';
                            } else {
                              badgeBg = 'rgba(225, 29, 72, 0.08)';
                              badgeBorder = '1px solid rgba(225, 29, 72, 0.15)';
                              badgeColor = '#e11d48';
                            }
                          } else if (wAcc < 80) {
                            badgeBg = 'rgba(217, 119, 6, 0.08)';
                            badgeBorder = '1px solid rgba(217, 119, 6, 0.15)';
                            badgeColor = '#d97706';
                          }

                          return (
                            <div
                              key={wIdx}
                              className="px-3 py-1.5 rounded-xl text-sm font-semibold transition-all relative group"
                              style={{
                                background: badgeBg,
                                border: badgeBorder,
                                color: badgeColor,
                              }}
                            >
                              <span>{wordObj.word}</span>
                              {hasErr && (
                                <span className="ml-1 text-[10px] opacity-75 font-normal">
                                  ({wordObj.errorType})
                                </span>
                              )}
                              
                              {/* Hover details for phonemes */}
                              {wordObj.phonemes && wordObj.phonemes.length > 0 && (
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-20 w-48 bg-gray-900 text-white text-xs rounded-xl p-2.5 shadow-xl space-y-1">
                                  <p className="font-bold text-[10px] text-teal-400 uppercase tracking-wider text-center border-b border-gray-700 pb-1 mb-1">
                                    Phoneme Detail
                                  </p>
                                  {wordObj.phonemes.map((ph, pIdx) => (
                                    <div key={pIdx} className="flex justify-between font-mono">
                                      <span>/{ph.phoneme}/</span>
                                      <span className={ph.accuracyScore >= 80 ? 'text-emerald-400' : ph.accuracyScore >= 60 ? 'text-amber-400' : 'text-rose-400'}>
                                        {Math.round(ph.accuracyScore)}%
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}



                  {/* Error Sounds summary */}
                  {parsedErrors.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5" style={{ color: '#6b7280' }}>
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                        Troublesome Sounds Detected
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {parsedErrors.map((err, errIdx) => (
                          <span
                            key={errIdx}
                            className="text-xs font-bold px-3 py-1 rounded-lg"
                            style={{ background: '#ffe4e6', color: '#be123c', border: '1px solid #fecdd3' }}
                          >
                            {err}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* See this phonics correction in animation */}
                  {parsedWords.some(w => w.accuracyScore < 80 || (w.errorType && w.errorType !== 'None')) && (
                    <div className="space-y-2 pt-2 border-t border-dashed border-gray-200">
                      <h4 className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5" style={{ color: '#6b7280' }}>
                        <Smile className="w-3.5 h-3.5 text-teal-600" />
                        See correction in animation
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {parsedWords
                          .filter(w => w.accuracyScore < 80 || (w.errorType && w.errorType !== 'None'))
                          .map((wObj, wIdx) => {
                            const activeWord = sessionAnimWords[session.id];
                            const isActive = activeWord === wObj.word;
                            return (
                              <button
                                key={wIdx}
                                onClick={() => setSessionAnimWords({
                                  ...sessionAnimWords,
                                  [session.id]: isActive ? '' : wObj.word
                                })}
                                className="text-xs font-semibold px-3 py-1.5 rounded-full border transition-all duration-150 hover:scale-105 flex items-center gap-1.5"
                                style={{
                                  backgroundColor: isActive ? '#0d9488' : 'rgba(13,148,136,0.06)',
                                  borderColor: isActive ? '#0d9488' : 'rgba(13,148,136,0.15)',
                                  color: isActive ? '#ffffff' : '#0d9488',
                                }}
                              >
                                🎥 {wObj.word}
                              </button>
                            );
                          })}
                      </div>
                      {sessionAnimWords[session.id] && (
                        <div className="mt-3 p-3 bg-white rounded-2xl border border-gray-100 shadow-sm animate-fade-in">
                          <PhonemeAnimation word={sessionAnimWords[session.id]} />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
