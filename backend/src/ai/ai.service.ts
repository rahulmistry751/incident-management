import { Injectable, Inject } from '@nestjs/common';
import { PROMPT_REPOSITORY } from './constants';
import { PromptRepository } from './interfaces/prompt-repository.interface';
import { AnalysisResult } from './dto/analysis-result.dto';
import { AiConfigService } from './config/ai-config.service';
import { OpenaiProvider } from './providers/openai.provider';
import { GeminiProvider } from './providers/gemini.provider';
import { AiProvider } from './interfaces/ai-provider.interface';

@Injectable()
export class AiService {
  constructor(
    private readonly config: AiConfigService,
    private readonly openaiProvider: OpenaiProvider,
    private readonly geminiProvider: GeminiProvider,
    @Inject(PROMPT_REPOSITORY) private readonly promptRepo: PromptRepository
  ) {}

  /**
   * Analyzes an incident using the dynamically configured AI provider and templates.
   */
  async analyzeIncident(
    title: string,
    description: string,
    signal?: AbortSignal
  ): Promise<AnalysisResult> {
    const providerType = await this.config.getProvider();

    // Check if abort was already requested before proceeding
    if (signal?.aborted) {
      throw new DOMException('The user aborted a request.', 'AbortError');
    }

    const systemInstruction = await this.promptRepo.getPrompt('incident_analysis_system');
    const userTemplate = await this.promptRepo.getPrompt('incident_analysis_user');

    if (signal?.aborted) {
      throw new DOMException('The user aborted a request.', 'AbortError');
    }

    // Simple template interpolation helper
    const promptText = userTemplate
      .replace('{{title}}', title)
      .replace('{{description}}', description);

    // Dynamic resolution of AI provider configuration from database
    const model = await this.config.getModel(providerType);
    const temperature = await this.config.getTemperature();

    const provider: AiProvider = providerType === 'openai' ? this.openaiProvider : this.geminiProvider;

    const schema = {
      type: 'object',
      properties: {
        summary: {
          type: 'string',
          description: 'A clear, concise summary of the issue.',
        },
        recommendedSeverity: {
          type: 'string',
          enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
          description: 'The recommended severity level of the incident.',
        },
        rootCause: {
          type: 'string',
          description: 'Suggestions for root cause and debugging steps.',
        },
      },
      required: ['summary', 'recommendedSeverity', 'rootCause'],
      additionalProperties: false,
    };

    try {
      return await provider.generateJson<AnalysisResult>(
        systemInstruction,
        promptText,
        schema,
        { model, temperature, signal }
      );
    } catch (error) {
      console.error('[AiService] AI incident analysis failed:', error);
      throw error;
    }
  }
}
