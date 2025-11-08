"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { startConversation, resetConversation } from "../lib/api";
import type { OrderState } from "../types/conversation";
import { ELEVENLABS_PRIMARY_VOICE_ID } from "../lib/placeholders";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ConversationContextType {
  isLoading: boolean;
  error: string | null;
  messages: Message[];
  orderState: OrderState;
  assistantAudioUrl: string | null;
  isSpeaking: boolean;
  speechError: string | null;
  sendMessage: (message: string) => Promise<void>;
  reset: () => Promise<void>;
  clearSpeech: () => void;
}

const initialOrderState: OrderState = {
  drink: false,
  size: false,
  milk: false,
  name: false,
};

const ConversationContext = createContext<ConversationContextType | undefined>(
  undefined
);

export function ConversationProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [orderState, setOrderState] = useState<OrderState>(initialOrderState);
  const [assistantAudioUrl, setAssistantAudioUrl] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);

  const clearSpeech = useCallback(() => {
    setAssistantAudioUrl((prev) => {
      if (prev) {
        URL.revokeObjectURL(prev);
      }
      return null;
    });
  }, []);

  const speakMessage = useCallback(
    async (text: string) => {
      if (!text) {
        return;
      }

      setIsSpeaking(true);
      setSpeechError(null);

      try {
        const response = await fetch("/api/elevenlabs/text-to-speech", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            voiceId: ELEVENLABS_PRIMARY_VOICE_ID,
            text,
            modelId: "eleven_multilingual_v2",
            outputFormat: "mp3_44100_128",
          }),
        });

        if (!response.ok) {
          let message = `Text-to-speech failed with status ${response.status}`;
          try {
            const data = (await response.json()) as { error?: string };
            if (data?.error) {
              message = data.error;
            }
          } catch (_) {
            // ignore JSON parse errors
          }
          throw new Error(message);
        }

        const buffer = await response.arrayBuffer();
        const blob = new Blob([buffer], { type: "audio/mpeg" });
        const url = URL.createObjectURL(blob);

        setAssistantAudioUrl((prev) => {
          if (prev) {
            URL.revokeObjectURL(prev);
          }
          return url;
        });
      } catch (err) {
        console.error("Failed to generate speech audio", err);
        setSpeechError(err instanceof Error ? err.message : "Failed to speak response.");
        clearSpeech();
      } finally {
        setIsSpeaking(false);
      }
    },
    [clearSpeech]
  );

  const sendMessage = async (message: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Add user message to chat
      setMessages((prev) => [...prev, { role: "user", content: message }]);

      // Always send backend-compatible orderState
      const response = await startConversation(message, orderState, messages);

      // If backend returns updated orderState, use it
      if (response.orderState) {
        setOrderState(response.orderState);
      }

      // Update order state and add assistant response
      const assistantMessage = response.message ?? "";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: assistantMessage },
      ]);

      void speakMessage(assistantMessage);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const reset = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await resetConversation();
      setMessages([]);
      setOrderState(initialOrderState);
      clearSpeech();
      setSpeechError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (assistantAudioUrl) {
        URL.revokeObjectURL(assistantAudioUrl);
      }
    };
  }, [assistantAudioUrl]);

  return (
    <ConversationContext.Provider
      value={{
        isLoading,
        error,
        messages,
        orderState,
        assistantAudioUrl,
        isSpeaking,
        speechError,
        sendMessage,
        reset,
        clearSpeech,
      }}
    >
      {children}
    </ConversationContext.Provider>
  );
}

export function useConversation() {
  const context = useContext(ConversationContext);
  if (context === undefined) {
    throw new Error(
      "useConversation must be used within a ConversationProvider"
    );
  }
  return context;
}
