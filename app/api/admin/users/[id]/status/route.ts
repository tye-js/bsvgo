import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { updateUserStatus } from '@/lib/db/users'
import { z } from 'zod'

const statusSchema = z.object({
  status: z.enum(['active', 'disabled']),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { message: '权限不足' },
        { status: 403 }
      )
    }

    const { id } = await params

    // 防止禁用自己的账户
    if (session.user.id === id) {
      return NextResponse.json(
        { message: '不能修改自己的账户状态' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { status } = statusSchema.parse(body)

    const updatedUser = await updateUserStatus(id, status)
    
    // 不返回密码字段
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = updatedUser
    
    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error('更新用户状态失败:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { message: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { message: '更新用户状态失败' },
      { status: 500 }
    )
  }
}
