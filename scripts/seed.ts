import { db, users, documents, categories, tags, documentTags } from '../db';
import { createUser } from '../lib/db/users';
import { createCategory } from '../lib/db/categories';
import { createTag, addTagsToDocument } from '../lib/db/tags';

async function seed() {
  console.log('开始插入示例数据...');

  try {
    // 创建管理员用户
    console.log('创建管理员用户...');
    const adminUser = await createUser({
      email: 'admin@techblog.com',
      password: 'admin123',
      name: '管理员',
      isAdmin: true,
    });
    console.log('管理员用户创建成功:', adminUser.email);

    // 创建普通用户
    console.log('创建普通用户...');
    const normalUser = await createUser({
      email: 'user@techblog.com',
      password: 'user123',
      name: '普通用户',
      isAdmin: false,
    });
    console.log('普通用户创建成功:', normalUser.email);

    // 创建分类
    console.log('创建分类...');
    const newsCategory = await createCategory({
      name: '最新新闻',
      slug: 'news',
      description: '最新的技术资讯和行业动态',
      color: '#3B82F6',
    });

    const techCategory = await createCategory({
      name: '技术解析',
      slug: 'tech-analysis',
      description: '深度技术分析和解决方案',
      color: '#10B981',
    });

    const tradingCategory = await createCategory({
      name: '应用交易',
      slug: 'app-trading',
      description: '应用开发和交易相关内容',
      color: '#F59E0B',
    });

    // 创建标签
    console.log('创建标签...');
    const nextjsTag = await createTag({
      name: 'Next.js',
      slug: 'nextjs',
      color: '#000000',
    });

    const reactTag = await createTag({
      name: 'React',
      slug: 'react',
      color: '#61DAFB',
    });

    const typescriptTag = await createTag({
      name: 'TypeScript',
      slug: 'typescript',
      color: '#3178C6',
    });

    const webdevTag = await createTag({
      name: 'Web开发',
      slug: 'webdev',
      color: '#FF6B6B',
    });

    // 插入示例文档
    console.log('插入示例文档...');
    const doc1 = await db.insert(documents).values({
      title: '欢迎来到 TechBlog',
      excerpt: '这是一个现代化的技术博客平台，专为开发者和技术爱好者打造。',
      content: `# 欢迎来到 TechBlog

这是一个现代化的技术博客平台，专为开发者和技术爱好者打造。

## 🚀 主要特性

- **现代化设计**: 采用最新的设计理念，提供优雅的用户体验
- **Markdown 支持**: 完整的 Markdown 编辑器，支持实时预览
- **代码高亮**: 支持多种编程语言的语法高亮
- **用户管理**: 完整的用户认证和权限管理系统
- **响应式布局**: 适配各种设备和屏幕尺寸

## 💻 技术栈

我们使用了最新的技术栈来构建这个平台：

\`\`\`typescript
// Next.js 15 with App Router
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({ message: 'Hello, TechBlog!' });
}
\`\`\`

### 核心技术

- **前端**: Next.js 15, React, TypeScript
- **样式**: Tailwind CSS, Shadcn UI
- **数据库**: PostgreSQL, Drizzle ORM
- **认证**: NextAuth.js
- **编辑器**: CodeMirror 6, react-markdown

## 🎯 开始使用

1. 注册账户或使用测试账户登录
2. 浏览已发布的技术文章
3. 管理员可以创建和编辑文章
4. 享受现代化的阅读体验

## 📝 测试账户

- **管理员**: admin@techblog.com / admin123
- **普通用户**: user@techblog.com / user123

Happy coding! 🎉`,
      slug: 'welcome-to-techblog',
      keywords: 'TechBlog, 技术博客, Next.js, React, TypeScript',
      authorId: adminUser.id,
      categoryId: newsCategory.id,
      published: true,
      viewCount: 156,
    }).returning();

    // 为第一篇文档添加标签
    await addTagsToDocument(doc1[0].id, [nextjsTag.id, reactTag.id, typescriptTag.id]);

    const doc2 = await db.insert(documents).values({
      title: 'Next.js 15 新特性详解',
      excerpt: 'Next.js 15 带来了许多令人兴奋的新特性和改进，包括 React 19 支持、Turbopack 稳定版等。',
      content: `# Next.js 15 新特性详解

Next.js 15 带来了许多令人兴奋的新特性和改进，让我们一起来探索这些变化。

## 🆕 主要新特性

### 1. React 19 支持

Next.js 15 完全支持 React 19，包括新的并发特性和服务器组件改进。

\`\`\`jsx
// 使用新的 use() Hook
import { use } from 'react';

function UserProfile({ userPromise }) {
  const user = use(userPromise);
  return <div>Hello, {user.name}!</div>;
}
\`\`\`

### 2. Turbopack 稳定版

Turbopack 现在已经稳定，提供了显著的构建性能提升。

\`\`\`bash
# 启用 Turbopack
npm run dev -- --turbo
\`\`\`

### 3. 改进的缓存策略

新的缓存策略提供了更好的性能和更精确的缓存控制。

\`\`\`typescript
// 新的缓存配置
export const revalidate = 3600; // 1 hour
export const dynamic = 'force-static';
\`\`\`

## 🔧 开发体验改进

### 更好的错误处理

新的错误边界和错误页面提供了更好的开发体验。

\`\`\`tsx
// error.tsx
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
\`\`\`

### 改进的类型安全

TypeScript 支持得到了进一步改进，提供了更好的类型推断。

## 📊 性能提升

- **构建速度**: 提升 40%
- **热重载**: 提升 60%
- **内存使用**: 减少 30%

## 🚀 迁移指南

从 Next.js 14 迁移到 15 相对简单：

1. 更新依赖
2. 检查破坏性变更
3. 测试应用功能
4. 享受新特性！

这些改进让 Next.js 15 成为构建现代 Web 应用的最佳选择。`,
      slug: 'nextjs-15-new-features',
      keywords: 'Next.js 15, React 19, Turbopack, 性能优化, Web开发',
      authorId: adminUser.id,
      categoryId: techCategory.id,
      published: true,
      viewCount: 234,
    }).returning();

    // 为第二篇文档添加标签
    await addTagsToDocument(doc2[0].id, [nextjsTag.id, reactTag.id, webdevTag.id]);

    const doc3 = await db.insert(documents).values({
      title: 'TypeScript 最佳实践指南',
      excerpt: 'TypeScript 已经成为现代 JavaScript 开发的标准，本文将分享一些最佳实践。',
      content: `# TypeScript 最佳实践指南

TypeScript 已经成为现代 JavaScript 开发的标准，本文将分享一些最佳实践。

## 🎯 类型定义最佳实践

### 1. 使用接口而非类型别名

\`\`\`typescript
// ✅ 推荐
interface User {
  id: string;
  name: string;
  email: string;
}

// ❌ 避免（对于对象类型）
type User = {
  id: string;
  name: string;
  email: string;
};
\`\`\`

### 2. 善用泛型

\`\`\`typescript
// 通用的 API 响应类型
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

// 使用示例
const userResponse: ApiResponse<User> = await fetchUser();
\`\`\`

## 🔧 配置优化

### tsconfig.json 推荐配置

\`\`\`json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
\`\`\`

## 📝 代码组织

### 1. 类型文件组织

\`\`\`
src/
  types/
    api.ts      # API 相关类型
    user.ts     # 用户相关类型
    common.ts   # 通用类型
\`\`\`

### 2. 使用命名空间

\`\`\`typescript
namespace API {
  export interface User {
    id: string;
    name: string;
  }

  export interface Response<T> {
    data: T;
    status: number;
  }
}
\`\`\`

这些实践将帮助你写出更安全、更可维护的 TypeScript 代码。`,
      slug: 'typescript-best-practices',
      keywords: 'TypeScript, 最佳实践, 类型安全, JavaScript, 开发规范',
      authorId: adminUser.id,
      categoryId: techCategory.id,
      published: false, // 草稿状态
      viewCount: 89,
    }).returning();

    // 为第三篇文档添加标签
    await addTagsToDocument(doc3[0].id, [typescriptTag.id, webdevTag.id]);

    console.log('示例数据插入成功！');
    console.log('\n=== 测试账户信息 ===');
    console.log('管理员账户: admin@techblog.com / admin123');
    console.log('普通用户账户: user@techblog.com / user123');
    console.log('==================');
  } catch (error) {
    console.error('插入示例数据失败:', error);
  }
}

seed();
