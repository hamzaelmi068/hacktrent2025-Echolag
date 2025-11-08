import { NextResponse } from "next/server";
import { listElevenLabsVoices } from "@/lib/elevenlabs-server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const voices = await listElevenLabsVoices();

    return NextResponse.json({
      voices: voices.map((voice) => ({
        id: voice.voice_id,
        name: voice.name,
        labels: voice.labels,
        category: voice.category,
        description: voice.description,
      })),
    });
  } catch (error) {
    console.error("Failed to fetch ElevenLabs voices", error);

    return NextResponse.json(
      {
        error: "Unable to fetch voices. Check server logs for details.",
      },
      { status: 500 }
    );
  }
}


