# 社交媒体应用

## 项目介绍

这是一个基于React 19 + TypeScript + Fastify + Prisma + MySQL的全栈社交媒体应用，类似于Twitter的功能，支持用户注册、登录、发布帖子、关注用户、点赞、转发、消息和通知等功能。

## 技术栈

### 前端
- React 19
- TypeScript
- Tailwind CSS
- React Router
- Motion (动画库)
- Lucide React (图标库)

### 后端
- Node.js
- Fastify (Web框架)
- Prisma (ORM)
- MySQL (数据库)
- JWT (认证)
- Swagger (API文档)

## 项目结构

```
├── backend/           # 后端代码
│   ├── prisma/        # Prisma配置和迁移文件
│   ├── routes/        # API路由
│   ├── .env           # 环境变量
│   ├── index.js       # 后端入口
│   └── package.json   # 后端依赖
├── src/               # 前端代码
│   ├── components/    # 组件
│   ├── services/      # API服务
│   ├── views/         # 页面
│   ├── App.tsx        # 前端入口
│   └── main.tsx       # 应用入口
├── package.json       # 前端依赖
└── vite.config.ts     # Vite配置
```

## 功能特性

- 用户认证：注册、登录、JWT认证
- 帖子管理：创建、查看、回复帖子
- 社交功能：关注用户、点赞、转发帖子
- 消息系统：私信聊天
- 通知系统：点赞、转发、回复、关注通知
- 个人资料：编辑个人资料、查看关注/粉丝列表
- 响应式设计：适配不同设备

## 开发准备工作

### 1. 环境要求
- Node.js 18+
- MySQL 5.7+

### 2. 数据库准备
1. 启动MySQL服务
2. 创建数据库：`CREATE DATABASE twitter;`
3. 确保数据库用户有足够权限

### 3. 配置环境变量
1. 进入后端目录：`cd backend`
2. 复制`.env.example`文件为`.env`（如果不存在则创建）
3. 配置数据库连接信息：
   ```
   DATABASE_URL="mysql://root:password@localhost:3306/twitter"
   JWT_SECRET="your-secret-key-here"
   PORT=3001
   ```

### 4. 安装依赖

#### 前端依赖
```bash
npm install
```

#### 后端依赖
```bash
cd backend
npm install
```

### 5. 数据库初始化

```bash
cd backend
# 生成Prisma Client
npx prisma generate
# 运行数据库迁移
npx prisma migrate deploy
```

## 开发命令

### 前端开发
```bash
# 启动开发服务器
npm run dev
# 构建生产版本
npm run build
# 预览生产构建
npm run preview
# 代码 lint
npm run lint
```

### 后端开发
```bash
cd backend
# 启动开发服务器（使用nodemon）
npm run dev
# 启动生产服务器
npm start
# 生成Prisma Client
npx prisma generate
# 运行数据库迁移
npx prisma migrate deploy
# 查看数据库状态
npx prisma studio
```

## API文档

启动后端服务后，可以通过以下地址访问API文档：

```
http://localhost:3001/api/docs
```

## 项目部署

1. 构建前端：`npm run build`
2. 启动后端：`cd backend && npm start`
3. 配置Nginx或其他反向代理（可选）

## 注意事项

- 在生产环境中，应使用HTTPS
- 应配置适当的CORS策略
- 应使用环境变量管理敏感信息
- 应定期备份数据库

## 许可证

ISC License
