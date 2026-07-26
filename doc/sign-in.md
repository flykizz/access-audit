Google和GitHub OAuth登录已经完整实现，Cloudflare作为反向代理的配置也已考虑在内。以下是实现总结：

## 后端实现

### 1. 安装依赖
安装了 `passport`, `@nestjs/passport`, `passport-google-oauth20`, `passport-github2` 等OAuth相关包。

### 2. 修改User实体
在 [user.entity.ts](file:///Users/wangfei/git/gitee/AccessAudit/packages/api/src/auth/user.entity.ts) 中添加了：
- `provider`: 认证方式 (email/google/github)
- `providerId`: OAuth平台的用户ID
- `avatarUrl`: 用户头像URL
- `password` 设为可空（OAuth用户不需要密码）

### 3. 创建Passport策略
- [google.strategy.ts](file:///Users/wangfei/git/gitee/AccessAudit/packages/api/src/auth/google.strategy.ts) - Google OAuth策略
- [github.strategy.ts](file:///Users/wangfei/git/gitee/AccessAudit/packages/api/src/auth/github.strategy.ts) - GitHub OAuth策略

### 4. 更新AuthService
添加了 `validateOAuthUser` 和 `loginOAuth` 方法处理OAuth用户验证和登录。

### 5. 更新AuthController
新增端点：
- `GET /auth/google` - 跳转到Google认证
- `GET /auth/google/callback` - Google回调处理
- `GET /auth/github` - 跳转到GitHub认证
- `GET /auth/github/callback` - GitHub回调处理

### 6. 更新AuthModule
注册Passport模块和两个OAuth策略。

## 前端实现

### 1. 修改Login和Signup组件
为Google和GitHub按钮添加了 `onClick` 事件，跳转到后端OAuth端点。

### 2. 创建OAuth回调页面
[OAuthCallback.tsx](file:///Users/wangfei/git/gitee/AccessAudit/packages/web/src/components/OAuthCallback.tsx) 处理OAuth回调，提取token并保存到localStorage，然后跳转首页。

### 3. 更新路由配置
添加 `/auth/callback` 路由。

## Cloudflare反向代理配置

当使用Cloudflare作为反向代理时，需要注意：

### 1. Cloudflare DNS配置
- 将域名DNS指向你的服务器IP
- 确保启用Proxy状态（橙色云图标）

### 2. SSL/TLS配置
- 设置SSL/TLS加密模式为"完整"或"严格"
- 确保后端配置了有效的SSL证书

### 3. OAuth回调URL配置
在Google Cloud Console和GitHub Developer Settings中，回调URL需要使用Cloudflare域名：
```
https://your-domain.com/auth/google/callback
https://your-domain.com/auth/github/callback
```

### 4. 环境变量配置
在 `.env` 文件中更新：
```
GOOGLE_CALLBACK_URL=https://your-domain.com/auth/google/callback
GITHUB_CALLBACK_URL=https://your-domain.com/auth/github/callback
FRONTEND_URL=https://your-domain.com
```

### 5. Cloudflare WAF规则（可选）
如果启用了WAF，确保允许OAuth回调路径 `/auth/*/callback` 的请求。

## 需要你手动完成的配置

### Google OAuth配置
1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建项目 → 搜索"OAuth consent screen" → 配置应用信息
3. 创建凭据 → OAuth客户端ID → 选择Web应用
4. 配置授权重定向URL：`http://localhost:3000/auth/google/callback`（开发环境）和生产环境URL
5. 获取Client ID和Client Secret，填入 `.env` 文件

### GitHub OAuth配置
1. 访问 [GitHub Developer Settings](https://github.com/settings/developers)
2. 创建OAuth App → 配置应用信息
3. 配置Authorization callback URL：`http://localhost:3000/auth/github/callback`（开发环境）和生产环境URL
4. 获取Client ID和Client Secret，填入 `.env` 文件

两个包均已构建成功，可以正常运行！