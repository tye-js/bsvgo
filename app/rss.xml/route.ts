import { NextResponse } from 'next/server';
import { getPublishedDocuments } from '@/lib/db/documents';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  // 在构建时跳过数据库查询
  if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
    const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>TechBlog - 现代化技术博客</title>
    <description>分享最新的技术见解、开发经验和创新思维</description>
    <link>${baseUrl}</link>
    <language>zh-CN</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml"/>
  </channel>
</rss>`;

    return new NextResponse(rssXml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, s-maxage=1200, stale-while-revalidate=600',
      },
    });
  }

  try {
    const documents = await getPublishedDocuments();

  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>TechBlog - 现代化技术博客</title>
    <description>分享最新的技术见解、开发经验和创新思维</description>
    <link>${baseUrl}</link>
    <language>zh-CN</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    
    ${documents
      .map(
        (doc) => `
    <item>
      <title><![CDATA[${doc.title}]]></title>
      <description><![CDATA[${doc.excerpt || doc.content.substring(0, 200)}]]></description>
      <link>${baseUrl}/docs/${doc.slug}</link>
      <guid isPermaLink="true">${baseUrl}/docs/${doc.slug}</guid>
      <pubDate>${new Date(doc.createdAt).toUTCString()}</pubDate>
      ${doc.author ? `<author>${doc.author.email} (${doc.author.name})</author>` : ''}
      ${doc.category ? `<category><![CDATA[${doc.category.name}]]></category>` : ''}
    </item>`
      )
      .join('')}
  </channel>
</rss>`;

    return new NextResponse(rssXml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, s-maxage=1200, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('获取已发布文档列表失败:', error);
    // 如果数据库查询失败，返回空的 RSS
    const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>TechBlog - 现代化技术博客</title>
    <description>分享最新的技术见解、开发经验和创新思维</description>
    <link>${baseUrl}</link>
    <language>zh-CN</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml"/>
  </channel>
</rss>`;

    return new NextResponse(rssXml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, s-maxage=1200, stale-while-revalidate=600',
      },
    });
  }
}
