import { Controller, Post, Get, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EngineService } from './engine.service';
import type { AuditConfig } from '@accessaudit/core';

interface CreateTaskBody {
  name: string;
  urls: string[];
  config: AuditConfig;
  callbackUrl?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: { timestamp: string; requestId: string };
}

@ApiTags('engine')
@Controller('api/v1/engine')
export class EngineController {
  constructor(private readonly engineService: EngineService) {}

  @Post('tasks')
  @ApiOperation({ summary: 'Create audit task' })
  @ApiResponse({ status: 201, description: 'Task created successfully' })
  async createTask(@Body() body: CreateTaskBody): Promise<ApiResponse<unknown>> {
    const result = await this.engineService.createTask(body);
    return {
      success: true,
      data: result,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: `req-${Date.now()}`,
      },
    };
  }

  @Get('tasks/:taskId')
  @ApiOperation({ summary: 'Get task status' })
  @ApiResponse({ status: 200, description: 'Task retrieved successfully' })
  getTask(@Param('taskId') taskId: string): ApiResponse<unknown> {
    const result = this.engineService.getTask(taskId);
    if (!result) {
      return {
        success: false,
        data: null,
        message: 'Task not found',
      };
    }
    return {
      success: true,
      data: result,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: `req-${Date.now()}`,
      },
    };
  }

  @Get('tasks')
  @ApiOperation({ summary: 'Get task list' })
  @ApiResponse({ status: 200, description: 'Tasks retrieved successfully' })
  listTasks(@Query('status') status?: string): ApiResponse<unknown> {
    const result = this.engineService.listTasks(status);
    return {
      success: true,
      data: result,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: `req-${Date.now()}`,
      },
    };
  }

  @Get('coverage/:taskId')
  @ApiOperation({ summary: 'Get coverage data' })
  @ApiResponse({ status: 200, description: 'Coverage data retrieved successfully' })
  getCoverage(@Param('taskId') taskId: string): ApiResponse<unknown> {
    const result = this.engineService.getCoverage(taskId);
    if (!result) {
      return {
        success: false,
        data: null,
        message: 'Coverage data not found',
      };
    }
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
