/**
 * 标准化事件系统
 *
 * 用于在 sidepanel / popup 等长生命周期上下文中订阅扫描与认证事件。
 * Background（service worker）短暂存活，不适合在这里长订阅；
 * 但 emit 仍然可以由 background 调用，把事件写入 storage 历史，
 * sidepanel 通过 storage.onChanged 或拉取历史恢复 UI。
 *
 * 事件流：
 *   emitter.emit(event, data)
 *     ├─ 同步触发内存监听器（仅当前上下文）
 *     └─ 写入 storage 历史（跨上下文可见）
 */

import type { AgentActivity, HistoricalEvent } from './types';
import { StorageKeys } from './types';
import { storageService } from './storage';

/** 所有事件名 */
export type ScanEvent =
  | 'statuschange'
  | 'activity'
  | 'historychange'
  | 'scanprogress'
  | 'scancomplete'
  | 'scanerror';

/** 事件回调签名 */
type EventCallback<T = unknown> = (data: T) => void;

/** 历史记录上限，超出按时间倒序裁剪 */
const MAX_HISTORY_EVENTS = 200;

/**
 * ScanEventEmitter —— 标准化事件总线。
 *
 * - 内存监听器只对当前上下文生效（service worker 重启后失效）
 * - 跨上下文的"事件回放"通过 storage 的 SCAN_HISTORY / ACTIVITY_LOG 实现
 */
export class ScanEventEmitter {
  private readonly listeners = new Map<ScanEvent, Set<EventCallback>>();

  /**
   * 触发事件：
   * 1. 同步调用当前上下文的内存监听器
   * 2. 把事件落盘到 ACTIVITY_LOG，供其他上下文拉取
   */
  emit<T>(event: ScanEvent, data: T): void {
    // 1. 内存监听器
    const set = this.listeners.get(event);
    if (set) {
      // 拷贝一份避免在回调中 off 导致迭代错位
      for (const cb of Array.from(set)) {
        try {
          cb(data);
        } catch (err) {
          // 单个监听器出错不应阻断其他监听器
          console.error(`[event-bus] 监听器 ${event} 抛错：`, err);
        }
      }
    }

    // 2. 落盘（异步，不阻塞 emit）
    void this.recordEvent(event, data);
  }

  /** 注册监听器，返回取消函数 */
  on<T>(event: ScanEvent, callback: EventCallback<T>): () => void {
    let set = this.listeners.get(event);
    if (!set) {
      set = new Set();
      this.listeners.set(event, set);
    }
    set.add(callback as EventCallback);
    return () => this.off(event, callback);
  }

  /** 取消监听 */
  off<T>(event: ScanEvent, callback: EventCallback<T>): void {
    const set = this.listeners.get(event);
    if (!set) return;
    set.delete(callback as EventCallback);
    if (set.size === 0) {
      this.listeners.delete(event);
    }
  }

  /** 一次性监听 */
  once<T>(event: ScanEvent, callback: EventCallback<T>): () => void {
    const off = this.on<T>(event, (data) => {
      off();
      callback(data);
    });
    return off;
  }

  /**
   * 记录一条 Agent 活动到 storage。
   *
   * 用于 sidepanel 的活动日志视图，跨上下文可见。
   */
  async recordActivity(activity: AgentActivity): Promise<void> {
    const log =
      (await storageService.get<AgentActivity[]>(StorageKeys.ACTIVITY_LOG)) ?? [];
    log.push(activity);
    if (log.length > MAX_HISTORY_EVENTS) {
      log.splice(0, log.length - MAX_HISTORY_EVENTS);
    }
    await storageService.set(StorageKeys.ACTIVITY_LOG, log);
    // 同时触发 activity 事件，便于 UI 实时刷新
    this.emit('activity', activity);
  }

  /**
   * 从 storage 拉取历史事件（活动日志）。
   */
  async getHistory(): Promise<HistoricalEvent[]> {
    const activities =
      (await storageService.get<AgentActivity[]>(StorageKeys.ACTIVITY_LOG)) ?? [];
    return activities.map((a) => ({
      timestamp: a.timestamp,
      type: a.type,
      data: a,
    }));
  }

  /** 清空活动日志 */
  async clearHistory(): Promise<void> {
    await storageService.remove(StorageKeys.ACTIVITY_LOG);
  }

  /* ------------------------------------------------------------------ */
  /* 内部                                                                  */
  /* ------------------------------------------------------------------ */

  /** 把事件转成 HistoricalEvent 落盘 */
  private async recordEvent(event: ScanEvent, data: unknown): Promise<void> {
    // 只有 activity / scanprogress / scancomplete / scanerror 才落盘，
    // statuschange / historychange 是 UI 派生事件，避免重复占用 storage
    if (event === 'statuschange' || event === 'historychange') {
      return;
    }
    const activity: AgentActivity = {
      type: event,
      message: typeof data === 'string' ? data : safeStringify(data),
      timestamp: Date.now(),
    };
    try {
      await this.recordActivity(activity);
    } catch (err) {
      // storage 不可用时不应阻断 emit
      console.error('[event-bus] 落盘活动日志失败：', err);
    }
  }
}

/** 全局共享实例 */
export const scanEventEmitter = new ScanEventEmitter();

/** 安全 JSON 序列化，避免循环引用抛错 */
function safeStringify(value: unknown): string {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}
