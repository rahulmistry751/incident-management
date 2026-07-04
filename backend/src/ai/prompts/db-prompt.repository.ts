import { Injectable, Inject } from '@nestjs/common';
import { PromptRepository } from '../interfaces/prompt-repository.interface';
import { DRIZZLE_PROVIDER, DrizzleDB } from '../../db/database.module';
import { llmPrompts } from '../../db/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class DbPromptRepository implements PromptRepository {
  private cache = new Map<string, { value: string; expiry: number }>();
  private readonly TTL_MS = 5 * 60 * 1000; // 5 minutes TTL

  constructor(@Inject(DRIZZLE_PROVIDER) private readonly db: DrizzleDB) {}

  async getPrompt(key: string): Promise<string> {
    const now = Date.now();
    const cached = this.cache.get(key);
    if (cached && cached.expiry > now) {
      return cached.value;
    }

    try {
      const [result] = await this.db
        .select()
        .from(llmPrompts)
        .where(eq(llmPrompts.key, key));

      if (!result) {
        throw new Error(`Prompt template "${key}" not found in database.`);
      }

      this.cache.set(key, { value: result.value, expiry: now + this.TTL_MS });
      return result.value;
    } catch (err) {
      console.error(`[DbPromptRepository] Failed to load prompt key "${key}":`, err);
      throw err;
    }
  }
}
