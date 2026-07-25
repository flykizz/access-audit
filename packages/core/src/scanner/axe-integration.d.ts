import type { AxeResults, RuleObject } from 'axe-core';
import type { ScanResult } from '../types';
export declare class AxeScanner {
    private customRules;
    registerCustomRule(rule: RuleObject): void;
    scan(url: string, rules?: string[]): Promise<ScanResult>;
    private generateMockResults;
    scanDom(dom: Document, rules?: string[]): Promise<AxeResults>;
    private filterResults;
}
