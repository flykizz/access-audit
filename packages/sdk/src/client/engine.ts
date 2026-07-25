import axios from 'axios';
import type { AuditTask, CoverageData, AuditConfig } from '@accessaudit/core';

interface CreateTaskOptions {
  name: string;
  urls: string[];
  config: AuditConfig;
  callbackUrl?: string;
}

interface TaskResult {
  taskId: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress?: number;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

interface ListTasksOptions {
  status?: string;
  page?: number;
  limit?: number;
}

interface ListTasksResult {
  tasks: TaskResult[];
  total: number;
  page: number;
  limit: number;
}

interface CoverageResult {
  taskId: string;
  coverage: CoverageData;
  missingCoverage: string[];
  suggestions: string[];
}

export class EngineAPI {
  private baseUrl: string;
  private apiKey?: string;

  constructor(baseUrl: string, apiKey?: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  async createTask(options: CreateTaskOptions): Promise<TaskResult> {
    const headers = this.apiKey ? { 'X-API-Key': this.apiKey } : {};
    const response = await axios.post(`${this.baseUrl}/api/v1/engine/tasks`, options, { headers });
    return response.data.data;
  }

  async getTask(taskId: string): Promise<TaskResult> {
    const headers = this.apiKey ? { 'X-API-Key': this.apiKey } : {};
    const response = await axios.get(`${this.baseUrl}/api/v1/engine/tasks/${taskId}`, { headers });
    return response.data.data;
  }

  async listTasks(options?: ListTasksOptions): Promise<ListTasksResult> {
    const headers = this.apiKey ? { 'X-API-Key': this.apiKey } : {};
    const params = options || {};
    const response = await axios.get(`${this.baseUrl}/api/v1/engine/tasks`, { headers, params });
    return response.data.data;
  }

  async getCoverage(taskId: string): Promise<CoverageResult> {
    const headers = this.apiKey ? { 'X-API-Key': this.apiKey } : {};
    const response = await axios.get(`${this.baseUrl}/api/v1/engine/coverage/${taskId}`, { headers });
    return response.data.data;
  }
}
