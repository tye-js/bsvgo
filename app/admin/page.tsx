import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getAllDocuments } from '@/lib/db/documents';
import { AdminDashboard } from '@/components/admin-dashboard';
import { AdminLayout } from '@/components/admin-layout';

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  
  // 检查用户是否登录且是管理员
  if (!session || !session.user.isAdmin) {
    redirect('/auth/signin?message=您需要管理员权限才能访问此页面');
  }

  const documents = await getAllDocuments();

  return (
    <AdminLayout>
      <AdminDashboard documents={documents} />
    </AdminLayout>
  );
}
