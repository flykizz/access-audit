/**
 * Popup 应用组件（轻量级登录入口）
 *
 * Popup 仅在未登录时作为快速登录入口。已登录时提示用户点击图标打开侧边栏。
 *
 * 状态：
 *  - authState:  认证状态（从 background 拉取）
 *  - authMode:   登录 / 注册模式切换
 *  - justLoggedIn: 是否刚刚登录成功（用于区分提示文案）
 */

import { useCallback, useEffect, useState } from 'react';
import { t } from '@/core/i18n';
import { onStorageChanged } from '@/core/storage';
import { StorageKeys } from '@/core/types';
import type { AuthState } from '@/core/types';
import { AuthForm } from '@/components/AuthForm';
import { Button } from '@/components/ui/Button';

/** Background 统一响应信封 */
interface BackgroundResponse<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
}

/** 向 background 发送消息 */
async function sendMessage<T>(type: string, payload?: unknown): Promise<T> {
  const response = (await chrome.runtime.sendMessage({
    type,
    payload,
    timestamp: Date.now(),
    source: 'popup',
  })) as BackgroundResponse<T> | undefined;

  if (!response) return undefined as T;
  if (response.ok) return response.data as T;
  throw new Error(response.error || `${type} failed`);
}

export function PopupApp() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    isLocked: false,
    authReason: null,
  });
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [justLoggedIn, setJustLoggedIn] = useState(false);

  const refreshAuthState = useCallback(async () => {
    try {
      const state = await sendMessage<AuthState>('AA_GET_AUTH_STATUS');
      setAuthState(state);
    } catch (err) {
      console.error('[popup] 获取认证状态失败:', err);
    }
  }, []);

  useEffect(() => {
    void refreshAuthState();
  }, [refreshAuthState]);

  // 监听 storage 变化，同步认证状态
  useEffect(() => {
    const unsubscribe = onStorageChanged((changes) => {
      if (
        changes[StorageKeys.USER_INFO] ||
        changes[StorageKeys.AUTH_LOCK] ||
        changes[StorageKeys.AUTH_TOKEN]
      ) {
        void refreshAuthState();
      }
    });
    return unsubscribe;
  }, [refreshAuthState]);

  const handleLogin = useCallback(
    async (email: string, password: string) => {
      await sendMessage('AA_LOGIN', { email, password });
      await refreshAuthState();
      setJustLoggedIn(true);
    },
    [refreshAuthState],
  );

  const handleSignup = useCallback(
    async (name: string, email: string, password: string) => {
      await sendMessage('AA_SIGNUP', { name, email, password });
      setAuthMode('login');
    },
    [],
  );

  const handleLogout = useCallback(async () => {
    try {
      await sendMessage('AA_LOGOUT');
      await refreshAuthState();
      setJustLoggedIn(false);
    } catch (err) {
      console.error('[popup] 登出失败:', err);
    }
  }, [refreshAuthState]);

  // 已登录：提示用户打开侧边栏
  if (authState.isAuthenticated) {
    return (
      <div className="aa-popup-page-compact">
        <div className="aa-w-12 aa-h-12 aa-rounded-full aa-bg-success-10 aa-flex aa-items-center aa-justify-center">
          <svg
            className="aa-w-6 aa-h-6 aa-text-success"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <p className="aa-text-sm aa-text-gray-700 aa-text-center aa-leading-relaxed">
          {justLoggedIn ? t('popupLoginSuccessHint') : t('popupLoggedInHint')}
        </p>
        <Button variant="outline" size="sm" onClick={handleLogout}>
          {t('logout')}
        </Button>
      </div>
    );
  }

  // 未登录：登录表单
  return (
    <div className="aa-popup-page">
      <AuthForm
        mode={authMode}
        onLogin={handleLogin}
        onSignup={handleSignup}
        onSwitchMode={() =>
          setAuthMode((m) => (m === 'login' ? 'signup' : 'login'))
        }
      />
    </div>
  );
}
