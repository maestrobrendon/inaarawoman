import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';
import { useCountUp } from '../../hooks/useScrollAnimation';

interface CounterAnimationProps {
  end: number;
  duration?: number;
  suffix?: string;
  className?: string;
}

export function CounterAnimation({ end, duration = 2000, suffix = '', className = '' }: CounterAnimationProps) {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.5, triggerOnce: true });
  const { count, startAnimation } = useCountUp(end, duration);

  useEffect(() => {
    if (isVisible) {
      startAnimation();
    }
  }, [isVisible]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
      className={className}
    >
      {count}{suffix}
    </motion.div>
  );
}
