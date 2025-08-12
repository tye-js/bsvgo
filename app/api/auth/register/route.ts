import { NextRequest, NextResponse } from 'next/server';
import { createUser, getUserByEmail } from '@/lib/db/users';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.email('请输入有效的邮箱地址'),
  password: z.string().min(6, '密码至少需要6个字符'),
  name: z.string().min(1, '请输入姓名'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 验证请求数据
    const validatedData = registerSchema.parse(body);
    
    // 检查用户是否已存在
    const existingUser = await getUserByEmail(validatedData.email);
    if (existingUser) {
      return NextResponse.json(
        { error: '该邮箱已被注册' },
        { status: 400 }
      );
    }
    
    // 创建用户
    const user = await createUser(validatedData);
    
    // 返回用户信息（不包含密码）
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;
    
    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    console.error('注册失败:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: '注册失败，请重试' },
      { status: 500 }
    );
  }
}
