import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileX, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto text-center">
        <FileX className="w-16 h-16 mx-auto text-muted-foreground mb-6" />
        <h1 className="text-3xl font-bold mb-4">页面未找到</h1>
        <p className="text-muted-foreground mb-8">
          抱歉，您访问的页面不存在或已被删除。
        </p>
        <Button asChild>
          <Link href="/">
            <Home className="w-4 h-4 mr-2" />
            返回首页
          </Link>
        </Button>
      </div>
    </div>
  );
}
