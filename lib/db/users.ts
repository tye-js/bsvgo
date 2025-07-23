import { eq } from 'drizzle-orm';
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
