import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getAllCategories, createCategory } from '@/lib/db/categories';
import { createCategorySchema } from '@/lib/validations';

export async function GET() {
  try {
    const categories = await getAllCategories();
    return NextResponse.json(categories);
  } catch (error) {
    console.error('获取分类失败:', error);
    return NextResponse.json(
      { error: '获取分类失败' },
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
    const validatedData = createCategorySchema.parse(body);
    
    // 创建分类
    const category = await createCategory(validatedData);
    
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('创建分类失败:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: '创建分类失败' },
      { status: 500 }
    );
  }
}
