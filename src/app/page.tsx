'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        router.replace('/protected/home');
      } else {
        router.replace('/auth/intro');
      }
    });

    return () => unsubscribe();
  }, [router]);

  return null;
}
