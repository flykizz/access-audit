import { Controller, Get, Delete, Param, UseGuards, Req } from '@nestjs/common';
import { TaskService } from './task.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

interface CustomRequest {
  user: { userId: string } | null;
}

interface TaskApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

@Controller('api/v1/tasks')
@UseGuards(JwtAuthGuard)
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get(':id')
  async getTask(@Param('id') id: string): Promise<TaskApiResponse<unknown>> {
    const task = await this.taskService.getTaskById(id);
    if (!task) {
      return {
        success: false,
        data: null,
        message: 'Task not found',
      };
    }

    return {
      success: true,
      data: task,
    };
  }

  @Get('')
  async getTasks(
    @Req() req: CustomRequest,
    @Param('limit') limit?: string,
    @Param('offset') offset?: string,
  ): Promise<TaskApiResponse<unknown>> {
    const userId = req.user?.userId || null;
    const tasks = await this.taskService.getTasksByUserId(
      userId || '',
      parseInt(limit || '20', 10),
      parseInt(offset || '0', 10),
    );

    return {
      success: true,
      data: tasks,
    };
  }

  @Get(':id/cancel')
  async cancelTask(@Param('id') id: string): Promise<TaskApiResponse<unknown>> {
    const success = await this.taskService.cancelTask(id);
    
    if (!success) {
      return {
        success: false,
        data: null,
        message: 'Failed to cancel task or task not found',
      };
    }

    return {
      success: true,
      data: { taskId: id, cancelled: true },
      message: 'Task cancelled successfully',
    };
  }

  @Get('queue/status')
  async getQueueStatus(): Promise<TaskApiResponse<unknown>> {
    const status = await this.taskService.getQueueStatus();
    return {
      success: true,
      data: status,
    };
  }

  @Delete('cleanup')
  async cleanupOldTasks(): Promise<TaskApiResponse<unknown>> {
    const deletedCount = await this.taskService.deleteOldTasks(30);
    return {
      success: true,
      data: { deletedCount },
      message: `Deleted ${deletedCount} old completed tasks`,
    };
  }
}
