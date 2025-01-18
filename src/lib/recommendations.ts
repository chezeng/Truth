import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { getUserStats } from './analytics';

interface DebateRecommendation {
  id: string;
  title: string;
  description: string;
  category: string;
  score: number;
}

export async function getDebateRecommendations(userId: string): Promise<DebateRecommendation[]> {
  try {
    // Get user's interests and activity
    const userStats = await getUserStats(userId);
    
    // Get recent debates in user's preferred categories
    const debatesQuery = query(
      collection(db, 'debates'),
      where('category', '==', userStats.mostActiveCategory),
      orderBy('createdAt', 'desc'),
      limit(10)
    );

    const snapshot = await getDocs(debatesQuery);
    const recommendations = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        description: data.description,
        category: data.category,
        score: calculateRecommendationScore(data, userStats)
      };
    });

    // Sort by score
    return recommendations.sort((a, b) => b.score - a.score);
  } catch (error) {
    console.error('Error getting recommendations:', error);
    return [];
  }
}

function calculateRecommendationScore(debate: any, userStats: any): number {
  let score = 0;
  
  // Category match
  if (debate.category === userStats.mostActiveCategory) {
    score += 5;
  }
  
  // Activity level
  score += Math.min(debate.redVotes + debate.blueVotes, 10);
  
  // Recency (newer debates score higher)
  const ageInDays = (Date.now() - debate.createdAt.toDate().getTime()) / (1000 * 60 * 60 * 24);
  score += Math.max(10 - ageInDays, 0);

  return score;
} 