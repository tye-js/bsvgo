import postgres from 'postgres';

async function createDatabase() {
  // 连接到默认的 postgres 数据库来创建新数据库
  const sql = postgres({
    host: 'localhost',
    port: 5435,
    username: 'bsvgo',
    password: 'Ty6413ty521',
    database: 'postgres', // 连接到默认数据库
  });

  try {
    console.log('正在创建数据库 bsvgo_db...');
    
    // 检查数据库是否已存在
    const existingDb = await sql`
      SELECT 1 FROM pg_database WHERE datname = 'bsvgo_db'
    `;
    
    if (existingDb.length > 0) {
      console.log('数据库 bsvgo_db 已存在');
    } else {
      // 创建数据库
      await sql.unsafe('CREATE DATABASE bsvgo_db');
      console.log('数据库 bsvgo_db 创建成功！');
    }
  } catch (error) {
    console.error('创建数据库失败:', error);
  } finally {
    await sql.end();
  }
}

createDatabase();
