
import { getPublishedDocuments } from '@/lib/db/documents';
import { getAllCategories } from '@/lib/db/categories';
import { ModernBlogLayout } from '@/components/modern-blog-layout';

export default async function Home() {
  // 在构建时跳过数据库查询
  if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
    return <ModernBlogLayout
      documents={[]}
      categories={[]}
    />;
  }

  try {
    const [documents, categories] = await Promise.all([
      getPublishedDocuments(),
      getAllCategories()
    ]);

    return <ModernBlogLayout
      documents={documents as any}
      categories={categories}
    />;
  } catch (error) {
    console.error('获取首页数据失败:', error);
    // 如果数据库查询失败，返回空数据
    return <ModernBlogLayout
      documents={[]}
      categories={[]}
    />;
  }
}
