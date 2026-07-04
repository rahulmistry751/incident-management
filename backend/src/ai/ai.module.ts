import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { PROMPT_REPOSITORY } from './constants';
import { OpenaiProvider } from './providers/openai.provider';
import { GeminiProvider } from './providers/gemini.provider';
import { DbPromptRepository } from './prompts/db-prompt.repository';
import { AiConfigService } from './config/ai-config.service';

@Module({
  providers: [
    AiService,
    AiConfigService,
    OpenaiProvider,
    GeminiProvider,
    DbPromptRepository,
    {
      provide: PROMPT_REPOSITORY,
      useClass: DbPromptRepository,
    },
  ],
  exports: [AiService, AiConfigService, OpenaiProvider, GeminiProvider, PROMPT_REPOSITORY],
})
export class AiModule {}
