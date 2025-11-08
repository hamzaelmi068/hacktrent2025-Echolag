import { NextResponse } from "next/server";
import { listElevenLabsVoices } from "@/lib/elevenlabs-server";
import {
  ELEVENLABS_PRIMARY_VOICE_ID,
  ELEVENLABS_VOICE_PLACEHOLDERS,
} from "@/app/lib/placeholders";

export const dynamic = "force-dynamic";

const mapVoice = (voice: {
  voice_id?: string;
  id?: string;
  name: string;
  description?: string | null;
  category?: string | null;
  labels?: Record<string, string> | null;
}) => {
  const resolvedId =
    typeof voice.voice_id === "string" && voice.voice_id.length > 0
      ? voice.voice_id
      : typeof voice.id === "string" && voice.id.length > 0
      ? voice.id
      : null;

  if (!resolvedId) {
    throw new Error(
      `[ElevenLabs] Voice "${voice.name}" is missing both voice_id and id. Unable to expose this voice in the demo list.`
    );
  }

  return {
    id: resolvedId,
    name: voice.name,
    description: voice.description,
    category: voice.category,
    labels: voice.labels,
  };
};

const buildFallbackPayload = (reason: string) => {
  console.warn("[ElevenLabs] Falling back to demo voices:", reason);

  return NextResponse.json({
    voices: ELEVENLABS_VOICE_PLACEHOLDERS.map(mapVoice),
    fallback: true,
    message: reason,
  });
};

export async function GET() {
  if (!process.env.ELEVENLABS_API_KEY) {
    return buildFallbackPayload("API key is not configured.");
  }

  try {
    const voices = await listElevenLabsVoices();

    const primaryVoice =
      voices.find(
        (voice) =>
          voice.voice_id === ELEVENLABS_PRIMARY_VOICE_ID ||
          (voice as { id?: string }).id === ELEVENLABS_PRIMARY_VOICE_ID
      ) ??
      voices.find((voice) => voice.name.toLowerCase() === "callum");

    if (!primaryVoice) {
      return buildFallbackPayload("Primary ElevenLabs voice not available.");
    }

    try {
      return NextResponse.json({
        voices: [mapVoice(primaryVoice)],
      });
    } catch (mappingError) {
      console.error("Failed to normalize primary ElevenLabs voice", mappingError);
      return buildFallbackPayload("Primary ElevenLabs voice missing an ID.");
    }
  } catch (error) {
    console.error("Failed to fetch ElevenLabs voices", error);

    return buildFallbackPayload("Live ElevenLabs request failed. Using demo data.");
  }
}


