"use client";

import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Card from "../components/Card";
import CafeBackground from "../components/CafeBackground";
import BaristaSimulator from "../components/BaristaSimulator";
import EmptyState from "../components/EmptyState";
import Masthead from "../components/Masthead";
import PlayerAvatar from "../components/PlayerAvatar";
import ProgressChips from "../components/ProgressChips";
import ToastPlaceholder from "../components/ToastPlaceholder";
import Toolbar from "../components/Toolbar";
import TranscriptPanel from "../components/TranscriptPanel";
import { useConversation } from "../context/ConversationContext";
import { ROUTES } from "../lib/routes";

const CUSTOMER_GREETING =
  "Hi there! I'm in a bit of a rush—can I grab a double caramel macchiato with oat milk?";

const CustomerSessionScreen = () => {
  const router = useRouter();
  const {
    messages,
    orderState,
    sendMessage,
    isLoading,
    assistantAudioUrl,
    isSpeaking,
    speechError,
  } = useConversation();

  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recognitionSupported, setRecognitionSupported] = useState(true);
  const [mediaSupported, setMediaSupported] = useState(true);
  const [savedTranscript, setSavedTranscript] = useState<string | null>(null);

  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const liveAudioRef = useRef<HTMLAudioElement | null>(null);
  const customerAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      setRecognitionSupported(false);
      setMediaSupported(false);
      return;
    }

    const hasMedia = Boolean(navigator.mediaDevices?.getUserMedia);
    const SpeechRecognitionConstructor =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    setMediaSupported(hasMedia);
    setRecognitionSupported(Boolean(SpeechRecognitionConstructor));
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      } catch (err) {
        console.error("Error stopping recognition", err);
      }
    }

    if (mediaRecorderRef.current) {
      try {
        if (mediaRecorderRef.current.state !== "inactive") {
          mediaRecorderRef.current.stop();
        }
      } catch (error) {
        console.error("Error stopping recorder", error);
      }
      mediaRecorderRef.current.ondataavailable = null;
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    if (liveAudioRef.current) {
      liveAudioRef.current.srcObject = null;
    }

    setIsListening(false);
    setStatusMessage("Session stopped. You can restart when ready.");
  }, []);

  const startListening = useCallback(async () => {
    if (isListening) {
      return;
    }

    if (!mediaSupported) {
      setStatusMessage("Microphone access is not supported in this browser.");
      return;
    }

    if (typeof window === "undefined") {
      setStatusMessage("Speech features are unavailable in this environment.");
      return;
    }

    const SpeechRecognitionConstructor =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionConstructor) {
      setRecognitionSupported(false);
      setStatusMessage("Live transcription is not supported in this browser.");
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      mediaStreamRef.current = stream;
      audioChunksRef.current = [];
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
      }

      setSavedTranscript(null);
      if (typeof window !== "undefined") {
        (window as any).localStream = stream;
      }

      if (liveAudioRef.current) {
        liveAudioRef.current.srcObject = stream;
        liveAudioRef.current.autoplay = true;
        liveAudioRef.current.muted = true;
        liveAudioRef.current.play().catch((error) => {
          console.warn(
            "Autoplay prevented. Audio will remain muted until user interacts.",
            error
          );
        });
      }
    } catch (error) {
      console.error("Microphone permission error", error);
      setStatusMessage(
        "Microphone permission was denied. Please allow access to record."
      );
      return;
    }

    let recognition = recognitionRef.current;

    if (SpeechRecognitionConstructor) {
      if (!recognition) {
        recognition = new SpeechRecognitionConstructor();
        recognitionRef.current = recognition;
      }

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event: any) => {
        let combined = "";
        for (let i = 0; i < event.results.length; i += 1) {
          combined += event.results[i][0].transcript;
        }
        setTranscript(combined.trim());
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event);
        setRecognitionSupported(false);
        setStatusMessage(
          event.error === "not-allowed"
            ? "Speech recognition permission denied."
            : "Speech recognition error occurred."
        );
        stopListening();
      };

      recognition.onend = () => {
        setIsListening(false);
        setStatusMessage("Session stopped. You can restart when ready.");
      };

      try {
        recognition.start();
      } catch (error) {
        console.error("Speech recognition start error", error);
        setStatusMessage("Unable to start speech recognition.");
      }
    }

    if (
      mediaStreamRef.current &&
      typeof window !== "undefined" &&
      window.MediaRecorder
    ) {
      const recorder = new window.MediaRecorder(mediaStreamRef.current);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event: BlobEvent) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        if (audioChunksRef.current.length > 0) {
          const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
          const url = URL.createObjectURL(blob);
          audioChunksRef.current = [];
          setAudioUrl(url);
        }
      };

      try {
        recorder.start();
      } catch (error) {
        console.error("MediaRecorder start error", error);
        setStatusMessage("Unable to record audio preview.");
      }
    } else if (
      typeof window !== "undefined" &&
      typeof window.MediaRecorder === "undefined"
    ) {
      setStatusMessage("Recording preview is not supported in this browser.");
    }

    try {
      setTranscript("");
      setStatusMessage("Listening... Your response will appear live.");
      setIsListening(true);
    } catch (error) {
      console.error("Speech recognition start error", error);
      setStatusMessage("Unable to start speech recognition.");
    }
  }, [audioUrl, isListening, mediaSupported, stopListening]);

  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  useEffect(() => {
    if (!assistantAudioUrl || !customerAudioRef.current) {
      return;
    }

    const audioElement = customerAudioRef.current;
    const playAudio = async () => {
      try {
        audioElement.load();
        audioElement.currentTime = 0;
        await audioElement.play();
      } catch (error) {
        console.warn("Autoplay prevented for customer audio.", error);
      }
    };

    playAudio();
  }, [assistantAudioUrl]);

  const handleFinish = () => {
    stopListening();
    router.push(ROUTES.FEEDBACK);
  };

  const micStatusLabel = useMemo(() => {
    if (!mediaSupported) {
      return "Microphone unavailable";
    }
    if (isListening) {
      return "Mic is ON";
    }
    return "Mic is OFF";
  }, [isListening, mediaSupported]);

  const handleStopAndSave = async () => {
    const snapshot = transcript.trim();
    stopListening();
    if (snapshot) {
      setSavedTranscript(snapshot);
      setStatusMessage("Sending your response to the customer...");
      await sendMessage(snapshot);
      setStatusMessage("Response sent. Continue the conversation when ready.");
    } else {
      setSavedTranscript("");
      setStatusMessage("No speech detected. Try again.");
    }
  };

  const latestMessage = useMemo(() => {
    return (
      messages[messages.length - 1]?.content ||
      "Hi! I'm ready whenever you are. What's the status of my drink?"
    );
  }, [messages]);

  const isOrderComplete = useMemo(() => {
    return orderState?.completed ?? false;
  }, [orderState]);

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const liveBubbleText = transcript.trim()
    ? transcript
    : "Start speaking and your words will appear here in real time.";

  return (
    <CafeBackground>
      <Masthead
        title="Customer Rush Practice"
        subtitle="Handle a busy guest while keeping the conversation friendly."
        navigationSlot={
          <a
            href={ROUTES.HOME}
            onClick={(event) => {
              event.preventDefault();
              stopListening();
              router.push(ROUTES.HOME);
            }}
            className="text-sm font-medium text-white rounded-full px-6 py-2 transition-all duration-300 focus:ring-4 focus:ring-opacity-50 focus:outline-none cursor-pointer"
            style={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.3)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.2)")
            }
          >
            Back to Home
          </a>
        }
      />

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-4 py-10 sm:px-6 lg:px-8">
        <section className="space-y-4 rounded-3xl border border-white/30 bg-white/10 p-6 shadow-[0_25px_60px_rgba(35,27,22,0.18)] backdrop-blur-xl">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest text-[#5A7D66]">
                Interactive Scenario
              </div>
              <h2 className="text-xl font-semibold" style={{ color: "#324038" }}>
                2D Barista Ordering Simulator
              </h2>
            </div>
            <p className="text-sm text-[#4A5A52] max-w-lg">
              Move with WASD, press E at the counter, and complete the drink order. Results appear once the pickup
              name is confirmed.
            </p>
          </div>
          <BaristaSimulator />
        </section>

        <section className="relative overflow-hidden rounded-3xl border border-white/40 bg-white/5 p-8 shadow-[0_25px_60px_rgba(35,27,22,0.18)] backdrop-blur-xl">
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#3F2A1F]/40 to-transparent" />
          <div className="relative flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-3 rounded-full bg-white/80 px-4 py-2 shadow-sm">
                <span className="text-2xl">😊</span>
                <span className="text-sm font-semibold uppercase tracking-wide text-[#6B5D52]">
                  Customer
                </span>
              </div>
              <div className="max-w-xl rounded-3xl border border-white/60 bg-white/90 px-6 py-5 shadow-lg">
                <p
                  className="text-base font-medium leading-relaxed"
                  style={{ color: "#4A3F35" }}
                >
                  {CUSTOMER_GREETING}
                </p>
              </div>
            </div>

            <div className="relative flex flex-col items-center gap-6 md:items-end">
              <div className="relative">
                <PlayerAvatar mood={transcript ? "focused" : "neutral"} />
                <div className="absolute -left-10 -top-8 md:-left-12">
                  <div className="rounded-3xl border border-emerald-100 bg-emerald-50/95 px-5 py-4 text-sm font-semibold leading-relaxed text-emerald-900 shadow-lg md:max-w-xs">
                    {liveBubbleText}
                  </div>
                  <span
                    className="absolute left-14 top-full h-6 w-6 -translate-y-2 rotate-45 border-b border-r border-emerald-100 bg-emerald-50/95"
                    aria-hidden="true"
                  />
                </div>
              </div>
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                Live Barista Response
              </p>
            </div>
          </div>
        </section>

        <Card>
          <div className="space-y-4">
            <h3
              className="text-lg font-semibold"
              style={{ color: "#4A3F35" }}
            >
              Customer Audio & Responses
            </h3>
            <p className="text-sm text-slate-600">
              Listen back to the customer&apos;s latest request and keep the
              dialogue flowing.
            </p>

            <div className="space-y-2">
              {speechError ? (
                <p className="text-xs text-red-600">
                  Unable to play audio: {speechError}
                </p>
              ) : null}
              {assistantAudioUrl ? (
                <audio
                  ref={customerAudioRef}
                  src={assistantAudioUrl ?? undefined}
                  className="w-full"
                  controls
                  autoPlay
                  playsInline
                  aria-label="Customer response audio"
                />
              ) : null}
              {isSpeaking && !assistantAudioUrl ? (
                <p className="text-xs text-slate-500">
                  Brewing the customer&apos;s next line...
                </p>
              ) : null}
            </div>

            <div className="rounded-lg border border-slate-200 bg-white/80 p-4">
              <h4 className="text-sm font-semibold text-slate-800">
                Latest Customer Message
              </h4>
              <p className="mt-2 text-sm text-slate-600">{latestMessage}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg text-xl"
                style={{ backgroundColor: "#8B9D83" }}
              >
                🗒️
              </div>
              <h3
                className="text-lg font-semibold"
                style={{ color: "#4A3F35" }}
              >
                Transcript Archive
              </h3>
            </div>
            <TranscriptPanel
              title=""
              content={transcript}
              placeholderText="Start the mic to stream your words here in text form."
            />
            {!recognitionSupported ? (
              <EmptyState
                icon="⚠️"
                title="Live transcription unavailable"
                helperText="This browser does not support the Web Speech API. You can still record audio."
                className="bg-slate-100"
              />
            ) : null}
            {messages.length > 0 && (
              <div className="space-y-4 rounded-lg border border-slate-200 bg-white/70 p-4">
                <h4 className="text-sm font-semibold text-slate-800">
                  Conversation History
                </h4>
                {messages.map((msg, i) => (
                  <div key={i} className="space-y-1">
                    <p className="text-xs font-medium text-slate-500">
                      {msg.role === "user" ? "You" : "Customer"}:
                    </p>
                    <p className="text-sm text-slate-600 break-words whitespace-pre-wrap">
                      {msg.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        <Card>
          <div className="space-y-4">
            <h3
              className="text-lg font-semibold"
              style={{ color: "#4A3F35" }}
            >
              Playback
            </h3>
            {audioUrl ? (
              <audio
                controls
                className="w-full"
                src={audioUrl}
                aria-label="Session recording playback"
              />
            ) : (
              <div className="flex min-h-[220px] flex-col items-center justify-center space-y-4">
                <div className="text-5xl">🎧</div>
                <p
                  className="text-sm text-center"
                  style={{ color: "#6B5D52" }}
                >
                  Your recorded responses will appear here once you stop the mic.
                </p>
              </div>
            )}
          </div>
        </Card>

        <section aria-labelledby="customer-progress-heading" className="space-y-4">
          <h3
            id="customer-progress-heading"
            className="text-lg font-semibold"
            style={{ color: "#4A3F35" }}
          >
            Guest Satisfaction Checklist
          </h3>
          <ProgressChips
            currentStep={orderState?.currentStep ?? 0}
            orderItems={orderState?.orderItems ?? []}
            completed={orderState?.completed ?? false}
          />
        </section>

        <Toolbar>
          <button
            onClick={startListening}
            disabled={isListening}
            className="inline-flex items-center gap-2 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:shadow-md transition-all duration-300 active:scale-95 focus:ring-4 focus:ring-opacity-50 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            style={{ backgroundColor: "#6AA97C" }}
            onMouseEnter={(e) => {
              if (!isListening) {
                e.currentTarget.style.backgroundColor = "#5A936A";
              }
            }}
            onMouseLeave={(e) => {
              if (!isListening) {
                e.currentTarget.style.backgroundColor = "#6AA97C";
              }
            }}
          >
            <span>🎙️</span>
            {isListening ? "Listening..." : "Start Talking"}
          </button>

          <button
            onClick={handleStopAndSave}
            disabled={(!isListening && !transcript.trim()) || isLoading}
            className="px-6 py-3 text-base font-medium rounded-lg border-2 transition-all duration-300 active:scale-95 focus:ring-4 focus:ring-opacity-50 focus:outline-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            style={{
              borderColor: "#6AA97C",
              color: "#356B47",
              backgroundColor: "transparent",
            }}
            onMouseEnter={(e) => {
              if (!isLoading && (isListening || transcript.trim())) {
                e.currentTarget.style.backgroundColor = "#E3F2E7";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            {isLoading ? "Processing..." : "Stop & Send"}
          </button>

          <button
            onClick={handleFinish}
            disabled={!isOrderComplete}
            className="px-6 py-3 text-base font-medium rounded-lg border-2 transition-all duration-300 active:scale-95 focus:ring-4 focus:ring-opacity-50 focus:outline-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            style={{
              borderColor: "#C5A967",
              color: "#5F4C2B",
              backgroundColor: "transparent",
            }}
            onMouseEnter={(e) => {
              if (isOrderComplete) {
                e.currentTarget.style.backgroundColor = "#F6ECD3";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            Finish Scenario
          </button>

          <span
            className="ml-auto inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium"
            style={
              isListening
                ? {
                    backgroundColor: "#E5F6EC",
                    color: "#2F855A",
                  }
                : {
                    backgroundColor: "#F2EADF",
                    color: "#6B5D52",
                  }
            }
          >
            <span
              aria-hidden="true"
              className="h-2 w-2 rounded-full"
              style={{
                backgroundColor: isListening ? "#48BB78" : "#9C7C5B",
                animation: isListening
                  ? "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite"
                  : "none",
              }}
            />
            {micStatusLabel}
          </span>
        </Toolbar>

        <ToastPlaceholder message={statusMessage} />
      </main>

      <audio
        ref={liveAudioRef}
        aria-hidden="true"
        className="hidden"
        muted
        playsInline
      />
    </CafeBackground>
  );
};

export default CustomerSessionScreen;

