import { Suspense } from 'react'
import { getUserList } from '@/lib/db/users'
import { requireAdmin } from '@/lib/middleware/admin-auth'
import { columns } from './columns'
import { DataTable } from './data-table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface SearchParams {
  page?: string
  pageSize?: string
  search?: string
  membershipLevel?: string
  status?: string
  sortBy?: string
  sortOrder?: string
}

interface UserManagementPageProps {
  searchParams: SearchParams
}

async function getUserData(searchParams: SearchParams) {
  const params = {
    page: searchParams.page ? parseInt(searchParams.page) : 1,
    pageSize: searchParams.pageSize ? parseInt(searchParams.pageSize) : 10,
    search: searchParams.search || '',
    membershipLevel: searchParams.membershipLevel || '',
    status: searchParams.status || '',
    sortBy: (searchParams.sortBy as any) || 'createdAt',
    sortOrder: (searchParams.sortOrder as any) || 'desc',
  }

  try {
    return await getUserList(params)
  } catch (error) {
    console.error('获取用户列表失败:', error)
    return {
      users: [],
      total: 0,
      page: 1,
      pageSize: 10,
      totalPages: 0,
    }
  }
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <div className="h-10 w-64 bg-gray-200 rounded animate-pulse" />
        <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
        <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
      </div>
      <div className="border rounded-md">
        <div className="h-12 bg-gray-100 border-b" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 border-b last:border-b-0 bg-white" />
        ))}
      </div>
    </div>
  )
}

async function UserManagementContent({ searchParams }: UserManagementPageProps) {
  const data = await getUserData(searchParams)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">用户管理</h1>
        <p className="text-muted-foreground">
          管理系统中的所有用户账户
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>用户列表</CardTitle>
          <CardDescription>
            查看和管理所有注册用户的信息
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={data.users} />
        </CardContent>
      </Card>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>
          显示第 {((data.page - 1) * data.pageSize) + 1} - {Math.min(data.page * data.pageSize, data.total)} 条，
          共 {data.total} 条记录
        </div>
        <div>
          第 {data.page} 页，共 {data.totalPages} 页
        </div>
      </div>
    </div>
  )
}

export default async function UserManagementPage({ searchParams }: UserManagementPageProps) {
  // 验证管理员权限
  await requireAdmin()

  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={<LoadingSkeleton />}>
        <UserManagementContent searchParams={searchParams} />
      </Suspense>
    </div>
  )
}

export const metadata = {
  title: '用户管理 - 管理后台',
  description: '管理系统中的所有用户账户，包括查看、编辑、禁用和删除用户。',
}
