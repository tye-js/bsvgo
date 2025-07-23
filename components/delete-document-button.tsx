'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DeleteDocumentButtonProps {
  documentId: string;
}

export function DeleteDocumentButton({ documentId }: DeleteDocumentButtonProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('确定要删除这个文档吗？此操作无法撤销。')) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || '删除失败');
      }

      // 刷新页面以更新文档列表
      toast({
        variant: "success",
        title: "删除成功",
        description: "文档已成功删除"
      });
      router.refresh();
    } catch (error) {
      console.error('删除文档失败:', error);
      toast({
        variant: "destructive",
        title: "删除失败",
        description: error instanceof Error ? error.message : '删除失败，请重试'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleDelete}
      disabled={isDeleting}
    >
      <Trash2 className="w-4 h-4" />
    </Button>
  );
}
