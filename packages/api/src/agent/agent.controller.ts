import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AgentService } from './agent.service';
import type { TestType } from '@accessaudit/core';

interface BehaviorTestBody {
  url: string;
  testType: TestType;
  target?: string;
  expected?: string;
  maxIterations?: number;
}

interface BatchTestBody {
  url: string;
  tests: { testType: TestType; target?: string }[];
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: { timestamp: string; requestId: string };
}

@ApiTags('agent')
@Controller('api/v1/agent')
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  @Post('behavior')
  @ApiOperation({ summary: 'Execute behavior test' })
  @ApiResponse({ status: 200, description: 'Test completed successfully' })
  async behaviorTest(@Body() body: BehaviorTestBody): Promise<ApiResponse<unknown>> {
    const result = await this.agentService.behaviorTest(body);
    return {
      success: true,
      data: result,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: `req-${Date.now()}`,
      },
    };
  }

  @Post('batch')
  @ApiOperation({ summary: 'Execute batch behavior tests' })
  @ApiResponse({ status: 200, description: 'Batch tests completed successfully' })
  async batchTest(@Body() body: BatchTestBody): Promise<ApiResponse<unknown>> {
    const result = await this.agentService.batchTest(body);
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
