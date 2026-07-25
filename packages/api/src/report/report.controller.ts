import { Controller, Post, Body, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ReportService } from './report.service';
import type { ScanResult, BehaviorResult, CoverageData } from '@accessaudit/core';
import type { Response } from 'express';

interface GenerateReportBody {
  taskId: string;
  scanResults?: ScanResult[];
  behaviorResults?: BehaviorResult[];
  coverage?: CoverageData;
  format?: 'html' | 'json';
  locale?: string;
}

interface GenerateHTMLBody {
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

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: { timestamp: string; requestId: string };
}

@ApiTags('report')
@Controller('api/v1/report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate accessibility report' })
  @ApiResponse({ status: 200, description: 'Report generated successfully' })
  async generateReport(@Body() body: GenerateReportBody): Promise<ApiResponse<unknown>> {
    const result = await this.reportService.generateReport(body);
    return {
      success: true,
      data: result,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: `req-${Date.now()}`,
      },
    };
  }

  @Post('html')
  @ApiOperation({ summary: 'Generate HTML report' })
  @ApiResponse({ status: 200, description: 'HTML report generated successfully' })
  async generateHTMLReport(
    @Body() body: GenerateHTMLBody,
    @Res() res: Response
  ): Promise<void> {
    const result = await this.reportService.generateHTMLReport(body);
    res.setHeader('Content-Type', result.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="accessibility-report.html"`);
    res.send(result.content);
  }
}
