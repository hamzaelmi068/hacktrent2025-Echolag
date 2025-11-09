import express from 'express';
import { BaristaController } from '../controllers/baristaController';
import { AnalysisController } from '../controllers/analysisController';

const router = express.Router();
const baristaController = new BaristaController();
const analysisController = new AnalysisController();

// Handle conversation turns
router.post('/conversation', (req, res) => baristaController.handleConversation(req, res));

// Reset conversation
router.get('/reset', (req, res) => baristaController.resetConversation(req, res));

// Analyze session
router.post('/analyze', (req, res) => analysisController.analyzeSession(req, res));

export default router;