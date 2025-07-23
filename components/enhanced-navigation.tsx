'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  Search,
  Menu,
  X,
  LogIn,
  LogOut,
  Settings,
  BookOpen,
  Newspaper,
  Code,
  TrendingUp,
  User,
  Heart,
  Folder
} from 'lucide-react';
import type { Category } from '@/db/schema';

interface EnhancedNavigationProps {
  onSearch?: (query: string) => void;
  categories?: Category[];
}

export function EnhancedNavigation({ onSearch, categories = [] }: EnhancedNavigationProps) {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && onSearch) {
      onSearch(searchQuery.trim());
    }
  };

  // 图标映射
  const getIconForCategory = (slug: string) => {
    const iconMap: Record<string, any> = {
      'news': Newspaper,
      'tech-analysis': Code,
      'app-trading': TrendingUp,
      'technology': Code,
      'business': TrendingUp,
      'tutorial': BookOpen,
      'default': Folder
    };
    return iconMap[slug] || iconMap.default;
  };

  // 从数据库分类生成导航项
  const navigationItems = categories.length > 0
    ? categories.map(category => ({
        name: category.name,
        href: `/category/${category.slug}`,
        icon: getIconForCategory(category.slug),
        description: category.description || `${category.name}相关内容`
      }))
    : [
        // 默认导航项（当没有分类时）
        {
          name: '最新新闻',
          href: '/category/news',
          icon: Newspaper,
          description: '最新的技术资讯和行业动态'
        },
        {
          name: '技术解析',
          href: '/category/tech-analysis',
          icon: Code,
          description: '深度技术分析和解决方案'
        },
        {
          name: '应用交易',
          href: '/category/app-trading',
          icon: TrendingUp,
          description: '应用开发和交易相关内容'
        },
      ];

  return (
    <nav className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                TechBlog
              </span>
            </Link>
          </div>

          {/* 桌面端导航 */}
          <div className="hidden lg:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="group relative flex items-center space-x-1 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <item.icon className="w-4 h-4" />
                <span className="font-medium">{item.name}</span>
                
                {/* 悬停提示 */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                  {item.description}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-gray-900 dark:border-b-gray-700"></div>
                </div>
              </Link>
            ))}
          </div>

          {/* 搜索框 */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="搜索文章..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full rounded-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </form>
          </div>

          {/* 用户菜单 */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />

            {session ? (
              <>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/favorites">
                    <Heart className="w-4 h-4 mr-2" />
                    收藏
                  </Link>
                </Button>

                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                  {session.user.avatar ? (
                    <img
                      src={session.user.avatar}
                      alt={session.user.name}
                      className="w-6 h-6 rounded-full"
                    />
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                  <span>欢迎, {session.user.name}</span>
                </div>
                {session.user.isAdmin && (
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/admin">
                      <Settings className="w-4 h-4 mr-2" />
                      管理后台
                    </Link>
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => signOut()}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  退出
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/auth/signin">
                    <LogIn className="w-4 h-4 mr-2" />
                    登录
                  </Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/auth/signup">
                    注册
                  </Link>
                </Button>
              </>
            )}
          </div>

          {/* 移动端菜单按钮 */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* 移动端菜单 */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700">
            {/* 移动端搜索 */}
            <div className="mb-4">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="搜索文章..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full"
                />
              </form>
            </div>

            {/* 导航链接 */}
            <div className="space-y-2 mb-4">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center space-x-3 px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <item.icon className="w-4 h-4" />
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{item.description}</div>
                  </div>
                </Link>
              ))}
            </div>

            {/* 用户操作 */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              {session ? (
                <div className="space-y-2">
                  <div className="px-4 py-2 text-sm text-gray-600 flex items-center space-x-2">
                    {session.user.avatar ? (
                      <img
                        src={session.user.avatar}
                        alt={session.user.name}
                        className="w-6 h-6 rounded-full"
                      />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                    <span>欢迎, {session.user.name}</span>
                  </div>
                  {session.user.isAdmin && (
                    <Link
                      href="/admin"
                      className="block px-4 py-2 text-sm hover:bg-gray-100 rounded-md"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      管理后台
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      signOut();
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 rounded-md"
                  >
                    退出登录
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link
                    href="/auth/signin"
                    className="block px-4 py-2 text-sm hover:bg-gray-100 rounded-md"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    登录
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="block px-4 py-2 text-sm hover:bg-gray-100 rounded-md"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    注册
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
