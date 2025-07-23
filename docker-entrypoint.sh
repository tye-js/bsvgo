#!/bin/bash

# Docker 容器入口脚本
# 在启动 Next.js 应用之前执行数据库初始化

set -e

echo "🚀 启动 BSVGO 应用..."

# 等待数据库连接
echo "⏳ 等待数据库连接..."
max_attempts=30
attempt=1

while [ $attempt -le $max_attempts ]; do
    if node -e "
        const postgres = require('postgres');
        const sql = postgres(process.env.DATABASE_URL, { max: 1 });
        sql\`SELECT 1\`.then(() => {
            console.log('✅ 数据库连接成功');
            process.exit(0);
        }).catch((err) => {
            console.log('❌ 数据库连接失败:', err.message);
            process.exit(1);
        });
    " 2>/dev/null; then
        echo "✅ 数据库已就绪"
        break
    fi
    
    echo "⏳ 等待数据库启动... (尝试 $attempt/$max_attempts)"
    sleep 2
    attempt=$((attempt + 1))
done

if [ $attempt -gt $max_attempts ]; then
    echo "❌ 数据库连接超时"
    exit 1
fi

# 检查是否需要初始化数据库
echo "🔍 检查数据库状态..."
if node -e "
    const postgres = require('postgres');
    const sql = postgres(process.env.DATABASE_URL, { max: 1 });
    sql\`SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = 'public'\`
        .then((result) => {
            const tableCount = parseInt(result[0].count);
            if (tableCount === 0) {
                console.log('📦 数据库为空，需要初始化');
                process.exit(1);
            } else {
                console.log(\`✅ 数据库已有 \${tableCount} 个表\`);
                process.exit(0);
            }
        })
        .catch((err) => {
            console.log('❌ 检查数据库失败:', err.message);
            process.exit(1);
        });
" 2>/dev/null; then
    echo "✅ 数据库已初始化，跳过初始化步骤"
else
    echo "📦 开始初始化数据库..."
    
    # 运行数据库初始化脚本
    if npm run db:init; then
        echo "✅ 数据库初始化完成"
    else
        echo "❌ 数据库初始化失败"
        exit 1
    fi
fi

echo "🎉 准备工作完成，启动应用..."

# 启动 Next.js 应用
exec "$@"
