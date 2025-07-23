import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getAllCategories } from '@/lib/db/categories';
import { CategoriesManager } from '@/components/categories-manager';
import { AdminLayout } from '@/components/admin-layout';

export const metadata: Metadata = {
  title: '分类管理 - 管理后台',
  description: '管理博客分类',
};

export default async function CategoriesPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.isAdmin) {
    redirect('/auth/signin');
  }

  const categories = await getAllCategories();

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">分类管理</h1>
        <p className="text-gray-600 dark:text-gray-300">
          管理博客文章的分类
        </p>
      </div>

      <CategoriesManager initialCategories={categories} />
    </AdminLayout>
  );
}
