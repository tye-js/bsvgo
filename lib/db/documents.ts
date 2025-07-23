import { eq, desc, like, or, sql } from 'drizzle-orm';
import { db, documents, users, categories, type Document, type NewDocument } from '@/db';
import { CreateDocumentInput, UpdateDocumentInput } from '@/lib/validations';
import { addTagsToDocument } from './tags';

export async function getAllDocuments(): Promise<Document[]> {
  try {
    return await db
      .select({
        id: documents.id,
        title: documents.title,
        content: documents.content,
        excerpt: documents.excerpt,
        slug: documents.slug,
        keywords: documents.keywords,
        featuredImage: documents.featuredImage,
        authorId: documents.authorId,
        categoryId: documents.categoryId,
        published: documents.published,
        viewCount: documents.viewCount,
        createdAt: documents.createdAt,
        updatedAt: documents.updatedAt,
        author: {
          id: users.id,
          name: users.name,
          email: users.email,
          avatar: users.avatar,
        },
        category: {
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
          color: categories.color,
        },
      })
      .from(documents)
      .leftJoin(users, eq(documents.authorId, users.id))
      .leftJoin(categories, eq(documents.categoryId, categories.id))
      .orderBy(desc(documents.updatedAt));
  } catch (error) {
    console.error('获取文档列表失败:', error);
    throw new Error('获取文档列表失败');
  }
}

export async function getPublishedDocuments() {
  try {
    return await db
      .select({
        id: documents.id,
        title: documents.title,
        content: documents.content,
        excerpt: documents.excerpt,
        slug: documents.slug,
        keywords: documents.keywords,
        featuredImage: documents.featuredImage,
        authorId: documents.authorId,
        categoryId: documents.categoryId,
        published: documents.published,
        viewCount: documents.viewCount,
        createdAt: documents.createdAt,
        updatedAt: documents.updatedAt,
        author: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
        category: {
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
          color: categories.color,
        },
      })
      .from(documents)
      .leftJoin(users, eq(documents.authorId, users.id))
      .leftJoin(categories, eq(documents.categoryId, categories.id))
      .where(eq(documents.published, true))
      .orderBy(desc(documents.updatedAt));
  } catch (error) {
    console.error('获取已发布文档列表失败:', error);
    throw new Error('获取已发布文档列表失败');
  }
}

export async function getDocumentBySlug(slug: string) {
  try {
    const result = await db
      .select({
        id: documents.id,
        title: documents.title,
        content: documents.content,
        excerpt: documents.excerpt,
        slug: documents.slug,
        keywords: documents.keywords,
        featuredImage: documents.featuredImage,
        authorId: documents.authorId,
        categoryId: documents.categoryId,
        published: documents.published,
        viewCount: documents.viewCount,
        createdAt: documents.createdAt,
        updatedAt: documents.updatedAt,
        author: {
          id: users.id,
          name: users.name,
          email: users.email,
          avatar: users.avatar,
        },
        category: {
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
          color: categories.color,
        },
      })
      .from(documents)
      .leftJoin(users, eq(documents.authorId, users.id))
      .leftJoin(categories, eq(documents.categoryId, categories.id))
      .where(eq(documents.slug, slug))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error('获取文档失败:', error);
    throw new Error('获取文档失败');
  }
}

export async function getDocumentById(id: string): Promise<Document | null> {
  try {
    const result = await db.select().from(documents).where(eq(documents.id, id)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error('获取文档失败:', error);
    throw new Error('获取文档失败');
  }
}

export async function searchDocuments(query: string): Promise<Document[]> {
  try {
    const searchTerm = `%${query}%`;
    return await db
      .select({
        id: documents.id,
        title: documents.title,
        content: documents.content,
        excerpt: documents.excerpt,
        slug: documents.slug,
        keywords: documents.keywords,
        featuredImage: documents.featuredImage,
        authorId: documents.authorId,
        categoryId: documents.categoryId,
        published: documents.published,
        viewCount: documents.viewCount,
        createdAt: documents.createdAt,
        updatedAt: documents.updatedAt,
        author: {
          id: users.id,
          name: users.name,
          email: users.email,
          avatar: users.avatar,
        },
        category: {
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
          color: categories.color,
        },
      })
      .from(documents)
      .leftJoin(users, eq(documents.authorId, users.id))
      .leftJoin(categories, eq(documents.categoryId, categories.id))
      .where(
        or(
          like(documents.title, searchTerm),
          like(documents.content, searchTerm),
          like(documents.keywords, searchTerm),
          like(documents.excerpt, searchTerm)
        )
      )
      .orderBy(desc(documents.updatedAt));
  } catch (error) {
    console.error('搜索文档失败:', error);
    throw new Error('搜索文档失败');
  }
}

export async function getDocumentsByCategory(categorySlug: string): Promise<Document[]> {
  try {
    return await db
      .select({
        id: documents.id,
        title: documents.title,
        content: documents.content,
        excerpt: documents.excerpt,
        slug: documents.slug,
        keywords: documents.keywords,
        featuredImage: documents.featuredImage,
        authorId: documents.authorId,
        categoryId: documents.categoryId,
        published: documents.published,
        viewCount: documents.viewCount,
        createdAt: documents.createdAt,
        updatedAt: documents.updatedAt,
        author: {
          id: users.id,
          name: users.name,
          email: users.email,
          avatar: users.avatar,
        },
        category: {
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
          color: categories.color,
        },
      })
      .from(documents)
      .leftJoin(users, eq(documents.authorId, users.id))
      .leftJoin(categories, eq(documents.categoryId, categories.id))
      .where(eq(categories.slug, categorySlug))
      .orderBy(desc(documents.updatedAt));
  } catch (error) {
    console.error('获取分类文档失败:', error);
    throw new Error('获取分类文档失败');
  }
}

export async function incrementViewCount(id: string): Promise<void> {
  try {
    await db
      .update(documents)
      .set({
        viewCount: sql`${documents.viewCount} + 1`,
      })
      .where(eq(documents.id, id));
  } catch (error) {
    console.error('增加浏览次数失败:', error);
    // 不抛出错误，因为这不是关键功能
  }
}

export async function createDocument(data: CreateDocumentInput & { authorId: string; tagIds?: string[] }): Promise<Document> {
  try {
    const newDocument: NewDocument = {
      title: data.title,
      content: data.content,
      excerpt: data.excerpt,
      slug: data.slug,
      keywords: data.keywords,
      featuredImage: data.featuredImage,
      authorId: data.authorId,
      categoryId: data.categoryId,
      published: data.published || false,
      viewCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.insert(documents).values(newDocument).returning();
    const document = result[0];

    // 添加标签关联
    if (data.tagIds && data.tagIds.length > 0) {
      await addTagsToDocument(document.id, data.tagIds);
    }

    return document;
  } catch (error) {
    console.error('创建文档失败:', error);
    throw new Error('创建文档失败');
  }
}

export async function updateDocument(id: string, data: UpdateDocumentInput & { tagIds?: string[] }): Promise<Document | null> {
  try {
    const { tagIds, ...updateData } = data;
    const finalUpdateData = {
      ...updateData,
      updatedAt: new Date(),
    };

    const result = await db
      .update(documents)
      .set(finalUpdateData)
      .where(eq(documents.id, id))
      .returning();

    const document = result[0];

    // 更新标签关联
    if (document && tagIds !== undefined) {
      await addTagsToDocument(document.id, tagIds);
    }

    return document || null;
  } catch (error) {
    console.error('更新文档失败:', error);
    throw new Error('更新文档失败');
  }
}

export async function deleteDocument(id: string): Promise<boolean> {
  try {
    const result = await db.delete(documents).where(eq(documents.id, id)).returning();
    return result.length > 0;
  } catch (error) {
    console.error('删除文档失败:', error);
    throw new Error('删除文档失败');
  }
}
