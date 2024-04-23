import { ContentEmbedding, GoogleGenerativeAI } from '@google/generative-ai';
import { CONFIG } from '../config';

const MODEL_NAME = 'gemini-pro';
const EM_MODEL_NAME = 'embedding-001';

export class GeminiAIService {
  private genAI: GoogleGenerativeAI;

  constructor() {
    this.genAI = new GoogleGenerativeAI(CONFIG.GOOGLE_AI_API_KEY);
  }

  async createEmbedding(text: string): Promise<ContentEmbedding> {
    const model = this.genAI.getGenerativeModel({ model: EM_MODEL_NAME });
    const result = await model.embedContent(text);
    const embedding = result.embedding;

    return embedding;
  }

  async ask(prompt: string): Promise<string> {
    const model = this.genAI.getGenerativeModel({ model: MODEL_NAME });
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    return text;
  }
}
