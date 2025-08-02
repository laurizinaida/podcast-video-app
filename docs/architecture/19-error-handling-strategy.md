## **第十九部分：错误处理策略 (Error Handling Strategy)**

### **错误流程 (Error Flow)**

```mermaid
sequenceDiagram
    participant User as 用户
    participant FE as 前端应用
    participant BE as 后端服务 (Worker)
    participant DB as 数据库

    User->>FE: 1. 执行一个操作 (如用户注册)
    FE->>BE: 2. 调用API (POST /api/auth/register)
    BE->>BE: 3. 验证输入数据
    alt 输入验证失败
        BE-->>FE: 4a. 返回400错误 (VALIDATION_ERROR)
        FE->>User: 5a. 显示具体的验证错误信息
    else 输入验证通过
        BE->>DB: 4b. 尝试创建用户
        alt 邮箱已存在
            DB-->>BE: 5b. 返回唯一约束冲突
            BE-->>FE: 6b. 返回409错误 (EMAIL_EXISTS)
            FE->>User: 7b. 显示"邮箱已被注册"提示
        else 创建成功
            DB-->>BE: 5c. 返回用户数据
            BE-->>FE: 6c. 返回201成功响应
            FE->>User: 7c. 自动登录并跳转到项目列表
        end
    end
```

### **标准化错误响应格式 (Standardized Error Response Format)**

所有失败的API请求都将返回以下结构的JSON响应体：

```typescript
interface ApiError {
  error: {
    code: string;           // 标准化错误码
    message: string;        // 用户友好的错误信息
    timestamp: string;      // ISO 8601格式的错误时间戳
    requestId: string;      // 用于追踪日志的唯一请求ID
  };
}
```