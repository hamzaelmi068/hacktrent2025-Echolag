export interface GeminiAnalysisResponse {
  overallSummary: string;
  strengths: string[];
  growthOpportunities: string[];
  tips: string[];
  clarityScore: number;
  pronunciationScore: number;
  fluencyScore: number;
}

/**
 * Analyze session transcript using backend API (which calls Gemini)
 */
export const analyzeSessionWithGemini = async (
  transcript: string,
  metrics: {
    duration: number;
    wordCount: number;
    averagePause: number;
    wordsPerMinute: number;
  }
): Promise<GeminiAnalysisResponse> => {
  try {
    const response = await fetch('http://localhost:3001/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transcript,
        duration: metrics.duration,
        wordCount: metrics.wordCount,
        averagePause: metrics.averagePause,
        wordsPerMinute: metrics.wordsPerMinute,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Analysis API error: ${response.status} - ${errorData}`);
    }

    const analysis = await response.json() as GeminiAnalysisResponse;
    
    // Validate and ensure scores are within range
    analysis.clarityScore = Math.max(0, Math.min(100, analysis.clarityScore || 0));
    analysis.pronunciationScore = Math.max(0, Math.min(100, analysis.pronunciationScore || 0));
    analysis.fluencyScore = Math.max(0, Math.min(100, analysis.fluencyScore || 0));
    
    return analysis;
  } catch (error) {
    console.error('Analysis API error:', error);
    throw error;
  }
};

