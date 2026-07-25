# AccessAudit 测试计划

> 测试用例模板、测试流程、验收标准
> 版本：v1.0
> 更新日期：2026-07-25

---

## 目录

1. [测试概述](#1-测试概述)
2. [测试策略](#2-测试策略)
3. [测试用例模板](#3-测试用例模板)
4. [核心模块测试用例](#4-核心模块测试用例)
5. [测试流程](#5-测试流程)
6. [验收标准](#6-验收标准)
7. [测试工具](#7-测试工具)

---

## 1. 测试概述

### 1.1 测试目标

| 目标 | 说明 |
|------|------|
| **功能正确性** | 确保所有功能按设计规范实现 |
| **性能达标** | 单页面扫描 < 30s，批量扫描支持并行 |
| **准确率** | 行为测试准确率 ≥ 85% |
| **可靠性** | 连续运行 24 小时无崩溃 |
| **兼容性** | 支持主流浏览器和设备 |

### 1.2 测试范围

| 模块 | 测试类型 | 优先级 |
|------|---------|--------|
| 静态扫描引擎 | 单元测试、集成测试 | P0 |
| 行为测试引擎 | 单元测试、集成测试、端到端测试 | P0 |
| 智能任务引擎 | 单元测试、集成测试 | P0 |
| CLI | 集成测试、端到端测试 | P1 |
| SDK | 集成测试、端到端测试 | P1 |
| Web UI | 端到端测试 | P1 |
| 报告生成器 | 集成测试 | P1 |

### 1.3 测试阶段

| 阶段 | 时间 | 内容 |
|------|------|------|
| **单元测试** | 开发过程中 | 每个模块独立测试 |
| **集成测试** | 模块开发完成后 | 模块间交互测试 |
| **端到端测试** | 整体开发完成后 | 完整流程测试 |
| **验证测试** | 第9-10周 | 10个真实网站验证 |
| **性能测试** | 第9-10周 | 性能基准测试 |

---

## 2. 测试策略

### 2.1 测试金字塔

```
测试金字塔：
┌─────────────────────────────────────┐
│         端到端测试 (10%)            │
├─────────────────────────────────────┤
│         集成测试 (20%)             │
├─────────────────────────────────────┤
│         单元测试 (70%)             │
└─────────────────────────────────────┘
```

### 2.2 自动化测试策略

| 测试类型 | 自动化 | 手动 | 比例 |
|---------|--------|------|------|
| 单元测试 | ✅ | ❌ | 100% |
| 集成测试 | ✅ | ❌ | 90% |
| 端到端测试 | ✅ | ✅ | 70% |
| 性能测试 | ✅ | ❌ | 100% |
| 兼容性测试 | ✅ | ✅ | 50% |

### 2.3 测试环境

| 环境 | 配置 | 用途 |
|------|------|------|
| **开发环境** | 本地 Node.js 环境 | 开发过程中的单元测试 |
| **测试环境** | Docker 容器化环境 | 集成测试和端到端测试 |
| **验证环境** | 真实网站 | 10个欧洲企业网站验证 |

---

## 3. 测试用例模板

### 3.1 通用测试用例模板

```yaml
testCase:
  id: TC-001
  name: 静态扫描 - 颜色对比度检测
  description: 验证静态扫描引擎能够正确检测颜色对比度不足的元素
  module: scanner
  priority: P0
  preconditions:
    - 测试页面包含低对比度文本元素
    - 静态扫描引擎已初始化
  steps:
    - 步骤1: 调用静态扫描 API，传入测试页面 URL
    - 步骤2: 检查返回结果中是否包含 color-contrast 违规
    - 步骤3: 验证违规元素数量和严重程度
  expectedResults:
    - 返回结果中包含 color-contrast 违规
    - 违规严重程度为 critical 或 serious
    - 违规元素数量与实际低对比度元素数量一致
  actualResults:
    - 待填写
  status:
    - 待执行
  notes:
    - 测试页面需包含至少一个低对比度元素
```

### 3.2 测试用例状态

| 状态 | 说明 |
|------|------|
| **待执行** | 测试用例尚未执行 |
| **通过** | 测试用例执行通过 |
| **失败** | 测试用例执行失败 |
| **阻塞** | 测试用例因依赖未完成而无法执行 |
| **跳过** | 测试用例因环境问题或其他原因跳过 |

---

## 4. 核心模块测试用例

### 4.1 静态扫描引擎测试用例

#### TC-SC-001: 颜色对比度检测

```yaml
testCase:
  id: TC-SC-001
  name: 静态扫描 - 颜色对比度检测
  description: 验证静态扫描引擎能够正确检测颜色对比度不足的元素
  module: scanner
  priority: P0
  preconditions:
    - 测试页面包含文本颜色 #888888 和背景颜色 #FFFFFF 的元素（对比度约 2.1:1，低于 4.5:1 要求）
    - 静态扫描引擎已初始化
  steps:
    - 步骤1: 调用 /api/v1/scanner/static，传入包含低对比度元素的测试页面
    - 步骤2: 检查返回结果中的 violations 数组
    - 步骤3: 验证是否存在 id 为 color-contrast 的违规
    - 步骤4: 验证违规严重程度为 critical
  expectedResults:
    - 返回结果 success 为 true
    - violations 数组中包含 id 为 color-contrast 的违规
    - 违规 severity 为 critical
    - 违规元素数量 ≥ 1
  status: 待执行
```

#### TC-SC-002: 图片 alt 属性检测

```yaml
testCase:
  id: TC-SC-002
  name: 静态扫描 - 图片 alt 属性检测
  description: 验证静态扫描引擎能够正确检测缺少 alt 属性的图片
  module: scanner
  priority: P0
  preconditions:
    - 测试页面包含缺少 alt 属性的 `<img>` 元素
    - 测试页面包含带有空 alt 属性的装饰性图片
    - 静态扫描引擎已初始化
  steps:
    - 步骤1: 调用 /api/v1/scanner/static，传入测试页面
    - 步骤2: 检查 violations 数组中是否包含 image-alt 违规
    - 步骤3: 验证违规元素仅包含缺少 alt 属性的图片（不包含空 alt 属性的图片）
  expectedResults:
    - 返回结果 success 为 true
    - violations 数组中包含 id 为 image-alt 的违规
    - 违规元素仅包含缺少 alt 属性的图片
    - 空 alt 属性的装饰性图片不被标记为违规
  status: 待执行
```

#### TC-SC-003: 表单 label 关联检测

```yaml
testCase:
  id: TC-SC-003
  name: 静态扫描 - 表单 label 关联检测
  description: 验证静态扫描引擎能够正确检测缺少 label 关联的表单字段
  module: scanner
  priority: P0
  preconditions:
    - 测试页面包含缺少 label 关联的 `<input>` 元素
    - 测试页面包含正确关联 label 的输入框作为对照
    - 静态扫描引擎已初始化
  steps:
    - 步骤1: 调用 /api/v1/scanner/static，传入测试页面
    - 步骤2: 检查 violations 数组中是否包含 label 违规
    - 步骤3: 验证违规元素仅包含缺少 label 关联的输入框
  expectedResults:
    - 返回结果 success 为 true
    - violations 数组中包含 id 为 label 的违规
    - 违规元素仅包含缺少 label 关联的输入框
    - 正确关联 label 的输入框不被标记为违规
  status: 待执行
```

### 4.2 行为测试引擎测试用例

#### TC-AG-001: 键盘陷阱检测

```yaml
testCase:
  id: TC-AG-001
  name: 行为测试 - 键盘陷阱检测
  description: 验证行为测试引擎能够正确检测 Modal 中的键盘陷阱
  module: agent
  priority: P0
  preconditions:
    - 测试页面包含 Modal 弹窗，其中包含可聚焦元素但未实现焦点循环
    - 行为测试引擎已初始化
  steps:
    - 步骤1: 打开 Modal 弹窗
    - 步骤2: 调用 /api/v1/agent/behavior，testType 为 keyboard-trap
    - 步骤3: 检查返回结果的 status 字段
    - 步骤4: 验证 details 中包含焦点循环检测结果
  expectedResults:
    - 返回结果 success 为 true
    - status 为 fail（因为 Modal 存在键盘陷阱）
    - details 中包含 isTrapped: true
    - details 中包含 trappedElement 信息
  status: 待执行
```

#### TC-AG-002: 键盘陷阱检测（正常情况）

```yaml
testCase:
  id: TC-AG-002
  name: 行为测试 - 键盘陷阱检测（正常情况）
  description: 验证行为测试引擎能够正确识别没有键盘陷阱的 Modal
  module: agent
  priority: P0
  preconditions:
    - 测试页面包含 Modal 弹窗，已正确实现焦点循环
    - 行为测试引擎已初始化
  steps:
    - 步骤1: 打开 Modal 弹窗
    - 步骤2: 调用 /api/v1/agent/behavior，testType 为 keyboard-trap
    - 步骤3: 检查返回结果的 status 字段
  expectedResults:
    - 返回结果 success 为 true
    - status 为 pass
    - details 中包含 focusableElements 数量
    - details 中包含 firstElement 和 lastElement 信息
  status: 待执行
```

#### TC-AG-003: Modal 焦点回弹检测

```yaml
testCase:
  id: TC-AG-003
  name: 行为测试 - Modal 焦点回弹检测
  description: 验证行为测试引擎能够正确检测 Modal 关闭后焦点是否回弹到触发元素
  module: agent
  priority: P0
  preconditions:
    - 测试页面包含触发按钮和 Modal 弹窗
    - Modal 关闭后焦点未回弹到触发按钮（存在缺陷）
    - 行为测试引擎已初始化
  steps:
    - 步骤1: 记录当前焦点位置（触发按钮）
    - 步骤2: 点击触发按钮打开 Modal
    - 步骤3: 点击关闭按钮关闭 Modal
    - 步骤4: 调用 /api/v1/agent/behavior，testType 为 modal-focus-return
    - 步骤5: 检查返回结果的 status 字段
  expectedResults:
    - 返回结果 success 为 true
    - status 为 fail（因为焦点未回弹）
    - details 中包含 expectedFocusElement 和 actualFocusElement 信息
  status: 待执行
```

#### TC-AG-004: Modal 焦点回弹检测（正常情况）

```yaml
testCase:
  id: TC-AG-004
  name: 行为测试 - Modal 焦点回弹检测（正常情况）
  description: 验证行为测试引擎能够正确识别焦点正常回弹的 Modal
  module: agent
  priority: P0
  preconditions:
    - 测试页面包含触发按钮和 Modal 弹窗
    - Modal 关闭后焦点正确回弹到触发按钮
    - 行为测试引擎已初始化
  steps:
    - 步骤1: 记录当前焦点位置（触发按钮）
    - 步骤2: 点击触发按钮打开 Modal
    - 步骤3: 点击关闭按钮关闭 Modal
    - 步骤4: 调用 /api/v1/agent/behavior，testType 为 modal-focus-return
    - 步骤5: 检查返回结果的 status 字段
  expectedResults:
    - 返回结果 success 为 true
    - status 为 pass
    - details 中包含 focusReturned: true
  status: 待执行
```

#### TC-AG-005: 键盘可达性检测

```yaml
testCase:
  id: TC-AG-005
  name: 行为测试 - 键盘可达性检测
  description: 验证行为测试引擎能够正确检测页面中所有交互元素是否可通过键盘访问
  module: agent
  priority: P0
  preconditions:
    - 测试页面包含使用鼠标事件绑定的按钮（无法通过键盘触发）
    - 测试页面包含正常的可聚焦元素作为对照
    - 行为测试引擎已初始化
  steps:
    - 步骤1: 调用 /api/v1/agent/behavior，testType 为 keyboard-reachability
    - 步骤2: 检查返回结果的 status 字段
    - 步骤3: 验证 details 中包含不可达元素列表
  expectedResults:
    - 返回结果 success 为 true
    - status 为 fail（因为存在不可达元素）
    - details 中包含 unreachableElements 数组
    - details 中包含 unreachableCount 大于 0
  status: 待执行
```

### 4.3 智能任务引擎测试用例

#### TC-EN-001: 创建审计任务

```yaml
testCase:
  id: TC-EN-001
  name: 智能任务引擎 - 创建审计任务
  description: 验证智能任务引擎能够正确创建审计任务
  module: engine
  priority: P0
  preconditions:
    - 智能任务引擎已初始化
    - 提供有效的测试 URL 列表
  steps:
    - 步骤1: 调用 /api/v1/engine/tasks，传入任务配置
    - 步骤2: 检查返回结果的 taskId 字段
    - 步骤3: 验证任务状态为 pending
  expectedResults:
    - 返回结果 success 为 true
    - 返回结果包含 taskId
    - 任务 status 为 pending
    - createdAt 字段已设置
  status: 待执行
```

#### TC-EN-002: 获取任务状态

```yaml
testCase:
  id: TC-EN-002
  name: 智能任务引擎 - 获取任务状态
  description: 验证智能任务引擎能够正确返回任务状态
  module: engine
  priority: P0
  preconditions:
    - 已创建审计任务
    - 任务已完成执行
  steps:
    - 步骤1: 调用 /api/v1/engine/tasks/{taskId}
    - 步骤2: 检查返回结果的 status 字段
    - 步骤3: 验证 results 字段包含审计结果
  expectedResults:
    - 返回结果 success 为 true
    - status 为 completed
    - progress 为 100
    - results 字段包含 totalViolations 和 coverage 数据
  status: 待执行
```

#### TC-EN-003: 覆盖率追踪

```yaml
testCase:
  id: TC-EN-003
  name: 智能任务引擎 - 覆盖率追踪
  description: 验证智能任务引擎能够正确追踪和计算覆盖率
  module: engine
  priority: P0
  preconditions:
    - 已创建并执行审计任务
    - 测试页面包含完整的交互元素
  steps:
    - 步骤1: 调用 /api/v1/engine/coverage/{taskId}
    - 步骤2: 检查各覆盖率指标
    - 步骤3: 验证覆盖率计算是否合理
  expectedResults:
    - 返回结果 success 为 true
    - 各覆盖率指标在 0-100 之间
    - keyboardReachRate ≥ 90（如果页面没有严重问题）
    - missingCoverage 数组包含覆盖率不足的指标
  status: 待执行
```

### 4.4 报告生成器测试用例

#### TC-RP-001: 生成 HTML 报告

```yaml
testCase:
  id: TC-RP-001
  name: 报告生成器 - 生成 HTML 报告
  description: 验证报告生成器能够正确生成 HTML 格式的合规报告
  module: report
  priority: P1
  preconditions:
    - 已完成审计任务，存在有效的 taskId
    - 报告生成器已初始化
  steps:
    - 步骤1: 调用 /api/v1/report/html，传入 taskId
    - 步骤2: 检查返回结果的 reportId 和 url 字段
    - 步骤3: 验证报告 URL 可访问
    - 步骤4: 验证报告内容包含必要信息（摘要、违规列表、覆盖率）
  expectedResults:
    - 返回结果 success 为 true
    - 返回结果包含 reportId 和 url
    - 报告 URL 返回 HTTP 200
    - 报告包含审计摘要、违规列表和覆盖率数据
  status: 待执行
```

#### TC-RP-002: 生成 PDF 报告

```yaml
testCase:
  id: TC-RP-002
  name: 报告生成器 - 生成 PDF 报告
  description: 验证报告生成器能够正确生成 PDF 格式的合规报告
  module: report
  priority: P1
  preconditions:
    - 已完成审计任务，存在有效的 taskId
    - 报告生成器已初始化
  steps:
    - 步骤1: 调用 /api/v1/report/pdf，传入 taskId
    - 步骤2: 检查返回结果的 reportId 和 url 字段
    - 步骤3: 验证报告 URL 可访问且返回 PDF 内容
  expectedResults:
    - 返回结果 success 为 true
    - 返回结果包含 reportId 和 url
    - 报告 URL 返回 HTTP 200
    - 返回内容 Content-Type 为 application/pdf
  status: 待执行
```

---

## 5. 测试流程

### 5.1 开发阶段测试流程

```
开发阶段测试流程：
┌─────────────────────────────────────────────────────┐
│                                                     │
│  1. 编写代码                                         │
│       │                                             │
│       ▼                                             │
│  2. 编写单元测试                                     │
│       │                                             │
│       ▼                                             │
│  3. 运行单元测试                                     │
│       │                                             │
│       ▼                                             │
│  4. 代码审查                                         │
│       │                                             │
│       ▼                                             │
│  5. 合并到 main 分支                                 │
│       │                                             │
│       ▼                                             │
│  6. CI/CD 自动运行集成测试                            │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 5.2 测试执行流程

```
测试执行流程：
┌─────────────────────────────────────────────────────┐
│                                                     │
│  1. 测试准备                                         │
│     ├── 设置测试环境                                  │
│     ├── 准备测试数据                                  │
│     └── 编写测试用例                                  │
│           │                                         │
│           ▼                                         │
│  2. 测试执行                                         │
│     ├── 运行单元测试                                  │
│     ├── 运行集成测试                                  │
│     └── 运行端到端测试                                │
│           │                                         │
│           ▼                                         │
│  3. 测试记录                                         │
│     ├── 记录测试结果                                  │
│     ├── 记录缺陷                                      │
│     └── 生成测试报告                                  │
│           │                                         │
│           ▼                                         │
│  4. 缺陷修复                                         │
│     ├── 分配缺陷                                      │
│     ├── 修复代码                                      │
│     └── 回归测试                                      │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 5.3 缺陷管理流程

```
缺陷管理流程：
┌─────────────────────────────────────────────────────┐
│                                                     │
│  1. 发现缺陷                                         │
│       │                                             │
│       ▼                                             │
│  2. 记录缺陷（GitHub Issues）                        │
│     ├── 标题：简洁描述缺陷                            │
│     ├── 标签：bug, severity/critical                │
│     ├── 复现步骤                                     │
│     └── 预期行为/实际行为                              │
│           │                                         │
│           ▼                                         │
│  3. 优先级评估                                       │
│     ├── P0: 阻止发布的严重缺陷                        │
│     ├── P1: 影响核心功能的缺陷                        │
│     └── P2: 轻微缺陷或改进建议                        │
│           │                                         │
│           ▼                                         │
│  4. 分配开发者                                       │
│           │                                         │
│           ▼                                         │
│  5. 修复缺陷                                         │
│           │                                         │
│           ▼                                         │
│  6. 回归测试                                         │
│           │                                         │
│           ▼                                         │
│  7. 关闭缺陷                                         │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 6. 验收标准

### 6.1 功能验收标准

#### Phase 1: 基础框架

| 验收项 | 验收标准 | 验证方法 |
|--------|---------|---------|
| 项目初始化 | pnpm install 成功，无依赖冲突 | 执行 pnpm install |
| TypeScript 编译 | pnpm build 成功，无类型错误 | 执行 pnpm build |
| CI/CD 流程 | Push 代码触发 CI，自动运行 lint 和测试 | Push 代码到 GitHub |

#### Phase 2: 核心引擎

| 验收项 | 验收标准 | 验证方法 |
|--------|---------|---------|
| 静态扫描引擎 | 正确集成 axe-core，支持自定义规则 | 运行单元测试，手动测试 |
| 键盘陷阱检测 | 正确检测 Modal 中的键盘陷阱 | 运行端到端测试 |
| Modal 焦点回弹检测 | 正确检测焦点是否回弹 | 运行端到端测试 |
| 智能任务引擎 | 支持任务创建、状态查询、覆盖率追踪 | 运行集成测试 |

#### Phase 3: 用户接口

| 验收项 | 验收标准 | 验证方法 |
|--------|---------|---------|
| CLI | 支持 scan、audit、report 命令 | 手动测试 CLI |
| SDK | 支持 JavaScript/TypeScript 调用 | 运行 SDK 测试 |
| Web UI | 响应式设计，无障碍友好 | 手动测试 + Lighthouse |
| 报告生成器 | 生成 EN 301 549 格式报告 | 手动测试报告生成 |

#### Phase 4: 测试与验证

| 验收项 | 验收标准 | 验证方法 |
|--------|---------|---------|
| 测试覆盖率 | 单元测试覆盖 ≥80%，集成测试覆盖 ≥60% | 运行测试覆盖率工具 |
| 验证准确率 | 10个网站验证，准确率 ≥85% | 真实网站验证 |
| 性能 | 单页面扫描 < 30s | 性能测试 |

### 6.2 质量验收标准

| 指标 | 标准 | 说明 |
|------|------|------|
| **缺陷密度** | ≤ 5 个/千行代码 | 发布前统计 |
| **测试覆盖率** | 单元测试 ≥80%，集成测试 ≥60% | 测试报告 |
| **性能** | 单页面扫描 < 30s | 性能测试 |
| **可靠性** | 连续运行 24 小时无崩溃 | 稳定性测试 |
| **兼容性** | 支持 Chrome、Firefox、Safari 最新版本 | 兼容性测试 |

### 6.3 真实网站验证标准

| 验证项 | 标准 | 说明 |
|--------|------|------|
| **准确率** | ≥ 85% | 工具检测结果与人工审计结果对比 |
| **召回率** | ≥ 80% | 工具发现的问题占人工审计发现问题的比例 |
| **覆盖率** | ≥ 75% | 检测到的问题占总问题的比例 |

---

## 7. 测试工具

### 7.1 测试框架

| 工具 | 用途 | 版本 |
|------|------|------|
| **Vitest** | 单元测试框架 | ≥ 1.5.0 |
| **Playwright** | 端到端测试框架 | ≥ 1.36.0 |

### 7.2 辅助工具

| 工具 | 用途 | 版本 |
|------|------|------|
| **axe-core** | 无障碍静态扫描 | ≥ 4.8.0 |
| **istanbul** | 测试覆盖率统计 | ≥ 0.13.0 |
| **nyc** | 覆盖率报告生成 | ≥ 15.0.0 |

### 7.3 CI/CD 工具

| 工具 | 用途 |
|------|------|
| **GitHub Actions** | 自动构建和测试 |
| **Codecov** | 测试覆盖率报告 |
| **SonarQube** | 代码质量分析 |

---

## 附录

### A. 测试用例编号规则

```
TC-<模块缩写>-<序号>

模块缩写：
- SC: Scanner（静态扫描引擎）
- AG: Agent（行为测试引擎）
- EN: Engine（智能任务引擎）
- RP: Report（报告生成器）
- CLI: CLI（命令行工具）
- SDK: SDK（软件开发工具包）
- UI: Web UI（网页界面）
```

### B. 测试优先级定义

| 优先级 | 说明 | 示例 |
|--------|------|------|
| **P0** | 阻塞发布的严重缺陷，必须修复 | 核心功能无法正常工作 |
| **P1** | 影响核心功能的缺陷，建议修复 | 次要功能异常 |
| **P2** | 轻微缺陷或改进建议，可后续修复 | UI 样式问题 |

### C. 缺陷标签定义

| 标签 | 说明 |
|------|------|
| **bug** | 功能缺陷 |
| **enhancement** | 功能增强 |
| **documentation** | 文档问题 |
| **good first issue** | 适合新手的问题 |
| **help wanted** | 需要帮助的问题 |
| **severity/critical** | 严重程度：关键 |
| **severity/medium** | 严重程度：中等 |
| **severity/low** | 严重程度：轻微 |

---

*本测试计划旨在确保 AccessAudit 项目的质量和可靠性。所有测试用例应在相应开发阶段完成执行。*