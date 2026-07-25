import { z } from 'zod';
export declare const urlSchema: z.ZodString;
export declare const auditConfigSchema: z.ZodObject<{
    includeStaticScan: z.ZodBoolean;
    includeBehaviorTest: z.ZodBoolean;
    scanRules: z.ZodArray<z.ZodString, "many">;
    behaviorTests: z.ZodArray<z.ZodEnum<["keyboard-reachability", "keyboard-trap", "focus-visibility", "focus-order", "modal-focus-return"]>, "many">;
    goldenPaths: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        steps: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        name: string;
        steps: string[];
    }, {
        name: string;
        steps: string[];
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    includeStaticScan: boolean;
    includeBehaviorTest: boolean;
    scanRules: string[];
    behaviorTests: ("keyboard-reachability" | "keyboard-trap" | "focus-visibility" | "focus-order" | "modal-focus-return")[];
    goldenPaths: {
        name: string;
        steps: string[];
    }[];
}, {
    includeStaticScan: boolean;
    includeBehaviorTest: boolean;
    scanRules: string[];
    behaviorTests: ("keyboard-reachability" | "keyboard-trap" | "focus-visibility" | "focus-order" | "modal-focus-return")[];
    goldenPaths: {
        name: string;
        steps: string[];
    }[];
}>;
export declare const scanOptionsSchema: z.ZodObject<{
    url: z.ZodString;
    rules: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    includeHidden: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    timeout: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    url: string;
    includeHidden: boolean;
    timeout: number;
    rules?: string[] | undefined;
}, {
    url: string;
    rules?: string[] | undefined;
    includeHidden?: boolean | undefined;
    timeout?: number | undefined;
}>;
export declare const behaviorTestOptionsSchema: z.ZodObject<{
    url: z.ZodString;
    testType: z.ZodEnum<["keyboard-reachability", "keyboard-trap", "focus-visibility", "focus-order", "modal-focus-return"]>;
    target: z.ZodOptional<z.ZodString>;
    expected: z.ZodOptional<z.ZodString>;
    maxIterations: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    url: string;
    testType: "keyboard-reachability" | "keyboard-trap" | "focus-visibility" | "focus-order" | "modal-focus-return";
    maxIterations: number;
    target?: string | undefined;
    expected?: string | undefined;
}, {
    url: string;
    testType: "keyboard-reachability" | "keyboard-trap" | "focus-visibility" | "focus-order" | "modal-focus-return";
    target?: string | undefined;
    expected?: string | undefined;
    maxIterations?: number | undefined;
}>;
export declare const taskConfigSchema: z.ZodObject<{
    name: z.ZodString;
    urls: z.ZodArray<z.ZodString, "many">;
    config: z.ZodObject<{
        includeStaticScan: z.ZodBoolean;
        includeBehaviorTest: z.ZodBoolean;
        scanRules: z.ZodArray<z.ZodString, "many">;
        behaviorTests: z.ZodArray<z.ZodEnum<["keyboard-reachability", "keyboard-trap", "focus-visibility", "focus-order", "modal-focus-return"]>, "many">;
        goldenPaths: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            steps: z.ZodArray<z.ZodString, "many">;
        }, "strip", z.ZodTypeAny, {
            name: string;
            steps: string[];
        }, {
            name: string;
            steps: string[];
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        includeStaticScan: boolean;
        includeBehaviorTest: boolean;
        scanRules: string[];
        behaviorTests: ("keyboard-reachability" | "keyboard-trap" | "focus-visibility" | "focus-order" | "modal-focus-return")[];
        goldenPaths: {
            name: string;
            steps: string[];
        }[];
    }, {
        includeStaticScan: boolean;
        includeBehaviorTest: boolean;
        scanRules: string[];
        behaviorTests: ("keyboard-reachability" | "keyboard-trap" | "focus-visibility" | "focus-order" | "modal-focus-return")[];
        goldenPaths: {
            name: string;
            steps: string[];
        }[];
    }>;
    callbackUrl: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    urls: string[];
    config: {
        includeStaticScan: boolean;
        includeBehaviorTest: boolean;
        scanRules: string[];
        behaviorTests: ("keyboard-reachability" | "keyboard-trap" | "focus-visibility" | "focus-order" | "modal-focus-return")[];
        goldenPaths: {
            name: string;
            steps: string[];
        }[];
    };
    callbackUrl?: string | undefined;
}, {
    name: string;
    urls: string[];
    config: {
        includeStaticScan: boolean;
        includeBehaviorTest: boolean;
        scanRules: string[];
        behaviorTests: ("keyboard-reachability" | "keyboard-trap" | "focus-visibility" | "focus-order" | "modal-focus-return")[];
        goldenPaths: {
            name: string;
            steps: string[];
        }[];
    };
    callbackUrl?: string | undefined;
}>;
export declare function validateUrl(url: string): boolean;
export declare function validateAuditConfig(config: unknown): boolean;
export declare function validateScanOptions(options: unknown): boolean;
export declare function validateBehaviorTask(task: unknown): boolean;
