import { db } from '@/lib/firebase';
import { doc, setDoc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';

export async function followUser(followerId: string, followingId: string) {
  try {
    const followRef = doc(db, 'follows', `${followerId}_${followingId}`);
    await setDoc(followRef, {
      followerId,
      followingId,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error following user:', error);
    throw error;
  }
}

export async function unfollowUser(followerId: string, followingId: string) {
  try {
    const followRef = doc(db, 'follows', `${followerId}_${followingId}`);
    await deleteDoc(followRef);
  } catch (error) {
    console.error('Error unfollowing user:', error);
    throw error;
  }
}

export async function getFollowers(userId: string) {
  try {
    const followsQuery = query(
      collection(db, 'follows'),
      where('followingId', '==', userId)
    );
    const snapshot = await getDocs(followsQuery);
    return snapshot.docs.map(doc => doc.data().followerId);
  } catch (error) {
    console.error('Error getting followers:', error);
    throw error;
  }
}

export async function getFollowing(userId: string) {
  try {
    const followsQuery = query(
      collection(db, 'follows'),
      where('followerId', '==', userId)
    );
    const snapshot = await getDocs(followsQuery);
    return snapshot.docs.map(doc => doc.data().followingId);
  } catch (error) {
    console.error('Error getting following:', error);
    throw error;
  }
} 