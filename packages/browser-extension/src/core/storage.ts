/**
 * 无状态存储管理
 *
 * Stateless Service Worker 架构下，所有状态都通过 chrome.storage.local 持久化，
 * 不维护内存单例。每次读写都直接打到 storage，保证 service worker 重启后状态一致。
 *
 * 同时兼容 Chrome (chrome.storage) 与 Firefox (browser.storage)。
 */

import { StorageKeys } from './types';

/**
 * 统一的 storage.local 句柄。
 *
 * - Chrome: `chrome.storage.local`
 * - Firefox: `browser.storage.local`（基于 Promise）
 * - 测试/非扩展环境：抛错以便尽早暴露调用时机问题。
 */
function getStorageArea(): chrome.storage.LocalStorageArea {
  // WXT 同时注入 chrome 与 browser 全局
  const api: any =
    typeof browser !== 'undefined' ? browser : typeof chrome !== 'undefined' ? chrome : undefined;
  if (!api || !api.storage || !api.storage.local) {
    throw new Error('[storage] chrome.storage.local 不可用：当前上下文未注入扩展 API');
  }
  return api.storage.local as chrome.storage.LocalStorageArea;
}

/** 将 browser.storage（Promise 风格）适配为 chrome.storage（回调风格）的兼容 Promise 包装 */
function promisify<T>(fn: (cb: (v: T) => void) => void): Promise<T> {
  return new Promise((resolve, reject) => {
    try {
      fn((value: any) => {
        const err = (chrome as any)?.runtime?.lastError;
        if (err) reject(new Error(err.message || String(err)));
        else resolve(value as T);
      });
    } catch (e) {
      reject(e);
    }
  });
}

/**
 * StorageService —— 无状态存储读写器。
 *
 * 不持有任何实例状态，所有方法都是 storage.local 的薄封装。
 * 不同上下文（background / sidepanel / content script）共用同一份持久化数据。
 */
export class StorageService {
  /** 读取单个 key 的值，不存在返回 null */
  async get<T>(key: StorageKeys | string): Promise<T | null> {
    const area = getStorageArea();
    const result = await promisify<Record<string, unknown>>((cb) => area.get(key, cb));
    const value = result[key as string];
    return (value === undefined ? null : (value as T));
  }

  /** 写入单个 key 的值 */
  async set<T>(key: StorageKeys | string, value: T): Promise<void> {
    const area = getStorageArea();
    await promisify<void>((cb) => area.set({ [key]: value }, cb));
  }

  /** 删除单个 key */
  async remove(key: StorageKeys | string): Promise<void> {
    const area = getStorageArea();
    await promisify<void>((cb) => area.remove(key as string, cb));
  }

  /** 清空 storage.local 中的全部 AccessAudit 数据 */
  async clear(): Promise<void> {
    const area = getStorageArea();
    const all = await promisify<Record<string, unknown>>((cb) => area.get(null, cb));
    const keysToRemove = Object.keys(all).filter((k) => k.startsWith('aa_'));
    if (keysToRemove.length === 0) return;
    await promisify<void>((cb) => area.remove(keysToRemove, cb));
  }

  /** 一次性读取多个 key，返回对象映射 */
  async getMany<T extends Record<string, unknown>>(
    keys: Array<StorageKeys | string>,
  ): Promise<Partial<T>> {
    const area = getStorageArea();
    const result = await promisify<Record<string, unknown>>((cb) =>
      area.get(keys as string[], cb),
    );
    return result as Partial<T>;
  }

  /** 一次性写入多个 key */
  async setMany(values: Record<string, unknown>): Promise<void> {
    const area = getStorageArea();
    await promisify<void>((cb) => area.set(values, cb));
  }
}

/** 全局共享单例（仅是访问入口，不持有任何业务状态） */
export const storageService = new StorageService();

/** 便于其他模块直接引用的 STORAGE_KEYS 别名 */
export const STORAGE_KEYS = StorageKeys;

/** 监听 storage 变化（用于 sidepanel 同步 background 写入） */
export function onStorageChanged(
  callback: (changes: { [key: string]: chrome.storage.StorageChange }, areaName: string) => void,
): () => void {
  const api: any =
    typeof browser !== 'undefined' ? browser : typeof chrome !== 'undefined' ? chrome : undefined;
  if (!api?.storage?.onChanged) {
    return () => {};
  }
  const listener = (
    changes: { [key: string]: chrome.storage.StorageChange },
    areaName: string,
  ) => {
    if (areaName !== 'local') return;
    callback(changes, areaName);
  };
  api.storage.onChanged.addListener(listener);
  return () => api.storage.onChanged.removeListener(listener);
}
