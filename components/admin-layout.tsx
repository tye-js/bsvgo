'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { 
  Settings, 
  BarChart3, 
  FileText, 
  Folder, 
  Tag, 
  Users, 
  Home, 
  LogOut 
} from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();

  const navigationItems = [
    {
      href: '/admin',
      label: '仪表板',
      icon: BarChart3,
    },
    {
      href: '/admin/documents',
      label: '文档管理',
      icon: FileText,
    },
    {
      href: '/admin/categories',
      label: '分类管理',
      icon: Folder,
    },
    {
      href: '/admin/tags',
      label: '标签管理',
      icon: Tag,
    },
    {
      href: '/admin/users',
      label: '用户管理',
      icon: Users,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 侧边栏 */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 shadow-lg">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center px-6 py-4 border-b dark:border-gray-700">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mr-3">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">管理后台</span>
          </div>

          {/* 导航菜单 */}
          <nav className="flex-1 px-6 py-4">
            <div className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* 底部操作 */}
          <div className="px-6 py-4 border-t dark:border-gray-700">
            <div className="space-y-2">
              <Button variant="outline" size="sm" asChild className="w-full justify-start">
                <Link href="/">
                  <Home className="w-4 h-4 mr-2" />
                  返回首页
                </Link>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => signOut()}
                className="w-full justify-start"
              >
                <LogOut className="w-4 h-4 mr-2" />
                退出登录
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="ml-64">
        <div className="px-8 py-6">
          {children}
        </div>
      </div>
    </div>
  );
}
