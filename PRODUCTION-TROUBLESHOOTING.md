# 生产环境故障排除指南

## 🚨 401 认证错误排查步骤

### 第一步：检查健康状态
访问健康检查端点获取系统状态：
```bash
curl https://bsvgo.com/api/health
```

### 第二步：验证环境变量
确保以下环境变量在生产环境中正确设置：

```bash
# 必需的环境变量
DATABASE_URL=postgresql://用户名:密码@主机:端口/数据库名
NEXTAUTH_URL=https://bsvgo.com
NEXTAUTH_SECRET=强随机字符串（至少32字符）
NODE_ENV=production
```

### 第三步：检查数据库连接
1. 确认数据库服务运行正常
2. 验证连接字符串格式正确
3. 检查网络连接和防火墙设置

### 第四步：验证用户数据
```sql
-- 连接到生产数据库
psql $DATABASE_URL

-- 检查用户表
SELECT id, email, name, "isAdmin", status FROM users LIMIT 5;

-- 检查特定用户
SELECT * FROM users WHERE email = 'your-email@example.com';
```

### 第五步：创建测试用户
如果数据库中没有用户，运行以下命令创建管理员用户：

```bash
# 设置管理员信息（可选）
export ADMIN_EMAIL=admin@bsvgo.com
export ADMIN_PASSWORD=your-secure-password
export ADMIN_NAME=Administrator

# 创建管理员用户
npm run create-admin
```

## 🔧 常见问题解决方案

### 问题1：NEXTAUTH_SECRET 未设置
```bash
# 生成新的 NEXTAUTH_SECRET
openssl rand -base64 32

# 或者使用 Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 问题2：数据库连接失败
检查连接字符串格式：
```
postgresql://用户名:密码@主机:端口/数据库名

# 示例
postgresql://bsvgo:password123@localhost:5432/bsvgo_db
postgresql://user:pass@db.example.com:5432/mydb
```

### 问题3：用户状态被禁用
```sql
-- 启用用户
UPDATE users SET status = 'active' WHERE email = 'your-email@example.com';
```

### 问题4：密码不匹配
用户可能需要重置密码或使用正确的密码。

## 📊 监控和日志

### 查看应用日志
根据您的部署平台查看日志：

**Vercel:**
```bash
vercel logs
```

**Docker:**
```bash
docker logs container-name
```

**PM2:**
```bash
pm2 logs
```

### 关键日志信息
查找以下日志信息：
- `认证失败:` - 认证过程中的错误
- `数据库连接失败` - 数据库连接问题
- `用户不存在` - 用户查找失败
- `密码错误` - 密码验证失败

## 🛠️ 调试模式

临时启用详细日志记录：
```bash
# 设置调试环境变量
DEBUG=nextauth:*
NEXTAUTH_DEBUG=true
```

## 📞 紧急恢复步骤

如果所有用户都无法登录：

1. **直接数据库操作创建用户：**
```sql
INSERT INTO users (id, email, password, name, "isAdmin", status, "membershipLevel", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'emergency@bsvgo.com',
  '$2a$12$hash_of_password_here',  -- 使用 bcrypt 加密的密码
  'Emergency Admin',
  true,
  'active',
  'vip',
  NOW(),
  NOW()
);
```

2. **生成 bcrypt 密码哈希：**
```javascript
const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync('your-password', 12);
console.log(hash);
```

## 🔍 测试认证流程

使用 curl 测试认证 API：
```bash
# 获取 CSRF token
curl -c cookies.txt https://bsvgo.com/api/auth/csrf

# 尝试登录
curl -b cookies.txt -X POST https://bsvgo.com/api/auth/callback/credentials \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=your-email@example.com&password=your-password&csrfToken=TOKEN_HERE"
```
