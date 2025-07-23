
import { getPublishedDocuments } from '@/lib/db/documents';
import { getAllCategories } from '@/lib/db/categories';
import { ModernBlogLayout } from '@/components/modern-blog-layout';

export default async function Home() {
  const [documents, categories] = await Promise.all([
    getPublishedDocuments(),
    getAllCategories()
  ]);

  return <ModernBlogLayout documents={documents} categories={categories} />;
}
