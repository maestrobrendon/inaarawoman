import { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { ArrowRight, ChevronDown } from 'lucide-react';
import Button from '../ui/Button';

interface HeroSectionProps {
  onNavigate: (page: string, data?: any) => void;
}

export default function HeroSection({ onNavigate }: HeroSectionProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();

  const parallaxY = useTransform(scrollY, [0, 800], [0, 400]);
  const smoothParallax = useSpring(parallaxY, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setShowScrollIndicator(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const titleWords = ['Radiate', 'Your', 'Light'];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const wordVariants = {
    hidden: {
      opacity: 0,
      y: 30,
      letterSpacing: '-0.05em'
    },
    visible: {
      opacity: 1,
      y: 0,
      letterSpacing: '0em',
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  const buttonVariants = {
    initial: { scale: 1 },
    hover: {
      scale: 1.05,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    },
    tap: {
      scale: 0.98,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 15
      }
    }
  };

  return (
    <section ref={heroRef} className="relative h-[90vh] flex items-end md:items-center justify-center overflow-hidden bg-neutral-100">
      <motion.div
        className="absolute inset-0"
        style={{ y: smoothParallax }}
      >
        <div className="absolute inset-0 w-full h-[120%]">
          <img
            src="/hero-1.jpg"
            alt="Two women in elegant patterned skirts at coastal cliffs"
            className={`w-full h-full object-cover scale-125 object-[center_40%] md:scale-100 md:object-center transition-opacity duration-1000 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setIsLoaded(true)}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' opacity=\'0.05\'/%3E%3C/svg%3E")',
              opacity: 0.5
            }}
          />

          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(circle at center, transparent 40%, rgba(0,0,0,0.3) 100%)'
            }}
          />
        </div>
      </motion.div>

      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full pb-16 md:pb-0">
        <div className="max-w-3xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hidden md:block text-xs uppercase tracking-widest text-white mb-4 font-light"
          >
            New Arrivals Await You
          </motion.p>

          <motion.h1
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="font-serif text-5xl md:text-6xl font-bold text-white mb-6 md:mb-8 leading-tight drop-shadow-2xl"
          >
            {titleWords.map((word, index) => (
              <motion.span
                key={index}
                variants={wordVariants}
                className="inline-block mr-4"
              >
                {word}
              </motion.span>
            ))}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-lg md:hidden text-white mb-8 leading-relaxed drop-shadow-lg"
          >
            Timeless elegance meets modern femininity. Every woman deserves to shine in her own light.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
          >
            <motion.div
              variants={buttonVariants}
              initial="initial"
              whileHover="hover"
              whileTap="tap"
              className="inline-block relative group"
            >
              <div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 group-hover:animate-shimmer rounded-lg"
                style={{
                  backgroundSize: '200% 100%'
                }}
              />
              <Button
                size="lg"
                onClick={() => onNavigate('shop')}
                variant="secondary"
                className="relative shadow-lg group-hover:shadow-2xl transition-shadow duration-300"
              >
                <span className="md:hidden">Discover Collection</span>
                <span className="hidden md:inline">View Collection</span>
                <ArrowRight className="ml-2 inline md:hidden" size={20} />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showScrollIndicator ? 1 : 0 }}
        transition={{ duration: 0.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 pointer-events-none"
      >
        <p className="text-xs uppercase tracking-widest text-white/80 font-light">
          Scroll to explore
        </p>
        <motion.div
          animate={{
            y: [0, 10, 0]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <ChevronDown className="text-[#D4AF37]" size={24} />
        </motion.div>
      </motion.div>
    </section>
  );
}
