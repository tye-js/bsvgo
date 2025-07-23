import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// 数据库连接字符串，在生产环境中应该从环境变量获取
const connectionString = process.env.DATABASE_URL || 'postgresql://bsvgo:Ty6413ty521@localhost:5435/bsvgo_db';

// 创建 postgres 客户端
const client = postgres(connectionString);

// 创建 drizzle 实例
export const db = drizzle(client, { schema });

export * from './schema';
