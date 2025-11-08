import { Request, Response } from 'express';
import { GeminiService } from '../services/geminiService';
import type { ConversationRequest } from '../types/conversation';

const geminiService = new GeminiService();

export class BaristaController {
  public async handleConversation(req: Request, res: Response) {
    try {
      const conversationRequest = req.body as ConversationRequest;
      
      // Validate request
      if (!conversationRequest.userMessage || !conversationRequest.orderState) {
        return res.status(400).json({ 
          error: 'Missing required fields' 
        });
      }

      const response = await geminiService.handleConversation(conversationRequest);
      return res.json(response);
    } catch (error) {
      console.error('Error in conversation handler:', error);
      return res.status(500).json({ 
        error: 'Internal server error' 
      });
    }
  }

  public resetConversation(_req: Request, res: Response) {
    try {
      return res.json({ 
        message: 'Conversation reset successfully' 
      });
    } catch (error) {
      console.error('Error resetting conversation:', error);
      return res.status(500).json({ 
        error: 'Failed to reset conversation' 
      });
    }
  }
}