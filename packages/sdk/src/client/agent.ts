import axios from 'axios';
import type { BehaviorResult, TestType } from '@accessaudit/core';

interface BehaviorTestOptions {
  url: string;
  testType: TestType;
  target?: string;
  expected?: string;
  maxIterations?: number;
}

interface BatchTestOptions {
  url: string;
  tests: { testType: TestType; target?: string }[];
}

interface BatchTestResult {
  url: string;
  totalTests: number;
  passed: number;
  failed: number;
  results: { testType: TestType; status: 'pass' | 'fail' }[];
}

export class AgentAPI {
  private baseUrl: string;
  private apiKey?: string;

  constructor(baseUrl: string, apiKey?: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  async behavior(options: BehaviorTestOptions): Promise<BehaviorResult> {
    const headers = this.apiKey ? { 'X-API-Key': this.apiKey } : {};
    const response = await axios.post(`${this.baseUrl}/api/v1/agent/behavior`, options, { headers });
    return response.data.data;
  }

  async batch(options: BatchTestOptions): Promise<BatchTestResult> {
    const headers = this.apiKey ? { 'X-API-Key': this.apiKey } : {};
    const response = await axios.post(`${this.baseUrl}/api/v1/agent/batch`, options, { headers });
    return response.data.data;
  }
}
