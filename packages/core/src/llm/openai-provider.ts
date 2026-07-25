import axios from 'axios';
import type { Page } from 'playwright';
import type { TestType, LLMResult } from '../types/index.js';
import type { LLMProvider, LLMConfig } from './types.js';
import { MODEL_PROVIDERS } from './config.js';
import { logger } from '../utils/logger.js';

const PROMPTS: Record<TestType, string> = {
  'keyboard-reachability': `你是一个无障碍审计专家。请分析页面上的交互式元素，判断它们是否都能通过键盘访问。

页面信息：{pageInfo}

请输出：
1. 是否所有交互式元素都可通过键盘访问
2. 如果有不可达元素，请列出它们
3. 提供改进建议`,
  'keyboard-trap': `你是一个无障碍审计专家。请分析页面上的模态框或可聚焦区域，判断是否存在键盘陷阱。

页面信息：{pageInfo}

请输出：
1. 是否存在键盘陷阱
2. 如果存在，描述陷阱位置和原因
3. 提供修复建议`,
  'focus-visibility': `你是一个无障碍审计专家。请分析页面的焦点可见性。

页面信息：{pageInfo}

请输出：
1. 焦点指示器是否可见
2. 如果不可见，描述问题
3. 提供修复建议`,
  'focus-order': `你是一个无障碍审计专家。请分析页面的Tab键焦点顺序。

页面信息：{pageInfo}

请输出：
1. Tab顺序是否符合视觉布局
2. 如果不符合，描述问题元素
3. 提供修复建议`,
  'modal-focus-return': `你是一个无障碍审计专家。请分析模态框关闭后的焦点管理。

页面信息：{pageInfo}

请输出：
1. 模态框关闭后焦点是否正确返回到触发元素
2. 如果不正确，描述问题
3. 提供修复建议`,
};

export class OpenAIProvider implements LLMProvider {
  name: string;
  supportsBYOLLM = true;

  private config: LLMConfig;

  constructor(config: LLMConfig) {
    this.name = config.provider;
    this.config = this.resolveConfig(config);
  }

  configure(config: LLMConfig): void {
    this.name = config.provider;
    this.config = this.resolveConfig(config);
  }

  private resolveConfig(config: LLMConfig): LLMConfig {
    const providerConfig = MODEL_PROVIDERS[config.provider];
    
    return {
      ...config,
      apiKey: config.apiKey || providerConfig.apiKey,
      baseUrl: config.baseUrl || providerConfig.baseUrl,
      model: config.model || providerConfig.model,
    };
  }

  async analyze(page: Page, type: TestType, target?: string): Promise<LLMResult> {
    if (!this.config.apiKey || !this.config.baseUrl) {
      logger.warn(`${this.name} API key or base URL not configured, using mock responses`);
      return this.getMockResult(type);
    }

    try {
      const pageInfo = await this.getPageInfo(page, target);
      const prompt = PROMPTS[type];

      const endpoint = `${this.config.baseUrl}/chat/completions`;

      const response = await axios.post(
        endpoint,
        {
          model: this.config.model || 'qwen-plus',
          temperature: this.config.temperature || 0.2,
          max_tokens: this.config.maxTokens || 1024,
          messages: [
            {
              role: 'system',
              content: '你是一个专业的无障碍合规审计专家，精通WCAG 2.1 AA标准和EN 301 549规范。请根据页面信息进行分析。',
            },
            {
              role: 'user',
              content: prompt.replace('{pageInfo}', pageInfo),
            },
          ],
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.config.apiKey}`,
          },
        }
      );

      const result = response.data.choices[0]?.message?.content || '';
      return this.parseResult(type, result);
    } catch (error) {
      logger.error(`${this.name} LLM analysis failed: ${(error as Error).message}`);
      return this.getMockResult(type);
    }
  }

  private async getPageInfo(page: Page, target?: string): Promise<string> {
    try {
      const info = await page.evaluate((selector) => {
        const pageInfo: Record<string, unknown> = {};

        const interactiveElements = Array.from(
          document.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
        );
        pageInfo.interactiveElements = interactiveElements.map((el) => ({
          tag: el.tagName,
          text: el.textContent?.slice(0, 50),
          tabindex: el.getAttribute('tabindex'),
          ariaLabel: el.getAttribute('aria-label'),
        }));

        if (selector) {
          const targetEl = document.querySelector(selector);
          if (targetEl) {
            pageInfo.targetElement = {
              tag: targetEl.tagName,
              className: targetEl.getAttribute('class'),
            };
          }
        }

        return JSON.stringify(pageInfo, null, 2);
      }, target || '');

      return info;
    } catch {
      return '{}';
    }
  }

  private parseResult(type: TestType, result: string): LLMResult {
    const lowerResult = result.toLowerCase();
    let status: LLMResult['status'] = 'unknown';

    if (lowerResult.includes('pass') || lowerResult.includes('符合') || lowerResult.includes('正确')) {
      status = 'pass';
    } else if (lowerResult.includes('fail') || lowerResult.includes('不符合') || lowerResult.includes('问题')) {
      status = 'fail';
    }

    return {
      status,
      insight: result,
    };
  }

  private getMockResult(type: TestType): LLMResult {
    const insights: Record<TestType, string> = {
      'keyboard-reachability': 'LLM未配置，使用规则引擎结果。检查所有交互式元素是否可通过键盘访问。',
      'keyboard-trap': 'LLM未配置，使用规则引擎结果。检查模态框是否存在键盘陷阱。',
      'focus-visibility': 'LLM未配置，使用规则引擎结果。检查焦点指示器是否可见。',
      'focus-order': 'LLM未配置，使用规则引擎结果。检查Tab顺序是否符合视觉布局。',
      'modal-focus-return': 'LLM未配置，使用规则引擎结果。检查模态框关闭后焦点是否正确返回。',
    };

    return {
      status: 'unknown',
      insight: insights[type],
    };
  }
}