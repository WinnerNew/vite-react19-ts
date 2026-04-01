# 社交媒体应用

## 项目介绍

这是一个基于React 19 + TypeScript + Fastify + Prisma + MySQL的全栈社交媒体应用，类似于Twitter的功能，支持用户注册、登录、发布帖子、关注用户、点赞、转发、消息和通知等功能。

## 技术栈

### 前端
- **React 19** - 用户界面库
- **TypeScript** - 类型安全
- **Tailwind CSS** - 样式框架
- **React Router** - 路由管理
- **Motion** - 动画库
- **Lucide React** - 图标库
- **Vite** - 构建工具

### 后端
- **Node.js** - 运行环境
- **Fastify** - Web框架
- **Prisma** - ORM
- **MySQL** - 数据库
- **JWT** - 认证
- **Swagger** - API文档

## 项目结构

```
├── backend/               # 后端代码
│   ├── prisma/            # Prisma配置和迁移文件
│   │   ├── schema.prisma  # 数据库模型定义
│   │   └── migrations/    # 数据库迁移文件
│   ├── routes/            # API路由
│   │   ├── auth.js        # 认证路由
│   │   ├── user.js        # 用户路由
│   │   ├── post.js        # 帖子路由
│   │   ├── message.js     # 消息路由
│   │   └── notification.js # 通知路由
│   ├── utils/             # 工具函数
│   │   ├── auth.js        # 认证工具
│   │   └── format.js      # 格式化工具
│   ├── .env               # 环境变量
│   ├── index.js           # 后端入口
│   └── package.json       # 后端依赖
├── src/                   # 前端代码
│   ├── components/        # 可复用组件
│   │   ├── Avatar.tsx     # 头像组件
│   │   ├── Loading.tsx    # 加载组件
│   │   ├── EmptyState.tsx # 空状态组件
│   │   ├── Toast.tsx      # 提示组件
│   │   ├── PostCard.tsx   # 帖子卡片
│   │   └── ReplyModal.tsx # 回复模态框
│   ├── services/          # API服务模块
│   │   ├── client.ts      # 基础请求客户端
│   │   ├── auth.ts        # 认证API
│   │   ├── user.ts        # 用户API
│   │   ├── post.ts        # 帖子API
│   │   ├── message.ts     # 消息API
│   │   ├── notification.ts # 通知API
│   │   └── index.ts       # 统一导出
│   ├── utils/             # 工具函数
│   │   └── time.ts        # 时间格式化
│   ├── views/             # 页面组件
│   │   ├── HomeView.tsx   # 首页
│   │   ├── ExploreView.tsx # 探索页
│   │   ├── ProfileView.tsx # 个人资料页
│   │   ├── MessageView.tsx # 消息列表
│   │   ├── ChatRoomView.tsx # 聊天室
│   │   ├── NotificationsView.tsx # 通知页
│   │   └── ...            # 其他页面
│   ├── types.ts           # TypeScript类型定义
│   ├── App.tsx            # 应用主组件
│   └── main.tsx           # 应用入口
├── package.json           # 前端依赖
├── vite.config.ts         # Vite配置
├── tailwind.config.js     # Tailwind配置
└── tsconfig.json          # TypeScript配置
```

## 功能特性

### 核心功能
- ✅ **用户认证**：注册、登录、JWT认证
- ✅ **帖子管理**：创建、查看、回复帖子
- ✅ **社交功能**：关注用户、点赞、转发帖子
- ✅ **消息系统**：私信聊天、实时消息
- ✅ **通知系统**：点赞、转发、回复、关注通知
- ✅ **个人资料**：编辑个人资料、查看关注/粉丝列表
- ✅ **响应式设计**：适配不同设备

### 技术亮点
- 🎨 **组件化设计**：可复用的UI组件库（Avatar、Loading、EmptyState等）
- 🔧 **模块化架构**：API服务按领域拆分，便于维护
- 📝 **TypeScript**：完整的类型定义，提高代码质量
- 🎯 **错误处理**：统一的错误处理和Toast提示
- ⚡ **性能优化**：懒加载、代码分割
- 🛡️ **安全防护**：JWT认证、CORS配置、输入验证

## 开发准备工作

### 1. 环境要求
- Node.js 18+
- MySQL 5.7+
- npm 或 yarn

### 2. 数据库准备
1. 启动MySQL服务
2. 创建数据库：`CREATE DATABASE twitter;`
3. 确保数据库用户有足够权限

### 3. 配置环境变量
1. 进入后端目录：`cd backend`
2. 复制`.env.example`文件为`.env`（如果不存在则创建）
3. 配置数据库连接信息：
   ```env
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

## 代码规范

### Git提交规范
项目遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

- `feat`: 新功能
- `fix`: 修复bug
- `refactor`: 重构代码
- `style`: 代码格式调整
- `docs`: 文档更新
- `test`: 测试相关
- `chore`: 构建/工具相关

示例：
```
feat(components): 新增Avatar组件
fix(backend): 修复CORS配置问题
refactor(services): 拆分API服务模块
```

### 代码风格
- 使用ESLint进行代码检查
- 使用Prettier进行代码格式化
- TypeScript严格模式
- 组件使用函数式组件 + Hooks
- 样式使用Tailwind CSS

## 项目部署

### 1. 前端构建
```bash
npm run build
```

### 2. 后端启动
```bash
cd backend
npm start
```

### 3. 反向代理配置（可选）
使用Nginx配置反向代理：
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        root /path/to/dist;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 注意事项

### 安全性
- ⚠️ 在生产环境中，应使用HTTPS
- ⚠️ 应配置适当的CORS策略
- ⚠️ 应使用环境变量管理敏感信息
- ⚠️ 应定期备份数据库
- ⚠️ JWT密钥应使用强密码

### 性能优化
- 使用CDN加速静态资源
- 启用Gzip压缩
- 配置浏览器缓存
- 数据库索引优化

### 监控与日志
- 配置应用日志记录
- 设置错误监控（如Sentry）
- 数据库性能监控

## 常见问题

### 1. 数据库连接失败
- 检查MySQL服务是否启动
- 确认数据库连接信息正确
- 检查数据库用户权限

### 2. 前端无法访问后端API
- 确认后端服务已启动
- 检查CORS配置
- 确认API路径正确

### 3. JWT认证失败
- 检查JWT_SECRET配置
- 确认token未过期
- 检查请求头Authorization格式

## 更新日志

### 最新更新
- ✨ 新增可复用UI组件（Avatar、Loading、EmptyState）
- 🔧 重构API服务模块，按领域拆分
- 🐛 修复头像显示变形问题
- 🐛 修复CORS配置问题
- 🐛 修复日期格式化错误处理
- 💄 优化时间显示格式
- 📝 完善TypeScript类型定义

## 许可证

ISC License

## 贡献指南

欢迎提交Issue和Pull Request！

1. Fork本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交Pull Request

## 联系方式

如有问题或建议，请提交Issue或联系项目维护者。
