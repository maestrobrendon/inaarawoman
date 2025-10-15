import { useState } from 'react';
import { motion } from 'framer-motion';

interface BlurImageProps {
  src: string;
  alt: string;
  className?: string;
  objectFit?: 'cover' | 'contain';
}

export default function BlurImage({ src, alt, className = '', objectFit = 'cover' }: BlurImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <motion.img
        src={src}
        alt={alt}
        className={`w-full h-full ${objectFit === 'cover' ? 'object-cover' : 'object-contain'}`}
        style={{
          filter: isLoaded ? 'none' : 'blur(20px)',
        }}
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{
          scale: isLoaded ? 1 : 1.1,
          opacity: isLoaded ? 1 : 0,
        }}
        transition={{
          scale: { duration: 0.6, ease: 'easeOut' },
          opacity: { duration: 0.4 },
        }}
        onLoad={() => setIsLoaded(true)}
        loading="lazy"
      />

      {!isLoaded && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-neutral-200 via-neutral-100 to-neutral-200
                     bg-[length:200%_100%]"
          animate={{
            backgroundPosition: ['200% 0', '-200% 0'],
          }}
          transition={{
            duration: 2,
            ease: 'linear',
            repeat: Infinity,
          }}
        />
      )}
    </div>
  );
}
