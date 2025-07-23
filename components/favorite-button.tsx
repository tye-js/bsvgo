'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

interface FavoriteButtonProps {
  documentId: string;
  initialIsFavorited?: boolean;
  initialCount?: number;
}

export function FavoriteButton({
  documentId,
  initialIsFavorited = false,
  initialCount = 0
}: FavoriteButtonProps) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited);
  const [count, setCount] = useState(initialCount);
  const [isLoading, setIsLoading] = useState(false);

  // 检查收藏状态
  useEffect(() => {
    checkFavoriteStatus();
  }, [session?.user?.id, documentId]);

  const checkFavoriteStatus = async () => {
    try {
      const response = await fetch(`/api/favorites/check?documentId=${documentId}`);
      if (response.ok) {
        const data = await response.json();
        setIsFavorited(data.isFavorited);
        setCount(data.count);
      }
    } catch (error) {
      console.error('检查收藏状态失败:', error);
    }
  };

  const handleToggleFavorite = async () => {
    if (!session) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/favorites', {
        method: isFavorited ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ documentId }),
      });

      if (response.ok) {
        setIsFavorited(!isFavorited);
        setCount(prev => isFavorited ? prev - 1 : prev + 1);
        toast({
          variant: "success",
          title: isFavorited ? "取消收藏" : "收藏成功",
          description: isFavorited ? "已取消收藏这篇文章" : "已收藏这篇文章"
        });
      } else {
        const error = await response.text();
        toast({
          variant: "destructive",
          title: "操作失败",
          description: error || '操作失败'
        });
      }
    } catch (error) {
      console.error('收藏操作失败:', error);
      toast({
        variant: "destructive",
        title: "操作失败",
        description: '操作失败，请重试'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!session) {
    return (
      <Link href="/auth/signin">
        <Button variant="outline" size="sm">
          <Heart className="w-4 h-4 mr-2" />
          收藏 ({count})
        </Button>
      </Link>
    );
  }

  return (
    <Button
      variant={isFavorited ? "default" : "outline"}
      size="sm"
      onClick={handleToggleFavorite}
      disabled={isLoading}
      className={isFavorited ? "bg-red-500 hover:bg-red-600 text-white" : ""}
    >
      <Heart 
        className={`w-4 h-4 mr-2 ${isFavorited ? 'fill-current' : ''}`} 
      />
      {isFavorited ? '已收藏' : '收藏'} ({count})
    </Button>
  );
}
