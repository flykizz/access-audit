/**
 * SidePanel 主应用组件
 *
 * AccessAudit 扩展的核心 UI。根据认证状态切换登录表单与检测主面板。
 *
 * 数据流（无状态架构）：
 *  - 通过 chrome.runtime.sendMessage 与 background 通信（AA_* 消息）
 *  - 通过 chrome.storage.onChanged 监听状态变化（拉取模式）
 *  - 通过 chrome.tabs.sendMessage 控制 content script 遮罩与高亮
 *
 * 状态：
 *  - authState:  认证状态（从 background 拉取）
 *  - scanState:  扫描状态（从 background 拉取 + 监听 storage 变化）
 *  - selectedViolation: 当前选中的违规项（详情弹窗）
 *  - filter:      结果筛选类型
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { t } from '@/core/i18n';
import { onStorageChanged } from '@/core/storage';
import { StorageKeys } from '@/core/types';
import type { AuthState, ScanState, UserInfo, Violation } from '@/core/types';
import { AuthForm } from '@/components/AuthForm';
import { ScoreCard } from '@/components/ScoreCard';
import { ViolationList } from '@/components/ViolationList';
import { ViolationDetail } from '@/components/ViolationDetail';
import { FilterTabs } from '@/components/FilterTabs';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';

/* -------------------------------------------------------------------------- */
/* 类型与常量                                                                    */
/* -------------------------------------------------------------------------- */

type Filter = 'all' | 'error' | 'warning' | 'info';
type AuthMode = 'login' | 'signup';

/** Background 统一响应信封 */
interface BackgroundResponse<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
}

/* -------------------------------------------------------------------------- */
/* 通信工具                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * 向 background 发送消息，返回 data 或抛出错误。
 *
 * Background 的 onInternalMessage 对业务消息统一返回 { ok, data?, error? }。
 */
async function sendMessage<T>(type: string, payload?: unknown): Promise<T> {
  const response = (await chrome.runtime.sendMessage({
    type,
    payload,
    timestamp: Date.now(),
    source: 'sidepanel',
  })) as BackgroundResponse<T> | undefined;

  if (!response) return undefined as T;
  if (response.ok) return response.data as T;
  throw new Error(response.error || `${type} failed`);
}

/** 获取当前激活的标签页 */
async function getActiveTab(): Promise<chrome.tabs.Tab | null> {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return tab ?? null;
  } catch {
    return null;
  }
}

/**
 * 向当前标签页的 content script 发送消息（遮罩显隐 / 高亮元素）。
 *
 * Content script 可能未注入（如 chrome:// 页面），失败时静默忽略。
 */
async function sendToContentScript(type: string, payload?: unknown): Promise<void> {
  const tab = await getActiveTab();
  if (!tab?.id) return;
  try {
    await chrome.tabs.sendMessage(tab.id, {
      type,
      payload,
      timestamp: Date.now(),
      source: 'sidepanel',
    });
  } catch {
    // content script 未注入或页面不支持，忽略
  }
}

/** impact → UI 等级（与 ViolationList 内部映射一致） */
function getImpactLevel(impact: string): 'error' | 'warning' | 'info' {
  if (impact === 'critical' || impact === 'serious') return 'error';
  if (impact === 'moderate') return 'warning';
  return 'info';
}

/* -------------------------------------------------------------------------- */
/* 小组件                                                                        */
/* -------------------------------------------------------------------------- */

function Logo() {
  return (
    <div className="aa-logo">
      <svg className="aa-logo-icon" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
        <path
          fillRule="evenodd"
          d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
          clipRule="evenodd"
        />
      </svg>
    </div>
  );
}

function Avatar({ user }: { user: UserInfo | null }) {
  if (user?.avatarUrl) {
    return (
      <img
        src={user.avatarUrl}
        alt={user.name}
        className="aa-user-avatar"
      />
    );
  }
  const initial = user?.name?.[0]?.toUpperCase() ?? '?';
  return (
    <div className="aa-user-avatar-fallback">
      {initial}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 主应用                                                                        */
/* -------------------------------------------------------------------------- */

export function App() {
  /* ----------------------------- 状态 ----------------------------- */
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    isLocked: false,
    authReason: null,
  });
  const [scanState, setScanState] = useState<ScanState | null>(null);
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [selectedViolation, setSelectedViolation] = useState<{
    violation: Violation;
    nodeIndex: number;
  } | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [overlayVisible, setOverlayVisible] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentTabUrl, setCurrentTabUrl] = useState('');

  /* --------------------------- 状态拉取 --------------------------- */

  const refreshAuthState = useCallback(async () => {
    try {
      const state = await sendMessage<AuthState>('AA_GET_AUTH_STATUS');
      setAuthState(state);
    } catch (err) {
      console.error('[sidepanel] 获取认证状态失败:', err);
    }
  }, []);

  const refreshScanState = useCallback(async () => {
    try {
      const state = await sendMessage<ScanState | null>('AA_GET_CURRENT_SCAN');
      setScanState(state ?? null);
    } catch (err) {
      console.error('[sidepanel] 获取扫描状态失败:', err);
    }
  }, []);

  /* --------------------------- 初始化 --------------------------- */

  useEffect(() => {
    void refreshAuthState();
    void refreshScanState();
    void getActiveTab().then((tab) => {
      if (tab?.url) setCurrentTabUrl(tab.url);
    });
  }, [refreshAuthState, refreshScanState]);

  /* ------------------- 监听 storage 变化（拉取模式） ------------------- */

  useEffect(() => {
    const unsubscribe = onStorageChanged((changes) => {
      if (changes[StorageKeys.CURRENT_SCAN]) {
        void refreshScanState();
      }
      if (
        changes[StorageKeys.USER_INFO] ||
        changes[StorageKeys.AUTH_LOCK] ||
        changes[StorageKeys.AUTH_TOKEN]
      ) {
        void refreshAuthState();
      }
    });
    return unsubscribe;
  }, [refreshAuthState, refreshScanState]);

  /* ----------------------- 点击外部关闭用户菜单 ----------------------- */

  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = () => setMenuOpen(false);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [menuOpen]);

  /* ----------------------- Escape 关闭详情弹窗 ----------------------- */

  useEffect(() => {
    if (!selectedViolation) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedViolation(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedViolation]);

  /* ----------------------------- 处理器 ----------------------------- */

  const handleLogin = useCallback(
    async (email: string, password: string) => {
      await sendMessage('AA_LOGIN', { email, password });
      await refreshAuthState();
    },
    [refreshAuthState],
  );

  const handleSignup = useCallback(
    async (name: string, email: string, password: string) => {
      await sendMessage('AA_SIGNUP', { name, email, password });
      // 注册成功后不自动登录，切换到登录模式
      setAuthMode('login');
    },
    [],
  );

  const handleLogout = useCallback(async () => {
    setMenuOpen(false);
    setSelectedViolation(null);
    try {
      await sendMessage('AA_LOGOUT');
      await refreshAuthState();
    } catch (err) {
      console.error('[sidepanel] 登出失败:', err);
    }
  }, [refreshAuthState]);

  /**
   * 启动扫描：fire-and-forget。
   *
   * Background 在扫描过程中会持续更新 aa_current_scan（storage），
   * sidepanel 通过 storage listener 接收进度，无需 await 完整结果。
   */
  const handleStartScan = useCallback(() => {
    chrome.runtime
      .sendMessage({
        type: 'AA_SCAN_CURRENT_PAGE',
        timestamp: Date.now(),
        source: 'sidepanel',
      })
      .catch((err: unknown) => {
        console.error('[sidepanel] 启动扫描失败:', err);
      });
    void refreshScanState();
  }, [refreshScanState]);

  const handleCancelScan = useCallback(async () => {
    try {
      await sendMessage('AA_CANCEL_SCAN');
      await refreshScanState();
    } catch (err) {
      console.error('[sidepanel] 取消扫描失败:', err);
    }
  }, [refreshScanState]);

  const handleRescan = useCallback(() => {
    setSelectedViolation(null);
    chrome.runtime
      .sendMessage({
        type: 'AA_SCAN_CURRENT_PAGE',
        timestamp: Date.now(),
        source: 'sidepanel',
      })
      .catch((err: unknown) => {
        console.error('[sidepanel] 重新扫描失败:', err);
      });
    void refreshScanState();
  }, [refreshScanState]);

  const handleToggleOverlay = useCallback(() => {
    void sendToContentScript('AA_TOGGLE_OVERLAY');
    setOverlayVisible((v) => !v);
  }, []);

  const handleSelectViolation = useCallback(
    (violation: Violation, nodeIndex: number) => {
      setSelectedViolation({ violation, nodeIndex });
      const selector = violation.nodes?.[nodeIndex]?.target?.[0];
      if (selector) {
        void sendToContentScript('AA_HIGHLIGHT_ELEMENT', { selector });
      }
    },
    [],
  );

  const handleLocate = useCallback(() => {
    if (!selectedViolation) return;
    const selector =
      selectedViolation.violation.nodes?.[selectedViolation.nodeIndex]?.target?.[0];
    if (selector) {
      void sendToContentScript('AA_HIGHLIGHT_ELEMENT', { selector });
    }
  }, [selectedViolation]);

  const handleOpenDashboard = useCallback(() => {
    chrome.tabs.create({ url: 'http://localhost:3000' });
  }, []);

  /* ----------------------------- 派生状态 ----------------------------- */

  const violations = scanState?.result?.violations ?? [];
  const isScanning =
    scanState != null &&
    (scanState.status === 'pending' ||
      scanState.status === 'scanning' ||
      scanState.status === 'analyzing');
  const isCompleted = scanState?.status === 'completed' && !!scanState.result;
  const hasError = scanState?.status === 'error';

  const counts = useMemo(() => {
    let error = 0;
    let warning = 0;
    let info = 0;
    for (const v of violations) {
      const level = getImpactLevel(v.impact);
      if (level === 'error') error++;
      else if (level === 'warning') warning++;
      else info++;
    }
    return { all: violations.length, error, warning, info };
  }, [violations]);

  const version = chrome.runtime.getManifest?.().version ?? '1.0.0';

  /* ------------------------------- 渲染 ------------------------------- */

  // 未登录 → 登录表单
  if (!authState.isAuthenticated) {
    return (
      <div className="aa-auth-page">
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

  return (
    <div className="aa-sidepanel">
      {/* Header */}
      <header className="aa-sidepanel-header">
        <div className="aa-flex aa-items-center aa-gap-2 aa-min-w-0">
          <Logo />
          <span className="aa-brand-name">
            AccessAudit
          </span>
        </div>
        <div className="aa-user-menu">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((v) => !v);
            }}
            className="aa-user-menu-trigger"
            aria-label={t('logout')}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            <Avatar user={authState.user} />
          </button>
          {menuOpen && (
            <div
              className="aa-user-dropdown"
              onClick={(e) => e.stopPropagation()}
              role="menu"
            >
              <div className="aa-user-dropdown-header">
                <p className="aa-user-dropdown-name">
                  {authState.user?.name}
                </p>
                <p className="aa-user-dropdown-email">
                  {authState.user?.email}
                </p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="aa-user-dropdown-item"
                role="menuitem"
              >
                {t('logout')}
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main */}
      <main className="aa-sidepanel-body">
        {/* 检测控制区 */}
        <section className="aa-section">
          {isScanning ? (
            <div className="aa-space-y-3">
              <ProgressBar
                value={scanState?.progress ?? 0}
                stage={scanState?.stage}
                label={t('scanning')}
              />
              <div className="aa-flex aa-justify-end">
                <Button variant="outline" size="sm" onClick={handleCancelScan}>
                  {t('cancel')}
                </Button>
              </div>
            </div>
          ) : isCompleted ? (
            <div className="aa-space-y-3">
              <ScoreCard
                score={scanState!.result!.score}
                errorCount={counts.error}
                warningCount={counts.warning}
                infoCount={counts.info}
              />
              <div className="aa-flex aa-items-center aa-gap-2">
                <Button variant="outline" size="sm" onClick={handleRescan}>
                  {t('rescan')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleToggleOverlay}
                >
                  {overlayVisible ? t('hideMarkers') : t('showMarkers')}
                </Button>
              </div>
            </div>
          ) : (
            <div className="aa-space-y-3">
              <Button
                variant="primary"
                size="lg"
                onClick={handleStartScan}
                className="aa-w-full"
              >
                {t('startScan')}
              </Button>
              {currentTabUrl && (
                <p
                  className="aa-current-url"
                  title={currentTabUrl}
                >
                  {currentTabUrl}
                </p>
              )}
              {hasError && scanState?.error && (
                <p className="aa-scan-error" role="alert">
                  {scanState.error}
                </p>
              )}
            </div>
          )}
        </section>

        {/* 结果列表区（扫描完成后） */}
        {isCompleted && violations.length > 0 && (
          <section className="aa-py-3">
            <div className="aa-px-4" style={{ paddingBottom: 12 }}>
              <FilterTabs
                active={filter}
                onChange={setFilter}
                counts={counts}
              />
            </div>
            <ViolationList
              violations={violations}
              onSelect={handleSelectViolation}
              filter={filter}
            />
          </section>
        )}

        {/* 全部通过 */}
        {isCompleted && violations.length === 0 && (
          <div className="aa-empty-state">
            <svg
              className="aa-empty-state-success"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="aa-all-passed">{t('allPassed')}</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="aa-sidepanel-footer">
        <span>v{version}</span>
        <button
          type="button"
          onClick={handleOpenDashboard}
          className="aa-link"
        >
          {t('openDashboard')}
        </button>
      </footer>

      {/* 详情弹窗 */}
      {selectedViolation && (
        <div
          className="aa-modal-overlay"
          onClick={() => setSelectedViolation(null)}
        >
          <div
            className="aa-w-full aa-max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <ViolationDetail
              violation={selectedViolation.violation}
              nodeIndex={selectedViolation.nodeIndex}
              onClose={() => setSelectedViolation(null)}
              onLocate={handleLocate}
            />
          </div>
        </div>
      )}
    </div>
  );
}
