import { Injectable } from '@nestjs/common';
import { ReportGenerator, formatReport } from '@accessaudit/core';
import type { ScanResult, BehaviorResult, ReportOptions, CoverageData } from '@accessaudit/core';

interface GenerateReportOptions {
  taskId: string;
  scanResults?: ScanResult[];
  behaviorResults?: BehaviorResult[];
  coverage?: CoverageData;
  format?: 'html' | 'json';
  locale?: string;
}

interface GenerateHTMLReportOptions {
  taskId: string;
  scanResults?: ScanResult[];
  behaviorResults?: BehaviorResult[];
  coverage?: CoverageData;
  locale?: string;
  includeHeader?: boolean;
  includeSummary?: boolean;
  includeDetails?: boolean;
  includeRecommendations?: boolean;
}

interface ReportResult {
  reportId: string;
  format: 'html' | 'json';
  content: string;
  contentType: string;
  generatedAt: string;
}

@Injectable()
export class ReportService {
  async generateReport(options: GenerateReportOptions): Promise<ReportResult> {
    const reportGenerator = new ReportGenerator();
    
    const reportOptions: ReportOptions = {
      format: options.format || 'json',
      locale: options.locale || 'en',
      includeHeader: true,
      includeSummary: true,
      includeDetails: true,
      includeRecommendations: true,
    };

    const report = await reportGenerator.generate(
      options.scanResults || [],
      options.behaviorResults || [],
      options.coverage,
      reportOptions
    );

    return {
      reportId: `report-${Date.now()}`,
      format: options.format || 'json',
      content: typeof report === 'object' ? JSON.stringify(report) : report,
      contentType: options.format === 'html' ? 'text/html' : 'application/json',
      generatedAt: new Date().toISOString(),
    };
  }

  async generateHTMLReport(options: GenerateHTMLReportOptions): Promise<ReportResult> {
    const reportGenerator = new ReportGenerator();
    
    const reportOptions: ReportOptions = {
      format: 'html',
      locale: options.locale || 'en',
      includeHeader: options.includeHeader !== false,
      includeSummary: options.includeSummary !== false,
      includeDetails: options.includeDetails !== false,
      includeRecommendations: options.includeRecommendations !== false,
    };

    const report = await reportGenerator.generate(
      options.scanResults || [],
      options.behaviorResults || [],
      options.coverage,
      reportOptions
    );

    return {
      reportId: `report-${Date.now()}`,
      format: 'html',
      content: typeof report === 'object' ? JSON.stringify(report) : report,
      contentType: 'text/html',
      generatedAt: new Date().toISOString(),
    };
  }

  formatViolations(scanResults: ScanResult[]): unknown[] {
    return scanResults.flatMap(result => 
      result.violations.map(violation => ({
        ruleId: violation.id,
        wcagTag: violation.wcagTag,
        severity: violation.severity,
        element: violation.element,
        message: violation.message,
        fixSuggestion: violation.fixSuggestion,
      }))
    );
  }
}
