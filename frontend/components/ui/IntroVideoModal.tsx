'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Play, Film } from 'lucide-react';

interface IntroVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Local intro walkthrough video (rendered brag video), served from /public.
const INTRO_VIDEO_SRC = '/phonicsflow-intro.mp4';
const INTRO_VIDEO_POSTER = '/phonicsflow-intro-poster.jpg';

export function IntroVideoModal({ isOpen, onClose }: IntroVideoModalProps) {
  const [play, setPlay] = useState(false);
  const [mounted, setMounted] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset to the thumbnail each time the modal is opened; pause on close.
  useEffect(() => {
    if (isOpen) {
      setPlay(false);
    } else if (videoRef.current) {
      videoRef.current.pause();
    }
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const startPlayback = () => {
    setPlay(true);
    // Kick off playback once the <video> is shown.
    requestAnimationFrame(() => {
      videoRef.current?.play().catch(() => {});
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{ background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)' }}
        onClick={onClose}
      />

      {/* Modal card */}
      <div
        className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl flex flex-col"
        style={{ border: '1px solid #e2e8f0', animation: 'fade-in-up 0.3s ease-out' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 bg-teal-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-gray-800" style={{ fontFamily: 'Outfit, sans-serif' }}>
                How PhonicsFlow Works
              </h2>
              <p className="text-[10px] text-gray-500 font-medium">
                A quick 4-step tour
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close intro video"
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Video body */}
        <div className="p-6">
          <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center group shadow-inner">
            <video
              ref={videoRef}
              src={INTRO_VIDEO_SRC}
              poster={INTRO_VIDEO_POSTER}
              controls={play}
              playsInline
              onEnded={() => setPlay(false)}
              className={`w-full h-full object-contain bg-slate-900 ${play ? '' : 'opacity-100'}`}
            />

            {!play && (
              <>
                {/* Subtle darken over the poster so the play button pops */}
                <div className="absolute inset-0 bg-slate-900/25 transition-all duration-300" />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-4">
                  <button
                    onClick={startPlayback}
                    aria-label="Play intro video"
                    className="w-16 h-16 rounded-full bg-teal-500 hover:bg-teal-600 text-white flex items-center justify-center shadow-lg hover:shadow-teal-500/20 hover:scale-110 transition-all duration-200"
                  >
                    <Play className="w-6 h-6 fill-white ml-1" />
                  </button>
                  <p className="text-white font-extrabold text-sm" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    Play Intro Video
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
