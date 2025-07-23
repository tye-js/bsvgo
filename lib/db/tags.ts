import { eq, inArray } from 'drizzle-orm';
import { db, tags, documentTags, type Tag, type NewTag, type DocumentTag, type NewDocumentTag } from '@/db';

export async function getAllTags(): Promise<Tag[]> {
  try {
    return await db.select().from(tags).orderBy(tags.name);
  } catch (error) {
    console.error('获取标签列表失败:', error);
    throw new Error('获取标签列表失败');
  }
}

export async function getTagsByDocumentId(documentId: string): Promise<Tag[]> {
  try {
    const result = await db
      .select({
        id: tags.id,
        name: tags.name,
        slug: tags.slug,
        color: tags.color,
        createdAt: tags.createdAt,
      })
      .from(tags)
      .innerJoin(documentTags, eq(tags.id, documentTags.tagId))
      .where(eq(documentTags.documentId, documentId));
    
    return result;
  } catch (error) {
    console.error('获取文档标签失败:', error);
    throw new Error('获取文档标签失败');
  }
}

export async function createTag(data: {
  name: string;
  slug: string;
  color?: string;
}): Promise<Tag> {
  try {
    const newTag: NewTag = {
      ...data,
      createdAt: new Date(),
    };
    
    const result = await db.insert(tags).values(newTag).returning();
    return result[0];
  } catch (error) {
    console.error('创建标签失败:', error);
    throw new Error('创建标签失败');
  }
}

export async function findOrCreateTags(tagNames: string[]): Promise<Tag[]> {
  try {
    const existingTags = await db
      .select()
      .from(tags)
      .where(inArray(tags.name, tagNames));
    
    const existingTagNames = existingTags.map(tag => tag.name);
    const newTagNames = tagNames.filter(name => !existingTagNames.includes(name));
    
    const newTags: Tag[] = [];
    for (const name of newTagNames) {
      const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const tag = await createTag({ name, slug });
      newTags.push(tag);
    }
    
    return [...existingTags, ...newTags];
  } catch (error) {
    console.error('查找或创建标签失败:', error);
    throw new Error('查找或创建标签失败');
  }
}

export async function addTagsToDocument(documentId: string, tagIds: string[]): Promise<void> {
  try {
    // 先删除现有的标签关联
    await db.delete(documentTags).where(eq(documentTags.documentId, documentId));
    
    // 添加新的标签关联
    if (tagIds.length > 0) {
      const documentTagData: NewDocumentTag[] = tagIds.map(tagId => ({
        documentId,
        tagId,
      }));
      
      await db.insert(documentTags).values(documentTagData);
    }
  } catch (error) {
    console.error('添加文档标签失败:', error);
    throw new Error('添加文档标签失败');
  }
}

export async function removeTagsFromDocument(documentId: string): Promise<void> {
  try {
    await db.delete(documentTags).where(eq(documentTags.documentId, documentId));
  } catch (error) {
    console.error('移除文档标签失败:', error);
    throw new Error('移除文档标签失败');
  }
}
