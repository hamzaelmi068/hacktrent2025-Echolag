"use server";

import { cache } from "react";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

import { getElevenLabsApiKey } from "./env";

const createClient = cache(() => {
  const apiKey = getElevenLabsApiKey();

  return new ElevenLabsClient({
    apiKey,
    environment: "https://api.elevenlabs.io",
  });
});

export const listElevenLabsVoices = async () => {
  const client = createClient();
  const response = await client.voices.getAll();

  return response.voices;
};

export const streamTextToSpeech = async ({
  voiceId,
  text,
  modelId = "eleven_multilingual_v2",
  outputFormat = "mp3_44100_128",
}: {
  voiceId: string;
  text: string;
  modelId?: string;
  outputFormat?: string;
}) => {
  const client = createClient();

  return client.textToSpeech.stream(voiceId, {
    text,
    modelId,
    outputFormat,
  });
};
