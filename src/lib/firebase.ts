import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  // ... 其他必要配置
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);