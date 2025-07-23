'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';
import { Heart, Calendar, Eye, ArrowRight, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FavoriteItem {
  id: string;
  userId: string;
  documentId: string;
  createdAt: Date;
  document: {
    id: string;
    title: string;
    slug: string;
    excerpt?: string;
    featuredImage?: string;
    createdAt: Date;
    viewCount: number;
  };
}

interface FavoritesListProps {
  favorites: FavoriteItem[];
}

export function FavoritesList({ favorites: initialFavorites }: FavoritesListProps) {
  const [favorites, setFavorites] = useState(initialFavorites);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const handleRemoveFavorite = async (documentId: string) => {
    if (!confirm('确定要取消收藏这篇文章吗？')) return;

    setIsLoading(documentId);

    try {
      const response = await fetch('/api/favorites', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ documentId }),
      });

      if (response.ok) {
        setFavorites(favorites.filter(fav => fav.documentId !== documentId));
        toast({
          variant: "success",
          title: "取消收藏成功",
          description: "已从收藏列表中移除"
        });
      } else {
        const error = await response.text();
        toast({
          variant: "destructive",
          title: "取消收藏失败",
          description: error || '取消收藏失败'
        });
      }
    } catch (error) {
      console.error('取消收藏失败:', error);
      toast({
        variant: "destructive",
        title: "取消收藏失败",
        description: '取消收藏失败，请重试'
      });
    } finally {
      setIsLoading(null);
    }
  };

  if (favorites.length === 0) {
    return (
      <div className="text-center py-16">
        <Heart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
          暂无收藏
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          您还没有收藏任何文章，去发现一些有趣的内容吧！
        </p>
        <Button asChild>
          <Link href="/">
            浏览文章
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {favorites.map((favorite) => (
        <Card key={favorite.id} className="group hover:shadow-lg transition-shadow">
          <CardContent className="p-0">
            {/* 特色图片 */}
            {favorite.document.featuredImage && (
              <div className="aspect-video overflow-hidden rounded-t-lg">
                <img
                  src={favorite.document.featuredImage}
                  alt={favorite.document.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}
            
            <div className="p-6">
              {/* 收藏时间 */}
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
                <Heart className="w-4 h-4 mr-1 fill-current text-red-500" />
                收藏于 {formatDate(new Date(favorite.createdAt))}
              </div>
              
              {/* 文章标题 */}
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 transition-colors">
                <Link href={`/docs/${favorite.document.slug}`}>
                  {favorite.document.title}
                </Link>
              </h3>
              
              {/* 文章摘要 */}
              {favorite.document.excerpt && (
                <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                  {favorite.document.excerpt}
                </p>
              )}
              
              {/* 文章信息 */}
              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {formatDate(new Date(favorite.document.createdAt))}
                  </div>
                  <div className="flex items-center">
                    <Eye className="w-4 h-4 mr-1" />
                    {favorite.document.viewCount} 次浏览
                  </div>
                </div>
              </div>
              
              {/* 操作按钮 */}
              <div className="flex items-center justify-between">
                <Link
                  href={`/docs/${favorite.document.slug}`}
                  className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm group-hover:translate-x-1 transition-transform"
                >
                  阅读文章
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveFavorite(favorite.documentId)}
                  disabled={isLoading === favorite.documentId}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
