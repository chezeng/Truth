'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { db, auth } from '@/lib/firebase';
import { collection, addDoc, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';

interface Comment {
  id: string;
  text: string;
  userId: string;
  username: string;
  createdAt: Timestamp;
}

export default function Comments({ debateId }: { debateId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const commentsQuery = query(
      collection(db, 'comments'),
      where('debateId', '==', debateId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(commentsQuery, (snapshot) => {
      const newComments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Comment[];
      setComments(newComments);
    });

    return () => unsubscribe();
  }, [debateId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !newComment.trim()) return;

    setLoading(true);
    try {
      await addDoc(collection(db, 'comments'), {
        debateId,
        text: newComment.trim(),
        userId: auth.currentUser.uid,
        username: auth.currentUser.displayName || 'Anonymous',
        createdAt: Timestamp.now()
      });
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
    setLoading(false);
  };

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold mb-4">Comments</h3>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="mb-6">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          rows={3}
        />
        <button
          type="submit"
          disabled={loading || !auth.currentUser}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Posting...' : 'Post Comment'}
        </button>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <motion.div
            key={comment.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-4 rounded-lg shadow-sm"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-gray-900">{comment.username}</p>
                <p className="text-gray-600 mt-1">{comment.text}</p>
              </div>
              <span className="text-sm text-gray-500">
                {comment.createdAt.toDate().toLocaleDateString()}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
} 