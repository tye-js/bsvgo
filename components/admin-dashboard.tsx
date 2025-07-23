'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatDate } from '@/lib/utils';
import { DeleteDocumentButton } from '@/components/delete-document-button';
import {
  Plus,
  Search,
  Edit,
  Eye,
  Calendar,
  User,
  FileText,
  BookOpen,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface Document {
  id: string;
  title: string;
  content: string;
  slug: string;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
  author?: {
    name: string;
    email: string;
  };
}

interface AdminDashboardProps {
  documents: Document[];
}

export function AdminDashboard({ documents }: AdminDashboardProps) {
  const { data: session } = useSession();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const publishedCount = documents.filter(doc => doc.published).length;
  const draftCount = documents.filter(doc => !doc.published).length;

  return (
    <div>
      {/* 用户信息卡片 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-4">
            <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">欢迎回来，{session?.user.name}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">管理员</p>
          </div>
        </div>
      </div>
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">仪表板</h1>
        <p className="text-gray-600 dark:text-gray-300">管理您的博客内容和用户</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-4">
              <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">总文档数</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{documents.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mr-4">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">已发布</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{publishedCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center mr-4">
              <XCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">草稿</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{draftCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 文档管理 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
        <div className="px-6 py-4 border-b dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">文档管理</h2>
            <Button asChild>
              <Link href="/editor/new">
                <Plus className="w-4 h-4 mr-2" />
                新建文档
              </Link>
            </Button>
          </div>
        </div>

        <div className="p-6">
          {/* 搜索框 */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="搜索文档..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

              {/* 文档列表 */}
              {filteredDocuments.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchTerm ? '未找到相关文档' : '暂无文档'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {searchTerm ? '尝试使用其他关键词搜索' : '开始创建您的第一个文档'}
                  </p>
                  {!searchTerm && (
                    <Button asChild>
                      <Link href="/editor/new">
                        <Plus className="w-4 h-4 mr-2" />
                        创建文档
                      </Link>
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <h3 className="text-lg font-medium text-gray-900 mr-3">
                              {doc.title}
                            </h3>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              doc.published 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {doc.published ? '已发布' : '草稿'}
                            </span>
                          </div>
                          
                          <div className="flex items-center text-sm text-gray-500 mb-2">
                            <Calendar className="w-4 h-4 mr-1" />
                            创建于 {formatDate(new Date(doc.createdAt))}
                            {doc.updatedAt !== doc.createdAt && (
                              <span className="ml-4">
                                更新于 {formatDate(new Date(doc.updatedAt))}
                              </span>
                            )}
                            {doc.author && (
                              <>
                                <span className="mx-2">•</span>
                                <User className="w-4 h-4 mr-1" />
                                {doc.author.name}
                              </>
                            )}
                          </div>
                          
                          {doc.content && (
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {doc.content.substring(0, 150)}
                              {doc.content.length > 150 && '...'}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/docs/${doc.slug}`}>
                              <Eye className="w-4 h-4" />
                            </Link>
                          </Button>
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
              )}
        </div>
      </div>
    </div>
  );
}
