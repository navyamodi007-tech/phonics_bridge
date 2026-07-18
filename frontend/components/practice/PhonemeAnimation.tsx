'use client';

import { useState, useEffect } from 'react';
import { Volume2, Info, Sparkles, BookOpen, Square } from 'lucide-react';

interface PhonemeAnimationProps {
  word: string;
  phonemeFocus?: string;
  hindiBreakdown?: string;
  soundsLike?: string;
}

// Pre-defined database of practice words and their Hindi phonetic breakdowns
const HINDI_BREAKDOWNS_MAP: Record<string, string> = {
  very: 'वे-री',
  wet: 'वेट',
  weather: 'वे-दर',
  water: 'वॉ-टर',
  with: 'विथ',
  bread: 'ब्रेड',
  rest: 'रेस्ट',
  thought: 'थॉट',
  worth: 'वर्थ',
  reading: 'री-डिंग',
  requires: 'रि-क्वायर्स',
  really: 'री-ली',
  try: 'ट्राय',
  challenges: 'चा-लें-जेज़'
};

// Sounds-like phonetic guides mapped to common words (Google Search Pronunciation style)
const SOUNDS_LIKE_MAP: Record<string, string> = {
  very: 'veh · ree',
  wet: 'wet',
  weather: 'weh · dher',
  water: 'wah · ter',
  with: 'widh',
  bread: 'bred',
  rest: 'rest',
  thought: 'thawt',
  worth: 'werth',
  reading: 'ree · ding',
  requires: 'ri · kwy · erz',
  really: 'ree · lee',
  try: 'try',
  challenges: 'chal · uhn · juhz'
};

export function PhonemeAnimation({ word, phonemeFocus, hindiBreakdown, soundsLike }: PhonemeAnimationProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedPhoneme, setSelectedPhoneme] = useState<string>('');
  const [isSlow, setIsSlow] = useState(false);

  // Determine Hindi phonetic breakdown
  const cleanWord = word.toLowerCase().trim().replace(/[^a-z]/g, '');
  const activeHindiBreakdown = hindiBreakdown || HINDI_BREAKDOWNS_MAP[cleanWord] || '';

  // Split word into simple character phonemes for interactive clicking
  const syllables = cleanWord.length > 0 
    ? (cleanWord.match(/.{1,2}/g) || [cleanWord]) 
    : [cleanWord];

  // Auto-select first phonic part or phonemeFocus when word or focus changes
  useEffect(() => {
    if (phonemeFocus && syllables.includes(phonemeFocus)) {
      setSelectedPhoneme(phonemeFocus);
    } else if (syllables.length > 0) {
      setSelectedPhoneme(syllables[0]);
    }
  }, [phonemeFocus, cleanWord]);

  // Speak word via backend /tts proxy → exact Google Translate en-IN audio
  const speakWord = () => {
    const url = `${process.env.NEXT_PUBLIC_BASE_API_URL || 'http://localhost:4000'}/tts?word=${encodeURIComponent(word)}&slow=${isSlow}`;
    const audio = new Audio(url);
    setIsSpeaking(true);
    audio.onended = () => setIsSpeaking(false);
    audio.onerror = () => setIsSpeaking(false);
    audio.play().catch(() => setIsSpeaking(false));
  };

  const activeSoundsLike = soundsLike || SOUNDS_LIKE_MAP[cleanWord] || cleanWord.match(/.{1,2}/g)?.join(' · ') || cleanWord;

  return (
    <div
      className="p-5 rounded-2xl border flex flex-col gap-4 animate-fade-in"
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.98), rgba(243,244,246,0.95))',
        borderColor: '#e2e8f0',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04)',
      }}
    >
      {/* ── Title / Action Bar ── */}
      <div className="flex items-center justify-between border-b pb-3 border-gray-100 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-teal-600" />
          <span className="font-extrabold text-sm text-gray-800 tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Pronunciation Guide: <span className="text-teal-700 capitalize">"{word}"</span>
          </span>
        </div>

        {phonemeFocus && (
          <span
            className="text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold"
            style={{ backgroundColor: 'rgba(244,63,94,0.1)', color: '#e11d48' }}
          >
            Target Sound: /{phonemeFocus}/
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
        {/* ── Left Side: Phonics Details & Hindi Breakdown ── */}
        <div className="flex flex-col gap-3 justify-center">
          
          {/* Hindi Phonetic Helper Card */}
          <div 
            className="p-4 rounded-xl border flex flex-col gap-1.5"
            style={{
              background: 'linear-gradient(135deg, rgba(254,243,199,0.4), rgba(255,255,255,0.8))',
              borderColor: '#fde68a'
            }}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <p className="text-xs font-bold text-amber-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
                हिन्दी उच्चारण (Hindi Breakdown)
              </p>
            </div>
            
            {activeHindiBreakdown ? (
              <div className="flex items-baseline gap-2 flex-wrap mt-0.5">
                <span className="text-2xl font-extrabold text-amber-800 tracking-wide font-hindi">
                  {activeHindiBreakdown}
                </span>
                <span className="text-xs text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>
                  (Syllables separated by hyphens)
                </span>
              </div>
            ) : (
              <p className="text-xs text-gray-500 italic mt-0.5">
                No Hindi translation available. Focus on English phonetic sounds.
              </p>
            )}
          </div>

          {/* Interactive Syllable Selector */}
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Tap sound parts to focus:
            </p>
            <div className="flex items-center gap-1.5 flex-wrap">
              {syllables.map((syl, i) => {
                const isActive = selectedPhoneme === syl || (!selectedPhoneme && i === 0);
                return (
                  <button
                    key={i}
                    onClick={() => setSelectedPhoneme(syl)}
                    className={`px-3.5 py-2 rounded-xl border text-sm font-extrabold transition-all duration-200 hover:scale-105 ${
                      isActive
                        ? 'border-teal-500 bg-teal-50 text-teal-700 shadow-sm'
                        : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                  >
                    /{syl}/
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Right Side: Google Translate-style Pronunciation Card ── */}
        <div 
          className="rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 shadow-md text-white md:col-span-1"
          style={{
            background: '#202124',
            border: '1px solid #3c4043',
            boxShadow: '0 8px 30px rgba(0,0,0,0.15)'
          }}
        >
          <div className="flex flex-col h-full justify-between gap-4">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-800 pb-2.5">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Pronunciation
              </span>
              <span className="text-[10px] text-gray-400 font-medium tracking-tight">
                Indian English pronunciation
              </span>
            </div>

            {/* Layout Box */}
            <div className="flex items-center justify-between gap-4 flex-1">
              {/* Left Column: Text & Audio Toggle */}
              <div className="flex-1 flex flex-col justify-center">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">
                  Sounds like
                </span>
                
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-extrabold text-white tracking-wide" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    {activeSoundsLike}
                  </span>
                  <button
                    onClick={speakWord}
                    className={`p-2.5 rounded-full transition-all duration-150 flex items-center justify-center hover:scale-110 ${
                      isSpeaking 
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50' 
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white border border-gray-700'
                    }`}
                    title="Listen to pronunciation"
                  >
                    {isSpeaking ? (
                      <div className="relative flex items-center justify-center">
                        <Square className="w-5 h-5 fill-current z-10" />
                        <div className="absolute inset-0 bg-blue-400/30 rounded-full animate-ping scale-150"></div>
                      </div>
                    ) : (
                      <Volume2 className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {/* Slow Mode Switch Toggle */}
                <div className="flex items-center gap-2 mt-5">
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={isSlow}
                      onChange={(e) => setIsSlow(e.target.checked)}
                      className="sr-only peer" 
                    />
                    <div className="w-8 h-4 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-500"></div>
                    <span className="ml-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      Slow
                    </span>
                  </label>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Tip ── */}
      <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex gap-2 items-start">
        <Info className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
        <p className="text-[11px] text-gray-500 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
          <strong>Phonics Tip:</strong> Hindi breakdowns show how to read the whole word in your native script. Toggle the "Slow" mode and play the speaker to practice producing the correct mouth posture for the focus sound.
        </p>
      </div>
    </div>
  );
}
