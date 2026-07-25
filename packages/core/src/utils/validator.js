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
        name: z.string(),
        steps: z.array(z.string()),
    })),
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
export function validateUrl(url) {
    try {
        urlSchema.parse(url);
        return true;
    }
    catch {
        return false;
    }
}
export function validateAuditConfig(config) {
    try {
        auditConfigSchema.parse(config);
        return true;
    }
    catch {
        return false;
    }
}
export function validateScanOptions(options) {
    try {
        scanOptionsSchema.parse(options);
        return true;
    }
    catch {
        return false;
    }
}
export function validateBehaviorTask(task) {
    try {
        behaviorTestOptionsSchema.parse(task);
        return true;
    }
    catch {
        return false;
    }
}
