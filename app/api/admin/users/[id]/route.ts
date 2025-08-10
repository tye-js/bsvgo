import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { updateUser, deleteUser, getUserById } from '@/lib/db/users'
import { updateUserSchema } from '@/lib/validations'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { message: '权限不足' },
        { status: 403 }
      )
    }

    const user = await getUserById(params.id)
    
    if (!user) {
      return NextResponse.json(
        { message: '用户不存在' },
        { status: 404 }
      )
    }

    // 不返回密码字段
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user
    
    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error('获取用户详情失败:', error)
    return NextResponse.json(
      { message: '获取用户详情失败' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { message: '权限不足' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = updateUserSchema.parse(body)

    const updatedUser = await updateUser(params.id, validatedData)
    
    // 不返回密码字段
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = updatedUser
    
    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error('更新用户失败:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { message: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { message: '更新用户失败' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { message: '权限不足' },
        { status: 403 }
      )
    }

    // 防止删除自己的账户
    if (session.user.id === params.id) {
      return NextResponse.json(
        { message: '不能删除自己的账户' },
        { status: 400 }
      )
    }

    await deleteUser(params.id)
    
    return NextResponse.json({ message: '用户已删除' })
  } catch (error) {
    console.error('删除用户失败:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { message: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { message: '删除用户失败' },
      { status: 500 }
    )
  }
}
