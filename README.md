# Markdown 编辑器

基于 Next.js 15 的现代化 Markdown 编辑器，支持实时预览、语法高亮和文档管理。

## 🚀 功能特性

- **实时预览**: 支持编辑和预览模式切换
- **语法高亮**: 基于 CodeMirror 6 的 Markdown 语法高亮
- **代码高亮**: 使用 react-syntax-highlighter 实现代码块语法高亮
- **文档管理**: 完整的 CRUD 操作（创建、读取、更新、删除）
- **SEO 友好**: 正确的页面元数据和 URL 结构
- **响应式设计**: 基于 Tailwind CSS 的现代化 UI
- **TypeScript**: 完整的类型安全支持

## 🛠️ 技术栈

- **前端框架**: Next.js 15 (App Router)
- **编辑器**: CodeMirror 6 + react-markdown
- **数据库**: PostgreSQL + Drizzle ORM
- **样式**: Tailwind CSS + Shadcn UI
- **语言**: TypeScript
- **验证**: Zod

## 📦 安装和运行

### 1. 克隆项目

```bash
git clone <repository-url>
cd bsvgo
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

复制 `.env.example` 为 `.env.local` 并配置数据库连接：

```bash
cp .env.example .env.local
```

编辑 `.env.local`:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/bsvgo"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. 设置数据库

确保 PostgreSQL 已安装并运行，然后创建数据库：

```bash
createdb bsvgo
```

运行数据库迁移：

```bash
# 生成迁移文件
npm run db:generate

# 执行迁移
npm run db:migrate

# 或者直接推送 schema（开发环境）
npm run db:push
```

### 5. 启动开发服务器

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

## 📁 项目结构

```
├── app/                    # Next.js App Router 页面
│   ├── api/               # API 路由
│   ├── docs/              # 文档查看页面
│   ├── editor/            # 编辑器页面
│   └── globals.css        # 全局样式
├── components/            # React 组件
│   ├── ui/               # 基础 UI 组件
│   ├── markdown-editor.tsx
│   ├── markdown-renderer.tsx
│   └── ...
├── db/                   # 数据库相关
│   ├── schema.ts         # 数据库 schema
│   └── index.ts          # 数据库连接
├── lib/                  # 工具函数和配置
│   ├── db/              # 数据库操作
│   ├── utils.ts         # 工具函数
│   └── validations.ts   # 数据验证
└── scripts/             # 脚本文件
    └── migrate.sql      # 数据库迁移脚本
```

## 🎯 使用指南

### 创建文档

1. 访问首页，点击"新建文档"
2. 输入文档标题和 Slug
3. 在编辑器中编写 Markdown 内容
4. 点击"保存文档"

### 编辑文档

1. 在文档列表中点击"编辑"按钮
2. 修改内容后点击"保存文档"

### 查看文档

1. 点击文档标题查看渲染后的内容
2. 支持代码语法高亮和 Markdown 格式

## 🔧 开发命令

```bash
# 开发服务器
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm run start

# 代码检查
npm run lint

# 数据库操作
npm run db:generate    # 生成迁移文件
npm run db:migrate     # 执行迁移
npm run db:push        # 推送 schema 到数据库
npm run db:studio      # 打开 Drizzle Studio
```

## 📝 API 接口

### 文档 API

- `GET /api/documents` - 获取所有文档
- `POST /api/documents` - 创建新文档
- `GET /api/documents/[id]` - 获取指定文档
- `PUT /api/documents/[id]` - 更新文档
- `DELETE /api/documents/[id]` - 删除文档

## 🚀 部署

### Vercel 部署

1. 推送代码到 GitHub
2. 在 Vercel 中导入项目
3. 配置环境变量
4. 部署

### 其他平台

确保配置正确的环境变量和数据库连接。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License
