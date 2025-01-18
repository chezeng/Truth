/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { motion } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

interface Debate {
  id: string;
  title: string;
  description: string;
  redVotes: number;
  blueVotes: number;
  category: string;
  createdAt: Date;
}

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [debates, setDebates] = useState<Debate[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const debatesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const scrollToDebates = () => {
    debatesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />
      
      {/* Hero Section with Search */}
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl mx-auto text-center"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-8">
            Explore Meaningful Debates
          </h1>
          
          <form onSubmit={handleSearch} className="relative group">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              placeholder="Search for debates..."
              className={`w-full px-6 py-4 text-lg border-2 rounded-full outline-none transition-all duration-300
                ${isSearchFocused 
                  ? 'border-blue-500 shadow-lg' 
                  : 'border-gray-300 shadow-md'}`}
            />
            <button
              type="submit"
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-500"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>

          <motion.button
            onClick={scrollToDebates}
            className="mt-12 text-blue-500 hover:text-blue-600"
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </motion.button>
        </motion.div>
      </div>

      {/* Debates Section */}
      <div ref={debatesRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Categories</h2>
          <div className="flex space-x-4 overflow-x-auto pb-4">
            {['Technology', 'Society', 'Culture', 'Economy', 'Education'].map((category) => (
              <motion.button
                key={category}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow flex-shrink-0"
              >
                {category}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Hot Debates */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Hot Debates</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Example Debate Card */}
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer"
              onClick={() => router.push('/debate/1')}
            >
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-2">Will AI replace human work?</h3>
                <p className="text-gray-600 text-sm mb-4">
                  With the rapid development of AI technology, we need to consider its impact on the job market...
                </p>
                <div className="flex justify-between items-center">
                  <div className="flex space-x-4">
                    <span className="text-red-500">Support: 128</span>
                    <span className="text-blue-500">Against: 96</span>
                  </div>
                  <span className="text-blue-500">Join →</span>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* Latest Debates */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Latest Debates</h2>
          <div className="space-y-4">
            <motion.div
              whileHover={{ x: 10 }}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => router.push('/debate/2')}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium">Remote work should be the standard?</h3>
                  <p className="text-gray-500 text-sm">Published on 2024-01-20</p>
                </div>
                <span className="text-blue-500">Join →</span>
              </div>
            </motion.div>
          </div>
        </motion.section>
      </div>
    </div>
  );
} 