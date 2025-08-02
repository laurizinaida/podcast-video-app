## **第十四部分：开发工作流 (Development Workflow)**

### **本地开发设置 (Local Development Setup)**

* **先决条件:** 在开始之前，请确保您的开发环境中已安装以下工具：
  
  ```bash
  # 软件:
  - Node.js (~20.x)
  - pnpm (~9.x)
  - Python (~3.11)
  - FFmpeg
  - (推荐) 内网穿透工具，如 ngrok 或 cloudflared tunnel
  - Cloudflare CLI (wrangler)
  ```

* **初次安装:**
  
  ```bash
  git clone [repository_url]
  cd podcast-video-app
  pnpm install
  pip install -r apps/renderer/requirements.txt
  cp .env.example .env
  # ... 然后根据.env.example的指示，填写所有必需的密钥和URL
  ```

* **开发命令:**
  
  ```bash
  # 启动所有Web服务 (前端 + 后端Worker)
  pnpm dev
  # 独立启动Python渲染服务
  python apps/renderer/api.py
  ```

### **环境变量配置 (Environment Configuration)**

* **后端Worker (`apps/api/.env`):**
  * `DATABASE_URL`: Cloudflare D1的连接信息。
  * `R2_BUCKET_NAME`: Cloudflare R2存储桶名称。
  * `GOOGLE_CLIENT_ID` / `SECRET`: Google登录凭证。
  * `AUTH_SECRET`: Auth.js的会话密钥��
  * `RENDERER_API_ENDPOINT`: 暴露给公网的本地渲染服务URL。
* **渲染服务 (`apps/renderer/.env`):**
  * `R2_ACCOUNT_ID` / `ACCESS_KEY_ID` / `SECRET_ACCESS_KEY`: R2的API访问凭证。
  * `CALLBACK_API_ENDPOINT`: 用于状态回传的后端Worker URL。