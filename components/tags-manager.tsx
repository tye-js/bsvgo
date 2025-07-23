'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Tag as TagIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Tag } from '@/db/schema';

interface TagsManagerProps {
  initialTags: Tag[];
}

export function TagsManager({ initialTags }: TagsManagerProps) {
  const [tags, setTags] = useState(initialTags);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // 表单状态
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    color: '#6B7280',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      color: '#6B7280',
    });
    setIsCreating(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.slug.trim()) return;

    setIsLoading(true);

    try {
      const url = editingId ? `/api/tags/${editingId}` : '/api/tags';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const tag = await response.json();
        
        if (editingId) {
          setTags(tags.map(t => t.id === editingId ? tag : t));
        } else {
          setTags([...tags, tag]);
        }
        
        resetForm();
        toast({
          variant: "success",
          title: editingId ? "更新成功" : "创建成功",
          description: editingId ? "标签已更新" : "标签已创建"
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

  const handleEdit = (tag: Tag) => {
    setFormData({
      name: tag.name,
      slug: tag.slug,
      color: tag.color || '#6B7280',
    });
    setEditingId(tag.id);
    setIsCreating(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个标签吗？')) return;

    setIsLoading(true);

    try {
      const response = await fetch(`/api/tags/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTags(tags.filter(t => t.id !== id));
        toast({
          variant: "success",
          title: "删除成功",
          description: "标签已删除"
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
              {editingId ? '编辑标签' : '创建新标签'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">标签名称 *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="输入标签名称"
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
                    placeholder="#6B7280"
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
          <h2 className="text-xl font-semibold">标签列表</h2>
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="w-4 h-4 mr-2" />
            新建标签
          </Button>
        </div>
      )}

      {/* 标签列表 */}
      <div className="flex flex-wrap gap-3">
        {tags.map((tag) => (
          <Card key={tag.id} className="w-fit">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <Badge
                  style={{
                    backgroundColor: `${tag.color}20`,
                    color: tag.color,
                    border: `1px solid ${tag.color}40`,
                  }}
                >
                  <TagIcon className="w-3 h-3 mr-1" />
                  {tag.name}
                </Badge>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(tag)}
                    className="h-6 w-6 p-0"
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(tag.id)}
                    className="h-6 w-6 p-0"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              
              <div className="text-xs text-gray-500">
                {tag.slug}
              </div>
              
              <div className="text-xs text-gray-400 mt-1">
                {new Date(tag.createdAt).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {tags.length === 0 && (
        <div className="text-center py-12">
          <TagIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无标签</h3>
          <p className="text-gray-600 mb-4">创建第一个标签来标记您的文章</p>
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="w-4 h-4 mr-2" />
            创建标签
          </Button>
        </div>
      )}
    </div>
  );
}
