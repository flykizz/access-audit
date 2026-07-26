# AccessAudit 扩展 CI/CD 自动发布指南

## 整体流程

```
push tag (v1.0.0) → GitHub Actions 触发 → 构建扩展 → 打包 zip → 上传 Chrome Web Store → 自动发布
```

## 前置条件（一次性配置）

### 1. 注册 Chrome Web Store 开发者账号

- 访问 [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
- 支付一次性 $5 注册费
- 完成身份验证（1-3 个工作日）
- **首次必须手动上传发布一次**（API 只能更新已有扩展，不能创建新扩展）

### 2. 获取 Extension ID

在 Developer Dashboard 中找到你的扩展，URL 中的 32 字符字符串就是 Extension ID：
```
https://chrome.google.com/webstore/devconsole/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
                                              ↑ 这就是 Extension ID
```

### 3. 创建 Google Cloud OAuth 凭据

#### 3.1 启用 Chrome Web Store API

1. 打开 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目（如 `accessaudit-publish`）
3. 进入 **APIs & Services** → **Library**
4. 搜索 `Chrome Web Store API` 并启用

#### 3.2 配置 OAuth 同意屏幕

1. 进入 **APIs & Services** → **OAuth consent screen**
2. 选择 **External**，填写应用名称等必填项
3. 添加你的 Google 账号为 **Test user**

#### 3.3 创建 OAuth Client ID

1. 进入 **APIs & Services** → **Credentials**
2. **Create Credentials** → **OAuth client ID**
3. 类型选择 **Desktop app**
4. 创建后记录 **Client ID** 和 **Client Secret**

#### 3.4 生成 Refresh Token

在终端运行：

```bash
npx chrome-webstore-upload-keys
```

按提示输入 Client ID 和 Client Secret，浏览器会打开授权页面，授权后终端会输出 **Refresh Token**。

### 4. 配置 GitHub Secrets

在 GitHub 仓库 → **Settings** → **Secrets and variables** → **Actions** 中添加以下 4 个 Secret：

| Secret 名称 | 值 |
|-------------|---|
| `CWS_EXTENSION_ID` | 你的 Extension ID（32字符） |
| `CWS_CLIENT_ID` | Google Cloud OAuth Client ID |
| `CWS_CLIENT_SECRET` | Google Cloud OAuth Client Secret |
| `CWS_REFRESH_TOKEN` | OAuth Refresh Token |

## 使用方式

### 自动发布（推荐）

```bash
# 1. 更新 package.json 版本号
cd packages/browser-extension
npm version patch  # 1.0.0 → 1.0.1（minor/major 可选）

# 2. 推送 tag 触发发布
git push origin main --tags
```

GitHub Actions 会自动：
1. 构建扩展
2. 打包为 zip
3. 上传到 Chrome Web Store
4. 提交审核并发布

### 手动触发

在 GitHub 仓库 → **Actions** → **Publish Extension** → **Run workflow** 手动触发。

## 注意事项

- **版本号必须递增**：Chrome Web Store API 会拒绝相同或更低版本号的上传
- **manifest.json 的 version 必须与 tag 一致**：工作流会自动从 package.json 同步版本号
- **审核时间**：首次审核 1-3 天，更新审核数小时到 1 天
- **Firefox 发布**：需额外配置 Mozilla AMO API（见 workflow 中的注释部分）
