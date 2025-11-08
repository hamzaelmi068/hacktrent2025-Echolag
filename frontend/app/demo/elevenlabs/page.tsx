"use client";

import { useEffect, useMemo, useState } from "react";

import PrimaryButton from "@/app/components/PrimaryButton";
import SectionHeading from "@/app/components/SectionHeading";
import {
  useElevenLabsVoices,
  useTextToSpeech,
} from "@/app/lib/demos/elevenlabs-client";
import { ELEVENLABS_PRIMARY_VOICE_ID } from "@/app/lib/placeholders";

const ElevenLabsDemoPage = () => {
  const { voices, loading: voicesLoading, error: voicesError } = useElevenLabsVoices();
  const { audioUrl, loading: ttsLoading, error: ttsError, convert, reset } =
    useTextToSpeech();

  const [selectedVoiceId, setSelectedVoiceId] = useState("");
  const [text, setText] = useState(
    "Welcome to EchoLag. Let's practice that matcha order!"
  );

  const sortedVoices = useMemo(() => {
    if (voices.length === 0) {
      return voices;
    }

    return [...voices].sort((a, b) => {
      if (a.id === ELEVENLABS_PRIMARY_VOICE_ID) return -1;
      if (b.id === ELEVENLABS_PRIMARY_VOICE_ID) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [voices]);

  useEffect(() => {
    if (voicesLoading || voices.length === 0) {
      return;
    }

    const preferred = voices.find((voice) => voice.id === ELEVENLABS_PRIMARY_VOICE_ID);
    const fallback = voices[0];
    const resolved = preferred ?? fallback;

    if (resolved && resolved.id !== selectedVoiceId) {
      setSelectedVoiceId(resolved.id);
    }
  }, [voicesLoading, voices, selectedVoiceId]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedVoiceId || text.trim().length === 0) {
      return;
    }
    await convert({ voiceId: selectedVoiceId, text });
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <SectionHeading
        title="ElevenLabs Text-to-Speech Demo"
        subtitle="Convert practice scripts into narrated audio via Next.js API routes."
      />

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        {voicesLoading ? (
          <p className="text-sm text-slate-600">Loading voices…</p>
        ) : voicesError ? (
          <p className="text-sm text-red-600">{voicesError}</p>
        ) : (
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label htmlFor="voice-select" className="text-sm font-medium text-slate-700">
                Voice
              </label>
              <select
                id="voice-select"
                name="voice"
                value={selectedVoiceId}
                onChange={(event) => setSelectedVoiceId(event.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-indigo-600"
              >
                <option value="">Select a voice…</option>
                {sortedVoices.map((voice) => (
                  <option key={voice.id} value={voice.id}>
                    {voice.name}
                  </option>
                ))}
              </select>
              {selectedVoiceId ? (
                <p className="text-xs text-slate-500">
                  Voice ID: <code className="font-mono">{selectedVoiceId}</code>
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label htmlFor="tts-text" className="text-sm font-medium text-slate-700">
                Text to convert
              </label>
              <textarea
                id="tts-text"
                name="text"
                value={text}
                onChange={(event) => setText(event.target.value)}
                rows={4}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-indigo-600"
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <PrimaryButton
                label={ttsLoading ? "Generating…" : "Generate audio"}
                type="submit"
                disabled={!selectedVoiceId || text.trim().length === 0 || ttsLoading}
              />
              {audioUrl ? (
                <PrimaryButton
                  label="Reset"
                  variant="neutral"
                  onClick={reset}
                  type="button"
                />
              ) : null}
            </div>

            {ttsError ? <p className="text-sm text-red-600">{ttsError}</p> : null}
          </form>
        )}
      </div>

      {audioUrl ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <SectionHeading
            title="Generated Audio"
            subtitle="Playback the ElevenLabs response."
          />
          <audio
            className="mt-4 w-full"
            controls
            src={audioUrl}
            aria-label="Generated speech preview"
          />
        </div>
      ) : null}
    </div>
  );
};

export default ElevenLabsDemoPage;

