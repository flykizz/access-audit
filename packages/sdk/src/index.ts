import { ScannerAPI, AgentAPI, EngineAPI, ReportAPI } from './client';

interface AccessAuditOptions {
  apiKey?: string;
  baseUrl?: string;
}

export class AccessAudit {
  public scanner: ScannerAPI;
  public agent: AgentAPI;
  public engine: EngineAPI;
  public report: ReportAPI;

  constructor(options: AccessAuditOptions = {}) {
    const baseUrl = options.baseUrl || 'https://api.accessaudit.io';
    const apiKey = options.apiKey;

    this.scanner = new ScannerAPI(baseUrl, apiKey);
    this.agent = new AgentAPI(baseUrl, apiKey);
    this.engine = new EngineAPI(baseUrl, apiKey);
    this.report = new ReportAPI(baseUrl, apiKey);
  }
}

export * from './client';
export * from '@accessaudit/core';
