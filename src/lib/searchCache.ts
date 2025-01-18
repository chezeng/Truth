import { db } from '@/lib/firebase';
import { collection, doc, setDoc, getDoc, query, where, getDocs } from 'firebase/firestore';

interface CachedSearch {
  query: string;
  results: any[];
  timestamp: Date;
  userId?: string;
}

const CACHE_EXPIRY = 1000 * 60 * 60; // 1 hour

export async function getCachedSearch(searchQuery: string, userId?: string): Promise<CachedSearch | null> {
  try {
    const cacheRef = doc(db, 'searchCache', searchQuery.toLowerCase());
    const cacheDoc = await getDoc(cacheRef);

    if (cacheDoc.exists()) {
      const cachedData = cacheDoc.data() as CachedSearch;
      const now = new Date();
      const cacheAge = now.getTime() - cachedData.timestamp.getTime();

      if (cacheAge < CACHE_EXPIRY) {
        return cachedData;
      }
    }
    return null;
  } catch (error) {
    console.error('Error getting cached search:', error);
    return null;
  }
}

export async function cacheSearchResults(
  searchQuery: string,
  results: any[],
  userId?: string
): Promise<void> {
  try {
    const cacheRef = doc(db, 'searchCache', searchQuery.toLowerCase());
    await setDoc(cacheRef, {
      query: searchQuery,
      results,
      timestamp: new Date(),
      userId
    });
  } catch (error) {
    console.error('Error caching search results:', error);
  }
}

export async function getUserSearchHistory(userId: string): Promise<CachedSearch[]> {
  try {
    const searchesQuery = query(
      collection(db, 'searchCache'),
      where('userId', '==', userId)
    );
    
    const snapshot = await getDocs(searchesQuery);
    return snapshot.docs.map(doc => doc.data() as CachedSearch);
  } catch (error) {
    console.error('Error getting user search history:', error);
    return [];
  }
} 