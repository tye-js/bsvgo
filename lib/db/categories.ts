import { eq } from 'drizzle-orm';
import { db, categories, type Category, type NewCategory } from '@/db';

export async function getAllCategories(): Promise<Category[]> {
  try {
    return await db.select().from(categories).orderBy(categories.name);
  } catch (error) {
    console.error('获取分类列表失败:', error);
    throw new Error('获取分类列表失败');
  }
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  try {
    const result = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error('获取分类失败:', error);
    throw new Error('获取分类失败');
  }
}

export async function createCategory(data: {
  name: string;
  slug: string;
  description?: string;
  color?: string;
}): Promise<Category> {
  try {
    const newCategory: NewCategory = {
      ...data,
      createdAt: new Date(),
    };
    
    const result = await db.insert(categories).values(newCategory).returning();
    return result[0];
  } catch (error) {
    console.error('创建分类失败:', error);
    throw new Error('创建分类失败');
  }
}

export async function updateCategory(id: string, data: Partial<NewCategory>): Promise<Category | null> {
  try {
    const result = await db
      .update(categories)
      .set(data)
      .where(eq(categories.id, id))
      .returning();
    
    return result[0] || null;
  } catch (error) {
    console.error('更新分类失败:', error);
    throw new Error('更新分类失败');
  }
}

export async function deleteCategory(id: string): Promise<boolean> {
  try {
    const result = await db.delete(categories).where(eq(categories.id, id)).returning();
    return result.length > 0;
  } catch (error) {
    console.error('删除分类失败:', error);
    throw new Error('删除分类失败');
  }
}
