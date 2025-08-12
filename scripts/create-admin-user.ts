#!/usr/bin/env tsx

/**
 * 创建管理员用户脚本
 * 使用方法: npx tsx scripts/create-admin-user.ts
 */

import { db } from '../db';
import { users } from '../db/schema';
import { createUser } from '../lib/db/users';
import { eq } from 'drizzle-orm';

async function createAdminUser() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@bsvgo.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123456';
  const adminName = process.env.ADMIN_NAME || 'Administrator';

  try {
    console.log('🔍 检查数据库连接...');
    
    // 检查数据库连接
    await db.select().from(users).limit(1);
    console.log('✅ 数据库连接成功');

    // 检查管理员用户是否已存在
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, adminEmail))
      .limit(1);

    if (existingUser.length > 0) {
      console.log(`⚠️  管理员用户已存在: ${adminEmail}`);
      console.log('用户信息:', {
        id: existingUser[0].id,
        email: existingUser[0].email,
        name: existingUser[0].name,
        isAdmin: existingUser[0].isAdmin,
        status: existingUser[0].status,
        membershipLevel: existingUser[0].membershipLevel
      });
      return;
    }

    console.log('🔨 创建管理员用户...');
    
    // 创建管理员用户
    const newUser = await createUser({
      email: adminEmail,
      password: adminPassword,
      name: adminName,
      isAdmin: true
    });

    console.log('✅ 管理员用户创建成功!');
    console.log('用户信息:', {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      isAdmin: newUser.isAdmin,
      status: newUser.status,
      membershipLevel: newUser.membershipLevel
    });

    console.log('\n📝 登录信息:');
    console.log(`邮箱: ${adminEmail}`);
    console.log(`密码: ${adminPassword}`);
    console.log('\n⚠️  请在生产环境中立即修改默认密码!');

  } catch (error) {
    console.error('❌ 创建管理员用户失败:', error);
    
    if (error instanceof Error) {
      console.error('错误详情:', error.message);
      console.error('错误堆栈:', error.stack);
    }
    
    process.exit(1);
  }
}

// 运行脚本
createAdminUser()
  .then(() => {
    console.log('🎉 脚本执行完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 脚本执行失败:', error);
    process.exit(1);
  });
