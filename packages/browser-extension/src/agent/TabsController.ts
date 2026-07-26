/**
 * TabsController - 标签页控制器
 *
 * 参考 page-agent 的 TAB_CONTROL 模式，封装 chrome.tabs / chrome.tabGroups 操作。
 * 无状态：不在实例上缓存 tab 信息，每次操作直接打到 chrome API，
 * service worker 重启后不依赖任何内存状态。
 *
 * 消息路由：background.ts 收到 type==='TAB_CONTROL' 的消息后，
 * 委托给 handleTabControlMessage，根据 message.action 分发到具体方法。
 */

/** Tab 控制消息的统一信封 */
export interface TabsControlMessage {
  type: 'TAB_CONTROL';
  action:
    | 'create'
    | 'update'
    | 'close'
    | 'getActive'
    | 'query'
    | 'group'
    | 'sendMessage';
  /** 大多数 action 需要的目标 tabId */
  tabId?: number;
  /** create 动作的 URL */
  url?: string;
  /** update 动作的更新属性 */
  props?: chrome.tabs.UpdateProperties;
  /** query 动作的查询条件 */
  queryInfo?: chrome.tabs.QueryInfo;
  /** group 动作的目标 tabId 列表 */
  tabIds?: number[];
  /** sendMessage 动作要发送给 content script 的消息体 */
  message?: unknown;
}

/** Tab 控制统一响应 */
export interface TabsControlResponse<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
}

/**
 * TabsController —— 标签页操作控制器。
 *
 * 可直接调用（同上下文）或通过消息驱动（跨上下文）。
 */
export class TabsController {
  /** 创建标签页 */
  async createTab(url: string): Promise<chrome.tabs.Tab> {
    return await chrome.tabs.create({ url });
  }

  /** 更新标签页属性（url / active / pinned 等） */
  async updateTab(
    tabId: number,
    props: chrome.tabs.UpdateProperties,
  ): Promise<chrome.tabs.Tab> {
    return await chrome.tabs.update(tabId, props);
  }

  /** 关闭标签页 */
  async closeTab(tabId: number): Promise<void> {
    await chrome.tabs.remove(tabId);
  }

  /** 获取当前活动标签页（currentWindow + active） */
  async getActiveTab(): Promise<chrome.tabs.Tab | null> {
    const tabs = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    return tabs[0] ?? null;
  }

  /** 按条件查询标签页列表 */
  async queryTabs(
    queryInfo: chrome.tabs.QueryInfo,
  ): Promise<chrome.tabs.Tab[]> {
    return await chrome.tabs.query(queryInfo);
  }

  /** 将多个标签页归入同一分组，返回 groupId */
  async groupTabs(tabIds: number[]): Promise<number | undefined> {
    if (!tabIds || tabIds.length === 0) return undefined;
    return await chrome.tabs.group({ tabIds });
  }

  /** 向指定标签页的 content script 发送消息 */
  async sendMessageToTab(tabId: number, message: unknown): Promise<unknown> {
    return await chrome.tabs.sendMessage(tabId, message);
  }

  /**
   * 消息处理入口。
   *
   * 根据 message.action 分发到具体方法，异步完成后调用 sendResponse。
   * 返回 true 告知 chrome.runtime.onMessage 将异步响应。
   */
  handleTabControlMessage(
    message: TabsControlMessage,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response: TabsControlResponse) => void,
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
  private async dispatch(message: TabsControlMessage): Promise<unknown> {
    switch (message.action) {
      case 'create': {
        if (!message.url) throw new Error('create 缺少 url 参数');
        return await this.createTab(message.url);
      }
      case 'update': {
        if (message.tabId == null || !message.props) {
          throw new Error('update 缺少 tabId 或 props');
        }
        return await this.updateTab(message.tabId, message.props);
      }
      case 'close': {
        if (message.tabId == null) throw new Error('close 缺少 tabId');
        await this.closeTab(message.tabId);
        return null;
      }
      case 'getActive': {
        return await this.getActiveTab();
      }
      case 'query': {
        return await this.queryTabs(message.queryInfo ?? {});
      }
      case 'group': {
        if (!message.tabIds) throw new Error('group 缺少 tabIds');
        return await this.groupTabs(message.tabIds);
      }
      case 'sendMessage': {
        if (message.tabId == null || message.message == null) {
          throw new Error('sendMessage 缺少 tabId 或 message');
        }
        return await this.sendMessageToTab(message.tabId, message.message);
      }
      default: {
        const exhaustive: never = message.action;
        throw new Error(`未知的 TAB_CONTROL action: ${String(exhaustive)}`);
      }
    }
  }
}

/** 全局共享实例（无状态，安全共享） */
export const tabsController = new TabsController();
