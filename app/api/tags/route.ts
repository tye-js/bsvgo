import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getAllTags, createTag } from '@/lib/db/tags';
import { createTagSchema } from '@/lib/validations';

export async function GET() {
  try {
    const tags = await getAllTags();
    return NextResponse.json(tags);
  } catch (error) {
    console.error('获取标签失败:', error);
    return NextResponse.json(
      { error: '获取标签失败' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.isAdmin) {
      return NextResponse.json(
        { error: '需要管理员权限' },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    // 验证请求数据
    const validatedData = createTagSchema.parse(body);
    
    // 创建标签
    const tag = await createTag(validatedData);
    
    return NextResponse.json(tag, { status: 201 });
  } catch (error) {
    console.error('创建标签失败:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: '创建标签失败' },
      { status: 500 }
    );
  }
}
