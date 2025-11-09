import { Request, Response } from 'express';
import { analyzeSessionWithGemini, type AnalysisResponse } from '../services/analysisService';

const FALLBACK_ANALYSIS: AnalysisResponse = {
  overallSummary:
    'Solid effort! You maintained a calm, professional tone and kept the conversation moving. With a bit more polish, you will sound even more confident behind the counter.',
  strengths: [
    'Friendly, welcoming energy that makes customers feel comfortable',
    'Clear structure while confirming key order details',
    'Professional tone that stays steady throughout the interaction',
  ],
  growthOpportunities: [
    'Add more clarification questions to avoid assumptions about preferences',
    'Slow down slightly when confirming names to improve clarity',
    'Use more positive reinforcement like “Great choice!” to build rapport',
  ],
  tips: [
    'Smile while speaking—it naturally boosts warmth and clarity in your voice',
    'Mirror the customer’s wording to confirm order details accurately',
    'Pause briefly after key details so the customer can respond comfortably',
    'Wrap up with a confident recap and next steps for pickup',
    'Practice aloud with a timer to keep a comfortable conversational pace',
  ],
  clarityScore: 75,
  pronunciationScore: 75,
  fluencyScore: 75,
  averageScore: 75,
};

export class AnalysisController {
  async analyzeSession(req: Request, res: Response): Promise<void> {
    try {
      const { transcript, duration, wordCount, wordsPerMinute } = req.body ?? {};

      if (typeof transcript !== 'string' || transcript.trim().length === 0) {
        res.status(400).json({ error: 'Transcript is required' });
        return;
      }

      const safeDuration = Number(duration);
      const safeWordCount = Number(wordCount);
      const safeWpm = Number(wordsPerMinute);

      const analysis = await analyzeSessionWithGemini({
        transcript: transcript.trim(),
        duration: Number.isFinite(safeDuration) && safeDuration > 0 ? safeDuration : 0,
        wordCount: Number.isFinite(safeWordCount) && safeWordCount > 0 ? safeWordCount : 0,
        wordsPerMinute: Number.isFinite(safeWpm) && safeWpm > 0 ? safeWpm : 0,
      });

      const ensureLength = (items: string[], expected: number, fallback: string[]): string[] => {
        if (items.length >= expected) {
          return items.slice(0, expected);
        }
        return [...items, ...fallback].slice(0, expected);
      };

      res.json({
        ...analysis,
        strengths: ensureLength(analysis.strengths, 3, FALLBACK_ANALYSIS.strengths),
        growthOpportunities: ensureLength(
          analysis.growthOpportunities,
          3,
          FALLBACK_ANALYSIS.growthOpportunities
        ),
        tips: ensureLength(analysis.tips, 5, FALLBACK_ANALYSIS.tips),
      });
    } catch (error) {
      console.error('Analysis error:', error);
      res.status(500).json({
        error: 'Failed to analyze session',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

