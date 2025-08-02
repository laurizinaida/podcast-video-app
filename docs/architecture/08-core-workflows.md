## **第八部分：核心工作流 (Core Workflows)**

### **核心工作流 1 (深化): 用户认证与会话管理**

此流程详细描述了用户如何登录、系统如何管理会话，以及如何访问受保护的资源。

```mermaid
sequenceDiagram
    participant User as 用户
    participant FE as 前端 (Next.js)
    participant AuthStore as Zustand状态
    participant AuthService as API服务层
    participant BE as 后端 (NextAuth.js API)
    participant Browser as 浏览器

    User->>FE: 1. 输入邮箱和密码，点击登录
    FE->>AuthStore: 2. 调用 login(email, password)
    AuthStore->>AuthService: 3. 调用 login(credentials)
    AuthService->>BE: 4. POST /api/auth/callback/credentials
    BE->>BE: 5. 验证凭据，成功后生成会话
    BE-->>Browser: 6. 返回 200 OK 并携带 Set-Cookie 头
    Browser->>Browser: 7. 自动存储 HttpOnly, Secure 会话Cookie
    Browser-->>AuthService: 8. fetch 调用成功返回
    AuthService-->>AuthStore: 9. 返回用户信息
    AuthStore->>AuthStore: 10. 更新状态 { status: 'authenticated', user: {...} }
    AuthStore-->>FE: 11. 状态更新，UI重渲染 (显示欢迎信息)
    User->>FE: 12. 导航至 /dashboard (受保护页面)
    Browser->>BE: 13. 发起页面请求
    BE->>BE: 14. Next.js Middleware 运行，验证会话Cookie
    Note over BE: Cookie有效，允许访问
    BE-->>Browser: 15. 返回受保护页面内容
```

### **核心工作流 2: 创建并渲染一个新视频**

```mermaid
sequenceDiagram
    participant User as 用户
    participant FE as 前端应用
    participant BE as 后端服务 (Worker)
    participant R2 as 对象存储
    participant DB as 数据库
    participant Renderer as 渲染服务

    User->>+FE: 1. 选择音频文件
    FE->>+BE: 2. 请求上传URL
    BE->>-FE: 3. 返回预签名URL
    User->>+R2: 4. 直接上传音频文件
    User->>+FE: 5. 确认上传并创建项目
    FE->>+BE: 6. 创建项目记录
    loop 用户设计阶段
        User->>FE: 在编辑器中进行设计
        FE->>BE: 保存designState
    end
    User->>+FE: 8. 点击 "生成视频"
    FE->>+BE: 9. 发起渲染请求
    BE->>+Renderer: 10. 调用渲染API
    Renderer-->>-BE: 11. 立即确认收到任务
    par 并行处理
        FE->>User: 显示渲染进度页面
    and
        Renderer->>Renderer: 14. 执行视频处理 (FFmpeg)
        Renderer->>+R2: 15. 上传最终视频成品
        Renderer->>+BE: 16. 任务完成通知
    end
```

### **核心工作流 3: 云端到本地的异步任务处理模式**

**原则:** 云端Worker与本地渲染器之间的通信**必须**采用异步回调机制，严禁云端服务直接同步等待本地服务的处理结果。

**实现流程:**

1. **暴露本地服务:** 开发者**必须**使用`cloudflared tunnel`或`ngrok`等工具，为本地运行的渲染服务（Flask API）创建一个临时的、安全的公共URL。这个URL需要配置为后端的环境变量 `RENDERER_API_ENDPOINT`。
2. **任务分派 (Worker -\> Renderer):**
   * 当用户触发渲染时，云端Worker向 `RENDERER_API_ENDPOINT` 发送一个 `POST` 请求。
   * 请求体中包含任务ID、设计方案JSON、以及所有素材在R2中的路径。
   * 本地渲染服务收到请求后，**立即**将任务加入内部队列，并返回`202 Accepted`响应，表示“任务已收到，正在排队处理”。云端Worker的本次请求生命周期至此结束。
3. **任务回调 (Renderer -\> Worker):**
   * 本地渲染器在后台完成视频处理和上传后，**必须**向云端Worker的一个专用回调API（例如 `/api/projects/render-callback`）发起一个`POST`请求。
   * 该请求需要携带任务ID、最终状态（成功/失败）以及（如果成功）生成的视频在R2中的路径。
   * 这个回调API需要一个内部密钥进行保护，防止被恶意调用。
   * 云端Worker收到回调后，更新数据库中对应项目的状态。

### **核心工作流 4: 完整的文件上传与确认流程**

```mermaid
sequenceDiagram
    participant User as 用户
    participant FE as 前端应用
    participant BE as 后端服务 (Worker)
    participant R2 as 对象存储
    participant DB as 数据库

    FE->>BE: 1. 请求预签名上传URL (携带文件名/类型)
    BE->>FE: 2. 返回 { uploadUrl, key }
    FE->>+R2: 3. 使用 uploadUrl 直接上传文件
    R2-->>-FE: 4. 上传成功，返回 200 OK
    FE->>BE: 5. **(关键步骤)** 调用新API确认上传 (携带key, 文件名, 大小等元数据)
    BE->>DB: 6. 在 Assets 表中创建记录
    DB-->>BE: 7. 记录创建成功
    BE-->>FE: 8. 返回最终的Asset对象
```