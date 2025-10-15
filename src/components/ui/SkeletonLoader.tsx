import { motion } from 'framer-motion';

interface SkeletonLoaderProps {
  variant?: 'text' | 'card' | 'image' | 'circle';
  className?: string;
  count?: number;
}

export default function SkeletonLoader({ variant = 'text', className = '', count = 1 }: SkeletonLoaderProps) {
  const getSkeletonClass = () => {
    switch (variant) {
      case 'text':
        return 'h-4 w-full rounded';
      case 'card':
        return 'h-96 w-full rounded-lg';
      case 'image':
        return 'aspect-square w-full rounded-lg';
      case 'circle':
        return 'h-12 w-12 rounded-full';
      default:
        return 'h-4 w-full rounded';
    }
  };

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          className={`bg-gradient-to-r from-neutral-200 via-neutral-100 to-neutral-200
                     bg-[length:200%_100%] ${getSkeletonClass()} ${className}`}
          animate={{
            backgroundPosition: ['200% 0', '-200% 0'],
          }}
          transition={{
            duration: 2,
            ease: 'linear',
            repeat: Infinity,
          }}
        />
      ))}
    </>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="space-y-4">
      <SkeletonLoader variant="image" />
      <SkeletonLoader variant="text" className="w-3/4" />
      <SkeletonLoader variant="text" className="w-1/2" />
      <SkeletonLoader variant="text" className="w-1/4" />
    </div>
  );
}
