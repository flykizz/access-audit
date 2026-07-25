export type Severity = 'critical' | 'serious' | 'moderate' | 'minor';

export type TestType =
  | 'keyboard-reachability'
  | 'keyboard-trap'
  | 'focus-visibility'
  | 'focus-order'
  | 'modal-focus-return';

export interface StaticViolation {
  id: string;
  wcagTag: string;
  severity: Severity;
  element: string;
  domPath: string;
  selector: string;
  message: string;
  fixSuggestion: string;
}

export interface BehaviorResult {
  testType: TestType;
  targetElement: string;
  status: 'pass' | 'fail' | 'error' | 'unknown';
  expectedBehavior: string;
  actualBehavior: string;
  llmInsight?: string;
  fixSuggestion?: string;
}

export interface CoverageData {
  keyboardReachRate: number;
  focusVisibleRate: number;
  nameComputationRate: number;
  roleSemanticsRate: number;
  modalFocusReturnRate: number;
  goldenPathCoverage: number;
  componentInteractionCoverage: number;
}

export interface GoldenPath {
  id: string;
  name: string;
  description?: string;
  steps: PathStep[];
  priority: 'critical' | 'high' | 'medium' | 'low';
  businessWeight: number;
  urlPattern?: string;
  tags?: string[];
}

export interface PathStep {
  name: string;
  url: string;
  actions?: PathAction[];
  expectedElements?: string[];
}

export interface PathAction {
  type: 'click' | 'type' | 'focus' | 'press' | 'wait';
  selector?: string;
  value?: string;
  timeout?: number;
}

export interface PathDiscoveryResult {
  paths: GoldenPath[];
  discoveredUrls: string[];
  pathCoverage: number;
}

export interface AuditConfig {
  includeStaticScan: boolean;
  includeBehaviorTest: boolean;
  scanRules: string[];
  behaviorTests: TestType[];
  goldenPaths: GoldenPath[];
  enablePathDiscovery: boolean;
  maxDiscoveredPaths: number;
  pathDiscoveryDepth: number;
  enableFullSiteScan: boolean;
  maxPages: number;
}

export interface ScanTask {
  type: 'static-scan';
  name: string;
  rules: string[];
}

export interface BehaviorTask {
  type: TestType;
  name: string;
  priority: 'high' | 'medium' | 'low';
  target?: string;
  path?: string[];
}

export interface AuditTask {
  taskId: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  urls: string[];
  config: AuditConfig;
  results?: AuditResults;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

export interface AuditResults {
  totalViolations: number;
  critical: number;
  serious: number;
  moderate: number;
  minor: number;
  coverage: CoverageData;
  violations: StaticViolation[];
  behaviorResults: BehaviorResult[];
}

export interface ScanResult {
  url: string;
  scanTime: number;
  totalViolations: number;
  critical: number;
  serious: number;
  moderate: number;
  minor: number;
  violations: StaticViolation[];
  passedRules: string[];
  score?: number;
}

export interface RuleResult {
  status: 'pass' | 'fail' | 'unknown';
  details: Record<string, unknown>;
}

export interface LLMResult {
  status: 'pass' | 'fail' | 'unknown';
  insight?: string;
}

export interface CustomRule {
  id: string;
  name: string;
  description: string;
  wcagTags: string[];
  severity: Severity;
  evaluate: (dom: Document) => boolean;
  getMessage: (node: HTMLElement) => string;
  getFixSuggestion: (node: HTMLElement) => string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: string[];
  };
  meta?: {
    timestamp: string;
    requestId: string;
  };
}
