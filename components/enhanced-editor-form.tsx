'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

import { ImageUpload } from '@/components/image-upload';
import { MarkdownRenderer } from '@/components/markdown-renderer';
import { Save, Eye, EyeOff, FileText, Tag, Folder, Image as ImageIcon, X } from 'lucide-react';
import type { Document, Category, Tag as TagType } from '@/db/schema';

interface EnhancedEditorFormProps {
  document?: Document;
  categories: Category[];
  allTags: TagType[];
  documentTags: TagType[];
}

export function EnhancedEditorForm({
  document,
  categories,
  allTags,
  documentTags
}: EnhancedEditorFormProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // 清除字段错误
  const clearFieldError = (field: string) => {
    setFieldErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  // 设置字段错误
  const setFieldError = (field: string, message: string) => {
    setFieldErrors(prev => ({
      ...prev,
      [field]: message
    }));
  };

  // 实时验证单个字段
  const validateField = (field: string, value: string) => {
    switch (field) {
      case 'title':
        if (!value.trim()) {
          setFieldError('title', '标题不能为空');
        } else if (value.trim().length < 2) {
          setFieldError('title', '标题至少需要2个字符');
        } else if (value.trim().length > 200) {
          setFieldError('title', '标题不能超过200个字符');
        } else {
          clearFieldError('title');
        }
        break;

      case 'slug':
        if (!value.trim()) {
          setFieldError('slug', 'URL标识不能为空');
        } else if (!/^[a-z0-9-]+$/.test(value.trim())) {
          setFieldError('slug', '只能包含小写字母、数字和连字符');
        } else {
          clearFieldError('slug');
        }
        break;

      case 'content':
        if (!value.trim()) {
          setFieldError('content', '内容不能为空');
        } else if (value.trim().length < 10) {
          setFieldError('content', '内容至少需要10个字符');
        } else {
          clearFieldError('content');
        }
        break;
    }
  };

  // 表单状态
  const [title, setTitle] = useState(document?.title || '');
  const [content, setContent] = useState(document?.content || '');
  const [excerpt, setExcerpt] = useState(document?.excerpt || '');
  const [slug, setSlug] = useState(document?.slug || '');
  const [keywords, setKeywords] = useState(document?.keywords || '');
  const [featuredImage, setFeaturedImage] = useState(document?.featuredImage || '');
  const [categoryId, setCategoryId] = useState(document?.categoryId || '');
  const [selectedTags, setSelectedTags] = useState<TagType[]>(documentTags);
  
  // 新标签输入
  const [newTagName, setNewTagName] = useState('');

  // 自动生成 slug
  useEffect(() => {
    if (title && !document) {
      const generatedSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9\u4e00-\u9fff]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      setSlug(generatedSlug);
    }
  }, [title, document]);

  // 添加标签
  const handleAddTag = async () => {
    if (!newTagName.trim()) return;
    
    try {
      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newTagName.trim(),
          slug: newTagName.toLowerCase().replace(/\s+/g, '-'),
        }),
      });
      
      if (response.ok) {
        const newTag = await response.json();
        setSelectedTags([...selectedTags, newTag]);
        setNewTagName('');
      }
    } catch (error) {
      console.error('创建标签失败:', error);
    }
  };

  // 移除标签
  const handleRemoveTag = (tagId: string) => {
    setSelectedTags(selectedTags.filter(tag => tag.id !== tagId));
  };

  // 选择已存在的标签
  const handleSelectExistingTag = (tagId: string) => {
    const tag = allTags.find(t => t.id === tagId);
    if (tag && !selectedTags.find(t => t.id === tagId)) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  // 表单验证函数
  const validateForm = (shouldPublish: boolean) => {
    const errors: { field: string; message: string }[] = [];

    // 基础字段验证
    if (!title.trim()) {
      errors.push({
        field: "标题",
        message: "文章标题不能为空，请输入一个有意义的标题"
      });
    } else if (title.trim().length < 2) {
      errors.push({
        field: "标题",
        message: "文章标题至少需要2个字符"
      });
    } else if (title.trim().length > 200) {
      errors.push({
        field: "标题",
        message: "文章标题不能超过200个字符"
      });
    }

    if (!slug.trim()) {
      errors.push({
        field: "URL 标识",
        message: "请填写 Slug，这将用于生成文章的访问链接"
      });
    } else if (!/^[a-z0-9-]+$/.test(slug.trim())) {
      errors.push({
        field: "URL 标识",
        message: "Slug 只能包含小写字母、数字和连字符"
      });
    }

    if (!content.trim()) {
      errors.push({
        field: "内容",
        message: "文章内容不能为空，请输入文章正文"
      });
    } else if (content.trim().length < 10) {
      errors.push({
        field: "内容",
        message: "文章内容太短，请至少输入10个字符"
      });
    }

    // 发布时的额外验证
    if (shouldPublish) {
      if (!excerpt.trim()) {
        errors.push({
          field: "摘要",
          message: "发布文章时必须填写摘要，这将显示在文章列表中"
        });
      }

      if (!categoryId || categoryId === 'none') {
        errors.push({
          field: "分类",
          message: "发布文章时必须选择一个分类，请从下拉菜单中选择合适的分类"
        });
      }

      if (selectedTags.length === 0) {
        errors.push({
          field: "标签",
          message: "发布文章时至少需要选择一个标签，标签有助于读者找到相关内容"
        });
      }

      if (!keywords.trim()) {
        errors.push({
          field: "关键字",
          message: "发布文章时请填写关键字，这有助于搜索引擎优化（SEO）"
        });
      }
    }

    return errors;
  };

  // 保存文档
  const handleSave = async (shouldPublish = false) => {
    // 认证检查
    if (!session?.user?.id) {
      toast({
        variant: "destructive",
        title: "认证失败",
        description: "请先登录后再进行操作"
      });
      return;
    }

    // 表单验证
    const validationErrors = validateForm(shouldPublish);
    if (validationErrors.length > 0) {
      const firstError = validationErrors[0];

      // 设置对应字段的错误状态
      const fieldMap: Record<string, string> = {
        '标题': 'title',
        'URL 标识': 'slug',
        '内容': 'content',
        '摘要': 'excerpt',
        '分类': 'category',
        '标签': 'tags',
        '关键字': 'keywords'
      };

      const fieldKey = fieldMap[firstError.field];
      if (fieldKey) {
        setFieldError(fieldKey, firstError.message);
      }

      toast({
        variant: "destructive",
        title: `${firstError.field}验证失败`,
        description: firstError.message
      });
      return;
    }

    setIsLoading(true);

    try {
      const documentData = {
        title: title.trim(),
        content,
        excerpt: excerpt.trim(),
        slug: slug.trim(),
        keywords: keywords.trim(),
        featuredImage,
        categoryId: categoryId || null,
        published: shouldPublish,
        tagIds: selectedTags.map(tag => tag.id),
        authorId: session.user.id,
      };

      const url = document ? `/api/documents/${document.id}` : '/api/documents';
      const method = document ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(documentData),
      });

      if (response.ok) {
        const savedDocument = await response.json();
        toast({
          variant: "success",
          title: "保存成功",
          description: shouldPublish ? "文档已发布" : "文档已保存为草稿"
        });
        router.push(`/docs/${savedDocument.slug}`);
      } else {
        let errorMessage = '保存失败';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // 如果不是 JSON 格式，尝试读取文本
          try {
            errorMessage = await response.text() || errorMessage;
          } catch {
            // 如果都失败了，使用默认错误信息
          }
        }

        toast({
          variant: "destructive",
          title: "保存失败",
          description: errorMessage
        });
      }
    } catch (error) {
      console.error('保存文档失败:', error);
      toast({
        variant: "destructive",
        title: "保存失败",
        description: '保存失败，请重试'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 主编辑区域 */}
      <div className="lg:col-span-2 space-y-6">
        {/* 基本信息 */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5" />
            <h3 className="text-lg font-semibold">基本信息</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">标题 *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  validateField('title', e.target.value);
                }}
                placeholder="输入文章标题"
                className={`mt-1 ${fieldErrors.title ? 'border-red-500 focus:border-red-500' : ''}`}
              />
              {fieldErrors.title && (
                <p className="text-sm text-red-500 mt-1">{fieldErrors.title}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  validateField('slug', e.target.value);
                }}
                placeholder="url-friendly-slug"
                className={`mt-1 ${fieldErrors.slug ? 'border-red-500 focus:border-red-500' : ''}`}
              />
              {fieldErrors.slug && (
                <p className="text-sm text-red-500 mt-1">{fieldErrors.slug}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                用于生成文章URL，只能包含小写字母、数字和连字符
              </p>
            </div>
            
            <div>
              <Label htmlFor="excerpt">摘要</Label>
              <Textarea
                id="excerpt"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="文章摘要（可选）"
                rows={3}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="keywords">关键字</Label>
              <Input
                id="keywords"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="关键字，用逗号分隔"
                className="mt-1"
              />
            </div>
          </div>
        </div>

        {/* 内容编辑 */}
        <div className="bg-white rounded-lg border">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold">内容编辑</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              {showPreview ? '编辑' : '预览'}
            </Button>
          </div>
          
          <div className="p-4">
            {showPreview ? (
              <div className="prose max-w-none">
                <MarkdownRenderer content={content} />
              </div>
            ) : (
              <div>
                <Textarea
                  value={content}
                  onChange={(e) => {
                    setContent(e.target.value);
                    validateField('content', e.target.value);
                  }}
                  placeholder="在这里输入 Markdown 内容..."
                  rows={20}
                  className={`font-mono ${fieldErrors.content ? 'border-red-500 focus:border-red-500' : ''}`}
                />
                {fieldErrors.content && (
                  <p className="text-sm text-red-500 mt-2">{fieldErrors.content}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-4">
          <Button
            onClick={() => handleSave(false)}
            disabled={isLoading}
            variant="outline"
          >
            <Save className="w-4 h-4 mr-2" />
            保存草稿
          </Button>
          
          <Button
            onClick={() => handleSave(true)}
            disabled={isLoading}
          >
            <Save className="w-4 h-4 mr-2" />
            发布文章
          </Button>
        </div>
      </div>

      {/* 侧边栏 */}
      <div className="space-y-6">
        {/* 特色图片 */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center gap-2 mb-4">
            <ImageIcon className="w-5 h-5" />
            <h3 className="text-lg font-semibold">特色图片</h3>
          </div>
          
          <ImageUpload
            value={featuredImage}
            onChange={setFeaturedImage}
            onRemove={() => setFeaturedImage('')}
          />
        </div>

        {/* 分类选择 */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center gap-2 mb-4">
            <Folder className="w-5 h-5" />
            <h3 className="text-lg font-semibold">分类 *</h3>
          </div>

          <Select
            value={categoryId || undefined}
            onValueChange={(value) => {
              setCategoryId(value === 'none' ? '' : value);
              if (value && value !== 'none') {
                clearFieldError('category');
              }
            }}
          >
            <SelectTrigger className={fieldErrors.category ? 'border-red-500' : ''}>
              <SelectValue placeholder="选择分类" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">无分类</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {fieldErrors.category && (
            <p className="text-sm text-red-500 mt-2">{fieldErrors.category}</p>
          )}
          <p className="text-xs text-gray-500 mt-2">
            发布文章时必须选择一个分类
          </p>
        </div>

        {/* 标签管理 */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center gap-2 mb-4">
            <Tag className="w-5 h-5" />
            <h3 className="text-lg font-semibold">标签</h3>
          </div>
          
          {/* 已选标签 */}
          {selectedTags.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {selectedTags.map((tag) => (
                  <Badge key={tag.id} variant="secondary" className="flex items-center gap-1">
                    {tag.name}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => handleRemoveTag(tag.id)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* 添加新标签 */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="新标签名称"
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
              />
              <Button size="sm" onClick={handleAddTag}>
                添加
              </Button>
            </div>
            
            {/* 选择已有标签 */}
            <Select onValueChange={handleSelectExistingTag}>
              <SelectTrigger>
                <SelectValue placeholder="选择已有标签" />
              </SelectTrigger>
              <SelectContent>
                {allTags
                  .filter(tag => !selectedTags.find(t => t.id === tag.id))
                  .map((tag) => (
                    <SelectItem key={tag.id} value={tag.id}>
                      {tag.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
