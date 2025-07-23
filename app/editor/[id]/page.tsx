import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getDocumentById } from '@/lib/db/documents';
import { getAllCategories } from '@/lib/db/categories';
import { getAllTags } from '@/lib/db/tags';
import { getTagsByDocumentId } from '@/lib/db/tags';
import { EnhancedEditorForm } from '@/components/enhanced-editor-form';

interface EditDocumentPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: EditDocumentPageProps): Promise<Metadata> {
  const { id } = await params;
  const document = await getDocumentById(id);
  
  if (!document) {
    return {
      title: '文档未找到',
    };
  }

  return {
    title: `编辑 ${document.title} - Markdown 编辑器`,
    description: `编辑文档: ${document.title}`,
  };
}

export default async function EditDocumentPage({ params }: EditDocumentPageProps) {
  const { id } = await params;
  const document = await getDocumentById(id);

  if (!document) {
    notFound();
  }

  // 获取分类、标签和文档标签
  const [categories, allTags, documentTags] = await Promise.all([
    getAllCategories(),
    getAllTags(),
    getTagsByDocumentId(id)
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">编辑文档</h1>
          <p className="text-muted-foreground">
            编辑文档: {document.title}
          </p>
        </div>

        <EnhancedEditorForm
          document={document}
          categories={categories}
          allTags={allTags}
          documentTags={documentTags}
        />
      </div>
    </div>
  );
}
