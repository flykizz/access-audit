/**
 * 通用工具函数
 *
 * 纯函数为主，无副作用、无状态，方便在任意上下文（background/sidepanel/content）使用。
 */

import type { Impact, Severity } from './types';

/* -------------------------------------------------------------------------- */
/* ID & 函数式工具                                                              */
/* -------------------------------------------------------------------------- */

/**
 * 生成随机 ID。
 *
 * 默认长度 16，使用 crypto.getRandomValues（service worker 可用）。
 * 不依赖 Math.random，避免被裁剪为不安全的伪随机。
 */
export function generateId(length = 16): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const bytes = new Uint8Array(length);
  const cryptoApi =
    typeof crypto !== 'undefined' ? crypto : (globalThis as any).crypto;
  if (cryptoApi?.getRandomValues) {
    cryptoApi.getRandomValues(bytes);
  } else {
    // 兜底：service worker 不可用时（极少见）才走 Math.random
    for (let i = 0; i < length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  let out = '';
  for (let i = 0; i < length; i++) {
    out += chars[bytes[i] % chars.length];
  }
  return out;
}

/**
 * 防抖：在 wait ms 内多次调用只执行最后一次。
 *
 * 返回的函数带 `.cancel()` 方法用于显式取消。
 */
export function debounce<A extends unknown[]>(
  fn: (...args: A) => void,
  wait: number,
): ((...args: A) => void) & { cancel: () => void } {
  let timer: ReturnType<typeof setTimeout> | null = null;
  const debounced = (...args: A) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      fn(...args);
    }, wait);
  };
  debounced.cancel = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  };
  return debounced;
}

/**
 * 节流：在 wait ms 内最多触发一次。
 *
 * 首次调用立即触发，后续在 trailing 边缘再补一次。
 */
export function throttle<A extends unknown[]>(
  fn: (...args: A) => void,
  wait: number,
): (...args: A) => void {
  let last = 0;
  let trailingTimer: ReturnType<typeof setTimeout> | null = null;
  return (...args: A) => {
    const now = Date.now();
    const remaining = wait - (now - last);
    if (remaining <= 0) {
      if (trailingTimer) {
        clearTimeout(trailingTimer);
        trailingTimer = null;
      }
      last = now;
      fn(...args);
    } else if (!trailingTimer) {
      trailingTimer = setTimeout(() => {
        last = Date.now();
        trailingTimer = null;
        fn(...args);
      }, remaining);
    }
  };
}

/* -------------------------------------------------------------------------- */
/* 时间 & 文本                                                                  */
/* -------------------------------------------------------------------------- */

/** 把毫秒格式化为 "1m 23s" / "500ms" 等人类可读字符串 */
export function formatTime(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) return '0ms';
  if (ms < 1000) return `${Math.round(ms)}ms`;
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remSec = seconds % 60;
  if (minutes < 60) return `${minutes}m ${remSec}s`;
  const hours = Math.floor(minutes / 60);
  const remMin = minutes % 60;
  return `${hours}h ${remMin}m`;
}

/**
 * 把 ISO 时间字符串格式化为本地化显示。
 *
 * @param dateStr ISO 字符串或可被 Date 解析的字符串
 * @returns 例如 "2026-07-26 14:32"
 */
export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

/** 截断文本，超出加省略号 */
export function truncateText(text: string, max: number): string {
  if (text.length <= max) return text;
  if (max <= 1) return text.slice(0, max);
  return `${text.slice(0, max - 1)}…`;
}

/* -------------------------------------------------------------------------- */
/* 严重级别映射                                                                  */
/* -------------------------------------------------------------------------- */

/** 各 Severity 对应的颜色（hex），用于 UI 着色 */
export function getSeverityColor(severity: Severity): string {
  switch (severity) {
    case 'error':
      return '#dc2626'; // red-600
    case 'warning':
      return '#d97706'; // amber-600
    case 'info':
      return '#2563eb'; // blue-600
    case 'pass':
      return '#16a34a'; // green-600
    default:
      return '#6b7280'; // gray-500
  }
}

/** 各 Severity 的本地化标签（中英文兜底） */
export function getSeverityLabel(severity: Severity): string {
  const zh: Record<Severity, string> = {
    error: '错误',
    warning: '警告',
    info: '提示',
    pass: '通过',
  };
  const en: Record<Severity, string> = {
    error: 'Error',
    warning: 'Warning',
    info: 'Info',
    pass: 'Pass',
  };
  // 优先走 i18n，找不到再回退到本地常量
  // 这里不直接 import i18n 避免循环依赖
  const i18nApi =
    typeof chrome !== 'undefined' ? (chrome as any)?.i18n : (globalThis as any)?.browser?.i18n;
  const locale = i18nApi?.getUILanguage?.() ?? 'en-US';
  const table = String(locale).toLowerCase().startsWith('zh') ? zh : en;
  return table[severity];
}

/** 各 Severity 的 emoji 图标，用于活动日志等纯文本场景 */
export function getSeverityIcon(severity: Severity): string {
  switch (severity) {
    case 'error':
      return '⛔';
    case 'warning':
      return '⚠️';
    case 'info':
      return 'ℹ️';
    case 'pass':
      return '✅';
    default:
      return '•';
  }
}

/**
 * 把 axe-core 的 impact 映射到内部 Severity。
 *
 * - critical / serious → error
 * - moderate           → warning
 * - minor              → info
 */
export function getImpactSeverity(impact: Impact): Severity {
  switch (impact) {
    case 'critical':
    case 'serious':
      return 'error';
    case 'moderate':
      return 'warning';
    case 'minor':
      return 'info';
    default:
      return 'info';
  }
}

/* -------------------------------------------------------------------------- */
/* 评分                                                                        */
/* -------------------------------------------------------------------------- */

/**
 * 根据违规数量计算 0-100 的无障碍评分。
 *
 * 简单口径：0 违规 → 100 分；每条违规扣分递减，最低 0 分。
 * 后端如有更精确的口径（按 impact 加权），以后端为准。
 */
export function calculateScore(violationCount: number): number {
  if (violationCount <= 0) return 100;
  // 每条违规扣 5 分，但前 5 条之后递减为每条 2 分，避免大量违规时分数直接归零
  let score = 100;
  const heavy = Math.min(violationCount, 5);
  score -= heavy * 5;
  const rest = violationCount - heavy;
  if (rest > 0) score -= Math.min(rest * 2, 60);
  return Math.max(0, Math.min(100, score));
}

/* -------------------------------------------------------------------------- */
/* HTML 安全                                                                    */
/* -------------------------------------------------------------------------- */

const HTML_ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

/** 转义 HTML 特殊字符，用于插入文本节点时防 XSS */
export function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (ch) => HTML_ESCAPE_MAP[ch] ?? ch);
}

/**
 * 同 escapeHtml，但额外去掉换行与首尾空白，适合做单行摘要展示。
 *
 * 命名区别：escapeHtml 保留原文本结构，safeHtml 偏向展示。
 */
export function safeHtml(text: string): string {
  return escapeHtml(text.replace(/\s+/g, ' ').trim());
}

/**
 * 复制文本到剪贴板。
 *
 * - 优先 navigator.clipboard（service worker 与页面均可）
 * - 退化方案：用 document.execCommand('copy')（仅 content script / sidepanel 可用）
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through */
  }
  try {
    if (typeof document !== 'undefined') {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    }
  } catch {
    /* ignore */
  }
  return false;
}

/* -------------------------------------------------------------------------- */
/* 集合工具                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * 按 key 把数组分组为对象。
 *
 * @example
 *   groupBy([{k:'a'},{k:'b'},{k:'a'}], 'k')
 *   // → { a: [{k:'a'},{k:'a'}], b: [{k:'b'}] }
 */
export function groupBy<T, K extends string | number | symbol>(
  array: T[],
  key: (item: T) => K,
): Record<K, T[]> {
  const result = {} as Record<K, T[]>;
  for (const item of array) {
    const k = key(item);
    (result[k] ??= []).push(item);
  }
  return result;
}
