export interface GeminiAnalysisResponse {
  overallSummary: string;
  strengths: string[];
  growthOpportunities: string[];
  tips: string[];
  clarityScore: number;
  pronunciationScore: number;
  fluencyScore: number;
  averageScore: number;
}

/**
 * Analyze session transcript using backend API (which calls Gemini)
 */
export const analyzeSessionWithGemini = async (
  transcript: string,
  metrics: {
    duration: number;
    wordCount: number;
    wordsPerMinute: number;
  }
): Promise<GeminiAnalysisResponse> => {
  try {
    const response = await fetch('http://localhost:3001/api/analyze-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transcript,
        duration: metrics.duration,
        wordCount: metrics.wordCount,
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
    analysis.averageScore = Math.max(
      0,
      Math.min(
        100,
        Math.round(
          (analysis.clarityScore + analysis.pronunciationScore + analysis.fluencyScore) / 3
        )
      )
    );
    
    return analysis;
  } catch (error) {
    console.error('Analysis API error:', error);
    throw error;
  }
};

