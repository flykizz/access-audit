import type { Page } from 'playwright';
import type { TestType, LLMResult } from '../types/index.js';

export type ProviderType = 'openai' | 'azure-openai' | 'doubao' | 'qwen' | 'glm' | 'deepseek' | 'custom';

export interface LLMConfig {
  provider: ProviderType;
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface LLMProvider {
  name: string;
  supportsBYOLLM: boolean;
  analyze: (page: Page, type: TestType, target?: string) => Promise<LLMResult>;
  configure: (config: LLMConfig) => void;
}