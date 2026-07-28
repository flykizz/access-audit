export type {
  Severity,
  TestType,
  StaticViolation,
  BehaviorResult,
  BehaviorTestResult,
  CoverageData,
  GoldenPath,
  PathStep,
  PathAction,
  PathDiscoveryResult,
  OperationPath,
  OperationStep,
  ExecutionLog,
  AuditConfig,
  ScanTask,
  BehaviorTask,
  AuditTask,
  AuditResults,
  ScanResult,
  RuleResult,
  LLMResult,
  CustomRule,
  ApiResponse,
} from './types/index.js';

export { AxeScanner } from './scanner/axe-integration.js';
export { defaultRules, ruleCategories, customRules, getRulesByCategory, getAllRuleIds } from './scanner/rule-config.js';
export { ReportGenerator, formatReport } from './scanner/report-generator.js';
export type { ReportOptions } from './scanner/report-generator.js';

export { PageAgent } from './agent/page-agent.js';
export { RuleEngine } from './agent/rule-engine.js';

export { CoverageTracker } from './engine/coverage-tracker.js';
export { TaskGenerator } from './engine/task-generator.js';
export { StrategyScheduler } from './engine/strategy-scheduler.js';
export { PathDiscoverer } from './engine/path-discoverer.js';

export type { LLMConfig, LLMProvider, ProviderType } from './llm/types.js';
export { MODEL_PROVIDERS, llmConfigSchema, validateLLMConfig, getDefaultConfig, getProviderConfig, getEnvConfig, resolveConfig } from './llm/config.js';
export { OpenAIProvider } from './llm/openai-provider.js';

export { logger } from './utils/logger.js';
export { validateScanOptions, validateBehaviorTask, validateAuditConfig } from './utils/validator.js';