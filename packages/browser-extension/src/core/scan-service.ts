/**
 * 扫描服务（无状态）
 *
 * 关键设计：ScanService 不持有任何扫描状态。所有进度都通过 storage.CURRENT_SCAN
 * 持久化。service worker 被回收后可基于 storage 中的 status 恢复 UI；
 * 取消扫描也只是改 storage 里的状态字段，不需要在内存里维护取消信号。
 *
 * 通信：
 *  - Background ↔ SidePanel：chrome.runtime.sendMessage
 *  - Background ↔ Content Script：chrome.tabs.sendMessage
 */

import type {
  ScanHistoryItem,
  ScanOptions,
  ScanResult,
  ScanState,
  OperationPath,
  BehaviorTestResult,
  TestType,
} from './types';
import { ScanMessageType, StorageKeys } from './types';
import { authManager } from './auth';
import { storageService } from './storage';
import { calculateScore, generateId, getImpactSeverity } from './utils';

/** 后端 API 基础地址（与 auth.ts 保持一致） */
const API_BASE_URL = 'http://localhost:3000';

/** 历史记录最大条数，超出按时间倒序裁剪 */
const MAX_HISTORY = 50;

/** 静态扫描请求体 */
interface StaticScanRequest {
  url: string;
  html?: string;
  category?: string;
}

/** /api/v1/scanner/rules 返回的规则条目 */
export interface ScannerRule {
  id: string;
  category: string;
  description: string;
  impact: 'critical' | 'serious' | 'moderate' | 'minor';
  tags?: string[];
}

/** 扫描服务错误 */
export class ScanError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = 'ScanError';
  }
}

/**
 * ScanService —— 无状态扫描服务。
 *
 * 每次操作都现拉 storage 状态，不在实例上缓存扫描进度，
 * 以保证 service worker 重启后状态依然可恢复。
 */
export class ScanService {
  /* ------------------------------------------------------------------ */
  /* 主扫描流程                                                            */
  /* ------------------------------------------------------------------ */

  /**
   * 扫描当前活动 tab：
   * 1. 获取当前 tab URL
   * 2. 向 storage 写入 pending 状态
   * 3. 调用 POST /api/v1/scanner/static（带认证）
   * 4. 持续更新 storage 中的进度
   * 5. 完成后写入 result，调用 saveScanToHistory
   * 6. 通知 sidepanel 与 content script
   */
  async scanCurrentPage(options: ScanOptions = {}): Promise<ScanResult> {
    // 取消信号检查：每次从 storage 现拉
    const existing = await this.getScanState();
    if (existing.status === 'scanning' || existing.status === 'pending') {
      throw new ScanError('已有扫描正在进行', 'SCAN_IN_PROGRESS');
    }

    const tab = await this.getActiveTab();
    if (!tab || !tab.id || !tab.url) {
      throw new ScanError('找不到可扫描的活动标签页', 'NO_ACTIVE_TAB');
    }

    const url = tab.url;
    const startTime = Date.now();

    // 写入 pending 状态
    const initialState: ScanState = {
      status: 'pending',
      progress: 0,
      stage: '准备扫描',
      url,
      result: null,
      error: null,
      startTime,
      endTime: null,
    };
    await this.updateScanState(initialState);
    await this.notifyProgress(initialState);

    try {
      // 切换到 scanning
      await this.transitionState({ status: 'scanning', stage: '正在请求扫描服务', progress: 10 });

      // 让 content script 抓取 HTML（失败则降级为仅 URL 扫描）
      let html: string | undefined;
      try {
        html = await this.getPageHtml(tab.id);
      } catch {
        // content script 未注入或页面受限 —— 静默降级
      }

      // 调用后端静态扫描
      const result = await this.callStaticScan({ url, html, category: options.category });

      // 切换到 analyzing
      await this.transitionState({
        status: 'analyzing',
        stage: '正在分析结果',
        progress: 80,
      });

      // 写入 result，标记完成
      const finalState: ScanState = {
        ...(await this.getScanState()),
        status: 'completed',
        progress: 100,
        stage: '扫描完成',
        result,
        endTime: Date.now(),
      };
      await this.updateScanState(finalState);
      await this.saveScanToHistory();
      await this.notifyComplete(result);

      return result;
    } catch (err) {
      // 检查是否被用户取消
      const current = await this.getScanState();
      if (current.status === 'stopped') {
        // 用户已取消，不要再覆盖为 error
        return current.result ?? this.emptyResult();
      }

      const message = err instanceof Error ? err.message : String(err);
      const errorState: ScanState = {
        ...current,
        status: 'error',
        error: message,
        endTime: Date.now(),
        stage: '扫描失败',
      };
      await this.updateScanState(errorState);
      await this.notifyError(message);
      throw err instanceof ScanError ? err : new ScanError(message, 'SCAN_FAILED');
    }
  }

  /* ------------------------------------------------------------------ */
  /* 状态查询与控制                                                        */
  /* ------------------------------------------------------------------ */

  /** 从 storage 拉取当前扫描状态 */
  async getScanState(): Promise<ScanState> {
    const state = await storageService.get<ScanState>(StorageKeys.CURRENT_SCAN);
    return state ?? this.idleState();
  }

  /** 取消扫描：仅将 status 置为 stopped，由扫描循环在下一轮检查时退出 */
  async cancelScan(): Promise<void> {
    const current = await this.getScanState();
    if (current.status !== 'scanning' && current.status !== 'pending' && current.status !== 'analyzing') {
      return;
    }
    const stopped: ScanState = {
      ...current,
      status: 'stopped',
      stage: '已取消',
      endTime: Date.now(),
    };
    await this.updateScanState(stopped);
    await this.notifyProgress(stopped);
  }

  /** 拉取扫描规则列表：GET /api/v1/scanner/rules?category=... */
  async getRules(category?: string): Promise<ScannerRule[]> {
    const url = new URL(`${API_BASE_URL}/api/v1/scanner/rules`);
    if (category) url.searchParams.set('category', category);

    const response = await authManager.fetchWithAuth(url.toString(), { method: 'GET' });
    if (!response.ok) {
      throw await this.toScanError(response, '获取规则失败');
    }
    const data = await response.json();
    return (data.rules ?? data ?? []) as ScannerRule[];
  }

  /** 发现操作路径：POST /api/v1/agent/paths */
  async discoverPaths(url: string, testType: TestType): Promise<OperationPath[]> {
    const response = await authManager.fetchWithAuth(
      `${API_BASE_URL}/api/v1/agent/paths`,
      {
        method: 'POST',
        body: JSON.stringify({ url, testType }),
      },
    );
    if (!response.ok) {
      throw await this.toScanError(response, '路径发现失败');
    }
    const data = await response.json();
    return (data.data ?? data ?? []) as OperationPath[];
  }

  /** 执行行为测试路径：POST /api/v1/agent/execute-path */
  async executeBehaviorTest(url: string, testType: TestType, path: OperationPath): Promise<BehaviorTestResult> {
    const response = await authManager.fetchWithAuth(
      `${API_BASE_URL}/api/v1/agent/execute-path`,
      {
        method: 'POST',
        body: JSON.stringify({ url, testType, path }),
      },
    );
    if (!response.ok) {
      throw await this.toScanError(response, '行为测试执行失败');
    }
    const data = await response.json();
    return (data.data ?? data) as BehaviorTestResult;
  }

  /* ------------------------------------------------------------------ */
  /* 历史记录                                                              */
  /* ------------------------------------------------------------------ */

  /** 将当前已完成的扫描存入 SCAN_HISTORY，超出上限按 startTime 裁剪 */
  async saveScanToHistory(): Promise<ScanHistoryItem | null> {
    const state = await this.getScanState();
    if (!state.result || state.status !== 'completed') {
      return null;
    }

    const item: ScanHistoryItem = {
      id: generateId(16),
      url: state.url,
      startTime: state.startTime,
      endTime: state.endTime,
      status: state.status,
      score: state.result.score,
      violationCount: state.result.violations.length,
      passCount: state.result.passes.length,
      result: state.result,
    };

    const history = (await storageService.get<ScanHistoryItem[]>(StorageKeys.SCAN_HISTORY)) ?? [];
    history.unshift(item);
    if (history.length > MAX_HISTORY) {
      history.length = MAX_HISTORY;
    }
    await storageService.set(StorageKeys.SCAN_HISTORY, history);
    return item;
  }

  /** 拉取历史扫描记录 */
  async getHistory(): Promise<ScanHistoryItem[]> {
    return (await storageService.get<ScanHistoryItem[]>(StorageKeys.SCAN_HISTORY)) ?? [];
  }

  /** 清空历史 */
  async clearHistory(): Promise<void> {
    await storageService.remove(StorageKeys.SCAN_HISTORY);
  }

  /* ------------------------------------------------------------------ */
  /* 内部工具                                                              */
  /* ------------------------------------------------------------------ */

  /** 写入新的 ScanState 到 storage */
  private async updateScanState(state: ScanState): Promise<void> {
    await storageService.set(StorageKeys.CURRENT_SCAN, state);
  }

  /** 部分字段更新（先拉后写，保证无状态） */
  private async transitionState(patch: Partial<ScanState>): Promise<void> {
    const current = await this.getScanState();
    const next: ScanState = { ...current, ...patch };
    await this.updateScanState(next);
    await this.notifyProgress(next);
  }

  /** 调用后端静态扫描接口（带认证） */
  private async callStaticScan(req: StaticScanRequest): Promise<ScanResult> {
    const response = await authManager.fetchWithAuth(
      `${API_BASE_URL}/api/v1/scanner/static`,
      {
        method: 'POST',
        body: JSON.stringify(req),
      },
    );
    if (!response.ok) {
      throw await this.toScanError(response, '扫描请求失败');
    }
    const data = await response.json();

    // 后端返回结构兼容：直接是 ScanResult 或包了一层 { result }
    const raw: ScanResult = data.result ?? data;
    const violations = Array.isArray(raw.violations) ? raw.violations : [];
    const passes = Array.isArray(raw.passes) ? raw.passes : [];

    // 重新计算分数，避免后端与本地口径不一致
    const score = typeof raw.score === 'number'
      ? raw.score
      : calculateScore(violations.length);

    return {
      violations,
      passes,
      score,
      totalPages: raw.totalPages ?? 1,
      timestamp: raw.timestamp ?? new Date().toISOString(),
    };
  }

  /** 获取当前活动 tab */
  private async getActiveTab(): Promise<chrome.tabs.Tab | null> {
    return new Promise((resolve) => {
      try {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          resolve(tabs?.[0] ?? null);
        });
      } catch {
        resolve(null);
      }
    });
  }

  /** 从 content script 抓取页面 HTML */
  private async getPageHtml(tabId: number): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        chrome.tabs.sendMessage(
          tabId,
          { type: ScanMessageType.AA_SYNC_STATE, action: 'getHtml', timestamp: Date.now() },
          (response: unknown) => {
            const err = chrome.runtime.lastError;
            if (err) {
              reject(new Error(err.message || String(err)));
              return;
            }
            const html = (response as { html?: string })?.html;
            if (typeof html === 'string') resolve(html);
            else reject(new Error('未收到 HTML'));
          },
        );
      } catch (e) {
        reject(e as Error);
      }
    });
  }

  /** 通知 sidepanel 扫描进度 */
  private async notifyProgress(state: ScanState): Promise<void> {
    await this.runtimeBroadcast({
      type: ScanMessageType.AA_SCAN_PROGRESS,
      payload: state,
      timestamp: Date.now(),
      source: 'scan-service',
    });
  }

  /** 通知 sidepanel + content script 扫描完成 */
  private async notifyComplete(result: ScanResult): Promise<void> {
    await this.runtimeBroadcast({
      type: ScanMessageType.AA_SCAN_COMPLETE,
      payload: result,
      timestamp: Date.now(),
      source: 'scan-service',
    });
    await this.broadcastToActiveTab({
      type: ScanMessageType.AA_SCAN_COMPLETE,
      payload: { url: (await this.getScanState()).url },
      timestamp: Date.now(),
      source: 'scan-service',
    });
  }

  /** 通知 sidepanel 扫描出错 */
  private async notifyError(message: string): Promise<void> {
    await this.runtimeBroadcast({
      type: ScanMessageType.AA_SCAN_ERROR,
      payload: { message },
      timestamp: Date.now(),
      source: 'scan-service',
    });
  }

  /** 通过 chrome.runtime.sendMessage 广播到 sidepanel / popup */
  private async runtimeBroadcast(message: unknown): Promise<void> {
    try {
      await chrome.runtime.sendMessage(message);
    } catch {
      // sidepanel 未打开时会抛错，忽略即可
    }
  }

  /** 广播消息到当前活动 tab 的 content script */
  private async broadcastToActiveTab(message: unknown): Promise<void> {
    const tab = await this.getActiveTab();
    if (!tab?.id) return;
    try {
      await chrome.tabs.sendMessage(tab.id, message);
    } catch {
      // content script 可能未注入，忽略
    }
  }

  /** 把非 2xx 响应转成 ScanError */
  private async toScanError(response: Response, fallback: string): Promise<ScanError> {
    let message = `${fallback}：${response.status} ${response.statusText}`;
    let code = 'HTTP_ERROR';
    try {
      const body = await response.json();
      message = body.message || body.error || message;
      code = body.code || code;
    } catch {
      /* 非 JSON 响应 */
    }
    return new ScanError(message, code, response.status);
  }

  private idleState(): ScanState {
    return {
      status: 'idle',
      progress: 0,
      stage: '',
      url: '',
      result: null,
      error: null,
      startTime: 0,
      endTime: null,
    };
  }

  private emptyResult(): ScanResult {
    return {
      violations: [],
      passes: [],
      score: 100,
      totalPages: 0,
      timestamp: new Date().toISOString(),
    };
  }
}

/** 全局共享实例（无状态，安全共享） */
export const scanService = new ScanService();

/** 便于其他模块直接引用 getImpactSeverity */
export { getImpactSeverity };
