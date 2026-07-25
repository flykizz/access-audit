import type { ScanResult, BehaviorResult, CoverageData } from '../types/index.js';

export interface ReportOptions {
  format: 'html' | 'json';
  locale?: string;
  includeHeader?: boolean;
  includeSummary?: boolean;
  includeDetails?: boolean;
  includeRecommendations?: boolean;
}

export interface ViolationDetail {
  id: string;
  wcagTag: string;
  severity: string;
  element: string;
  domPath: string;
  selector: string;
  message: string;
  fixSuggestion: string;
}

export interface PageReport {
  url: string;
  scanTime: number;
  totalViolations: number;
  critical: number;
  serious: number;
  moderate: number;
  minor: number;
  violations: ViolationDetail[];
  behaviorResults?: BehaviorResult[];
}

export interface ReportResult {
  scanMode: 'full-site' | 'path-discovery';
  totalPagesScanned: number;
  coverage?: CoverageData;
  pages: PageReport[];
}

export class ReportGenerator {
  async generate(
    scanResults: ScanResult[],
    behaviorResults: BehaviorResult[] = [],
    coverage?: CoverageData,
    options: ReportOptions = { format: 'json' },
    scanMode: 'full-site' | 'path-discovery' = 'path-discovery'
  ): Promise<string | ReportResult> {
    const pages: PageReport[] = scanResults.map((scan) => ({
      url: scan.url,
      scanTime: scan.scanTime,
      totalViolations: scan.totalViolations,
      critical: scan.critical,
      serious: scan.serious,
      moderate: scan.moderate,
      minor: scan.minor,
      violations: scan.violations.map(v => ({
        id: v.id,
        wcagTag: v.wcagTag,
        severity: v.severity,
        element: v.element,
        domPath: v.domPath,
        selector: v.selector,
        message: v.message,
        fixSuggestion: v.fixSuggestion,
      })),
      behaviorResults,
    }));

    const result: ReportResult = {
      scanMode,
      totalPagesScanned: pages.length,
      coverage,
      pages,
    };

    if (options.format === 'html') {
      return this.generateHTML(result, options);
    }

    return JSON.stringify(result, null, 2);
  }

  private generateHTML(result: ReportResult, options: ReportOptions): string {
    const locale = options.locale || 'en';
    const includeHeader = options.includeHeader !== false;
    const includeSummary = options.includeSummary !== false;
    const includeDetails = options.includeDetails !== false;
    const includeRecommendations = options.includeRecommendations !== false;

    const htmlParts: string[] = [];

    if (includeHeader) {
      htmlParts.push(`<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Accessibility Audit Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 1400px; margin: 0 auto; padding: 40px 20px; background: #f5f7fa; }
    .header { background: linear-gradient(135deg, #1976d2 0%, #42a5f5 100%); color: white; padding: 30px; border-radius: 12px; margin-bottom: 30px; }
    .header h1 { font-size: 28px; margin-bottom: 10px; }
    .header p { opacity: 0.9; font-size: 14px; }
    .summary { background: white; border-radius: 12px; padding: 24px; margin-bottom: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .summary h2 { color: #333; margin-bottom: 20px; font-size: 20px; }
    .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 20px; }
    .stat-card { background: #f8f9fa; padding: 16px; border-radius: 8px; text-align: center; }
    .stat-card.critical { background: #fff5f5; }
    .stat-card.serious { background: #fff8f0; }
    .stat-card.moderate { background: #f0f7ff; }
    .stat-card.minor { background: #f0fff4; }
    .stat-value { font-size: 32px; font-weight: bold; }
    .stat-card.critical .stat-value { color: #dc2626; }
    .stat-card.serious .stat-value { color: #ea580c; }
    .stat-card.moderate .stat-value { color: #2563eb; }
    .stat-card.minor .stat-value { color: #16a34a; }
    .stat-label { font-size: 14px; color: #666; margin-top: 4px; }
    .page-section { background: white; border-radius: 12px; padding: 24px; margin-bottom: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid #e0e0e0; }
    .page-url { font-size: 18px; font-weight: 600; color: #1976d2; word-break: break-all; }
    .page-meta { font-size: 12px; color: #999; }
    .page-stats { display: flex; gap: 15px; }
    .page-stat { font-size: 12px; padding: 4px 10px; border-radius: 4px; }
    .page-stat.critical { background: #fef2f2; color: #dc2626; }
    .page-stat.serious { background: #fff7ed; color: #ea580c; }
    .page-stat.moderate { background: #eff6ff; color: #2563eb; }
    .page-stat.minor { background: #f0fdf4; color: #16a34a; }
    .violation-item { border-left: 4px solid; padding: 16px; margin-bottom: 12px; border-radius: 0 8px 8px 0; background: #fafafa; }
    .violation-item.critical { border-color: #dc2626; }
    .violation-item.serious { border-color: #ea580c; }
    .violation-item.moderate { border-color: #2563eb; }
    .violation-item.minor { border-color: #16a34a; }
    .violation-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .violation-severity { font-weight: bold; text-transform: uppercase; font-size: 12px; padding: 2px 8px; border-radius: 4px; }
    .violation-severity.critical { background: #fef2f2; color: #dc2626; }
    .violation-severity.serious { background: #fff7ed; color: #ea580c; }
    .violation-severity.moderate { background: #eff6ff; color: #2563eb; }
    .violation-severity.minor { background: #f0fdf4; color: #16a34a; }
    .violation-message { font-weight: 500; color: #333; margin-bottom: 4px; }
    .violation-element { font-family: monospace; font-size: 12px; color: #666; margin-bottom: 8px; }
    .violation-path { font-family: monospace; font-size: 11px; color: #888; background: #f0f0f0; padding: 4px 8px; border-radius: 4px; margin-bottom: 8px; word-break: break-all; }
    .violation-selector { font-family: monospace; font-size: 11px; color: #888; background: #f0f0f0; padding: 4px 8px; border-radius: 4px; margin-bottom: 8px; word-break: break-all; }
    .violation-fix { background: #f0fdf4; padding: 10px; border-radius: 6px; font-size: 14px; color: #166534; }
    .recommendations { background: white; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .recommendations h2 { color: #333; margin-bottom: 16px; font-size: 20px; }
    .recommendation-item { padding: 12px; background: #f8f9fa; border-radius: 8px; margin-bottom: 8px; }
    .footer { text-align: center; margin-top: 40px; color: #999; font-size: 14px; }
    .path-nav { margin-bottom: 20px; padding: 10px; background: #f8f9fa; border-radius: 8px; }
    .path-nav strong { color: #333; }
  </style>
</head>
<body>`);
    }

    if (includeSummary) {
      const totalViolations = result.pages.reduce((sum, p) => sum + p.totalViolations, 0);
      const critical = result.pages.reduce((sum, p) => sum + p.critical, 0);
      const serious = result.pages.reduce((sum, p) => sum + p.serious, 0);
      const moderate = result.pages.reduce((sum, p) => sum + p.moderate, 0);
      const minor = result.pages.reduce((sum, p) => sum + p.minor, 0);

      htmlParts.push(`<div class="summary">
  <h2>Summary</h2>
  <div class="path-nav">
    <strong>Scan Mode:</strong> ${result.scanMode === 'full-site' ? 'Full Site' : 'Path Discovery'} | 
    <strong>Total Pages:</strong> ${result.totalPagesScanned}
  </div>
  <div class="stats">
    <div class="stat-card critical">
      <div class="stat-value">${critical}</div>
      <div class="stat-label">Critical</div>
    </div>
    <div class="stat-card serious">
      <div class="stat-value">${serious}</div>
      <div class="stat-label">Serious</div>
    </div>
    <div class="stat-card moderate">
      <div class="stat-value">${moderate}</div>
      <div class="stat-label">Moderate</div>
    </div>
    <div class="stat-card minor">
      <div class="stat-value">${minor}</div>
      <div class="stat-label">Minor</div>
    </div>
  </div>
</div>`);
    }

    if (includeDetails) {
      result.pages.forEach((page) => {
        htmlParts.push(`<div class="page-section">
  <div class="page-header">
    <div>
      <div class="page-url">${page.url}</div>
      <div class="page-meta">Scan Time: ${page.scanTime}ms | Total Violations: ${page.totalViolations}</div>
    </div>
    <div class="page-stats">
      ${page.critical > 0 ? `<span class="page-stat critical">${page.critical} Critical</span>` : ''}
      ${page.serious > 0 ? `<span class="page-stat serious">${page.serious} Serious</span>` : ''}
      ${page.moderate > 0 ? `<span class="page-stat moderate">${page.moderate} Moderate</span>` : ''}
      ${page.minor > 0 ? `<span class="page-stat minor">${page.minor} Minor</span>` : ''}
    </div>
  </div>`);

        if (page.violations.length > 0) {
          page.violations.forEach((violation) => {
            htmlParts.push(`<div class="violation-item ${violation.severity}">
  <div class="violation-header">
    <span class="violation-severity ${violation.severity}">${violation.severity}</span>
    <span style="font-size:12px;color:#666">${violation.wcagTag}</span>
  </div>
  <div class="violation-message">${violation.message}</div>
  <div class="violation-element">${violation.element}</div>
  <div class="violation-path">DOM Path: ${violation.domPath}</div>
  <div class="violation-selector">Selector: ${violation.selector}</div>
  <div class="violation-fix">Fix: ${violation.fixSuggestion}</div>
</div>`);
          });
        } else {
          htmlParts.push(`<div style="text-align:center;padding:20px;color:#16a34a;font-weight:500">✓ No violations found</div>`);
        }

        htmlParts.push('</div>');
      });
    }

    if (includeRecommendations) {
      htmlParts.push(`<div class="recommendations">
  <h2>Recommendations</h2>
  <div class="recommendation-item">Fix all critical violations first to meet minimum accessibility standards</div>
  <div class="recommendation-item">Ensure all images have descriptive alt text</div>
  <div class="recommendation-item">Increase color contrast to meet WCAG 2.1 AA standards</div>
  <div class="recommendation-item">Add proper label associations for all form elements</div>
  <div class="recommendation-item">Use the DOM Path and Selector information to locate and fix problematic elements</div>
</div>`);
    }

    htmlParts.push(`<div class="footer">
  Generated by AccessAudit - Accessibility Compliance Platform
</div>
</body>
</html>`);

    return htmlParts.join('\n');
  }
}

export function formatReport(
  scanResults: ScanResult[],
  behaviorResults: BehaviorResult[] = [],
  coverage?: CoverageData,
  scanMode: 'full-site' | 'path-discovery' = 'path-discovery'
): ReportResult {
  const pages: PageReport[] = scanResults.map((scan) => ({
    url: scan.url,
    scanTime: scan.scanTime,
    totalViolations: scan.totalViolations,
    critical: scan.critical,
    serious: scan.serious,
    moderate: scan.moderate,
    minor: scan.minor,
    violations: scan.violations.map(v => ({
      id: v.id,
      wcagTag: v.wcagTag,
      severity: v.severity,
      element: v.element,
      domPath: v.domPath,
      selector: v.selector,
      message: v.message,
      fixSuggestion: v.fixSuggestion,
    })),
    behaviorResults,
  }));

  return {
    scanMode,
    totalPagesScanned: pages.length,
    coverage,
    pages,
  };
}
