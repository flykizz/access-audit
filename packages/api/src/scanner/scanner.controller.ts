import { Controller, Post, Get, Body, Query, UseGuards, Req, InternalServerErrorException } from '@nestjs/common';
import { ScannerService } from './scanner.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthService } from '../auth/auth.service';
import type { UserRole } from '../auth/user.entity';

interface StaticScanBody {
  url: string;
  rules?: string[];
  includeHidden?: boolean;
  timeout?: number;
  maxPages?: number;
}

interface ScanApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: { timestamp: string; requestId: string };
}

interface CustomRequest {
  user: { userId: string } | null;
}

@Controller('api/v1/scanner')
@UseGuards(JwtAuthGuard)
export class ScannerController {
  constructor(
    private readonly scannerService: ScannerService,
    private readonly authService: AuthService,
  ) {}

  @Post('static')
  async staticScan(
    @Body() body: StaticScanBody,
    @Req() req: CustomRequest,
  ): Promise<ScanApiResponse<unknown>> {
    const requestId = `req-${Date.now()}`;
    
    try {
      console.log(`[${requestId}] Received scan request:`, JSON.stringify(body));
      console.log(`[${requestId}] User info:`, JSON.stringify(req.user));
      
      const userRole = req.user ? await this.getUserRole(req.user.userId) : null;
      console.log(`[${requestId}] User role determined:`, userRole);
      
      const maxPagesAllowed = this.scannerService.getMaxPagesByRole(userRole as UserRole | null);
      console.log(`[${requestId}] Max pages allowed:`, maxPagesAllowed);
      
      let requestedPages = body.maxPages || maxPagesAllowed;
      if (userRole !== 'vip') {
        requestedPages = Math.min(requestedPages, maxPagesAllowed);
      }
      console.log(`[${requestId}] Requested pages:`, requestedPages);

      const result = await this.scannerService.multiPageScan(body, requestedPages);
      console.log(`[${requestId}] Scan completed successfully`, { totalPages: result.totalPages });
      
      return {
        success: true,
        data: result,
        message: `Scanned ${result.totalPages} page(s) (${userRole || 'guest'} tier, max ${maxPagesAllowed} pages)`,
        meta: {
          timestamp: new Date().toISOString(),
          requestId,
        },
      };
    } catch (error) {
      console.error(`[${requestId}] Scan failed with error:`, error);
      throw new InternalServerErrorException({
        message: 'Scan failed',
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        requestId,
      });
    }
  }

  @Get('rules')
  getRules(@Query('category') category?: string): ScanApiResponse<unknown> {
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

  private async getUserRole(userId: string | undefined): Promise<string | null> {
    if (!userId) return null;
    try {
      const user = await this.authService.getUserById(userId);
      return user?.role || null;
    } catch {
      return null;
    }
  }
}
