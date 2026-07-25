import { Page, chromium } from 'playwright';
import type { BehaviorTask, BehaviorResult, RuleResult, LLMResult, TestType } from '../types/index.js';
import type { LLMProvider as CoreLLMProvider, LLMConfig } from '../llm/index.js';
import { OpenAIProvider, getDefaultConfig } from '../llm/index.js';
import { RuleEngine } from './rule-engine.js';
import { logger } from '../utils/logger.js';

class MockLLMProvider implements CoreLLMProvider {
  name = 'mock';
  supportsBYOLLM = false;

  async analyze(_page: Page, type: TestType, _target?: string): Promise<LLMResult> {
    const insights: Record<TestType, string> = {
      'keyboard-reachability': 'Checking if all interactive elements are reachable via keyboard',
      'keyboard-trap': 'Checking for keyboard trap conditions in focusable elements',
      'focus-visibility': 'Checking if focus indicators are visible',
      'focus-order': 'Checking if tab order follows visual layout',
      'modal-focus-return': 'Checking if focus returns to trigger after modal close',
    };

    return {
      status: 'unknown',
      insight: insights[type],
    };
  }

  configure(_config: LLMConfig): void {}
}

export class PageAgent {
  private page: Page | null = null;
  private llmProvider: CoreLLMProvider;
  private llmConfig: LLMConfig;

  constructor(llmProvider?: CoreLLMProvider, llmConfig?: LLMConfig) {
    this.llmConfig = llmConfig || getDefaultConfig();
    this.llmProvider = llmProvider || new MockLLMProvider();
  }

  setLLMProvider(provider: CoreLLMProvider): void {
    this.llmProvider = provider;
  }

  configureLLM(config: LLMConfig): void {
    this.llmConfig = config;
    if (this.llmProvider.name === 'openai') {
      this.llmProvider.configure(config);
    } else {
      this.llmProvider = new OpenAIProvider(config);
    }
  }

  async init(): Promise<void> {
    const browser = await chromium.launch({ headless: true });
    this.page = await browser.newPage();
  }

  async executeTask(task: BehaviorTask): Promise<BehaviorResult> {
    const { type, target, name } = task;

    if (!this.page) {
      await this.init();
    }

    try {
      const currentPage = this.page;
      if (!currentPage) {
        throw new Error('Page not initialized');
      }

      if (target && this.isUrl(target)) {
        await currentPage.goto(target, { timeout: 30000, waitUntil: 'domcontentloaded' });
      }

      const llmResult = await this.llmProvider.analyze(currentPage, type, target);
      const ruleResult = await this.executeRule(type, undefined);

      return this.mergeResults(llmResult, ruleResult, type, target || '', name);
    } catch (error) {
      logger.error(`Behavior test failed: ${(error as Error).message}`);
      return {
        testType: type,
        targetElement: target || '',
        status: 'error',
        expectedBehavior: '',
        actualBehavior: (error as Error).message,
        llmInsight: undefined,
        fixSuggestion: undefined,
      };
    }
  }

  private isUrl(str: string): boolean {
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  }

  private async executeRule(type: TestType, target?: string): Promise<RuleResult> {
    if (!this.page) {
      return { status: 'unknown', details: {} };
    }

    const ruleEngine = new RuleEngine(this.page);
    return ruleEngine.execute(type, target);
  }

  private mergeResults(
    llmResult: LLMResult,
    ruleResult: RuleResult,
    testType: TestType,
    targetElement: string,
    name: string
  ): BehaviorResult {
    let status = ruleResult.status;
    let llmInsight = llmResult.insight;
    let fixSuggestion: string | undefined;

    if (status === 'unknown') {
      status = llmResult.status;
    }

    if (status === 'fail') {
      fixSuggestion = this.getFixSuggestion(testType);
    }

    const expectedBehavior = this.getExpectedBehavior(testType);
    const actualBehavior = this.getActualBehavior(testType, ruleResult.details);

    return {
      testType,
      targetElement,
      status,
      expectedBehavior,
      actualBehavior,
      llmInsight,
      fixSuggestion,
    };
  }

  private getExpectedBehavior(testType: TestType): string {
    const behaviors: Record<TestType, string> = {
      'keyboard-reachability': 'All interactive elements should be reachable via keyboard',
      'keyboard-trap': 'Focus should not be trapped within a modal',
      'focus-visibility': 'Focus indicators should be visible',
      'focus-order': 'Tab order should follow visual layout',
      'modal-focus-return': 'Focus should return to trigger element after modal close',
    };
    return behaviors[testType];
  }

  private getActualBehavior(testType: TestType, details: Record<string, unknown>): string {
    const behaviors: Record<TestType, string> = {
      'keyboard-reachability': `Found ${details.unreachableCount} unreachable elements`,
      'keyboard-trap': details.isTrapped ? 'Focus is trapped' : 'Focus loop is working',
      'focus-visibility': details.hasFocusVisible ? 'Focus indicator is visible' : 'Focus indicator is hidden',
      'focus-order': details.isCorrectOrder ? 'Tab order is correct' : 'Tab order does not follow visual layout',
      'modal-focus-return': details.focusReturned ? 'Focus returned to trigger' : 'Focus did not return to trigger',
    };
    return behaviors[testType];
  }

  private getFixSuggestion(testType: TestType): string {
    const suggestions: Record<TestType, string> = {
      'keyboard-reachability': 'Add tabindex="0" to all interactive elements and ensure proper focus management',
      'keyboard-trap': 'Implement focus trapping with Tab/Shift+Tab navigation between first and last elements',
      'focus-visibility': 'Add visible focus styles using outline or box-shadow CSS properties',
      'focus-order': 'Adjust tabindex values or reorganize HTML to match visual layout',
      'modal-focus-return': 'Store trigger element reference and restore focus after modal closes',
    };
    return suggestions[testType];
  }
}
