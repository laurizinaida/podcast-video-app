## **第十部分：数据与存储访问模式 (Data and Storage Access Patterns)**

**原则：默认安全，显式公开 (Principle: Secure by Default, Explicitly Public)**

默认情况下，所有访问D1数据库或R2存储的API路由都**必须**是受保护的，且需要通过 `getServerSession` 进行有效的用户会话验证。这是系统的核心安全基石。

**例外情况：** 只有少数明确定义的“公开端点”可以在未经身份验证的情况下访问。这些端点包括但不限于：

* **用户注册 (`/api/auth/register`)**
* **用户登录 (`/api/auth/login`)**
* 未来可能出现的公开API（例如，公开的模板展示）

即便如此，这些公开端点内部也**必须**实施最严格的输入验证、速率限制和错误处理，以防范安全风险。所有其他数据库操作，特别是在 `D1数据库访问模式` 中展示的读取用户特定数据的操作，都必须严格遵循身份验证流程。

### **10.1 D1数据库访问模式 (D1 Database Access Pattern)**

所有数据库操作必须在经过身份验证的API路由中进行，并通过Cloudflare运行时提供的`env`对象绑定来执行。

* **场景：** 获取当前登录用户的所有项目。

* **文件位置：** `apps/api/projects/route.ts` (示例)

* **关键代码：**
  
  ```typescript
  import { getServerSession } from "next-auth/next";
  import { authOptions } from "../auth/[...nextauth]";
  import { NextRequest, NextResponse } from "next/server";
  
  // 定义Cloudflare运行时注入的环境变量类型
  interface Env {
    DB: D1Database;
  }
  
  // 使用Next.js App Router的GET处理器
  export async function GET(req: NextRequest) {
    // 1. 从请求中安全地获取用户会话
    // Auth.js通过HttpOnly Cookie自动处理了认证
    const session = await getServerSession(authOptions);
  
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: '请先登录。' } }, { status: 401 });
    }
  
    // 2. 从上下文获取D1数据库绑定
    const env = (req as any).ctx.env as Env;
  
    try {
      // 3. 必须使用预处理语句 (Prepared Statements) 来防止SQL注入
      const stmt = env.DB.prepare("SELECT * FROM Projects WHERE userId = ?1").bind(session.user.id);
      const { results } = await stmt.all();
  
      // 4. 返回查询结果
      return NextResponse.json({ projects: results });
  
    } catch (e) {
      console.error("D1 Query Failed:", e);
      return NextResponse.json({ error: { code: 'DATABASE_ERROR', message: '获取项目失败。' } }, { status: 500 });
    }
  }
  ```

### **10.2 R2存储上传模式 (R2 Storage Upload Pattern)**

文件上传**必须**采用“预签名URL”(Presigned URL) 模式，以确保安全和性能。后端仅负责授权，实际上传由客户端直接完成。

* **场景：** 为用户上传音频文件生成一个安全的上传链接。

* **文件位置：** `apps/api/assets/upload-url/route.ts` (示例)

* **关键代码：**
  
  ```typescript
  import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
  import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
  import { getServerSession } from "next-auth/next";
  import { authOptions } from "../../auth/[...nextauth]";
  import { NextRequest, NextResponse } from "next/server";
  import crypto from "crypto";
  
  // 定义Cloudflare运行时注入的环境变量类型
  interface Env {
    R2_BUCKET_NAME: string;
    R2_ACCOUNT_ID: string;
    R2_ACCESS_KEY_ID: string;
    R2_SECRET_ACCESS_KEY: string;
  }
  
  export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: '请先登录。' } }, { status: 401 });
    }
  
    const { fileName, fileType } = await req.json();
    const env = (req as any).ctx.env as Env;
  
    // 1. 初始化S3客户端以与R2交互
    const s3 = new S3Client({
      region: "auto",
      endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: env.R2_ACCESS_KEY_ID,
        secretAccessKey: env.R2_SECRET_ACCESS_KEY,
      },
    });
  
    // 2. 生成一个唯一的、安全的文件名
    const uniqueKey = `${session.user.id}/${crypto.randomUUID()}-${fileName}`;
  
    // 3. 创建预签名URL命令
    const command = new PutObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: uniqueKey,
      ContentType: fileType,
    });
  
    // 4. 生成URL，有效期为10分钟
    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 600 });
  
    return NextResponse.json({ uploadUrl, key: uniqueKey });
  }
  ```

### **10.3 R2上传确认模式 (R2 Upload Confirmation Pattern)**

**原则:** 在客户端使用预签名URL将文件上传到R2**之后**，**必须**调用一个专用的后端API来确认上传成功，并由后端在数据库中创建相应的`Asset`记录。

* **场景:** 前端成功将文件上传到R2后。
* **API端点:** `POST /api/assets/confirm-upload`
* **请求体:** `{ "key": string, "fileName": string, "fileType": string, "fileSize": number }`
* **后端逻辑:**
  1. 验证用户身份。
  2. 验证请求体中的数据。
  3. 在`Assets`表中插入一条新记录，其中`storage_url`字段的值即为`key`。
  4. 返回新创建的`Asset`对象。

### **10.4 R2安全下载模式 (R2 Secure Download Pattern)**

**原则:** R2存储桶中的所有用户生成内容**必须**保持私有。前端向用户提供文件访问的唯一方式是通过后端生成的、有时效性的“预签名下载URL”。

* **场景:** 用户在项目页面点击“下载视频”按钮。

* **关键代码 (`apps/api/assets/download-url/route.ts`):**
  
  ```typescript
  import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
  import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
  // ...其他引入与认证逻辑...
  
  export async function POST(req: NextRequest) {
    // ... 必须先进行用户身份和项目所有权验证 ...
    const { assetKey } = await req.json(); // assetKey是文件在R2中的路径
    const env = (req as any).ctx.env as Env;
  
    const s3 = new S3Client({ /* ...S3客户端配置... */ });
  
    const command = new GetObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: assetKey,
    });
  
    // 生成一个有效期为5分钟的只读下载链接
    const downloadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });
  
    return NextResponse.json({ downloadUrl });
  }
  ```