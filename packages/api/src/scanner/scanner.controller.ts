import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ScannerService } from './scanner.service';

interface StaticScanBody {
  url: string;
  rules?: string[];
  includeHidden?: boolean;
  timeout?: number;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: { timestamp: string; requestId: string };
}

@ApiTags('scanner')
@Controller('api/v1/scanner')
export class ScannerController {
  constructor(private readonly scannerService: ScannerService) {}

  @Post('static')
  @ApiOperation({ summary: 'Execute static accessibility scan' })
  @ApiResponse({ status: 200, description: 'Scan completed successfully' })
  async staticScan(@Body() body: StaticScanBody): Promise<ApiResponse<unknown>> {
    const result = await this.scannerService.staticScan(body);
    return {
      success: true,
      data: result,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: `req-${Date.now()}`,
      },
    };
  }

  @Get('rules')
  @ApiOperation({ summary: 'Get available scan rules' })
  @ApiResponse({ status: 200, description: 'Rules retrieved successfully' })
  getRules(@Query('category') category?: string): ApiResponse<unknown> {
    const result = this.scannerService.getRules(category);
    return {
      success: true,
      data: result,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: `req-${Date.now()}`,
      },
    };
  }
}
