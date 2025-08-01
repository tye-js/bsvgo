import { MetadataRoute } from 'next';
import { getPublishedDocuments } from '@/lib/db/documents';
import { getAllCategories } from '@/lib/db/categories';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  // 在构建时跳过数据库查询
  if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1,
      },
      {
        url: `${baseUrl}/auth/signin`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.3,
      },
      {
        url: `${baseUrl}/auth/signup`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.3,
      },
    ];
  }

  try {
    // 获取所有已发布的文档
    const documents = await getPublishedDocuments();

    // 获取所有分类
    const categories = await getAllCategories();
  
  // 静态页面
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/auth/signin`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/auth/signup`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.3,
    },
  ];
  
  // 文档页面
  const documentPages = documents.map((doc) => ({
    url: `${baseUrl}/docs/${doc.slug}`,
    lastModified: new Date(doc.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));
  
  // 分类页面
  const categoryPages = categories.map((category) => ({
    url: `${baseUrl}/category/${category.slug}`,
    lastModified: new Date(category.createdAt),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));
  
    return [...staticPages, ...documentPages, ...categoryPages];
  } catch (error) {
    console.error('获取 sitemap 数据失败:', error);
    // 如果数据库查询失败，返回基本的静态页面
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1,
      },
      {
        url: `${baseUrl}/auth/signin`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.3,
      },
      {
        url: `${baseUrl}/auth/signup`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.3,
      },
    ];
  }
}
