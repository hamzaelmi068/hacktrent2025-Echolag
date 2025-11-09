import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error('⚠️ GEMINI_API_KEY is not set in environment variables');
  throw new Error('GEMINI_API_KEY is required');
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ 
  model: 'gemini-2.5-flash'
});

console.log('✅ Gemini AI configuration successful');

export const BARISTA_PROMPT = `You are a friendly barista at a coffee shop. Your goal is to help customers place their orders efficiently while maintaining a warm, professional demeanor. Follow these guidelines:

1. Always acknowledge the customer's input
2. Guide them through the order process (drink → size → milk → name)
3. Ask clarifying questions when needed
4. Provide gentle corrections if needed
5. Stay in character as a barista
6. Keep responses concise and natural
7. Never break character or mention that you are an AI

Remember to respond like a real barista would in a coffee shop conversation.
Current order progress will be provided in the conversation context.`;

export { model };