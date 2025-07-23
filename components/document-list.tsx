import Link from 'next/link';
import { Document } from '@/db';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { formatDate } from '@/lib/utils';
import { FileText, Plus, Edit } from 'lucide-react';
import { DeleteDocumentButton } from '@/components/delete-document-button';

interface DocumentListProps {
  documents: Document[];
}

export function DocumentList({ documents }: DocumentListProps) {
  if (documents.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">暂无文档</h3>
        <p className="text-muted-foreground mb-4">
          开始创建您的第一个 Markdown 文档
        </p>
        <Button asChild>
          <Link href="/editor/new">
            <Plus className="w-4 h-4 mr-2" />
            创建文档
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">我的文档</h2>
        <Button asChild>
          <Link href="/editor/new">
            <Plus className="w-4 h-4 mr-2" />
            新建文档
          </Link>
        </Button>
      </div>
      
      <Separator />
      
      <div className="grid gap-4">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="border rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <Link
                  href={`/docs/${doc.slug}`}
                  className="text-lg font-medium hover:text-primary transition-colors"
                >
                  {doc.title}
                </Link>
                <p className="text-sm text-muted-foreground mt-1">
                  创建于 {formatDate(new Date(doc.createdAt))}
                  {doc.updatedAt !== doc.createdAt && (
                    <span> · 更新于 {formatDate(new Date(doc.updatedAt))}</span>
                  )}
                </p>
                {doc.content && (
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {doc.content.substring(0, 150)}
                    {doc.content.length > 150 && '...'}
                  </p>
                )}
              </div>
              
              <div className="flex items-center gap-2 ml-4">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/editor/${doc.id}`}>
                    <Edit className="w-4 h-4" />
                  </Link>
                </Button>
                <DeleteDocumentButton documentId={doc.id} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
