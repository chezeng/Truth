'use client';

import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';

export default function HomePage() {
  const [user, setUser] = useState(auth.currentUser);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen">
      <h1>Welcome, {user?.email}</h1>
      {/* 其他内容 */}
    </div>
  );
} 