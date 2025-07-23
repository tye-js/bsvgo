-- 创建 documents 表
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_documents_slug ON documents(slug);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at);
CREATE INDEX IF NOT EXISTS idx_documents_updated_at ON documents(updated_at);

-- 插入示例数据
INSERT INTO documents (title, content, slug) VALUES 
(
  'Welcome to Markdown Editor',
  '# Welcome to Markdown Editor

This is a sample document to demonstrate the Markdown editor functionality.

## Features

- **Real-time preview**: See your changes instantly
- **Syntax highlighting**: Code blocks with beautiful syntax highlighting
- **Document management**: Create, edit, and organize your documents
- **SEO friendly**: Proper metadata and URL structure

## Code Example

```javascript
function greet(name) {
  return `Hello, ${name}!`;
}

console.log(greet("World"));
```

## Getting Started

1. Click "New Document" to create your first document
2. Write your content in Markdown format
3. Use the preview mode to see the rendered output
4. Save your document and share the URL

Happy writing! 🚀',
  'welcome-to-markdown-editor'
) ON CONFLICT (slug) DO NOTHING;
