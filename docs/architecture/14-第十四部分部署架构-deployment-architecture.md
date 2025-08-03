## **第十四部分：部署架构 (Deployment Architecture)**

### **部署策略 (Deployment Strategy)**

* **Next.js全栈应用 (`apps/web`):** 通过CI/CD流程，自动部署到 **Cloudflare Pages**。
* **渲染服务 (`apps/renderer`):** MVP阶段**不进行云端部署**，在本地手动运行。

### **CI/CD 流水线 (CI/CD Pipeline)**

我们将使用**GitHub Actions**。流水线将在代码合并到`main`分支时触发，依次执行测试、构建和部署作业。

### **环境 (Environments)**

| 环境          | 目的                                    |
|:----------- |:------------------------------------- |
| Development | 本地开发与测试                               |
| Staging     | 合并到生产前的预览和测试 (利用Cloudflare Pages分支预览) |
| Production  | 线上生产环境                                |

***
