## **第十三部分：统一的项目结构 (Unified Project Structure)**

```plaintext
podcast-video-app/
├── apps/
│   ├── web/        # 前端Next.js应用
│   ├── api/        # 后端Cloudflare Worker应用 (逻辑代码)
│   └── renderer/   # 独立视频渲染应用 (Python)
├── packages/
│   ├── shared/     # 前后端共享的代码 (特别是TypeScript类型)
│   └── config/     # 共享的配置文件 (ESLint, TypeScript)
├── docs/
├── package.json
└── turbo.json
```

#### **架构说明：逻辑分离与部署统一**
 
必须理解，`apps/web`和`apps/api`的目录分离是一种**代码组织上的逻辑分离**，旨在提升开发过程中的模块化和清晰度。在**部署时**，它们被Next.js的构建流程统一处理：

* **`apps/web`** 中的代码构成了用户浏览器下载的**客户端**。
* **`apps/api`** 中的代码则被编译为在**Cloudflare Workers**上运行的**服务端边缘函数**。
因此，它们在生产环境中共同构成了一个**单一、完整的、一体化的应用**，而不是两个需要通过公网进行通信的独立服务。