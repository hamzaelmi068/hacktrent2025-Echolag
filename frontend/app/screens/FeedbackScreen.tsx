"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import Card from "../components/Card";
import SessionMetricsCard from "../components/SessionMetricsCard";
import PerformanceScore from "../components/PerformanceScore";
import FeedbackSection from "../components/FeedbackSection";
import AchievementBadge from "../components/AchievementBadge";
import { ROUTES } from "../lib/routes";
import { calculateSpeechMetrics, formatDuration } from "../utils/speechMetrics";
import { analyzeSessionWithGemini, type GeminiAnalysisResponse } from "../services/geminiAnalysis";

interface SessionData {
  transcript: string;
  duration: number;
  audioUrl?: string;
}

const FeedbackScreen = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<GeminiAnalysisResponse | null>(null);
  const [metrics, setMetrics] = useState<ReturnType<typeof calculateSpeechMetrics> | null>(null);

  // Get session data from URL params or localStorage
  const sessionData = useMemo<SessionData | null>(() => {
    const transcript = searchParams.get('transcript') || localStorage.getItem('sessionTranscript') || '';
    const duration = parseFloat(searchParams.get('duration') || localStorage.getItem('sessionDuration') || '0');
    const audioUrl = searchParams.get('audioUrl') || localStorage.getItem('sessionAudioUrl') || undefined;

    if (!transcript && duration === 0) {
      return null;
    }

    return { transcript, duration, audioUrl };
  }, [searchParams]);

  // Calculate metrics and fetch analysis
  useEffect(() => {
    if (!sessionData) {
      setError('No session data available');
      setIsLoading(false);
      return;
    }

    const fetchAnalysis = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Calculate speech metrics
        const calculatedMetrics = calculateSpeechMetrics(
          sessionData.transcript,
          sessionData.duration
        );
        setMetrics(calculatedMetrics);

        // Analyze with Gemini
        const geminiAnalysis = await analyzeSessionWithGemini(
          sessionData.transcript,
          {
            duration: calculatedMetrics.totalDuration,
            wordCount: calculatedMetrics.wordCount,
            averagePause: calculatedMetrics.averagePauseDuration,
            wordsPerMinute: calculatedMetrics.wordsPerMinute,
          }
        );

        setAnalysis(geminiAnalysis);
      } catch (err) {
        console.error('Analysis error:', err);
        setError(err instanceof Error ? err.message : 'Failed to analyze session');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalysis();
  }, [sessionData]);

  // Calculate overall score
  const overallScore = useMemo(() => {
    if (!analysis) return 0;
    return Math.round(
      (analysis.clarityScore + analysis.pronunciationScore + analysis.fluencyScore) / 3
    );
  }, [analysis]);

  // Determine achievements
  const achievements = useMemo(() => {
    if (!analysis || !metrics) return [];
    
    const achieved = [];
    
    // First Steps - completed first session
    achieved.push({
      title: "First Steps",
      description: "Complete your first practice session",
      icon: "⭐",
      unlocked: true,
    });

    // On Fire - 3 session streak (placeholder)
    achieved.push({
      title: "On Fire",
      description: "Maintain a 3-session streak",
      icon: "🔥",
      unlocked: false,
      progress: { current: 0, target: 3 },
    });

    // Perfectionist - perfect score
    achieved.push({
      title: "Perfectionist",
      description: "Achieve a perfect 100 score",
      icon: "👑",
      unlocked: overallScore === 100,
      progress: overallScore === 100 ? { current: 1, target: 1 } : { current: 0, target: 1 },
    });

    // Dedicated Learner - 10 sessions (placeholder)
    achieved.push({
      title: "Dedicated Learner",
      description: "Complete 10 practice sessions",
      icon: "📚",
      unlocked: false,
      progress: { current: 1, target: 10 },
    });

    // High Achiever - score above 90
    achieved.push({
      title: "High Achiever",
      description: "Score above 90 five times",
      icon: "🏆",
      unlocked: overallScore >= 90,
      progress: overallScore >= 90 ? { current: 1, target: 5 } : { current: 0, target: 5 },
    });

    return achieved;
  }, [analysis, overallScore, metrics]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F5F1E8' }}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: '#8B9D83' }} />
          <p className="text-lg font-medium" style={{ color: '#4A3F35' }}>Analyzing your session...</p>
          <p className="text-sm mt-2" style={{ color: '#6B5D52' }}>This may take a few moments</p>
        </div>
      </div>
    );
  }

  if (error || !sessionData || !metrics) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#F5F1E8' }}>
        <Card>
          <div className="text-center space-y-4">
            <div className="text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold" style={{ color: '#4A3F35' }}>
              Unable to load session data
            </h2>
            <p className="text-sm" style={{ color: '#6B5D52' }}>
              {error || 'No session data found. Please complete a practice session first.'}
            </p>
            <div className="flex gap-3 justify-center mt-6">
              <button
                onClick={() => router.push(ROUTES.SESSION)}
                className="px-6 py-3 rounded-lg font-semibold text-white transition-all duration-300 hover:scale-105 cursor-pointer"
                style={{ backgroundColor: '#8B9D83' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#7A8A6F'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#8B9D83'}
              >
                Start Practice
              </button>
              <button
                onClick={() => router.push(ROUTES.HOME)}
                className="px-6 py-3 rounded-lg font-medium border-2 transition-all duration-300 cursor-pointer"
                style={{ 
                  borderColor: '#8B7355',
                  color: '#4A3F35',
                  backgroundColor: 'transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#C4D0BC';
                  e.currentTarget.style.borderColor = '#8B9D83';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.borderColor = '#8B7355';
                }}
              >
                Back to Home
              </button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#F5F1E8' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#8B9D83' }}>
              <span className="text-white text-xl">📊</span>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-3" style={{ color: '#4A3F35' }}>
            Performance Report
          </h1>
          <p className="text-lg" style={{ color: '#6B5D52' }}>
            AI-powered feedback & scoring
          </p>
        </motion.header>

        {/* Audio Player */}
        {sessionData.audioUrl && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8 flex justify-center"
          >
            <Card>
              <audio
                controls
                className="w-full max-w-md"
                src={sessionData.audioUrl}
                aria-label="Session recording playback"
              />
            </Card>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overall Score Badge */}
            {analysis && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="text-center"
              >
                <Card>
                  <div className="flex items-center justify-center gap-6">
                    <div className="text-center">
                      <p className="text-sm font-medium mb-2" style={{ color: '#6B5D52' }}>
                        Overall Score
                      </p>
                      <div className="text-7xl font-black mb-2" style={{ color: overallScore >= 70 ? '#10B981' : overallScore >= 50 ? '#D4A574' : '#EF4444' }}>
                        {overallScore}
                      </div>
                      <div className="flex gap-1 mb-4">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className="text-2xl"
                            style={{ color: i < Math.round(overallScore / 20) ? '#FCD34D' : '#E5E0D6' }}
                          >
                            ⭐
                          </span>
                        ))}
                      </div>
                      <div className="text-3xl">🐻</div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Metrics Cards */}
            {metrics && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="text-xl font-semibold mb-4" style={{ color: '#4A3F35' }}>
                  Session Metrics
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <SessionMetricsCard
                    label="Words Per Minute"
                    value={metrics.wordsPerMinute}
                    icon="⚡"
                  />
                  <SessionMetricsCard
                    label="Total Words"
                    value={metrics.wordCount}
                    icon="📝"
                  />
                  <SessionMetricsCard
                    label="Avg Pause"
                    value={`${metrics.averagePauseDuration}s`}
                    icon="⏸️"
                  />
                  <SessionMetricsCard
                    label="Duration"
                    value={formatDuration(metrics.totalDuration)}
                    icon="⏱️"
                  />
                </div>
              </motion.div>
            )}

            {/* Performance Scores */}
            {analysis && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-4"
              >
                <h2 className="text-xl font-semibold mb-4" style={{ color: '#4A3F35' }}>
                  Performance Scores
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <PerformanceScore
                    label="Clarity"
                    score={analysis.clarityScore}
                    icon="✨"
                    color="#3B82F6"
                    backgroundColor="#E8F5F8"
                  />
                  <PerformanceScore
                    label="Pronunciation"
                    score={analysis.pronunciationScore}
                    icon="🔊"
                    color="#9333EA"
                    backgroundColor="#F8E8F8"
                  />
                  <PerformanceScore
                    label="Fluency"
                    score={analysis.fluencyScore}
                    icon="⚡"
                    color="#10B981"
                    backgroundColor="#E8F5E8"
                  />
                </div>
              </motion.div>
            )}

            {/* AI Feedback Sections */}
            {analysis && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-4"
              >
                <h2 className="text-xl font-semibold mb-4" style={{ color: '#4A3F35' }}>
                  AI-Powered Feedback
                </h2>

                {/* Overall Summary */}
                <Card>
                  <p className="leading-relaxed" style={{ color: '#6B5D52' }}>
                    {analysis.overallSummary}
                  </p>
                </Card>

                {/* Strengths */}
                <FeedbackSection
                  title="Your Strengths"
                  items={analysis.strengths}
                  icon="✓"
                  iconColor="#10B981"
                  defaultExpanded={true}
                />

                {/* Growth Opportunities */}
                <FeedbackSection
                  title="Growth Opportunities"
                  items={analysis.growthOpportunities}
                  icon="💡"
                  iconColor="#3B82F6"
                  defaultExpanded={true}
                />

                {/* Tips */}
                <Card>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-xl">💬</span>
                    <h3 className="text-lg font-semibold" style={{ color: '#4A3F35' }}>
                      Personalized Tips
                    </h3>
                  </div>
                  <ol className="space-y-3 list-decimal list-inside">
                    {analysis.tips.map((tip, index) => (
                      <li key={index} className="leading-relaxed" style={{ color: '#6B5D52' }}>
                        {tip}
                      </li>
                    ))}
                  </ol>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Right Column - Achievements */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <h2 className="text-xl font-semibold mb-4" style={{ color: '#4A3F35' }}>
                Achievements
              </h2>
              <div className="space-y-3">
                {achievements.map((achievement, index) => (
                  <AchievementBadge
                    key={index}
                    title={achievement.title}
                    description={achievement.description}
                    icon={achievement.icon}
                    unlocked={achievement.unlocked}
                    progress={achievement.progress}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mt-12"
        >
          <button
            onClick={() => router.push(ROUTES.SESSION)}
            className="px-8 py-4 rounded-lg font-semibold text-white transition-all duration-300 hover:scale-105 cursor-pointer"
            style={{ backgroundColor: '#8B9D83' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#7A8A6F'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#8B9D83'}
          >
            Practice Again
          </button>
          <button
            onClick={() => router.push(ROUTES.HOME)}
            className="px-8 py-4 rounded-lg font-medium border-2 transition-all duration-300 cursor-pointer"
            style={{ 
              borderColor: '#8B7355',
              color: '#4A3F35',
              backgroundColor: 'transparent'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#C4D0BC';
              e.currentTarget.style.borderColor = '#8B9D83';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.borderColor = '#8B7355';
            }}
          >
            Back to Home
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default FeedbackScreen;
