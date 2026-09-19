import {
  Student,
  PhonemePattern,
  PracticeWord,
  AccuracyDataPoint,
  PracticeParagraph,
  WordResult,
  PracticeSessionResult,
  ErrorFrequency,
} from './types';

// Current student
export const currentStudent: Student = {
  id: '1',
  name: 'Alex',
  practiceStreak: 7,
  totalPracticeDays: 24,
  totalPracticeSessions: 68,
};

// Weak sounds (phoneme patterns student struggles with)
export const weakSounds: PhonemePattern[] = [
  {
    id: 'vw-1',
    name: 'V/W Confusion',
    description: 'Distinguishing between /v/ and /w/ sounds',
    errorCount: 23,
    lastSeen: '2 days ago',
    status: 'improving',
  },
  {
    id: 'short-e-1',
    name: 'Short-E Sound',
    description: 'Proper phonics of short /ε/ as in "bed"',
    errorCount: 18,
    lastSeen: 'yesterday',
    status: 'improving',
  },
  {
    id: 'th-1',
    name: 'TH Sounds',
    description: 'Unvoiced /θ/ and voiced /ð/ sounds',
    errorCount: 15,
    lastSeen: '3 days ago',
    status: 'needs-work',
  },
  {
    id: 'r-1',
    name: 'R Sound',
    description: 'Correct phonics of /r/ sound',
    errorCount: 12,
    lastSeen: 'today',
    status: 'improving',
  },
];

// Sounds the student has fixed
export const soundsFixed: PhonemePattern[] = [
  {
    id: 's-1',
    name: 'S Sound',
    description: 'Clear /s/ phonics',
    errorCount: 0,
    lastSeen: '1 week ago',
    status: 'resolved',
  },
  {
    id: 'z-1',
    name: 'Z Sound',
    description: 'Voiced /z/ phonics',
    errorCount: 0,
    lastSeen: '5 days ago',
    status: 'resolved',
  },
];

// Practice words list
export const practiceWords: PracticeWord[] = [
  {
    id: 'word-1',
    word: 'very',
    errorCount: 5,
    totalAttempts: 12,
    trend: 'improving',
    lastPracticed: 'today',
  },
  {
    id: 'word-2',
    word: 'with',
    errorCount: 4,
    totalAttempts: 10,
    trend: 'improving',
    lastPracticed: '2 days ago',
  },
  {
    id: 'word-3',
    word: 'weather',
    errorCount: 6,
    totalAttempts: 11,
    trend: 'stable',
    lastPracticed: 'yesterday',
  },
  {
    id: 'word-4',
    word: 'water',
    errorCount: 3,
    totalAttempts: 9,
    trend: 'improving',
    lastPracticed: 'today',
  },
  {
    id: 'word-5',
    word: 'bread',
    errorCount: 2,
    totalAttempts: 8,
    trend: 'improving',
    lastPracticed: '3 days ago',
  },
  {
    id: 'word-6',
    word: 'thinking',
    errorCount: 5,
    totalAttempts: 13,
    trend: 'stable',
    lastPracticed: 'today',
  },
];

// 7-day accuracy chart data
export const accuracyData: AccuracyDataPoint[] = [
  { date: 'Mon', accuracy: 75 },
  { date: 'Tue', accuracy: 78 },
  { date: 'Wed', accuracy: 82 },
  { date: 'Thu', accuracy: 79 },
  { date: 'Fri', accuracy: 85 },
  { date: 'Sat', accuracy: 88 },
  { date: 'Sun', accuracy: 90 },
];

// Practice paragraphs
export const practiceParagraphs: PracticeParagraph[] = [
  {
    id: 'para-1',
    text: 'The very wet weather made it difficult to see well. We watched the water splash against the windows with great interest.',
    targetWords: [
      { word: 'very', phoneme: 'V/W' },
      { word: 'wet', phoneme: 'V/W' },
      { word: 'weather', phoneme: 'V/W' },
      { word: 'water', phoneme: 'V/W' },
      { word: 'with', phoneme: 'TH' },
    ],
  },
  {
    id: 'para-2',
    text: 'The bread and the rest of the meal were served together. Everyone thought it was wonderful and worth the wait.',
    targetWords: [
      { word: 'bread', phoneme: 'Short-E' },
      { word: 'rest', phoneme: 'Short-E' },
      { word: 'thought', phoneme: 'TH' },
      { word: 'worth', phoneme: 'V/W' },
    ],
  },
  {
    id: 'para-3',
    text: 'Reading requires patience and practice. Really try your best when pronouncing these tricky words.',
    targetWords: [
      { word: 'Reading', phoneme: 'R' },
      { word: 'requires', phoneme: 'R' },
      { word: 'Really', phoneme: 'R' },
      { word: 'try', phoneme: 'R' },
    ],
  },
];

// Sample practice session result
export const sampleSessionResult: PracticeSessionResult = {
  paragraphId: 'para-1',
  results: [
    {
      word: 'very',
      correct: false,
      said: 'wery',
      phonemeFocus: 'V/W Confusion',
      explanation: 'Confusing /v/ with /w/. Try using your top teeth and bottom lip together.',
    },
    {
      word: 'wet',
      correct: true,
      phonemeFocus: 'V/W',
    },
    {
      word: 'weather',
      correct: false,
      said: 'wether',
      phonemeFocus: 'V/W Confusion',
      explanation: 'The beginning sound should be /w/, but check your vowel sound too.',
    },
    {
      word: 'water',
      correct: true,
      phonemeFocus: 'V/W',
    },
    {
      word: 'with',
      correct: true,
      phonemeFocus: 'TH',
    },
  ],
  timestamp: new Date().toISOString(),
  accuracy: 60,
};

// All phoneme patterns (for Progress page)
export const allPhonemePatterns: PhonemePattern[] = [
  ...weakSounds,
  ...soundsFixed,
  {
    id: 'sh-1',
    name: 'SH Sound',
    description: 'Clear /ʃ/ phonics',
    errorCount: 8,
    lastSeen: '1 week ago',
    status: 'improving',
  },
  {
    id: 'ch-1',
    name: 'CH Sound',
    description: 'Proper /tʃ/ phonics',
    errorCount: 6,
    lastSeen: '2 weeks ago',
    status: 'needs-work',
  },
  {
    id: 'ng-1',
    name: 'NG Sound',
    description: 'Velar /ŋ/ sound at end of words',
    errorCount: 4,
    lastSeen: '3 days ago',
    status: 'improving',
  },
];

// Error frequency for charts
export const errorFrequency: ErrorFrequency[] = [
  { pattern: 'V/W Confusion', count: 23 },
  { pattern: 'Short-E Sound', count: 18 },
  { pattern: 'TH Sounds', count: 15 },
  { pattern: 'R Sound', count: 12 },
  { pattern: 'SH Sound', count: 8 },
];
