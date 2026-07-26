/**
 * PageController - 页面控制器
 *
 * 参考 page-agent 的 PAGE_CONTROL 模式，封装通过 chrome.scripting /
 * chrome.tabs 在目标页面执行的页面操作。无状态：不缓存页面信息。
 *
 * 注意：executeScript 通过消息传递时无法序列化函数引用，因此
 * 通过消息驱动 executeScript 仅适合调用预定义的注入函数；
 * 需要自定义脚本时请在 background 中直接调用 executeScript 方法。
 */

/** Page 控制消息的统一信封 */
export interface PageControlMessage {
  type: 'PAGE_CONTROL';
  action:
    | 'navigate'
    | 'executeScript'
    | 'insertCSS'
    | 'getPageInfo'
    | 'takeScreenshot'
    | 'scrollToElement'
    | 'highlightElement';
  tabId?: number;
  url?: string;
  /** executeScript 调用的注入函数标识（消息驱动时使用预定义函数名） */
  func?: () => unknown;
  /** 注入函数的参数 */
  args?: unknown[];
  css?: string;
  selector?: string;
}

/** 页面元信息快照 */
export interface PageInfo {
  title: string;
  url: string;
  description: string | null;
  htmlLang: string | null;
  charset: string | null;
  viewport: string | null;
  canonical: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
}

/** Page 控制统一响应 */
export interface PageControlResponse<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
}

/**
 * PageController —— 页面操作控制器。
 *
 * 可直接调用（同上下文）或通过消息驱动（跨上下文）。
 */
export class PageController {
  /** 导航到指定 URL */
  async navigateTo(tabId: number, url: string): Promise<void> {
    await chrome.tabs.update(tabId, { url });
  }

  /**
   * 在目标页面执行脚本。
   *
   * func 必须是顶层函数声明，不能闭包外部变量 —— chrome.scripting
   * 会把函数源码序列化后在页面世界重新构造，闭包变量无法跨世界传递。
   * 需要外部数据时通过 args 传入。
   */
  async executeScript<R = unknown>(
    tabId: number,
    func: () => R,
    args: unknown[] = [],
  ): Promise<R | undefined> {
    const results = await chrome.scripting.executeScript({
      target: { tabId },
      func,
      args,
    });
    return results?.[0]?.result as R | undefined;
  }

  /** 注入 CSS 到目标页面 */
  async insertCSS(tabId: number, css: string): Promise<void> {
    await chrome.scripting.insertCSS({
      target: { tabId },
      css,
    });
  }

  /**
   * 获取页面元信息。
   *
   * 优先调用 content script 暴露的 getPageInfo()（避免重复注入），
   * content script 未注入时降级到 chrome.scripting.executeScript。
   */
  async getPageInfo(tabId: number): Promise<PageInfo> {
    // 优先走 content script（已注入且可复用）
    try {
      const response = await chrome.tabs.sendMessage(tabId, {
        type: 'AA_GET_PAGE_INFO',
        timestamp: Date.now(),
      });
      if (response && typeof response === 'object' && 'title' in response) {
        return response as PageInfo;
      }
    } catch {
      // content script 未注入 —— 降级到 executeScript
    }
    const info = await this.executeScript<PageInfo>(tabId, collectPageInfo);
    return info ?? fallbackPageInfo();
  }

  /** 截取当前可见区域，返回 PNG dataUrl */
  async takeScreenshot(tabId: number): Promise<string> {
    const tab = await chrome.tabs.get(tabId);
    if (tab.windowId == null) {
      throw new Error('无法获取标签页的 windowId');
    }
    return await chrome.tabs.captureVisibleTab(tab.windowId, {
      format: 'png',
    });
  }

  /** 平滑滚动到指定选择器对应的元素 */
  async scrollToElement(tabId: number, selector: string): Promise<void> {
    await chrome.scripting.executeScript({
      target: { tabId },
      func: scrollToSelector,
      args: [selector],
    });
  }

  /** 高亮指定选择器对应的元素（红色 outline，2s 后自动恢复） */
  async highlightElement(tabId: number, selector: string): Promise<void> {
    await chrome.scripting.executeScript({
      target: { tabId },
      func: highlightSelector,
      args: [selector],
    });
  }

  /**
   * 消息处理入口。
   *
   * 根据 message.action 分发到具体方法，异步完成后调用 sendResponse。
   * 返回 true 告知 chrome.runtime.onMessage 将异步响应。
   */
  handlePageControlMessage(
    message: PageControlMessage,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response: PageControlResponse) => void,
  ): boolean {
    this.dispatch(message)
      .then((data) => sendResponse({ ok: true, data }))
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : String(err);
        sendResponse({ ok: false, error: msg });
      });
    return true; // 异步响应
  }

  /** 内部分发器 */
  private async dispatch(message: PageControlMessage): Promise<unknown> {
    switch (message.action) {
      case 'navigate': {
        if (message.tabId == null || !message.url) {
          throw new Error('navigate 缺少 tabId 或 url');
        }
        await this.navigateTo(message.tabId, message.url);
        return null;
      }
      case 'executeScript': {
        if (message.tabId == null || typeof message.func !== 'function') {
          throw new Error('executeScript 缺少 tabId 或 func');
        }
        return await this.executeScript(message.tabId, message.func, message.args);
      }
      case 'insertCSS': {
        if (message.tabId == null || !message.css) {
          throw new Error('insertCSS 缺少 tabId 或 css');
        }
        await this.insertCSS(message.tabId, message.css);
        return null;
      }
      case 'getPageInfo': {
        if (message.tabId == null) throw new Error('getPageInfo 缺少 tabId');
        return await this.getPageInfo(message.tabId);
      }
      case 'takeScreenshot': {
        if (message.tabId == null) throw new Error('takeScreenshot 缺少 tabId');
        return await this.takeScreenshot(message.tabId);
      }
      case 'scrollToElement': {
        if (message.tabId == null || !message.selector) {
          throw new Error('scrollToElement 缺少 tabId 或 selector');
        }
        await this.scrollToElement(message.tabId, message.selector);
        return null;
      }
      case 'highlightElement': {
        if (message.tabId == null || !message.selector) {
          throw new Error('highlightElement 缺少 tabId 或 selector');
        }
        await this.highlightElement(message.tabId, message.selector);
        return null;
      }
      default: {
        const exhaustive: never = message.action;
        throw new Error(`未知的 PAGE_CONTROL action: ${String(exhaustive)}`);
      }
    }
  }
}

/** 全局共享实例（无状态，安全共享） */
export const pageController = new PageController();

/* -------------------------------------------------------------------------- */
/* 注入页面的辅助函数                                                            */
/*                                                                            */
/* 这些函数必须是顶层声明，且不能闭包外部变量 —— chrome.scripting 会把            */
/* 函数源码序列化后在页面世界重新构造，闭包变量无法跨世界传递。需要外部数据          */
/* 时通过 args 参数传入。                                                        */
/* -------------------------------------------------------------------------- */

/** 收集页面元信息（在页面世界执行） */
function collectPageInfo(): PageInfo {
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

/** 空白 PageInfo 兜底（executeScript 失败时返回） */
function fallbackPageInfo(): PageInfo {
  return {
    title: '',
    url: '',
    description: null,
    htmlLang: null,
    charset: null,
    viewport: null,
    canonical: null,
    ogTitle: null,
    ogDescription: null,
  };
}

/** 滚动到指定元素（在页面世界执行） */
function scrollToSelector(selector: string): void {
  const el = document.querySelector(selector);
  if (!el) throw new Error(`未找到元素：${selector}`);
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/** 临时高亮指定元素（在页面世界执行，2s 后自动恢复原 outline） */
function highlightSelector(selector: string): void {
  const el = document.querySelector(selector);
  if (!el) throw new Error(`未找到元素：${selector}`);
  const htmlEl = el as HTMLElement;
  const originalOutline = htmlEl.style.outline;
  htmlEl.style.outline = '3px solid #dc2626';
  htmlEl.style.outlineOffset = '2px';
  setTimeout(() => {
    htmlEl.style.outline = originalOutline;
    htmlEl.style.outlineOffset = '';
  }, 2000);
}
