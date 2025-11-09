import { Request, Response } from 'express';
import { analyzeSessionWithGemini } from '../services/analysisService';

export class AnalysisController {
  async analyzeSession(req: Request, res: Response): Promise<void> {
    try {
      const { transcript, duration, wordCount, averagePause, wordsPerMinute } = req.body;

      if (!transcript) {
        res.status(400).json({ error: 'Transcript is required' });
        return;
      }

      const analysis = await analyzeSessionWithGemini({
        transcript,
        duration: duration || 0,
        wordCount: wordCount || 0,
        averagePause: averagePause || 0,
        wordsPerMinute: wordsPerMinute || 0,
      });

      res.json(analysis);
    } catch (error) {
      console.error('Analysis error:', error);
      res.status(500).json({
        error: 'Failed to analyze session',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

