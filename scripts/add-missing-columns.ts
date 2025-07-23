import { sql } from 'drizzle-orm';
import { db } from '../db';

async function addMissingColumns() {
  try {
    console.log('添加缺失的数据库字段...');

    // 添加 documents 表的新字段
    await db.execute(sql`ALTER TABLE documents ADD COLUMN IF NOT EXISTS excerpt text`);
    await db.execute(sql`ALTER TABLE documents ADD COLUMN IF NOT EXISTS keywords text`);
    await db.execute(sql`ALTER TABLE documents ADD COLUMN IF NOT EXISTS featured_image text`);
    await db.execute(sql`ALTER TABLE documents ADD COLUMN IF NOT EXISTS category_id uuid`);
    await db.execute(sql`ALTER TABLE documents ADD COLUMN IF NOT EXISTS view_count integer DEFAULT 0 NOT NULL`);

    // 添加 users 表的新字段
    await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar text`);

    // 创建 categories 表
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS categories (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        name varchar(100) NOT NULL,
        slug varchar(100) NOT NULL,
        description text,
        color varchar(7) DEFAULT '#3B82F6',
        created_at timestamp DEFAULT now() NOT NULL,
        CONSTRAINT categories_name_unique UNIQUE(name),
        CONSTRAINT categories_slug_unique UNIQUE(slug)
      )
    `);

    // 创建 tags 表
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS tags (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        name varchar(50) NOT NULL,
        slug varchar(50) NOT NULL,
        color varchar(7) DEFAULT '#6B7280',
        created_at timestamp DEFAULT now() NOT NULL,
        CONSTRAINT tags_name_unique UNIQUE(name),
        CONSTRAINT tags_slug_unique UNIQUE(slug)
      )
    `);

    // 创建 document_tags 表
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS document_tags (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        document_id uuid NOT NULL,
        tag_id uuid NOT NULL
      )
    `);

    // 创建 comments 表
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS comments (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        content text NOT NULL,
        author_id uuid NOT NULL,
        document_id uuid NOT NULL,
        parent_id uuid,
        published boolean DEFAULT true NOT NULL,
        created_at timestamp DEFAULT now() NOT NULL,
        updated_at timestamp DEFAULT now() NOT NULL
      )
    `);

    // 创建 favorites 表
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS favorites (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        user_id uuid NOT NULL,
        document_id uuid NOT NULL,
        created_at timestamp DEFAULT now() NOT NULL
      )
    `);

    // 添加外键约束（忽略错误，因为可能已经存在）
    try {
      await db.execute(sql`
        ALTER TABLE documents
        ADD CONSTRAINT documents_category_id_categories_id_fk
        FOREIGN KEY (category_id) REFERENCES categories(id)
      `);
    } catch (e) {
      console.log('外键约束 documents_category_id_categories_id_fk 可能已存在');
    }

    try {
      await db.execute(sql`
        ALTER TABLE document_tags
        ADD CONSTRAINT document_tags_document_id_documents_id_fk
        FOREIGN KEY (document_id) REFERENCES documents(id)
      `);
    } catch (e) {
      console.log('外键约束 document_tags_document_id_documents_id_fk 可能已存在');
    }

    try {
      await db.execute(sql`
        ALTER TABLE document_tags
        ADD CONSTRAINT document_tags_tag_id_tags_id_fk
        FOREIGN KEY (tag_id) REFERENCES tags(id)
      `);
    } catch (e) {
      console.log('外键约束 document_tags_tag_id_tags_id_fk 可能已存在');
    }

    try {
      await db.execute(sql`
        ALTER TABLE comments
        ADD CONSTRAINT comments_author_id_users_id_fk
        FOREIGN KEY (author_id) REFERENCES users(id)
      `);
    } catch (e) {
      console.log('外键约束 comments_author_id_users_id_fk 可能已存在');
    }

    try {
      await db.execute(sql`
        ALTER TABLE comments
        ADD CONSTRAINT comments_document_id_documents_id_fk
        FOREIGN KEY (document_id) REFERENCES documents(id)
      `);
    } catch (e) {
      console.log('外键约束 comments_document_id_documents_id_fk 可能已存在');
    }

    try {
      await db.execute(sql`
        ALTER TABLE comments
        ADD CONSTRAINT comments_parent_id_comments_id_fk
        FOREIGN KEY (parent_id) REFERENCES comments(id)
      `);
    } catch (e) {
      console.log('外键约束 comments_parent_id_comments_id_fk 可能已存在');
    }

    try {
      await db.execute(sql`
        ALTER TABLE favorites
        ADD CONSTRAINT favorites_user_id_users_id_fk
        FOREIGN KEY (user_id) REFERENCES users(id)
      `);
    } catch (e) {
      console.log('外键约束 favorites_user_id_users_id_fk 可能已存在');
    }

    try {
      await db.execute(sql`
        ALTER TABLE favorites
        ADD CONSTRAINT favorites_document_id_documents_id_fk
        FOREIGN KEY (document_id) REFERENCES documents(id)
      `);
    } catch (e) {
      console.log('外键约束 favorites_document_id_documents_id_fk 可能已存在');
    }

    console.log('数据库字段添加完成！');
  } catch (error) {
    console.error('添加数据库字段失败:', error);
  }
}

addMissingColumns();
