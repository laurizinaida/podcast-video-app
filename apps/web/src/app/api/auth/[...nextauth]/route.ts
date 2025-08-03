import NextAuth from "next-auth"
import { getConfig } from "@/lib/auth"
import { D1Database } from '@cloudflare/workers-types';

// 动态获取Cloudflare运行时环境并初始化NextAuth
const handler = async (req: Request, context: any) => {
  // 从Cloudflare运行时环境获取数据库绑定
  const env = context?.env || process.env;
  const db = env?.DB as D1Database;
  
  if (!db) {
    console.error("Database binding not available in NextAuth route");
    throw new Error("Database not available");
  }

  // 使用数据库绑定初始化NextAuth
  const { handlers } = NextAuth(getConfig(db));
  
  // 根据请求方法调用相应的处理器
  if (req.method === 'GET') {
    return handlers.GET(req, context);
  } else if (req.method === 'POST') {
    return handlers.POST(req, context);
  }
  
  return new Response('Method not allowed', { status: 405 });
};

export { handler as GET, handler as POST };