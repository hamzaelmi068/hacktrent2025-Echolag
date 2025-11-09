import { model } from '../config/gemini';

export interface AnalysisRequest {
  transcript: string;
  duration: number;
  wordCount: number;
  wordsPerMinute: number;
}

export interface AnalysisResponse {
  overallSummary: string;
  strengths: string[];
  growthOpportunities: string[];
  tips: string[];
  clarityScore: number;
  pronunciationScore: number;
  fluencyScore: number;
  averageScore: number;
}

const clampScore = (value: unknown): number => {
  const numeric = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(numeric)) {
    return 0;
  }
  return Math.max(0, Math.min(100, Math.round(numeric)));
};

const normalizeStringArray = (value: unknown, desiredLength: number): string[] => {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === 'string' ? item.trim() : ''))
      .filter(Boolean)
      .slice(0, desiredLength);
  }
  return [];
};

const sanitizeGeminiResponse = (rawText: string): string => {
  let text = rawText.trim();

  if (text.startsWith('```')) {
    text = text.replace(/```json?/g, '').replace(/```/g, '').trim();
  }

  // Remove trailing characters after JSON object if necessary
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1) {
    text = text.slice(firstBrace, lastBrace + 1);
  }

  return text;
};

export const analyzeSessionWithGemini = async (
  request: AnalysisRequest
): Promise<AnalysisResponse> => {
  const prompt = `Analyze this barista practice session:
- Transcript: "${request.transcript}"
- Duration: ${request.duration}s, Words: ${request.wordCount}, Words Per Minute: ${request.wordsPerMinute}

Return ONLY valid JSON (no markdown):
{
  "overallSummary": "2-3 sentences",
  "strengths": ["specific thing 1", "specific thing 2", "specific thing 3"],
  "growthOpportunities": ["actionable improvement 1", "2", "3"],
  "tips": ["practical tip 1", "2", "3", "4", "5"],
  "clarityScore": 0-100,
  "pronunciationScore": 0-100,
  "fluencyScore": 0-100
}

Focus: customer service, confidence, professionalism, clarity.
Be encouraging and specific. Reference transcript examples.`;

  try {
    const result = await model.generateContent([prompt]);
    const response = await result.response;
    const rawText = response.text();

    const cleaned = sanitizeGeminiResponse(rawText);
    const parsed = JSON.parse(cleaned) as Partial<AnalysisResponse>;

    const clarityScore = clampScore(parsed.clarityScore);
    const pronunciationScore = clampScore(parsed.pronunciationScore);
    const fluencyScore = clampScore(parsed.fluencyScore);

    const averageScore = Math.round(
      (clarityScore + pronunciationScore + fluencyScore) / 3
    );

    return {
      overallSummary: parsed.overallSummary ?? '',
      strengths: normalizeStringArray(parsed.strengths, 3),
      growthOpportunities: normalizeStringArray(parsed.growthOpportunities, 3),
      tips: normalizeStringArray(parsed.tips, 5),
      clarityScore,
      pronunciationScore,
      fluencyScore,
      averageScore,
    };
  } catch (error) {
    console.error('Gemini analysis error:', error);
    throw error;
  }
};

