## **第十部分：数据与存储的双重访问模式 (Dual Access Patterns for Data & Storage)**

**核心原则:** 与Cloudflare中间件（D1, R2）的交互必须遵循场景驱动的原则，选择最高效、最安全的访问模式。

**原则：默认安全，显式公开 (Principle: Secure by Default, Explicitly Public)**

默认情况下，所有访问D1数据库或R2存储的API路由都**必须**是受保护的，且需要通过 `getServerSession` 进行有效的用户会话验证。这是系统的核心安全基石。

**例外情况：** 只有少数明确定义的“公开端点”可以在未经身份验证的情况下访问。这些端点包括但不限于：

* **用户注册 (`/api/auth/register`)**
* **用户登录 (`/api/auth/login`)**
* 未来可能出现的公开API（例如，公开的模板展示）

即便如此，这些公开端点内部也**必须**实施最严格的输入验证、速率限制和错误处理，以防范安全风险。所有其他数据库操作，特别是在 `D1数据库访问模式` 中展示的读取用户特定数据的操作，都必须严格遵循身份验证流程。

### **10.1 D1数据库访问模式 (D1 Database Access Pattern)**

**场景:** 所有在**服务器端**对数据库的直接读写操作。
**机制:** **必须**使用Cloudflare原生注入的**数据库绑定** (`env.DB`)。

* **关键代码 (获取用户项目):**

  ```typescript
  import { getServerSession } from "next-auth/next";
  import { authOptions } from "../auth/[...nextauth]";
  import { NextRequest, NextResponse } from "next/server";

  interface Env { DB: D1Database; }

  export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: '请先登录。' } }, { status: 401 });
    }

    const env = (req as any).ctx.env as Env;

    try {
      const stmt = env.DB.prepare("SELECT * FROM Projects WHERE userId = ?1").bind(session.user.id);
      const { results } = await stmt.all();
      return NextResponse.json({ projects: results });
    } catch (e) {
      console.error("D1 Query Failed:", e);
      return NextResponse.json({ error: { code: 'DATABASE_ERROR', message: '获取项目失败。' } }, { status: 500 });
    }
  }
  ```

### **10.2 R2存储：服务器端直接访问模式 (R2: Server-Side Direct Access Pattern)**

**场景:** 当Worker需要**在服务器端自己**直接读取、写入或删除R2对象时。
**机制:** **必须**使用Cloudflare原生注入的**存储桶绑定** (`env.ASSETS`)。

* **关键代码 (服务器端读取对象):**

  ```typescript
  // 假设这是一个需要读取R2中某个配置文件的API
  export async function GET(req: NextRequest) {
    // ... 身份验证 ...
    const env = (req as any).ctx.env as Env & { ASSETS: R2Bucket };

    try {
      const object = await env.ASSETS.get("path/to/your-object.json");

      if (object === null) {
        return NextResponse.json({ error: { code: 'NOT_FOUND', message: '对象不存在。' } }, { status: 404 });
      }

      const data = await object.json();
      return NextResponse.json(data);

    } catch (e) {
      console.error("R2 Get Failed:", e);
      return NextResponse.json({ error: { code: 'STORAGE_ERROR', message: '读取文件失败。' } }, { status: 500 });
    }
  }
  ```

### **10.3 R2存储：客户端授权访问模式 (R2: Client-Side Authorized Access - Presigned URLs)**

**场景:** 当需要**授权用户的浏览器**直接、安全地上传或下载文件时。
**机制:** **必须**由Worker使用**S3兼容API (`@aws-sdk/client-s3`)** 生成有时效性的**预签名URL**，并将该URL返回给客户端。

* **关键代码 (生成上传URL):**

  ```typescript
  import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
  import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
  // ... 其他引入与认证逻辑 ...

  interface Env {
    R2_BUCKET_NAME: string;
    R2_ACCOUNT_ID: string;
    R2_ACCESS_KEY_ID: string;
    R2_SECRET_ACCESS_KEY: string;
  }

  export async function POST(req: NextRequest) {
    // ... 身份验证 ...
    const { fileName, fileType } = await req.json();
    const env = (req as any).ctx.env as Env;

    const s3 = new S3Client({
      region: "auto",
      endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: env.R2_ACCESS_KEY_ID,
        secretAccessKey: env.R2_SECRET_ACCESS_KEY,
      },
    });

    const uniqueKey = `${session.user.id}/${crypto.randomUUID()}-${fileName}`;
    const command = new PutObjectCommand({ Bucket: env.R2_BUCKET_NAME, Key: uniqueKey, ContentType: fileType });
    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 600 });

    return NextResponse.json({ uploadUrl, key: uniqueKey });
  }
  ```

* **关键代码 (生成下载URL):**

  ```typescript
  import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
  import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
  // ... 其他引入与认证逻辑 ...

  export async function POST(req: NextRequest) {
    // ... 身份验证和资产所有权验证 ...
    const { assetKey } = await req.json();
    const env = (req as any).ctx.env as Env;

    const s3 = new S3Client({ /* ...S3客户端配置... */ });
    const command = new GetObjectCommand({ Bucket: env.R2_BUCKET_NAME, Key: assetKey });
    const downloadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });

    return NextResponse.json({ downloadUrl });
  }
  ```

### **10.4 R2上传确认模式 (R2 Upload Confirmation Pattern)**

*此部分与客户端授权访问模式协同工作。*

**原则:** 在客户端使用预签名URL将文件上传到R2**之后**，**必须**调用一个专用的后端API来确认上传成功，并由后端在数据库中创建相应的`Asset`记录。

* **API端点:** `POST /api/assets/confirm-upload`
* **请求体:** `{ "key": string, "fileName": string, "fileType": string, "fileSize": number }`
* **后端逻辑:**
  1. 验证用户身份。
  2. 在`Assets`表中插入一条新记录。

***
