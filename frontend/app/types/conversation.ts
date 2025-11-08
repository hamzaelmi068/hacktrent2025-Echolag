export interface OrderState {
  drink: boolean;
  size: boolean;
  milk: boolean;
  name: boolean;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface ConversationRequest {
  userMessage: string;
  orderState: OrderState;
  conversationHistory: Message[];
}

export interface ConversationResponse {
  message: string;
  suggestions?: string[];
  orderState?: OrderState;
}