import { motion } from 'framer-motion';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';

interface ImageRevealProps {
  src: string;
  alt: string;
  className?: string;
  delay?: number;
}

export function ImageReveal({ src, alt, className = '', delay = 0 }: ImageRevealProps) {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2, triggerOnce: true });

  return (
    <motion.div ref={ref} className={className}>
      <motion.img
        src={src}
        alt={alt}
        initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
        animate={
          isVisible
            ? { opacity: 1, scale: 1, filter: 'blur(0px)' }
            : { opacity: 0, scale: 0.9, filter: 'blur(10px)' }
        }
        transition={{
          duration: 0.8,
          delay,
          ease: [0.25, 0.1, 0.25, 1],
        }}
        className="w-full h-full object-cover"
      />
    </motion.div>
  );
}
