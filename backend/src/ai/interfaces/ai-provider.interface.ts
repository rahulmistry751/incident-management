export interface AiProvider {
  generateJson<T>(
    systemInstruction: string,
    promptText: string,
    schema: Record<string, unknown>,
    options: { model: string; temperature: number; signal?: AbortSignal }
  ): Promise<T>;
}
