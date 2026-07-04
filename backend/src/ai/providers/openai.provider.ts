import { Injectable } from '@nestjs/common';
import { AiProvider } from '../interfaces/ai-provider.interface';
import OpenAI from 'openai';
import { AiConfigService } from '../config/ai-config.service';

@Injectable()
export class OpenaiProvider implements AiProvider {
  private client: OpenAI | null = null;

  constructor(private readonly config: AiConfigService) {
    const apiKey = this.config.openaiApiKey;
    if (apiKey && apiKey !== 'your-openai-api-key-here' && apiKey !== 'mock-key') {
      this.client = new OpenAI({ apiKey });
    }
  }

  async generateJson<T>(
    systemInstruction: string,
    promptText: string,
    schema: Record<string, unknown>,
    options: { model: string; temperature: number; signal?: AbortSignal }
  ): Promise<T> {
    if (!this.client) {
      throw new Error('OpenAI client not initialized. Configure a valid OPENAI_API_KEY.');
    }

    try {
      const response = await this.client.chat.completions.create(
        {
          model: options.model,
          messages: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: promptText },
          ],
          response_format: {
            type: 'json_schema',
            json_schema: {
              name: 'structured_output',
              strict: true,
              schema: schema,
            },
          },
          temperature: options.temperature,
        },
        {
          signal: options.signal,
        }
      );

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('Received empty response from OpenAI');
      }

      return JSON.parse(content) as T;
    } catch (error) {
      console.error('[OpenaiProvider] Completion failed:', error);
      throw error;
    }
  }
}
