import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is required');
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ 
  model: 'gemini-2.0-flash-exp'
});

export interface AnalysisRequest {
  transcript: string;
  duration: number;
  wordCount: number;
  averagePause: number;
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
}

export const analyzeSessionWithGemini = async (
  request: AnalysisRequest
): Promise<AnalysisResponse> => {
  const prompt = `Analyze this barista practice session transcript and provide detailed feedback:

Transcript: ${request.transcript}

Duration: ${request.duration} seconds
Word Count: ${request.wordCount}
Average Pause: ${request.averagePause} seconds
Words Per Minute: ${request.wordsPerMinute}

Provide a JSON response with:
1. overallSummary: Brief 2-3 sentence assessment of performance
2. strengths: Array of 2-3 specific things done well
3. growthOpportunities: Array of 2-3 specific areas to improve with actionable advice
4. tips: Array of 3-5 practical tips for better barista communication
5. clarityScore: Score 0-100 for speech clarity
6. pronunciationScore: Score 0-100 for pronunciation
7. fluencyScore: Score 0-100 for fluency

Focus on: clarity, confidence, friendliness, professional terminology, customer engagement.

Return ONLY valid JSON in this exact format:
{
  "overallSummary": "string",
  "strengths": ["string", "string"],
  "growthOpportunities": ["string", "string"],
  "tips": ["string", "string", "string"],
  "clarityScore": number,
  "pronunciationScore": number,
  "fluencyScore": number
}`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Parse JSON from response (might be wrapped in markdown)
    let jsonText = text.trim();
    
    // Remove markdown code blocks if present
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '').replace(/```\n?/g, '');
    }

    const analysis = JSON.parse(jsonText) as AnalysisResponse;

    // Validate and ensure scores are within range
    analysis.clarityScore = Math.max(0, Math.min(100, analysis.clarityScore || 0));
    analysis.pronunciationScore = Math.max(0, Math.min(100, analysis.pronunciationScore || 0));
    analysis.fluencyScore = Math.max(0, Math.min(100, analysis.fluencyScore || 0));

    return analysis;
  } catch (error) {
    console.error('Gemini analysis error:', error);
    throw error;
  }
};

