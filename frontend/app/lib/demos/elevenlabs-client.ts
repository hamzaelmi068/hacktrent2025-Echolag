"use client";

import { useCallback, useEffect, useState } from "react";

interface VoiceSummary {
  id: string;
  name: string;
  description?: string | null;
  category?: string | null;
  labels?: Record<string, string> | null;
}

export const useElevenLabsVoices = () => {
  const [voices, setVoices] = useState<VoiceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVoices = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/elevenlabs/voices");

        if (!response.ok) {
          throw new Error(`API responded with status ${response.status}`);
        }

        const data = await response.json();
        setVoices(data.voices ?? []);
      } catch (err) {
        console.error("Failed to load ElevenLabs voices", err);
        setError("Unable to load ElevenLabs voices. See console for details.");
      } finally {
        setLoading(false);
      }
    };

    fetchVoices();
  }, []);

  return { voices, loading, error };
};

export const useTextToSpeech = () => {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const convert = useCallback(
    async ({
      voiceId,
      text,
      modelId,
      outputFormat,
    }: {
      voiceId: string;
      text: string;
      modelId?: string;
      outputFormat?: string;
    }) => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/elevenlabs/text-to-speech", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ voiceId, text, modelId, outputFormat }),
        });

        if (!response.ok) {
          const data = await response.json().catch(() => null);
          throw new Error(data?.error ?? "Request failed");
        }

        const buffer = await response.arrayBuffer();
        const blob = new Blob([buffer], { type: "audio/mpeg" });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
      } catch (err) {
        console.error("Text-to-speech request failed", err);
        setError(err instanceof Error ? err.message : "Unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    },
    [audioUrl]
  );

  const reset = useCallback(() => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setError(null);
    setLoading(false);
  }, [audioUrl]);

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  return { audioUrl, loading, error, convert, reset };
};


