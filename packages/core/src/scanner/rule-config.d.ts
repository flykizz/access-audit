import type { RuleObject } from 'axe-core';
export declare const defaultRules: string[];
export declare const ruleCategories: Record<string, string[]>;
export declare const customRules: RuleObject[];
export declare function getRulesByCategory(category: string): string[];
export declare function getAllRuleIds(): string[];
