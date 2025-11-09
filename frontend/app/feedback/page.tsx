'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ROUTES } from '../lib/routes';

type SessionMessage = {
  role: string;
  content: string;
};

type SessionData = {
  transcript: string;
  messages: SessionMessage[];
  wordCount: number;
  duration: number;
  wordsPerMinute: number;
  startTime: string;
  endTime: string;
  audioUrl?: string | null;
};

type AnalysisResponse = {
  overallSummary: string;
  strengths: string[];
  growthOpportunities: string[];
  tips: string[];
  clarityScore: number;
  pronunciationScore: number;
  fluencyScore: number;
  averageScore: number;
};

const FALLBACK_ANALYSIS: AnalysisResponse = {
  overallSummary:
    'Great work keeping the conversation flowing. You sounded friendly and professional—keep building on that momentum for even stronger sessions.',
  strengths: [
    'Welcoming tone that helps customers feel at ease right away',
    'Clear structure when confirming drink, size, and name details',
    'Steady pacing that keeps the interaction calm and confident',
  ],
  growthOpportunities: [
    'Double-check milk or flavor preferences to avoid assumptions',
    'Slow the pace slightly when pronouncing names to improve clarity',
    'Use upbeat reinforcement like “Excellent choice!” to boost energy',
  ],
  tips: [
    'Smile as you speak—listeners can hear the warmth instantly',
    'Echo key order details and invite quick confirmation',
    'Pause briefly after each detail so the guest can respond comfortably',
    'Wrap up with a confident recap and friendly send-off',
    'Practice aloud for one minute daily to smooth pacing and clarity',
  ],
  clarityScore: 75,
  pronunciationScore: 75,
  fluencyScore: 75,
  averageScore: 75,
};

const API_URL = 'http://localhost:3001/api/analyze-session';
const BACKGROUND = '#f8f6f1';
const TEXT_PRIMARY = '#3c372d';
const ACCENT_GREEN = '#80a66e';
const CARD_BG = '#ffffff';
const CARD_SHADOW = '0 10px 30px rgba(60, 55, 45, 0.08)';

const formatDuration = (seconds: number): string => {
  if (!Number.isFinite(seconds)) {
    return '0:00';
  }
  const totalSeconds = Math.max(0, Math.round(seconds));
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const FeedbackPage = () => {
  const router = useRouter();
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFallback, setIsFallback] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const stored = window.localStorage.getItem('lastSessionData');
      if (!stored) {
        setError('No recent session found.');
        router.replace(ROUTES.SESSION);
        return;
      }

      const parsed = JSON.parse(stored) as SessionData;
      if (!parsed || !parsed.transcript || !parsed.transcript.trim()) {
        setError('Session data incomplete.');
        router.replace(ROUTES.SESSION);
        return;
      }

      setSessionData(parsed);
    } catch (err) {
      console.error('Failed to read session data', err);
      setError('Unable to load session data.');
      router.replace(ROUTES.SESSION);
    }
  }, [router]);

  useEffect(() => {
    if (!sessionData) {
      return;
    }

    let isMounted = true;

    const fetchAnalysis = async () => {
      setIsLoading(true);
      setError(null);
      setIsFallback(false);

      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transcript: sessionData.transcript,
            duration: sessionData.duration,
            wordCount: sessionData.wordCount,
            wordsPerMinute: sessionData.wordsPerMinute,
            messages: sessionData.messages,
            startTime: sessionData.startTime,
            endTime: sessionData.endTime,
          }),
        });

        if (!response.ok) {
          throw new Error(`Analysis API returned ${response.status}`);
        }

        const data = (await response.json()) as AnalysisResponse;
        if (isMounted) {
          setAnalysis({
            ...data,
            strengths: data.strengths.slice(0, 3),
            growthOpportunities: data.growthOpportunities.slice(0, 3),
            tips: data.tips.slice(0, 5),
          });
        }
      } catch (err) {
        console.error('Analysis request failed', err);
        if (isMounted) {
          setIsFallback(true);
          setAnalysis(FALLBACK_ANALYSIS);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchAnalysis();

    return () => {
      isMounted = false;
    };
  }, [sessionData]);

  const breakdown = useMemo(() => {
    if (!analysis) return [];
    return [
      { label: 'Clarity', score: analysis.clarityScore },
      { label: 'Pronunciation', score: analysis.pronunciationScore },
      { label: 'Fluency', score: analysis.fluencyScore },
    ];
  }, [analysis]);

  const metricCards = useMemo(() => {
    if (!sessionData) return [];
    return [
      { label: 'Words / Min', value: sessionData.wordsPerMinute.toString() },
      { label: 'Total Words', value: sessionData.wordCount.toString() },
      { label: 'Duration', value: formatDuration(sessionData.duration) },
    ];
  }, [sessionData]);

  if (isLoading || !analysis || !sessionData) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: BACKGROUND }}
      >
        <div className="text-center space-y-3">
          <div
            className="w-16 h-16 mx-auto rounded-full border-4 border-t-transparent animate-spin"
            style={{ borderColor: `${ACCENT_GREEN} transparent ${ACCENT_GREEN} ${ACCENT_GREEN}` }}
          />
          <p className="text-lg font-semibold" style={{ color: TEXT_PRIMARY }}>
            Analyzing your session...
          </p>
          <p className="text-sm" style={{ color: '#6d6358' }}>
            Brewing personalized feedback. This will only take a moment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen w-full px-4 py-10 sm:px-8 md:px-12"
      style={{ backgroundColor: BACKGROUND, color: TEXT_PRIMARY }}
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="text-center space-y-2">
          <p className="text-sm uppercase tracking-[0.3em]" style={{ color: '#8c8377' }}>
            Session Report
          </p>
          <h1 className="text-4xl font-black sm:text-5xl">AI Performance Review</h1>
          {isFallback && (
            <p className="text-sm text-orange-700">
              Showing baseline guidance while we reconnect to the analysis service.
            </p>
          )}
          {error && (
            <p className="text-xs text-red-600">
              {error}
            </p>
          )}
        </header>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-3xl p-8 shadow-lg"
          style={{ backgroundColor: CARD_BG, boxShadow: CARD_SHADOW }}
        >
          <div className="flex flex-col items-center gap-6 md:flex-row md:items-end md:justify-between">
            <div className="text-center md:text-left">
              <p className="text-sm font-semibold uppercase tracking-widest" style={{ color: '#8c8377' }}>
                Overall Score
              </p>
              <p className="text-base" style={{ color: '#6d6358' }}>
                Based on clarity, pronunciation, and fluency
              </p>
            </div>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.35 }}
              className="rounded-full px-10 py-6 text-center shadow-md"
              style={{ backgroundColor: '#f0ede5', boxShadow: '0 12px 24px rgba(60,55,45,0.12)' }}
            >
              <span className="block text-sm font-semibold uppercase tracking-[0.25em]" style={{ color: '#8c8377' }}>
                Score
              </span>
              <span className="block text-8xl font-black leading-none" style={{ color: ACCENT_GREEN }}>
                {analysis.averageScore}
              </span>
            </motion.div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="grid gap-4 md:grid-cols-3"
        >
          {metricCards.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * (index + 1), duration: 0.35 }}
              className="rounded-2xl p-6 text-center shadow-md"
              style={{ backgroundColor: CARD_BG, boxShadow: CARD_SHADOW }}
            >
              <p className="text-sm font-semibold uppercase tracking-widest" style={{ color: '#8c8377' }}>
                {metric.label}
              </p>
              <p className="mt-3 text-4xl font-bold" style={{ color: TEXT_PRIMARY }}>
                {metric.value}
              </p>
            </motion.div>
          ))}
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.45 }}
          className="rounded-3xl p-8 shadow-lg"
          style={{ backgroundColor: CARD_BG, boxShadow: CARD_SHADOW }}
        >
          <h2 className="text-2xl font-semibold">Performance Breakdown</h2>
          <div className="mt-6 space-y-6">
            {breakdown.map((item, index) => (
              <div key={item.label} className="space-y-3">
                <div className="flex items-center justify-between text-sm font-semibold">
                  <span>{item.label}</span>
                  <span>{item.score}</span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full" style={{ backgroundColor: '#e5dfd6' }}>
                  <motion.div
                    initial={{ width: '0%' }}
                    animate={{ width: `${item.score}%` }}
                    transition={{ delay: 0.2 + index * 0.15, duration: 0.7, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{
                      backgroundImage:
                        'linear-gradient(90deg, #80a66e 0%, #6f925e 50%, #4f6f44 100%)',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.45 }}
          className="grid gap-6 lg:grid-cols-2"
        >
          <div
            className="rounded-3xl p-6 shadow-lg"
            style={{ backgroundColor: CARD_BG, boxShadow: CARD_SHADOW }}
          >
            <h3 className="text-xl font-semibold">
              ✨ Strengths
            </h3>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed" style={{ color: '#5b5248' }}>
              {analysis.strengths.map((item, index) => (
                <motion.li
                  key={item}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 * (index + 1) }}
                >
                  {item}
                </motion.li>
              ))}
            </ul>
          </div>
          <div
            className="rounded-3xl p-6 shadow-lg"
            style={{ backgroundColor: CARD_BG, boxShadow: CARD_SHADOW }}
          >
            <h3 className="text-xl font-semibold">
              💡 Growth Opportunities
            </h3>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed" style={{ color: '#5b5248' }}>
              {analysis.growthOpportunities.map((item, index) => (
                <motion.li
                  key={item}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 * (index + 1) }}
                >
                  {item}
                </motion.li>
              ))}
            </ul>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.45 }}
          className="rounded-3xl p-8 shadow-lg"
          style={{ backgroundColor: CARD_BG, boxShadow: CARD_SHADOW }}
        >
          <h2 className="text-2xl font-semibold">💪 Tips for Next Time</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {analysis.tips.map((tip, index) => (
              <motion.div
                key={tip}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (index + 1) }}
                className="rounded-2xl p-4 text-sm leading-relaxed shadow-md"
                style={{
                  backgroundColor: '#f4f1ea',
                  boxShadow: '0 12px 24px rgba(60,55,45,0.08)',
                }}
              >
                {tip}
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.45 }}
          className="rounded-3xl p-6 shadow-lg"
          style={{ backgroundColor: CARD_BG, boxShadow: CARD_SHADOW }}
        >
          <h2 className="text-xl font-semibold">Session Highlights</h2>
          <p className="mt-3 text-sm leading-relaxed" style={{ color: '#5b5248' }}>
            {analysis.overallSummary}
          </p>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.45 }}
          className="flex flex-col gap-4 sm:flex-row sm:justify-center"
        >
          <button
            onClick={() => router.push(ROUTES.SESSION)}
            className="w-full rounded-full px-10 py-4 text-base font-semibold sm:w-auto"
            style={{
              backgroundColor: ACCENT_GREEN,
              color: '#ffffff',
              boxShadow: '0 16px 32px rgba(128,166,110,0.35)',
            }}
          >
            Practice Again
          </button>
          <button
            onClick={() => router.push(ROUTES.HOME)}
            className="w-full rounded-full px-10 py-4 text-base font-semibold sm:w-auto"
            style={{
              backgroundColor: '#ffffff',
              color: TEXT_PRIMARY,
              border: '2px solid #d1c5b5',
              boxShadow: CARD_SHADOW,
            }}
          >
            Back to Home
          </button>
        </motion.section>
      </div>
    </div>
  );
};

export default FeedbackPage;

