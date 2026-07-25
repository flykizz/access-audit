import { z } from 'zod';

export const urlSchema = z.string().url({ message: 'Invalid URL format' });

export const auditConfigSchema = z.object({
  includeStaticScan: z.boolean(),
  includeBehaviorTest: z.boolean(),
  scanRules: z.array(z.string()),
  behaviorTests: z.array(z.enum([
    'keyboard-reachability',
    'keyboard-trap',
    'focus-visibility',
    'focus-order',
    'modal-focus-return',
  ])),
  goldenPaths: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().optional(),
    steps: z.array(z.object({
      name: z.string(),
      url: z.string(),
      actions: z.array(z.object({
        type: z.enum(['click', 'type', 'focus', 'press', 'wait']),
        selector: z.string().optional(),
        value: z.string().optional(),
        timeout: z.number().optional(),
      })).optional(),
      expectedElements: z.array(z.string()).optional(),
    })),
    priority: z.enum(['critical', 'high', 'medium', 'low']),
    businessWeight: z.number(),
    urlPattern: z.string().optional(),
    tags: z.array(z.string()).optional(),
  })),
  enablePathDiscovery: z.boolean().optional().default(false),
  maxDiscoveredPaths: z.number().optional().default(10),
  pathDiscoveryDepth: z.number().optional().default(3),
  enableFullSiteScan: z.boolean().optional().default(false),
  maxPages: z.number().optional().default(20),
});

export const scanOptionsSchema = z.object({
  url: urlSchema,
  rules: z.array(z.string()).optional(),
  includeHidden: z.boolean().optional().default(false),
  timeout: z.number().optional().default(30000),
});

export const behaviorTestOptionsSchema = z.object({
  url: urlSchema,
  testType: z.enum([
    'keyboard-reachability',
    'keyboard-trap',
    'focus-visibility',
    'focus-order',
    'modal-focus-return',
  ]),
  target: z.string().optional(),
  expected: z.string().optional(),
  maxIterations: z.number().optional().default(10),
});

export const taskConfigSchema = z.object({
  name: z.string(),
  urls: z.array(urlSchema),
  config: auditConfigSchema,
  callbackUrl: z.string().url().optional(),
});

export function validateUrl(url: string): boolean {
  try {
    urlSchema.parse(url);
    return true;
  } catch {
    return false;
  }
}

export function validateAuditConfig(config: unknown): boolean {
  try {
    auditConfigSchema.parse(config);
    return true;
  } catch {
    return false;
  }
}

export function validateScanOptions(options: unknown): boolean {
  try {
    scanOptionsSchema.parse(options);
    return true;
  } catch {
    return false;
  }
}

export function validateBehaviorTask(task: unknown): boolean {
  try {
    behaviorTestOptionsSchema.parse(task);
    return true;
  } catch {
    return false;
  }
}
