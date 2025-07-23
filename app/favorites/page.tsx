import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getFavoritesByUserId } from '@/lib/db/favorites';
import { FavoritesList } from '@/components/favorites-list';

export const metadata: Metadata = {
  title: '我的收藏 - TechBlog',
  description: '查看您收藏的文章',
};

export default async function FavoritesPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect('/auth/signin');
  }

  const favorites = await getFavoritesByUserId(session.user.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">我的收藏</h1>
            <p className="text-gray-600 dark:text-gray-300">
              您收藏的所有文章 ({favorites.length} 篇)
            </p>
          </div>

          <FavoritesList favorites={favorites} />
        </div>
      </div>
    </div>
  );
}
