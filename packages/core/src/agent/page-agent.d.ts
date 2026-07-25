import { Page } from 'playwright';
import type { BehaviorTask, BehaviorResult, LLMResult, TestType } from '../types';
interface LLMProvider {
    analyze: (page: Page, type: TestType, target?: string) => Promise<LLMResult>;
}
export declare class PageAgent {
    private page;
    private llmProvider;
    constructor(llmProvider?: LLMProvider);
    init(): Promise<void>;
    executeTask(task: BehaviorTask): Promise<BehaviorResult>;
    private executeRule;
    private mergeResults;
    private getExpectedBehavior;
    private getActualBehavior;
    private getFixSuggestion;
}
export {};
