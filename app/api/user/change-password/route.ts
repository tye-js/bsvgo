import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { updateUserPassword } from '@/lib/db/users'
import { changePasswordSchema } from '@/lib/validations'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: '请先登录' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = changePasswordSchema.parse(body)

    await updateUserPassword(
      session.user.id,
      validatedData.currentPassword,
      validatedData.newPassword
    )
    
    return NextResponse.json({ message: '密码修改成功' })
  } catch (error) {
    console.error('修改密码失败:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { message: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { message: '修改密码失败' },
      { status: 500 }
    )
  }
}
