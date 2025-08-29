
import { getPublishedDocuments } from '@/lib/db/documents';
import { ModernBlogLayout } from '@/components/modern-blog-layout';

export default async function Home() {

  try {
    const result = await Promise.allSettled([
      getPublishedDocuments(),
      getCategoryFromApi()
    ]);
    const documents = result[0].status==="fulfilled"?result[0].value:undefined
 
    const categories = result[1].status==="fulfilled"?result[1].value:undefined

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

async function getCategoryFromApi() {
  const result = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/categories`,{
    method:'GET'
  })
  return await result.json()
}
