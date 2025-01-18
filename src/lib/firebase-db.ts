import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';

// 创建新辩论
export async function createDebate(data: any) {
  return addDoc(collection(db, 'debates'), {
    ...data,
    createdAt: new Date(),
    redVotes: 0,
    blueVotes: 0
  });
}

// 获取辩论列表
export async function getDebates() {
  const q = query(collection(db, 'debates'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

// 添加评论
export async function addComment(debateId: string, userId: string, content: string) {
  return addDoc(collection(db, 'comments'), {
    debateId,
    userId,
    content,
    createdAt: new Date(),
    likes: 0
  });
} 