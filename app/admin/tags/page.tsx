import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getAllTags } from '@/lib/db/tags';
import { TagsManager } from '@/components/tags-manager';
import { AdminLayout } from '@/components/admin-layout';

export const metadata: Metadata = {
  title: '标签管理 - 管理后台',
  description: '管理博客标签',
};

export default async function TagsPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.isAdmin) {
    redirect('/auth/signin');
  }

  const tags = await getAllTags();

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">标签管理</h1>
        <p className="text-gray-600 dark:text-gray-300">
          管理博客文章的标签
        </p>
      </div>

      <TagsManager initialTags={tags} />
    </AdminLayout>
  );
}
