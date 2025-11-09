export interface SpeechMetrics {
  wordCount: number;
  wordsPerMinute: number;
  averagePauseDuration: number;
  totalDuration: number; // in seconds
  pauseCount: number;
}

/**
 * Calculate speech metrics from transcript and audio duration
 */
export const calculateSpeechMetrics = (
  transcript: string,
  audioDurationSeconds: number
): SpeechMetrics => {
  // Calculate word count
  const words = transcript.trim().split(/\s+/).filter(word => word.length > 0);
  const wordCount = words.length;

  // Estimate pauses from transcript (simple heuristic: multiple spaces or punctuation)
  const pausePatterns = transcript.match(/[.!?]\s+|\s{2,}/g) || [];
  const pauseCount = pausePatterns.length;

  // Calculate average pause duration (estimate: 0.5-1.5 seconds per pause)
  // If we have audio duration, we can estimate pauses better
  const speakingTime = audioDurationSeconds > 0 
    ? Math.max(audioDurationSeconds * 0.7, wordCount * 0.1) // Assume 70% speaking, 30% pauses
    : wordCount * 0.1; // Fallback: ~0.1 seconds per word
  const totalPauseTime = audioDurationSeconds > 0 
    ? Math.max(0, audioDurationSeconds - speakingTime)
    : pauseCount * 0.8; // Estimate 0.8s per pause
  const averagePauseDuration = pauseCount > 0 ? totalPauseTime / pauseCount : 0;

  // Calculate WPM
  const wordsPerMinute = audioDurationSeconds > 0 && audioDurationSeconds < 3600
    ? Math.round((wordCount / audioDurationSeconds) * 60)
    : wordCount > 0
    ? Math.round((wordCount / Math.max(speakingTime, 1)) * 60)
    : 0;

  return {
    wordCount,
    wordsPerMinute,
    averagePauseDuration: Math.round(averagePauseDuration * 10) / 10, // Round to 1 decimal
    totalDuration: Math.round(audioDurationSeconds),
    pauseCount,
  };
};

/**
 * Format duration in seconds to MM:SS format
 */
export const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

