import { NextResponse } from "next/server";

import { ELEVENLABS_PRIMARY_VOICE_ID } from "@/app/lib/placeholders";
import { streamTextToSpeech } from "@/lib/elevenlabs-server";

type ElevenLabsError = Error & {
  statusCode?: number;
  body?: unknown;
};

const buildErrorResponse = (message: string, status: number) =>
  NextResponse.json({ error: message }, { status });

const extractErrorDetails = (error: ElevenLabsError) => {
  if (error.body && typeof error.body === "object") {
    const detail = (error.body as { detail?: { message?: string } }).detail;
    if (detail?.message) {
      return detail.message;
    }
  }

  return error.message || "Unexpected error from ElevenLabs.";
};

export async function POST(request: Request) {
  try {
    if (!process.env.ELEVENLABS_API_KEY) {
      return buildErrorResponse(
        "ElevenLabs is not configured. Set ELEVENLABS_API_KEY to enable text-to-speech.",
        503
      );
    }

    const { voiceId, text, modelId, outputFormat } = await request.json();

    if (typeof voiceId !== "string" || voiceId.length === 0) {
      return buildErrorResponse("voiceId is required.", 400);
    }

    const normalizedVoiceId =
      voiceId.trim().toLowerCase() === "callum"
        ? ELEVENLABS_PRIMARY_VOICE_ID
        : voiceId.trim();

    if (typeof text !== "string" || text.trim().length === 0) {
      return buildErrorResponse("text is required.", 400);
    }

    const stream = await streamTextToSpeech({
      voiceId: normalizedVoiceId,
      text,
      modelId,
      outputFormat,
    });

    return new Response(stream as unknown as ReadableStream, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    console.error("Text-to-speech conversion failed", error);

    const elevenLabsError = error as ElevenLabsError;
    const status =
      typeof elevenLabsError.statusCode === "number" && elevenLabsError.statusCode >= 400
        ? elevenLabsError.statusCode
        : 500;
    const message = extractErrorDetails(elevenLabsError);

    return buildErrorResponse(message, status);
  }
}


