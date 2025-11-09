"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import Card from "../../components/Card"
import SessionMetricsCard from "../../components/SessionMetricsCard"
import PerformanceScore from "../../components/PerformanceScore"
import FeedbackSection from "../../components/FeedbackSection"
import AchievementBadge from "../../components/AchievementBadge"
import { ROUTES } from "../../lib/routes"
import { analyzeSessionWithGemini, type GeminiAnalysisResponse } from "../../services/geminiAnalysis"

const FILLER_ANALYSIS_STORAGE_KEY = "echolag:filler-analysis"

interface StoredAnalysis {
  transcript: string
  metrics: {
    durationSeconds: number
    wordCount: number
    wordsPerMinute: number
  }
  fillerStats: {
    total: number
    breakdown: Array<{ word: string; count: number }>
  }
  analysis?: GeminiAnalysisResponse
  timestamp: number
}

const FillerWordsReportPage = () => {
  const router = useRouter()
  const [payload, setPayload] = useState<StoredAnalysis | null>(null)
  const [analysis, setAnalysis] = useState<GeminiAnalysisResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    const raw = window.sessionStorage.getItem(FILLER_ANALYSIS_STORAGE_KEY)
    if (!raw) {
      router.replace(ROUTES.FILLER_WORDS)
      return
    }

    try {
      const parsed = JSON.parse(raw) as StoredAnalysis
      setPayload(parsed)
      setAnalysis(parsed.analysis ?? null)
    } catch (err) {
      console.error("Failed to parse stored Gemini analysis", err)
      router.replace(ROUTES.FILLER_WORDS)
      return
    } finally {
      setIsLoading(false)
    }
  }, [router])

  useEffect(() => {
    const runAnalysis = async () => {
      if (!payload) return
      if (analysis) return

      try {
        setIsAnalyzing(true)
        setError(null)
        const result = await analyzeSessionWithGemini(payload.transcript, {
          duration: payload.metrics.durationSeconds,
          wordCount: payload.metrics.wordCount,
          wordsPerMinute: payload.metrics.wordsPerMinute,
        })
        setAnalysis(result)
        if (typeof window !== "undefined") {
          const nextPayload: StoredAnalysis = {
            ...payload,
            analysis: result,
          }
          window.sessionStorage.setItem(FILLER_ANALYSIS_STORAGE_KEY, JSON.stringify(nextPayload))
          setPayload(nextPayload)
        }
      } catch (err) {
        console.error("Gemini analysis failed", err)
        setError(err instanceof Error ? err.message : "Unable to analyze session with Gemini.")
      } finally {
        setIsAnalyzing(false)
      }
    }

    runAnalysis()
  }, [analysis, payload])

  const overallScore = useMemo(() => {
    if (!analysis) return 0
    return analysis.averageScore ?? Math.round(
      (analysis.clarityScore + analysis.pronunciationScore + analysis.fluencyScore) / 3,
    )
  }, [analysis])

  const achievements = useMemo(() => {
    if (!payload) return []
    const { fillerStats } = payload
    return [
      {
        title: "Filler Fighter",
        description: "Keep total filler words under five",
        icon: "🛡️",
        unlocked: fillerStats.total <= 5,
        progress: { current: Math.min(fillerStats.total, 5), target: 5 },
      },
      {
        title: "Momentum Master",
        description: "Maintain WPM above 110",
        icon: "⚡",
        unlocked: payload.metrics.wordsPerMinute >= 110,
        progress: {
          current: Math.min(payload.metrics.wordsPerMinute, 110),
          target: 110,
        },
      },
      {
        title: "Consistency Builder",
        description: "Complete three drills in a row",
        icon: "🎯",
        unlocked: false,
        progress: { current: 1, target: 3 },
      },
    ]
  }, [payload])

  if (isLoading || !payload) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#F5F1E8" }}>
        <div className="text-center">
          <div
            className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{ borderColor: "#8B9D83" }}
          />
          <p className="text-lg font-medium" style={{ color: "#4A3F35" }}>
            Preparing your Gemini insights…
          </p>
        </div>
      </div>
    )
  }

  if (isAnalyzing && !analysis) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#F5F1E8" }}>
        <div className="text-center">
          <div
            className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{ borderColor: "#8B9D83" }}
          />
          <p className="text-lg font-medium" style={{ color: "#4A3F35" }}>
            Gemini is crunching your filler-word breakdown…
          </p>
        </div>
      </div>
    )
  }

  const {
    transcript,
    metrics: { durationSeconds, wordCount, wordsPerMinute },
    fillerStats,
    timestamp,
  } = payload

  const sessionDate = new Date(timestamp)

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "#F5F1E8" }}>
        <Card>
          <div className="text-center space-y-4">
            <div className="text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold" style={{ color: "#4A3F35" }}>
              Unable to generate Gemini insights
            </h2>
            <p className="text-sm" style={{ color: "#6B5D52" }}>
              {error}
            </p>
            <div className="flex gap-3 justify-center mt-6">
              <button
                onClick={() => router.push(ROUTES.FILLER_WORDS)}
                className="px-6 py-3 rounded-lg font-semibold text-white transition-all duration-300 hover:scale-105 cursor-pointer"
                style={{ backgroundColor: "#8B9D83" }}
              >
                Try another drill
              </button>
              <button
                onClick={() => router.push(ROUTES.HOME)}
                className="px-6 py-3 rounded-lg font-medium border-2 transition-all duration-300 cursor-pointer"
                style={{ borderColor: "#8B7355", color: "#4A3F35" }}
              >
                Back to home
              </button>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F5F1E8" }}>
      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: "#8B9D83" }}>
              <span className="text-white text-xl">🎯</span>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-2" style={{ color: "#4A3F35" }}>
            Filler Word Debrief
          </h1>
          <p className="text-lg" style={{ color: "#6B5D52" }}>
            Gemini-tailored feedback for your latest drill
          </p>
          <p className="text-sm mt-2" style={{ color: "#9CA3AF" }}>
            Recorded {sessionDate.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
          </p>
        </motion.header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
              <Card>
                <div className="flex flex-col items-center gap-4">
                  <p className="text-sm font-medium" style={{ color: "#6B5D52" }}>
                    Overall Score
                  </p>
                  <div
                    className="text-7xl font-black"
                    style={{ color: overallScore >= 70 ? "#10B981" : overallScore >= 50 ? "#D4A574" : "#EF4444" }}
                  >
                    {overallScore}
                  </div>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, index) => (
                      <span
                        key={index}
                        className="text-2xl"
                        style={{ color: index < Math.round(overallScore / 20) ? "#FCD34D" : "#E5E0D6" }}
                      >
                        ⭐
                      </span>
                    ))}
                  </div>
                  {isAnalyzing && (
                    <p className="text-xs text-[#6B5D52]">Crunching Gemini insights…</p>
                  )}
                </div>
              </Card>
            </motion.div>

            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <h2 className="text-xl font-semibold mb-4" style={{ color: "#4A3F35" }}>
                Session Metrics
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <SessionMetricsCard label="Words Per Minute" value={wordsPerMinute} icon="⚡" />
                <SessionMetricsCard label="Total Words" value={wordCount} icon="📝" />
                <SessionMetricsCard label="Duration" value={`${durationSeconds.toFixed(1)}s`} icon="⏱️" />
                <SessionMetricsCard label="Filler Count" value={fillerStats.total} icon="🚫" />
              </div>
            </motion.section>

            {analysis && (
              <>
                <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                  <h2 className="text-xl font-semibold mb-4" style={{ color: "#4A3F35" }}>
                    Performance Scores
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <PerformanceScore label="Clarity" score={analysis.clarityScore} icon="✨" color="#3B82F6" backgroundColor="#E8F5F8" />
                    <PerformanceScore label="Pronunciation" score={analysis.pronunciationScore} icon="🔊" color="#9333EA" backgroundColor="#F8E8F8" />
                    <PerformanceScore label="Fluency" score={analysis.fluencyScore} icon="⚡" color="#10B981" backgroundColor="#E8F5E8" />
                  </div>
                </motion.section>

                <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="space-y-4">
                  <h2 className="text-xl font-semibold mb-4" style={{ color: "#4A3F35" }}>
                    AI-Powered Feedback
                  </h2>

                  <Card>
                    <p className="leading-relaxed" style={{ color: "#6B5D52" }}>
                      {analysis.overallSummary}
                    </p>
                  </Card>

                  <FeedbackSection
                    title="Your Strengths"
                    items={analysis.strengths}
                    icon="✓"
                    iconColor="#10B981"
                    defaultExpanded
                  />
                  <FeedbackSection
                    title="Growth Opportunities"
                    items={analysis.growthOpportunities}
                    icon="💡"
                    iconColor="#3B82F6"
                    defaultExpanded
                  />

                  <Card>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-xl">💬</span>
                      <h3 className="text-lg font-semibold" style={{ color: "#4A3F35" }}>
                        Personalized Tips
                      </h3>
                    </div>
                    <ol className="space-y-3 list-decimal list-inside">
                      {analysis.tips.map((tip, index) => (
                        <li key={index} className="leading-relaxed" style={{ color: "#6B5D52" }}>
                          {tip}
                        </li>
                      ))}
                    </ol>
                  </Card>
                </motion.section>
              </>
            )}

            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
              <Card>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xl">🗂️</span>
                  <h3 className="text-lg font-semibold" style={{ color: "#4A3F35" }}>
                    Filler Word Breakdown
                  </h3>
                </div>
                <div className="flex flex-wrap gap-3 text-sm">
                  <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700">
                    Total fillers: {fillerStats.total}
                  </span>
                  {fillerStats.breakdown.slice(0, 8).map(({ word, count }) => (
                    <span
                      key={`filler-${word}`}
                      className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-600"
                    >
                      {word}
                      <span className="rounded-full bg-slate-300 px-2 py-0.5 text-xs font-semibold">{count}</span>
                    </span>
                  ))}
                </div>
              </Card>
            </motion.section>

            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <Card>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xl">🗒️</span>
                  <h3 className="text-lg font-semibold" style={{ color: "#4A3F35" }}>
                    Full Transcript
                  </h3>
                </div>
                <div className="max-h-[320px] overflow-y-auto rounded-xl border border-slate-200 bg-white/95 px-5 py-4 text-sm leading-relaxed" style={{ color: "#374151" }}>
                  <pre className="whitespace-pre-wrap break-words font-sans">{transcript}</pre>
                </div>
              </Card>
            </motion.section>
          </div>

          <div className="space-y-6">
            <motion.section initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
              <h2 className="text-xl font-semibold mb-4" style={{ color: "#4A3F35" }}>
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
            </motion.section>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mt-12"
        >
          <button
            onClick={() => router.push(ROUTES.FILLER_WORDS)}
            className="px-8 py-4 rounded-lg font-semibold text-white transition-all duration-300 hover:scale-105 cursor-pointer"
            style={{ backgroundColor: "#8B9D83" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#7A8A6F")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#8B9D83")}
          >
            Run another drill
          </button>
          <button
            onClick={() => router.push(ROUTES.HOME)}
            className="px-8 py-4 rounded-lg font-medium border-2 transition-all duration-300 cursor-pointer"
            style={{ borderColor: "#8B7355", color: "#4A3F35", backgroundColor: "transparent" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#C4D0BC"
              e.currentTarget.style.borderColor = "#8B9D83"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent"
              e.currentTarget.style.borderColor = "#8B7355"
            }}
          >
            Back to home
          </button>
        </motion.div>
      </div>
    </div>
  )
}

export default FillerWordsReportPage
