import { Router } from 'express';
import { AnalysisController } from '../controllers/analysisController';

const analysisRoutes = Router();
const controller = new AnalysisController();

analysisRoutes.post('/analyze-session', controller.analyzeSession.bind(controller));

export default analysisRoutes;

