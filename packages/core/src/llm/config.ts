import { z } from 'zod';
import type { LLMConfig, ProviderType } from './types.js';

export const MODEL_PROVIDERS: Record<ProviderType, { model: string; apiKey: string; baseUrl: string }> = {
  doubao: {
    model: 'doubao-seed-2-1-pro-260628',
    apiKey: '',
    baseUrl: 'https://ark.cn-beijing.volces.com/api/v3',
  },
  qwen: {
    model: 'qwen-plus',
    apiKey: '',
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  },
  glm: {
    model: 'glm-4-plus',
    apiKey: '',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
  },
  deepseek: {
    model: 'deepseek-chat',
    apiKey: '',
    baseUrl: 'https://api.deepseek.com/v1',
  },
  openai: {
    model: 'gpt-4o-mini',
    apiKey: '',
    baseUrl: 'https://api.openai.com/v1',
  },
  'azure-openai': {
    model: 'gpt-4o-mini',
    apiKey: '',
    baseUrl: '',
  },
  custom: {
    model: '',
    apiKey: '',
    baseUrl: '',
  },
};

export const llmConfigSchema = z.object({
  provider: z.enum(['openai', 'azure-openai', 'doubao', 'qwen', 'glm', 'deepseek', 'custom']),
  apiKey: z.string().optional(),
  baseUrl: z.string().url().optional(),
  model: z.string().optional().default('qwen-plus'),
  temperature: z.number().min(0).max(1).optional().default(0.2),
  maxTokens: z.number().min(100).max(4096).optional().default(1024),
});

export function validateLLMConfig(config: unknown): config is LLMConfig {
  return llmConfigSchema.safeParse(config).success;
}

export function getDefaultConfig(): LLMConfig {
  const qwenConfig = MODEL_PROVIDERS.qwen;
  return {
    provider: 'qwen',
    apiKey: qwenConfig.apiKey,
    baseUrl: qwenConfig.baseUrl,
    model: qwenConfig.model,
    temperature: 0.2,
    maxTokens: 1024,
  };
}

export function getProviderConfig(provider: ProviderType): { model: string; apiKey: string; baseUrl: string } {
  return MODEL_PROVIDERS[provider] || MODEL_PROVIDERS.qwen;
}