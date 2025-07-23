import { eq, desc, isNull, and } from 'drizzle-orm';
import { db, comments, users, type Comment, type NewComment } from '@/db';

export interface CommentWithAuthor extends Comment {
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  replies?: CommentWithAuthor[];
}

export async function getCommentsByDocumentId(documentId: string): Promise<CommentWithAuthor[]> {
  try {
    // 获取顶级评论（没有父评论的）
    const topLevelComments = await db
      .select({
        id: comments.id,
        content: comments.content,
        authorId: comments.authorId,
        documentId: comments.documentId,
        parentId: comments.parentId,
        published: comments.published,
        createdAt: comments.createdAt,
        updatedAt: comments.updatedAt,
        author: {
          id: users.id,
          name: users.name,
          avatar: users.avatar,
        },
      })
      .from(comments)
      .leftJoin(users, eq(comments.authorId, users.id))
      .where(
        and(
          eq(comments.documentId, documentId),
          eq(comments.published, true),
          isNull(comments.parentId)
        )
      )
      .orderBy(desc(comments.createdAt));

    // 获取所有回复
    const allReplies = await db
      .select({
        id: comments.id,
        content: comments.content,
        authorId: comments.authorId,
        documentId: comments.documentId,
        parentId: comments.parentId,
        published: comments.published,
        createdAt: comments.createdAt,
        updatedAt: comments.updatedAt,
        author: {
          id: users.id,
          name: users.name,
          avatar: users.avatar,
        },
      })
      .from(comments)
      .leftJoin(users, eq(comments.authorId, users.id))
      .where(
        and(
          eq(comments.documentId, documentId),
          eq(comments.published, true),
          eq(comments.parentId, comments.parentId) // 有父评论的
        )
      )
      .orderBy(comments.createdAt);

    // 组织评论树结构
    const commentsWithReplies: CommentWithAuthor[] = topLevelComments.map(comment => ({
      ...comment,
      replies: allReplies.filter(reply => reply.parentId === comment.id),
    }));

    return commentsWithReplies;
  } catch (error) {
    console.error('获取评论失败:', error);
    throw new Error('获取评论失败');
  }
}

export async function createComment(data: {
  content: string;
  authorId: string;
  documentId: string;
  parentId?: string;
}): Promise<Comment> {
  try {
    const newComment: NewComment = {
      ...data,
      published: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const result = await db.insert(comments).values(newComment).returning();
    return result[0];
  } catch (error) {
    console.error('创建评论失败:', error);
    throw new Error('创建评论失败');
  }
}

export async function updateComment(id: string, data: { content: string }): Promise<Comment | null> {
  try {
    const result = await db
      .update(comments)
      .set({
        content: data.content,
        updatedAt: new Date(),
      })
      .where(eq(comments.id, id))
      .returning();
    
    return result[0] || null;
  } catch (error) {
    console.error('更新评论失败:', error);
    throw new Error('更新评论失败');
  }
}

export async function deleteComment(id: string): Promise<boolean> {
  try {
    const result = await db.delete(comments).where(eq(comments.id, id)).returning();
    return result.length > 0;
  } catch (error) {
    console.error('删除评论失败:', error);
    throw new Error('删除评论失败');
  }
}

export async function toggleCommentPublished(id: string): Promise<Comment | null> {
  try {
    // 先获取当前状态
    const current = await db.select().from(comments).where(eq(comments.id, id)).limit(1);
    if (!current[0]) return null;
    
    const result = await db
      .update(comments)
      .set({
        published: !current[0].published,
        updatedAt: new Date(),
      })
      .where(eq(comments.id, id))
      .returning();
    
    return result[0] || null;
  } catch (error) {
    console.error('切换评论发布状态失败:', error);
    throw new Error('切换评论发布状态失败');
  }
}
