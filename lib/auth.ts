import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { getUserByEmail, verifyPassword, updateLastLoginAt } from '@/lib/db/users';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.error('认证失败: 缺少邮箱或密码');
          return null;
        }

        try {
          console.log('尝试认证用户:', credentials.email);

          const user = await getUserByEmail(credentials.email);
          if (!user) {
            console.error('认证失败: 用户不存在', credentials.email);
            return null;
          }

          console.log('找到用户:', { id: user.id, email: user.email, status: user.status });

          // 检查用户状态
          if (user.status === 'disabled') {
            console.error('认证失败: 用户已被禁用', credentials.email);
            return null;
          }

          const isValidPassword = await verifyPassword(credentials.password, user.password);
          if (!isValidPassword) {
            console.error('认证失败: 密码错误', credentials.email);
            return null;
          }

          // 更新最后登录时间
          await updateLastLoginAt(user.id);

          console.log('认证成功:', { id: user.id, email: user.email });
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            isAdmin: user.isAdmin,
          };
        } catch (error) {
          console.error('认证过程中发生错误:', error);
          console.error('错误详情:', {
            message: error instanceof Error ? error.message : '未知错误',
            stack: error instanceof Error ? error.stack : undefined,
            email: credentials.email
          });
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.isAdmin = user.isAdmin;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!;
        session.user.isAdmin = token.isAdmin as boolean;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
