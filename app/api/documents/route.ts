import { NextRequest, NextResponse } from 'next/server';
import { createDocument, getAllDocuments } from '@/lib/db/documents';
import { createDocumentSchema } from '@/lib/validations';
import { ZodError } from 'zod';
import { ZodError } from 'zod';

export async function GET() {
  try {
    const documents = await getAllDocuments();
    return NextResponse.json(documents);
  } catch (error) {
    console.error('获取文档列表失败:', error);
    return NextResponse.json(
      { error: '获取文档列表失败' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 验证请求数据
    const validatedData = createDocumentSchema.parse(body);

    // 确保有作者ID
    if (!body.authorId) {
      return NextResponse.json(
        { error: '缺少作者信息' },
        { status: 400 }
      );
    }

    // 创建文档
    const document = await createDocument({
      ...validatedData,
      authorId: body.authorId,
      tagIds: body.tagIds,
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error('创建文档失败:', error);

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
      { error: '创建文档失败，请稍后重试' },
      { status: 500 }
    );
  }
}
