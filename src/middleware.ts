import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 获取当前路径
  const path = request.nextUrl.pathname;

  // 定义公开路径
  const publicPaths = ['/auth/login', '/auth/register', '/auth/intro'];

  // 检查是否是公开路径
  const isPublicPath = publicPaths.includes(path);

  // 获取token（如果有的话）
  const token = request.cookies.get('authToken')?.value;

  // 如果用户已登录但试图访问登录页面，重定向到首页
  if (isPublicPath && token) {
    return NextResponse.redirect(new URL('/home', request.url));
  }

  // 如果用户未登录且试图访问受保护页面，重定向到登录页面
  if (!isPublicPath && !token && path !== '/') {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}; 