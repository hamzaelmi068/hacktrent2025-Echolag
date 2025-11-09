"use client"

import { useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import CafeBackground from "../components/CafeBackground"
import Card from "../components/Card"
import EmptyState from "../components/EmptyState"
import Masthead from "../components/Masthead"
import Toolbar from "../components/Toolbar"
import StickFigureTimer from "../components/StickTimerFigure"
import { useConversation } from "../context/ConversationContext"
import { ROUTES } from "../lib/routes"

const COACH_OPENING =
  "You keep leaning on “um” and “like.” Let’s tighten that up—deliver your point clean and confident."

const PRACTICE_PROMPTS = [
  "Outline a 30-second pitch about why communication matters.",
  "Explain a recent win without using “um,” “uh,” “like,” or “you know.”",
  "Describe what you’re working on next while keeping momentum.",
] as const

const TIMER_DURATION = 60

const SINGLE_WORD_FILLERS = [
  "um",
  "uh",
  "like",
  "so",
  "actually",
  "literally",
  "basically",
  "kinda",
  "sorta",
  "honestly",
] as const

const FILLER_REGEX = new RegExp(`(?:\\b(?:${SINGLE_WORD_FILLERS.join("|")})\\b|you\\s+know)`, "gi")

const FillerWordsScreen = () => {
  const router = useRouter()
  const { messages, sendMessage, isLoading, assistantAudioUrl, isSpeaking, speechError, clearSpeech } =
    useConversation()

  const [transcript, setTranscript] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [recognitionSupported, setRecognitionSupported] = useState(true)
  const [mediaSupported, setMediaSupported] = useState(true)
  const [showArchive, setShowArchive] = useState(true)
  const [countdown, setCountdown] = useState<number | null>(null)

  const mediaStreamRef = useRef<MediaStream | null>(null)
  const recognitionRef = useRef<any>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const liveAudioRef = useRef<HTMLAudioElement | null>(null)
  const coachAudioRef = useRef<HTMLAudioElement | null>(null)
  const archiveContentRef = useRef<HTMLDivElement | null>(null)
  const liveTranscriptRef = useRef<HTMLDivElement | null>(null)
  const countdownIntervalRef = useRef<number | null>(null)
  const autoSubmitRef = useRef(false)
  const transcriptRef = useRef("")

  useEffect(() => {
    transcriptRef.current = transcript
  }, [transcript])
  const previousFillerCountRef = useRef(0)

  useEffect(() => {
    if (typeof window === "undefined") {
      setRecognitionSupported(false)
      setMediaSupported(false)
      return
    }

    const hasMedia = Boolean(navigator.mediaDevices?.getUserMedia)
    const SpeechRecognitionConstructor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    setMediaSupported(hasMedia)
    setRecognitionSupported(Boolean(SpeechRecognitionConstructor))
  }, [])

  const clearCountdown = useCallback((resetValue = true) => {
    if (countdownIntervalRef.current !== null) {
      window.clearInterval(countdownIntervalRef.current)
      countdownIntervalRef.current = null
    }
    autoSubmitRef.current = false
    if (resetValue) {
      setCountdown(null)
    }
  }, [])

  const stopListening = useCallback(() => {
    clearCountdown()
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onresult = null
        recognitionRef.current.onerror = null
        recognitionRef.current.onend = null
        recognitionRef.current.stop()
      } catch (err) {
        console.error("Error stopping recognition", err)
      }
    }

    if (mediaRecorderRef.current) {
      try {
        if (mediaRecorderRef.current.state !== "inactive") {
          mediaRecorderRef.current.stop()
        }
      } catch (error) {
        console.error("Error stopping recorder", error)
      }
      mediaRecorderRef.current.ondataavailable = null
      mediaRecorderRef.current.onstop = null
      mediaRecorderRef.current = null
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop())
      mediaStreamRef.current = null
    }

    if (liveAudioRef.current) {
      liveAudioRef.current.srcObject = null
    }

    setIsListening(false)
    setStatusMessage("Mic paused. Ready when you are.")
  }, [clearCountdown])

  useEffect(() => {
    return () => {
      stopListening()
      clearSpeech()
    }
  }, [stopListening, clearSpeech])

  useEffect(() => {
    if (!assistantAudioUrl || !coachAudioRef.current) {
      return
    }

    const audioElement = coachAudioRef.current
    const playAudio = async () => {
      try {
        audioElement.load()
        audioElement.currentTime = 0
        await audioElement.play()
      } catch (error) {
        console.warn("Autoplay prevented for coach audio.", error)
      }
    }

    playAudio()
  }, [assistantAudioUrl])

  const handleFinish = () => {
    stopListening()
    router.push(ROUTES.FEEDBACK)
  }

  const micStatusLabel = useMemo(() => {
    if (!mediaSupported) {
      return "Microphone unavailable"
    }
    if (isListening) {
      return "Mic is ON"
    }
    return "Mic is OFF"
  }, [isListening, mediaSupported])

  const handleStopAndSend = useCallback(
    async (autoSubmit = false) => {
      const snapshot = transcriptRef.current.trim()
      stopListening()
      if (snapshot) {
        setStatusMessage(
          autoSubmit ? "Timer's up! Submitting your take for review..." : "Analyzing your take for filler words...",
        )
        await sendMessage(snapshot)
        setStatusMessage("Response sent. Keep refining your delivery.")
      } else {
        setStatusMessage(
          autoSubmit ? "Timer ran out, but no speech detected. Try another take." : "No speech detected. Try again.",
        )
      }
    },
    [sendMessage, stopListening],
  )

  const startListening = useCallback(async () => {
    if (isListening) {
      return
    }

    if (!mediaSupported) {
      setStatusMessage("Microphone access is not supported in this browser.")
      return
    }

    if (typeof window === "undefined") {
      setStatusMessage("Speech features are unavailable in this environment.")
      return
    }

    const SpeechRecognitionConstructor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (!SpeechRecognitionConstructor) {
      setRecognitionSupported(false)
      setStatusMessage("Live transcription is not supported in this browser.")
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      })
      mediaStreamRef.current = stream
      audioChunksRef.current = []
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
        setAudioUrl(null)
      }

      if (typeof window !== "undefined") {
        ;(window as any).localStream = stream
      }

      if (liveAudioRef.current) {
        liveAudioRef.current.srcObject = stream
        liveAudioRef.current.autoplay = true
        liveAudioRef.current.muted = true
        liveAudioRef.current.play().catch((error) => {
          console.warn("Autoplay prevented. Audio will remain muted until user interacts.", error)
        })
      }
    } catch (error) {
      console.error("Microphone permission error", error)
      setStatusMessage("Microphone permission was denied. Please allow access to practice.")
      return
    }

    let recognition = recognitionRef.current

    if (SpeechRecognitionConstructor) {
      if (!recognition) {
        recognition = new SpeechRecognitionConstructor()
        recognitionRef.current = recognition
      }

      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = "en-US"

      recognition.onresult = (event: any) => {
        let combined = ""
        for (let i = 0; i < event.results.length; i += 1) {
          combined += event.results[i][0].transcript
        }
        setTranscript(combined.trim())
      }

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event)
        setRecognitionSupported(false)
        setStatusMessage(
          event.error === "not-allowed"
            ? "Speech recognition permission denied."
            : "Speech recognition error occurred.",
        )
        stopListening()
      }

      recognition.onend = () => {
        setIsListening(false)
        setStatusMessage("Mic paused. Tap start when you’re ready again.")
      }

      try {
        recognition.start()
      } catch (error) {
        console.error("Speech recognition start error", error)
        setStatusMessage("Unable to start speech recognition.")
      }
    }

    if (mediaStreamRef.current && typeof window !== "undefined" && window.MediaRecorder) {
      const recorder = new window.MediaRecorder(mediaStreamRef.current)
      mediaRecorderRef.current = recorder

      recorder.ondataavailable = (event: BlobEvent) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      recorder.onstop = () => {
        if (audioChunksRef.current.length > 0) {
          const blob = new Blob(audioChunksRef.current, { type: "audio/webm" })
          const url = URL.createObjectURL(blob)
          audioChunksRef.current = []
          setAudioUrl(url)
        }
      }

      try {
        recorder.start()
      } catch (error) {
        console.error("MediaRecorder start error", error)
        setStatusMessage("Unable to record audio preview.")
      }
    } else if (typeof window !== "undefined" && typeof window.MediaRecorder === "undefined") {
      setStatusMessage("Recording preview is not supported in this browser.")
    }

    try {
      clearCountdown(false)
      setCountdown(TIMER_DURATION)
      autoSubmitRef.current = false
      setTranscript("")
      setStatusMessage("Recording… keep your sentences clean and confident.")
      setIsListening(true)
      if (typeof window !== "undefined") {
        const intervalId = window.setInterval(() => {
          setCountdown((prev) => {
            if (prev === null) {
              return prev
            }
            if (prev <= 1) {
              window.clearInterval(intervalId)
              countdownIntervalRef.current = null
              if (!autoSubmitRef.current) {
                autoSubmitRef.current = true
                void handleStopAndSend(true)
              }
              return 0
            }
            return prev - 1
          })
        }, 1000)
        countdownIntervalRef.current = intervalId
      }
    } catch (error) {
      console.error("Speech recognition start error", error)
      setStatusMessage("Unable to start speech recognition.")
    }
  }, [audioUrl, isListening, mediaSupported, clearCountdown, handleStopAndSend, stopListening])

  const latestMessage = useMemo(() => {
    return messages[messages.length - 1]?.content ?? "Give me a strong intro with no filler words. Ready when you are."
  }, [messages])

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
    }
  }, [audioUrl])

  useEffect(() => {
    if (!liveTranscriptRef.current) {
      return
    }
    const container = liveTranscriptRef.current
    requestAnimationFrame(() => {
      container.scrollTop = container.scrollHeight
    })
  }, [transcript])

  const handleToggleArchive = useCallback(() => {
    setShowArchive((prev) => {
      const next = !prev
      if (!prev) {
        requestAnimationFrame(() => {
          archiveContentRef.current?.scrollTo({ top: 0, behavior: "smooth" })
        })
      }
      return next
    })
  }, [])

  const fillerCount = useMemo(() => {
    if (!transcript.trim()) {
      return 0
    }
    const matches = transcript.match(FILLER_REGEX)
    return matches?.length ?? 0
  }, [transcript])

  const fillerBreakdown = useMemo(() => {
    if (!transcript.trim()) {
      return []
    }
    const counts = new Map<string, number>()
    const matches = transcript.match(FILLER_REGEX)
    matches?.forEach((match) => {
      const normalized = match.trim().toLowerCase().replace(/\s+/g, " ")
      counts.set(normalized, (counts.get(normalized) ?? 0) + 1)
    })
    return Array.from(counts.entries())
      .map(([word, count]) => ({ word, count }))
      .sort((a, b) => b.count - a.count)
  }, [transcript])

  const highlightedTranscript = useMemo(() => {
    if (!transcript.trim()) {
      return null
    }

    const parts = transcript.split(
      /(\b(?:um|uh|like|so|actually|literally|basically|kinda|sorta|honestly)\b|you\s+know)/gi,
    )

    return parts.map((part, index) => {
      if (!part) {
        return null
      }

      if (part.match(FILLER_REGEX)) {
        return (
          <span
            key={`filler-${part}-${index}`}
            className="rounded-md bg-amber-200/70 px-1 font-semibold text-amber-900"
          >
            {part}
          </span>
        )
      }

      return <span key={`text-${index}`}>{part}</span>
    })
  }, [transcript])

  useEffect(() => {
    if (!transcript.trim()) {
      previousFillerCountRef.current = 0
      return
    }

    if (fillerCount > previousFillerCountRef.current) {
      const diff = fillerCount - previousFillerCountRef.current
      setStatusMessage(
        diff === 1
          ? "Caught a filler word. Reset and keep going."
          : `Caught ${diff} filler words. Sharpen that delivery.`,
      )
    }

    previousFillerCountRef.current = fillerCount
  }, [fillerCount, transcript])

  const displayCountdown = countdown ?? TIMER_DURATION
  const isCountdownActive = countdown !== null

  return (
    <CafeBackground>
      <Masthead
        title="Filler Word Detox"
        subtitle="Dial up your delivery. Slice out the ums, uhs, and likes."
        navigationSlot={
          <a
            href={ROUTES.HOME}
            onClick={(event) => {
              event.preventDefault()
              stopListening()
              router.push(ROUTES.HOME)
            }}
            className="text-sm font-medium text-white rounded-full px-6 py-2 transition-all duration-300 focus:ring-4 focus:ring-opacity-50 focus:outline-none cursor-pointer"
            style={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.3)")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.2)")}
          >
            Back to Home
          </a>
        }
      />

      <main className="mx-auto flex w-full max-w-8xl flex-1 flex-col gap-10 px-4 py-10 sm:px-6 lg:px-8">
        <section className="rounded-3xl border border-white/30 bg-white/10 p-6 shadow-[0_25px_60px_rgba(35,27,22,0.18)] backdrop-blur-xl">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="flex flex-col gap-6">
              <div className="relative overflow-hidden rounded-3xl border border-white/30 bg-white/90 p-6 shadow-2xl">
                <div className="flex flex-col items-center justify-center gap-6 text-center md:flex-row md:items-center md:justify-between md:text-left">
                  <div className="relative flex h-80 w-full flex-col items-center justify-center md:w-80">
                    <StickFigureTimer seconds={displayCountdown} isActive={isCountdownActive} />
                  </div>
                  <div className="relative flex-1 space-y-4 text-[#1F2937] md:pl-8">
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-[#1E3A8A] shadow-md">
                      <span>{isCountdownActive ? "Counting down" : "Timer armed"}</span>
                      <span className="text-[#DC2626]">•</span>
                      <span>Auto submit at zero</span>
                    </div>
                    <h2 className="text-3xl font-black leading-tight md:text-4xl">
                      Beat the filler words before the timer hits zero.
                    </h2>
                    <p className="text-base text-[#4B5563]">
                      Hit record and keep the clock alive. When it reaches zero we’ll stop, submit, and score your take
                      automatically.
                    </p>
                    {/* <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div className="rounded-2xl border border-[#D1D5DB] bg-white/80 p-4 text-left shadow-sm">
                        <p className="text-sm font-semibold uppercase tracking-widest text-[#6B7280]">
                          Time remaining
                        </p>
                        <p className="mt-2 text-2xl font-semibold text-[#111827] tabular-nums">
                          {displayCountdown}s
                        </p>
                        <p className="text-xs uppercase tracking-widest text-[#9CA3AF]">
                          auto submit at zero
                        </p>
                      </div>
                      <div className="rounded-2xl border border-[#D1D5DB] bg-white/80 p-4 text-left shadow-sm">
                        <p className="text-sm font-semibold uppercase tracking-widest text-[#6B7280]">
                          Auto submit
                        </p>
                        <p className="mt-2 text-2xl font-semibold text-[#111827]">
                          {isCountdownActive ? "Armed" : "Standing by"}
                        </p>
                        <p className="text-xs uppercase tracking-widest text-[#9CA3AF]">
                          recording must stay clean
                        </p>
                      </div>
                      <div className="rounded-2xl border border-[#D1D5DB] bg-white/80 p-4 text-left shadow-sm">
                        <p className="text-sm font-semibold uppercase tracking-widest text-[#6B7280]">
                          Fillers detected
                        </p>
                        <p className="mt-2 text-2xl font-semibold text-[#DC2626]">{fillerCount}</p>
                        <p className="text-xs uppercase tracking-widest text-[#9CA3AF]">
                          this attempt
                        </p>
                      </div>
                    </div> */}
                  </div>
                </div>
                <div className="absolute -left-12 -bottom-16 h-56 w-56 rounded-full bg-[#F59E0B]/20 blur-3xl" />
                <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[#2563EB]/20 blur-3xl" />
              </div>

              <Card>
                <div className="grid gap-6 text-left text-[#1F2937] md:grid-cols-2">
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold uppercase tracking-[0.3em] text-[#2563EB]">Countdown challenge</h3>
                    <p className="text-sm text-[#4B5563]">
                      Play “Coach Trent” in your head—stay locked in while the timer is on screen. Every filler word
                      adds penalty seconds to your run.
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 rounded-2xl border border-[#BFDBFE] bg-[#EFF6FF] p-4">
                        <span className="mt-1 inline-flex h-8 w-8 flex-none items-center justify-center rounded-full bg-[#2563EB] text-lg font-bold text-white">
                          1
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-[#1F2937]">
                            Outline a 30-second pitch about why communication matters.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 rounded-2xl border border-[#FECACA] bg-[#FEF2F2] p-4">
                        <span className="mt-1 inline-flex h-8 w-8 flex-none items-center justify-center rounded-full bg-[#DC2626] text-lg font-bold text-white">
                          2
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-[#1F2937]">
                            Explain a recent win without using “um,” “uh,” “like,” or “you know.”
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 rounded-2xl border border-[#BBF7D0] bg-[#ECFDF5] p-4">
                        <span className="mt-1 inline-flex h-8 w-8 flex-none items-center justify-center rounded-full bg-[#16A34A] text-lg font-bold text-white">
                          3
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-[#1F2937]">
                            Describe what you’re working on next while keeping momentum.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col justify-between rounded-3xl border border-[#D1D5DB] bg-white/80 p-6 shadow-sm">
                    <div className="space-y-3">
                      <div className="inline-flex items-center gap-2 rounded-full bg-[#DCFCE7] px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[#166534]">
                        Focus cues
                      </div>
                      <ul className="space-y-3 text-sm text-[#4B5563]">
                        <li>
                          <span className="font-semibold text-[#2563EB]">Breathe first.</span> Slow inhale, exhale, then
                          launch into your take.
                        </li>
                        <li>
                          <span className="font-semibold text-[#2563EB]">Anchor each sentence.</span> Close one thought
                          before jumping to the next.
                        </li>
                        <li>
                          <span className="font-semibold text-[#2563EB]">Catch yourself live.</span> If a filler word
                          slips out, pause, reset, keep going.
                        </li>
                      </ul>
                    </div>
                    <div className="mt-6 rounded-2xl border border-[#BFDBFE] bg-[#EFF6FF] p-4 text-sm text-[#1F2937]">
                      Every second you stay clean builds muscle memory. Stack streaks, then push past your longest run.
                      Timer’s ticking.
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            <div className="flex flex-col gap-6">
              <div className="flex flex-1 flex-col gap-5 rounded-3xl border border-white/40 bg-white/80 px-6 py-6 text-[#4A3F35] shadow-lg backdrop-blur">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1 text-left">
                    <h3 className="text-lg font-semibold uppercase tracking-[0.2em] text-[#5A7D66]">Live Transcript</h3>
                    <p className="text-sm text-[#4A5A52]">
                      Watch the filler words vanish as you tighten each sentence.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleToggleArchive}
                    className="inline-flex items-center gap-2 self-end rounded-full border border-[#6AA97C] px-5 py-2 text-xs font-semibold uppercase tracking-widest text-[#356B47] transition-all duration-300 hover:bg-[#E3F2E7] focus:outline-none focus:ring-4 focus:ring-[#6AA97C]/40 sm:self-auto"
                    aria-expanded={showArchive}
                  >
                    Transcript Archive
                    <span
                      className={`text-base transition-transform duration-300 ${showArchive ? "rotate-180" : ""}`}
                      aria-hidden="true"
                    >
                      ▾
                    </span>
                  </button>
                </div>
                <div className="flex-1 overflow-hidden">
                  <div
                    ref={liveTranscriptRef}
                    className="max-h-64 min-h-[200px] overflow-y-auto rounded-2xl border border-white/60 bg-white/95 p-5 text-sm text-[#4A3F35] shadow-inner"
                  >
                    {transcript.trim() ? (
                      <p className="whitespace-pre-wrap wrap-break-word leading-relaxed">{highlightedTranscript}</p>
                    ) : (
                      <p className="whitespace-pre-wrap">
                        Tap record and deliver your message without the fillers. Your words will stream here live.
                      </p>
                    )}
                  </div>
                </div>
                {!recognitionSupported ? (
                  <EmptyState
                    icon="⚠️"
                    title="Live transcription unavailable"
                    helperText="This browser does not support the Web Speech API. You can still record audio."
                    className="bg-slate-100"
                  />
                ) : null}
                {showArchive && (
                  <div
                    ref={archiveContentRef}
                    className="max-h-48 overflow-y-auto rounded-lg border border-slate-200 bg-white/70 p-4"
                  >
                    {messages.length > 0 ? (
                      messages.map((msg, index) => (
                        <div key={`${msg.role}-${index}`} className="space-y-1 pb-3 last:pb-0">
                          <p className="text-xs font-medium text-slate-500">{msg.role === "user" ? "You" : "Coach"}:</p>
                          <p className="text-sm text-slate-600 whitespace-pre-wrap wrap-break-word">{msg.content}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500">
                        No coaching history yet. Press record and send your first take.
                      </p>
                    )}
                  </div>
                )}
                <div className="rounded-2xl border border-[#6AA97C1a] bg-white/80 p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-[#5A7D66]">
                        Detected Filler Words
                      </p>
                      <p className="text-2xl font-bold text-[#356B47]">{fillerCount}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {fillerBreakdown.length > 0 ? (
                        fillerBreakdown.map(({ word, count }) => (
                          <span
                            key={word}
                            className="inline-flex items-center justify-between rounded-lg bg-[#6AA97C]/10 px-3 py-2 text-xs font-semibold text-[#356B47]"
                          >
                            <span>{word}</span>
                            <span className="ml-2 rounded-full bg-[#356B47]/10 px-2 py-0.5 text-[10px]">{count}</span>
                          </span>
                        ))
                      ) : (
                        <span className="col-span-full text-xs text-[#4A5A52]">None detected yet—keep it clean!</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-5 rounded-3xl border border-white/40 bg-white/75 px-6 py-6 text-center text-[#4A3F35] shadow-lg backdrop-blur">
                <h3 className="text-lg font-semibold uppercase tracking-[0.2em] text-[#5A7D66]">Session Controls</h3>
                <p className="text-sm text-[#4A5A52]">
                  Hit record, let the countdown auto-submit your take, and jump to your progress report when you’re
                  done.
                </p>
                <Toolbar>
                  <button
                    onClick={startListening}
                    disabled={isListening}
                    className="inline-flex items-center gap-2 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:shadow-md transition-all duration-300 active:scale-95 focus:ring-4 focus:ring-opacity-50 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                    style={{ backgroundColor: "#6AA97C" }}
                    onMouseEnter={(e) => {
                      if (!isListening) {
                        e.currentTarget.style.backgroundColor = "#5A936A"
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isListening) {
                        e.currentTarget.style.backgroundColor = "#6AA97C"
                      }
                    }}
                  >
                    <span>🎙️</span>
                    {isListening ? "Recording..." : "Start Recording"}
                  </button>

                  <button
                    onClick={handleFinish}
                    className="px-6 py-3 text-base font-medium rounded-lg border-2 transition-all duration-300 active:scale-95 focus:ring-4 focus:ring-opacity-50 focus:outline-none cursor-pointer"
                    style={{
                      borderColor: "#C5A967",
                      color: "#5F4C2B",
                      backgroundColor: "transparent",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#F6ECD3"
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent"
                    }}
                  >
                    View Progress
                  </button>

                  <span
                    className="ml-auto inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium"
                    style={
                      isListening
                        ? {
                            backgroundColor: "rgba(106, 169, 124, 0.12)",
                            color: "#356B47",
                          }
                        : {
                            backgroundColor: "rgba(95, 76, 43, 0.12)",
                            color: "#5F4C2B",
                          }
                    }
                  >
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: isListening ? "#6AA97C" : "#C5A967" }}
                    />
                    {micStatusLabel}
                  </span>
                </Toolbar>
              </div>
            </div>
          </div>
        </section>

        {/* <ToastPlaceholder message={statusMessage} /> */}
      </main>

      <audio ref={liveAudioRef} aria-hidden="true" className="hidden" muted playsInline />
    </CafeBackground>
  )
}

export default FillerWordsScreen
