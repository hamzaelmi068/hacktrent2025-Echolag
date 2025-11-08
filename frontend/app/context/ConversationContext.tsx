"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { startConversation, resetConversation } from "../lib/api";
import type { OrderState, ConversationResponse } from "../types/conversation";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ConversationContextType {
  isLoading: boolean;
  error: string | null;
  messages: Message[];
  orderState: OrderState;
  sendMessage: (message: string) => Promise<void>;
  reset: () => Promise<void>;
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
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response.message },
      ]);
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ConversationContext.Provider
      value={{
        isLoading,
        error,
        messages,
        orderState,
        sendMessage,
        reset,
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
