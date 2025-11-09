export const HERO_TAGLINE =
  "Practice drive-thru conversations before you step behind the counter.";

export const BARISTA_PLACEHOLDER =
  "Welcome in! What can I get started for you today?";

export const TIPS_PLACEHOLDERS = [
  "Keep your greeting upbeat and clear.",
  "Pause briefly after each question to let the guest respond.",
  "Mirror the guest’s order back to confirm accuracy.",
] as const;

export const ELEVENLABS_PRIMARY_VOICE_ID = "zZLmKvCp1i04X8E0FJ8B";

export const ELEVENLABS_VOICE_PLACEHOLDERS = [
  {
    id: ELEVENLABS_PRIMARY_VOICE_ID,
    voice_id: ELEVENLABS_PRIMARY_VOICE_ID,
    name: "Callum",
    description: "Callum is a youthful, energetic voice suited for lively training simulations.",
    category: "default",
    labels: {
      source: "elevenlabs",
      persona: "callum",
    },
  },
] as const;

