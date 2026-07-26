import { z } from 'zod';
import type { LLMConfig, ProviderType } from './types.js';

try {
  require('dotenv').config();
} catch {
}

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

export function getEnvConfig(): Partial<LLMConfig> {
  const config: Partial<LLMConfig> = {};
  
  const provider = process.env.LLM_PROVIDER;
  if (provider && Object.keys(MODEL_PROVIDERS).includes(provider)) {
    config.provider = provider as ProviderType;
  }
  
  if (process.env.LLM_API_KEY) {
    config.apiKey = process.env.LLM_API_KEY;
  }
  
  if (process.env.LLM_BASE_URL) {
    config.baseUrl = process.env.LLM_BASE_URL;
  }
  
  if (process.env.LLM_MODEL) {
    config.model = process.env.LLM_MODEL;
  }
  
  if (process.env.LLM_TEMPERATURE) {
    config.temperature = parseFloat(process.env.LLM_TEMPERATURE);
  }
  
  if (process.env.LLM_MAX_TOKENS) {
    config.maxTokens = parseInt(process.env.LLM_MAX_TOKENS);
  }
  
  return config;
}

export function getDefaultConfig(): LLMConfig {
  const envConfig = getEnvConfig();
  const qwenConfig = MODEL_PROVIDERS.qwen;
  const provider = envConfig.provider || 'qwen';
  const providerConfig = MODEL_PROVIDERS[provider];
  
  return {
    provider: provider,
    apiKey: envConfig.apiKey || providerConfig.apiKey,
    baseUrl: envConfig.baseUrl || providerConfig.baseUrl,
    model: envConfig.model || providerConfig.model,
    temperature: envConfig.temperature || 0.2,
    maxTokens: envConfig.maxTokens || 1024,
  };
}

export function getProviderConfig(provider: ProviderType): { model: string; apiKey: string; baseUrl: string } {
  return MODEL_PROVIDERS[provider] || MODEL_PROVIDERS.qwen;
}

export function resolveConfig(config: LLMConfig): LLMConfig {
  const envConfig = getEnvConfig();
  const provider = config.provider || envConfig.provider || 'qwen';
  const providerConfig = MODEL_PROVIDERS[provider];
  
  return {
    provider: provider,
    apiKey: config.apiKey || envConfig.apiKey || providerConfig.apiKey,
    baseUrl: config.baseUrl || envConfig.baseUrl || providerConfig.baseUrl,
    model: config.model || envConfig.model || providerConfig.model,
    temperature: config.temperature || envConfig.temperature || 0.2,
    maxTokens: config.maxTokens || envConfig.maxTokens || 1024,
  };
}