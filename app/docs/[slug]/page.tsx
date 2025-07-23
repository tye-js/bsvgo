import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';

// 扩展的文档类型，包含关联数据
type DocumentWithRelations = {
  id: string;
  title: string;
  content: string;
  excerpt: string | null;
  slug: string;
  keywords: string | null;
  featuredImage: string | null;
  authorId: string;
  categoryId: string | null;
  published: boolean;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
  author?: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  };
  category?: {
    id: string;
    name: string;
    slug: string;
    color: string;
  };
};
import { getDocumentBySlug, incrementViewCount } from '@/lib/db/documents';
import { getTagsByDocumentId } from '@/lib/db/tags';
import { MarkdownRenderer } from '@/components/markdown-renderer';
import { CommentsSection } from '@/components/comments-section';
import { FavoriteButton } from '@/components/favorite-button';
import { ReadingProgress } from '@/components/reading-progress';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { formatDate } from '@/lib/utils';
import { Edit, ArrowLeft, Calendar, User, Eye, Tag, Folder, Share2 } from 'lucide-react';
import Image from 'next/image';

interface DocumentPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: DocumentPageProps): Promise<Metadata> {
  const { slug } = await params;

  // 在构建时跳过数据库查询
  if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
    return {
      title: `${slug} - Markdown 编辑器`,
      description: `查看文档: ${slug}`,
    };
  }

  try {
    const document = await getDocumentBySlug(slug);

    if (!document) {
      return {
        title: '文档未找到',
      };
    }

    return {
      title: `${document.title} - Markdown 编辑器`,
      description: document.content.substring(0, 160) || `查看文档: ${document.title}`,
    };
  } catch (error) {
    console.error('获取文档元数据失败:', error);
    return {
      title: `${slug} - Markdown 编辑器`,
      description: `查看文档: ${slug}`,
    };
  }
}

export default async function DocumentPage({ params }: DocumentPageProps) {
  const { slug } = await params;
  const document = await getDocumentBySlug(slug) as DocumentWithRelations;

  if (!document) {
    notFound();
  }

  // 增加浏览次数
  await incrementViewCount(document.id);

  // 获取标签
  const tags = await getTagsByDocumentId(document.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* 阅读进度条 */}
      <ReadingProgress />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* 头部导航 */}
          <div className="flex items-center justify-between mb-6">
            <Button variant="outline" asChild>
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回首页
              </Link>
            </Button>

            <div className="flex items-center gap-2">
              <FavoriteButton documentId={document.id} />
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                分享
              </Button>
              <Button asChild>
                <Link href={`/editor/${document.id}`}>
                  <Edit className="w-4 h-4 mr-2" />
                  编辑文档
                </Link>
              </Button>
            </div>
          </div>

          {/* 文档内容卡片 */}
          <article className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* 特色图片 */}
            {document.featuredImage && (
              <div className="aspect-video overflow-hidden">
                <Image
                  src={document.featuredImage}
                  alt={document.title}
                  width={1200}
                  height={630}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="p-8">
              {/* 分类和标签 */}
              <div className="flex items-center gap-2 mb-4">
                {document.category && (
                  <span
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                    style={{
                      backgroundColor: `${document.category.color}20`,
                      color: document.category.color,
                    }}
                  >
                    <Folder className="w-4 h-4 mr-1" />
                    {document.category.name}
                  </span>
                )}
                {tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: `${tag.color || '#6B7280'}20`,
                      color: tag.color || '#6B7280',
                    }}
                  >
                    <Tag className="w-3 h-3 mr-1" />
                    {tag.name}
                  </span>
                ))}
              </div>

              {/* 文档标题 */}
              <h1 className="text-4xl font-bold mb-6 text-gray-900">{document.title}</h1>

              {/* 文档元信息 */}
              <div className="flex items-center gap-6 text-sm text-gray-600 mb-8">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {formatDate(new Date(document.createdAt))}
                </div>
                {document.author && (
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-1" />
                    {document.author.name}
                  </div>
                )}
                <div className="flex items-center">
                  <Eye className="w-4 h-4 mr-1" />
                  {document.viewCount} 次浏览
                </div>
                {document.updatedAt !== document.createdAt && (
                  <div className="text-gray-500">
                    更新于 {formatDate(new Date(document.updatedAt))}
                  </div>
                )}
              </div>

              {/* 关键字 */}
              {document.keywords && (
                <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">关键字:</span>
                    <span className="text-sm text-gray-600">{document.keywords}</span>
                  </div>
                </div>
              )}

              <Separator className="mb-8" />

              {/* 文档内容 */}
              <MarkdownRenderer content={document.content} />
            </div>
          </article>

          {/* 评论区 */}
          <div className="mt-8">
            <CommentsSection documentId={document.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
