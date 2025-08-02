## **第六部分：组件 (Components)**

* **1. 前端应用 (Frontend Application):** 提供完整的用户界面，使用Next.js构建，部署在Cloudflare Pages。
* **2. 后端服务 (Backend Service):** 处理所有业务逻辑，使用Cloudflare Workers构建。
* **3. 渲染服务 (Rendering Service):** 接收渲染任务并使用FFmpeg生成视频，使用Python构建，MVP阶段在本地运行。
* **4. 数据库 (Database):** 持久化存储结构化数据，使用Cloudflare D1。
* **5. 对象存储 (Storage):** 存储所有媒体文件，使用Cloudflare R2。

### **组件交互图 (Component Diagram)**

```mermaid
graph TD
    A[用户] -->|"通过浏览器交互"| C1[Frontend Application]

    subgraph "Cloudflare 云平台"
        C1 -->|"调用REST API"| C2[Backend Service Worker]
        C2 -->|"读/写"| C4[Database D1]
        C2 -->|"管理元数据/获取上传URL"| C5[Storage R2]
    end

    subgraph "本地环境"
        C3[Rendering Service Python/FFmpeg]
    end

    C2 -->|"发送渲染任务 (通过API)"| C3
    C3 -->|"上传成品视频"| C5
```