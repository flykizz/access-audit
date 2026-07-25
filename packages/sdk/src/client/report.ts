import axios from 'axios';

interface ReportOptions {
  taskId: string;
  format: 'html' | 'pdf';
  includeCharts?: boolean;
  includeRecommendations?: boolean;
  language?: string;
  template?: string;
}

interface ReportResult {
  reportId: string;
  url: string;
  downloadUrl: string;
}

interface ReportDataResult {
  taskId: string;
  auditDate: string;
  version: string;
  complianceStandard: string;
  summary: {
    totalPages: number;
    totalViolations: number;
    critical: number;
    serious: number;
    moderate: number;
    minor: number;
    overallScore: number;
  };
  violations: unknown[];
  coverage: unknown[];
  recommendations: unknown[];
}

export class ReportAPI {
  private baseUrl: string;
  private apiKey?: string;

  constructor(baseUrl: string, apiKey?: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  async html(options: ReportOptions): Promise<ReportResult> {
    const headers = this.apiKey ? { 'X-API-Key': this.apiKey } : {};
    const response = await axios.post(`${this.baseUrl}/api/v1/report/html`, options, { headers });
    return response.data.data;
  }

  async pdf(options: ReportOptions): Promise<ReportResult> {
    const headers = this.apiKey ? { 'X-API-Key': this.apiKey } : {};
    const response = await axios.post(`${this.baseUrl}/api/v1/report/pdf`, options, { headers });
    return response.data.data;
  }

  async json(taskId: string): Promise<ReportDataResult> {
    const headers = this.apiKey ? { 'X-API-Key': this.apiKey } : {};
    const response = await axios.get(`${this.baseUrl}/api/v1/report/json/${taskId}`, { headers });
    return response.data.data;
  }
}
