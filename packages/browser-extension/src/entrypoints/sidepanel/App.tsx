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
 *  - scanMode:    扫描模式（静态扫描 / 行为测试）
 *  - testType:    行为测试类型
 *  - paths:       发现的操作路径列表
 *  - selectedPath: 选中的操作路径
 *  - behaviorResult: 行为测试结果
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { t } from '@/core/i18n';
import { onStorageChanged } from '@/core/storage';
import { StorageKeys } from '@/core/types';
import type { AuthState, ScanState, UserInfo, Violation, OperationPath, TestType, BehaviorTestResult, ExecutionLog } from '@/core/types';
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
type ScanMode = 'static' | 'behavior';

const TEST_TYPES: { value: TestType; label: string; description: string }[] = [
  { value: 'keyboard-reachability', label: '键盘可达性', description: '验证所有可交互元素是否可通过键盘访问' },
  { value: 'keyboard-trap', label: '键盘陷阱', description: '验证模态框内焦点循环是否正常' },
  { value: 'focus-visibility', label: '焦点可见性', description: '验证焦点指示器是否可见' },
  { value: 'focus-order', label: '焦点顺序', description: '验证 Tab 遍历顺序是否与视觉布局一致' },
  { value: 'modal-focus-return', label: '焦点回弹', description: '验证模态框关闭后焦点是否返回触发元素' },
];

/** Background 统一响应信封 */
interface BackgroundResponse<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
}

/* -------------------------------------------------------------------------- */
/* 通信工具                                                                      */
/* -------------------------------------------------------------------------- */

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

async function getActiveTab(): Promise<chrome.tabs.Tab | null> {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return tab ?? null;
  } catch {
    return null;
  }
}

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

function getImpactLevel(impact: string): 'error' | 'warning' | 'info' {
  if (impact === 'critical' || impact === 'serious') return 'error';
  if (impact === 'moderate') return 'warning';
  return 'info';
}

function getPriorityLabel(priority: string): string {
  const labels: Record<string, string> = {
    critical: '关键',
    high: '高',
    medium: '中',
    low: '低',
  };
  return labels[priority] || priority;
}

function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    critical: '#ef4444',
    high: '#f97316',
    medium: '#eab308',
    low: '#22c55e',
  };
  return colors[priority] || '#6b7280';
}

function getStepStatusIcon(status: ExecutionLog['status']): string {
  switch (status) {
    case 'passed':
      return '✓';
    case 'failed':
      return '✗';
    case 'running':
      return '●';
    case 'pending':
      return '○';
    case 'skipped':
      return '↺';
    default:
      return '○';
  }
}

function getStepStatusColor(status: ExecutionLog['status']): string {
  switch (status) {
    case 'passed':
      return '#22c55e';
    case 'failed':
      return '#ef4444';
    case 'running':
      return '#3b82f6';
    default:
      return '#9ca3af';
  }
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

function PathCard({ path, isSelected, onClick }: { path: OperationPath; isSelected: boolean; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className={`aa-path-card ${isSelected ? 'aa-path-card-selected' : ''}`}
    >
      <div className="aa-flex aa-items-start aa-justify-between aa-mb-2">
        <h4 className="aa-path-card-title">{path.name}</h4>
        <span
          className="aa-path-card-priority"
          style={{ backgroundColor: getPriorityColor(path.priority) }}
        >
          {getPriorityLabel(path.priority)}
        </span>
      </div>
      <p className="aa-path-card-desc">{path.description}</p>
      <div className="aa-flex aa-items-center aa-gap-4 aa-mt-3">
        <span className="aa-path-card-meta">
          <svg className="aa-w-4 aa-h-4 aa-inline aa-mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {path.estimatedTime}s
        </span>
        <span className="aa-path-card-meta">
          <svg className="aa-w-4 aa-h-4 aa-inline aa-mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {Math.round(path.aiConfidence * 100)}%
        </span>
      </div>
      <div className="aa-path-card-reason aa-mt-2">
        <span className="aa-text-xs aa-text-gray-500">AI 分析依据:</span>
        <p className="aa-text-xs aa-text-gray-600 aa-mt-1">{path.aiReasoning}</p>
      </div>
      <div className="aa-path-card-steps aa-mt-3">
        {path.steps.map((step, idx) => (
          <div key={step.id} className="aa-path-step">
            <span className="aa-path-step-number">{idx + 1}</span>
            <span className="aa-path-step-name">{step.name}</span>
            <span className="aa-path-step-action">{step.action}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ExecutionLogList({ logs }: { logs: ExecutionLog[] }) {
  return (
    <div className="aa-execution-logs">
      <h4 className="aa-text-sm aa-font-semibold aa-text-gray-700 aa-mb-3">执行日志</h4>
      <div className="aa-space-y-2">
        {logs.map((log) => (
          <div key={log.stepId} className="aa-execution-log-item">
            <div className="aa-flex aa-items-center aa-gap-2">
              <span
                className="aa-execution-log-status"
                style={{ color: getStepStatusColor(log.status) }}
              >
                {getStepStatusIcon(log.status)}
              </span>
              <span className="aa-execution-log-name">{log.stepName}</span>
              <span className="aa-execution-log-duration">{log.duration}ms</span>
            </div>
            {log.error && (
              <p className="aa-execution-log-error aa-text-xs aa-text-red-500 aa-mt-1 aa-ml-6">
                {log.error}
              </p>
            )}
          </div>
        ))}
      </div>
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
  const [scanMode, setScanMode] = useState<ScanMode>('static');
  const [testType, setTestType] = useState<TestType>('keyboard-reachability');
  const [paths, setPaths] = useState<OperationPath[]>([]);
  const [selectedPath, setSelectedPath] = useState<OperationPath | null>(null);
  const [behaviorResult, setBehaviorResult] = useState<BehaviorTestResult | null>(null);
  const [isDiscoveringPaths, setIsDiscoveringPaths] = useState(false);
  const [isExecutingBehaviorTest, setIsExecutingBehaviorTest] = useState(false);

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

  const discoverPaths = useCallback(async () => {
    if (!currentTabUrl) return;
    setIsDiscoveringPaths(true);
    try {
      const result = await sendMessage<OperationPath[]>('AA_DISCOVER_PATHS', {
        url: currentTabUrl,
        testType,
      });
      setPaths(result ?? []);
      if (result?.length > 0) {
        setSelectedPath(result[0]);
      }
    } catch (err) {
      console.error('[sidepanel] 路径发现失败:', err);
    } finally {
      setIsDiscoveringPaths(false);
    }
  }, [currentTabUrl, testType]);

  const executeBehaviorTest = useCallback(async () => {
    if (!currentTabUrl || !selectedPath) return;
    setIsExecutingBehaviorTest(true);
    try {
      const result = await sendMessage<BehaviorTestResult>('AA_EXECUTE_BEHAVIOR_TEST', {
        url: currentTabUrl,
        testType,
        path: selectedPath,
      });
      setBehaviorResult(result ?? null);
    } catch (err) {
      console.error('[sidepanel] 行为测试执行失败:', err);
    } finally {
      setIsExecutingBehaviorTest(false);
    }
  }, [currentTabUrl, testType, selectedPath]);

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

  /* ----------------------- 监听 Tab URL 变化 ----------------------- */

  useEffect(() => {
    const handleUpdate = (tabId: number, changeInfo: chrome.tabs.TabChangeInfo) => {
      if (changeInfo.url) {
        void getActiveTab().then((tab) => {
          if (tab?.id === tabId && tab.url) {
            setCurrentTabUrl(tab.url);
            setPaths([]);
            setSelectedPath(null);
            setBehaviorResult(null);
          }
        });
      }
    };
    chrome.tabs.onUpdated.addListener(handleUpdate);
    return () => chrome.tabs.onUpdated.removeListener(handleUpdate);
  }, []);

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

  const handleResetBehavior = useCallback(() => {
    setPaths([]);
    setSelectedPath(null);
    setBehaviorResult(null);
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
        {/* 扫描模式切换 */}
        <section className="aa-section">
          <div className="aa-mode-tabs">
            <button
              className={`aa-mode-tab ${scanMode === 'static' ? 'aa-mode-tab-active' : ''}`}
              onClick={() => {
                setScanMode('static');
                setPaths([]);
                setSelectedPath(null);
                setBehaviorResult(null);
              }}
            >
              <svg className="aa-w-4 aa-h-4 aa-mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              静态扫描
            </button>
            <button
              className={`aa-mode-tab ${scanMode === 'behavior' ? 'aa-mode-tab-active' : ''}`}
              onClick={() => {
                setScanMode('behavior');
                setPaths([]);
                setSelectedPath(null);
                setBehaviorResult(null);
              }}
            >
              <svg className="aa-w-4 aa-h-4 aa-mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              行为测试
            </button>
          </div>
        </section>

        {/* 静态扫描模式 */}
        {scanMode === 'static' && (
          <>
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
          </>
        )}

        {/* 行为测试模式 */}
        {scanMode === 'behavior' && (
          <>
            <section className="aa-section">
              <div className="aa-space-y-3">
                <div className="aa-test-type-selector">
                  <label className="aa-text-sm aa-font-medium aa-text-gray-700 aa-block aa-mb-2">选择测试类型</label>
                  <select
                    value={testType}
                    onChange={(e) => {
                      setTestType(e.target.value as TestType);
                      setPaths([]);
                      setSelectedPath(null);
                      setBehaviorResult(null);
                    }}
                    className="aa-w-full aa-p-2 aa-border aa-border-gray-300 aa-rounded-md aa-text-sm"
                  >
                    {TEST_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label} - {t.description}
                      </option>
                    ))}
                  </select>
                </div>

                {!paths.length && !behaviorResult && (
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={discoverPaths}
                    className="aa-w-full"
                    disabled={isDiscoveringPaths || !currentTabUrl}
                  >
                    {isDiscoveringPaths ? '发现路径中...' : '发现测试路径'}
                  </Button>
                )}

                {currentTabUrl && (
                  <p
                    className="aa-current-url"
                    title={currentTabUrl}
                  >
                    {currentTabUrl}
                  </p>
                )}
              </div>
            </section>

            {/* 路径列表 */}
            {paths.length > 0 && !behaviorResult && (
              <section className="aa-section">
                <h3 className="aa-text-sm aa-font-semibold aa-text-gray-700 aa-mb-3">
                  AI 生成的测试路径 ({paths.length})
                </h3>
                <div className="aa-space-y-3">
                  {paths.map((path) => (
                    <PathCard
                      key={path.id}
                      path={path}
                      isSelected={selectedPath?.id === path.id}
                      onClick={() => setSelectedPath(path)}
                    />
                  ))}
                </div>
                <div className="aa-flex aa-items-center aa-gap-2 aa-mt-4">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={executeBehaviorTest}
                    disabled={!selectedPath || isExecutingBehaviorTest}
                  >
                    {isExecutingBehaviorTest ? '执行中...' : '执行选中路径'}
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleResetBehavior}>
                    重新发现
                  </Button>
                </div>
              </section>
            )}

            {/* 行为测试结果 */}
            {behaviorResult && (
              <section className="aa-section">
                <div className="aa-behavior-result">
                  <div className="aa-flex aa-items-center aa-justify-between aa-mb-4">
                    <div>
                      <h3 className="aa-behavior-result-title">测试结果</h3>
                      <p className="aa-behavior-result-type">
                        {TEST_TYPES.find((t) => t.value === behaviorResult.testType)?.label}
                      </p>
                    </div>
                    <span
                      className="aa-behavior-result-status"
                      style={{ backgroundColor: behaviorResult.status === 'pass' ? '#22c55e' : '#ef4444' }}
                    >
                      {behaviorResult.status === 'pass' ? '通过' : '失败'}
                    </span>
                  </div>

                  <div className="aa-space-y-3">
                    <div className="aa-behavior-info">
                      <span className="aa-text-xs aa-text-gray-500">预期行为:</span>
                      <p className="aa-text-sm aa-text-gray-700">{behaviorResult.expectedBehavior}</p>
                    </div>
                    <div className="aa-behavior-info">
                      <span className="aa-text-xs aa-text-gray-500">实际行为:</span>
                      <p className="aa-text-sm aa-text-gray-700">{behaviorResult.actualBehavior}</p>
                    </div>
                    {behaviorResult.llmInsight && (
                      <div className="aa-behavior-info">
                        <span className="aa-text-xs aa-text-gray-500">AI 分析:</span>
                        <p className="aa-text-sm aa-text-gray-700">{behaviorResult.llmInsight}</p>
                      </div>
                    )}
                    {behaviorResult.fixSuggestion && (
                      <div className="aa-behavior-info">
                        <span className="aa-text-xs aa-text-gray-500">修复建议:</span>
                        <p className="aa-text-sm aa-text-green-600">{behaviorResult.fixSuggestion}</p>
                      </div>
                    )}
                  </div>

                  <ExecutionLogList logs={behaviorResult.executionLogs} />

                  <div className="aa-flex aa-items-center aa-gap-2 aa-mt-4">
                    <Button variant="primary" size="sm" onClick={executeBehaviorTest} disabled={isExecutingBehaviorTest}>
                      {isExecutingBehaviorTest ? '执行中...' : '重新执行'}
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleResetBehavior}>
                      返回路径选择
                    </Button>
                  </div>
                </div>
              </section>
            )}
          </>
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
