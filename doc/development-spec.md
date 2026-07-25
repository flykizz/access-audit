# AccessAudit 开发规范

> 代码规范、目录结构、命名约定
> 版本：v1.0
> 更新日期：2026-07-25

---

## 目录

1. [代码规范](#1-代码规范)
2. [目录结构](#2-目录结构)
3. [命名约定](#3-命名约定)
4. [提交规范](#4-提交规范)
5. [代码审查规范](#5-代码审查规范)

---

## 1. 代码规范

### 1.1 TypeScript 规范

#### 1.1.1 基本规则

| 规则 | 说明 | 示例 |
|------|------|------|
| **严格模式** | 必须启用 `strict: true` | `tsconfig.json` 中配置 |
| **类型定义** | 必须为函数参数和返回值定义类型 | `function scan(url: string): Promise<Result>` |
| **接口优先** | 使用 `interface` 定义数据结构 | `interface AuditResult { ... }` |
| **类型断言** | 避免使用 `any`，使用 `unknown` + 类型守卫 | `if (value instanceof Error)` |
| **空值检查** | 必须处理 null/undefined | 使用可选链 `?.` 和空值合并 `??` |

#### 1.1.2 变量声明

```typescript
// ✅ 正确
const userName: string = 'John';
let counter: number = 0;

// ❌ 错误
var userName = 'John';
let counter;
```

#### 1.1.3 函数定义

```typescript
// ✅ 正确
async function scanUrl(url: string, options?: ScanOptions): Promise<ScanResult> {
  // ...
}

// ❌ 错误
function scanUrl(url, options) {
  // ...
}
```

#### 1.1.4 接口定义

```typescript
// ✅ 正确
interface ScanResult {
  url: string;
  violations: Violation[];
  scanTime: number;
}

// ❌ 错误
type ScanResult = {
  url: string;
  violations: Violation[];
  scanTime: number;
};
```

#### 1.1.5 类定义

```typescript
// ✅ 正确
class AxeScanner {
  private page: Page;
  
  constructor(page: Page) {
    this.page = page;
  }
  
  async scan(dom: Document): Promise<AxeResults> {
    // ...
  }
}

// ❌ 错误
class AxeScanner {
  constructor(page) {
    this.page = page;
  }
}
```

#### 1.1.6 错误处理

```typescript
// ✅ 正确
try {
  const result = await this.scan(url);
  return result;
} catch (error) {
  if (error instanceof ScanError) {
    throw new Error(`Scan failed: ${error.message}`);
  }
  throw error;
}

// ❌ 错误
try {
  const result = await this.scan(url);
  return result;
} catch (error) {
  throw error;
}
```

### 1.2 ESLint 配置

```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint"],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/explicit-module-boundary-types": "warn",
    "no-console": "warn"
  }
}
```

### 1.3 Prettier 配置

```json
{
  "printWidth": 120,
  "tabWidth": 2,
  "singleQuote": true,
  "trailingComma": "es5",
  "semi": true,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

---

## 2. 目录结构

### 2.1 项目根目录结构

```
AccessAudit/
├── packages/
│   ├── core/              # 核心检测引擎
│   ├── cli/               # 命令行工具
│   └── sdk/               # 软件开发工具包
├── doc/                   # 文档
├── tests/                 # 集成测试
├── package.json
├── tsconfig.json
├── turbo.json
├── .eslintrc.json
├── .prettierrc.json
└── README.md
```

### 2.2 Core 包目录结构

```
packages/core/
├── src/
│   ├── scanner/           # 静态扫描引擎
│   │   ├── axe-integration.ts
│   │   ├── custom-rules.ts
│   │   ├── rule-config.ts
│   │   └── index.ts
│   ├── agent/             # 行为测试引擎
│   │   ├── page-agent.ts
│   │   ├── rule-engine.ts
│   │   ├── task-executor.ts
│   │   └── index.ts
│   ├── engine/            # 智能任务引擎
│   │   ├── task-generator.ts
│   │   ├── coverage-tracker.ts
│   │   ├── strategy-scheduler.ts
│   │   └── index.ts
│   ├── paths/             # 黄金路径管理
│   │   ├── path-discovery.ts
│   │   ├── path-evaluator.ts
│   │   └── index.ts
│   ├── types/             # TypeScript 类型定义
│   │   ├── index.ts
│   │   ├── scan.ts
│   │   ├── behavior.ts
│   │   └── engine.ts
│   ├── utils/             # 工具函数
│   │   ├── logger.ts
│   │   ├── validator.ts
│   │   └── index.ts
│   └── index.ts           # 包入口
├── tests/                 # 单元测试
├── package.json
└── tsconfig.json
```

### 2.3 CLI 包目录结构

```
packages/cli/
├── src/
│   ├── commands/          # CLI 命令
│   │   ├── scan.ts
│   │   ├── audit.ts
│   │   ├── report.ts
│   │   ├── rules.ts
│   │   └── index.ts
│   ├── config/            # 配置处理
│   │   ├── config-loader.ts
│   │   └── index.ts
│   ├── output/            # 输出格式化
│   │   ├── formatter.ts
│   │   └── index.ts
│   └── index.ts           # CLI 入口
├── package.json
└── tsconfig.json
```

### 2.4 SDK 包目录结构

```
packages/sdk/
├── src/
│   ├── client/            # API 客户端
│   │   ├── scanner.ts
│   │   ├── agent.ts
│   │   ├── engine.ts
│   │   ├── report.ts
│   │   └── index.ts
│   ├── types/             # TypeScript 类型定义
│   │   └── index.ts
│   ├── utils/             # 工具函数
│   │   └── index.ts
│   └── index.ts           # SDK 入口
├── package.json
└── tsconfig.json
```

### 2.5 目录职责说明

| 目录 | 职责 | 允许包含 |
|------|------|---------|
| `scanner/` | 静态扫描相关代码 | axe-core 集成、规则配置 |
| `agent/` | 行为测试相关代码 | Page Agent、规则引擎 |
| `engine/` | 任务调度相关代码 | 任务生成、覆盖率追踪 |
| `paths/` | 路径管理相关代码 | 路径发现、路径评估 |
| `types/` | TypeScript 类型定义 | 接口、类型别名 |
| `utils/` | 通用工具函数 | 日志、验证、格式化 |

---

## 3. 命名约定

### 3.1 文件命名

| 规则 | 示例 |
|------|------|
| **使用小写字母** | `axe-integration.ts` |
| **使用连字符分隔** | `rule-config.ts` |
| **避免下划线** | `task-executor.ts`（非 `task_executor.ts`） |
| **入口文件** | `index.ts` |
| **类型定义** | `types/index.ts` |

### 3.2 类命名

| 规则 | 示例 |
|------|------|
| **使用 PascalCase** | `class AxeScanner` |
| **名词性命名** | `PageAgent`, `RuleEngine`, `CoverageTracker` |
| **避免缩写** | `TaskGenerator`（非 `TaskGen`） |

### 3.3 函数命名

| 规则 | 示例 |
|------|------|
| **使用 camelCase** | `async function scanUrl()` |
| **动词性命名** | `scan`, `execute`, `generate`, `track` |
| **避免缩写** | `generateTasks`（非 `genTasks`） |

### 3.4 变量命名

| 规则 | 示例 |
|------|------|
| **使用 camelCase** | `const scanResult = {}` |
| **描述性命名** | `const keyboardReachRate = 95` |
| **避免缩写** | `const violationCount`（非 `violCnt`） |
| **布尔变量** | 使用 `is`/`has`/`should` 前缀 |

```typescript
// ✅ 正确
const isTrapped = true;
const hasFocus = false;
const shouldContinue = true;

// ❌ 错误
const trapped = true;
const focus = false;
const continue = true;
```

### 3.5 接口命名

| 规则 | 示例 |
|------|------|
| **使用 PascalCase** | `interface ScanResult` |
| **名词性命名** | `AuditConfig`, `CoverageData`, `BehaviorResult` |

### 3.6 枚举命名

| 规则 | 示例 |
|------|------|
| **使用 PascalCase** | `enum Severity` |
| **枚举值使用 PascalCase** | `Critical`, `Serious`, `Moderate`, `Minor` |

```typescript
// ✅ 正确
enum Severity {
  Critical = 'critical',
  Serious = 'serious',
  Moderate = 'moderate',
  Minor = 'minor',
}

// ❌ 错误
enum severity {
  critical = 'critical',
}
```

### 3.7 常量命名

| 规则 | 示例 |
|------|------|
| **使用 UPPER_CASE** | `const MAX_TIMEOUT = 30000` |
| **使用下划线分隔** | `const SCAN_RESULT_LIMIT = 100` |

### 3.8 私有成员命名

| 规则 | 示例 |
|------|------|
| **使用下划线前缀** | `private _page: Page` |
| **仅用于类的私有属性** | `private _coverageData: CoverageData` |

---

## 4. 提交规范

### 4.1 提交消息格式

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### 4.2 类型定义

| 类型 | 说明 | 示例 |
|------|------|------|
| **feat** | 新功能 | `feat(scanner): add custom rule support` |
| **fix** | 修复 Bug | `fix(agent): fix keyboard trap detection` |
| **docs** | 文档更新 | `docs(api): update API documentation` |
| **style** | 代码风格 | `style: format code with prettier` |
| **refactor** | 重构 | `refactor(engine): simplify task generation` |
| **test** | 测试 | `test(scanner): add unit tests` |
| **chore** | 构建/工具 | `chore: update dependencies` |

### 4.3 作用域定义

| 作用域 | 说明 |
|--------|------|
| `scanner` | 静态扫描引擎 |
| `agent` | 行为测试引擎 |
| `engine` | 智能任务引擎 |
| `cli` | 命令行工具 |
| `sdk` | SDK |
| `report` | 报告生成器 |
| `config` | 配置相关 |

### 4.4 提交示例

```
feat(scanner): add custom rule registration

- Add registerCustomRule method to AxeScanner
- Support custom rule evaluation function
- Add validation for rule configuration

Closes #123
```

```
fix(agent): fix keyboard trap detection logic

- Fix focusable element detection in modals
- Improve Tab navigation simulation
- Add timeout handling for focus loop detection

Closes #124
```

### 4.5 提交检查清单

| 检查项 | 说明 |
|--------|------|
| ✅ | 提交消息符合格式 |
| ✅ | 类型和作用域正确 |
| ✅ | 描述简洁清晰 |
| ✅ | 关联 Issue 编号 |
| ✅ | 代码已通过 lint |
| ✅ | 测试已通过 |

---

## 5. 代码审查规范

### 5.1 审查级别

| 级别 | 适用场景 | 审查人数 |
|------|---------|---------|
| **初级审查** | 小功能、文档更新、测试用例 | 1人 |
| **中级审查** | 核心功能、API 变更、重构 | 2人 |
| **高级审查** | 架构变更、重大重构、安全相关 | 3人（含技术负责人） |

### 5.2 审查标准

#### 5.2.1 代码质量

| 检查项 | 说明 |
|--------|------|
| ✅ | 符合 TypeScript 规范 |
| ✅ | 无 `any` 类型 |
| ✅ | 错误处理完整 |
| ✅ | 代码逻辑清晰 |
| ✅ | 无重复代码 |

#### 5.2.2 安全性

| 检查项 | 说明 |
|--------|------|
| ✅ | 无硬编码密钥 |
| ✅ | 输入验证完整 |
| ✅ | 无 SQL 注入风险 |
| ✅ | 无 XSS 风险 |

#### 5.2.3 性能

| 检查项 | 说明 |
|--------|------|
| ✅ | 无不必要的循环 |
| ✅ | 无内存泄漏 |
| ✅ | 异步操作优化 |

#### 5.2.4 可维护性

| 检查项 | 说明 |
|--------|------|
| ✅ | 命名规范 |
| ✅ | 代码注释（复杂逻辑） |
| ✅ | 测试覆盖率 |
| ✅ | 文档更新 |

### 5.3 审查流程

```
代码审查流程：
┌─────────────────────────────────────────────────────┐
│                                                     │
│  1. 开发者提交 PR                                   │
│       │                                             │
│       ▼                                             │
│  2. CI/CD 自动检查（lint、test）                     │
│       │                                             │
│       ▼                                             │
│  3. 指定审查人                                       │
│       │                                             │
│       ▼                                             │
│  4. 审查人审查代码                                   │
│       │                                             │
│       ▼                                             │
│  5. 提出修改建议（或批准）                             │
│       │                                             │
│       ▼                                             │
│  6. 开发者修改代码                                   │
│       │                                             │
│       ▼                                             │
│  7. 审查人重新审查                                   │
│       │                                             │
│       ▼                                             │
│  8. 合并到 main 分支                                 │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 5.4 审查评论规范

| 类型 | 标签 | 示例 |
|------|------|------|
| **问题** | ❌ | `❌ 这里缺少错误处理` |
| **建议** | 💡 | `💡 建议提取为独立函数` |
| **疑问** | ❓ | `❓ 这段逻辑的目的是什么？` |
| **同意** | ✅ | `✅ 这个方案很好` |

---

## 附录

### A. 工具链版本要求

> **注**: 以下版本为目标版本，项目初始化后需根据实际安装情况确认

| 工具 | 版本 | 说明 |
|------|------|------|
| Node.js | ≥ 20.0.0 | 运行时 |
| pnpm | ≥ 8.6.0 | 包管理器 |
| TypeScript | ≥ 5.1.6 | 类型检查 |
| ESLint | ≥ 8.45.0 | 代码检查 |
| Prettier | ≥ 3.0.0 | 代码格式化 |
| Vitest | ≥ 1.5.0 | 单元测试框架 |
| Playwright | ≥ 1.36.0 | 端到端测试框架 |
| Commander.js | ≥ 11.0.0 | CLI 框架 |
| Chalk | ≥ 5.0.0 | 终端彩色输出 |
| Ora | ≥ 7.0.0 | 进度显示 |
| Axios | ≥ 1.6.0 | HTTP 客户端 |
| React | ≥ 18.0.0 | 前端框架 |
| Material-UI | ≥ 5.0.0 | UI 组件库 |
| Zustand | ≥ 4.0.0 | 状态管理 |
| React Router | ≥ 6.0.0 | 路由 |
| Chart.js | ≥ 4.0.0 | 图表库 |
| Vite | ≥ 5.0.0 | 前端构建工具 |
| NestJS | ≥ 10.0.0 | 后端框架 |
| Prisma | ≥ 5.0.0 | ORM |
| jsonwebtoken | ≥ 9.0.0 | JWT 认证 |
| Winston | ≥ 3.10.0 | 日志 |
| Zod | ≥ 3.22.0 | 类型验证 |

### B. 常用命令

| 命令 | 说明 |
|------|------|
| `pnpm install` | 安装依赖 |
| `pnpm build` | 构建项目 |
| `pnpm lint` | 代码检查 |
| `pnpm format` | 代码格式化 |
| `pnpm test` | 运行测试 |
| `pnpm scan` | 执行扫描 |

### C. 代码模板

#### 类模板

```typescript
import { injectable } from 'tsyringe';

@injectable()
export class ExampleService {
  private _logger: Logger;
  
  constructor(logger: Logger) {
    this._logger = logger;
  }
  
  async execute(options: ExampleOptions): Promise<ExampleResult> {
    try {
      this._logger.info('Executing example service');
      
      // 业务逻辑
      
      return result;
    } catch (error) {
      this._logger.error('Example service failed', error);
      throw error;
    }
  }
}
```

#### 函数模板

```typescript
export async function exampleFunction(
  param1: string,
  param2: number,
  options?: ExampleOptions
): Promise<ExampleResult> {
  // 参数验证
  if (!param1) {
    throw new Error('param1 is required');
  }
  
  // 业务逻辑
  
  return {
    success: true,
    data: result,
  };
}
```

---

*本开发规范旨在确保 AccessAudit 项目代码的一致性和可维护性。所有团队成员必须严格遵守。*