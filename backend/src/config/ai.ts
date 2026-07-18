import { GoogleGenAI } from '@google/genai';
import OpenAI from 'openai';
import logger from './logger';

const geminiKey = process.env.GEMINI_API_KEY;
const openaiKey = process.env.OPENAI_API_KEY;

export let geminiClient: any = null;
export let openaiClient: OpenAI | null = null;

if (geminiKey) {
  try {
    geminiClient = new GoogleGenAI({ apiKey: geminiKey });
    logger.info('Gemini AI Client initialized');
  } catch (error) {
    logger.error('Failed to initialize Gemini AI Client:', error);
  }
} else {
  logger.warn('GEMINI_API_KEY is not defined in environment variables');
}

if (openaiKey) {
  try {
    openaiClient = new OpenAI({ apiKey: openaiKey });
    logger.info('OpenAI Client initialized');
  } catch (error) {
    logger.error('Failed to initialize OpenAI Client:', error);
  }
} else {
  logger.warn('OPENAI_API_KEY is not defined in environment variables');
}
