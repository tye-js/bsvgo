import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { count } from 'drizzle-orm';

export async function GET() {
  try {
    // 检查数据库连接和用户表
    const userCount = await db.select({ count: count() }).from(users);

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        userCount: userCount[0].count
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
        hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        nextAuthUrl: process.env.NEXTAUTH_URL
      },
      uptime: process.uptime()
    });
  } catch (error) {
    console.error('Health check failed:', error);

    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: {
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
        hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        nextAuthUrl: process.env.NEXTAUTH_URL
      },
      uptime: process.uptime()
    }, { status: 503 });
  }
}
