"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Card from "../components/Card";
import CafeBackground from "../components/CafeBackground";
import BaristaSimulator from "../components/BaristaSimulator";
import EmptyState from "../components/EmptyState";
import Masthead from "../components/Masthead";
import PlayerAvatar from "../components/PlayerAvatar";
import ProgressChips from "../components/ProgressChips";
import ToastPlaceholder from "../components/ToastPlaceholder";
import Toolbar from "../components/Toolbar";
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
  const [showArchive, setShowArchive] = useState(true);

  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const liveAudioRef = useRef<HTMLAudioElement | null>(null);
  const customerAudioRef = useRef<HTMLAudioElement | null>(null);
  const archiveContentRef = useRef<HTMLDivElement | null>(null);
  const liveTranscriptRef = useRef<HTMLDivElement | null>(null);

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

  const handleTranscriptArchiveClick = useCallback(() => {
    setShowArchive((prev) => {
      const next = !prev;
      if (!prev) {
        requestAnimationFrame(() => {
          archiveContentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
        });
      }
      return next;
    });
  }, []);

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

  useEffect(() => {
    if (!liveTranscriptRef.current) {
      return;
    }
    const container = liveTranscriptRef.current;
    requestAnimationFrame(() => {
      container.scrollTop = container.scrollHeight;
    });
  }, [transcript]);

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
            className="text-sm font-medium text-white rounded-lg px-6 py-2 transition-all duration-300 focus:ring-4 focus:ring-opacity-50 focus:outline-none cursor-pointer hover:scale-110"
            style={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor =
                "rgba(255, 255, 255, 0.3)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor =
                "rgba(255, 255, 255, 0.2)")
            }
          >
            Back to Home
          </a>
        }
      />

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-4 py-10 sm:px-6 lg:px-8">
        <section className="space-y-4 rounded-3xl border border-white/30 bg-white/10 p-6 shadow-[0_25px_60px_rgba(35,27,22,0.18)] backdrop-blur-xl">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-widest text-[#5A7D66]">
                    Interactive Scenario
                  </div>
                  <h2
                    className="text-xl font-semibold"
                    style={{ color: "#324038" }}
                  >
                    2D Barista Ordering Simulator
                  </h2>
                </div>
                <p className="text-sm text-[#4A5A52] max-w-lg">
                  Move with WASD, press E at the counter, and complete the drink
                  order. Results appear once the pickup name is confirmed.
                </p>
              </div>
              <BaristaSimulator />
            </div>
            <div className="flex flex-col gap-6">
              <div className="flex flex-1 flex-col gap-5 rounded-3xl border border-white/40 bg-white/80 px-6 py-6 text-[#4A3F35] shadow-lg backdrop-blur">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1 text-left">
                    <h3 className="text-lg font-semibold uppercase tracking-[0.2em] text-[#5A7D66]">
                      Live Transcript
                    </h3>
                    <p className="text-sm text-[#4A5A52]">
                      Watch your spoken words stream into text without leaving
                      the simulator.
                    </p>
                  </div>
                  {/* <button
                    type="button"
                    onClick={handleTranscriptArchiveClick}
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
                  </button> */}
                </div>
                <div className="flex-1 overflow-hidden">
                  <div
                    ref={liveTranscriptRef}
                    className="max-h-64 min-h-[200px] overflow-y-auto rounded-2xl border border-white/60 bg-white/95 p-5 text-sm text-[#4A3F35] shadow-inner"
                  >
                    <p className="whitespace-pre-wrap">
                      {transcript.trim()
                        ? transcript
                        : "Start the mic to stream your words here in text form."}
                    </p>
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
                      messages.map((msg, i) => (
                        <div key={i} className="space-y-1 pb-3 last:pb-0">
                          <p className="text-xs font-medium text-slate-500">
                            {msg.role === "user" ? "You" : "Customer"}:
                          </p>
                          <p className="text-sm text-slate-600 whitespace-pre-wrap wrap-break-word">
                            {msg.content}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500">
                        No conversation history yet.
                      </p>
                    )}
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-5 rounded-3xl border border-white/40 bg-white/75 px-6 py-6 text-center text-[#4A3F35] shadow-lg backdrop-blur">
                <h3 className="text-lg font-semibold uppercase tracking-[0.2em] text-[#5A7D66]">
                  Session Controls
                </h3>
                <p className="text-sm text-[#4A5A52]">
                  Start recording, send the transcript, or finish your session
                  without leaving the simulator view.
                </p>
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
                    className="inline-flex items-center gap-2 px-6 py-3 text-base font-medium rounded-lg border-2 transition-all duration-300 active:scale-95 focus:ring-4 focus:ring-opacity-50 focus:outline-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
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
                      style={{
                        backgroundColor: isListening ? "#6AA97C" : "#C5A967",
                      }}
                    />
                    Mic is {isListening ? "ON" : "OFF"}
                  </span>
                </Toolbar>
              </div>
            </div>
          </div>
        </section>

        {/* <ToastPlaceholder message={statusMessage} /> */}
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
