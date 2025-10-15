import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function LoadingBar() {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleStart = () => setIsLoading(true);
    const handleComplete = () => setIsLoading(false);

    window.addEventListener('pageTransitionStart', handleStart);
    window.addEventListener('pageTransitionComplete', handleComplete);

    return () => {
      window.removeEventListener('pageTransitionStart', handleStart);
      window.removeEventListener('pageTransitionComplete', handleComplete);
    };
  }, []);

  if (!isLoading) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 z-[10000] origin-left"
      initial={{ scaleX: 0 }}
      animate={{ scaleX: 1 }}
      transition={{
        duration: 0.5,
        ease: 'easeInOut',
      }}
    />
  );
}
