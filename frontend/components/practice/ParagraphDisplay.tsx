'use client';

import { PracticeParagraph } from '@/lib/types';

interface ParagraphDisplayProps {
  paragraph: PracticeParagraph;
}

export function ParagraphDisplay({ paragraph }: ParagraphDisplayProps) {
  // Build the display with highlighted target words
  const renderText = () => {
    const text = paragraph.text;
    const targetWords = paragraph.targetWords;

    const hasIndices = targetWords.every(
      (tw) => typeof tw.startIndex === 'number' && typeof tw.endIndex === 'number'
    );

    if (hasIndices) {
      const parts: { text: string; isTarget: boolean; phoneme?: string }[] = [];
      let lastIndex = 0;

      // Sort targets by startIndex
      const sorted = [...targetWords].sort((a, b) => (a.startIndex || 0) - (b.startIndex || 0));

      sorted.forEach((tw) => {
        const start = tw.startIndex || 0;
        const end = tw.endIndex || 0;
        if (start > lastIndex) {
          parts.push({ text: text.slice(lastIndex, start), isTarget: false });
        }
        parts.push({ text: text.slice(start, end), isTarget: true, phoneme: tw.phoneme });
        lastIndex = end;
      });

      if (lastIndex < text.length) {
        parts.push({ text: text.slice(lastIndex), isTarget: false });
      }

      return parts.map((part, i) =>
        part.isTarget ? (
          <span
            key={i}
            className="relative inline-block cursor-help group"
            style={{
              color: '#0d9488',
              fontWeight: 700,
              borderBottom: '2.5px dotted #0d9488',
              padding: '0 0.18em 2px',
              margin: '0 0.06em',
            }}
            title={`Focus: ${part.phoneme}`}
          >
            {part.text}
            {/* Phoneme tooltip */}
            <span
              className="absolute -top-7 left-1/2 -translate-x-1/2 text-xs text-white px-2.5 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-150 whitespace-nowrap pointer-events-none z-10"
              style={{
                background: '#0d9488',
                boxShadow: '0 4px 12px rgba(13,148,136,0.3)',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600,
              }}
            >
              /{part.phoneme}/
            </span>
          </span>
        ) : (
          <span key={i}>{part.text}</span>
        )
      );
    } else {
      // String-matching tokenization logic
      const targetSet = new Map(
        targetWords.map((tw) => [tw.word.toLowerCase().replace(/[^a-z0-9]/g, ''), tw.phoneme])
      );

      // Split text on word boundaries capture group so they are returned as tokens
      const tokens = text.split(/(\b[a-zA-Z0-9']+\b)/);

      return tokens.map((token, i) => {
        const cleanToken = token.toLowerCase().replace(/[^a-z0-9]/g, '');
        const phoneme = targetSet.get(cleanToken);

        if (phoneme) {
          return (
            <span
              key={i}
              className="relative inline-block cursor-help group"
              style={{
                color: '#0d9488',
                fontWeight: 700,
                borderBottom: '2.5px dotted #0d9488',
                padding: '0 0.18em 2px',
                margin: '0 0.06em',
              }}
              title={`Focus: ${phoneme}`}
            >
              {token}
              {/* Phoneme tooltip */}
              <span
                className="absolute -top-7 left-1/2 -translate-x-1/2 text-xs text-white px-2.5 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-150 whitespace-nowrap pointer-events-none z-10"
                style={{
                  background: '#0d9488',
                  boxShadow: '0 4px 12px rgba(13,148,136,0.3)',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 600,
                }}
              >
                /{phoneme}/
              </span>
            </span>
          );
        }
        return <span key={i}>{token}</span>;
      });
    }
  };

  return (
    <div
      className="animate-fade-in-up relative overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        borderRadius: '0 24px 24px 24px',
        border: '1px solid rgba(255,255,255,0.6)',
        borderLeft: '4px solid #0d9488',
        boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
        padding: '2rem',
      }}
    >
      {/* Subtle notebook lines decoration */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, rgba(236,231,223,0.4) 31px, rgba(236,231,223,0.4) 32px)',
          borderRadius: '0 24px 24px 24px',
        }}
      />

      <p
        className="relative text-lg md:text-xl leading-loose"
        style={{
          color: '#1f2937',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 500,
          lineHeight: '2.4',
          wordSpacing: '0.14em',
        }}
      >
        {renderText()}
      </p>

      {/* Focus phonemes legend */}
      {paragraph.targetWords.length > 0 && (
        <div
          className="relative mt-4 pt-4 flex flex-wrap gap-1.5"
          style={{ borderTop: '1px dashed #ece7df' }}
        >
          <span
            className="text-xs"
            style={{ color: '#9ca3af', fontFamily: 'Inter, sans-serif' }}
          >
            Focus phonemes:
          </span>
          {[...new Set(paragraph.targetWords.map(w => w.phoneme))].map((ph, i) => (
            <span
              key={i}
              className="text-xs px-2 py-0.5 rounded-full font-mono font-semibold"
              style={{ background: 'rgba(13,148,136,0.1)', color: '#0d9488' }}
            >
              /{ph}/
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
