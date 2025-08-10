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

// 用户管理验证规则
export const updateUserSchema = z.object({
  name: z.string().min(1, '用户名不能为空').max(255, '用户名不能超过255个字符').optional(),
  email: z.string().email('邮箱格式不正确').max(255, '邮箱不能超过255个字符').optional(),
  membershipLevel: z.enum(['free', 'premium', 'vip'], {
    errorMap: () => ({ message: '会员等级必须是 free、premium 或 vip' })
  }).optional(),
  status: z.enum(['active', 'disabled'], {
    errorMap: () => ({ message: '状态必须是 active 或 disabled' })
  }).optional(),
  avatar: z.string().url('头像必须是有效的URL').optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, '当前密码不能为空'),
  newPassword: z.string()
    .min(8, '新密码至少需要8个字符')
    .max(100, '新密码不能超过100个字符')
    .regex(/^(?=.*[a-zA-Z])(?=.*\d)/, '新密码必须包含至少一个字母和一个数字'),
  confirmPassword: z.string().min(1, '确认密码不能为空'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: '两次输入的密码不一致',
  path: ['confirmPassword'],
});

export const userListParamsSchema = z.object({
  page: z.number().min(1, '页码必须大于0').optional(),
  pageSize: z.number().min(1, '每页数量必须大于0').max(100, '每页数量不能超过100').optional(),
  search: z.string().max(255, '搜索关键词不能超过255个字符').optional(),
  membershipLevel: z.enum(['free', 'premium', 'vip']).optional(),
  status: z.enum(['active', 'disabled']).optional(),
  sortBy: z.enum(['createdAt', 'lastLoginAt', 'name', 'email']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type UserListParamsInput = z.infer<typeof userListParamsSchema>;
