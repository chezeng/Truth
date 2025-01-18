/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { db, auth } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

export default function CreateDebate() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [redSide, setRedSide] = useState('');
  const [blueSide, setBlueSide] = useState('');
  const [category, setCategory] = useState('Technology');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) {
      setError('Please sign in to create a debate');
      return;
    }

    setLoading(true);
    try {
      const docRef = await addDoc(collection(db, 'debates'), {
        title,
        description,
        redSide,
        blueSide,
        category,
        createdAt: new Date(),
        createdBy: auth.currentUser.uid,
        redVotes: 0,
        blueVotes: 0,
      });
      router.push(`/debate/${docRef.id}`);
    } catch (err) {
      setError('Failed to create debate');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 shadow-lg rounded-lg"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Debate</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={4}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              >
                {['Technology', 'Society', 'Culture', 'Economy', 'Education'].map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="redSide" className="block text-sm font-medium text-gray-700">
                Supporting View
              </label>
              <textarea
                id="redSide"
                value={redSide}
                onChange={(e) => setRedSide(e.target.value)}
                required
                rows={4}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>

            <div>
              <label htmlFor="blueSide" className="block text-sm font-medium text-gray-700">
                Opposing View
              </label>
              <textarea
                id="blueSide"
                value={blueSide}
                onChange={(e) => setBlueSide(e.target.value)}
                required
                rows={4}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {loading ? 'Creating...' : 'Create Debate'}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
} 