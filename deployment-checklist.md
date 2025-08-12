# 生产环境部署检查清单

## 必需的环境变量

确保以下环境变量在生产环境中正确设置：

```bash
# 数据库配置
DATABASE_URL=postgresql://用户名:密码@主机:端口/数据库名

# NextAuth 配置
NEXTAUTH_URL=https://bsvgo.com
NEXTAUTH_SECRET=一个强随机字符串（至少32字符）

# 应用配置
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://bsvgo.com
```

## 检查步骤

### 1. 验证数据库连接
```bash
# 在生产环境中测试数据库连接
psql $DATABASE_URL -c "SELECT 1;"
```

### 2. 验证用户数据
```sql
-- 检查用户表是否存在数据
SELECT id, email, name, "isAdmin" FROM users LIMIT 5;
```

### 3. 验证 NEXTAUTH_SECRET
```bash
# 生成新的 NEXTAUTH_SECRET（如果需要）
openssl rand -base64 32
```

### 4. 检查域名配置
- 确保 NEXTAUTH_URL 与实际域名完全匹配
- 检查 HTTPS 证书是否有效
- 验证 DNS 解析是否正确

## 常见问题解决

### 问题1: 数据库连接失败
- 检查数据库服务是否运行
- 验证连接字符串格式
- 确认防火墙设置允许连接

### 问题2: 用户认证失败
- 确认生产数据库中有测试用户
- 检查密码是否正确加密
- 验证用户状态是否为 active

### 问题3: NextAuth 配置错误
- 确保 NEXTAUTH_SECRET 已设置
- 检查 NEXTAUTH_URL 是否正确
- 验证回调 URL 配置
