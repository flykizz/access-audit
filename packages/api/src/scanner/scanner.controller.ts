import { Controller, Post, Get, Body, Query, UseGuards, Req } from '@nestjs/common';
import { TaskService } from './task.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthService } from '../auth/auth.service';
import type { UserRole } from '../auth/user.entity';

interface StaticScanBody {
  url: string;
  rules?: string[];
  includeHidden?: boolean;
  timeout?: number;
  maxPages?: number;
  webhookUrl?: string;
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
    private readonly taskService: TaskService,
    private readonly authService: AuthService,
  ) {}

  private getMaxPagesByRole(role: UserRole | null): number {
    if (!role || role === 'guest') return 1;
    if (role === 'user') return 3;
    if (role === 'vip') return 50;
    return 1;
  }

  private getRules(category?: string) {
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
      
      const maxPagesAllowed = this.getMaxPagesByRole(userRole as UserRole | null);
      console.log(`[${requestId}] Max pages allowed:`, maxPagesAllowed);
      
      let requestedPages = body.maxPages || maxPagesAllowed;
      if (userRole !== 'vip') {
        requestedPages = Math.min(requestedPages, maxPagesAllowed);
      }
      console.log(`[${requestId}] Requested pages:`, requestedPages);

      const userId = req.user?.userId || null;
      const priority = userRole === 'vip' ? 10 : (userRole === 'user' ? 5 : 0);

      const task = await this.taskService.createTask({
        userId,
        url: body.url,
        options: {
          rules: body.rules,
          includeHidden: body.includeHidden,
          timeout: body.timeout,
          maxPages: requestedPages,
        },
        priority,
        webhookUrl: body.webhookUrl,
      });

      const queueStatus = await this.taskService.getQueueStatus();

      console.log(`[${requestId}] Task created: ${task.id}, status: ${task.status}`);
      
      return {
        success: true,
        data: {
          taskId: task.id,
          status: task.status,
          url: body.url,
          totalPages: requestedPages,
          priority,
          queueStatus: {
            pendingCount: queueStatus.pendingCount,
            processingCount: queueStatus.processingCount,
            maxConcurrent: queueStatus.maxConcurrent,
          },
        },
        message: `Scan task created successfully. Check status at /api/v1/tasks/${task.id}`,
        meta: {
          timestamp: new Date().toISOString(),
          requestId,
        },
      };
    } catch (error) {
      console.error(`[${requestId}] Failed to create scan task:`, error);
      return {
        success: false,
        data: null,
        message: 'Failed to create scan task',
        meta: {
          timestamp: new Date().toISOString(),
          requestId,
        },
      };
    }
  }

  @Get('rules')
  getRulesEndpoint(@Query('category') category?: string): ScanApiResponse<unknown> {
    const result = this.getRules(category);
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
