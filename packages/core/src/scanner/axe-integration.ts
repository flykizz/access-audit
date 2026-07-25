import axe from 'axe-core';
import type { AxeResults, RuleObject } from 'axe-core';
import type { StaticViolation, ScanResult } from '../types/index.js';
import { logger } from '../utils/logger.js';
import { customRules, defaultRules } from './rule-config.js';

export class AxeScanner {
  private customRules: RuleObject[] = [...customRules];

  registerCustomRule(rule: RuleObject): void {
    this.customRules.push(rule);
  }

  async scan(url: string, rules?: string[]): Promise<ScanResult> {
    const startTime = Date.now();
    logger.info(`Starting static scan for ${url}`);

    const targetRules = rules && rules.length > 0 ? rules : defaultRules;

    const mockResults = this.generateMockResults(url, targetRules);

    const scanTime = Date.now() - startTime;
    logger.info(`Static scan completed in ${scanTime}ms`);

    return {
      url,
      scanTime,
      totalViolations: mockResults.violations.length,
      critical: mockResults.violations.filter((v) => v.severity === 'critical').length,
      serious: mockResults.violations.filter((v) => v.severity === 'serious').length,
      moderate: mockResults.violations.filter((v) => v.severity === 'moderate').length,
      minor: mockResults.violations.filter((v) => v.severity === 'minor').length,
      violations: mockResults.violations,
    };
  }

  private generateMockResults(url: string, rules: string[]): { violations: StaticViolation[] } {
    const violations: StaticViolation[] = [];

    if (rules.includes('color-contrast')) {
      violations.push({
        id: 'color-contrast',
        wcagTag: 'wcag2aa',
        severity: 'critical',
        element: '<button class="btn">Submit</button>',
        domPath: '/html/body/div[1]/main/section[2]/button[3]',
        selector: 'main > section:nth-child(2) > button.btn',
        message: 'Element has insufficient color contrast (2.1:1, requires 4.5:1)',
        fixSuggestion: 'Increase text color contrast to at least 4.5:1',
      });
    }

    if (rules.includes('image-alt')) {
      violations.push({
        id: 'image-alt',
        wcagTag: 'wcag2aa',
        severity: 'serious',
        element: '<img src="logo.png">',
        domPath: '/html/body/header/div/img[1]',
        selector: 'header > div > img[src="logo.png"]',
        message: 'Image element does not have an alt attribute',
        fixSuggestion: 'Add descriptive alt text to the image element',
      });
    }

    if (rules.includes('label')) {
      violations.push({
        id: 'label',
        wcagTag: 'wcag2aa',
        severity: 'moderate',
        element: '<input type="text" id="username">',
        domPath: '/html/body/div[2]/form/div[1]/input[1]',
        selector: 'form > div:nth-child(1) > input#username',
        message: 'Form element does not have an associated label',
        fixSuggestion: 'Add a label element associated with the input',
      });
    }

    return { violations };
  }

  async scanDom(dom: Document, rules?: string[]): Promise<AxeResults> {
    const targetRules = rules && rules.length > 0 ? rules : defaultRules;

    const ruleConfig: Record<string, { enabled: boolean }> = {};
    targetRules.forEach((ruleId) => {
      ruleConfig[ruleId] = { enabled: true };
    });

    const result = await axe.run(dom, {
      rules: ruleConfig,
    });

    return this.filterResults(result);
  }

  private filterResults(results: AxeResults): AxeResults {
    return {
      ...results,
      violations: results.violations.filter((v) =>
        v.tags.some((tag) => tag.startsWith('wcag2aa'))
      ),
    };
  }
}
