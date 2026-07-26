import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScanTask, TaskStatus } from './scan-task.entity';
import { AxeScanner, defaultRules } from '@accessaudit/core';
import type { ScanResult } from '@accessaudit/core';

interface CreateTaskOptions {
  userId: string | null;
  url: string;
  options?: {
    rules?: string[];
    includeHidden?: boolean;
    timeout?: number;
    maxPages?: number;
  };
  priority?: number;
  webhookUrl?: string;
}

interface QueueStatus {
  pendingCount: number;
  processingCount: number;
  completedCount: number;
  failedCount: number;
  maxConcurrent: number;
}

interface StaticScanOptions {
  url: string;
  rules?: string[];
  includeHidden?: boolean;
  timeout?: number;
  maxPages?: number;
}

@Injectable()
export class TaskService implements OnModuleInit, OnModuleDestroy {
  private readonly MAX_CONCURRENT_TASKS = 3;
  private processingTasks = new Set<string>();
  private isProcessing = false;
  private shutdown = false;
  private scanner = new AxeScanner();

  constructor(
    @InjectRepository(ScanTask)
    private readonly taskRepository: Repository<ScanTask>,
  ) {}

  onModuleInit() {
    this.startProcessing();
  }

  onModuleDestroy() {
    this.shutdown = true;
  }

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

  async staticScan(options: StaticScanOptions): Promise<ScanResult> {
    const rules = options.rules && options.rules.length > 0 ? options.rules : defaultRules;
    return this.scanner.scan(options.url, rules);
  }

  async createTask(options: CreateTaskOptions): Promise<ScanTask> {
    const { userId, url, options: scanOptions, priority = 0, webhookUrl } = options;
    
    const task = this.taskRepository.create({
      userId,
      url,
      options: scanOptions || null,
      status: 'pending',
      priority,
      webhookUrl: webhookUrl || null,
      retryCount: 0,
      maxRetries: 3,
      currentPage: 0,
      totalPages: scanOptions?.maxPages || 1,
      progress: 0,
    });

    return this.taskRepository.save(task);
  }

  async getTaskById(taskId: string): Promise<ScanTask | null> {
    return this.taskRepository.findOne({ where: { id: taskId } });
  }

  async getTasksByUserId(userId: string, limit = 20, offset = 0): Promise<ScanTask[]> {
    return this.taskRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  async cancelTask(taskId: string): Promise<boolean> {
    const task = await this.taskRepository.findOne({ where: { id: taskId } });
    if (!task) return false;

    if (task.status === 'pending' || task.status === 'processing') {
      task.status = 'cancelled';
      await this.taskRepository.save(task);
      
      if (this.processingTasks.has(taskId)) {
        this.processingTasks.delete(taskId);
      }
      return true;
    }
    return false;
  }

  async getQueueStatus(): Promise<QueueStatus> {
    const pendingCount = await this.taskRepository.count({ where: { status: 'pending' } });
    const processingCount = this.processingTasks.size;
    const completedCount = await this.taskRepository.count({ where: { status: 'completed' } });
    const failedCount = await this.taskRepository.count({ where: { status: 'failed' } });

    return {
      pendingCount,
      processingCount,
      completedCount,
      failedCount,
      maxConcurrent: this.MAX_CONCURRENT_TASKS,
    };
  }

  async deleteOldTasks(daysToKeep = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await this.taskRepository.delete({
      status: 'completed',
      completedAt: cutoffDate,
    });

    return result.affected || 0;
  }

  private async startProcessing() {
    while (!this.shutdown) {
      await this.processNextTasks();
      await this.sleep(1000);
    }
  }

  private async processNextTasks() {
    if (this.processingTasks.size >= this.MAX_CONCURRENT_TASKS) {
      return;
    }

    const availableSlots = this.MAX_CONCURRENT_TASKS - this.processingTasks.size;
    
    const pendingTasks = await this.taskRepository.find({
      where: { status: 'pending' },
      order: { priority: 'DESC', createdAt: 'ASC' },
      take: availableSlots,
    });

    for (const task of pendingTasks) {
      if (this.processingTasks.size >= this.MAX_CONCURRENT_TASKS) break;
      if (this.processingTasks.has(task.id)) continue;

      this.processingTasks.add(task.id);
      this.processTask(task).catch((error) => {
        console.error(`Error processing task ${task.id}:`, error);
        this.processingTasks.delete(task.id);
      });
    }
  }

  private async processTask(task: ScanTask) {
    try {
      task.status = 'processing';
      task.progress = 0;
      await this.taskRepository.save(task);

      const maxPages = task.options?.maxPages || task.totalPages || 1;
      const results: unknown[] = [];

      for (let pageNum = 0; pageNum < maxPages; pageNum++) {
        if ((task.status as TaskStatus) === 'cancelled') {
          console.log(`Task ${task.id} was cancelled`);
          return;
        }

        task.currentPage = pageNum + 1;
        task.progress = Math.round(((pageNum + 1) / maxPages) * 100);
        await this.taskRepository.save(task);

        try {
          const scanUrl = maxPages > 1 ? `${task.url}?page=${pageNum}` : task.url;
          const scanResult = await this.staticScan({
            url: scanUrl,
            rules: task.options?.rules,
            includeHidden: task.options?.includeHidden,
            timeout: task.options?.timeout,
          });
          
          if (scanResult && typeof scanResult === 'object') {
            const score = this.calculateScore(scanResult);
            (scanResult as unknown as Record<string, unknown>).score = score;
          }
          results.push(scanResult);
        } catch (pageError) {
          console.error(`Error scanning page ${pageNum + 1} for task ${task.id}:`, pageError);
        }
      }

      if ((task.status as TaskStatus) === 'cancelled') {
        return;
      }

      const totalViolations = results.reduce((sum: number, r: unknown) => {
        const result = r as Record<string, unknown>;
        return sum + (result.totalViolations as number || 0);
      }, 0);

      const critical = results.reduce((sum: number, r: unknown) => {
        const result = r as Record<string, unknown>;
        return sum + (result.critical as number || 0);
      }, 0);

      const serious = results.reduce((sum: number, r: unknown) => {
        const result = r as Record<string, unknown>;
        return sum + (result.serious as number || 0);
      }, 0);

      const moderate = results.reduce((sum: number, r: unknown) => {
        const result = r as Record<string, unknown>;
        return sum + (result.moderate as number || 0);
      }, 0);

      const minor = results.reduce((sum: number, r: unknown) => {
        const result = r as Record<string, unknown>;
        return sum + (result.minor as number || 0);
      }, 0);

      const overallScore = results.length > 0
        ? Math.round(results.reduce((sum: number, r: unknown) => {
            const result = r as Record<string, unknown>;
            return sum + (result.score as number || 0);
          }, 0) / results.length)
        : 0;

      task.status = 'completed';
      task.result = {
        results,
        totalPages: results.length,
        totalViolations,
        critical,
        serious,
        moderate,
        minor,
        overallScore,
      };
      task.progress = 100;
      task.completedAt = new Date();
      await this.taskRepository.save(task);

      if (task.webhookUrl) {
        await this.sendWebhook(task);
      }
    } catch (error) {
      task.retryCount++;
      
      if (task.retryCount < task.maxRetries) {
        task.status = 'pending';
        task.errorMessage = error instanceof Error ? error.message : String(error);
        task.errorStack = error instanceof Error ? (error.stack || null) : null;
        await this.taskRepository.save(task);
        
        console.log(`Task ${task.id} failed, retrying (attempt ${task.retryCount}/${task.maxRetries})`);
      } else {
        task.status = 'failed';
        task.errorMessage = error instanceof Error ? error.message : String(error);
        task.errorStack = error instanceof Error ? (error.stack || null) : null;
        task.completedAt = new Date();
        await this.taskRepository.save(task);
        
        console.error(`Task ${task.id} failed after ${task.maxRetries} retries:`, error);
      }
    } finally {
      this.processingTasks.delete(task.id);
    }
  }

  private async sendWebhook(task: ScanTask) {
    if (!task.webhookUrl) return;

    try {
      const response = await fetch(task.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: task.id,
          status: task.status,
          result: task.result,
          createdAt: task.createdAt,
          completedAt: task.completedAt,
        }),
      });

      if (!response.ok) {
        console.error(`Webhook delivery failed for task ${task.id}:`, response.status);
      }
    } catch (error) {
      console.error(`Failed to send webhook for task ${task.id}:`, error);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
