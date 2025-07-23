import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getDocumentsByCategory } from '@/lib/db/documents';
import { getCategoryBySlug, getAllCategories } from '@/lib/db/categories';
import { ModernBlogLayout } from '@/components/modern-blog-layout';

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  
  if (!category) {
    return {
      title: '分类未找到',
    };
  }

  return {
    title: `${category.name} - TechBlog`,
    description: category.description || `浏览 ${category.name} 分类下的所有文章`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const [category, documents, allCategories] = await Promise.all([
    getCategoryBySlug(slug),
    getDocumentsByCategory(slug),
    getAllCategories()
  ]);

  if (!category) {
    notFound();
  }

  return (
    <div>
      {/* 分类头部 */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">{category.name}</h1>
          {category.description && (
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              {category.description}
            </p>
          )}
          <div className="mt-6">
            <span className="inline-flex items-center px-4 py-2 bg-white/20 rounded-full text-sm">
              {documents.length} 篇文章
            </span>
          </div>
        </div>
      </div>
      
      <ModernBlogLayout
        documents={documents as any}
        categories={allCategories}
      />
    </div>
  );
}
