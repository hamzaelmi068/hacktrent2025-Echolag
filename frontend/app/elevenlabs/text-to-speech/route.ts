"use server";

import { NextResponse } from "next/server";

import { streamTextToSpeech } from "@/lib/elevenlabs-server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { voiceId, text, modelId, outputFormat } = await request.json();

    if (typeof voiceId !== "string" || voiceId.length === 0) {
      return NextResponse.json(
        { error: "voiceId is required." },
        { status: 400 }
      );
    }

    if (typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json(
        { error: "text is required." },
        { status: 400 }
      );
    }

    const stream = await streamTextToSpeech({
      voiceId,
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
    return NextResponse.json(
      {
        error: "Unable to convert text to speech. Check server logs for details.",
      },
      { status: 500 }
    );
  }
}


