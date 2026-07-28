import { Page, Browser, chromium } from 'playwright';
import type { BehaviorTask, BehaviorResult, RuleResult, LLMResult, TestType, OperationPath, OperationStep, ExecutionLog, BehaviorTestResult } from '../types/index.js';
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

function generateId(length: number): string {
  return Math.random().toString(36).substring(2, 2 + length);
}

export class PageAgent {
  private page: Page | null = null;
  private browser: Browser | null = null;
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
    this.browser = await chromium.launch({ headless: true });
    this.page = await this.browser.newPage();
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
    }
  }

  async discoverPaths(url: string, testType: TestType): Promise<OperationPath[]> {
    if (!this.page) {
      await this.init();
    }

    try {
      const currentPage = this.page;
      if (!currentPage) {
        throw new Error('Page not initialized');
      }

      await currentPage.goto(url, { timeout: 30000, waitUntil: 'domcontentloaded' });

      const paths = this.generateMockPaths(testType, url);
      return paths;
    } catch (error) {
      logger.error(`Path discovery failed: ${(error as Error).message}`);
      return [];
    }
  }

  async executePath(path: OperationPath, testType: TestType): Promise<BehaviorTestResult> {
    const executionLogs: ExecutionLog[] = [];

    if (!this.page) {
      await this.init();
    }

    try {
      const currentPage = this.page;
      if (!currentPage) {
        throw new Error('Page not initialized');
      }

      for (const step of path.steps) {
        const startTime = Date.now();
        const log: ExecutionLog = {
          stepId: step.id,
          stepName: step.name,
          action: step.action,
          selector: step.selector,
          timestamp: startTime,
          duration: 0,
          status: 'running',
        };

        executionLogs.push(log);

        try {
          await this.executeStep(currentPage, step);
          log.status = 'passed';
          log.duration = Date.now() - startTime;
        } catch (error) {
          log.status = 'failed';
          log.duration = Date.now() - startTime;
          log.error = (error as Error).message;
          break;
        }
      }

      const llmResult = await this.llmProvider.analyze(currentPage, testType);
      const ruleResult = await this.executeRule(testType);

      const merged = this.mergeResults(llmResult, ruleResult, testType, path.id);
      const allPassed = executionLogs.every((log) => log.status === 'passed');
      const status = allPassed ? merged.status : 'fail';

      return {
        ...merged,
        executionLogs,
        pathId: path.id,
        status,
        actualBehavior: allPassed ? merged.actualBehavior : `步骤执行失败: ${executionLogs.find((l) => l.status === 'failed')?.stepName}`,
      };
    } catch (error) {
      logger.error(`Path execution failed: ${(error as Error).message}`);
      return {
        testType,
        targetElement: '',
        status: 'error',
        expectedBehavior: '',
        actualBehavior: (error as Error).message,
        llmInsight: undefined,
        fixSuggestion: undefined,
        executionLogs,
        pathId: path.id,
      };
    }
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

  private async executeStep(page: Page, step: OperationStep): Promise<void> {
    switch (step.action) {
      case 'navigate':
        if (step.targetUrl) {
          await page.goto(step.targetUrl, { timeout: step.timeout || 30000, waitUntil: 'domcontentloaded' });
        }
        break;
      case 'click':
        if (step.selector) {
          await page.click(step.selector, { timeout: step.timeout || 10000 });
        }
        break;
      case 'type':
        if (step.selector && step.value) {
          await page.fill(step.selector, step.value, { timeout: step.timeout || 10000 });
        }
        break;
      case 'focus':
        if (step.selector) {
          await page.focus(step.selector, { timeout: step.timeout || 5000 });
        }
        break;
      case 'press':
        if (step.value) {
          await page.keyboard.press(step.value);
        }
        break;
      case 'wait':
        await page.waitForTimeout(step.timeout || 1000);
        break;
    }
  }

  private generateMockPaths(testType: TestType, url: string): OperationPath[] {
    const paths: OperationPath[] = [];

    const pathGenerators: Record<TestType, () => OperationPath[]> = {
      'keyboard-reachability': () => [
        {
          id: generateId(12),
          name: '键盘遍历测试路径',
          description: '通过 Tab 键遍历页面所有可交互元素，验证键盘可达性',
          priority: 'high',
          estimatedTime: 15,
          aiConfidence: 0.95,
          aiReasoning: '检测页面上所有 button、a、input、select、textarea 等元素是否都能通过键盘访问',
          steps: [
            { id: 'step-1', name: '聚焦页面', description: '将焦点移动到页面 body 元素', action: 'focus', selector: 'body', expectedResult: '页面获得焦点' },
            { id: 'step-2', name: 'Tab 遍历所有元素', description: '按 Tab 键遍历页面上所有可交互元素', action: 'press', value: 'Tab', expectedResult: '焦点依次移动到可交互元素' },
            { id: 'step-3', name: 'Shift+Tab 返回遍历', description: '按 Shift+Tab 键反向遍历元素', action: 'press', value: 'Shift+Tab', expectedResult: '焦点反向移动' },
          ],
        },
      ],
      'keyboard-trap': () => [
        {
          id: generateId(12),
          name: '模态框焦点陷阱测试',
          description: '打开模态框后，验证 Tab 键是否在模态框内循环，不会跳出到页面其他元素',
          priority: 'critical',
          estimatedTime: 20,
          aiConfidence: 0.92,
          aiReasoning: 'WCAG 要求模态框必须实现焦点陷阱，防止键盘用户跳出模态框',
          steps: [
            { id: 'step-1', name: '打开模态框', description: '点击模态框触发按钮', action: 'click', selector: '[data-modal-trigger]', expectedResult: '模态框显示' },
            { id: 'step-2', name: 'Tab 遍历模态框内元素', description: '在模态框内按 Tab 键遍历', action: 'press', value: 'Tab', expectedResult: '焦点在模态框内元素间循环' },
            { id: 'step-3', name: 'Shift+Tab 返回', description: '按 Shift+Tab 返回上一个元素', action: 'press', value: 'Shift+Tab', expectedResult: '焦点回到模态框第一个元素' },
            { id: 'step-4', name: '关闭模态框', description: '点击关闭按钮关闭模态框', action: 'click', selector: '[data-modal-close]', expectedResult: '模态框关闭' },
          ],
        },
      ],
      'focus-visibility': () => [
        {
          id: generateId(12),
          name: '焦点可见性验证',
          description: '验证页面上所有可聚焦元素在获得焦点时都有可见的焦点指示器',
          priority: 'high',
          estimatedTime: 10,
          aiConfidence: 0.88,
          aiReasoning: '可见的焦点指示器对于键盘用户至关重要，确保用户知道当前焦点位置',
          steps: [
            { id: 'step-1', name: '聚焦第一个按钮', description: '聚焦页面上第一个按钮元素', action: 'focus', selector: 'button:first-of-type', expectedResult: '焦点指示器可见' },
            { id: 'step-2', name: '聚焦链接', description: '聚焦页面上第一个链接元素', action: 'focus', selector: 'a[href]:first-of-type', expectedResult: '焦点指示器可见' },
            { id: 'step-3', name: '聚焦输入框', description: '聚焦页面上第一个输入框元素', action: 'focus', selector: 'input:first-of-type', expectedResult: '焦点指示器可见' },
          ],
        },
      ],
      'focus-order': () => [
        {
          id: generateId(12),
          name: 'Tab 顺序验证',
          description: '验证 Tab 键的遍历顺序是否与视觉布局一致',
          priority: 'medium',
          estimatedTime: 15,
          aiConfidence: 0.85,
          aiReasoning: 'Tab 顺序应遵循视觉从上到下、从左到右的阅读顺序，提升可用性',
          steps: [
            { id: 'step-1', name: '从页面顶部开始', description: '将焦点移动到页面起点', action: 'focus', selector: 'body', expectedResult: '焦点回到起点' },
            { id: 'step-2', name: '依次 Tab 遍历', description: '按 Tab 键遍历检查焦点顺序', action: 'press', value: 'Tab', expectedResult: '焦点按视觉顺序移动' },
            { id: 'step-3', name: '检查特殊 Tabindex', description: '继续 Tab 检查负 tabindex 元素', action: 'press', value: 'Tab', expectedResult: '无负 tabindex 干扰' },
          ],
        },
      ],
      'modal-focus-return': () => [
        {
          id: generateId(12),
          name: '模态框焦点回弹测试',
          description: '验证关闭模态框后，焦点是否正确返回到触发按钮',
          priority: 'critical',
          estimatedTime: 15,
          aiConfidence: 0.90,
          aiReasoning: '关闭模态框后焦点应返回到触发元素，保持用户操作上下文',
          steps: [
            { id: 'step-1', name: '记录触发按钮', description: '聚焦并记录模态框触发按钮', action: 'focus', selector: '[data-modal-trigger]', expectedResult: '触发按钮获得焦点' },
            { id: 'step-2', name: '点击打开模态框', description: '点击触发按钮打开模态框', action: 'click', selector: '[data-modal-trigger]', expectedResult: '模态框打开' },
            { id: 'step-3', name: '关闭模态框', description: '点击关闭按钮关闭模态框', action: 'click', selector: '[data-modal-close]', expectedResult: '模态框关闭' },
            { id: 'step-4', name: '验证焦点返回', description: '检查焦点是否正确返回', action: 'press', value: 'Tab', expectedResult: '焦点应仍在触发按钮或其附近' },
          ],
        },
      ],
    };

    return pathGenerators[testType]?.() ?? [];
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
    name?: string
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
