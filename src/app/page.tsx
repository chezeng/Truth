'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      const currentPath = window.location.pathname;

      if (user) {
        if (currentPath.startsWith('/auth/')) {
          router.push('/protected/home'); 
        }
      } else {
        if (currentPath.startsWith('/dashboard/')) {
          router.push('/auth/intro');
        } else if (currentPath === '/') {
          router.push('/auth/intro');
        }
      }
    });

    return () => unsubscribe();
  }, [router]);

  return null;
}
