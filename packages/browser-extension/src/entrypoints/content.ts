/**
 * Content Script Entry Point
 *
 * 使用 WXT 的 defineContentScript 语法。运行在页面的隔离世界（isolated world），
 * 可访问 DOM 但不能直接访问页面 JS 变量。
 *
 * 职责（不包含 UI 逻辑，UI 在 sidepanel 中）：
 *  - 注入页面遮罩层容器（用于渲染违规标记）
 *  - 监听来自 background / sidepanel 的消息，渲染页面标记 / 高亮元素
 *  - 校验 Auth Bridge Token，匹配则注入 main-world.js
 *  - 提供 getPageInfo() 供 PageController 调用
 *  - 桥接 main-world ↔ content-script 的 postMessage 通信
 */

import { storageService } from '@/core/storage';
import { StorageKeys } from '@/core/types';
import type { ScanResult, Violation } from '@/core/types';
import { throttle } from '@/core/utils';

/** 页面侧存储 bridge token 的 localStorage key */
const PAGE_BRIDGE_TOKEN_KEY = 'AccessAuditBridgeToken';

/** main-world ↔ content-script postMessage 通道 */
const MSG_REQUEST = 'ACCESSAUDIT_EXT_REQUEST';
const MSG_RESPONSE = 'ACCESSAUDIT_EXT_RESPONSE';

/** 遮罩层根容器 ID */
const OVERLAY_ROOT_ID = 'accessaudit-overlay-root';
/** 单个违规标记的 class 前缀 */
const MARKER_CLASS = 'accessaudit-marker';

/** 当前已渲染的扫描结果（用于 resize / scroll 时重新定位） */
let currentResult: ScanResult | null = null;
/** 遮罩层是否可见 */
let overlayVisible = true;
/** overlay root 元素 */
let overlayRoot: HTMLDivElement | null = null;
/** 标记是否已注入 main-world.js（避免重复注入） */
let mainWorldInjected = false;

/* -------------------------------------------------------------------------- */
/* WXT 入口                                                                     */
/* -------------------------------------------------------------------------- */

export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_idle',
  async main() {
    // 1. 注入遮罩层容器
    overlayRoot = injectOverlayContainer();

    // 2. 监听来自 background / sidepanel 的消息
    chrome.runtime.onMessage.addListener(onRuntimeMessage);

    // 3. 设置 main-world postMessage 桥接
    setupMainWorldBridge();

    // 4. 校验 bridge token，匹配则注入 main-world.js
    void validateAndInjectMainWorld();

    // 5. 监听 scroll / resize 重新定位标记
    const reposition = throttle(repositionMarkers, 100);
    window.addEventListener('scroll', reposition, { passive: true });
    window.addEventListener('resize', reposition);
  },
});

/* -------------------------------------------------------------------------- */
/* 遮罩层容器                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * 注入遮罩层根容器。
 *
 * 使用 fixed 定位 + pointer-events:none，不拦截页面交互。
 * 子元素（标记）按需启用 pointer-events:auto。
 */
function injectOverlayContainer(): HTMLDivElement {
  // 避免重复注入（SPA 路由切换可能触发多次）
  const existing = document.getElementById(OVERLAY_ROOT_ID);
  if (existing) return existing as HTMLDivElement;

  const root = document.createElement('div');
  root.id = OVERLAY_ROOT_ID;
  root.setAttribute('data-accessaudit', 'overlay');
  Object.assign(root.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '0',
    height: '0',
    pointerEvents: 'none',
    zIndex: '2147483647', // 最大 z-index，确保覆盖页面所有元素
  });
  (document.body || document.documentElement).appendChild(root);
  return root;
}

/* -------------------------------------------------------------------------- */
/* 消息处理                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * chrome.runtime.onMessage 监听器。
 *
 * 对于同步响应（getPageInfo / getHtml），直接调用 sendResponse 并返回 false。
 * 对于异步操作，返回 true 并在完成后调用 sendResponse。
 */
function onRuntimeMessage(
  message: any,
  _sender: chrome.runtime.MessageSender,
  sendResponse: (response?: unknown) => void,
): boolean {
  if (!message || typeof message.type !== 'string') return false;

  switch (message.type) {
    /* -------- 页面信息（同步响应） -------- */
    case 'AA_GET_PAGE_INFO': {
      sendResponse(getPageInfo());
      return false;
    }

    /* -------- scanService 抓取 HTML（同步响应） -------- */
    case 'AA_SYNC_STATE': {
      if (message.action === 'getHtml') {
        sendResponse({ html: document.documentElement.outerHTML });
        return false;
      }
      return false;
    }

    /* -------- 扫描结果：渲染页面标记 -------- */
    case 'AA_SCAN_RESULTS': {
      const result = message.payload as ScanResult;
      currentResult = result ?? null;
      renderMarkers(currentResult);
      return false;
    }

    /* -------- 遮罩层显隐控制 -------- */
    case 'AA_SHOW_OVERLAY': {
      overlayVisible = true;
      setOverlayVisibility(true);
      return false;
    }
    case 'AA_HIDE_OVERLAY': {
      overlayVisible = false;
      setOverlayVisibility(false);
      return false;
    }
    case 'AA_TOGGLE_OVERLAY': {
      overlayVisible = !overlayVisible;
      setOverlayVisibility(overlayVisible);
      return false;
    }

    /* -------- 高亮指定元素 -------- */
    case 'AA_HIGHLIGHT_ELEMENT': {
      const selector = message.payload?.selector ?? message.selector;
      if (typeof selector === 'string') {
        highlightElementBySelector(selector);
      }
      return false;
    }

    /* -------- 认证状态变更 -------- */
    case 'AA_AUTH_CHANGED': {
      // 认证状态变化时，重新校验 bridge token 并按需注入 main-world
      void validateAndInjectMainWorld();
      return false;
    }

    /* -------- storage 变化（background 转发） -------- */
    case 'AA_STORAGE_CHANGED': {
      // 若扫描状态变化，可触发标记重渲染（sidepanel 关闭后重开场景）
      const changes = message.payload ?? {};
      if (changes[StorageKeys.CURRENT_SCAN]) {
        const scanState = changes[StorageKeys.CURRENT_SCAN].newValue;
        if (scanState?.result) {
          currentResult = scanState.result as ScanResult;
          renderMarkers(currentResult);
        }
      }
      return false;
    }

    default:
      return false;
  }
}

/* -------------------------------------------------------------------------- */
/* 页面信息收集                                                                  */
/* -------------------------------------------------------------------------- */

/** 页面元信息快照（与 PageController.collectPageInfo 保持一致） */
function getPageInfo() {
  const meta = (name: string): string | null => {
    const el = document.querySelector(`meta[name="${name}"]`);
    return el?.getAttribute('content') ?? null;
  };
  const metaProp = (name: string): string | null => {
    const el = document.querySelector(`meta[property="${name}"]`);
    return el?.getAttribute('content') ?? null;
  };
  const canonicalHref = document
    .querySelector('link[rel="canonical"]')
    ?.getAttribute('href');
  return {
    title: document.title,
    url: location.href,
    description: meta('description'),
    htmlLang: document.documentElement.getAttribute('lang'),
    charset: document.characterSet,
    viewport: meta('viewport'),
    canonical: canonicalHref ?? null,
    ogTitle: metaProp('og:title'),
    ogDescription: metaProp('og:description'),
  };
}

/* -------------------------------------------------------------------------- */
/* 违规标记渲染                                                                  */
/* -------------------------------------------------------------------------- */

/** 清空所有标记 */
function clearMarkers(): void {
  if (!overlayRoot) return;
  const markers = overlayRoot.querySelectorAll(`.${MARKER_CLASS}`);
  markers.forEach((m) => m.remove());
}

/** 根据扫描结果渲染违规标记 */
function renderMarkers(result: ScanResult | null): void {
  if (!overlayRoot) return;
  clearMarkers();
  if (!result || !overlayVisible) return;

  for (const violation of result.violations ?? []) {
    for (const node of violation.nodes ?? []) {
      const selector = node.target?.[0];
      if (!selector) continue;
      try {
        const el = document.querySelector(selector);
        if (!el) continue;
        appendMarker(el, violation);
      } catch {
        // 选择器无效或被 CSP 拦截，跳过
      }
    }
  }
}

/**
 * 在目标元素旁附加一个违规标记（小圆点）。
 *
 * 标记本身启用 pointer-events:auto，可悬浮查看违规描述。
 */
function appendMarker(target: Element, violation: Violation): void {
  if (!overlayRoot) return;
  const rect = target.getBoundingClientRect();

  const marker = document.createElement('div');
  marker.className = MARKER_CLASS;
  marker.title = `${violation.description}${violation.help ? ' — ' + violation.help : ''}`;
  Object.assign(marker.style, {
    position: 'fixed',
    left: `${rect.right - 14}px`,
    top: `${rect.top + 2}px`,
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    background: impactColor(violation.impact),
    border: '2px solid #fff',
    boxShadow: '0 0 2px rgba(0,0,0,0.5)',
    pointerEvents: 'auto',
    cursor: 'help',
  });
  overlayRoot.appendChild(marker);
}

/** impact → 标记颜色 */
function impactColor(impact: Violation['impact']): string {
  switch (impact) {
    case 'critical':
      return '#7f1d1d'; // red-900
    case 'serious':
      return '#dc2626'; // red-600
    case 'moderate':
      return '#d97706'; // amber-600
    case 'minor':
      return '#2563eb'; // blue-600
    default:
      return '#6b7280'; // gray-500
  }
}

/** scroll / resize 时重新定位已有标记 */
function repositionMarkers(): void {
  if (!currentResult) return;
  renderMarkers(currentResult);
}

/** 切换遮罩层可见性 */
function setOverlayVisibility(visible: boolean): void {
  if (overlayRoot) {
    overlayRoot.style.display = visible ? '' : 'none';
  }
  if (visible) {
    renderMarkers(currentResult);
  } else {
    clearMarkers();
  }
}

/* -------------------------------------------------------------------------- */
/* 元素高亮                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * 高亮指定选择器对应的元素（红色 outline，2s 后自动恢复）。
 *
 * 与 PageController.highlightElement 类似，但直接在 content script 中执行
 * （避免重复 chrome.scripting.executeScript 调用）。
 */
function highlightElementBySelector(selector: string): void {
  let el: Element | null = null;
  try {
    el = document.querySelector(selector);
  } catch {
    return;
  }
  if (!el) return;
  const htmlEl = el as HTMLElement;
  const originalOutline = htmlEl.style.outline;
  const originalOffset = htmlEl.style.outlineOffset;
  htmlEl.style.outline = '3px solid #dc2626';
  htmlEl.style.outlineOffset = '2px';
  setTimeout(() => {
    htmlEl.style.outline = originalOutline;
    htmlEl.style.outlineOffset = originalOffset;
  }, 2000);
}

/* -------------------------------------------------------------------------- */
/* Auth Bridge Token 校验 + main-world 注入                                       */
/* -------------------------------------------------------------------------- */

/**
 * 校验 Auth Bridge Token：
 *  1. 从 chrome.storage.local 读取扩展侧的 extToken
 *  2. 从 localStorage 读取页面侧的 pageToken
 *  3. 二者匹配则注入 main-world.js
 *
 * 重复调用安全：已注入则跳过。
 */
async function validateAndInjectMainWorld(): Promise<void> {
  if (mainWorldInjected) return;

  try {
    const extToken = await storageService.get<string>(StorageKeys.AUTH_BRIDGE_TOKEN);
    if (!extToken) return;

    const pageToken = localStorage.getItem(PAGE_BRIDGE_TOKEN_KEY);
    if (!pageToken || pageToken !== extToken) return;

    injectMainWorldScript();
    mainWorldInjected = true;
  } catch (err) {
    console.error('[content] bridge token 校验失败：', err);
  }
}

/**
 * 通过 <script src> 注入 main-world.js 到页面主世界。
 *
 * main-world.js 必须在 manifest.web_accessible_resources 中声明，
 * 否则 chrome.runtime.getURL 返回的 URL 会被页面 CSP 拒绝。
 */
function injectMainWorldScript(): void {
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('main-world.js');
  script.async = false;
  script.onload = () => {
    // 加载完成后移除 script 标签，避免污染 DOM
    script.remove();
  };
  script.onerror = () => {
    console.error('[content] main-world.js 加载失败');
    script.remove();
  };
  (document.head || document.documentElement).appendChild(script);
}

/* -------------------------------------------------------------------------- */
/* main-world ↔ content-script postMessage 桥接                                  */
/* -------------------------------------------------------------------------- */

/**
 * 监听来自 main-world.js 的 postMessage 请求。
 *
 * 通信协议：
 *  - main-world → content：{ type: 'ACCESSAUDIT_EXT_REQUEST', action, payload?, id? }
 *  - content → main-world：{ type: 'ACCESSAUDIT_EXT_RESPONSE', id, ok, data? }
 *
 * 校验：只有当 content script 已成功校验 bridge token 并注入 main-world 后，
 * 才响应请求，防止页面直接伪造 postMessage 调用。
 */
function setupMainWorldBridge(): void {
  window.addEventListener('message', (event) => {
    // 仅接受同源消息
    if (event.source !== window) return;
    const data = event.data;
    if (!data || data.type !== MSG_REQUEST) return;

    // 未通过 bridge token 校验 —— 拒绝所有请求
    if (!mainWorldInjected) {
      respondToMainWorld(data.id, false, null, 'bridge token 未校验');
      return;
    }

    handleMainWorldRequest(data)
      .then((result) => respondToMainWorld(data.id, true, result))
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : String(err);
        respondToMainWorld(data.id, false, null, msg);
      });
  });
}

/** 处理来自 main-world 的请求 */
async function handleMainWorldRequest(request: any): Promise<unknown> {
  switch (request.action) {
    case 'verify': {
      // main-world 验证是否被合法注入
      return { valid: true };
    }
    case 'getPageInfo': {
      return getPageInfo();
    }
    case 'getHtml': {
      return { html: document.documentElement.outerHTML };
    }
    default: {
      throw new Error(`未知的 main-world 请求：${request.action}`);
    }
  }
}

/** 向 main-world 发送响应 */
function respondToMainWorld(
  id: unknown,
  ok: boolean,
  data: unknown = null,
  error?: string,
): void {
  window.postMessage(
    {
      type: MSG_RESPONSE,
      id,
      ok,
      data,
      error,
    },
    '*',
  );
}
