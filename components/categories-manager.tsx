'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Folder } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Category } from '@/db/schema';

interface CategoriesManagerProps {
  initialCategories: Category[];
}

export function CategoriesManager({ initialCategories }: CategoriesManagerProps) {
  const [categories, setCategories] = useState(initialCategories);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // 表单状态
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    color: '#3B82F6',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      color: '#3B82F6',
    });
    setIsCreating(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.slug.trim()) return;

    setIsLoading(true);

    try {
      const url = editingId ? `/api/categories/${editingId}` : '/api/categories';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const category = await response.json();
        
        if (editingId) {
          setCategories(categories.map(c => c.id === editingId ? category : c));
        } else {
          setCategories([...categories, category]);
        }
        
        resetForm();
        toast({
          variant: "success",
          title: editingId ? "更新成功" : "创建成功",
          description: editingId ? "分类已更新" : "分类已创建"
        });
      } else {
        const error = await response.text();
        toast({
          variant: "destructive",
          title: "操作失败",
          description: error || '操作失败'
        });
      }
    } catch (error) {
      console.error('操作失败:', error);
      toast({
        variant: "destructive",
        title: "操作失败",
        description: '操作失败，请重试'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (category: Category) => {
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      color: category.color || '#3B82F6',
    });
    setEditingId(category.id);
    setIsCreating(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个分类吗？')) return;

    setIsLoading(true);

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setCategories(categories.filter(c => c.id !== id));
        toast({
          variant: "success",
          title: "删除成功",
          description: "分类已删除"
        });
      } else {
        const error = await response.text();
        toast({
          variant: "destructive",
          title: "删除失败",
          description: error || '删除失败'
        });
      }
    } catch (error) {
      console.error('删除失败:', error);
      toast({
        variant: "destructive",
        title: "删除失败",
        description: '删除失败，请重试'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 自动生成 slug
  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    });
  };

  return (
    <div className="space-y-6">
      {/* 创建/编辑表单 */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingId ? '编辑分类' : '创建新分类'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">分类名称 *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="输入分类名称"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="slug">Slug *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="url-friendly-slug"
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">描述</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="分类描述（可选）"
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="color">颜色</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="color"
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-16 h-10"
                  />
                  <Input
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    placeholder="#3B82F6"
                    className="flex-1"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button type="submit" disabled={isLoading}>
                  {editingId ? '更新' : '创建'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  取消
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* 操作按钮 */}
      {!isCreating && (
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">分类列表</h2>
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="w-4 h-4 mr-2" />
            新建分类
          </Button>
        </div>
      )}

      {/* 分类列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <Card key={category.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: category.color || '#6b7280' }}
                  />
                  <h3 className="font-semibold">{category.name}</h3>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(category)}
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(category.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              
              <Badge variant="secondary" className="mb-2">
                {category.slug}
              </Badge>
              
              {category.description && (
                <p className="text-sm text-gray-600 mt-2">
                  {category.description}
                </p>
              )}
              
              <div className="text-xs text-gray-500 mt-3">
                创建于 {new Date(category.createdAt).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-12">
          <Folder className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无分类</h3>
          <p className="text-gray-600 mb-4">创建第一个分类来组织您的文章</p>
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="w-4 h-4 mr-2" />
            创建分类
          </Button>
        </div>
      )}
    </div>
  );
}
