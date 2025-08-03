## **第四部分：数据模型 (Data Models)**

### **1. User (用户模型)**

* **目的:** 存储用户账户信息，用于身份验证和项目关联。
* **TypeScript Interface**

  ```typescript
  // In packages/shared/types/user.ts
  export interface User {
    id: string;
    email: string;
    name?: string;
    image?: string; // For Google profile picture
    createdAt: Date;
  }
  ```

### **2. Project (项目模型)**

* **目的:** 代表一个独立的视频创作项目，是连接用户、素材和设计方案的核心。
* **TypeScript Interface**

  ```typescript
  // In packages/shared/types/project.ts
  export interface Project {
    id: string;
    userId: string;
    title: string;
    status: 'draft' | 'rendering' | 'complete' | 'failed';
    audioAssetId: string;
    videoAssetId?: string;
    designState: Record<string, any>; // Represents the JSON state of the editor
    createdAt: Date;
    updatedAt: Date;
  }
  ```

### **3. Asset (素材模型)**

* **目的:** 统一管理用户上传的所有媒体文件（音频、图片）以及系统生成的视频文件。
* **TypeScript Interface**

  ```typescript
  // In packages/shared/types/asset.ts
  export interface Asset {
    id: string;
    userId: string;
    storageUrl: string;
    fileName: string;
    fileType: 'audio' | 'image' | 'video';
    fileSize: number;
    createdAt: Date;
  }
  ```

***
