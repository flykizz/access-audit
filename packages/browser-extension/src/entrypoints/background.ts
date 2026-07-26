/**
 * Background Entry Point (Stateless Service Worker)
 *
 * 关键设计：
 *  - **无状态**：不在 service worker 内存中维护任何单例状态。
 *    每次消息处理都从 chrome.storage.local 拉取最新状态，
 *    保证 SW 被回收后重新唤醒时状态依然可恢复。
 *  - 使用 WXT 的 defineBackground 语法
 *  - 启动时确保 Auth Bridge Token 存在
 *  - 配置 sidePanel 行为
 *  - 消息路由：根据 message.type 分发
 *  - 外部消息监听（externally_connectable）
 *  - storage 变化转发给所有标签页
 */

import { authManager } from '@/core/auth';
import { scanEventEmitter } from '@/core/event-bus';
import { scanService } from '@/core/scan-service';
import { storageService, onStorageChanged } from '@/core/storage';
import { StorageKeys } from '@/core/types';
import type {
  AuthState,
  ScanResult,
  ScanState,
  UserInfo,
} from '@/core/types';
import { pageController } from '@/agent/PageController';
import type { PageControlMessage } from '@/agent/PageController';
import { tabsController } from '@/agent/TabsController';
import type { TabsControlMessage } from '@/agent/TabsController';

/* -------------------------------------------------------------------------- */
/* 消息类型常量                                                                  */
/* -------------------------------------------------------------------------- */

/** 内部消息类型（SidePanel / Popup → Background） */
type InternalMessageType =
  | 'AA_GET_AUTH_STATUS'
  | 'AA_LOGIN'
  | 'AA_SIGNUP'
  | 'AA_LOGOUT'
  | 'AA_SCAN_CURRENT_PAGE'
  | 'AA_GET_CURRENT_SCAN'
  | 'AA_CANCEL_SCAN'
  | 'AA_GET_RULES'
  | 'AA_GET_HISTORY'
  | 'AA_GENERATE_BRIDGE_TOKEN'
  | 'TAB_CONTROL'
  | 'PAGE_CONTROL';

/** 外部消息类型（externally_connectable → Background） */
type ExternalMessageType =
  | 'AA_OPEN_SIDEPANEL'
  | 'AA_TRIGGER_SCAN'
  | 'AA_GET_SCAN_RESULT';

/** 通用消息信封 */
interface BackgroundMessage {
  type: string;
  payload?: any;
  timestamp?: number;
  source?: string;
}

/** 统一响应 */
interface BackgroundResponse<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
}

/** 登录/注册 payload */
interface AuthPayload {
  email?: string;
  password?: string;
  name?: string;
}

/** 规则查询 payload */
interface RulesPayload {
  category?: string;
}

/** 扫描触发 payload */
interface ScanPayload {
  category?: string;
}

/* -------------------------------------------------------------------------- */
/* Background 主入口                                                            */
/* -------------------------------------------------------------------------- */

export default defineBackground(() => {
  // 1. 启动初始化
  void initializeBridgeToken();
  configureSidePanel();
  setupStorageForwarding();

  // 2. 内部消息路由
  chrome.runtime.onMessage.addListener(onInternalMessage);

  // 3. 外部消息路由（externally_connectable）
  chrome.runtime.onMessageExternal.addListener(onExternalMessage);
});

/* -------------------------------------------------------------------------- */
/* 启动初始化                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * 确保 Auth Bridge Token 存在。
 *
 * Service worker 重启后此函数会再次执行，若 token 已存在则跳过，
 * 不覆盖已签发的 token —— 避免页面侧持有的旧 token 失效。
 */
async function initializeBridgeToken(): Promise<void> {
  try {
    const existing = await storageService.get<string>(StorageKeys.AUTH_BRIDGE_TOKEN);
    if (!existing) {
      await authManager.generateBridgeToken();
    }
  } catch (err) {
    console.error('[background] 初始化 Auth Bridge Token 失败：', err);
  }
}

/**
 * 配置 sidePanel：点击扩展图标时打开 side panel。
 *
 * 必须在 SW 启动早期调用，否则首次安装后点击图标可能走默认 popup 行为。
 */
function configureSidePanel(): void {
  try {
    if (chrome.sidePanel?.setPanelBehavior) {
      chrome.sidePanel.setPanelBehavior(
        { openPanelOnActionClick: true },
        () => {
          const err = chrome.runtime.lastError;
          if (err) {
            console.error('[background] 配置 sidePanel 失败：', err.message);
          }
        },
      );
    }
  } catch (err) {
    console.error('[background] sidePanel API 不可用：', err);
  }
}

/**
 * 监听 storage.local 变化并转发给所有标签页的 content script。
 *
 * 用于 content script 同步 background 写入的状态（如扫描进度、认证状态），
 * 避免 content script 轮询 storage。
 */
function setupStorageForwarding(): void {
  onStorageChanged((changes, areaName) => {
    if (areaName !== 'local') return;
    // 只转发 aa_ 命名空间的变化
    const aaChanges = Object.keys(changes).filter((k) => k.startsWith('aa_'));
    if (aaChanges.length === 0) return;

    const payload: Record<string, { oldValue?: unknown; newValue?: unknown }> = {};
    for (const key of aaChanges) {
      payload[key] = {
        oldValue: changes[key].oldValue,
        newValue: changes[key].newValue,
      };
    }

    // 广播到所有标签页
    chrome.tabs.query({}, (tabs) => {
      for (const tab of tabs) {
        if (tab.id == null) continue;
        // 跳过浏览器内部页面，这些页面无法注入 content script
        if (tab.url && (tab.url.startsWith('chrome://') || tab.url.startsWith('edge://') || tab.url.startsWith('about:'))) {
          continue;
        }
        chrome.tabs.sendMessage(
          tab.id,
          {
            type: 'AA_STORAGE_CHANGED',
            payload,
            timestamp: Date.now(),
            source: 'background',
          },
          () => {
            // content script 可能未注入，忽略 lastError
            void chrome.runtime.lastError;
          },
        );
      }
    });
  });
}

/* -------------------------------------------------------------------------- */
/* 内部消息处理                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * 内部消息监听器。
 *
 * 对于 TAB_CONTROL / PAGE_CONTROL，委托给对应控制器的 handle 方法
 * （控制器内部自行管理异步响应，直接返回其返回值）。
 * 其他类型走统一的 async handler。
 */
function onInternalMessage(
  message: BackgroundMessage,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response: BackgroundResponse) => void,
): boolean {
  if (!message || typeof message.type !== 'string') {
    return false;
  }

  // 委托给控制器的消息：由控制器自行调用 sendResponse
  if (message.type === 'TAB_CONTROL') {
    return tabsController.handleTabControlMessage(
      message as TabsControlMessage,
      sender,
      sendResponse as (response: unknown) => void,
    );
  }
  if (message.type === 'PAGE_CONTROL') {
    return pageController.handlePageControlMessage(
      message as PageControlMessage,
      sender,
      sendResponse as (response: unknown) => void,
    );
  }

  // 统一 async handler：处理业务消息
  handleInternalMessage(message)
    .then((data) => sendResponse({ ok: true, data }))
    .catch((err: unknown) => {
      const msg = err instanceof Error ? err.message : String(err);
      sendResponse({ ok: false, error: msg });
    });
  return true; // 异步响应
}

/** 业务消息分发器 */
async function handleInternalMessage(
  message: BackgroundMessage,
): Promise<unknown> {
  switch (message.type as InternalMessageType) {
    case 'AA_GET_AUTH_STATUS': {
      const state: AuthState = await authManager.getAuthState();
      return state;
    }
    case 'AA_LOGIN': {
      const { email, password } = (message.payload ?? {}) as AuthPayload;
      if (!email || !password) {
        throw new Error('AA_LOGIN 缺少 email 或 password');
      }
      const user: UserInfo = await authManager.login(email, password);
      return user;
    }
    case 'AA_SIGNUP': {
      const { name, email, password } = (message.payload ?? {}) as AuthPayload;
      if (!name || !email || !password) {
        throw new Error('AA_SIGNUP 缺少 name / email / password');
      }
      const user: UserInfo = await authManager.signup(name, email, password);
      return user;
    }
    case 'AA_LOGOUT': {
      await authManager.logout();
      return null;
    }
    case 'AA_SCAN_CURRENT_PAGE': {
      const { category } = (message.payload ?? {}) as ScanPayload;
      const result: ScanResult = await scanService.scanCurrentPage({ category });
      return result;
    }
    case 'AA_GET_CURRENT_SCAN': {
      const state: ScanState = await scanService.getScanState();
      return state;
    }
    case 'AA_CANCEL_SCAN': {
      await scanService.cancelScan();
      return null;
    }
    case 'AA_GET_RULES': {
      const { category } = (message.payload ?? {}) as RulesPayload;
      return await scanService.getRules(category);
    }
    case 'AA_GET_HISTORY': {
      return await scanEventEmitter.getHistory();
    }
    case 'AA_GENERATE_BRIDGE_TOKEN': {
      const token: string = await authManager.generateBridgeToken();
      return token;
    }
    default: {
      throw new Error(`未知的消息类型：${message.type}`);
    }
  }
}

/* -------------------------------------------------------------------------- */
/* 外部消息处理（externally_connectable）                                          */
/* -------------------------------------------------------------------------- */

/**
 * 外部消息监听器。
 *
 * 来自 manifest.externally_connectable.matches 中声明的页面（如本地开发服务器）。
 * 用于让 AccessAudit Web 应用与扩展交互。
 */
function onExternalMessage(
  message: BackgroundMessage,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response: BackgroundResponse) => void,
): boolean {
  if (!message || typeof message.type !== 'string') {
    return false;
  }

  handleExternalMessage(message, sender)
    .then((data) => sendResponse({ ok: true, data }))
    .catch((err: unknown) => {
      const msg = err instanceof Error ? err.message : String(err);
      sendResponse({ ok: false, error: msg });
    });
  return true; // 异步响应
}

/** 外部消息分发器 */
async function handleExternalMessage(
  message: BackgroundMessage,
  sender: chrome.runtime.MessageSender,
): Promise<unknown> {
  switch (message.type as ExternalMessageType) {
    case 'AA_OPEN_SIDEPANEL': {
      // sidePanel.open 需要用户手势上下文，外部调用可能失败
      const tabId = sender.tab?.id;
      const windowId = sender.tab?.windowId;
      try {
        if (chrome.sidePanel?.open && tabId != null) {
          await chrome.sidePanel.open({ tabId, windowId });
          return { opened: true };
        }
      } catch (err) {
        // 没有用户手势时会抛错
        console.warn('[background] sidePanel.open 失败（可能缺少用户手势）：', err);
      }
      return { opened: false };
    }
    case 'AA_TRIGGER_SCAN': {
      const { category } = (message.payload ?? {}) as ScanPayload;
      const result: ScanResult = await scanService.scanCurrentPage({ category });
      return result;
    }
    case 'AA_GET_SCAN_RESULT': {
      const state: ScanState = await scanService.getScanState();
      return state;
    }
    default: {
      throw new Error(`未知的外部消息类型：${message.type}`);
    }
  }
}
