#!/usr/bin/env tsx

import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as schema from '../db/schema';

async function main() {
  console.log('🚀 开始数据库迁移...');

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('❌ DATABASE_URL 环境变量未设置');
    process.exit(1);
  }

  console.log('📡 连接数据库...');
  
  // 创建数据库连接
  const sql = postgres(connectionString, { max: 1 });
  const db = drizzle(sql, { schema });

  try {
    // 检查数据库连接
    await sql`SELECT 1`;
    console.log('✅ 数据库连接成功');

    // 执行迁移
    console.log('📦 执行数据库迁移...');
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log('✅ 数据库迁移完成');

    // 验证表是否存在
    console.log('🔍 验证表结构...');
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;
    
    console.log('📋 已创建的表:');
    tables.forEach((table: any) => {
      console.log(`  - ${table.table_name}`);
    });

    // 检查是否有数据
    const userCount = await sql`SELECT COUNT(*) as count FROM users`;
    const categoryCount = await sql`SELECT COUNT(*) as count FROM categories`;
    const tagCount = await sql`SELECT COUNT(*) as count FROM tags`;

    console.log('\n📊 数据统计:');
    console.log(`  - 用户数量: ${userCount[0].count}`);
    console.log(`  - 分类数量: ${categoryCount[0].count}`);
    console.log(`  - 标签数量: ${tagCount[0].count}`);

  } catch (error) {
    console.error('❌ 迁移失败:', error);
    process.exit(1);
  } finally {
    await sql.end();
    console.log('🔌 数据库连接已关闭');
  }

  console.log('🎉 数据库迁移完成！');
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch((error) => {
    console.error('❌ 迁移脚本执行失败:', error);
    process.exit(1);
  });
}

export { main as migrate };
