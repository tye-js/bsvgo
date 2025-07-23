import { Metadata } from 'next';
import { getAllCategories } from '@/lib/db/categories';
import { getAllTags } from '@/lib/db/tags';
import { EnhancedEditorForm } from '@/components/enhanced-editor-form';

export const metadata: Metadata = {
  title: '新建文档 - Markdown 编辑器',
  description: '创建一个新的 Markdown 文档',
};

export default async function NewDocumentPage() {
  // 在构建时跳过数据库查询
  if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">新建文档</h1>
            <p className="text-muted-foreground">
              创建一个新的 Markdown 文档
            </p>
          </div>

          <EnhancedEditorForm
            categories={[]}
            allTags={[]}
            documentTags={[]}
          />
        </div>
      </div>
    );
  }

  try {
    // 获取分类和标签
    const [categories, allTags] = await Promise.all([
      getAllCategories(),
      getAllTags()
    ]);

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">新建文档</h1>
            <p className="text-muted-foreground">
              创建一个新的 Markdown 文档
            </p>
          </div>

          <EnhancedEditorForm
            categories={categories}
            allTags={allTags}
            documentTags={[]}
          />
        </div>
      </div>
    );
  } catch (error) {
    console.error('获取编辑器数据失败:', error);
    // 如果数据库查询失败，返回空数据
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">新建文档</h1>
            <p className="text-muted-foreground">
              创建一个新的 Markdown 文档
            </p>
          </div>

          <EnhancedEditorForm
            categories={[]}
            allTags={[]}
            documentTags={[]}
          />
        </div>
      </div>
    );
  }
}
