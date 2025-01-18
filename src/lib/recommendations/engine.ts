import { db } from '@/lib/firebase-admin';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { getUserStats } from '../analytics';

interface UserProfile {
  interests: string[];
  occupation: string;
  recentViews: string[];
  votingHistory: Array<{ debateId: string; vote: 'red' | 'blue' }>;
}

interface DebateFeatures {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  createdAt: Date;
  redVotes: number;
  blueVotes: number;
  participantCount: number;
  commentCount: number;
  viewCount: number;
  avgEngagementTime: number;
  creatorReputation: number;
}

interface WeightedScore {
  score: number;
  factors: {
    relevance: number;
    recency: number;
    popularity: number;
    engagement: number;
    userAffinity: number;
    diversity: number;
  };
}

export class RecommendationEngine {
  private readonly weights = {
    relevance: 0.3,
    recency: 0.15,
    popularity: 0.15,
    engagement: 0.15,
    userAffinity: 0.15,
    diversity: 0.1,
  };

  private readonly decayFactors = {
    time: 0.1, // 时间衰减因子
    similarity: 0.8, // 相似度衰减因子
  };

  async getRecommendations(userId: string, limit: number = 20): Promise<Array<{ debate: DebateFeatures; score: WeightedScore }>> {
    try {
      const [userProfile, recentRecommendations] = await Promise.all([
        this.getUserProfile(userId),
        this.getRecentRecommendations(userId)
      ]);

      const candidates = await this.getCandidateDebates(userProfile);
      const scoredDebates = await this.scoreDebates(candidates, userProfile, recentRecommendations);
      
      // 应用多样性重排序
      const diversifiedResults = this.diversifyResults(scoredDebates);
      
      return diversifiedResults.slice(0, limit);
    } catch (error) {
      console.error('Recommendation engine error:', error);
      throw error;
    }
  }

  private async getUserProfile(userId: string): Promise<UserProfile> {
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();

    // 获取用户最近的浏览历史
    const viewsSnapshot = await db.collection('user_views')
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .limit(50)
      .get();

    // 获取用户的投票历史
    const votesSnapshot = await db.collection('votes')
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .get();

    return {
      interests: userData?.interests || [],
      occupation: userData?.occupation || '',
      recentViews: viewsSnapshot.docs.map(doc => doc.data().debateId),
      votingHistory: votesSnapshot.docs.map(doc => ({
        debateId: doc.data().debateId,
        vote: doc.data().vote
      }))
    };
  }

  private async getCandidateDebates(userProfile: UserProfile): Promise<DebateFeatures[]> {
    // 基于用户兴趣获取候选辩题
    const debatesSnapshot = await db.collection('debates')
      .where('category', 'in', userProfile.interests)
      .orderBy('createdAt', 'desc')
      .limit(100)
      .get();

    return debatesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as DebateFeatures[];
  }

  private async scoreDebates(
    debates: DebateFeatures[],
    userProfile: UserProfile,
    recentRecommendations: string[]
  ): Promise<Array<{ debate: DebateFeatures; score: WeightedScore }>> {
    const now = new Date();
    const scoredDebates = await Promise.all(
      debates.map(async debate => {
        // 计算相关性分数
        const relevanceScore = this.calculateRelevanceScore(debate, userProfile);
        
        // 计算时间衰减
        const ageInDays = (now.getTime() - debate.createdAt.getTime()) / (1000 * 60 * 60 * 24);
        const recencyScore = Math.exp(-this.decayFactors.time * ageInDays);
        
        // 计算热度分数
        const popularityScore = this.calculatePopularityScore(debate);
        
        // 计算参与度分数
        const engagementScore = this.calculateEngagementScore(debate);
        
        // 计算用户亲和度
        const userAffinityScore = await this.calculateUserAffinityScore(debate, userProfile);
        
        // 计算多样性分数
        const diversityScore = this.calculateDiversityScore(debate, recentRecommendations);

        // 计算加权总分
        const weightedScore = {
          relevance: relevanceScore * this.weights.relevance,
          recency: recencyScore * this.weights.recency,
          popularity: popularityScore * this.weights.popularity,
          engagement: engagementScore * this.weights.engagement,
          userAffinity: userAffinityScore * this.weights.userAffinity,
          diversity: diversityScore * this.weights.diversity,
        };

        const totalScore = Object.values(weightedScore).reduce((a, b) => a + b, 0);

        return {
          debate,
          score: {
            score: totalScore,
            factors: weightedScore,
          },
        };
      })
    );

    return scoredDebates.sort((a, b) => b.score.score - a.score.score);
  }

  private calculateRelevanceScore(debate: DebateFeatures, userProfile: UserProfile): number {
    let score = 0;
    
    // 兴趣匹配度
    if (userProfile.interests.includes(debate.category)) {
      score += 0.5;
    }
    
    // 标签匹配度
    const matchingTags = debate.tags.filter(tag => 
      userProfile.interests.some(interest => 
        tag.toLowerCase().includes(interest.toLowerCase())
      )
    );
    score += matchingTags.length * 0.1;
    
    // 职业相关性
    if (debate.tags.some(tag => 
      tag.toLowerCase().includes(userProfile.occupation.toLowerCase())
    )) {
      score += 0.3;
    }

    return Math.min(score, 1);
  }

  private calculatePopularityScore(debate: DebateFeatures): number {
    const totalVotes = debate.redVotes + debate.blueVotes;
    const normalizedVotes = Math.min(totalVotes / 1000, 1);
    const normalizedViews = Math.min(debate.viewCount / 5000, 1);
    
    return (normalizedVotes + normalizedViews) / 2;
  }

  private calculateEngagementScore(debate: DebateFeatures): number {
    const commentRatio = Math.min(debate.commentCount / debate.viewCount, 1);
    const avgTimeScore = Math.min(debate.avgEngagementTime / 300, 1); // 5分钟为满分
    
    return (commentRatio + avgTimeScore) / 2;
  }

  private async calculateUserAffinityScore(
    debate: DebateFeatures,
    userProfile: UserProfile
  ): Promise<number> {
    let score = 0;

    // 创建者信誉度
    score += Math.min(debate.creatorReputation / 100, 0.3);

    // 用户投票行为相似度
    const userVotePattern = await this.analyzeUserVotePattern(userProfile.votingHistory);
    const debateVotePattern = debate.redVotes / (debate.redVotes + debate.blueVotes);
    const votePatternSimilarity = 1 - Math.abs(userVotePattern - debateVotePattern);
    score += votePatternSimilarity * 0.3;

    // 社交网络影响
    const socialScore = await this.calculateSocialScore(debate.id, userProfile);
    score += socialScore * 0.4;

    return score;
  }

  private async analyzeUserVotePattern(votingHistory: Array<{ vote: 'red' | 'blue' }>): Promise<number> {
    if (votingHistory.length === 0) return 0.5;
    
    const redVotes = votingHistory.filter(v => v.vote === 'red').length;
    return redVotes / votingHistory.length;
  }

  private async calculateSocialScore(debateId: string, userProfile: UserProfile): Promise<number> {
    // 获取用户的关注者互动数据
    const followingInteractions = await db.collection('follows')
      .where('followerId', '==', userProfile.id)
      .get();

    let interactionCount = 0;
    for (const doc of followingInteractions.docs) {
      const followingId = doc.data().followingId;
      const hasInteracted = await db.collection('debate_interactions')
        .where('userId', '==', followingId)
        .where('debateId', '==', debateId)
        .get();
      
      if (!hasInteracted.empty) {
        interactionCount++;
      }
    }

    return Math.min(interactionCount / 10, 1);
  }

  private calculateDiversityScore(debate: DebateFeatures, recentRecommendations: string[]): number {
    if (recentRecommendations.includes(debate.id)) {
      return 0;
    }

    // 计算与最近推荐内容的类别差异性
    const categoryDiversity = this.calculateCategoryDiversity(debate, recentRecommendations);
    
    // 计算观点多样性
    const viewpointDiversity = this.calculateViewpointDiversity(debate);

    return (categoryDiversity + viewpointDiversity) / 2;
  }

  private calculateCategoryDiversity(debate: DebateFeatures, recentRecommendations: string[]): number {
    // 实现类别多样性计算逻辑
    return 1;
  }

  private calculateViewpointDiversity(debate: DebateFeatures): number {
    // 计算红蓝方观点的平衡度
    const total = debate.redVotes + debate.blueVotes;
    if (total === 0) return 1;
    
    const balance = Math.min(debate.redVotes, debate.blueVotes) / total;
    return balance * 2; // 转换到 0-1 范围
  }

  private diversifyResults(
    recommendations: Array<{ debate: DebateFeatures; score: WeightedScore }>
  ): Array<{ debate: DebateFeatures; score: WeightedScore }> {
    const diversified: typeof recommendations = [];
    const categories = new Set<string>();
    
    // 使用最大边际相关性算法重排序
    for (const item of recommendations) {
      if (
        diversified.length === 0 ||
        !categories.has(item.debate.category) ||
        this.isSignificantlyDifferent(item.debate, diversified)
      ) {
        diversified.push(item);
        categories.add(item.debate.category);
      }
    }
    
    return diversified;
  }

  private isSignificantlyDifferent(
    debate: DebateFeatures,
    existingRecommendations: Array<{ debate: DebateFeatures; score: WeightedScore }>
  ): boolean {
    // 实现显著性差异判断逻辑
    return true;
  }
} 