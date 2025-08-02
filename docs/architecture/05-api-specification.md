## **第五部分：API规范 (API Specification)**

```yaml
openapi: 3.0.1
info:
  title: "播客视频化项目 API"
  version: "1.0.0"
  description: "用于驱动播客视频化项目前端应用的核心API。"
servers:
  - url: "/api"
paths:
  # 用户认证相关端点
  /auth/register:
    post:
      summary: "用户注册"
      description: "创建新用户账户"
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - email
                - password
                - name
              properties:
                email:
                  type: string
                  format: email
                  description: "用户邮箱地址"
                  example: "user@example.com"
                password:
                  type: string
                  minLength: 8
                  description: "用户密码，至少8位字符"
                  example: "SecurePass123!"
                name:
                  type: string
                  minLength: 2
                  maxLength: 50
                  description: "用户显示名称"
                  example: "张三"
      responses:
        '201':
          description: "注册成功"
          content:
            application/json:
              schema:
                type: object
                properties:
                  user:
                    $ref: '#/components/schemas/User'
                  message:
                    type: string
                    example: "注册成功"
        '400':
          description: "请求参数错误"
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ApiError'
        '409':
          description: "邮箱已存在"
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ApiError'

  /auth/login:
    post:
      summary: "用户登录"
      description: "用户身份验证"
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - email
                - password
              properties:
                email:
                  type: string
                  format: email
                  description: "用户邮箱地址"
                  example: "user@example.com"
                password:
                  type: string
                  description: "用户密码"
                  example: "SecurePass123!"
      responses:
        '200':
          description: "登录成功"
          headers:
            Set-Cookie:
              description: "设置认证会话Cookie"
              schema:
                type: string
                example: "auth-token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=86400"
          content:
            application/json:
              schema:
                type: object
                properties:
                  user:
                    $ref: '#/components/schemas/User'
                  message:
                    type: string
                    example: "登录成功"
        '401':
          description: "认证失败"
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ApiError'

  /auth/logout:
    post:
      summary: "用户登出"
      description: "清除用户会话"
      security:
        - cookieAuth: []
      responses:
        '200':
          description: "登出成功"
          headers:
            Set-Cookie:
              description: "清除认证Cookie"
              schema:
                type: string
                example: "auth-token=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0"
          content:
            application/json:
              schema:
                type: object
                properties:
                  message:
                    type: string
                    example: "登出成功"

  /auth/me:
    get:
      summary: "获取当前用户信息"
      description: "获取当前登录用户的详细信息"
      security:
        - cookieAuth: []
      responses:
        '200':
          description: "成功获取用户信息"
          content:
            application/json:
              schema:
                type: object
                properties:
                  user:
                    $ref: '#/components/schemas/User'
        '401':
          description: "未认证"
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ApiError'

  /assets/confirm-upload:
    post:
      summary: "确认文件上传成功并创建Asset记录"
      security:
        - cookieAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                key:
                  type: string
                fileName:
                  type: string
                fileType:
                  type: string
                fileSize:
                  type: number
      responses:
        '201':
          description: "Asset记录创建成功"

  # 项目相关端点
  /projects:
    get:
      summary: "获取当前用户的所有项目"
      security:
        - cookieAuth: []
      responses:
        '200':
          description: "成功获取项目列表"
          content:
            application/json:
              schema:
                type: object
                properties:
                  projects:
                    type: array
                    items:
                      $ref: '#/components/schemas/Project'
        '401':
          description: "未认证"
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ApiError'

  /projects/{projectId}:
    get:
      summary: "获取单个项目的详情"
      security:
        - cookieAuth: []
      parameters:
        - name: projectId
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: "成功获取项目详情"
          content:
            application/json:
              schema:
                type: object
                properties:
                  project:
                    $ref: '#/components/schemas/Project'
        '401':
          description: "未认证"
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ApiError'
        '404':
          description: "项目不存在"
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ApiError'
    put:
      summary: "更新项目的设计方案"
      security:
        - cookieAuth: []
      parameters:
        - name: projectId
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: "项目更新成功"
        '401':
          description: "未认证"
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ApiError'

  /assets/upload-url:
    post:
      summary: "获取一个用于上传文件的预签名URL"
      security:
        - cookieAuth: []
      responses:
        '200':
          description: "成功获取上传URL"
        '401':
          description: "未认证"
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ApiError'

  /projects/{projectId}/render:
    post:
      summary: "触发一个视频渲染任务"
      security:
        - cookieAuth: []
      parameters:
        - name: projectId
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '202':
          description: "渲染任务已创建"
        '401':
          description: "未认证"
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ApiError'

components:
  securitySchemes:
    cookieAuth:
      type: apiKey
      in: cookie
      name: auth-token
      description: "HttpOnly认证Cookie"

  schemas:
    User:
      type: object
      properties:
        id:
          type: string
          format: uuid
          description: "用户唯一标识符"
        email:
          type: string
          format: email
          description: "用户邮箱地址"
        name:
          type: string
          description: "用户显示名称"
        createdAt:
          type: string
          format: date-time
          description: "账户创建时间"
        updatedAt:
          type: string
          format: date-time
          description: "账户最后更新时间"

    Project:
      type: object
      properties:
        id:
          type: string
          format: uuid
          description: "项目唯一标识符"
        name:
          type: string
          description: "项目名称"
        userId:
          type: string
          format: uuid
          description: "项目所有者ID"
        createdAt:
          type: string
          format: date-time
          description: "项目创建时间"
        updatedAt:
          type: string
          format: date-time
          description: "项目最后更新时间"

    ApiError:
      type: object
      properties:
        error:
          type: object
          properties:
            code:
              type: string
              description: "内部错误码"
              example: "VALIDATION_ERROR"
            message:
              type: string
              description: "用户友好的错误信息"
              example: "邮箱格式不正确"
            details:
              type: object
              description: "错误详细信息（可选）"
            timestamp:
              type: string
              format: date-time
              description: "错误发生时间"
            requestId:
              type: string
              description: "请求追踪ID"
```