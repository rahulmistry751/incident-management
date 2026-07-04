import { Injectable, Inject } from '@nestjs/common';
import { DRIZZLE_PROVIDER, DrizzleDB } from '../../db/database.module';
import { llmConfigs } from '../../db/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class AiConfigService {
  private cache = new Map<string, { value: unknown; expiry: number }>();
  private readonly TTL_MS = 5 * 60 * 1000; // 5 minutes TTL

  constructor(@Inject(DRIZZLE_PROVIDER) private readonly db: DrizzleDB) {}

  private async getOrFetch<T>(key: string, fetchFn: () => Promise<T>): Promise<T> {
    const cached = this.cache.get(key);
    const now = Date.now();
    if (cached && cached.expiry > now) {
      return cached.value as T;
    }
    const value = await fetchFn();
    this.cache.set(key, { value, expiry: now + this.TTL_MS });
    return value;
  }

  async getProvider(): Promise<string> {
    return this.getOrFetch('llm_provider', async () => {
      try {
        const [result] = await this.db
          .select()
          .from(llmConfigs)
          .where(eq(llmConfigs.key, 'llm_provider'));
        if (result) {
          return result.value;
        }
        const defaultVal = process.env.AI_PROVIDER || 'gemini';
        await this.db
          .insert(llmConfigs)
          .values({ key: 'llm_provider', value: defaultVal })
          .onConflictDoNothing();
        return defaultVal;
      } catch (err) {
        console.error('[AiConfigService] Error loading llm_provider from DB, using fallback:', err);
        return process.env.AI_PROVIDER || 'gemini';
      }
    });
  }

  async getModel(provider: string): Promise<string> {
    return this.getOrFetch(`llm_model_${provider}`, async () => {
      try {
        const [result] = await this.db
          .select()
          .from(llmConfigs)
          .where(eq(llmConfigs.key, 'llm_model'));
        if (result) {
          return result.value;
        }
        
        const defaultModel = process.env.AI_MODEL || (provider === 'openai' ? 'gpt-4o-mini' : 'gemini-2.0-flash');
        await this.db
          .insert(llmConfigs)
          .values({ key: 'llm_model', value: defaultModel })
          .onConflictDoNothing();
        return defaultModel;
      } catch (err) {
        console.error('[AiConfigService] Error loading llm_model from DB, using fallback:', err);
        return process.env.AI_MODEL || (provider === 'openai' ? 'gpt-4o-mini' : 'gemini-2.0-flash');
      }
    });
  }

  async getTemperature(): Promise<number> {
    const valStr = await this.getOrFetch('llm_temperature', async () => {
      try {
        const [result] = await this.db
          .select()
          .from(llmConfigs)
          .where(eq(llmConfigs.key, 'llm_temperature'));
        if (result) {
          return result.value;
        }
        const defaultVal = process.env.AI_TEMPERATURE || '0.2';
        await this.db
          .insert(llmConfigs)
          .values({ key: 'llm_temperature', value: defaultVal })
          .onConflictDoNothing();
        return defaultVal;
      } catch (err) {
        console.error('[AiConfigService] Error loading llm_temperature from DB, using fallback:', err);
        return process.env.AI_TEMPERATURE || '0.2';
      }
    });
    return parseFloat(valStr);
  }

  get openaiApiKey(): string {
    return process.env.OPENAI_API_KEY || '';
  }

  get geminiApiKey(): string {
    return process.env.GEMINI_API_KEY || '';
  }
}
