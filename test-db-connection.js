// 简单的数据库连接测试脚本
const postgres = require('postgres');

async function testConnection() {
  console.log('🔍 测试数据库连接...');
  
  const connectionString = process.env.DATABASE_URL || 'postgresql://bsvgo:your_secure_password@localhost:5432/bsvgo';
  console.log('📡 连接字符串:', connectionString.replace(/:[^:@]*@/, ':***@'));
  
  try {
    const sql = postgres(connectionString, { max: 1 });
    
    // 测试连接
    await sql`SELECT 1 as test`;
    console.log('✅ 数据库连接成功');
    
    // 检查表是否存在
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;
    
    console.log(`📋 找到 ${tables.length} 个表:`);
    tables.forEach(table => {
      console.log(`  - ${table.table_name}`);
    });
    
    await sql.end();
    
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
    process.exit(1);
  }
}

testConnection();
