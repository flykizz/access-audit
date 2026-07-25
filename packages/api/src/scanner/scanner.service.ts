import { Injectable } from '@nestjs/common';
import { AxeScanner, defaultRules, ruleCategories } from '@accessaudit/core';
import type { ScanResult } from '@accessaudit/core';

interface StaticScanOptions {
  url: string;
  rules?: string[];
  includeHidden?: boolean;
  timeout?: number;
}

interface RulesResult {
  rules: {
    id: string;
    name: string;
    category: string;
    severity: string;
    description: string;
    wcagTag: string;
  }[];
  total: number;
}

@Injectable()
export class ScannerService {
  private scanner = new AxeScanner();

  async staticScan(options: StaticScanOptions): Promise<ScanResult> {
    const rules = options.rules && options.rules.length > 0 ? options.rules : defaultRules;
    return this.scanner.scan(options.url, rules);
  }

  getRules(category?: string): RulesResult {
    const allRules = [
      { id: 'color-contrast', name: 'Color Contrast', category: 'perceivable', severity: 'critical', description: 'Checks for sufficient color contrast', wcagTag: 'wcag2aa' },
      { id: 'image-alt', name: 'Image Alt', category: 'perceivable', severity: 'serious', description: 'Checks for image alt attributes', wcagTag: 'wcag2aa' },
      { id: 'label', name: 'Form Label', category: 'operable', severity: 'moderate', description: 'Checks for form label associations', wcagTag: 'wcag2aa' },
      { id: 'button-name', name: 'Button Name', category: 'operable', severity: 'serious', description: 'Checks for accessible button names', wcagTag: 'wcag2aa' },
      { id: 'link-name', name: 'Link Name', category: 'operable', severity: 'serious', description: 'Checks for accessible link names', wcagTag: 'wcag2aa' },
      { id: 'aria-valid-attr', name: 'ARIA Valid Attributes', category: 'robust', severity: 'moderate', description: 'Checks for valid ARIA attributes', wcagTag: 'wcag2aa' },
    ];

    const filteredRules = category
      ? allRules.filter(r => r.category === category)
      : allRules;

    return {
      rules: filteredRules,
      total: filteredRules.length,
    };
  }
}
