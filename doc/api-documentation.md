# AccessAudit API 文档

> OpenAPI 3.0 格式
> 版本：v1.0
> 更新日期：2026-07-25

---

## 目录

1. [概述](#1-概述)
2. [核心模块 API](#2-核心模块-api)
   - 2.1 静态扫描引擎 API
   - 2.2 行为测试引擎 API
   - 2.3 智能任务引擎 API
   - 2.4 报告生成器 API
3. [数据模型](#3-数据模型)
4. [CLI API](#4-cli-api)
5. [SDK API](#5-sdk-api)

---

## 1. 概述

### 1.1 架构说明

```
API 层级结构：
┌─────────────────────────────────────────────────────┐
│  用户接口层（CLI / SDK / Web UI）                   │
│       │                                             │
│       ▼                                             │
│  编排调度层（智能任务引擎）                           │
│       │                                             │
│       ├──→ 静态扫描引擎 API                         │
│       │                                             │
│       └──→ 行为测试引擎 API                         │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 1.2 API 设计原则

| 原则 | 说明 |
|------|------|
| **RESTful** | 使用标准 HTTP 方法（GET/POST/PUT/DELETE） |
| **版本化** | API 路径包含版本号 `/api/v1/` |
| **统一响应** | 所有接口返回统一格式 |
| **错误处理** | 统一的错误码和错误信息格式 |
| **认证** | 使用 API Key 或 JWT Token |

### 1.3 API 文档管理

> **文档同步说明**: 本文档为人工编写的 API 设计文档。实际项目中，API 文档将通过 NestJS + Swagger 自动生成，并以 `http://localhost:3000/api` 作为访问地址。人工文档与自动生成文档需保持同步，代码变更后需更新本设计文档。

### 1.4 统一响应格式

```typescript
interface ApiResponse<T> {
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
```

---

## 2. 核心模块 API

### 2.1 静态扫描引擎 API

#### 2.1.1 执行静态扫描

**POST** `/api/v1/scanner/static`

**请求体**：

```json
{
  "url": "https://www.example.com",
  "rules": ["color-contrast", "image-alt", "label"],
  "includeHidden": false,
  "timeout": 30000
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| url | string | ✅ | 目标网页 URL |
| rules | string[] | ❌ | 要执行的规则列表，默认全部规则 |
| includeHidden | boolean | ❌ | 是否包含隐藏元素，默认 false |
| timeout | number | ❌ | 超时时间（毫秒），默认 30000 |

**成功响应**（200 OK）：

```json
{
  "success": true,
  "data": {
    "url": "https://www.example.com",
    "scanTime": 1250,
    "totalViolations": 5,
    "critical": 1,
    "serious": 2,
    "moderate": 1,
    "minor": 1,
    "violations": [
      {
        "id": "color-contrast",
        "wcagTag": "wcag2aa",
        "severity": "critical",
        "element": "<button class=\"btn\">Submit</button>",
        "message": "Element has insufficient color contrast",
        "fixSuggestion": "Increase text color contrast to at least 4.5:1"
      }
    ]
  },
  "meta": {
    "timestamp": "2026-07-25T10:30:00Z",
    "requestId": "req-12345"
  }
}
```

**失败响应**（400 Bad Request）：

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "INVALID_URL",
    "message": "Invalid URL format",
    "details": ["URL must be a valid HTTP/HTTPS URL"]
  }
}
```

#### 2.1.2 获取规则列表

**GET** `/api/v1/scanner/rules`

**请求参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| category | string | ❌ | 规则分类：perceivable / operable / understandable / robust |

**成功响应**（200 OK）：

```json
{
  "success": true,
  "data": {
    "rules": [
      {
        "id": "color-contrast",
        "name": "Color Contrast",
        "category": "perceivable",
        "severity": "critical",
        "description": "Checks for sufficient color contrast between text and background",
        "wcagTag": "wcag2aa"
      }
    ],
    "total": 50
  }
}
```

#### 2.1.3 注册自定义规则

**POST** `/api/v1/scanner/rules`

**请求体**：

```json
{
  "id": "custom-rule-001",
  "name": "Custom Rule",
  "category": "operable",
  "severity": "moderate",
  "description": "Custom accessibility rule",
  "selector": "input[type=\"email\"]",
  "evaluate": "(node) => { const ariaDescribedby = node.getAttribute('aria-describedby'); return ariaDescribedby !== null && document.getElementById(ariaDescribedby) !== null; }",
  "messages": {
    "pass": "Email field has associated error description",
    "fail": "Email field must have aria-describedby for error messages"
  },
  "wcagTags": ["wcag2aa"]
}
```

**成功响应**（201 Created）：

```json
{
  "success": true,
  "data": {
    "id": "custom-rule-001",
    "message": "Custom rule registered successfully"
  }
}
```

---

### 2.2 行为测试引擎 API

#### 2.2.1 执行行为测试

**POST** `/api/v1/agent/behavior`

**请求体**：

```json
{
  "url": "https://www.example.com",
  "testType": "keyboard-trap",
  "target": ".modal",
  "expected": "focus should return to trigger element after closing modal",
  "maxIterations": 10
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| url | string | ✅ | 目标网页 URL |
| testType | string | ✅ | 测试类型：keyboard-trap / focus-visibility / modal-focus-return / keyboard-reachability |
| target | string | ❌ | 目标元素选择器 |
| expected | string | ❌ | 预期行为描述 |
| maxIterations | number | ❌ | 最大迭代次数，默认 10 |

**成功响应**（200 OK）：

```json
{
  "success": true,
  "data": {
    "url": "https://www.example.com",
    "testType": "keyboard-trap",
    "status": "pass",
    "details": {
      "focusableElements": 5,
      "firstElement": "button.close",
      "lastElement": "input.submit",
      "llmInsight": "The modal properly traps focus and allows Tab navigation"
    },
    "fixSuggestion": null
  }
}
```

**失败响应**（200 OK - 测试失败）：

```json
{
  "success": true,
  "data": {
    "url": "https://www.example.com",
    "testType": "keyboard-trap",
    "status": "fail",
    "details": {
      "isTrapped": true,
      "trappedElement": "input.email",
      "llmInsight": "Focus is trapped in the email input field, cannot navigate to next element"
    },
    "fixSuggestion": "Add tabindex=\"0\" to all interactive elements and implement proper focus management"
  }
}
```

#### 2.2.2 执行多场景行为测试

**POST** `/api/v1/agent/batch`

**请求体**：

```json
{
  "url": "https://www.example.com",
  "tests": [
    { "testType": "keyboard-reachability" },
    { "testType": "keyboard-trap", "target": ".modal" },
    { "testType": "focus-visibility" },
    { "testType": "modal-focus-return", "target": ".login-modal" }
  ]
}
```

**成功响应**（200 OK）：

```json
{
  "success": true,
  "data": {
    "url": "https://www.example.com",
    "totalTests": 4,
    "passed": 3,
    "failed": 1,
    "results": [
      { "testType": "keyboard-reachability", "status": "pass" },
      { "testType": "keyboard-trap", "status": "fail" },
      { "testType": "focus-visibility", "status": "pass" },
      { "testType": "modal-focus-return", "status": "pass" }
    ]
  }
}
```

---

### 2.3 智能任务引擎 API

#### 2.3.1 创建审计任务

**POST** `/api/v1/engine/tasks`

**请求体**：

```json
{
  "name": "Website Accessibility Audit",
  "urls": ["https://www.example.com", "https://www.example.com/about"],
  "config": {
    "includeStaticScan": true,
    "includeBehaviorTest": true,
    "scanRules": ["color-contrast", "image-alt"],
    "behaviorTests": ["keyboard-trap", "modal-focus-return"],
    "goldenPaths": [
      {
        "name": "User Login",
        "steps": ["click .login-btn", "fill #username", "fill #password", "click .submit"]
      }
    ]
  },
  "callbackUrl": "https://webhook.example.com/audit-complete"
}
```

**成功响应**（201 Created）：

```json
{
  "success": true,
  "data": {
    "taskId": "task-abc123",
    "name": "Website Accessibility Audit",
    "status": "pending",
    "createdAt": "2026-07-25T10:30:00Z"
  }
}
```

#### 2.3.2 获取任务状态

**GET** `/api/v1/engine/tasks/{taskId}`

**成功响应**（200 OK）：

```json
{
  "success": true,
  "data": {
    "taskId": "task-abc123",
    "name": "Website Accessibility Audit",
    "status": "completed",
    "progress": 100,
    "results": {
      "totalViolations": 15,
      "critical": 3,
      "serious": 5,
      "moderate": 4,
      "minor": 3,
      "coverage": {
        "keyboardReachRate": 95,
        "focusVisibleRate": 98,
        "modalFocusReturnRate": 100
      }
    },
    "startedAt": "2026-07-25T10:30:00Z",
    "completedAt": "2026-07-25T10:35:00Z"
  }
}
```

#### 2.3.3 获取任务列表

**GET** `/api/v1/engine/tasks`

**请求参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| status | string | ❌ | 任务状态：pending / running / completed / failed |
| page | number | ❌ | 页码，默认 1 |
| limit | number | ❌ | 每页数量，默认 10 |

**成功响应**（200 OK）：

```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "taskId": "task-abc123",
        "name": "Website Accessibility Audit",
        "status": "completed",
        "createdAt": "2026-07-25T10:30:00Z"
      }
    ],
    "total": 50,
    "page": 1,
    "limit": 10
  }
}
```

#### 2.3.4 获取覆盖率数据

**GET** `/api/v1/engine/coverage/{taskId}`

**成功响应**（200 OK）：

```json
{
  "success": true,
  "data": {
    "taskId": "task-abc123",
    "coverage": {
      "keyboardReachRate": 95,
      "focusVisibleRate": 98,
      "nameComputationRate": 92,
      "roleSemanticsRate": 96,
      "modalFocusReturnRate": 100,
      "goldenPathCoverage": 100,
      "componentInteractionCoverage": 88
    },
    "missingCoverage": ["componentInteractionCoverage"],
    "suggestions": [
      "Add keyboard navigation to the product filter component",
      "Ensure all interactive elements have proper ARIA roles"
    ]
  }
}
```

---

### 2.4 报告生成器 API

#### 2.4.1 生成 HTML 报告

**POST** `/api/v1/report/html`

**请求体**：

```json
{
  "taskId": "task-abc123",
  "format": "html",
  "includeCharts": true,
  "includeRecommendations": true,
  "language": "en"
}
```

**成功响应**（200 OK）：

```json
{
  "success": true,
  "data": {
    "reportId": "report-xyz789",
    "url": "https://api.accessaudit.io/reports/report-xyz789.html",
    "downloadUrl": "https://api.accessaudit.io/reports/report-xyz789.html/download"
  }
}
```

#### 2.4.2 生成 PDF 报告

**POST** `/api/v1/report/pdf`

**请求体**：

```json
{
  "taskId": "task-abc123",
  "format": "pdf",
  "includeCharts": true,
  "includeRecommendations": true,
  "language": "en",
  "template": "en-301-549"
}
```

**成功响应**（200 OK）：

```json
{
  "success": true,
  "data": {
    "reportId": "report-xyz789",
    "url": "https://api.accessaudit.io/reports/report-xyz789.pdf",
    "downloadUrl": "https://api.accessaudit.io/reports/report-xyz789.pdf/download"
  }
}
```

#### 2.4.3 获取报告数据（JSON）

**GET** `/api/v1/report/json/{taskId}`

**成功响应**（200 OK）：

```json
{
  "success": true,
  "data": {
    "taskId": "task-abc123",
    "auditDate": "2026-07-25",
    "version": "1.0.0",
    "complianceStandard": "EN 301 549 (WCAG 2.1 AA)",
    "summary": {
      "totalPages": 10,
      "totalViolations": 15,
      "critical": 3,
      "serious": 5,
      "moderate": 4,
      "minor": 3,
      "overallScore": 75
    },
    "violations": [...],
    "coverage": {...},
    "recommendations": [...]
  }
}
```

---

## 3. 数据模型

### 3.1 静态违规模型

```typescript
interface StaticViolation {
  id: string;
  wcagTag: string;
  severity: 'critical' | 'serious' | 'moderate' | 'minor';
  element: string;
  message: string;
  fixSuggestion: string;
}
```

### 3.2 行为测试结果模型

```typescript
interface BehaviorResult {
  testType: string;
  targetElement: string;
  status: 'pass' | 'fail' | 'error' | 'unknown';
  expectedBehavior: string;
  actualBehavior: string;
  llmInsight?: string;
  fixSuggestion?: string;
}
```

### 3.3 覆盖率数据模型

```typescript
interface CoverageData {
  keyboardReachRate: number;
  focusVisibleRate: number;
  nameComputationRate: number;
  roleSemanticsRate: number;
  modalFocusReturnRate: number;
  goldenPathCoverage: number;
  componentInteractionCoverage: number;
}
```

### 3.4 审计任务模型

```typescript
interface AuditTask {
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
```

### 3.5 审计配置模型

```typescript
interface AuditConfig {
  includeStaticScan: boolean;
  includeBehaviorTest: boolean;
  scanRules: string[];
  behaviorTests: string[];
  goldenPaths: GoldenPath[];
}

interface GoldenPath {
  name: string;
  steps: string[];
}
```

### 3.6 审计结果模型

```typescript
interface AuditResults {
  totalViolations: number;
  critical: number;
  serious: number;
  moderate: number;
  minor: number;
  coverage: CoverageData;
  violations: StaticViolation[];
  behaviorResults: BehaviorResult[];
}
```

---

## 4. CLI API

### 4.1 命令结构

```bash
accessaudit <command> [options]
```

### 4.2 可用命令

| 命令 | 说明 | 示例 |
|------|------|------|
| `scan` | 执行单次扫描 | `accessaudit scan https://example.com` |
| `audit` | 执行完整审计 | `accessaudit audit --config config.json` |
| `report` | 生成报告 | `accessaudit report --task-id task-abc123` |
| `rules` | 管理规则 | `accessaudit rules list` |
| `version` | 显示版本 | `accessaudit version` |

### 4.3 scan 命令

```bash
accessaudit scan <url> [options]

Options:
  --rules, -r       Comma-separated list of rules to run
  --output, -o      Output format: json, html, summary
  --include-hidden  Include hidden elements in scan
  --timeout, -t     Timeout in milliseconds
  --help, -h        Show help
```

**示例**：

```bash
accessaudit scan https://example.com --rules color-contrast,image-alt --output html
```

### 4.4 audit 命令

```bash
accessaudit audit [options]

Options:
  --config, -c      Path to config file
  --urls, -u        Comma-separated list of URLs
  --static          Include static scan
  --behavior        Include behavior tests
  --golden-path     Path to golden path config
  --output, -o      Output directory
  --help, -h        Show help
```

**配置文件示例**（config.json）：

```json
{
  "urls": ["https://example.com", "https://example.com/about"],
  "staticScan": {
    "enabled": true,
    "rules": ["color-contrast", "image-alt", "label"]
  },
  "behaviorTest": {
    "enabled": true,
    "tests": ["keyboard-trap", "modal-focus-return"]
  },
  "goldenPaths": [
    {
      "name": "User Login",
      "steps": ["click .login-btn", "fill #username", "fill #password", "click .submit"]
    }
  ]
}
```

---

## 5. SDK API

### 5.1 安装

```bash
npm install @accessaudit/sdk
# 或
pnpm add @accessaudit/sdk
```

### 5.2 基本用法

```typescript
import { AccessAudit } from '@accessaudit/sdk';

const client = new AccessAudit({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.accessaudit.io'
});

// 执行静态扫描
const staticResult = await client.scanner.static({
  url: 'https://example.com',
  rules: ['color-contrast', 'image-alt']
});

// 执行行为测试
const behaviorResult = await client.agent.behavior({
  url: 'https://example.com',
  testType: 'keyboard-trap'
});

// 创建审计任务
const task = await client.engine.createTask({
  name: 'Website Audit',
  urls: ['https://example.com'],
  config: {
    includeStaticScan: true,
    includeBehaviorTest: true
  }
});

// 获取任务状态
const status = await client.engine.getTask(task.taskId);

// 生成报告
const report = await client.report.html(task.taskId);
```

### 5.3 SDK 类结构

```typescript
class AccessAudit {
  constructor(options: AccessAuditOptions);
  
  scanner: ScannerAPI;
  agent: AgentAPI;
  engine: EngineAPI;
  report: ReportAPI;
}

interface ScannerAPI {
  static(options: StaticScanOptions): Promise<StaticScanResult>;
  rules(options?: RulesOptions): Promise<RulesResult>;
  registerRule(options: RegisterRuleOptions): Promise<RegisterRuleResult>;
}

interface AgentAPI {
  behavior(options: BehaviorTestOptions): Promise<BehaviorResult>;
  batch(options: BatchTestOptions): Promise<BatchTestResult>;
}

interface EngineAPI {
  createTask(options: CreateTaskOptions): Promise<TaskResult>;
  getTask(taskId: string): Promise<TaskResult>;
  listTasks(options?: ListTasksOptions): Promise<ListTasksResult>;
  getCoverage(taskId: string): Promise<CoverageResult>;
}

interface ReportAPI {
  html(options: ReportOptions): Promise<ReportResult>;
  pdf(options: ReportOptions): Promise<ReportResult>;
  json(taskId: string): Promise<ReportDataResult>;
}
```

---

## 附录

### A. 错误码列表

| 错误码 | 含义 | HTTP 状态码 |
|--------|------|------------|
| INVALID_URL | URL 格式无效 | 400 |
| TIMEOUT | 请求超时 | 408 |
| AUTH_FAILED | 认证失败 | 401 |
| FORBIDDEN | 无权限 | 403 |
| NOT_FOUND | 资源不存在 | 404 |
| INTERNAL_ERROR | 服务器内部错误 | 500 |
| SERVICE_UNAVAILABLE | 服务不可用 | 503 |

### B. 测试类型列表

| 测试类型 | WCAG 条款 | 说明 |
|---------|-----------|------|
| keyboard-reachability | 2.1.1 | 键盘可达性检测 |
| keyboard-trap | 2.1.2 | 键盘陷阱检测 |
| focus-visibility | 2.4.7 | 焦点可见性检测 |
| focus-order | 2.4.3 | 焦点顺序检测 |
| modal-focus-return | 2.4.3 | Modal 焦点回弹检测 |

### C. 规则分类列表

| 分类 | 说明 | 包含规则 |
|------|------|---------|
| perceivable | 可感知 | color-contrast, image-alt, audio-description |
| operable | 可操作 | keyboard, focus, navigation, timing |
| understandable | 可理解 | language, readability, input-assistance |
| robust | 健壮性 | aria, parsing, name-role-value |

---

*本 API 文档定义了 AccessAudit 系统的核心接口。实际实现时应根据技术选型和架构调整进行适配。*