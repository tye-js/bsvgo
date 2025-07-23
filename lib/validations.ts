import { z } from 'zod';

export const createDocumentSchema = z.object({
  title: z.string().min(1, '标题不能为空').max(200, '标题不能超过200个字符'),
  content: z.string().default(''),
  excerpt: z.string().optional(),
  slug: z.string().min(1, 'Slug不能为空').max(100, 'Slug不能超过100个字符')
    .regex(/^[a-z0-9-]+$/, 'Slug只能包含小写字母、数字和连字符'),
  keywords: z.string().optional(),
  featuredImage: z.string().optional(),
  categoryId: z.string().optional(),
  published: z.boolean().default(false),
  tagIds: z.array(z.string().uuid()).optional(),
});

export const updateDocumentSchema = z.object({
  title: z.string().min(1, '标题不能为空').max(200, '标题不能超过200个字符').optional(),
  content: z.string().optional(),
  excerpt: z.string().optional(),
  slug: z.string().min(1, 'Slug不能为空').max(100, 'Slug不能超过100个字符')
    .regex(/^[a-z0-9-]+$/, 'Slug只能包含小写字母、数字和连字符').optional(),
  keywords: z.string().optional(),
  featuredImage: z.string().optional(),
  categoryId: z.string().optional(),
  published: z.boolean().optional(),
  tagIds: z.array(z.string().uuid()).optional(),
});

export const createCategorySchema = z.object({
  name: z.string().min(1, '分类名称不能为空').max(100, '分类名称不能超过100个字符'),
  slug: z.string().min(1, 'Slug不能为空').max(100, 'Slug不能超过100个字符')
    .regex(/^[a-z0-9-]+$/, 'Slug只能包含小写字母、数字和连字符'),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, '颜色格式不正确').optional(),
});

export const createTagSchema = z.object({
  name: z.string().min(1, '标签名称不能为空').max(50, '标签名称不能超过50个字符'),
  slug: z.string().min(1, 'Slug不能为空').max(50, 'Slug不能超过50个字符')
    .regex(/^[a-z0-9-]+$/, 'Slug只能包含小写字母、数字和连字符'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, '颜色格式不正确').optional(),
});

export const createCommentSchema = z.object({
  content: z.string().min(1, '评论内容不能为空').max(1000, '评论内容不能超过1000个字符'),
  documentId: z.string().uuid('文档ID格式不正确'),
  parentId: z.string().uuid('父评论ID格式不正确').optional(),
});

export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;
