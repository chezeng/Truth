'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { db, auth } from '@/lib/firebase';
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';

interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  message: string;
  timestamp: Date;
  side?: 'red' | 'blue';
}

export default function DebateChat({ debateId }: { debateId: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [side, setSide] = useState<'red' | 'blue' | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!auth.currentUser) return;

    // Get user's side in the debate
    const votesRef = collection(db, 'votes');
    const voteQuery = query(
      votesRef,
      where('debateId', '==', debateId),
      where('userId', '==', auth.currentUser.uid)
    );

    const unsubscribeVote = onSnapshot(voteQuery, (snapshot) => {
      if (!snapshot.empty) {
        setSide(snapshot.docs[0].data().vote);
      }
    });

    // Subscribe to chat messages
    const messagesRef = collection(db, 'chat_messages');
    const messageQuery = query(
      messagesRef,
      where('debateId', '==', debateId),
      orderBy('timestamp', 'asc')
    );

    const unsubscribeMessages = onSnapshot(messageQuery, (snapshot) => {
      const newMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ChatMessage[];
      setMessages(newMessages);
      scrollToBottom();
    });

    return () => {
      unsubscribeVote();
      unsubscribeMessages();
    };
  }, [debateId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !newMessage.trim()) return;

    try {
      await addDoc(collection(db, 'chat_messages'), {
        debateId,
        userId: auth.currentUser.uid,
        username: auth.currentUser.displayName || 'Anonymous',
        message: newMessage.trim(),
        timestamp: serverTimestamp(),
        side
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="flex flex-col h-[500px] bg-white rounded-lg shadow-sm">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${
              message.userId === auth.currentUser?.uid ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                message.userId === auth.currentUser?.uid
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{message.username}</span>
                {message.side && (
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      message.side === 'red'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {message.side === 'red' ? 'Supporting' : 'Opposing'}
                  </span>
                )}
              </div>
              <p className="mt-1">{message.message}</p>
              <span className="text-xs opacity-75">
                {message.timestamp?.toDate().toLocaleTimeString()}
              </span>
            </div>
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
} 