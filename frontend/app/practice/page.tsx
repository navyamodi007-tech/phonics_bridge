      // Azure's composite pronunciation score (folds in fluency + completeness),
      // matching what the adaptive-difficulty logic grades progression on.
      accuracy: Math.round(apiData.scores?.pronunciation ?? apiData.scores?.accuracy ?? 0),'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ParagraphDisplay } from '@/components/practice/ParagraphDisplay';
import { RecordButton } from '@/components/practice/RecordButton';
import { ResultsDisplay } from '@/components/practice/ResultsDisplay';
import { practiceParagraphs } from '@/lib/mock-data';
import { useAuth } from '@/lib/auth-context';
import { BASE_API_URL } from '@/lib/config';
import { PracticeParagraph } from '@/lib/types';
import Link from 'next/link';
import { ArrowRight, BookOpen, Home } from 'lucide-react';

export default function PracticePage() {
  const { user, isLoading: authLoading } = useAuth();
  const [currentParagraphIndex, setCurrentParagraphIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [sessionResult, setSessionResult] = useState<any>(null);
  const [paragraphs, setParagraphs] = useState<PracticeParagraph[]>([]);
  const [isGenerating, setIsGenerating] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    let active = true;
    const fetchSentences = async () => {
      try {
        const res = await fetch(`${BASE_API_URL}/generate-sentence`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            choice: '',
            userId: user?.role === 'teacher' || user?.role === 'learner' ? user.id : undefined,
            studentId: user?.role === 'student' ? user.id : undefined,
          }),
        });

        if (!res.ok) throw new Error('Failed to generate sentences');

        const text = await res.text();
        const data = JSON.parse(text);
        
        if (active) {
          const formatted: PracticeParagraph[] = [
            {
              id: 'gen-1',
              text: data.text1 || '',
              targetWords: data.focus_words_1 || [],
            },
            {
              id: 'gen-2',
              text: data.text2 || '',
              targetWords: data.focus_words_2 || [],
            },
            {
              id: 'gen-3',
              text: data.text3 || '',
              targetWords: data.focus_words_3 || [],
            },
          ];
          setParagraphs(formatted);
          setIsGenerating(false);
        }
      } catch (err) {
        console.error('Error generating sentences:', err);
        if (active) {
          setParagraphs(practiceParagraphs);
          setIsGenerating(false);
        }
      }
    };

    fetchSentences();
    return () => {
      active = false;
    };
  }, [user, authLoading]);

  const currentParagraph = paragraphs[currentParagraphIndex] || practiceParagraphs[0];
  const nextParagraphExists = paragraphs.length > 0 && currentParagraphIndex < paragraphs.length - 1;
  const progress = paragraphs.length > 0 ? ((currentParagraphIndex + 1) / paragraphs.length) * 100 : 0;

  const handleRecordComplete = (apiData: any) => {
    let parsedData = { error_words: [], error_types: [], analysis: '' };
    try {
      parsedData = JSON.parse(apiData.data || '{}');
    } catch (e) {
      console.warn("Could not parse Llama response", e);
      parsedData.analysis = apiData.data || '';
    }

    const errorWords = parsedData.error_words || [];
    const analysisFeedback = parsedData.analysis || '';

    const results = currentParagraph.targetWords.map((targetWord) => {
      const targetClean = targetWord.word.toLowerCase().replace(/[^a-z]/g, '');

      const spokenWord = apiData.words?.find(
        (w: any) => w.word.toLowerCase().replace(/[^a-z]/g, '') === targetClean
      );

      const matchesError = errorWords.some(
        (ew: string) => ew.toLowerCase().replace(/[^a-z]/g, '') === targetClean
      );

      const isCorrect = spokenWord
        ? (!matchesError && spokenWord.accuracyScore >= 80 && (spokenWord.errorType === 'None' || !spokenWord.errorType))
        : false;

      return {
        word: targetWord.word,
        correct: isCorrect,
        said: spokenWord?.word || '???',
        phonemeFocus: targetWord.phoneme,
        explanation: isCorrect ? '' : analysisFeedback,
        hindiBreakdown: targetWord.hindi || '',
        soundsLike: targetWord.soundsLike || targetWord.sounds_like || '',
      };
    });

    setSessionResult({
      // Azure's composite pronunciation score (folds in fluency + completeness),
      // matching what the adaptive-difficulty logic grades progression on.
      accuracy: Math.round(apiData.scores?.pronunciation ?? apiData.scores?.accuracy ?? 0),
      results,
    });
    setShowResults(true);
  };

  const handleNextParagraph = () => {
    if (nextParagraphExists) {
      setCurrentParagraphIndex((prev) => prev + 1);
      setShowResults(false);
      setSessionResult(null);
    }
  };

  if (isGenerating) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 p-4 md:p-8 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="relative w-24 h-24">
          <div
            className="absolute inset-0 rounded-full"
            style={{ background: 'rgba(13,148,136,0.06)' }}
          />
          <div
            className="absolute inset-2 rounded-full border-4 border-t-transparent"
            style={{
              borderColor: 'rgba(13,148,136,0.15)',
              borderTopColor: '#0d9488',
              animation: 'spin 0.9s linear infinite',
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <BookOpen className="w-7 h-7" style={{ color: '#0d9488', opacity: 0.6 }} />
          </div>
        </div>
        <div className="text-center space-y-2">
          <h2
            className="text-xl font-bold"
            style={{ fontFamily: 'Outfit, sans-serif', color: '#1f2937' }}
          >
            Generating your Phonics Session...
          </h2>
          <p className="text-sm max-w-xs mx-auto" style={{ color: '#6b7280' }}>
            We're analyzing your weak sounds to create customized practice sentences.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 p-4 md:p-8">

      {/* ── Header ── */}
      <div className="animate-fade-in-up">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-md"
              style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }}
            >
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1
                className="text-2xl font-extrabold leading-tight"
                style={{ fontFamily: 'Outfit, sans-serif', color: '#1f2937', letterSpacing: '-0.02em' }}
              >
                Practice Session
              </h1>
              <p className="text-xs" style={{ color: '#6b7280' }}>
                Paragraph {currentParagraphIndex + 1} of {paragraphs.length}
              </p>
            </div>
          </div>

          {/* Progress badge */}
          <div
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold"
            style={{ background: 'rgba(13,148,136,0.1)', color: '#0d9488', fontFamily: 'Inter, sans-serif' }}
          >
            {Math.round(progress)}% done
          </div>
        </div>

        {/* Progress bar */}
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* ── Paragraph display ── */}
      <ParagraphDisplay paragraph={currentParagraph} />

      {/* ── Recording or Results ── */}
      {!showResults ? (
        <div
          className="glass-card p-8 animate-fade-in-up delay-100"
          style={{ textAlign: 'center' }}
        >
          <p
            className="text-sm font-semibold mb-1"
            style={{ color: '#0d9488', fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '11px' }}
          >
            Phonics Check
          </p>
          <p
            className="text-xl font-bold mb-6"
            style={{ fontFamily: 'Outfit, sans-serif', color: '#1f2937' }}
          >
            Read the paragraph aloud
          </p>
          <RecordButton referenceText={currentParagraph.text} onComplete={handleRecordComplete} />
        </div>
      ) : (
        <div className="space-y-5">
          <ResultsDisplay
            results={sessionResult ? sessionResult.results : []}
            accuracy={sessionResult ? sessionResult.accuracy : 0}
          />

          {nextParagraphExists ? (
            <Button
              id="next-paragraph-btn"
              onClick={handleNextParagraph}
              size="lg"
              className="w-full py-6 text-base"
            >
              Next Paragraph
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          ) : (
            <div className="space-y-4 animate-fade-in-up">
              <div
                className="glass-card p-10 text-center"
                style={{ background: 'linear-gradient(135deg, rgba(240,253,250,0.9), rgba(255,250,244,0.9))' }}
              >
                <div
                  className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl"
                  style={{ background: 'linear-gradient(135deg, #f0fdfa, #ccfbf1)' }}
                >
                  🎉
                </div>
                <p
                  className="text-2xl font-extrabold mb-2"
                  style={{ fontFamily: 'Outfit, sans-serif', color: '#0f766e' }}
                >
                  Session Complete!
                </p>
                <p style={{ color: '#6b7280', fontFamily: 'Inter, sans-serif' }}>
                  You&apos;ve finished all paragraphs in this session.
                </p>
              </div>
              <Link href="/" className="block">
                <Button id="back-to-dashboard-btn" size="lg" variant="outline" className="w-full py-6 text-base">
                  <Home className="mr-2 h-5 w-5" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
