const requiredEnvVar = (key: string): string => {
  if (typeof process === "undefined") {
    throw new Error("Environment variables are not available on the client.");
  }

  const value = process.env[key];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${key}. ` +
        "Set it in your environment or via the Next.js runtime configuration."
    );
  }

  return value;
};

const isBrowser = typeof window !== "undefined";

export const getElevenLabsApiKey = (): string => {
  if (isBrowser) {
    throw new Error("ElevenLabs API key must not be accessed from the browser.");
  }

  return requiredEnvVar("ELEVENLABS_API_KEY");
};


