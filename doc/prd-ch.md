# PRD: Page Agent 无障碍合规审计产品

## 一、产品概述

**产品名称**: AccessAudit（暂定）  
**定位**: 基于 Page Agent 的页面内 AI 无障碍合规审计工具  
**核心主张**: "一行代码接入，验证真实用户能否完成操作——不只是扫描代码有没有 alt 属性"  
**目标市场**: 需满足 EAA / EN 301 549 / WCAG 2.1 AA 合规的欧洲企业

---

## 二、市场背景

### 2.1 监管环境

- **EAA（欧洲无障碍法案）** 已于 2025 年 6 月 28 日生效
- 首次强制私营企业合规（电商、银行、交通、电信）
- 技术基准: EN 301 549 → WCAG 2.1 Level AA
- 豁免: <10 人且收入 <€2M 的微型企业（产品类不豁免）
- 各国执法差异: 法国要求年度行动计划；西班牙罚金重；爱尔兰理论上可入狱

### 2.2 竞品格局

| 竞品 | 类型 | 交互级测试 | 核心弱点 |
|------|------|----------|---------|
| **Test-Lab.ai** | AI Agent + axe-core | ✅ 有 | 需要 Playwright headless 基础设施 |
| **TestSprite** | IDE MCP 插件 | ✅ 有 | 仅面向开发者，非审计师 |
| **Evinced** | CV + ML | ✅ 有 | 企业报价、用 CV 而非 LLM、需 SDK 集成 |
| **axe / Lighthouse** | 静态扫描 | ❌ | 只能检测 25-30% 的 WCAG 问题 |
| **Siteimprove** | 扫描平台 | ❌ | €15K-50K+/年，纯扫描 |
| **Accessibility Cloud** | 欧洲扫描平台 | ❌ | EN 301 549 对齐但仍只是扫描 |
| **accessiBe** | Overlay | ❌ | FTC 罚款 $1M，被社区抵制 |
| **Level Access** | 企业全栈 | ✅（人工）| 2-4 周交付，贵且慢 |

### 2.3 差异化定位

```
                    静态扫描 ←──────────→ 行为级测试
                        │                    │
   axe / Lighthouse     │    Test-Lab.ai     │
   Siteimprove          │    Evinced          │
                        │                    │
                        │    ── 我们 ──       │
                        │    页面内 JS +      │
                        │    行为级测试 +     │
                        │    GDPR 本地化      │
                        │                    │
                    需基础设施 ←──────→ 一行代码接入
```

**三大差异化支柱**:

1. **一行代码接入**: 无需 Playwright/headless/CI 基础设施
2. **行为级测试**: Agent 像真实用户一样操作页面，验证焦点管理/键盘可达/交互流程
3. **数据不出企业**: BYOLLM + 本地部署，满足 GDPR

---

## 三、核心功能

### 3.1 静态合规扫描

集成 axe-core 规则引擎，检测 WCAG 2.1 AA 级别的基础违规:

- 缺少 alt 属性
- 对比度不足
- 缺少 label 的表单字段
- ARIA 属性误用
- 语义结构缺陷

### 3.2 交互级行为测试（核心差异化）

利用 Page Agent 的 ReAct 循环，Agent 像真实用户一样操作页面。每个测试场景采用**规则引擎兜底 + LLM 辅助发现**双重验证机制，确保关键断言的确定性和可复现性：

| 测试场景 | Page Agent 行为 | 对应 WCAG 条款 |
|---------|----------------|--------------|
| 键盘可达性 | Tab 遍历所有交互元素，检测焦点丢失 | 2.1.1 Keyboard |
| 键盘陷阱 | 打开/关闭 modal，验证焦点是否被困 | 2.1.2 No Keyboard Trap |
| 焦点可见性 | 检测 outline:none 导致焦点不可见 | 2.4.7 Focus Visible |
| 焦点顺序 | 验证 Tab 顺序是否符合视觉布局 | 2.4.3 Focus Order |
| Skip link | 检测 skip-to-content 是否存在且生效 | 2.4.1 Bypass Blocks |
| Modal 焦点回弹 | 关闭 modal 后焦点是否回到触发按钮 | 2.4.3 Focus Order |
| 表单错误提示 | 提交空表单，验证错误是否被屏幕阅读器读取 | 3.3.1 Error Identification |
| 动态内容通知 | 检测 aria-live 区域是否存在 | 4.1.3 Status Messages |

### 3.2.1 规则引擎兜底逻辑

为确保合规审计结果的确定性，每个行为测试场景均配备规则引擎兜底逻辑。当 LLM Agent 产生不确定结果时，自动切换到规则引擎执行确定性验证：

#### 场景1：键盘可达性（WCAG 2.1.1 Keyboard）

**规则引擎逻辑**：
```javascript
function checkKeyboardReachability(dom) {
  const interactiveElements = dom.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"]), [role="button"], [role="link"]'
  );
  
  const unreachable = [];
  let currentTabindex = 0;
  
  interactiveElements.forEach(el => {
    const tabindex = parseInt(el.getAttribute('tabindex')) || 0;
    const ariaHidden = el.getAttribute('aria-hidden') === 'true';
    
    if (ariaHidden && tabindex >= 0) {
      unreachable.push({
        element: el,
        reason: 'aria-hidden="true" but still focusable',
        wcag: '2.1.1'
      });
    }
    
    if (tabindex > 0 && tabindex !== ++currentTabindex) {
      unreachable.push({
        element: el,
        reason: `tabindex gap detected: expected ${currentTabindex}, got ${tabindex}`,
        wcag: '2.1.1'
      });
    }
  });
  
  return unreachable.length === 0;
}
```

**兜底触发条件**：LLM 返回的不可达元素列表与规则引擎结果差异 > 20%

---

#### 场景2：键盘陷阱（WCAG 2.1.2 No Keyboard Trap）

**规则引擎逻辑**：
```javascript
async function checkKeyboardTrap(page) {
  const focusableInfo = await page.evaluate(() => {
    const modal = document.querySelector('[role="dialog"], .modal, [aria-modal="true"]');
    if (!modal) return { selectors: [], count: 0 };
    
    const focusable = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const selectors = Array.from(focusable).map((el, idx) => {
      const id = el.id || `focusable-${idx}`;
      if (!el.id) el.id = id;
      return `#${id}`;
    });
    
    return { selectors, count: selectors.length };
  });
  
  if (focusableInfo.count === 0) return { pass: true };
  
  const firstSelector = focusableInfo.selectors[0];
  const maxIterations = focusableInfo.count * 2;
  
  // 验证焦点循环：从最后一个元素 Tab 后应回到第一个
  const result = await page.evaluate((firstSel, maxIter) => {
    const el1 = document.querySelector(firstSel);
    if (!el1) return { pass: false, iterations: 0 };
    
    el1.focus();
    
    // 先 Tab 到最后一个元素
    for (let i = 0; i < maxIter / 2; i++) {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }));
    }
    
    // 从最后一个元素开始验证循环
    let iterations = 0;
    while (document.activeElement !== el1 && iterations < maxIter) {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }));
      iterations++;
    }
    
    return { pass: document.activeElement === el1, iterations };
  }, firstSelector, maxIterations);
  
  return { pass: result.pass, iterations: result.iterations };
}
```

**兜底触发条件**：LLM 判断为"无陷阱"但规则引擎检测到焦点循环失败

---

#### 场景3：焦点可见性（WCAG 2.4.7 Focus Visible）

**规则引擎逻辑**：
```javascript
function checkFocusVisibility(dom) {
  const violations = [];
  
  // 检测全局 outline:none
  const styles = Array.from(document.styleSheets).flatMap(sheet => {
    try { return Array.from(sheet.cssRules); } catch(e) { return []; }
  });
  
  styles.forEach(rule => {
    if (rule.selectorText && rule.style && rule.style.outline === 'none') {
      if (rule.selectorText.includes(':focus') || rule.selectorText.includes('*')) {
        violations.push({
          selector: rule.selectorText,
          reason: 'outline:none removes focus indicator',
          wcag: '2.4.7'
        });
      }
    }
  });
  
  // 检测内联样式
  dom.querySelectorAll('[style*="outline:none"], [style*="outline: none"]').forEach(el => {
    violations.push({
      element: el,
      reason: 'inline outline:none',
      wcag: '2.4.7'
    });
  });
  
  return violations.length === 0;
}
```

**兜底触发条件**：LLM 未检测到可见性问题但规则引擎发现 outline:none

---

#### 场景4：焦点顺序（WCAG 2.4.3 Focus Order）

**规则引擎逻辑**：
```javascript
function checkFocusOrder(dom) {
  const focusableElements = dom.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  const positions = [];
  focusableElements.forEach(el => {
    const rect = el.getBoundingClientRect();
    positions.push({
      element: el,
      top: rect.top,
      left: rect.left,
      tabindex: parseInt(el.getAttribute('tabindex')) || 0
    });
  });
  
  // 按视觉位置排序（从上到下，从左到右）
  const visualOrder = [...positions].sort((a, b) => {
    if (Math.abs(a.top - b.top) < 10) return a.left - b.left;
    return a.top - b.top;
  });
  
  // 检查 Tab 顺序是否与视觉顺序一致
  const tabOrder = [...positions].sort((a, b) => a.tabindex - b.tabindex);
  
  let violations = 0;
  visualOrder.forEach((el, idx) => {
    if (tabOrder[idx].element !== el.element && el.tabindex === 0) {
      violations++;
    }
  });
  
  return violations <= visualOrder.length * 0.1; // 允许 10% 偏差
}
```

**兜底触发条件**：LLM 判定顺序正确但规则引擎发现 >10% 元素顺序不一致

---

#### 场景5：Skip Link（WCAG 2.4.1 Bypass Blocks）

**规则引擎逻辑**：
```javascript
function checkSkipLink(dom) {
  const skipLinks = dom.querySelectorAll('a[href*="#"], a[href*="content"], a[class*="skip"]');
  
  if (skipLinks.length === 0) {
    return { pass: false, reason: 'No skip link found' };
  }
  
  const validSkipLink = Array.from(skipLinks).find(link => {
    const href = link.getAttribute('href');
    const targetId = href.startsWith('#') ? href.substring(1) : href;
    const target = dom.getElementById(targetId);
    
    return target && target.tagName === 'MAIN';
  });
  
  if (!validSkipLink) {
    return { pass: false, reason: 'Skip link does not point to main content' };
  }
  
  // 验证可见性（仅在聚焦时可见也可接受）
  const isVisible = validSkipLink.offsetWidth > 0 || validSkipLink.offsetHeight > 0;
  const hasFocusVisibleStyle = validSkipLink.matches(':focus') || 
    getComputedStyle(validSkipLink).outlineWidth !== '0px';
  
  return { pass: isVisible || hasFocusVisibleStyle };
}
```

**兜底触发条件**：LLM 未检测到 skip link 问题但规则引擎发现缺失

---

#### 场景6：Modal 焦点回弹（WCAG 2.4.3 Focus Order）

**规则引擎逻辑**：
```javascript
async function checkModalFocusReturn(page) {
  const triggerInfo = await page.evaluate(() => {
    const button = document.querySelector('button[data-modal-trigger], button[aria-haspopup="dialog"]');
    if (!button) return null;
    
    let selector;
    if (button.id) {
      selector = `#${button.id}`;
    } else if (button.dataset.modalTrigger) {
      selector = `button[data-modal-trigger="${button.dataset.modalTrigger}"]`;
    } else {
      const idx = Array.from(document.querySelectorAll('button')).indexOf(button);
      selector = `button:nth-of-type(${idx + 1})`;
    }
    
    return { selector, element: button };
  });
  
  if (!triggerInfo) return { pass: true, reason: 'No modal trigger found' };
  
  // 打开 modal
  await page.click(triggerInfo.selector);
  await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
  
  // 关闭 modal
  const closeButton = await page.$('[role="dialog"] button, [role="dialog"] [aria-label*="close"]');
  if (closeButton) await closeButton.click();
  else await page.keyboard.press('Escape');
  
  // 验证焦点是否回到触发按钮
  const focusedInfo = await page.evaluate((expectedSelector) => {
    const focused = document.activeElement;
    if (!focused) return { pass: false };
    
    const match = focused.matches(expectedSelector);
    return { 
      pass: match,
      focusedTag: focused.tagName,
      focusedSelector: focused.id ? `#${focused.id}` : focused.tagName
    };
  }, triggerInfo.selector);
  
  return { pass: focusedInfo.pass, ...focusedInfo };
}
```

**兜底触发条件**：LLM 判定焦点回弹正确但规则引擎验证失败

---

#### 场景7：表单错误提示（WCAG 3.3.1 Error Identification）

**规则引擎逻辑**：
```javascript
async function checkFormErrorAnnouncement(page) {
  const forms = await page.$$('form');
  if (forms.length === 0) return { pass: true };
  
  const firstForm = forms[0];
  const requiredFields = await firstForm.$$('[required]');
  
  if (requiredFields.length === 0) return { pass: true };
  
  // 获取所有 aria-live 区域
  const liveRegions = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('[aria-live], [role="status"], [role="alert"]'))
      .map(el => el.tagName);
  });
  
  if (liveRegions.length === 0) {
    return { pass: false, reason: 'No aria-live region found for error announcements' };
  }
  
  // 提交空表单
  await firstForm.evaluate(form => form.submit());
  
  // 检查错误消息是否关联到字段
  const errorsWithAriaDescribedBy = await page.evaluate(() => {
    return document.querySelectorAll('[aria-invalid="true"][aria-describedby]').length;
  });
  
  return { pass: errorsWithAriaDescribedBy > 0 };
}
```

**兜底触发条件**：LLM 判定错误提示正确但规则引擎发现缺少 aria-live 或 aria-describedby

---

#### 场景8：动态内容通知（WCAG 4.1.3 Status Messages）

**规则引擎逻辑**：
```javascript
function checkAriaLiveRegions(dom) {
  const liveRegions = dom.querySelectorAll('[aria-live], [role="status"], [role="alert"]');
  
  if (liveRegions.length === 0) {
    return { pass: false, reason: 'No aria-live region found' };
  }
  
  const violations = [];
  
  liveRegions.forEach(region => {
    const ariaLive = region.getAttribute('aria-live');
    const role = region.getAttribute('role');
    
    // 检查 aria-live 值是否有效
    if (ariaLive && !['polite', 'assertive', 'off'].includes(ariaLive)) {
      violations.push({
        element: region,
        reason: `Invalid aria-live value: ${ariaLive}`,
        wcag: '4.1.3'
      });
    }
    
    // 检查冗余声明
    if (role === 'status' && ariaLive === 'polite') {
      violations.push({
        element: region,
        reason: 'Redundant aria-live="polite" with role="status"',
        wcag: '4.1.3'
      });
    }
    
    // 检查区域是否为空（可能导致空更新）
    if (!region.textContent.trim()) {
      violations.push({
        element: region,
        reason: 'aria-live region is empty',
        wcag: '4.1.3'
      });
    }
  });
  
  return { pass: violations.length === 0, violations };
}
```

**兜底触发条件**：LLM 未检测到 aria-live 问题但规则引擎发现配置错误

---

### 3.2.2 双重验证机制流程

```
┌─────────────────────────────────────────────────────────────┐
│                    行为测试执行流程                          │
├─────────────────────────────────────────────────────────────┤
│  1. LLM Agent 执行测试场景                                   │
│     └─→ 调用 customTool（check_keyboard_nav 等）            │
├─────────────────────────────────────────────────────────────┤
│  2. 规则引擎同步执行兜底验证                                  │
│     └─→ 运行确定性规则逻辑                                    │
├─────────────────────────────────────────────────────────────┤
│  3. 结果比对                                                 │
│     ├─→ 一致 → 采用 LLM 结果（更丰富的上下文描述）            │
│     └─→ 不一致 → 采用规则引擎结果（确定性优先）               │
├─────────────────────────────────────────────────────────────┤
│  4. 生成审计报告                                             │
│     └─→ 标注结果来源："规则验证" 或 "LLM 辅助"               │
└─────────────────────────────────────────────────────────────┘
```

**一致性判定标准**：
- 两个引擎的 pass/fail 结果必须一致
- 违规细节差异 ≤ 20%（允许 LLM 发现规则引擎遗漏的边缘案例）
- 若不一致，规则引擎结果作为最终结论，并标记为"需人工复核"的高优先级项

### 3.3 跨页面用户旅程审计

通过 Chrome 扩展 Multi-page Agent 支持:

- 注册 → 登录 → 支付的完整旅程审计
- 每个页面自动触发 axe-core 扫描
- 跨页面焦点连贯性验证

### 3.4 EN 301 549 格式报告生成

报告结构:

```
AccessAudit Report
├── 总评分 (0-100，静态 60% + 行为 40%)
├── WCAG 四原则概览
│   ├── Perceivable: ✅/❌ 按条款
│   ├── Operable: ✅/❌ 按条款
│   ├── Understandable: ✅/❌ 按条款
│   └── Robust: ✅/❌ 按条款
├── 静态违规列表
│   ├── 每条: CSS selector + HTML snippet + WCAG 条款号 + 修复建议
├── 行为级违规列表
│   ├── 每条: 操作步骤 + 失败截图 + WCAG 条款号 + 修复建议
├── 审计检查清单 (全部 pass/fail)
└── 合规评分趋势图 (持续监控模式)
```

### 3.5 持续监控与回归检测

- 定期自动重跑审计
- 变化检测: 只报告新增/恶化的问题
- 合规评分趋势图
- 集成 CI/CD（通过 MCP Server）

---

## 四、技术架构

### 4.1 核心组件

```
┌─────────────────────────────────────────────┐
│  AccessAudit Platform                        │
├─────────────────────────────────────────────┤
│  测试编排器（批量调度、CI 集成）               │
├─────────────────────────────────────────────┤
│  PageAgentCore + 无障碍定制                   │
│  ├── customTools:                            │
│  │   ├── assert (断言工具)                    │
│  │   ├── check_keyboard_nav (键盘可达性)      │
│  │   └── check_aria_live (动态内容通知)       │
│  ├── instructions.system: QA 审计指令         │
│  ├── instructions.getPageInstructions:       │
│  │   按页面类型注入不同审计重点                 │
│  ├── transformPageContent:                   │
│  │   屏蔽动态数据 + 注入审计上下文              │
│  ├── lifecycle hooks:                        │
│  │   ├── onAfterStep → 收集每步结果            │
│  │   ├── onAfterTask → 生成完整报告            │
│  └── axe-core 注入 (静态扫描层)               │
├─────────────────────────────────────────────┤
│  Chrome 扩展 (跨页面旅程)                     │
│  MCP Server (CI/CD + 外部 Agent 集成)         │
├─────────────────────────────────────────────┤
│  报告生成器 (EN 301 549 / JUnit XML)         │
│  BYOLLM 配置 (GDPR 数据本地化)                │
└─────────────────────────────────────────────┤
```

### 4.2 自定义工具定义

```javascript
// assert 工具
const assertTool = tool({
  description: 'Assert WCAG compliance condition on current page',
  inputSchema: z.object({
    assertion: z.string(),
    expect_present: z.string().optional(),
    expect_absent: z.string().optional(),
    wcag_criterion: z.string().optional(), // e.g. "2.1.1"
  }),
  execute: async function(this: PageAgentCore, input) {
    const state = await this.pageController.getBrowserState()
    const pageText = state.pageContent || ''
    // 验证逻辑...
    return pass/fail result with WCAG criterion reference
  },
})

// 键盘可达性检测
const checkKeyboardNav = tool({
  description: 'Verify all interactive elements reachable via Tab',
  inputSchema: z.object({}),
  execute: async function(this: PageAgentCore) {
    const state = await this.pageController.getBrowserState()
    // 检查 tabindex, aria-hidden, selectorMap...
    return unreachable elements list
  },
})

// aria-live 区域检测
const checkAriaLive = tool({
  description: 'Check if dynamic content has aria-live announcements',
  inputSchema: z.object({}),
  execute: async function(this: PageAgentCore) {
    // 用 execute_javascript 检查 aria-live 属性
  },
})
```

### 4.3 Agent 配置

```javascript
const auditAgent = new PageAgent({
  model: 'qwen3.5-plus',
  baseURL: 'https://customer-own-endpoint.example.com/v1',  // BYOLLM
  apiKey: 'CUSTOMER_KEY',
  language: 'en-US',
  
  customTools: {
    assert: assertTool,
    check_keyboard_nav: checkKeyboardNav,
    check_aria_live: checkAriaLive,
  },
  
  instructions: {
    system: `You are an EN 301 549 / WCAG 2.1 AA accessibility auditor.
For each page:
1. Run check_keyboard_nav to verify keyboard accessibility
2. Tab through interactive elements, verify focus order
3. Open/close modals, check focus management
4. Test form submissions, verify error announcements
5. Use assert to verify each WCAG criterion
6. Report violations with WCAG success criterion numbers`,
    
    getPageInstructions: (url) => {
      if (url.includes('/checkout')) 
        return 'Focus on payment flow: keyboard navigation, focus management, error handling'
      if (url.includes('/login')) 
        return 'Focus on form labels, error messages, screen reader compatibility'
      return 'General WCAG 2.1 AA compliance audit'
    },
  },
  
  transformPageContent: async (content) => {
    // 屏蔽动态数据（时间戳、随机ID）
    let transformed = content
      .replace(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/g, '[TIMESTAMP]')
      .replace(/1[3-9]\d{9}/g, '[PHONE]')
    transformed += '\n\n[Audit Context: EN 301 549 / WCAG 2.1 AA]'
    return transformed
  },
  
  onBeforeTask: (agent) => { report.startTime = Date.now() },
  
  onAfterStep: (agent, history) => {
    const last = history[history.length - 1]
    if (last.type === 'step') report.steps.push(last)
  },
  
  onAfterTask: (agent, result) => {
    report.success = result.success
    report.endTime = Date.now()
    generateEN301549Report(report)
  },
})
```

---

## 五、定价模型

### 5.1 核心定价逻辑：按审计消耗量计费

基于单位经济模型重新设计，确保各层级毛利率为正。核心计费单元为"审计积分"，不同类型的审计消耗不同积分：

| 审计类型 | 积分消耗 | 单次成本估算 | 定价倍率 |
|---------|---------|-------------|---------|
| 静态扫描（axe-core） | 1 积分/页面 | €0.05 | 20x → €1/积分 |
| 行为级测试（8 场景） | 8 积分/页面 | €0.80 | 12.5x → €1/积分 |
| 跨页面旅程审计 | 10 积分/旅程 | €1.00 | 10x → €1/积分 |
| EN 301 549 报告生成 | 5 积分/报告 | €0.20 | 10x → €1/积分 |

**成本测算假设**（基于 GPT-4o-mini API 价格 $0.15/1M 输入 + $0.60/1M 输出）：
- 单次行为测试约消耗 10K 输入 + 2K 输出 Token
- 8 场景 × 12K Token = ~96K Token/页面
- Token 成本：(96K × $0.15/1M) + (19.2K × $0.60/1M) = ~$0.03

### 5.2 定价层级

| 层级 | 价格 | 包含积分 | 适用场景 | 毛利率 |
|------|------|---------|---------|--------|
| **Free Scan** | €0 | 10 积分 | 1 URL 静态 + 1 交互流程，基础报告 | -（获客成本） |
| **Starter** | €99/月 | 100 积分 | ≤10 URL，静态扫描 + 基础行为测试，PDF 报告 | ~65% |
| **Pro** | €299/月 | 400 积分 | ≤50 URL，完整交互审计 + EN 301 549 报告，变化检测 | ~72% |
| **Business** | €799/月 | 1,200 积分 | ≤200 URL，持续监控 + 月度审计 + 合规评分，API 访问 | ~78% |
| **Enterprise** | 定制 | 按需购买 | 无限制，CI/CD 集成，VPAT/ACR 生成，多语言，SLA，专属客服 | ~80%+ |

### 5.3 积分购买规则

- **月订阅**：每月积分自动重置，未使用积分不结转
- **积分包**：可额外购买积分包（€100 = 100 积分），有效期 12 个月
- **企业预留**：Enterprise 客户可预购年度积分池，享受 15% 折扣

### 5.4 单位经济验证

基于**客户使用混合模型**计算：假设典型客户每月积分使用分布为 **60% 静态扫描 + 30% 行为测试 + 10% 报告生成**

| 审计类型 | 积分消耗 | 单位成本/积分 | 权重 | 加权成本/积分 |
|---------|---------|-------------|------|--------------|
| 静态扫描 | 1 积分/页面 | €0.05 | 60% | €0.030 |
| 行为测试 | 8 积分/页面 | €0.10 | 30% | €0.030 |
| 报告生成 | 5 积分/报告 | €0.04 | 10% | €0.004 |
| **加权平均** | | | **100%** | **€0.064** |

**各层级成本计算**：

| 层级 | 月收入 | 包含积分 | 加权成本/积分 | 月成本 | 毛利率 |
|------|-------|---------|-------------|-------|--------|
| Starter | €99 | 100 | €0.064 | €6.40 | 93.5% |
| Pro | €299 | 400 | €0.064 | €25.60 | 91.4% |
| Business | €799 | 1,200 | €0.064 | €76.80 | 90.4% |

**实际毛利率说明**：上述计算基于纯 LLM API 成本。考虑到基础设施成本（服务器、存储、带宽）约占收入的 10-15%，实际毛利率约为 **75-85%**。

### 5.5 竞品定价定位分析

AccessAudit 定价定位在"纯扫描工具"和"人工审计"之间的空白区域：

```
价格区间          产品类型               覆盖能力           AccessAudit 定位
─────────────────────────────────────────────────────────────────────────────
$0-$500/月        自动化扫描工具          30-40% WCAG       ← 我们的差异化
                  (axe DevTools, Siteimprove)              在扫描基础上增加
                                                         行为级测试
$1,000-$5,000/月  混合平台               85-90% WCAG       ← 对标区间
                  (Evinced, Level Access AMP)              我们的价格更具竞争力
$15,000-$50,000+  人工审计               90-95% WCAG       ← 我们的替代价值
                  (Level Access 全栈, 咨询公司)             自动化节省 60% 时间
```

**定价竞争力分析**：

| 维度 | AccessAudit | 扫描工具 (axe DevTools) | 混合平台 (Evinced) | 人工审计 |
|------|------------|------------------------|-------------------|---------|
| 价格 | €99-€799/月 | $4,000-40,000/年 | 定制报价 | $15K-50K/次 |
| 行为测试 | ✅ 8 场景 | ❌ | ✅ CV+ML | ✅ 人工 |
| 一行代码接入 | ✅ | ❌ (需CI/Playwright) | ❌ (需SDK) | ❌ |
| GDPR 本地化 | ✅ BYOLLM | ❌ | ❌ | 部分 |
| EN 301 549 报告 | ✅ | ❌ | 部分 | ✅ |

**为什么客户选择 AccessAudit**：
- 比扫描工具多检测 50%+ 的交互问题（键盘陷阱、焦点管理等）
- 比混合平台便宜 50%+，且无需 SDK 集成
- 比人工审计快 90%，成本仅为 1/10

### 5.6 渠道合作伙伴定价

合规咨询公司享受特殊定价：
- **铜牌**（年审计量 <500 页面）：€0.60/积分（40% 折扣），月度最低 €300
- **银牌**（年审计量 500-2,000 页面）：€0.45/积分（55% 折扣），月度最低 €800
- **金牌**（年审计量 >2,000 页面）：€0.30/积分（70% 折扣），月度最低 €2,000

咨询公司向终端客户收费：
- 单次完整审计（静态 + 行为）：€300-€500/页面
- VPAT/ACR 报告撰写：€2,000-€5,000/项目
- 人工复核服务：€150-€250/小时

---

## 六、销售策略

### 6.1 渠道合作伙伴（合规咨询公司）

- 提供"子弹"不是"枪"——工具平台赋能咨询公司，不替代他们
- 咨询公司用 AccessAudit 做自动化初筛 + 交互检测，节省 60% 人工时间
- 他们仍做 VPAT/ACR 撰写和人工复核
- 咨询公司付平台费 €500-2,000/月，向客户收 $3,000-10,000/审计

### 6.2 直销（企业 IT/法务）

目标客户:
| 行业 | 急迫性 | 付费能力 |
|------|--------|---------|
| 电商 | EAA 明确覆盖 | €10K-50K/年 |
| 银行 | EAA 覆盖 + 风险极高 | €50K+/年 |
| 交通 | EAA 覆盖 | €30K+/年 |
| SaaS（卖入欧洲） | 客户要求合规 | €10K-30K/年 |

营销策略:
1. **免费扫描引流**: audit.accessaudit.com → 50% 免费 + 50% "完整报告需付费"
2. **合规恐慌式营销**: "Your EAA compliance gap: 7 critical keyboard failures detected"
3. **EN 301 549 格式报告**: 欧洲客户认的格式
4. **持续监控订阅**: 年费模式，企业为持续合规付费意愿远高于一次性审计

### 6.3 政府采购框架

- 欧洲政府采购框架协议机制
- 需要: EN 301 549 自身合规 + ISO 27001 + 欧洲数据本地化
- 周期 6-18 个月，但入围后稳定现金流

---

## 七、欧洲市场资质认证清单

### 7.1 核心资质认证

进入欧洲市场并赢得企业客户信任，需获取以下核心资质认证：

| 认证 | 颁发机构 | 必要性 | 预计周期 | 预计成本 |
|------|---------|-------|---------|---------|
| **ISO 27001** | 国际标准化组织 | **必须** | 6-9 个月 | €15,000-€35,000 |
| **EN 301 549 自身合规认证** | ETSI / 认证机构 | **必须** | 3-6 个月 | €8,000-€15,000 |
| **GDPR 数据处理协议** | 内部 + DPO | **必须** | 1-2 个月 | €2,000-€5,000 |
| **SOC 2 Type II** | AICPA | 强烈建议 | 4-6 个月 | €10,000-€25,000 |
| **Cyber Essentials** | NCSC（英国） | 推荐 | 1-2 个月 | €1,500-€3,000 |

### 7.2 ISO 27001 认证详解

#### 认证流程
```
阶段1：规划与准备（1-2个月）
├── 确定认证范围
├── 任命信息安全负责人
├── 进行差距分析
└── 制定实施计划

阶段2：体系建立（2-3个月）
├── 编写 ISMS 文档（安全方针、风险评估、控制措施）
├── 实施技术控制（访问控制、加密、备份）
├── 实施管理控制（培训、事件响应、变更管理）
└── 建立监控与审计机制

阶段3：体系运行（3个月）
├── 试运行 ISMS
├── 收集运行记录（日志、审计报告、培训记录）
├── 开展内部审核
└── 管理评审

阶段4：认证审核（1-2个月）
├── Stage 1：文档审核（远程）
├── Stage 2：现场审核
├── 整改不符合项
└── 获取证书
```

#### 核心控制措施（ISO 27001:2022 Annex A）

| 控制领域 | 关键要求 | 实施要点 |
|---------|---------|---------|
| **A.5 信息安全方针** | 制定并发布信息安全方针 | 高层承诺，全员知晓 |
| **A.6 组织信息安全** | 信息安全角色与职责 | 明确责任人，划分职责 |
| **A.7 人力资源安全** | 入职/在职/离职安全管理 | 背景调查，保密协议，离职流程 |
| **A.8 资产管理** | 资产清单与分类 | 资产登记，分级管理 |
| **A.9 访问控制** | 权限管理与身份认证 | 最小权限，MFA，定期审核 |
| **A.10 密码学** | 加密与密钥管理 | TLS 1.3，AES-256，密钥轮换 |
| **A.11 物理与环境安全** | 数据中心安全 | 门禁，监控，防火防水 |
| **A.12 操作安全** | 系统运行与维护 | 变更管理，备份恢复，日志管理 |
| **A.13 通信安全** | 网络安全与监控 | 防火墙，入侵检测，流量监控 |
| **A.14 系统获取、开发与维护** | 安全开发生命周期 | 安全编码，渗透测试，代码审查 |
| **A.15 供应商关系** | 第三方风险管控 | 供应商评估，合同条款，SLA |
| **A.16 信息安全事件管理** | 事件响应与处置 | 事件分类，响应流程，事后复盘 |
| **A.17 业务连续性** | 灾难恢复与业务持续 | BC计划，RTO/RPO，演练 |
| **A.18 符合性** | 法规与标准合规 | GDPR，EN 301 549，定期合规评估 |

#### 成本明细

| 费用项 | 金额范围 | 说明 |
|--------|---------|------|
| 咨询顾问费 | €8,000-€20,000 | 协助建立 ISMS 和文档 |
| 审计费用（Stage 1） | €3,000-€8,000 | 文档审核 |
| 审计费用（Stage 2） | €5,000-€17,000 | 现场审核 |
| 内部资源投入 | €5,000-€15,000 | 员工时间成本 |
| 年度监督审核 | €5,000-€12,000/年 | 维持证书有效性 |
| **总计（首年）** | **€15,000-€35,000** | |

### 7.3 EN 301 549 自身合规认证详解

#### 认证流程
```
阶段1：标准理解（2-4周）
├── 学习 EN 301 549 V3.2.1 / V4.1.0 标准
├── 确定产品适用范围（Web 应用）
└── 识别适用条款

阶段2：合规整改（4-8周）
├── 对 AccessAudit 产品进行无障碍改造
├── 修复内部无障碍问题
├── 确保产品自身符合 WCAG 2.1 AA
└── 准备测试用例

阶段3：测试与验证（2-4周）
├── 自动化扫描（axe-core）
├── 人工测试（键盘导航、屏幕阅读器）
├── 获取第三方测试报告
└── 编写 ACR（Accessibility Conformance Report）

阶段4：认证审核（1-2个月）
├── 选择 ETSI 认可的认证机构
├── 提交 ACR 和测试证据
├── 审核员现场/远程审核
└── 获取 EN 301 549 合规声明
```

#### EN 301 549 标准核心要求（针对 Web 应用）

| 章节 | 内容 | 关键要点 |
|------|------|---------|
| **第9章 Web 内容** | WCAG 2.1 AA 全部要求 | 感知性、可操作性、可理解性、健壮性 |
| **第11章 软件** | 软件无障碍要求 | 键盘操作、辅助技术兼容、API 可访问性 |
| **第12章 文档与支持** | 无障碍文档与支持服务 | 帮助文档无障碍，客服支持无障碍 |

#### 产品自身合规改造要点

- **键盘导航**：所有功能可通过键盘操作
- **屏幕阅读器兼容**：正确使用 ARIA 属性，语义化 HTML
- **颜色对比度**：文本与背景对比度 ≥ 4.5:1
- **焦点管理**：焦点可见，Tab 顺序合理
- **表单标签**：所有表单字段有正确的 label 关联
- **错误处理**：错误消息清晰，可被屏幕阅读器读取

### 7.4 GDPR 合规要求

#### 核心要求
| 要求 | 实施要点 |
|------|---------|
| **数据处理协议** | 与客户签署 DPA，明确数据处理条款 |
| **DPO 任命** | 任命数据保护官（可外包） |
| **数据保护影响评估（DPIA）** | 对高风险处理活动进行 DPIA |
| **隐私政策** | 公开透明的隐私政策，说明数据处理方式 |
| **数据主体权利** | 支持访问、更正、删除、数据可携权 |
| **数据泄露通知** | 72小时内报告监管机构 |
| **数据本地化** | 提供 BYOLLM 选项，数据不出客户环境 |

#### 关键文档
- GDPR 数据处理协议（DPA）模板
- 隐私政策
- Cookie 政策（如适用）
- 数据保留政策
- 数据泄露响应流程

### 7.5 SOC 2 Type II 认证（强烈建议）

#### 信任原则
| 原则 | 说明 |
|------|------|
| **安全性** | 保护系统免受未经授权的访问 |
| **可用性** | 确保系统在承诺的时间内可用 |
| **处理完整性** | 确保处理过程完整、准确、及时 |
| **保密性** | 保护敏感信息不被泄露 |
| **隐私性** | 保护个人信息的收集、使用、存储 |

#### 预计成本：€10,000-€25,000，周期：4-6个月

### 7.6 认证优先级建议

```
时间线：0-3个月                    3-6个月                    6-9个月
┌─────────────────────────┐ ┌─────────────────────────┐ ┌─────────────────────────┐
│ • GDPR 合规基础         │ │ • ISO 27001 体系建立     │ │ • ISO 27001 认证审核    │
│ • DPO 任命             │ │ • EN 301 549 自身整改    │ │ • SOC 2 Type II 认证    │
│ • DPIA 完成            │ │ • 内部审核               │ │ • 年度监督审核准备      │
│ • 隐私政策发布         │ │ • Stage 1 文档审核       │ │ • 政府采购框架申请      │
└─────────────────────────┘ └─────────────────────────┘ └─────────────────────────┘
```

### 7.7 认证投资回报

| 认证 | 商业价值 |
|------|---------|
| ISO 27001 | 企业客户信任基础，政府采购必要条件 |
| EN 301 549 | 证明产品自身合规，增强客户信心 |
| GDPR | 满足欧洲数据保护要求，消除客户顾虑 |
| SOC 2 | 北美企业客户认可，拓展市场范围 |

**总投资（首年）**：约 €35,000-€75,000  
**预期回报**：企业客户成单率提升 30-50%，政府框架入围资格

---

## 八、风险与合规红线

| 风险 | 应对 |
|------|------|
| **绝对不声称"一键合规"** | 定位为"交互式功能检测工具"，合规判断由人工专家最终确认 |
| **GDPR 数据隐私** | 支持 BYOLLM + 本地部署，transformPageContent 屏蔽敏感字段 |
| **不能替代人工审计** | 市场共识是自动化只能检测 25-30%。定位是增量价值: 覆盖扫描工具无法检测的交互问题 |
| **accessiBe 前车之鉴** | FTC 罚款 $1M 禁止声称合规。所有营销文案必须标注 "Automated detection tool, not a compliance guarantee" |
| **LLM 不稳定性** | 对关键断言同时用规则引擎（axe-core）+ LLM Agent 双重验证 |

---

## 九、30 天市场验证期计划

本阶段目标：验证产品市场契合度（PMF），而非创收。核心指标是 pilot 完成率、准确率对比结果和定价反馈。

| 周 | 动作 | 验证目标 |
|----|------|---------|
| W1 | 构建免费扫描网站: 1 URL → 静态 + 1 关键流程检测 | 验证用户注册流程转化率 >15% |
| W2 | 开发 EN 301 549 报告生成器; 对接 3 家欧洲合规咨询公司做 pilot | 验证报告格式被咨询公司认可 |
| W3 | 合规营销内容（EAA 罚款案例、行业风险分析），LinkedIn 投放 | 验证内容点击率 >2% |
| W4 | 完成 5 家 pilot 客户审计; 与人工审计结果对比验证准确率; 收集定价反馈 | 验证准确率 ≥80%，定价接受度 >70% |

**验证期成功标准**：
- 5 家 pilot 客户完成率 ≥80%（4/5）
- 审计准确率对比人工审计 ≥85%
- 定价反馈：70%+ 客户认为价格合理或偏低
- 免费扫描注册用户 ≥100

---

## 十、成功指标

| 指标 | 6 个月目标 | 说明 |
|------|----------|------|
| 免费扫描用户 | 1,000+ | 按审计积分模式，免费额度 10 积分/用户 |
| 付费客户 | 15+ | Starter 5 家 + Pro 8 家 + Business 2 家 |
| 渠道合作伙伴 | 5 家合规咨询公司 | 铜牌 3 家 + 银牌 2 家 |
| 审计报告准确率（vs 人工审计对照） | ≥85% | 规则引擎兜底确保关键断言准确率 ≥95% |
| NPS | ≥45 | 提升客户满意度目标 |
| MRR | €8,000+ | Starter €495 + Pro €2,392 + Business €1,598 + 渠道 €3,500 |
| ISO 27001 认证进度 | 完成 Stage 1 审核 | 进入认证流程 |
| EN 301 549 自身合规 | 完成产品整改 | 提交 ACR 草案 |

**MRR 达成路径**：
- Starter: 5 家 × €99 = €495
- Pro: 8 家 × €299 = €2,392
- Business: 2 家 × €799 = €1,598
- 渠道合作伙伴: 5 家 × €700 平均 = €3,500
- **总计**: ~€8,000

---

这份 PRD 已更新，涵盖以下关键改进：

1. **定价模型重构**：采用按审计消耗量计费（审计积分模式），确保各层级毛利率为正（65%-80%+）
2. **规则引擎兜底逻辑**：为 8 个核心行为测试场景定义了确定性规则引擎验证，确保合规审计结果的可复现性
3. **欧洲市场资质认证清单**：详细梳理了 ISO 27001、EN 301 549、GDPR 等认证要求、流程和成本

如需调整某个章节的细节或者补充更多内容，随时说。