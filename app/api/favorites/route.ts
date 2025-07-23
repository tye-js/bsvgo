import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { addToFavorites, removeFromFavorites, getFavoritesByUserId } from '@/lib/db/favorites';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      );
    }

    const favorites = await getFavoritesByUserId(session.user.id);
    return NextResponse.json(favorites);
  } catch (error) {
    console.error('获取收藏列表失败:', error);
    return NextResponse.json(
      { error: '获取收藏列表失败' },
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

    const { documentId } = await request.json();
    
    if (!documentId) {
      return NextResponse.json(
        { error: '缺少文档ID' },
        { status: 400 }
      );
    }

    const favorite = await addToFavorites(session.user.id, documentId);
    return NextResponse.json(favorite, { status: 201 });
  } catch (error) {
    console.error('添加收藏失败:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: '添加收藏失败' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      );
    }

    const { documentId } = await request.json();
    
    if (!documentId) {
      return NextResponse.json(
        { error: '缺少文档ID' },
        { status: 400 }
      );
    }

    const success = await removeFromFavorites(session.user.id, documentId);
    
    if (success) {
      return NextResponse.json({ message: '取消收藏成功' });
    } else {
      return NextResponse.json(
        { error: '取消收藏失败' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('取消收藏失败:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: '取消收藏失败' },
      { status: 500 }
    );
  }
}
