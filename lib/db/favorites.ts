import { eq, and, count } from 'drizzle-orm';
import { db } from '@/db';
import { favorites, documents, users, type Favorite, type NewFavorite } from '@/db/schema';

export async function getFavoritesByUserId(userId: string) {
  try {
    return await db
      .select({
        id: favorites.id,
        userId: favorites.userId,
        documentId: favorites.documentId,
        createdAt: favorites.createdAt,
        document: {
          id: documents.id,
          title: documents.title,
          slug: documents.slug,
          excerpt: documents.excerpt,
          featuredImage: documents.featuredImage,
          createdAt: documents.createdAt,
          viewCount: documents.viewCount,
        },
      })
      .from(favorites)
      .leftJoin(documents, eq(favorites.documentId, documents.id))
      .where(eq(favorites.userId, userId))
      .orderBy(favorites.createdAt);
  } catch (error) {
    console.error('获取收藏列表失败:', error);
    throw new Error('获取收藏列表失败');
  }
}

export async function isFavorited(userId: string, documentId: string): Promise<boolean> {
  try {
    const result = await db
      .select()
      .from(favorites)
      .where(
        and(
          eq(favorites.userId, userId),
          eq(favorites.documentId, documentId)
        )
      )
      .limit(1);
    
    return result.length > 0;
  } catch (error) {
    console.error('检查收藏状态失败:', error);
    return false;
  }
}

export async function addToFavorites(userId: string, documentId: string): Promise<Favorite> {
  try {
    // 检查是否已经收藏
    const existing = await isFavorited(userId, documentId);
    if (existing) {
      throw new Error('已经收藏过这篇文章');
    }

    const newFavorite: NewFavorite = {
      userId,
      documentId,
      createdAt: new Date(),
    };

    const result = await db.insert(favorites).values(newFavorite).returning();
    return result[0];
  } catch (error) {
    console.error('添加收藏失败:', error);
    throw new Error('添加收藏失败');
  }
}

export async function removeFromFavorites(userId: string, documentId: string): Promise<boolean> {
  try {
    const result = await db
      .delete(favorites)
      .where(
        and(
          eq(favorites.userId, userId),
          eq(favorites.documentId, documentId)
        )
      )
      .returning();

    return result.length > 0;
  } catch (error) {
    console.error('取消收藏失败:', error);
    throw new Error('取消收藏失败');
  }
}

export async function getFavoriteCount(documentId: string): Promise<number> {
  try {
    const result = await db
      .select({ count: count() })
      .from(favorites)
      .where(eq(favorites.documentId, documentId));

    return result[0]?.count || 0;
  } catch (error) {
    console.error('获取收藏数量失败:', error);
    return 0;
  }
}
