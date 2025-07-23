'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { EnhancedNavigation } from '@/components/enhanced-navigation';
import { formatDate } from '@/lib/utils';
import {
  Calendar,
  User,
  ArrowRight,
  Sparkles,
  BookOpen,
  Clock,
  Eye,
  Tag,
  Folder
} from 'lucide-react';
import type { Category } from '@/db/schema';

interface Document {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  slug: string;
  keywords?: string;
  featuredImage?: string;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
  author?: {
    name: string;
    email: string;
    avatar?: string;
  };
  category?: {
    id: string;
    name: string;
    slug: string;
    color: string;
  };
}

interface ModernBlogLayoutProps {
  documents: Document[];
  searchQuery?: string;
  categories?: Category[];
}

export function ModernBlogLayout({ documents, searchQuery, categories = [] }: ModernBlogLayoutProps) {
  const router = useRouter();
  const [filteredDocuments, setFilteredDocuments] = useState(documents);

  useEffect(() => {
    if (searchQuery) {
      const filtered = documents.filter(doc =>
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (doc.keywords && doc.keywords.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredDocuments(filtered);
    } else {
      setFilteredDocuments(documents);
    }
  }, [documents, searchQuery]);

  const handleSearch = async (query: string) => {
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const getExcerpt = (content: string, maxLength: number = 150) => {
    const plainText = content.replace(/[#*`]/g, '').trim();
    return plainText.length > maxLength
      ? plainText.substring(0, maxLength) + '...'
      : plainText;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* 增强导航栏 */}
      <EnhancedNavigation onSearch={handleSearch} categories={categories} />

      {/* 主要内容 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 头部区域 */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4 mr-2" />
            现代化技术博客
          </div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 dark:from-gray-100 dark:via-blue-100 dark:to-purple-100 bg-clip-text text-transparent mb-6">
            探索技术前沿
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
            分享最新的技术见解、开发经验和创新思维，与开发者社区一起成长
          </p>

          {searchQuery && (
            <div className="mb-8">
              <p className="text-gray-600 dark:text-gray-300">
                搜索 &ldquo;{searchQuery}&rdquo; 的结果：找到 {filteredDocuments.length} 篇文章
              </p>
            </div>
          )}
        </div>

        {/* 文章列表 */}
        {filteredDocuments.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
              {searchQuery ? '未找到相关文章' : '暂无文章'}
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              {searchQuery ? '尝试使用其他关键词搜索' : '敬请期待精彩内容'}
            </p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredDocuments.map((doc) => (
              <article
                key={doc.id}
                className="group bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700"
              >
                {/* 特色图片 */}
                {doc.featuredImage && (
                  <div className="aspect-video overflow-hidden relative">
                    <Image
                      src={doc.featuredImage}
                      alt={doc.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                )}

                <div className="p-6">
                  {/* 分类和标签 */}
                  <div className="flex items-center gap-2 mb-3">
                    {doc.category && (
                      <span
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: `${doc.category.color}20`,
                          color: doc.category.color,
                        }}
                      >
                        <Folder className="w-3 h-3 mr-1" />
                        {doc.category.name}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
                    <Calendar className="w-4 h-4 mr-1" />
                    {formatDate(new Date(doc.createdAt))}
                    {doc.author && (
                      <>
                        <span className="mx-2">•</span>
                        <User className="w-4 h-4 mr-1" />
                        {doc.author.name}
                      </>
                    )}
                    <span className="mx-2">•</span>
                    <Eye className="w-4 h-4 mr-1" />
                    {doc.viewCount} 次浏览
                  </div>

                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    <Link href={`/docs/${doc.slug}`}>
                      {doc.title}
                    </Link>
                  </h2>

                  <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                    {doc.excerpt || getExcerpt(doc.content)}
                  </p>

                  {/* 关键字 */}
                  {doc.keywords && (
                    <div className="flex items-center gap-1 mb-4">
                      <Tag className="w-3 h-3 text-gray-400 dark:text-gray-500" />
                      <span className="text-xs text-gray-500 dark:text-gray-400">{doc.keywords}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <Clock className="w-4 h-4 mr-1" />
                      {Math.ceil(doc.content.length / 1000)} 分钟阅读
                    </div>

                    <Link
                      href={`/docs/${doc.slug}`}
                      className="inline-flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm group-hover:translate-x-1 transition-transform"
                    >
                      阅读更多
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* 页脚 */}
      <footer className="bg-gray-900 text-white py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">TechBlog</span>
            </div>
            <p className="text-gray-400 mb-4">
              分享技术，传播知识，共同成长
            </p>
            <p className="text-sm text-gray-500">
              © 2024 TechBlog. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
