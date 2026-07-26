/**
 * AccessAudit 核心类型定义
 *
 * 在 WXT 的 background / sidepanel / content script 中共享。
 * 全部使用 `import type` 引入，避免运行时副作用。
 */

/** 扫描状态机：idle → pending → scanning → analyzing → completed | stopped | error */
export type ScanStatus =
  | 'idle'
  | 'pending'
  | 'scanning'
  | 'analyzing'
  | 'completed'
  | 'stopped'
  | 'error';

/** 问题严重级别（用于 Agent 活动与 UI 着色） */
export type Severity = 'error' | 'warning' | 'info' | 'pass';

/** 用户角色 */
export type UserRole = 'guest' | 'user' | 'vip';

/** a11y 违规影响等级（与 axe-core 对齐） */
export type Impact = 'critical' | 'serious' | 'moderate' | 'minor';

/** 用户信息 */
export interface UserInfo {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
}

/** 认证状态：每次操作从 storage 拉取，不维护内存单例 */
export interface AuthState {
  isAuthenticated: boolean;
  user: UserInfo | null;
  isLocked: boolean;
  authReason: string | null;
}

/** 违规节点 */
export interface ViolationNode {
  target: string[];
  html: string;
  failureSummary?: string;
}

/** 单条 a11y 违规 */
export interface Violation {
  id: string;
  description: string;
  impact: Impact;
  help?: string;
  nodes: ViolationNode[];
}

/** 通过的检测项 */
export interface Pass {
  id: string;
  description: string;
}

/** 单次扫描结果 */
export interface ScanResult {
  violations: Violation[];
  passes: Pass[];
  score: number;
  totalPages: number;
  timestamp: string;
}

/** 扫描运行时状态 */
export interface ScanState {
  status: ScanStatus;
  /** 0-100 进度百分比 */
  progress: number;
  /** 当前阶段人类可读描述，例如 "正在分析 DOM..." */
  stage: string;
  /** 扫描目标 URL */
  url: string;
  result: ScanResult | null;
  error: string | null;
  startTime: number;
  endTime: number | null;
}

/** Agent 活动日志条目 */
export interface AgentActivity {
  type: string;
  message: string;
  timestamp: number;
  severity?: Severity;
}

/** 历史事件（写入 scan history） */
export interface HistoricalEvent {
  timestamp: number;
  type: string;
  data: any;
}

/** 扫描配置选项 */
export interface ScanOptions {
  /** 仅扫描指定规则分类，未指定则全量 */
  category?: string;
  /** 是否在 service worker 重启后恢复扫描 */
  resume?: boolean;
  /** 自定义超时（ms） */
  timeout?: number;
}

/** 历史扫描记录（持久化到 SCAN_HISTORY） */
export interface ScanHistoryItem {
  id: string;
  url: string;
  startTime: number;
  endTime: number | null;
  status: ScanStatus;
  score: number;
  violationCount: number;
  passCount: number;
  result: ScanResult | null;
}

/* -------------------------------------------------------------------------- */
/* 消息协议                                                                      */
/* -------------------------------------------------------------------------- */

/** 所有跨上下文消息类型，统一 AA_ 前缀 */
export enum ScanMessageType {
  /** SidePanel → Background：开始扫描 */
  AA_START_SCAN = 'AA_START_SCAN',
  /** SidePanel → Background：取消扫描 */
  AA_CANCEL_SCAN = 'AA_CANCEL_SCAN',
  /** Background → SidePanel：扫描进度更新 */
  AA_SCAN_PROGRESS = 'AA_SCAN_PROGRESS',
  /** Background → SidePanel：扫描完成 */
  AA_SCAN_COMPLETE = 'AA_SCAN_COMPLETE',
  /** Background → SidePanel：扫描出错 */
  AA_SCAN_ERROR = 'AA_SCAN_ERROR',
  /** Content Script → Background：页面扫描结果上报 */
  AA_SCAN_RESULT = 'AA_SCAN_RESULT',
  /** SidePanel → Background：登录 */
  AA_AUTH_LOGIN = 'AA_AUTH_LOGIN',
  /** SidePanel → Background：登出 */
  AA_AUTH_LOGOUT = 'AA_AUTH_LOGOUT',
  /** Background → SidePanel：认证状态变化 */
  AA_AUTH_STATE_CHANGED = 'AA_AUTH_STATE_CHANGED',
  /** 任意上下文 → Background：请求拉取最新状态 */
  AA_SYNC_STATE = 'AA_SYNC_STATE',
  /** Background → 任意：状态已更新，请拉取 */
  AA_STATE_UPDATED = 'AA_STATE_UPDATED',
}

/** 通用消息信封 */
export interface ScanMessage<T = unknown> {
  type: ScanMessageType;
  payload?: T;
  /** 消息发送时间戳 */
  timestamp: number;
  /** 来源标识，便于调试 */
  source?: string;
}

/* -------------------------------------------------------------------------- */
/* Storage Keys                                                                */
/* -------------------------------------------------------------------------- */

/**
 * chrome.storage.local 的 key 命名空间。
 *
 * Stateless Service Worker 架构下，所有持久化数据都通过这些 key 读写，
 * 不维护内存单例 —— 每次操作都从 storage 拉取最新值。
 */
export enum StorageKeys {
  /** JWT/会话 token */
  AUTH_TOKEN = 'aa_auth_token',
  /** 已登录用户信息 */
  USER_INFO = 'aa_user_info',
  /** 是否处于锁定状态（登出或失效后） */
  AUTH_LOCK = 'aa_auth_lock',
  /** 锁定原因，例如 "token_expired" / "user_logout" */
  AUTH_REASON = 'aa_auth_reason',
  /** 当前正在进行的扫描状态 */
  CURRENT_SCAN = 'aa_current_scan',
  /** 历史扫描记录数组 */
  SCAN_HISTORY = 'aa_scan_history',
  /** 扩展与页面间通信的桥接 token */
  AUTH_BRIDGE_TOKEN = 'aa_auth_bridge_token',
  /** Agent 活动日志 */
  ACTIVITY_LOG = 'aa_activity_log',
}
