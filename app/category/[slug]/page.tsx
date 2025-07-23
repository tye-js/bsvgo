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

  // 在构建时跳过数据库查询
  if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
    return {
      title: `${slug} - TechBlog`,
      description: `浏览 ${slug} 分类下的所有文章`,
    };
  }

  try {
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
  } catch (error) {
    console.error('获取分类元数据失败:', error);
    return {
      title: `${slug} - TechBlog`,
      description: `浏览 ${slug} 分类下的所有文章`,
    };
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;

  // 在构建时跳过数据库查询
  if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
    return (
      <div>
        {/* 分类头部 */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-bold mb-4">{slug}</h1>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              浏览 {slug} 分类下的所有文章
            </p>
            <div className="mt-6">
              <span className="inline-flex items-center px-4 py-2 bg-white/20 rounded-full text-sm">
                0 篇文章
              </span>
            </div>
          </div>
        </div>

        <ModernBlogLayout
          documents={[]}
          categories={[]}
        />
      </div>
    );
  }

  try {
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
  } catch (error) {
    console.error('获取分类页面数据失败:', error);
    return (
      <div>
        {/* 分类头部 */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-bold mb-4">{slug}</h1>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              浏览 {slug} 分类下的所有文章
            </p>
            <div className="mt-6">
              <span className="inline-flex items-center px-4 py-2 bg-white/20 rounded-full text-sm">
                0 篇文章
              </span>
            </div>
          </div>
        </div>

        <ModernBlogLayout
          documents={[]}
          categories={[]}
        />
      </div>
    );
  }
}
