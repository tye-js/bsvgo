import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'

export async function requireAdmin() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin?callbackUrl=/admin')
  }
  
  if (!session.user?.isAdmin) {
    redirect('/?error=access_denied')
  }
  
  return session
}

export async function checkAdminPermission() {
  const session = await getServerSession(authOptions)
  
  return {
    isAuthenticated: !!session,
    isAdmin: !!session?.user?.isAdmin,
    user: session?.user || null,
  }
}
