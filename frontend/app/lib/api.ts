import axios from 'axios';
import type { ConversationRequest, ConversationResponse, OrderState } from '../types/conversation';

const api = axios.create({
  baseURL: 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const startConversation = async (message: string, orderState: OrderState, conversationHistory: Message[] = []): Promise<ConversationResponse> => {
  try {
    const request: ConversationRequest = {
      userMessage: message,
      orderState,
      conversationHistory
    };
    const response = await api.post('/api/conversation', request);
    return response.data;
  } catch (error) {
    console.error('Error in conversation:', error);
    throw error;
  }
};

export const resetConversation = async (): Promise<ConversationResponse> => {
  try {
    const response = await api.get('/api/reset');
    return response.data;
  } catch (error) {
    console.error('Error resetting conversation:', error);
    throw error;
  }
};

export default api;