'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface UserProfile {
  username: string;
  email: string;
  occupation: string;
  interests: string[];
  createdAt: Date;
}

interface UserDebate {
  id: string;
  title: string;
  category: string;
  createdAt: Date;
  redVotes: number;
  blueVotes: number;
}

export default function Profile() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [debates, setDebates] = useState<UserDebate[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'debates' | 'votes'>('debates');

  useEffect(() => {
    const loadUserData = async () => {
      if (!auth.currentUser) {
        router.push('/auth/login');
        return;
      }

      try {
        // Get user profile
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userDoc.exists()) {
          setProfile(userDoc.data() as UserProfile);
        }

        // Get user's debates
        const debatesQuery = query(
          collection(db, 'debates'),
          where('createdBy', '==', auth.currentUser.uid)
        );
        const debatesSnapshot = await getDocs(debatesQuery);
        const userDebates = debatesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as UserDebate[];
        setDebates(userDebates);

        setLoading(false);
      } catch (error) {
        console.error('Error loading user data:', error);
        setLoading(false);
      }
    };

    loadUserData();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">Profile not found</h1>
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
          {/* Profile Header */}
          <div className="p-8 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <h1 className="text-3xl font-bold mb-2">{profile.username}</h1>
            <p className="text-blue-100">{profile.email}</p>
          </div>

          {/* Profile Info */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-semibold mb-4">About</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-500">Occupation</label>
                    <p className="text-gray-800">{profile.occupation}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Interests</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {profile.interests.map((interest, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4">Statistics</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{debates.length}</div>
                    <div className="text-sm text-gray-500">Debates Created</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">0</div>
                    <div className="text-sm text-gray-500">Votes Cast</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="mt-12">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setActiveTab('debates')}
                    className={`${
                      activeTab === 'debates'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                  >
                    My Debates
                  </button>
                  <button
                    onClick={() => setActiveTab('votes')}
                    className={`${
                      activeTab === 'votes'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                  >
                    My Votes
                  </button>
                </nav>
              </div>

              {/* Tab Content */}
              <div className="mt-8">
                {activeTab === 'debates' ? (
                  <div className="space-y-6">
                    {debates.map((debate) => (
                      <motion.div
                        key={debate.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                      >
                        <Link href={`/debate/${debate.id}`}>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {debate.title}
                          </h3>
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <span>{debate.category}</span>
                            <span>
                              {debate.redVotes + debate.blueVotes} total votes
                            </span>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    Vote history coming soon
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 