'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // 如果已登录，重定向到主页
        router.replace('/protected/home');
      }
    });

    return () => unsubscribe();
  }, [router]);

  return <div className="min-h-screen">{children}</div>;
} 