import { auth } from '@/lib/firebase';
import { deleteUser } from 'firebase/auth';

// 删除账号
export async function deleteAccount() {
  const user = auth.currentUser;
  if (user) {
    try {
      // 1. 删除用户数据
      await deleteDoc(doc(db, 'users', user.uid));
      // 2. 删除认证账号
      await deleteUser(user);
    } catch (error) {
      console.error('Error deleting account:', error);
    }
  }
} 