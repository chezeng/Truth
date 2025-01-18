import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, doc, getDoc } from 'firebase/firestore';

interface DebateStats {
  totalVotes: number;
  redVotes: number;
  blueVotes: number;
  commentCount: number;
  participantCount: number;
}

interface UserStats {
  debatesCreated: number;
  totalVotes: number;
  commentsPosted: number;
  mostActiveCategory: string;
}

export async function getDebateStats(debateId: string): Promise<DebateStats> {
  try {
    // Get debate document
    const debateRef = doc(db, 'debates', debateId);
    const debateDoc = await getDoc(debateRef);
    const debateData = debateDoc.data();

    if (!debateDoc.exists() || !debateData) {
      throw new Error('Debate not found');
    }

    // Get comments
    const commentsQuery = query(
      collection(db, 'comments'),
      where('debateId', '==', debateId)
    );
    const commentsSnapshot = await getDocs(commentsQuery);

    // Get unique participants
    const votesQuery = query(
      collection(db, 'votes'),
      where('debateId', '==', debateId)
    );
    const votesSnapshot = await getDocs(votesQuery);
    const participants = new Set([
      ...votesSnapshot.docs.map(doc => doc.data().userId),
      ...commentsSnapshot.docs.map(doc => doc.data().userId)
    ]);

    return {
      totalVotes: debateData.redVotes + debateData.blueVotes,
      redVotes: debateData.redVotes,
      blueVotes: debateData.blueVotes,
      commentCount: commentsSnapshot.size,
      participantCount: participants.size
    };
  } catch (error) {
    console.error('Error getting debate stats:', error);
    throw error;
  }
}

export async function getUserStats(userId: string): Promise<UserStats> {
  try {
    // Get debates created by user
    const debatesQuery = query(
      collection(db, 'debates'),
      where('createdBy', '==', userId)
    );
    const debatesSnapshot = await getDocs(debatesQuery);

    // Get user's votes
    const votesQuery = query(
      collection(db, 'votes'),
      where('userId', '==', userId)
    );
    const votesSnapshot = await getDocs(votesQuery);

    // Get user's comments
    const commentsQuery = query(
      collection(db, 'comments'),
      where('userId', '==', userId)
    );
    const commentsSnapshot = await getDocs(commentsQuery);

    // Calculate most active category
    const categoryCount: Record<string, number> = {};
    debatesSnapshot.docs.forEach(doc => {
      const category = doc.data().category;
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });
    const mostActiveCategory = Object.entries(categoryCount)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'None';

    return {
      debatesCreated: debatesSnapshot.size,
      totalVotes: votesSnapshot.size,
      commentsPosted: commentsSnapshot.size,
      mostActiveCategory
    };
  } catch (error) {
    console.error('Error getting user stats:', error);
    throw error;
  }
} 