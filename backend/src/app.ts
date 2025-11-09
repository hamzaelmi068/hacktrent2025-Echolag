import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import baristaRoutes from './routes/baristaRoutes';
import analysisRoutes from './routes/analysisRoutes';

// Load environment variables from backend root directory
dotenv.config({ path: path.join(process.cwd(), '.env') });

const app = express();
const port = process.env.PORT || 3001;

// CORS configuration
const corsOptions = {
  origin: 'http://localhost:3000', // Frontend URL
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Request logging middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Root endpoint
app.get('/', (_, res) => {
  console.log('Root endpoint hit');
  res.json({ message: 'EchoLag Barista API' });
});

// Health check endpoint
app.get('/health', (_, res) => {
  console.log('Health check endpoint hit');
  res.json({ status: 'healthy' });
});

// API routes
app.use('/api', baristaRoutes);
app.use('/api', analysisRoutes);

// 404 handler
app.use((req, res) => {
  console.log(`404 Not Found: ${req.path}`);
  res.status(404).json({ 
    error: 'Not Found',
    path: req.path
  });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  console.log('Available endpoints:');
  console.log('- GET  /');
  console.log('- GET  /health');
  console.log('- POST /api/conversation');
  console.log('- GET  /api/reset');
  console.log('- POST /api/analyze-session');
});