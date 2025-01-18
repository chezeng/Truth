'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { db, auth } from '@/lib/firebase';
import { doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface DebateData {
  title: string;
  description: string;
  redSide: string;
  blueSide: string;
  redVotes: number;
  blueVotes: number;
  createdAt: Date;
  category: string;
}

export default function DebateDetail() {
  const params = useParams();
  const [debate, setDebate] = useState<DebateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [userVote, setUserVote] = useState<'red' | 'blue' | null>(null);

  useEffect(() => {
    if (!params.id) return;

    const debateRef = doc(db, 'debates', params.id as string);
    const unsubscribe = onSnapshot(debateRef, (doc) => {
      if (doc.exists()) {
        setDebate(doc.data() as DebateData);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [params.id]);

  const handleVote = async (side: 'red' | 'blue') => {
    if (!auth.currentUser || !params.id || userVote === side) return;

    const debateRef = doc(db, 'debates', params.id as string);
    try {
      await updateDoc(debateRef, {
        [`${side}Votes`]: (debate?.[`${side}Votes`] || 0) + 1,
      });
      setUserVote(side);
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!debate) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">Debate not found</h1>
          <Link href="/" className="text-blue-500 hover:text-blue-600 mt-4 inline-block">
            Return to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white shadow-lg rounded-lg overflow-hidden"
        >
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{debate.title}</h1>
            <p className="text-gray-600 mb-8">{debate.description}</p>

            <div className="grid grid-cols-2 gap-8">
              {/* Red Side */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-red-50 p-6 rounded-lg"
              >
                <h2 className="text-xl font-semibold text-red-700 mb-4">Supporting View</h2>
                <p className="text-gray-700 mb-4">{debate.redSide}</p>
                <div className="flex items-center justify-between">
                  <span className="text-red-600 font-semibold">
                    {debate.redVotes} votes
                  </span>
                  <button
                    onClick={() => handleVote('red')}
                    disabled={userVote !== null}
                    className={`px-4 py-2 rounded-md ${
                      userVote === 'red'
                        ? 'bg-red-600 text-white'
                        : 'bg-red-100 text-red-600 hover:bg-red-200'
                    }`}
                  >
                    Vote
                  </button>
                </div>
              </motion.div>

              {/* Blue Side */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-blue-50 p-6 rounded-lg"
              >
                <h2 className="text-xl font-semibold text-blue-700 mb-4">Opposing View</h2>
                <p className="text-gray-700 mb-4">{debate.blueSide}</p>
                <div className="flex items-center justify-between">
                  <span className="text-blue-600 font-semibold">
                    {debate.blueVotes} votes
                  </span>
                  <button
                    onClick={() => handleVote('blue')}
                    disabled={userVote !== null}
                    className={`px-4 py-2 rounded-md ${
                      userVote === 'blue'
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                    }`}
                  >
                    Vote
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 