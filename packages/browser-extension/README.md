# AccessAudit 浏览器扩展

基于 WXT 框架的多浏览器无障碍检测扩展，参考 alibaba/page-agent 架构设计，支持 Chrome、Firefox、Edge。

## 架构

### 技术栈
- **WXT 0.19** - 浏览器扩展开发框架，自动多浏览器适配
- **React 18** - UI 组件
- **TypeScript** - 类型安全
- **原生 CSS** - 组件样式（CSS 变量 + .aa- 前缀类）

### 核心设计（继承自 page-agent）

| 特性 | 实现文件 |
|------|----------|
| WXT 框架 | [wxt.config.ts](file:///Users/wangfei/git/gitee/AccessAudit/packages/browser-extension/wxt.config.ts) |
| Stateless Service Worker | [background.ts](file:///Users/wangfei/git/gitee/AccessAudit/packages/browser-extension/src/entrypoints/background.ts) |
| Main World Script 桥接 | [main-world.ts](file:///Users/wangfei/git/gitee/AccessAudit/packages/browser-extension/src/entrypoints/main-world.ts) |
| SidePanel 侧边栏 | [sidepanel/](file:///Users/wangfei/git/gitee/AccessAudit/packages/browser-extension/src/entrypoints/sidepanel) |
| TabController/PageController | [agent/](file:///Users/wangfei/git/gitee/AccessAudit/packages/browser-extension/src/agent) |
| 事件系统 | [event-bus.ts](file:///Users/wangfei/git/gitee/AccessAudit/packages/browser-extension/src/core/event-bus.ts) |
| 双向 Auth Token | [auth.ts](file:///Users/wangfei/git/gitee/AccessAudit/packages/browser-extension/src/core/auth.ts) |
| Externally Connectable | background.ts `onMessageExternal` |
| i18n 国际化 | [_locales/](file:///Users/wangfei/git/gitee/AccessAudit/packages/browser-extension/src/_locales) |

### 目录结构

```
browser-extension/
├── src/
│   ├── _locales/              # i18n 多语言（zh_CN, en）
│   ├── agent/                 # 控制器层
│   │   ├── TabsController.ts  # 标签页控制
│   │   └── PageController.ts  # 页面控制
│   ├── components/            # React 组件
│   │   ├── ui/                # 基础组件（Button, Input, Card...）
│   │   ├── ScoreCard.tsx      # 评分卡片
│   │   ├── ViolationList.tsx  # 违规列表
│   │   ├── ViolationDetail.tsx # 违规详情
│   │   ├── FilterTabs.tsx     # 筛选标签
│   │   └── AuthForm.tsx       # 认证表单
│   ├── core/                  # 核心共享模块（无状态）
│   │   ├── types.ts           # 类型定义
│   │   ├── storage.ts         # 存储管理
│   │   ├── auth.ts            # 认证管理
│   │   ├── scan-service.ts    # 扫描服务
│   │   ├── event-bus.ts       # 事件系统
│   │   ├── i18n.ts            # 国际化
│   │   └── utils.ts           # 工具函数
│   ├── entrypoints/           # WXT 入口点
│   │   ├── background.ts      # Stateless Service Worker
│   │   ├── content.ts         # Content Script（页面遮罩）
│   │   ├── main-world.ts      # Main World Script（页面主世界）
│   │   ├── sidepanel/         # SidePanel 侧边栏
│   │   └── popup/             # Popup 弹窗（登录入口）
│   ├── lib/utils.ts           # UI 工具函数
│   └── styles/globals.css     # 全局样式
├── wxt.config.ts              # WXT 配置
├── tsconfig.json
└── package.json
```

## 开发

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run dev          # Chrome
npm run dev:firefox  # Firefox
npm run dev:edge     # Edge
```

### 构建
```bash
npm run build          # Chrome
npm run build:firefox  # Firefox
npm run build:edge     # Edge
npm run build:all      # 全部
```

### 加载扩展

#### Chrome / Edge
1. 运行 `npm run build`
2. 打开 `chrome://extensions/`（Edge: `edge://extensions/`）
3. 开启「开发者模式」
4. 点击「加载已解压的扩展程序」
5. 选择 `.output/chrome-mv3` 目录

#### Firefox
1. 运行 `npm run build:firefox`
2. 打开 `about:debugging`
3. 点击「此 Firefox」→「临时载入附加组件」
4. 选择 `.output/firefox-mv2/manifest.json`

## 消息通信协议

### 内部消息（SidePanel/Popup → Background）

| 类型 | 说明 |
|------|------|
| `AA_GET_AUTH_STATUS` | 获取认证状态 |
| `AA_LOGIN` | 登录 |
| `AA_SIGNUP` | 注册 |
| `AA_LOGOUT` | 登出 |
| `AA_SCAN_CURRENT_PAGE` | 扫描当前页面 |
| `AA_GET_CURRENT_SCAN` | 获取扫描状态 |
| `AA_CANCEL_SCAN` | 取消扫描 |
| `AA_GET_RULES` | 获取检测规则 |
| `AA_GET_HISTORY` | 获取历史记录 |
| `AA_GENERATE_BRIDGE_TOKEN` | 生成桥接 Token |
| `TAB_CONTROL` | 标签页控制 |
| `PAGE_CONTROL` | 页面控制 |

### 外部消息（Web 应用 → 扩展）

| 类型 | 说明 |
|------|------|
| `AA_OPEN_SIDEPANEL` | 打开侧边栏 |
| `AA_TRIGGER_SCAN` | 触发扫描 |
| `AA_GET_SCAN_RESULT` | 获取扫描结果 |

### Content Script 消息（Background → Content）

| 类型 | 说明 |
|------|------|
| `AA_SCAN_RESULTS` | 扫描结果 |
| `AA_SHOW_OVERLAY` / `AA_HIDE_OVERLAY` / `AA_TOGGLE_OVERLAY` | 遮罩控制 |
| `AA_HIGHLIGHT_ELEMENT` | 高亮元素 |
| `AA_AUTH_CHANGED` | 认证变更 |
| `AA_STORAGE_CHANGED` | Storage 变更转发 |

## 无状态架构

所有状态通过 `chrome.storage.local` 持久化，Service Worker 不维护内存单例：
- 每次消息处理从 storage 拉取最新状态
- SidePanel 通过 `chrome.storage.onChanged` 监听变化（拉取模式）
- SW 被回收后可从 storage 完整恢复

## Main World 桥接

Content Script 运行在隔离世界，无法访问页面 JS 上下文。通过 `main-world.js` 注入页面主世界：
1. Background 生成 `AccessAuditBridgeToken` 存入 storage
2. Content Script 校验 token 匹配后注入 `main-world.js`
3. 通过 `window.postMessage` 双向通信
4. 暴露 `window.AccessAuditExt` 只读检测 API

## 许可证

MIT
