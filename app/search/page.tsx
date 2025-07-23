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
  
  const documents = query ? await searchDocuments(query) : [];

  return <ModernBlogLayout documents={documents} searchQuery={query} />;
}
