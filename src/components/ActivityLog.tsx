'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { db, auth } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import Link from 'next/link';

interface Activity {
  id: string;
  type: 'debate_created' | 'vote_cast' | 'comment_added';
  targetId: string;
  targetTitle: string;
  timestamp: Date;
  details?: string;
}

export default function ActivityLog() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadActivityLog = async () => {
      if (!auth.currentUser) return;

      try {
        const activitiesQuery = query(
          collection(db, 'activities'),
          where('userId', '==', auth.currentUser.uid),
          orderBy('timestamp', 'desc'),
          limit(20)
        );

        const snapshot = await getDocs(activitiesQuery);
        const activityRecords = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Activity[];

        setActivities(activityRecords);
      } catch (error) {
        console.error('Error loading activity log:', error);
      }
      setLoading(false);
    };

    loadActivityLog();
  }, []);

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'debate_created':
        return (
          <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        );
      case 'vote_cast':
        return (
          <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'comment_added':
        return (
          <svg className="w-6 h-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.length === 0 ? (
        <p className="text-center text-gray-500 py-8">No activities yet</p>
      ) : (
        activities.map((activity) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-4 rounded-lg shadow-sm"
          >
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1">
                <Link href={`/debate/${activity.targetId}`}>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {activity.type === 'debate_created' && 'Created a new debate'}
                      {activity.type === 'vote_cast' && 'Voted on a debate'}
                      {activity.type === 'comment_added' && 'Commented on a debate'}
                    </p>
                    <p className="text-sm text-gray-500">{activity.targetTitle}</p>
                    {activity.details && (
                      <p className="text-sm text-gray-600 mt-1">{activity.details}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </Link>
              </div>
            </div>
          </motion.div>
        ))
      )}
    </div>
  );
} 