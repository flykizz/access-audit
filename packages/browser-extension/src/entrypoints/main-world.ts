/**
 * Main World Script
 *
 * 使用 WXT 的 defineUnlistedScript 语法。运行在页面的主世界（main world），
 * 可直接访问 window 对象与页面 JS 上下文。
 *
 * 通过 window.postMessage 与 content script 通信（content script 作为桥接）。
 * 通信通道：
 *  - main-world → content：ACCESSAUDIT_EXT_REQUEST
 *  - content → main-world：ACCESSAUDIT_EXT_RESPONSE
 *
 * 暴露 window.AccessAuditExt 对象，提供只读检测 API。
 *
 * 校验：只有当 localStorage 的 AccessAuditBridgeToken 与扩展 token 匹配时
 * 才激活（content script 在注入前已做一次校验，main-world 再做一次握手确认）。
 *
 * 注意：此脚本运行在页面主世界，**不能** import 任何引用了 chrome.* API
 * 或扩展上下文的模块，否则会将扩展代码打包进页面世界。
 */

/** localStorage 中存储 bridge token 的 key */
const PAGE_BRIDGE_TOKEN_KEY = 'AccessAuditBridgeToken';

/** postMessage 通信通道 */
const MSG_REQUEST = 'ACCESSAUDIT_EXT_REQUEST';
const MSG_RESPONSE = 'ACCESSAUDIT_EXT_RESPONSE';

/** 全局对象名 */
const GLOBAL_NAME = 'AccessAuditExt';

/** 是否已激活（通过 bridge token 校验） */
let activated = false;

/** 待处理的请求回调（id → resolver） */
const pendingRequests = new Map<string, (response: MainWorldResponse) => void>();

/* -------------------------------------------------------------------------- */
/* 类型定义                                                                      */
/* -------------------------------------------------------------------------- */

interface MainWorldRequest {
  type: typeof MSG_REQUEST;
  action: string;
  payload?: unknown;
  id: string;
}

interface MainWorldResponse {
  type: typeof MSG_RESPONSE;
  id: string;
  ok: boolean;
  data?: unknown;
  error?: string;
}

/** Accessibility tree 节点 */
interface A11yTreeNode {
  role: string | null;
  name: string | null;
  level: number | null;
  children: A11yTreeNode[];
  selector: string;
}

/** ARIA 属性快照 */
interface AriaAttributes {
  [key: string]: string | null;
}

/** 焦点状态快照 */
interface FocusState {
  activeElement: string | null;
  tagName: string | null;
  role: string | null;
  ariaLabel: string | null;
  selector: string | null;
  isContentEditable: boolean;
}

/** 动态内容（aria-live 区域） */
interface DynamicContentRegion {
  selector: string;
  ariaLive: string | null;
  ariaAtomic: string | null;
  text: string;
}

/* -------------------------------------------------------------------------- */
/* WXT 入口                                                                     */
/* -------------------------------------------------------------------------- */

export default defineUnlistedScript({
  main() {
    // 防止重复注入
    if ((window as any)[GLOBAL_NAME]) {
      return;
    }

    // 1. 先校验 localStorage 中是否存在 bridge token
    const pageToken = localStorage.getItem(PAGE_BRIDGE_TOKEN_KEY);
    if (!pageToken) {
      // 页面侧未设置 token —— 不激活，仅暴露空壳便于页面检测扩展存在
      exposePlaceholder();
      return;
    }

    // 2. 设置 content-script 响应监听
    setupResponseListener();

    // 3. 向 content script 发起握手验证
    void handshake()
      .then((valid) => {
        if (valid) {
          activated = true;
          exposeApi();
        } else {
          exposePlaceholder();
        }
      })
      .catch(() => {
        // 握手失败（content script 未响应）—— 暴露空壳
        exposePlaceholder();
      });
  },
});

/* -------------------------------------------------------------------------- */
/* content-script 通信                                                          */
/* -------------------------------------------------------------------------- */

/** 生成唯一请求 ID */
function genId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/** 监听来自 content script 的响应 */
function setupResponseListener(): void {
  window.addEventListener('message', (event) => {
    if (event.source !== window) return;
    const data = event.data as MainWorldResponse;
    if (!data || data.type !== MSG_RESPONSE) return;

    const resolver = pendingRequests.get(data.id);
    if (!resolver) return;
    pendingRequests.delete(data.id);
    resolver(data);
  });
}

/**
 * 向 content script 发送请求并等待响应。
 *
 * 超时 5s 自动拒绝，避免页面侧永久挂起。
 */
function sendRequest<T = unknown>(
  action: string,
  payload?: unknown,
  timeoutMs = 5000,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const id = genId();
    const timer = setTimeout(() => {
      pendingRequests.delete(id);
      reject(new Error(`main-world 请求超时：${action}`));
    }, timeoutMs);

    pendingRequests.set(id, (response: MainWorldResponse) => {
      clearTimeout(timer);
      if (response.ok) {
        resolve(response.data as T);
      } else {
        reject(new Error(response.error || `请求失败：${action}`));
      }
    });

    const request: MainWorldRequest = {
      type: MSG_REQUEST,
      action,
      payload,
      id,
    };
    window.postMessage(request, '*');
  });
}

/**
 * 握手验证：确认 content script 已校验 bridge token 并注入本脚本。
 */
async function handshake(): Promise<boolean> {
  try {
    const result = await sendRequest<{ valid: boolean }>('verify');
    return Boolean(result?.valid);
  } catch {
    return false;
  }
}

/* -------------------------------------------------------------------------- */
/* 检测 API 实现                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * 生成元素的唯一 CSS 选择器。
 *
 * 用于在 tree / state 中标识元素，便于 content script 后续定位。
 */
function buildSelector(el: Element | null): string {
  if (!el) return '';
  if (el.id) return `#${CSS.escape(el.id)}`;
  const parts: string[] = [];
  let node: Element | null = el;
  while (node && node.nodeType === Node.ELEMENT_NODE) {
    const part = buildSingleSelector(node);
    parts.unshift(part);
    if (node.tagName === 'BODY' || node.tagName === 'HTML') break;
    node = node.parentElement;
  }
  return parts.join(' > ');
}

function buildSingleSelector(el: Element): string {
  const tag = el.tagName.toLowerCase();
  if (el.id) return `${tag}#${CSS.escape(el.id)}`;
  // 用 nth-of-type 定位
  const parent = el.parentElement;
  if (!parent) return tag;
  const siblings = Array.from(parent.children).filter(
    (c) => c.tagName === el.tagName,
  );
  if (siblings.length === 1) return tag;
  const index = siblings.indexOf(el) + 1;
  return `${tag}:nth-of-type(${index})`;
}

/**
 * 读取元素的 ARIA 属性（所有 aria-* 开头的属性）。
 */
function getAriaAttributes(el: Element): AriaAttributes {
  const attrs: AriaAttributes = {};
  for (const attr of Array.from(el.attributes)) {
    if (attr.name.startsWith('aria-')) {
      attrs[attr.name] = attr.value;
    }
  }
  // 补充 role 属性
  attrs.role = el.getAttribute('role');
  return attrs;
}

/**
 * 构建页面的 accessibility tree。
 *
 * 遍历 DOM，提取每个有语义的元素的 role / name / level。
 * "有语义" 指满足以下任一条件：
 *  - 有 role 属性
 *  - 有 aria-label / aria-labelledby
 *  - 是原生语义元素（button / a / input / nav / main / header 等）
 */
function getAccessibilityTree(): A11yTreeNode {
  const SEMANTIC_TAGS = new Set([
    'a', 'button', 'input', 'select', 'textarea',
    'nav', 'main', 'header', 'footer', 'aside', 'section',
    'article', 'form', 'img', 'table', 'caption', 'thead',
    'tbody', 'tr', 'th', 'td', 'ul', 'ol', 'li', 'h1', 'h2',
    'h3', 'h4', 'h5', 'h6', 'p', 'label', 'fieldset', 'legend',
    'details', 'summary', 'dialog', 'figure', 'figcaption',
    'video', 'audio', 'canvas', 'svg',
  ]);

  function buildNode(el: Element, level: number): A11yTreeNode | null {
    const role = el.getAttribute('role');
    const ariaLabel = el.getAttribute('aria-label');
    const ariaLabelledBy = el.getAttribute('aria-labelledby');
    const isSemantic =
      role != null ||
      ariaLabel != null ||
      ariaLabelledBy != null ||
      SEMANTIC_TAGS.has(el.tagName.toLowerCase());

    if (!isSemantic) return null;

    let name: string | null = ariaLabel;
    if (!name && ariaLabelledBy) {
      const labelEl = document.getElementById(ariaLabelledBy);
      name = labelEl?.textContent?.trim() ?? null;
    }
    if (!name) {
      name = el.textContent?.trim().slice(0, 120) || null;
    }

    const headingLevel = (() => {
      const m = el.tagName.match(/^H([1-6])$/);
      return m ? Number(m[1]) : el.getAttribute('aria-level') ? Number(el.getAttribute('aria-level')) : null;
    })();

    const children: A11yTreeNode[] = [];
    for (const child of Array.from(el.children)) {
      const childNode = buildNode(child, level + 1);
      if (childNode) children.push(childNode);
    }

    return {
      role: role ?? implicitRole(el),
      name,
      level: headingLevel,
      children,
      selector: buildSelector(el),
    };
  }

  return buildNode(document.body, 0) ?? {
    role: null,
    name: null,
    level: null,
    children: [],
    selector: 'body',
  };
}

/** 推断元素的原生隐式 role（简化版，仅覆盖常见元素） */
function implicitRole(el: Element): string | null {
  const tag = el.tagName.toLowerCase();
  const type = el.getAttribute('type');
  switch (tag) {
    case 'a':
      return el.hasAttribute('href') ? 'link' : null;
    case 'button':
      return type === 'menu' ? 'menuitem' : 'button';
    case 'input':
      switch (type) {
        case 'button':
        case 'submit':
        case 'reset':
          return 'button';
        case 'checkbox':
          return 'checkbox';
        case 'radio':
          return 'radio';
        case 'range':
          return 'slider';
        case 'search':
          return 'searchbox';
        case 'email':
        case 'tel':
        case 'url':
          return 'textbox';
        default:
          return 'textbox';
      }
    case 'nav':
      return 'navigation';
    case 'main':
      return 'main';
    case 'header':
      return 'banner';
    case 'footer':
      return 'contentinfo';
    case 'aside':
      return 'complementary';
    case 'article':
      return 'article';
    case 'section':
      return 'region';
    case 'form':
      return 'form';
    case 'img':
      return 'img';
    case 'table':
      return 'table';
    case 'ul':
    case 'ol':
      return 'list';
    case 'li':
      return 'listitem';
    case 'h1':
    case 'h2':
    case 'h3':
    case 'h4':
    case 'h5':
    case 'h6':
      return 'heading';
    case 'label':
      return 'label';
    case 'select':
      return 'listbox';
    case 'textarea':
      return 'textbox';
    case 'dialog':
      return 'dialog';
    default:
      return null;
  }
}

/**
 * 获取当前焦点状态。
 */
function getFocusState(): FocusState {
  const el = document.activeElement;
  if (!el || el === document.body) {
    return {
      activeElement: null,
      tagName: null,
      role: null,
      ariaLabel: null,
      selector: null,
      isContentEditable: false,
    };
  }
  return {
    activeElement: el.tagName.toLowerCase(),
    tagName: el.tagName,
    role: el.getAttribute('role'),
    ariaLabel: el.getAttribute('aria-label'),
    selector: buildSelector(el),
    isContentEditable: (el as HTMLElement).isContentEditable,
  };
}

/**
 * 检测页面中的动态内容（aria-live 区域）。
 */
function getDynamicContent(): DynamicContentRegion[] {
  const liveRegions = document.querySelectorAll(
    '[aria-live], [role="alert"], [role="status"], [role="log"], [role="marquee"], [role="timer"]',
  );
  const regions: DynamicContentRegion[] = [];
  for (const el of Array.from(liveRegions)) {
    regions.push({
      selector: buildSelector(el),
      ariaLive: el.getAttribute('aria-live'),
      ariaAtomic: el.getAttribute('aria-atomic'),
      text: el.textContent?.trim().slice(0, 200) ?? '',
    });
  }
  return regions;
}

/**
 * 监听焦点变化。
 *
 * 返回取消监听函数。
 */
function observeFocusChanges(callback: (state: FocusState) => void): () => void {
  const handler = () => callback(getFocusState());
  document.addEventListener('focus', handler, true);
  document.addEventListener('blur', handler, true);
  return () => {
    document.removeEventListener('focus', handler, true);
    document.removeEventListener('blur', handler, true);
  };
}

/**
 * 监听 DOM 变化。
 *
 * 返回取消监听函数。
 */
function observeDOMChanges(callback: (mutations: MutationRecord[]) => void): () => void {
  const observer = new MutationObserver((mutations) => {
    callback(mutations);
  });
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['aria-live', 'role', 'aria-label', 'class'],
    characterData: true,
  });
  return () => observer.disconnect();
}

/* -------------------------------------------------------------------------- */
/* window.AccessAuditExt 暴露                                                   */
/* -------------------------------------------------------------------------- */

/**
 * 暴露完整的检测 API（已通过 bridge token 校验）。
 */
function exposeApi(): void {
  const api = {
    /** 是否已激活 */
    activated: true,
    /** 读取页面的 accessibility tree */
    getAccessibilityTree,
    /** 读取元素的 ARIA 属性 */
    getAriaAttributes(selector: string): AriaAttributes {
      const el = document.querySelector(selector);
      if (!el) throw new Error(`未找到元素：${selector}`);
      return getAriaAttributes(el);
    },
    /** 获取当前焦点状态 */
    getFocusState,
    /** 检测动态内容（aria-live 区域） */
    getDynamicContent,
    /** 监听焦点变化，返回取消函数 */
    observeFocusChanges,
    /** 监听 DOM 变化，返回取消函数 */
    observeDOMChanges,
    /** 通过 content script 桥接调用扩展能力（getPageInfo / getHtml 等） */
    request: sendRequest,
  };
  Object.defineProperty(window, GLOBAL_NAME, {
    value: api,
    writable: false,
    configurable: false,
    enumerable: true,
  });
}

/**
 * 暴露空壳对象（未通过校验）。
 *
 * 页面可通过 window.AccessAuditExt.activated === false 判断扩展未激活，
 * 但无法调用任何检测 API。
 */
function exposePlaceholder(): void {
  const placeholder = {
    activated: false,
    getAccessibilityTree: notActivated,
    getAriaAttributes: notActivated,
    getFocusState: notActivated,
    getDynamicContent: notActivated,
    observeFocusChanges: notActivated,
    observeDOMChanges: notActivated,
    request: notActivated,
  };
  Object.defineProperty(window, GLOBAL_NAME, {
    value: placeholder,
    writable: false,
    configurable: false,
    enumerable: true,
  });
}

/** 未激活时的统一拒绝函数 */
function notActivated(): never {
  throw new Error(
    'AccessAuditExt 未激活：bridge token 不匹配或扩展未授权。请先在扩展中完成认证。',
  );
}
