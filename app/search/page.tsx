import { Metadata } from 'next';
import { searchDocuments } from '@/lib/db/documents';
import { ModernBlogLayout } from '@/components/modern-blog-layout';

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
  }>;
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams;
  
  return {
    title: q ? `搜索 "${q}" - TechBlog` : '搜索 - TechBlog',
    description: q ? `搜索 "${q}" 的相关文章` : '搜索技术文章',
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = q || '';

  // 在构建时跳过数据库查询
  if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
    return <ModernBlogLayout
      documents={[]}
      searchQuery={query}
    />;
  }

  try {
    const documents = query ? await searchDocuments(query) : [];

    return <ModernBlogLayout
      documents={documents as any}
      searchQuery={query}
    />;
  } catch (error) {
    console.error('搜索失败:', error);
    return <ModernBlogLayout
      documents={[]}
      searchQuery={query}
    />;
  }
}
