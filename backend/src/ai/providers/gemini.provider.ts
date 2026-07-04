import { Injectable } from '@nestjs/common';
import { AiProvider } from '../interfaces/ai-provider.interface';
import { GoogleGenAI } from '@google/genai';
import { AiConfigService } from '../config/ai-config.service';

@Injectable()
export class GeminiProvider implements AiProvider {
  private client: GoogleGenAI | null = null;

  constructor(private readonly config: AiConfigService) {
    const apiKey = this.config.geminiApiKey;
    if (apiKey && apiKey !== 'your-gemini-api-key-here' && apiKey !== 'mock-key') {
      this.client = new GoogleGenAI({ apiKey });
    }
  }

  async generateJson<T>(
    systemInstruction: string,
    promptText: string,
    schema: Record<string, unknown>,
    options: { model: string; temperature: number; signal?: AbortSignal }
  ): Promise<T> {
    if (!this.client) {
      throw new Error('Gemini client not initialized. Configure a valid GEMINI_API_KEY.');
    }

    try {
      const response = await this.client.models.generateContent({
        model: options.model,
        contents: promptText,
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: 'application/json',
          temperature: options.temperature,
          responseSchema: schema,
          abortSignal: options.signal,
        },
      });

      const content = response.text;
      if (!content) {
        throw new Error('Received empty response from Gemini');
      }

      return JSON.parse(content) as T;
    } catch (error) {
      console.error('[GeminiProvider] Completion failed:', error);
      throw error;
    }
  }
}
