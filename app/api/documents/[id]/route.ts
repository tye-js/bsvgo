import { NextRequest, NextResponse } from 'next/server';
import { getDocumentById, updateDocument, deleteDocument } from '@/lib/db/documents';
import { updateDocumentSchema } from '@/lib/validations';
import { ZodError } from 'zod';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const document = await getDocumentById(id);
    
    if (!document) {
      return NextResponse.json(
        { error: '文档未找到' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(document);
  } catch (error) {
    console.error('获取文档失败:', error);
    return NextResponse.json(
      { error: '获取文档失败' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // 验证请求数据
    const validatedData = updateDocumentSchema.parse(body);

    // 更新文档
    const document = await updateDocument(id, {
      ...validatedData,
      tagIds: body.tagIds,
    });
    
    if (!document) {
      return NextResponse.json(
        { error: '文档未找到' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(document);
  } catch (error) {
    console.error('更新文档失败:', error);

    // 处理 Zod 验证错误
    if (error instanceof ZodError) {
      const fieldErrors = error.errors.map(err => {
        const field = err.path.join('.');
        const fieldNames: Record<string, string> = {
          'title': '标题',
          'slug': 'URL标识',
          'content': '内容',
          'excerpt': '摘要',
          'keywords': '关键字',
          'categoryId': '分类',
          'tagIds': '标签'
        };

        return `${fieldNames[field] || field}: ${err.message}`;
      });

      return NextResponse.json(
        { error: fieldErrors[0] || '数据验证失败' },
        { status: 400 }
      );
    }

    // 处理数据库约束错误
    if (error instanceof Error) {
      if (error.message.includes('UNIQUE constraint')) {
        if (error.message.includes('slug')) {
          return NextResponse.json(
            { error: 'URL标识已存在，请使用不同的 Slug' },
            { status: 400 }
          );
        }
        return NextResponse.json(
          { error: '数据已存在，请检查输入内容' },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: '更新文档失败，请稍后重试' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = await deleteDocument(id);
    
    if (!success) {
      return NextResponse.json(
        { error: '文档未找到' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: '文档删除成功' });
  } catch (error) {
    console.error('删除文档失败:', error);
    return NextResponse.json(
      { error: '删除文档失败' },
      { status: 500 }
    );
  }
}
