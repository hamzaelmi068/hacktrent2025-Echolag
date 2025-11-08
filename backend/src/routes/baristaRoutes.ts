import express from 'express';
import { BaristaController } from '../controllers/baristaController';

const router = express.Router();
const baristaController = new BaristaController();

// Handle conversation turns
router.post('/conversation', (req, res) => baristaController.handleConversation(req, res));

// Reset conversation
router.get('/reset', (req, res) => baristaController.resetConversation(req, res));

export default router;