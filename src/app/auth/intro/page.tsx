'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

// Dynamic import of Three.js component for performance optimization
const Background = dynamic(() => import('@/components/Background'), { ssr: false });

export default function LandingPage() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Add progressive loading effect
    const timer = setTimeout(() => setIsReady(true), 500);
    const contentTimer = setTimeout(() => setShowContent(true), 1500);
    
    return () => {
      clearTimeout(timer);
      clearTimeout(contentTimer);
    };
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-black via-blue-900/30 to-black">
      <Background />

      {/* Main content */}
      <AnimatePresence>
        {isReady && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-white"
          >
            {/* Logo animation */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ 
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 0.3
              }}
              className="mb-6"
            >
              <div className="text-8xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-blue-200 to-blue-500">
                Truth
              </div>
            </motion.div>

            {/* Slogan animation */}
            <AnimatePresence>
              {showContent && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="text-center max-w-3xl mx-auto mb-12"
                >
                  <h1 className="text-3xl italic font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-200 via-blue-100 to-blue-300">
                    Building True Perspectives In the Information Overload Era
                  </h1>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Start button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ 
                type: "spring",
                stiffness: 400,
                damping: 10,
                delay: 1
              }}
              onClick={() => router.push('/auth/login')}
              className="relative group"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-blue-400 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
              <div className="relative px-12 py-4 bg-black rounded-lg leading-none flex items-center">
                <span className="text-blue-400 group-hover:text-blue-200 transition duration-200">
                  Begin Your Journey
                </span>
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="ml-2"
                >
                  →
                </motion.span>
              </div>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
