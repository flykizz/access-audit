/**
 * 认证管理（无状态）
 *
 * 关键设计：AuthManager 不维护任何内存状态，每次操作都从 chrome.storage.local
 * 拉取最新的 token / user。这样在 service worker 被回收后重新唤醒，
 * 认证状态依然可以从 storage 恢复，避免出现"内存里有 token 但 storage 里没有"
 * 的不一致。
 *
 * 后端约定：见 AccessAudit 服务端 /auth/* 与 /api/v1/* 路由。
 */

import type { AuthState, UserInfo } from './types';
import { StorageKeys } from './types';
import { storageService } from './storage';
import { generateId } from './utils';

/** 后端 API 基础地址（开发环境） */
export const API_BASE_URL = 'http://localhost:3000';

/** 登录接口响应体 */
interface LoginResponse {
  token: string;
  user: UserInfo;
}

/** /auth/me 响应体 */
interface MeResponse {
  user: UserInfo;
}

/** AuthManager 错误类型 */
export class AuthError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

/**
 * AuthManager —— 无状态认证管理器。
 *
 * 所有方法都从 storage 现拉现写，调用方无需关心状态同步。
 * 不要把 token 缓存到实例字段里，否则 service worker 重启后会读到陈旧值。
 */
export class AuthManager {
  /**
   * 登录：POST /auth/login
   * 成功后将 token 与 user 写入 storage，并清除 lock 状态。
   */
  async login(email: string, password: string): Promise<UserInfo> {
    const res = await this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    await storageService.set(StorageKeys.AUTH_TOKEN, res.token);
    await storageService.set(StorageKeys.USER_INFO, res.user);
    await storageService.set(StorageKeys.AUTH_LOCK, false);
    await storageService.remove(StorageKeys.AUTH_REASON);

    return res.user;
  }

  /**
   * 注册：POST /auth/signup
   * 注册成功后不自动登录，由调用方决定下一步（通常跳转到登录页）。
   */
  async signup(name: string, email: string, password: string): Promise<UserInfo> {
    const res = await this.request<{ user: UserInfo }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    return res.user;
  }

  /**
   * 登出：清除 token 与 user，设置 lock=true，reason='user_logout'。
   *
   * 注意：不会通知后端撤销 token（后端应通过短时效 + 刷新机制处理），
   * 仅清理本地状态。
   */
  async logout(): Promise<void> {
    await storageService.remove(StorageKeys.AUTH_TOKEN);
    await storageService.remove(StorageKeys.USER_INFO);
    await storageService.set(StorageKeys.AUTH_LOCK, true);
    await storageService.set(StorageKeys.AUTH_REASON, 'user_logout');
    // 桥接 token 也一并清理，避免页面侧拿到失效凭证
    await storageService.remove(StorageKeys.AUTH_BRIDGE_TOKEN);
  }

  /**
   * 从 storage 拉取当前认证状态。
   *
   * 这是无状态架构的核心入口 —— 任何调用方都通过它获取最新认证快照，
   * 而不是依赖某个内存字段。
   */
  async getAuthState(): Promise<AuthState> {
    const [token, user, isLocked, authReason] = await Promise.all([
      storageService.get<string>(StorageKeys.AUTH_TOKEN),
      storageService.get<UserInfo>(StorageKeys.USER_INFO),
      storageService.get<boolean>(StorageKeys.AUTH_LOCK),
      storageService.get<string>(StorageKeys.AUTH_REASON),
    ]);

    return {
      isAuthenticated: Boolean(token) && !isLocked,
      user: user ?? null,
      isLocked: isLocked ?? false,
      authReason: authReason ?? null,
    };
  }

  /**
   * 验证 token 是否仍然有效：GET /auth/me
   *
   * 失效时自动清理本地状态并设置 lock=true, reason='token_invalid'。
   */
  async validateToken(): Promise<boolean> {
    const token = await storageService.get<string>(StorageKeys.AUTH_TOKEN);
    if (!token) return false;

    try {
      const res = await this.request<MeResponse>('/auth/me', { method: 'GET' });
      // 后端可能更新了 user 信息，回写 storage
      await storageService.set(StorageKeys.USER_INFO, res.user);
      await storageService.set(StorageKeys.AUTH_LOCK, false);
      await storageService.remove(StorageKeys.AUTH_REASON);
      return true;
    } catch (err) {
      // token 失效或网络错误：仅当 401/403 时清理本地状态
      if (err instanceof AuthError && (err.status === 401 || err.status === 403)) {
        await storageService.remove(StorageKeys.AUTH_TOKEN);
        await storageService.remove(StorageKeys.USER_INFO);
        await storageService.set(StorageKeys.AUTH_LOCK, true);
        await storageService.set(StorageKeys.AUTH_REASON, 'token_invalid');
      }
      return false;
    }
  }

  /**
   * 带 Bearer token 的 fetch 封装。
   *
   * 自动从 storage 拉取最新 token（不依赖实例缓存），
   * 401/403 时抛出 AuthError 以便调用方降级处理。
   */
  async fetchWithAuth(
    url: string,
    options: RequestInit = {},
  ): Promise<Response> {
    const token = await storageService.get<string>(StorageKeys.AUTH_TOKEN);
    const headers = new Headers(options.headers || {});
    headers.set('Content-Type', 'application/json');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(url, { ...options, headers });
    if (response.status === 401 || response.status === 403) {
      // 标记失效，让 validateToken 在下一轮做完整清理
      await storageService.set(StorageKeys.AUTH_LOCK, true);
      await storageService.set(StorageKeys.AUTH_REASON, 'token_unauthorized');
    }
    return response;
  }

  /**
   * 生成扩展与页面之间的桥接 token。
   *
   * 用于 content script 在受限页面上以受信身份发起请求，
   * 通过 storage 持久化，避免 service worker 重启后丢失。
   */
  async generateBridgeToken(): Promise<string> {
    const token = `bridge_${generateId(32)}`;
    await storageService.set(StorageKeys.AUTH_BRIDGE_TOKEN, token);
    return token;
  }

  /* ------------------------------------------------------------------ */
  /* 内部工具                                                              */
  /* ------------------------------------------------------------------ */

  /** 不带认证的 JSON 请求，用于 /auth/login、/auth/signup 等 */
  private async request<T>(path: string, init: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${path}`;
    const headers = new Headers(init.headers || {});
    headers.set('Content-Type', 'application/json');

    const response = await fetch(url, { ...init, headers });
    if (!response.ok) {
      let message = `请求失败：${response.status} ${response.statusText}`;
      let code = 'HTTP_ERROR';
      try {
        const body = await response.json();
        message = body.message || body.error || message;
        code = body.code || code;
      } catch {
        /* 非 JSON 响应，忽略 */
      }
      throw new AuthError(message, code, response.status);
    }
    return (await response.json()) as T;
  }
}

/** 全局共享实例（无状态，安全共享） */
export const authManager = new AuthManager();
