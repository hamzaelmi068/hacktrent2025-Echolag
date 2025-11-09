"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Card from "../components/Card";
import EmptyState from "../components/EmptyState";
import Masthead from "../components/Masthead";
import ProgressChips from "../components/ProgressChips";
import ToastPlaceholder from "../components/ToastPlaceholder";
import Toolbar from "../components/Toolbar";
import TranscriptPanel from "../components/TranscriptPanel";
import { ROUTES } from "../lib/routes";
import { BARISTA_PLACEHOLDER } from "../lib/placeholders";
import { useConversation } from "../context/ConversationContext";

const SessionScreen = () => {
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
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);

  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const liveAudioRef = useRef<HTMLAudioElement | null>(null);
  const baristaAudioRef = useRef<HTMLAudioElement | null>(null);

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
      setStatusMessage("Listening... Speak clearly into your microphone.");
      setIsListening(true);
      setSessionStartTime(Date.now()); // Track session start time
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
    if (!assistantAudioUrl || !baristaAudioRef.current) {
      return;
    }

    const audioElement = baristaAudioRef.current;
    const playAudio = async () => {
      try {
        audioElement.load();
        audioElement.currentTime = 0;
        await audioElement.play();
      } catch (error) {
        console.warn("Autoplay prevented for barista audio.", error);
      }
    };

    playAudio();
  }, [assistantAudioUrl]);

  const handleFinish = () => {
    stopListening();
    
    // Calculate session duration
    const duration = sessionStartTime 
      ? (Date.now() - sessionStartTime) / 1000 
      : 0;
    
    // Save session data to localStorage for feedback page
    const sessionData = {
      transcript: transcript.trim(),
      duration: duration,
      audioUrl: audioUrl || null,
    };
    
    localStorage.setItem('sessionTranscript', sessionData.transcript);
    localStorage.setItem('sessionDuration', sessionData.duration.toString());
    if (sessionData.audioUrl) {
      localStorage.setItem('sessionAudioUrl', sessionData.audioUrl);
    }
    
    // Navigate to feedback with data in URL params
    const params = new URLSearchParams({
      transcript: sessionData.transcript,
      duration: sessionData.duration.toString(),
    });
    if (sessionData.audioUrl) {
      params.set('audioUrl', sessionData.audioUrl);
    }
    
    router.push(`${ROUTES.FEEDBACK}?${params.toString()}`);
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
      setStatusMessage("Processing your response...");
      await sendMessage(snapshot);
      setStatusMessage("Response processed. Continue when ready.");
    } else {
      setSavedTranscript("");
      setStatusMessage("No speech detected. Try again.");
    }
  };

  const latestMessage = useMemo(() => {
    return (
      messages[messages.length - 1]?.content ||
      "Welcome! I'll be your barista today. What can I get for you?"
    );
  }, [messages]);

  const isOrderComplete = useMemo(() => {
    return orderState.drink && orderState.size && orderState.milk && orderState.name;
  }, [orderState]);

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  return (
    <div className="flex min-h-screen flex-col" style={{ backgroundColor: '#F5F1E8' }}>
      <Masthead
        title="Session Practice"
        subtitle="Run through a sample order and track your responses."
        navigationSlot={
          <a
            href={ROUTES.HOME}
            onClick={(event) => {
              event.preventDefault();
              stopListening();
              router.push(ROUTES.HOME);
            }}
            className="text-sm font-medium text-white rounded-full px-6 py-2 transition-all duration-300 focus:ring-4 focus:ring-opacity-50 focus:outline-none cursor-pointer"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
          >
            Back to Home
          </a>
        }
      />

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        {/* Barista Card */}
        <Card>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#8B9D83' }}>
                <span className="text-white text-xl">☕</span>
              </div>
              <h2 className="text-lg font-semibold" style={{ color: '#4A3F35' }}>Barista</h2>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: '#6B5D52' }}>{latestMessage}</p>
            <div className="space-y-2">
              {speechError ? (
                <p className="text-xs text-red-600">
                  Unable to play audio: {speechError}
                </p>
              ) : null}
              {assistantAudioUrl ? (
                <audio
                  ref={baristaAudioRef}
                  src={assistantAudioUrl ?? undefined}
                  className="w-full"
                  controls
                  autoPlay
                  playsInline
                  aria-label="Barista response audio"
                />
              ) : null}
              {isSpeaking && !assistantAudioUrl ? (
                <p className="text-xs text-slate-500">
                  Brewing your barista&apos;s voice...
                </p>
              ) : null}
            </div>
          </div>
        </Card>

        {/* Transcript Card */}
        <Card>
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#8B9D83' }}>
                <span className="text-white text-xl">📝</span>
              </div>
              <h2 className="text-lg font-semibold" style={{ color: '#4A3F35' }}>Your Transcript</h2>
            </div>
            <TranscriptPanel
              title=""
              content={transcript}
              placeholderText="Start the session to see your words appear in real time."
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
                <h3 className="text-sm font-semibold text-slate-800">
                  Conversation History
                </h3>
                {messages.map((msg, i) => (
                  <div key={i} className="space-y-1">
                    <p className="text-xs font-medium text-slate-500">
                      {msg.role === "user" ? "You" : "Barista"}:
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

        {/* Recording Playback Card */}
        <Card>
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#8B9D83' }}>
                <span className="text-white text-xl">🎤</span>
              </div>
              <h2 className="text-lg font-semibold" style={{ color: '#4A3F35' }}>
                Recording Playback
              </h2>
            </div>
            {audioUrl ? (
              <audio
                controls
                className="w-full"
                src={audioUrl}
                aria-label="Session recording playback"
              />
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[300px] space-y-4">
                <div className="text-6xl mb-4">🎤</div>
                <h3 className="text-xl font-semibold" style={{ color: '#4A3F35' }}>Ready to practice?</h3>
                <p className="text-center" style={{ color: '#6B5D52' }}>Hit Start to begin!</p>
              </div>
            )}
          </div>
        </Card>
        {/* Order Checklist */}
        <section aria-labelledby="progress-heading" className="space-y-4">
          <h2 id="progress-heading" className="text-lg font-semibold" style={{ color: '#4A3F35' }}>
            Order Checklist
          </h2>
          <ProgressChips
            orderState={orderState}
          />
        </section>

        {/* Toolbar */}
        <Toolbar>
          <button
            onClick={startListening}
            disabled={isListening}
            className="inline-flex items-center gap-2 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:shadow-md transition-all duration-300 active:scale-95 focus:ring-4 focus:ring-opacity-50 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 cursor-pointer"
            style={{ backgroundColor: '#8B9D83' }}
            onMouseEnter={(e) => !isListening && (e.currentTarget.style.backgroundColor = '#7A8A6F')}
            onMouseLeave={(e) => !isListening && (e.currentTarget.style.backgroundColor = '#8B9D83')}
          >
            <span>🎤</span>
            {isListening ? "Listening..." : "Start"}
          </button>

          <button
            onClick={handleStopAndSave}
            disabled={(!isListening && !transcript.trim()) || isLoading}
            className="px-6 py-3 text-base font-medium rounded-lg border-2 transition-all duration-300 active:scale-95 focus:ring-4 focus:ring-opacity-50 focus:outline-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ 
              borderColor: '#8B7355',
              color: '#4A3F35',
              backgroundColor: 'transparent'
            }}
            onMouseEnter={(e) => {
              if (!isLoading && (isListening || transcript.trim())) {
                e.currentTarget.style.backgroundColor = '#C4D0BC';
                e.currentTarget.style.borderColor = '#8B9D83';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.borderColor = '#8B7355';
            }}
          >
            {isLoading ? "Processing..." : "Stop & Send"}
          </button>

          <button
            onClick={handleFinish}
            disabled={!isOrderComplete}
            className="px-6 py-3 text-base font-medium rounded-lg border-2 transition-all duration-300 active:scale-95 focus:ring-4 focus:ring-opacity-50 focus:outline-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ 
              borderColor: '#8B7355',
              color: '#4A3F35',
              backgroundColor: 'transparent'
            }}
            onMouseEnter={(e) => {
              if (isOrderComplete) {
                e.currentTarget.style.backgroundColor = '#C4D0BC';
                e.currentTarget.style.borderColor = '#8B9D83';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.borderColor = '#8B7355';
            }}
          >
            Finish
          </button>

          <span
            className="ml-auto inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium"
            style={isListening ? {
              backgroundColor: '#F5E6E6',
              color: '#8B5A5A'
            } : {
              backgroundColor: '#C4D0BC',
              color: '#4A3F35'
            }}
          >
            <span
              aria-hidden="true"
              className="h-2 w-2 rounded-full"
              style={{
                backgroundColor: isListening ? '#D4A574' : '#8B9D83',
                animation: isListening ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none'
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
    </div>
  );
};

export default SessionScreen;