export interface PromptRepository {
  getPrompt(key: string): Promise<string>;
}
