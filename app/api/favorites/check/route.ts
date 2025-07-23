import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { isFavorited, getFavoriteCount } from '@/lib/db/favorites';

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

    const session = await getServerSession(authOptions);
    
    // 获取收藏数量
    const count = await getFavoriteCount(documentId);
    
    // 如果用户已登录，检查是否已收藏
    let userFavorited = false;
    if (session?.user?.id) {
      userFavorited = await isFavorited(session.user.id, documentId);
    }

    return NextResponse.json({
      isFavorited: userFavorited,
      count,
    });
  } catch (error) {
    console.error('检查收藏状态失败:', error);
    return NextResponse.json(
      { error: '检查收藏状态失败' },
      { status: 500 }
    );
  }
}
