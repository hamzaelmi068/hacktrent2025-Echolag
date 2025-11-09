import { model, BARISTA_PROMPT } from '../config/gemini';
import type { ConversationRequest, ConversationResponse, OrderState } from '../types/conversation';

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

  private async extractOrderState(
    userMessage: string,
    currentOrderState: OrderState,
    conversationHistory: Array<{ role: string; content: string }>
  ): Promise<OrderState> {
    try {
      // Include the latest user message in the conversation
      const allMessages = [
        ...conversationHistory,
        { role: 'user', content: userMessage }
      ];
      const conversationText = allMessages
        .map(msg => `${msg.role}: ${msg.content}`)
        .join('\n');

      const extractionPrompt = `Analyze this conversation and determine which order items have been mentioned or confirmed.

Current order state:
- drink: ${currentOrderState.drink}
- size: ${currentOrderState.size}
- milk: ${currentOrderState.milk}
- name: ${currentOrderState.name}

Full Conversation:
${conversationText}

Based on the conversation, determine if the customer has mentioned or the barista has confirmed:
1. A drink type (coffee, tea, latte, cappuccino, matcha, etc.) - set drink to true
2. A size (small, medium, large, tall, grande, venti, etc.) - set size to true
3. A milk preference (whole, skim, almond, oat, soy, etc.) - set milk to true
4. A name for the order - set name to true

Return ONLY a JSON object in this exact format:
{
  "drink": true/false,
  "size": true/false,
  "milk": true/false,
  "name": true/false
}

Be generous - if there's any mention or indication of an item, mark it as true.`;

      const result = await model.generateContent([extractionPrompt]);
      const response = await result.response;
      const text = response.text().trim();

      // Parse JSON from response (might be wrapped in markdown)
      let jsonText = text;
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```\n?/g, '').replace(/```\n?/g, '');
      }

      const extracted = JSON.parse(jsonText) as OrderState;
      
      // Merge with current state (once true, stay true)
      return {
        drink: currentOrderState.drink || extracted.drink,
        size: currentOrderState.size || extracted.size,
        milk: currentOrderState.milk || extracted.milk,
        name: currentOrderState.name || extracted.name,
      };
    } catch (error) {
      console.error('Error extracting order state:', error);
      // Return current state if extraction fails
      return currentOrderState;
    }
  }

  public async handleConversation(request: ConversationRequest): Promise<ConversationResponse> {
    const { userMessage, orderState, conversationHistory } = request;
    
    try {
      // Construct the conversation context
      const orderProgress = Object.entries(orderState)
        .map(([key, value]) => `${key}: ${value ? 'completed' : 'pending'}`)
        .join('\n');

      const conversationContext = (conversationHistory ?? [])
        .map(msg => `${msg.role}: ${msg.content}`)
        .join('\n');

      const fullPrompt = `${BARISTA_PROMPT}

Order Progress:
${orderProgress}

Previous Conversation:
${conversationContext}

Customer's latest message: "${userMessage}"

Respond as the barista:`;

      // Generate barista response and extract order state in parallel
      const [response, updatedOrderState] = await Promise.all([
        this.generateResponse(fullPrompt),
        this.extractOrderState(userMessage, orderState, conversationHistory)
      ]);

      return { 
        message: response,
        orderState: updatedOrderState
      };
    } catch (error: any) {
      console.error('Conversation handler error:', error);
      return {
        message: error.message.includes('API configuration') 
          ? "I apologize, but our ordering system is currently offline. Please try again in a few minutes." 
          : "I apologize, but I'm having trouble with our system right now. Could you please repeat your order?",
        orderState: orderState // Return current state on error
      };
    }
  }
}