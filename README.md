# 智能化在线视频创作平台

将播客音频转化为动态视频的智能创作平台

## 项目概述

这是一个基于 Next.js 的全栈应用，使用 Monorepo 架构，部署在 Cloudflare Pages 上，旨在为用户提供智能的音频到视频转换服务。

## 技术栈

### 前端
- **Next.js 15** - React 框架
- **TypeScript** - 类型安全
- **Tailwind CSS** - 样式框架
- **Radix UI** - 组件库
- **NextAuth.js** - 身份认证

### 后端
- **Next.js API Routes** - 服务端 API
- **Cloudflare D1** - 数据库
- **bcrypt** - 密码加密
- **Zod** - 数据验证

### 部署平台
- **Cloudflare Pages** - 前端部署
- **Cloudflare Workers** - 服务端运行时
- **Cloudflare D1** - 数据库服务

### 开发工具
- **TurboRepo** - Monorepo 管理
- **pnpm** - 包管理器
- **Playwright** - E2E 测试
- **Vitest** - 单元测试

## 项目结构

```
podcast-video-app/
├── apps/
│   └── web/          # Next.js 全栈应用
├── packages/
│   ├── shared/       # 共享类型和工具
│   └── config/       # 共享配置
├── tests/
│   └── e2e/          # E2E 测试
└── docs/             # 项目文档
```

## 快速开始

### 环境要求
- Node.js 18+
- pnpm 8+

### 安装依赖
```bash
pnpm install
```

### 环境配置
1. 复制环境变量文件：
```bash
cp apps/web/.env.local.example apps/web/.env.local
cp apps/api/.env.example apps/api/.env
```

2. 根据需要修改环境变量

### 开发模式
```bash
# 使用 Cloudflare Wrangler 启动开发服务器
pnpm dev:wrangler    # 全栈应用 (http://localhost:3000)

# 或使用标准 Next.js 开发模式（不包含 Cloudflare 功能）
pnpm dev:web         # 仅前端开发 (http://localhost:3000)
```

### 构建
```bash
pnpm build
```

### 测试
```bash
# 运行所有测试
pnpm test

# 运行 E2E 测试
pnpm test:e2e
```

## 功能特性

### 已实现 (v1.1)
- ✅ 项目初始化与 Monorepo 结构
- ✅ 用户注册和登录
- ✅ 基础 UI 组件
- ✅ 数据库设置
- ✅ API 路由
- ✅ 测试框架

### 计划中
- 🔄 音频文件上传
- 🔄 AI 音频分析
- 🔄 视频生成
- 🔄 编辑器界面
- 🔄 多平台发布

## 开发指南

### 代码规范
- 使用 TypeScript 进行类型检查
- 遵循 ESLint 规则
- 使用 Prettier 格式化代码

### 提交规范
- 使用语义化提交信息
- 每个功能使用独立分支开发

### 测试策略
- 单元测试：组件和工具函数
- 集成测试：API 端点
- E2E 测试：用户流程

## 部署

### 开发环境
```bash
pnpm dev
```

### 生产环境
```bash
pnpm build
pnpm start
```

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证

MIT License

## 联系方式

如有问题或建议，请创建 Issue 或联系开发团队。
