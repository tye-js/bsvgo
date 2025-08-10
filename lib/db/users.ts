import { eq, desc, asc, like, and, or, count } from 'drizzle-orm';
import { db, users, type User, type NewUser } from '@/db';
import bcrypt from 'bcryptjs';

export async function createUser(data: {
  email: string;
  password: string;
  name: string;
  isAdmin?: boolean;
}): Promise<User> {
  try {
    const hashedPassword = await bcrypt.hash(data.password, 12);
    
    const newUser: NewUser = {
      email: data.email,
      password: hashedPassword,
      name: data.name,
      isAdmin: data.isAdmin || false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const result = await db.insert(users).values(newUser).returning();
    return result[0];
  } catch (error) {
    console.error('创建用户失败:', error);
    throw new Error('创建用户失败');
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error('获取用户失败:', error);
    throw new Error('获取用户失败');
  }
}

export async function getUserById(id: string): Promise<User | null> {
  try {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error('获取用户失败:', error);
    throw new Error('获取用户失败');
  }
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    console.error('密码验证失败:', error);
    return false;
  }
}

// 用户管理相关函数

export interface UserListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  membershipLevel?: string;
  status?: string;
  sortBy?: 'createdAt' | 'lastLoginAt' | 'name' | 'email';
  sortOrder?: 'asc' | 'desc';
}

export interface UserListResult {
  users: User[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function getUserList(params: UserListParams = {}): Promise<UserListResult> {
  try {
    const {
      page = 1,
      pageSize = 10,
      search = '',
      membershipLevel = '',
      status = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = params;

    const offset = (page - 1) * pageSize;

    // 构建查询条件
    const conditions = [];

    if (search) {
      conditions.push(
        or(
          like(users.name, `%${search}%`),
          like(users.email, `%${search}%`)
        )
      );
    }

    if (membershipLevel) {
      conditions.push(eq(users.membershipLevel, membershipLevel));
    }

    if (status) {
      conditions.push(eq(users.status, status));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // 构建排序
    const orderBy = sortOrder === 'asc' ? asc(users[sortBy]) : desc(users[sortBy]);

    // 查询用户列表
    const userList = await db
      .select()
      .from(users)
      .where(whereClause)
      .orderBy(orderBy)
      .limit(pageSize)
      .offset(offset);

    // 查询总数
    const totalResult = await db
      .select({ count: count() })
      .from(users)
      .where(whereClause);

    const total = totalResult[0].count;
    const totalPages = Math.ceil(total / pageSize);

    return {
      users: userList,
      total,
      page,
      pageSize,
      totalPages
    };
  } catch (error) {
    console.error('获取用户列表失败:', error);
    throw new Error('获取用户列表失败');
  }
}

export async function updateUser(id: string, data: {
  name?: string;
  email?: string;
  membershipLevel?: string;
  status?: string;
  avatar?: string;
}): Promise<User> {
  try {
    const updateData = {
      ...data,
      updatedAt: new Date(),
    };

    const result = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();

    if (result.length === 0) {
      throw new Error('用户不存在');
    }

    return result[0];
  } catch (error) {
    console.error('更新用户失败:', error);
    throw new Error('更新用户失败');
  }
}

export async function updateUserStatus(id: string, status: 'active' | 'disabled'): Promise<User> {
  try {
    const result = await db
      .update(users)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();

    if (result.length === 0) {
      throw new Error('用户不存在');
    }

    return result[0];
  } catch (error) {
    console.error('更新用户状态失败:', error);
    throw new Error('更新用户状态失败');
  }
}

export async function deleteUser(id: string): Promise<void> {
  try {
    const result = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning();

    if (result.length === 0) {
      throw new Error('用户不存在');
    }
  } catch (error) {
    console.error('删除用户失败:', error);
    throw new Error('删除用户失败');
  }
}

export async function updateUserPassword(id: string, currentPassword: string, newPassword: string): Promise<void> {
  try {
    // 首先验证当前密码
    const user = await getUserById(id);
    if (!user) {
      throw new Error('用户不存在');
    }

    const isValidPassword = await verifyPassword(currentPassword, user.password);
    if (!isValidPassword) {
      throw new Error('当前密码不正确');
    }

    // 加密新密码
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // 更新密码
    await db
      .update(users)
      .set({
        password: hashedNewPassword,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id));
  } catch (error) {
    console.error('更新密码失败:', error);
    throw error;
  }
}

export async function updateLastLoginAt(id: string): Promise<void> {
  try {
    await db
      .update(users)
      .set({
        lastLoginAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, id));
  } catch (error) {
    console.error('更新最后登录时间失败:', error);
    // 这个错误不应该阻止登录流程，所以只记录日志
  }
}
