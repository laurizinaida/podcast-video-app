## **第十二部分：后端架构 (Backend Architecture)**

* **Worker服务架构:** **必须**使用 **Next.js 内置的、基于文件系统的API路由**来定义和管理所有API端点。业务逻辑与数据访问逻辑**必须**通过仓储模式 (Repository Pattern) 或类似的服务层进行隔离，以保持代码的整洁和可测试性。
* **认证与授权:** 使用`withAuth`中间件或在API路由处理器中通过`getServerSession`来保护需要登录才能访问的API端点。
* **渲染服务架构:** 采用异步任务工作者模式，通过Flask API接收任务，放入内部队列，由后台进程调用FFmpeg处理，并通过回调API通知Worker任务完成状态。