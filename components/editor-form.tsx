'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Document } from '@/db';
import { MarkdownEditor } from '@/components/markdown-editor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { generateSlug } from '@/lib/utils';
import { ArrowLeft, Save, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

interface EditorFormProps {
  document?: Document;
}

export function EditorForm({ document }: EditorFormProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const [title, setTitle] = useState(document?.title || '');
  const [slug, setSlug] = useState(document?.slug || '');
  const [content, setContent] = useState(document?.content || '');
  const [published, setPublished] = useState(document?.published || false);
  const [isLoading, setIsLoading] = useState(false);

  // 检查用户权限
  useEffect(() => {
    if (status === 'loading') return;

    if (!session || !session.user.isAdmin) {
      router.push('/auth/signin?message=您需要管理员权限才能访问编辑器');
    }
  }, [session, status, router]);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    // 如果是新文档且 slug 为空，自动生成 slug
    if (!document && !slug) {
      setSlug(generateSlug(value));
    }
  };

  const handleSave = async (shouldPublish?: boolean) => {
    if (!title.trim()) {
      toast({
        variant: "destructive",
        title: "验证失败",
        description: "请输入文档标题"
      });
      return;
    }

    if (!slug.trim()) {
      toast({
        variant: "destructive",
        title: "验证失败",
        description: "请输入文档 Slug"
      });
      return;
    }

    if (!session?.user?.id) {
      toast({
        variant: "destructive",
        title: "认证失败",
        description: "用户信息无效，请重新登录"
      });
      return;
    }

    setIsLoading(true);

    try {
      const url = document ? `/api/documents/${document.id}` : '/api/documents';
      const method = document ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          slug: slug.trim(),
          content: content.trim(),
          published: shouldPublish !== undefined ? shouldPublish : published,
          authorId: session.user.id,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || '保存失败');
      }

      await response.json();

      toast({
        variant: "success",
        title: "保存成功",
        description: shouldPublish ? "文档已发布" : "文档已保存"
      });

      // 跳转到管理后台
      router.push('/admin');
    } catch (error) {
      console.error('保存文档失败:', error);
      toast({
        variant: "destructive",
        title: "保存失败",
        description: error instanceof Error ? error.message : '保存失败，请重试'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 如果正在加载或用户未登录，显示加载状态
  if (status === 'loading' || !session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 头部操作栏 */}
      <div className="flex items-center justify-between">
        <Button variant="outline" asChild>
          <Link href="/admin">
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回管理后台
          </Link>
        </Button>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setPublished(!published)}
              className={published ? 'bg-green-50 border-green-200 text-green-700' : ''}
            >
              {published ? (
                <>
                  <Eye className="w-4 h-4 mr-2" />
                  已发布
                </>
              ) : (
                <>
                  <EyeOff className="w-4 h-4 mr-2" />
                  草稿
                </>
              )}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => handleSave(false)}
              disabled={isLoading}
            >
              <Save className="w-4 h-4 mr-2" />
              保存草稿
            </Button>
            <Button
              onClick={() => handleSave(true)}
              disabled={isLoading}
            >
              <Eye className="w-4 h-4 mr-2" />
              {isLoading ? '发布中...' : '发布'}
            </Button>
          </div>
        </div>
      </div>

      <Separator />

      {/* 文档信息表单 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-2">
            文档标题
          </label>
          <Input
            id="title"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="输入文档标题"
            className="w-full"
          />
        </div>
        
        <div>
          <label htmlFor="slug" className="block text-sm font-medium mb-2">
            文档 Slug
          </label>
          <Input
            id="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="输入文档 slug"
            className="w-full"
          />
          <p className="text-xs text-muted-foreground mt-1">
            用于生成文档 URL，只能包含小写字母、数字和连字符
          </p>
        </div>
      </div>

      {/* Markdown 编辑器 */}
      <div>
        <label className="block text-sm font-medium mb-2">
          文档内容
        </label>
        <MarkdownEditor
          value={content}
          onChange={setContent}
          onSave={() => handleSave()}
          className="min-h-[600px]"
        />
      </div>
    </div>
  );
}
