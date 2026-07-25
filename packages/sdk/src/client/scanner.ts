import axios from 'axios';
import type { ScanResult, StaticViolation } from '@accessaudit/core';

interface StaticScanOptions {
  url: string;
  rules?: string[];
  includeHidden?: boolean;
  timeout?: number;
}

interface RulesOptions {
  category?: string;
}

interface RegisterRuleOptions {
  id: string;
  name: string;
  category: string;
  severity: 'critical' | 'serious' | 'moderate' | 'minor';
  description: string;
  selector: string;
  evaluate: string;
  messages: { pass: string; fail: string };
  wcagTags: string[];
}

interface RulesResult {
  rules: {
    id: string;
    name: string;
    category: string;
    severity: string;
    description: string;
    wcagTag: string;
  }[];
  total: number;
}

interface RegisterRuleResult {
  id: string;
  message: string;
}

export class ScannerAPI {
  private baseUrl: string;
  private apiKey?: string;

  constructor(baseUrl: string, apiKey?: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  async static(options: StaticScanOptions): Promise<ScanResult> {
    const headers = this.apiKey ? { 'X-API-Key': this.apiKey } : {};
    const response = await axios.post(`${this.baseUrl}/api/v1/scanner/static`, options, { headers });
    return response.data.data;
  }

  async rules(options?: RulesOptions): Promise<RulesResult> {
    const headers = this.apiKey ? { 'X-API-Key': this.apiKey } : {};
    const params = options?.category ? { category: options.category } : {};
    const response = await axios.get(`${this.baseUrl}/api/v1/scanner/rules`, { headers, params });
    return response.data.data;
  }

  async registerRule(options: RegisterRuleOptions): Promise<RegisterRuleResult> {
    const headers = this.apiKey ? { 'X-API-Key': this.apiKey } : {};
    const response = await axios.post(`${this.baseUrl}/api/v1/scanner/rules`, options, { headers });
    return response.data.data;
  }
}
