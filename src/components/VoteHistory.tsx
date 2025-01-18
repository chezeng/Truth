'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { db, auth } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import Link from 'next/link';

interface VoteRecord {
  id: string;
  debateId: string;
  debateTitle: string;
  vote: 'red' | 'blue';
  timestamp: Date;
}

export default function VoteHistory() {
  const [votes, setVotes] = useState<VoteRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVoteHistory = async () => {
      if (!auth.currentUser) return;

      try {
        const votesQuery = query(
          collection(db, 'votes'),
          where('userId', '==', auth.currentUser.uid),
          orderBy('timestamp', 'desc')
        );

        const snapshot = await getDocs(votesQuery);
        const voteRecords = await Promise.all(
          snapshot.docs.map(async (doc) => {
            const voteData = doc.data();
            // Get debate title
            const debateDoc = await getDocs(doc(db, 'debates', voteData.debateId));
            return {
              id: doc.id,
              debateTitle: debateDoc.data()?.title || 'Deleted Debate',
              ...voteData,
            } as VoteRecord;
          })
        );

        setVotes(voteRecords);
      } catch (error) {
        console.error('Error loading vote history:', error);
      }
      setLoading(false);
    };

    loadVoteHistory();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {votes.length === 0 ? (
        <p className="text-center text-gray-500 py-8">No votes yet</p>
      ) : (
        votes.map((vote) => (
          <motion.div
            key={vote.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-4 rounded-lg shadow-sm"
          >
            <Link href={`/debate/${vote.debateId}`}>
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium text-gray-900">{vote.debateTitle}</h3>
                  <p className="text-sm text-gray-500">
                    Voted {vote.vote === 'red' ? 'Supporting' : 'Opposing'} •{' '}
                    {new Date(vote.timestamp).toLocaleDateString()}
                  </p>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-sm ${
                    vote.vote === 'red'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {vote.vote === 'red' ? 'Supporting' : 'Opposing'}
                </div>
              </div>
            </Link>
          </motion.div>
        ))
      )}
    </div>
  );
} 