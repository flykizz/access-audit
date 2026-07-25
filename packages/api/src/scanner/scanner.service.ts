import { Injectable } from '@nestjs/common';
import { AxeScanner, defaultRules } from '@accessaudit/core';
import type { ScanResult } from '@accessaudit/core';
import type { UserRole } from '../auth/user.entity';

interface StaticScanOptions {
  url: string;
  rules?: string[];
  includeHidden?: boolean;
  timeout?: number;
  maxPages?: number;
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

interface MultiPageScanResult {
  results: ScanResult[];
  totalPages: number;
  totalViolations: number;
  critical: number;
  serious: number;
  moderate: number;
  minor: number;
  overallScore: number;
}

@Injectable()
export class ScannerService {
  private scanner = new AxeScanner();

  calculateScore(result: ScanResult): number {
    const weight = {
      critical: 50,
      serious: 25,
      moderate: 15,
      minor: 10,
    };

    const totalWeight = (result.critical + result.serious + result.moderate + result.minor) * 100;
    if (totalWeight === 0) return 100;

    const deduction =
      result.critical * weight.critical +
      result.serious * weight.serious +
      result.moderate * weight.moderate +
      result.minor * weight.minor;

    const score = Math.max(0, Math.round(100 - deduction));
    return score;
  }

  getMaxPagesByRole(role: UserRole | null): number {
    if (!role || role === 'guest') return 1;
    if (role === 'user') return 3;
    if (role === 'vip') return 50;
    return 1;
  }

  async staticScan(options: StaticScanOptions): Promise<ScanResult> {
    const rules = options.rules && options.rules.length > 0 ? options.rules : defaultRules;
    return this.scanner.scan(options.url, rules);
  }

  async multiPageScan(options: StaticScanOptions, maxPages: number): Promise<MultiPageScanResult> {
    const rules = options.rules && options.rules.length > 0 ? options.rules : defaultRules;
    const results: ScanResult[] = [];

    try {
      const result = await this.scanner.scan(options.url, rules);
      result.score = this.calculateScore(result);
      results.push(result);

      if (maxPages > 1) {
        for (let i = 1; i < maxPages; i++) {
          try {
            const pageResult = await this.scanner.scan(`${options.url}?page=${i}`, rules);
            pageResult.score = this.calculateScore(pageResult);
            results.push(pageResult);
          } catch (error) {
            console.error(`Failed to scan page ${i}:`, error);
          }
        }
      }
    } catch (error) {
      console.error('Scan failed:', error);
      throw error;
    }

    const totalViolations = results.reduce((sum, r) => sum + r.totalViolations, 0);
    const critical = results.reduce((sum, r) => sum + r.critical, 0);
    const serious = results.reduce((sum, r) => sum + r.serious, 0);
    const moderate = results.reduce((sum, r) => sum + r.moderate, 0);
    const minor = results.reduce((sum, r) => sum + r.minor, 0);

    const overallScore = results.length > 0
      ? Math.round(results.reduce((sum, r) => sum + (r.score || 0), 0) / results.length)
      : 0;

    return {
      results,
      totalPages: results.length,
      totalViolations,
      critical,
      serious,
      moderate,
      minor,
      overallScore,
    };
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
