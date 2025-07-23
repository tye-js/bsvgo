---
type: "agent_requested"
---

# 🔧 Augment Code Rules (Content7-based)

> 使用 Content7 模型，结合各技术栈的**最新官网文档**，生成推荐规则与最佳实践提示。适用于你的 Next.js 项目，涵盖 UI、数据库、内容渲染与语法高亮等核心部分。

---

## 📦 技术栈总览

| 类型       | 技术方案                                                                                                 |
| ---------- | -------------------------------------------------------------------------------------------------------- |
| 前端框架   | [Next.js 15 (App Router)](https://nextjs.org/docs)                                                       |
| 编辑器组件 | [react-markdown](https://github.com/remarkjs/react-markdown) + [CodeMirror 6](https://codemirror.net/6/) |
| 数据库     | [PostgreSQL](https://www.postgresql.org/) + [Drizzle ORM](https://orm.drizzle.team/)                     |
| 内容渲染   | [MDX](https://mdxjs.com/) + [rehype-pretty-code](https://rehype-pretty-code.netlify.app/)                |
| UI 框架    | [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)                           |
| 图片优化   | [`next/image`](https://nextjs.org/docs/app/building-your-application/optimizing/images)                  |

---

## 🧠 Augment Code Rule Set

### 1. ✅ Next.js 15 Best Practices
- 使用 App Router 架构。
- 合理划分 `layout.tsx`、`page.tsx`、`loading.tsx`、`error.tsx`。
- 图片统一使用 `<Image />`，建议使用 `priority` 或 `loading='lazy'`。
- `server actions` 应用于 mutate 类型请求（如表单处理）。
- [官方文档](https://nextjs.org/docs)

---

### 2. 🎨 Tailwind CSS + Shadcn UI
- 使用原子类实现响应式布局（如：`md:grid-cols-2`）。
- 保持 className 精简，避免冗余嵌套。
- 组件优先采用 shadcn/ui（Button, Card, Dialog 等）。
- 利用 Tailwind 的 dark mode 支持做主题切换。
- [Tailwind CSS 文档](https://tailwindcss.com/docs)｜[shadcn/ui 文档](https://ui.shadcn.com/docs)

---

### 3. 🗃️ PostgreSQL + Drizzle ORM
- 使用 drizzle schema 显式声明字段类型。
- 聚合查询或复杂联表推荐使用 `.sql` 原生语句，提升性能。
- 避免在前端拼接查询逻辑，确保数据库操作纯粹。
- [Drizzle ORM 文档](https://orm.drizzle.team/docs)｜[PostgreSQL 官网](https://www.postgresql.org/docs/)

---

### 4. 📄 MDX + rehype-pretty-code 渲染内容
- 统一采用 MDX 渲染 markdown 页面，支持 React 组件嵌入。
- rehype-pretty-code 支持多种主题，推荐 `one-dark-pro`。
- 为 `<pre>` 元素添加 `data-language` 属性以便语法高亮正常显示。
- 示例：
  \`\`\`mdx
  \`\`\`ts {filename=example.ts}
  const greet = (name: string) => `Hello, ${name}`
  \`\`\`
  \`\`\`
- [rehype-pretty-code 文档](https://rehype-pretty-code.netlify.app/)｜[MDX 官网](https://mdxjs.com/)

---

### 5. 📝 编辑器：react-markdown + CodeMirror 6
- 使用 `remark-gfm` 支持表格、任务列表等 GitHub 风格 markdown。
- CodeMirror 建议开启延迟加载（lazy load），减小首屏包体积。
- 可通过 `@codemirror/lang-*` 动态加载语言支持模块。
- 推荐配置 theme 为 `one-dark` 或 `dracula` 与代码块风格统一。
- [react-markdown 文档](https://github.com/remarkjs/react-markdown)｜[CodeMirror 6 文档](https://codemirror.net/6/)

---

### 6. 🖼️ 图片处理：`next/image`
- 使用 `next/image` 替代 `<img>`，以实现自动优化、懒加载。
- 所有图片都应提供 `alt` 属性，提升可访问性与 SEO。
- 推荐使用 `fill` 模式配合 `sizes` 进行响应式优化。
- 示例：
  \`\`\`tsx
  import Image from 'next/image'

  <Image
    src="/banner.png"
    alt="首页横幅"
    fill
    priority
    sizes="(max-width: 768px) 100vw, 50vw"
/>
  \`\`\`

---

