import { model, BARISTA_PROMPT } from '../config/gemini';
import type { ConversationRequest, ConversationResponse } from '../types/conversation';

export class GeminiService {
  private async generateResponse(prompt: string): Promise<string> {
    try {
      console.log('🎯 Starting request to Gemini API');
      const result = await model.generateContent([prompt]);
      const response = await result.response;
      const text = response.text();
      console.log('✅ Generated response successfully');
      return text;
    } catch (error: any) {
      // Sanitize any URLs or keys from error messages
      const sanitizedMessage = error.message?.replace(/\?key=([^&]+)/, '?key=REDACTED')
        .replace(/AIza[0-9A-Za-z-_]{35}/, 'REDACTED_API_KEY');
      
      console.error('Detailed error:', {
        message: sanitizedMessage,
        status: error.status,
        details: error.errorDetails
      });
      
      if (error.status === 404) {
        throw new Error('API configuration error - please verify your API key and permissions');
      }
      
      throw new Error(`Failed to generate response: ${sanitizedMessage}`);
    }
  }

  public async handleConversation(request: ConversationRequest): Promise<ConversationResponse> {
    const { userMessage, orderState, conversationHistory } = request;
    
    try {
      // Construct the conversation context
      const orderProgress = Object.entries(orderState)
        .map(([key, value]) => `${key}: ${value ? 'completed' : 'pending'}`)
        .join('\n');

      const conversationContext = conversationHistory
        .map(msg => `${msg.role}: ${msg.content}`)
        .join('\n');

      const fullPrompt = `${BARISTA_PROMPT}

Order Progress:
${orderProgress}

Previous Conversation:
${conversationContext}

Customer's latest message: "${userMessage}"

Respond as the barista:`;

      const response = await this.generateResponse(fullPrompt);
      return { message: response };
    } catch (error: any) {
      console.error('Conversation handler error:', error);
      return {
        message: error.message.includes('API configuration') 
          ? "I apologize, but our ordering system is currently offline. Please try again in a few minutes." 
          : "I apologize, but I'm having trouble with our system right now. Could you please repeat your order?"
      };
    }
  }
}