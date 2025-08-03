## **第十三部分：开发工作流 (Development Workflow)**

### **本地开发设置 (Local Development Setup)**

#### **先决条件 (Prerequisites)**

```bash
# 软件:
- Node.js (~20.x)
- pnpm (~9.x)
- Python (~3.11)
- FFmpeg
- (推荐) 内网穿透工具，如 ngrok 或 cloudflared tunnel
- Cloudflare CLI (wrangler)
```

#### **初次安装 (Initial Setup)**

```bash
git clone [repository_url]
cd podcast-video-app
pnpm install
pip install -r apps/renderer/requirements.txt
cp .env.example .env
# ... 然后根据.env.example的指示，填写所有必需的密钥和URL
```

#### **本地环境绑定配置 (`wrangler.toml`) (Local Environment Binding Configuration)**

为了在本地开发时模拟Cloudflare的D1和R2绑定，您**必须**在项目根目录创建一个`wrangler.toml`文件。此文件不应包含任何敏感密钥，只用于声明本地开发所需的资源绑定。

**`wrangler.toml` 示例:**

```toml
name = "podcast-video-app" # 与您的应用名称匹配
compatibility_date = "2025-08-01" # 使用一个近期的日期

# 本地开发时 D1 数据库的绑定声明
[[d1_databases]]
binding = "DB" # 这必须与代码中 env.DB 的名称匹配
database_name = "podcast-video-db"
database_id = "your-local-preview-db-id" # 运行 npx wrangler d1 create <db_name> 获取
preview_database_id = "your-local-preview-db-id"

# 本地开发时 R2 存储桶的绑定声明
[[r2_buckets]]
binding = "ASSETS" # 这必须与代码中 env.ASSETS 的名称匹配
bucket_name = "podcast-video-assets"
preview_bucket_name = "podcast-video-assets-preview" # 运行 npx wrangler r2 bucket create <bucket_name> 获取
```

**注意：** 生产环境的绑定将通过Cloudflare Pages的网页控制台进行配置，并会覆盖此文件中的设置。

#### **开发命令 (Development Commands)**

```bash
# 启动所有Web服务 (前端 + 后端Worker)
pnpm dev
# 独立启动Python渲染服务
python apps/renderer/api.py
```

### **环境变量配置 (Environment Configuration)**

#### **安全说明：环境变量的隔离机制**

**核心安全原则：** Next.js通过变量前缀来区分服务器端和客户端环境变量，以确保后端密钥的绝对安全。

* **服务器端私有变量 (例如 `DATABASE_URL`, `AUTH_SECRET`):**
  * **命名:** 无特殊前缀。
  * **安全:** **绝不**会暴露给客户端。只能在API路由等服务器端代码中通过`process.env`访问。
* **客户端公开变量 (例如 `NEXT_PUBLIC_WEBSITE_URL`):**
  * **命名:** **必须**以`NEXT_PUBLIC_`作为前缀。
  * **安全:** 会被内联到浏览器代码中，**完全公开**。

**强制性规定：严禁将任何密钥、密码或敏感凭证存放在以`NEXT_PUBLIC_`为前缀的环境变量中。**

* **后端Worker (`apps/web/.env`):**
  * `DATABASE_URL`: Cloudflare D1的连接信息。
  * `R2_BUCKET_NAME`: Cloudflare R2存储桶名称。
  * `GOOGLE_CLIENT_ID` / `SECRET`: Google登录凭证。
  * `AUTH_SECRET`: Auth.js的会话密钥。
  * `RENDERER_API_ENDPOINT`: 暴露给公网的本地渲染服务URL。
* **渲染服务 (`apps/renderer/.env`):**
  * `R2_ACCOUNT_ID` / `ACCESS_KEY_ID` / `SECRET_ACCESS_KEY`: R2的API访问凭证。
  * `CALLBACK_API_ENDPOINT`: 用于状态回传的后端Worker URL。

***
