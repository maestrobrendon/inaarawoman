import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Heart, ChevronLeft, ChevronRight, Truck, Headphones, Shield, RotateCcw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ProductWithImages, ProductImage } from '../types';
import { useCurrency } from '../context/CurrencyContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { getProductImageUrl } from '../utils/cloudinaryUpload';

// ============================================
// ANIMATION VARIANTS - Fixed TypeScript errors
// ============================================

// Using tuple type for cubic-bezier to fix TypeScript error
const customEase: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: customEase,
    },
  },
};

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: customEase,
    },
  },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: customEase,
    },
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

// Helper to safely get image URL from ProductImage or string
const getImageUrl = (image: string | ProductImage | undefined): string => {
  if (!image) return '';
  if (typeof image === 'string') return image;
  return image.image_url || image.cloudinary_url || '';
};

// Helper to get primary image from product
const getPrimaryImage = (product: ProductWithImages): string => {
  if (product.main_image) {
    return typeof product.main_image === 'string' 
      ? product.main_image 
      : getImageUrl(product.main_image as unknown as ProductImage);
  }
  if (product.images && product.images.length > 0) {
    return getImageUrl(product.images[0]);
  }
  return '';
};

// Helper to get secondary image from product
const getSecondaryImage = (product: ProductWithImages): string => {
  if (product.images && product.images.length > 1) {
    return getImageUrl(product.images[1]);
  }
  return getPrimaryImage(product);
};

// ============================================
// CUSTOM HOOKS
// ============================================

function useScrollAnimation(options: { threshold?: number; triggerOnce?: boolean } = {}) {
  const { threshold = 0.1, triggerOnce = true } = options;
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce && ref.current) {
            observer.unobserve(ref.current);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold, triggerOnce]);

  return { ref, isVisible };
}

// ============================================
// SUB-COMPONENTS
// ============================================

// Announcement Bar - Matching VÉON exactly
function AnnouncementBar() {
  return (
    <div className="bg-[#1a1a1a] text-white py-2.5 overflow-hidden">
      <motion.div 
        className="flex whitespace-nowrap"
        animate={{ x: [0, -1000] }}
        transition={{ 
          duration: 20, 
          repeat: Infinity, 
          ease: "linear" 
        }}
      >
        {[...Array(10)].map((_, i) => (
          <span key={i} className="text-xs tracking-[0.2em] mx-12 font-light uppercase">
            FREE SHIPPING ON ALL ORDERS
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// Hero Section - Matching VÉON design exactly
interface HeroSlide {
  image: string;
  title: string;
  subtitle: string;
}

function HeroSection() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  const slides: HeroSlide[] = [
    {
      image: '/hero.jpg',
      title: 'Bold Layers,\nConfident Looks.',
      subtitle: 'Layer up with confidence and stylish all season'
    },
    {
      image: '/freepik_edit (14).png',
      title: 'Elegant\nSimplicity.',
      subtitle: 'Discover timeless pieces for the modern woman'
    },
    {
      image: '/image copy copy copy.png',
      title: 'Define Your\nStyle.',
      subtitle: 'Curated collections that speak to your individuality'
    }
  ];

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <section className="relative h-[100svh] md:h-screen overflow-hidden bg-neutral-900">
      {/* Background Images */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: customEase }}
          className="absolute inset-0"
        >
          <img
            src={slides[currentSlide].image}
            alt={slides[currentSlide].title}
            className={`w-full h-full object-cover transition-opacity duration-1000 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setIsLoaded(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Desktop Layout */}
      <div className="hidden lg:flex relative z-10 h-full items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-2 gap-8 items-center">
            {/* Left Content */}
            <div className="text-white">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.8, ease: customEase }}
                >
                  <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-normal leading-[1.15] mb-6 whitespace-pre-line tracking-[-0.01em]">
                    {slides[currentSlide].title}
                  </h1>
                </motion.div>
              </AnimatePresence>

              {/* Thumbnail Navigation */}
              <div className="flex items-center gap-4 mt-8">
                <span className="text-xs font-light text-white/50 tracking-wide">
                  {String(currentSlide + 1).padStart(2, '0')}
                </span>
                <div className="flex gap-2">
                  {slides.map((slide, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`w-14 h-10 rounded-[2px] overflow-hidden border transition-all duration-300 ${
                        currentSlide === index 
                          ? 'border-white/80 opacity-100' 
                          : 'border-white/20 opacity-40 hover:opacity-60'
                      }`}
                    >
                      <img 
                        src={slide.image} 
                        alt="" 
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Content */}
            <div className="flex flex-col items-end justify-center text-right text-white">
              <AnimatePresence mode="wait">
                <motion.p
                  key={currentSlide}
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  transition={{ duration: 0.6, delay: 0.2, ease: customEase }}
                  className="text-sm text-white/70 mb-6 max-w-xs font-light leading-relaxed"
                >
                  {slides[currentSlide].subtitle}
                </motion.p>
              </AnimatePresence>

              <motion.button
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                onClick={() => navigate('/shop')}
                className="group inline-flex items-center gap-3 bg-white/5 backdrop-blur-sm border border-white/20 text-white px-7 py-3 rounded-[2px] hover:bg-white hover:text-neutral-900 transition-all duration-500"
              >
                <span className="text-xs font-normal tracking-[0.05em]">Browse Collection</span>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Navigation Arrows - Desktop */}
        <div className="absolute bottom-8 right-8 flex items-center gap-2">
          <button
            onClick={prevSlide}
            className="p-2.5 bg-white/5 backdrop-blur-sm border border-white/15 text-white rounded-[2px] hover:bg-white hover:text-neutral-900 transition-all duration-300"
          >
            <ChevronLeft size={18} strokeWidth={1.5} />
          </button>
          <button
            onClick={nextSlide}
            className="p-2.5 bg-white/5 backdrop-blur-sm border border-white/15 text-white rounded-[2px] hover:bg-white hover:text-neutral-900 transition-all duration-300"
          >
            <ChevronRight size={18} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Mobile Layout - Refined luxury aesthetic */}
      <div className="lg:hidden relative z-10 h-full flex flex-col justify-end pb-8 px-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.8, ease: customEase }}
          >
            <h1 className="text-3xl sm:text-4xl font-normal leading-[1.15] text-white mb-4 whitespace-pre-line tracking-[-0.01em]">
              {slides[currentSlide].title}
            </h1>
          </motion.div>
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.p
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-white/60 text-sm font-light mb-6 leading-relaxed"
          >
            {slides[currentSlide].subtitle}
          </motion.p>
        </AnimatePresence>

        <button
          onClick={() => navigate('/shop')}
          className="w-full bg-white/5 backdrop-blur-sm border border-white/20 text-white px-6 py-3 rounded-[2px] text-xs font-normal tracking-[0.05em] mb-6"
        >
          Browse Collection
        </button>

        {/* Mobile Thumbnails */}
        <div className="flex items-center gap-2">
          {slides.map((slide, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-11 h-8 rounded-[2px] overflow-hidden border transition-all duration-300 ${
                currentSlide === index 
                  ? 'border-white/70 opacity-100' 
                  : 'border-white/20 opacity-40'
              }`}
            >
              <img 
                src={slide.image} 
                alt="" 
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

// Product Card Component - Refined luxury style
interface ProductCardProps {
  product: ProductWithImages;
  showBadge?: boolean;
  badgeType?: 'bestseller' | 'new' | null;
}

function ProductCard({ product, showBadge = true, badgeType }: ProductCardProps) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { showToast } = useToast();
  const { formatPrice } = useCurrency();
  const inWishlist = isInWishlist(product.id);

  const primaryImage = getPrimaryImage(product);
  const secondaryImage = getSecondaryImage(product);

  const handleWishlistClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const productForWishlist = {
        ...product,
        images: product.images?.map(img => getImageUrl(img)) || []
      };
      await toggleWishlist(productForWishlist as any);
      showToast(
        inWishlist ? 'Removed from wishlist' : 'Added to wishlist',
        'success'
      );
    } catch (error) {
      showToast('Failed to update wishlist', 'error');
    }
  };

  // Determine badge to show
  const badge = badgeType !== undefined 
    ? badgeType 
    : (product.is_bestseller ? 'bestseller' : product.is_new ? 'new' : null);

  return (
    <motion.div
      variants={fadeInUp}
      className="group cursor-pointer"
      onClick={() => navigate(`/product/${product.id}`)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-[#f7f7f7] rounded-[2px] mb-3">
        {/* Image with hover swap */}
        {primaryImage ? (
          <motion.img
            src={getProductImageUrl(isHovered && secondaryImage !== primaryImage ? secondaryImage : primaryImage)}
            alt={product.name}
            className="w-full h-full object-cover"
            initial={false}
            animate={{ scale: isHovered ? 1.03 : 1 }}
            transition={{ duration: 0.7, ease: customEase }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-300 text-xs">
            No image
          </div>
        )}

        {/* Badge - Refined styling */}
        {showBadge && badge && (
          <span className={`absolute top-3 left-3 text-[10px] px-2.5 py-1 rounded-[2px] font-normal tracking-[0.03em] ${
            badge === 'bestseller' 
              ? 'bg-[#c9a56c] text-white' 
              : 'bg-neutral-800 text-white'
          }`}>
            {badge === 'bestseller' ? 'Best Seller' : 'New'}
          </span>
        )}

        {/* Wishlist Button - Refined heart */}
        <button
          onClick={handleWishlistClick}
          className="absolute top-3 right-3 p-1.5 bg-transparent hover:bg-white/30 rounded-full transition-all duration-300 z-10"
        >
          <Heart
            size={18}
            strokeWidth={1.25}
            className={`transition-colors duration-300 ${
              inWishlist ? 'fill-neutral-800 text-neutral-800' : 'text-neutral-400 hover:text-neutral-600'
            }`}
          />
        </button>

        {/* Out of Stock Overlay */}
        {product.stock_quantity === 0 && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="text-xs font-light text-neutral-600 tracking-[0.05em]">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Product Info - Refined typography */}
      <div className="space-y-1">
        <h3 className="text-xs font-normal text-neutral-700 group-hover:text-neutral-500 transition-colors line-clamp-1 tracking-[0.01em]">
          {product.name}
        </h3>
        <p className="text-xs text-neutral-500 font-light">
          {formatPrice(product.price)}
        </p>
      </div>
    </motion.div>
  );
}

// Section Header Component - Refined luxury style
interface SectionHeaderProps {
  title: string;
  viewAllLink?: string;
  className?: string;
}

function SectionHeader({ title, viewAllLink, className = '' }: SectionHeaderProps) {
  const navigate = useNavigate();
  
  return (
    <div className={`flex items-center justify-between mb-10 ${className}`}>
      <h2 className="text-sm font-normal text-neutral-800 tracking-[0.04em]">{title}</h2>
      {viewAllLink && (
        <button
          onClick={() => navigate(viewAllLink)}
          className="text-xs text-neutral-400 hover:text-neutral-700 transition-colors tracking-[0.02em]"
        >
          View All
        </button>
      )}
    </div>
  );
}

// About Section - "Our Story, Your Style" - Refined luxury aesthetic
function AboutSection() {
  const navigate = useNavigate();
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section className="relative">
      <motion.div
        ref={ref}
        initial="hidden"
        animate={isVisible ? "visible" : "hidden"}
        variants={fadeIn}
        className="relative h-[450px] md:h-[550px] overflow-hidden"
      >
        <img
          src="/freepik_edit (14).png"
          alt="Our Story"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-black/10" />
        
        <div className="absolute inset-0 flex items-center justify-center text-center px-4">
          <motion.div variants={fadeInUp} className="max-w-lg">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-normal text-white mb-4 tracking-[-0.01em]">
              Our Story, Your Style
            </h2>
            <p className="text-white/70 text-sm md:text-base mb-8 max-w-md mx-auto font-light leading-relaxed">
              Crafting timeless fashion with quality, innovation, and sophistication at the core
            </p>
            <button
              onClick={() => navigate('/about')}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/25 text-white px-7 py-3 rounded-[2px] hover:bg-white hover:text-neutral-900 transition-all duration-500 text-xs font-normal tracking-[0.05em]"
            >
              Explore About us
            </button>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

// Category Showcase - Refined luxury typography
function CategoryShowcase() {
  const navigate = useNavigate();
  const { ref, isVisible } = useScrollAnimation();

  const categories = [
    {
      title: 'Elevate Your Style',
      subtitle: 'New in Dresses',
      description: 'Discover sophisticated silhouettes and luxurious fabrics, designed for timeless style',
      image: '/IMG_4511 copy.JPG',
      link: '/shop?category=dresses',
      alignment: 'left' as const
    },
    {
      title: 'Redefine Casual Comfort',
      subtitle: 'New in T-Shirts',
      description: 'Experience premium fabrics and modern fits, designed for effortless everyday style',
      image: '/A5B830C9-6BF5-4117-87BB-81014C55648B copy.jpg',
      link: '/shop?category=tops',
      alignment: 'right' as const
    }
  ];

  return (
    <section className="bg-white">
      <motion.div
        ref={ref}
        initial="hidden"
        animate={isVisible ? "visible" : "hidden"}
        variants={staggerContainer}
      >
        {categories.map((category, index) => (
          <motion.div
            key={index}
            variants={fadeInUp}
            className="grid grid-cols-1 lg:grid-cols-2"
          >
            {/* Image */}
            <div className={`relative aspect-[4/5] lg:aspect-auto lg:h-[550px] overflow-hidden ${
              category.alignment === 'right' ? 'lg:order-2' : ''
            }`}>
              <motion.img
                src={category.image}
                alt={category.title}
                className="w-full h-full object-cover"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.8, ease: customEase }}
              />
            </div>

            {/* Content */}
            <div className={`flex flex-col justify-center px-6 lg:px-14 py-14 lg:py-0 bg-[#fafafa] ${
              category.alignment === 'right' ? 'lg:order-1 lg:text-right lg:items-end' : 'lg:items-start'
            }`}>
              <p className="text-[10px] tracking-[0.2em] text-neutral-400 uppercase mb-3 font-normal">
                {category.subtitle}
              </p>
              <h3 className="text-xl md:text-2xl lg:text-[1.75rem] font-normal text-neutral-800 mb-4 tracking-[-0.01em]">
                {category.title}
              </h3>
              <p className={`text-neutral-500 mb-8 max-w-sm text-sm font-light leading-relaxed ${
                category.alignment === 'right' ? 'lg:text-right' : ''
              }`}>
                {category.description}
              </p>
              <button
                onClick={() => navigate(category.link)}
                className="inline-flex items-center gap-2 bg-neutral-900 text-white px-7 py-3 rounded-[2px] hover:bg-neutral-800 transition-colors text-xs font-normal tracking-[0.05em] w-fit"
              >
                Discover Collection
              </button>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

// Why Shop With Us Section - Refined luxury typography
function WhyShopSection() {
  const { ref, isVisible } = useScrollAnimation();

  const features = [
    {
      icon: <Truck className="w-6 h-6" strokeWidth={1} />,
      title: 'Free Shipping',
      description: 'Get your order in 4-7 business days.'
    },
    {
      icon: <Headphones className="w-6 h-6" strokeWidth={1} />,
      title: 'Here to help',
      description: 'Customer service is available Monday through Friday.'
    },
    {
      icon: <Shield className="w-6 h-6" strokeWidth={1} />,
      title: 'Secure Payment',
      description: 'We keep your payment information safe.'
    },
    {
      icon: <RotateCcw className="w-6 h-6" strokeWidth={1} />,
      title: '10-Days Return Policy',
      description: "We think you'll love it. If you don't, let us know!"
    }
  ];

  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          variants={fadeInUp}
          className="text-center mb-12"
        >
          <h2 className="text-xl md:text-2xl font-normal text-neutral-800 mb-3 tracking-[-0.01em]">
            Why Shop with Inaara
          </h2>
          <p className="text-neutral-400 text-sm font-light">
            Enjoy exclusive benefits designed for a seamless shopping experience
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          variants={staggerContainer}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              className="bg-[#fafafa] rounded-[2px] p-8 text-center hover:shadow-sm transition-shadow duration-300"
            >
              <div className="flex justify-center mb-4 text-neutral-500">
                {feature.icon}
              </div>
              <h3 className="font-normal text-neutral-800 mb-2 text-sm tracking-[0.01em]">{feature.title}</h3>
              <p className="text-xs text-neutral-400 font-light leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// Instagram Section - Refined luxury typography
function InstagramSection() {
  const { ref, isVisible } = useScrollAnimation();

  const images = [
    '/IMG_4511 copy.JPG',
    '/A5B830C9-6BF5-4117-87BB-81014C55648B copy.jpg',
    '/Gemini_Generated_Image_saz8ssaz8ssaz8ss.png',
    '/Gemini_Generated_Image_hggw0zhggw0zhggw copy.png',
    '/freepik_edit (14).png',
    '/image copy copy copy.png'
  ];

  return (
    <section className="py-14 md:py-18 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          variants={fadeInUp}
          className="text-center mb-10"
        >
          <p className="text-[10px] tracking-[0.2em] text-neutral-400 uppercase mb-2 font-normal">Instagram</p>
          <h2 className="text-base md:text-lg font-normal text-neutral-800 tracking-[0.01em]">@inaarawoman</h2>
        </motion.div>

        <motion.div
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          variants={staggerContainer}
          className="grid grid-cols-3 md:grid-cols-6 gap-1.5 md:gap-2"
        >
          {images.map((image, index) => (
            <motion.a
              key={index}
              href="https://instagram.com/inaarawoman"
              target="_blank"
              rel="noopener noreferrer"
              variants={scaleIn}
              className="relative aspect-square overflow-hidden group"
            >
              <img
                src={image}
                alt={`Instagram ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
            </motion.a>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// Footer Section - Refined luxury typography
function FooterSection() {
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const { ref, isVisible } = useScrollAnimation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubscribing(true);
    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert({ email });

      if (error) {
        if (error.code === '23505') {
          alert('This email is already subscribed!');
        } else {
          throw error;
        }
      } else {
        alert('Thank you for subscribing!');
        setEmail('');
      }
    } catch (error) {
      console.error('Error subscribing:', error);
      alert('Failed to subscribe. Please try again.');
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <footer className="bg-[#1a1a1a] py-14 md:py-18">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12"
        >
          {/* Brand & Newsletter */}
          <motion.div variants={fadeInUp} className="lg:col-span-1">
            <h3 className="text-base font-normal text-white mb-2 tracking-[0.02em]">INAARA</h3>
            <p className="text-neutral-500 text-xs mb-6 font-light leading-relaxed">
              Sign-up to receive the latest news from Inaara.
            </p>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-neutral-800/50 border border-neutral-700/50 text-white placeholder-neutral-500 px-4 py-2.5 rounded-[2px] text-xs focus:outline-none focus:border-neutral-500 font-light"
                required
              />
              <button
                type="submit"
                disabled={isSubscribing}
                className="w-full bg-white text-neutral-900 px-4 py-2.5 rounded-[2px] text-xs font-normal tracking-[0.03em] hover:bg-neutral-100 transition-colors disabled:opacity-50"
              >
                {isSubscribing ? 'Subscribing...' : 'Subscribe'}
              </button>
            </form>
          </motion.div>

          {/* Navigation */}
          <motion.div variants={fadeInUp}>
            <h4 className="text-[10px] tracking-[0.15em] text-neutral-500 uppercase mb-4 font-normal">Navigation</h4>
            <ul className="space-y-2.5">
              {['Home', 'About', 'Blogs', 'Contact', 'Favorites', 'FAQ'].map((item) => (
                <li key={item}>
                  <a href={`/${item.toLowerCase()}`} className="text-neutral-400 hover:text-white transition-colors text-xs font-light">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Shop */}
          <motion.div variants={fadeInUp}>
            <h4 className="text-[10px] tracking-[0.15em] text-neutral-500 uppercase mb-4 font-normal">Shop</h4>
            <ul className="space-y-2.5">
              {['All', 'T-Shirts', 'Shirts', 'Dresses & Jump Suits', 'Bottoms', 'Knitwears', 'Coats & Jackets'].map((item) => (
                <li key={item}>
                  <a href="/shop" className="text-neutral-400 hover:text-white transition-colors text-xs font-light">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Support */}
          <motion.div variants={fadeInUp}>
            <h4 className="text-[10px] tracking-[0.15em] text-neutral-500 uppercase mb-4 font-normal">Support</h4>
            <ul className="space-y-2.5">
              {['Payment Methods', 'Returns & Refunds', 'Shipping & Delivery', 'Terms & Condition', 'Privacy Policy'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-neutral-400 hover:text-white transition-colors text-xs font-light">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>

        {/* Bottom Bar */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          className="mt-12 pt-6 border-t border-neutral-800/50 flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-6">
            {['Instagram', 'Twitter (X)', 'LinkedIn'].map((social) => (
              <a key={social} href="#" className="text-neutral-500 hover:text-white transition-colors text-xs font-light">
                {social}
              </a>
            ))}
          </div>
          <p className="text-neutral-600 text-xs font-light">
            © {new Date().getFullYear()} Inaara, All rights reserved
          </p>
        </motion.div>
      </div>
    </footer>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function EnhancedHomePage() {
  const [bestSellers, setBestSellers] = useState<ProductWithImages[]>([]);
  const [newArrivals, setNewArrivals] = useState<ProductWithImages[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const { ref: bestSellersRef, isVisible: bestSellersVisible } = useScrollAnimation();
  const { ref: newArrivalsRef, isVisible: newArrivalsVisible } = useScrollAnimation();

  useEffect(() => {
    loadAllProducts();
  }, []);

  const loadAllProducts = async () => {
    setIsLoading(true);
    try {
      // Load Best Sellers - matching live site query structure
      const { data: bestSellerData, error: bestSellerError } = await supabase
        .from('products')
        .select(`
          *,
          images:product_images(*),
          collection:collections(*)
        `)
        .eq('is_bestseller', true)
        .order('created_at', { ascending: false })
        .limit(6);

      if (bestSellerError) {
        console.error('Error loading best sellers:', bestSellerError);
      } else if (bestSellerData) {
        console.log('Best sellers loaded:', bestSellerData.length);
        setBestSellers(bestSellerData as ProductWithImages[]);
      }

      // Load New Arrivals - matching live site query structure
      const { data: newArrivalData, error: newArrivalError } = await supabase
        .from('products')
        .select(`
          *,
          images:product_images(*),
          collection:collections(*)
        `)
        .eq('is_new', true)
        .order('created_at', { ascending: false })
        .limit(6);

      if (newArrivalError) {
        console.error('Error loading new arrivals:', newArrivalError);
      } else if (newArrivalData) {
        console.log('New arrivals loaded:', newArrivalData.length);
        setNewArrivals(newArrivalData as ProductWithImages[]);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Announcement Bar */}
      <AnnouncementBar />

      {/* Hero Section */}
      <HeroSection />

      {/* Best Sellers Section */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            ref={bestSellersRef}
            initial="hidden"
            animate={bestSellersVisible ? "visible" : "hidden"}
            variants={fadeInUp}
          >
            <SectionHeader title="Best Sellers" viewAllLink="/shop" />
          </motion.div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[3/4] bg-neutral-200 rounded-sm mb-3" />
                  <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-neutral-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <motion.div
              initial="hidden"
              animate={bestSellersVisible ? "visible" : "hidden"}
              variants={staggerContainer}
              className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6"
            >
              {bestSellers.length > 0 ? (
                bestSellers.map((product) => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    badgeType="bestseller"
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-12 text-neutral-400">
                  No best sellers available. Mark products as "Best Seller" in the admin dashboard.
                </div>
              )}
            </motion.div>
          )}
        </div>
      </section>

      {/* About Section - "Our Story, Your Style" */}
      <AboutSection />

      {/* New Arrivals Section */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            ref={newArrivalsRef}
            initial="hidden"
            animate={newArrivalsVisible ? "visible" : "hidden"}
            variants={fadeInUp}
          >
            <SectionHeader title="New in" viewAllLink="/shop" />
          </motion.div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[3/4] bg-neutral-200 rounded-sm mb-3" />
                  <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-neutral-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <motion.div
              initial="hidden"
              animate={newArrivalsVisible ? "visible" : "hidden"}
              variants={staggerContainer}
              className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6"
            >
              {newArrivals.length > 0 ? (
                newArrivals.map((product) => (
                  <ProductCard 
                    key={product.id} 
                    product={product}
                    showBadge={false}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-12 text-neutral-400">
                  No new arrivals available. Mark products as "New" in the admin dashboard.
                </div>
              )}
            </motion.div>
          )}
        </div>
      </section>

      {/* Category Showcase - "Elevate Your Style" & "Redefine Casual Comfort" */}
      <CategoryShowcase />

      {/* Why Shop With Us */}
      <WhyShopSection />

      {/* Instagram Section */}
      <InstagramSection />

      {/* Footer */}
      <FooterSection />
    </div>
  );
}