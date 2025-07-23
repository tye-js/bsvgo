#!/usr/bin/env tsx

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../db/schema';
import { users, categories, tags } from '../db/schema';

async function main() {
  console.log('🚀 开始数据库初始化...');

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('❌ DATABASE_URL 环境变量未设置');
    process.exit(1);
  }

  console.log('📡 连接数据库...');
  
  // 创建数据库连接
  const sql = postgres(connectionString, { max: 1 });
  const db = drizzle(sql, { schema });

  try {
    // 检查数据库连接
    await sql`SELECT 1`;
    console.log('✅ 数据库连接成功');

    // 启用 UUID 扩展
    console.log('🔧 启用 UUID 扩展...');
    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

    // 创建表结构
    console.log('📦 创建表结构...');
    
    // 用户表
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email VARCHAR(255) NOT NULL UNIQUE,
        password TEXT NOT NULL,
        name VARCHAR(255) NOT NULL,
        avatar TEXT,
        is_admin BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;

    // 分类表
    await sql`
      CREATE TABLE IF NOT EXISTS categories (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(100) NOT NULL UNIQUE,
        slug VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        color VARCHAR(7) DEFAULT '#3B82F6',
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;

    // 标签表
    await sql`
      CREATE TABLE IF NOT EXISTS tags (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(50) NOT NULL UNIQUE,
        slug VARCHAR(50) NOT NULL UNIQUE,
        color VARCHAR(7) DEFAULT '#6B7280',
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;

    // 文档表
    await sql`
      CREATE TABLE IF NOT EXISTS documents (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        title TEXT NOT NULL,
        content TEXT NOT NULL DEFAULT '',
        excerpt TEXT,
        slug TEXT NOT NULL UNIQUE,
        keywords TEXT,
        featured_image TEXT,
        author_id UUID NOT NULL REFERENCES users(id),
        category_id UUID REFERENCES categories(id),
        published BOOLEAN NOT NULL DEFAULT false,
        view_count INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;

    // 文档标签关联表
    await sql`
      CREATE TABLE IF NOT EXISTS document_tags (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
        tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        UNIQUE(document_id, tag_id)
      )
    `;

    // 评论表
    await sql`
      CREATE TABLE IF NOT EXISTS comments (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        content TEXT NOT NULL,
        author_id UUID NOT NULL REFERENCES users(id),
        document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
        parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;

    // 收藏表
    await sql`
      CREATE TABLE IF NOT EXISTS favorites (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        UNIQUE(user_id, document_id)
      )
    `;

    console.log('✅ 表结构创建完成');

    // 创建索引
    console.log('🔍 创建索引...');
    await sql`CREATE INDEX IF NOT EXISTS idx_documents_author_id ON documents(author_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_documents_category_id ON documents(category_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_documents_published ON documents(published)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_documents_slug ON documents(slug)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_document_tags_document_id ON document_tags(document_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_document_tags_tag_id ON document_tags(tag_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_comments_document_id ON comments(document_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_comments_author_id ON comments(author_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_favorites_document_id ON favorites(document_id)`;

    console.log('✅ 索引创建完成');

    // 插入初始数据
    console.log('📝 插入初始数据...');

    // 检查是否已有管理员用户
    const existingAdmin = await sql`SELECT id FROM users WHERE email = 'admin@bsvgo.com'`;
    if (existingAdmin.length === 0) {
      await sql`
        INSERT INTO users (email, password, name, is_admin) 
        VALUES ('admin@bsvgo.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '管理员', true)
      `;
      console.log('✅ 创建默认管理员用户 (email: admin@bsvgo.com, password: admin123)');
    }

    // 插入默认分类
    const existingCategories = await sql`SELECT COUNT(*) as count FROM categories`;
    if (existingCategories[0].count === '0') {
      await sql`
        INSERT INTO categories (name, slug, description, color) VALUES
        ('技术分享', 'tech', '技术相关的文章和教程', '#3B82F6'),
        ('生活随笔', 'life', '生活感悟和随笔', '#10B981'),
        ('项目展示', 'projects', '个人项目和作品展示', '#F59E0B'),
        ('学习笔记', 'notes', '学习过程中的笔记和总结', '#8B5CF6')
      `;
      console.log('✅ 创建默认分类');
    }

    // 插入默认标签
    const existingTags = await sql`SELECT COUNT(*) as count FROM tags`;
    if (existingTags[0].count === '0') {
      await sql`
        INSERT INTO tags (name, slug, color) VALUES
        ('JavaScript', 'javascript', '#F7DF1E'),
        ('TypeScript', 'typescript', '#3178C6'),
        ('React', 'react', '#61DAFB'),
        ('Next.js', 'nextjs', '#000000'),
        ('Node.js', 'nodejs', '#339933'),
        ('Docker', 'docker', '#2496ED'),
        ('PostgreSQL', 'postgresql', '#336791'),
        ('前端开发', 'frontend', '#FF6B6B'),
        ('后端开发', 'backend', '#4ECDC4'),
        ('全栈开发', 'fullstack', '#45B7D1')
      `;
      console.log('✅ 创建默认标签');
    }

    // 创建更新时间触发器
    console.log('⚡ 创建触发器...');
    await sql`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql'
    `;

    await sql`DROP TRIGGER IF EXISTS update_users_updated_at ON users`;
    await sql`CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()`;

    await sql`DROP TRIGGER IF EXISTS update_documents_updated_at ON documents`;
    await sql`CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()`;

    await sql`DROP TRIGGER IF EXISTS update_comments_updated_at ON comments`;
    await sql`CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()`;

    console.log('✅ 触发器创建完成');

    // 验证初始化结果
    const userCount = await sql`SELECT COUNT(*) as count FROM users`;
    const categoryCount = await sql`SELECT COUNT(*) as count FROM categories`;
    const tagCount = await sql`SELECT COUNT(*) as count FROM tags`;

    console.log('\n📊 初始化完成统计:');
    console.log(`  - 用户数量: ${userCount[0].count}`);
    console.log(`  - 分类数量: ${categoryCount[0].count}`);
    console.log(`  - 标签数量: ${tagCount[0].count}`);

  } catch (error) {
    console.error('❌ 初始化失败:', error);
    process.exit(1);
  } finally {
    await sql.end();
    console.log('🔌 数据库连接已关闭');
  }

  console.log('🎉 数据库初始化完成！');
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch((error) => {
    console.error('❌ 初始化脚本执行失败:', error);
    process.exit(1);
  });
}

export { main as initDb };
