import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getCommentsByDocumentId, createComment } from '@/lib/db/comments';
import { createCommentSchema } from '@/lib/validations';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('documentId');

    if (!documentId) {
      return NextResponse.json(
        { error: '缺少文档ID' },
        { status: 400 }
      );
    }

    const comments = await getCommentsByDocumentId(documentId);
    return NextResponse.json(comments);
  } catch (error) {
    console.error('获取评论失败:', error);
    return NextResponse.json(
      { error: '获取评论失败' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // 验证请求数据
    const validatedData = createCommentSchema.parse(body);
    
    // 创建评论
    const comment = await createComment({
      ...validatedData,
      authorId: session.user.id,
    });
    
    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error('创建评论失败:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: '创建评论失败' },
      { status: 500 }
    );
  }
}
