import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { Play, ChevronDown, Star, ShoppingBag, Truck, Shield, Award } from 'lucide-react';
import Button from '../components/ui/Button';

const TextRevealOnScroll = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.5 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const SplitTextReveal = ({ text, className = '' }: { text: string; className?: string }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.5 });
  const words = text.split(' ');

  return (
    <div ref={ref} className={className}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: i * 0.1 }}
          className="inline-block mr-2"
        >
          {word}
        </motion.span>
      ))}
    </div>
  );
};

const ParallaxImage = ({ src, speed = 0.5, className = '' }: { src: string; speed?: number; className?: string }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start']
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', `${speed * 100}%`]);

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <motion.img
        src={src}
        style={{ y }}
        className="w-full h-full object-cover scale-110"
        alt=""
      />
    </div>
  );
};

const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-neutral-900 z-50 origin-left"
      style={{ scaleX: scrollYProgress }}
    />
  );
};

// Decorative Lines Component (like Clingr)
const DecorativeLines = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Vertical lines */}
      <div className="absolute left-[15%] top-0 bottom-0 w-px bg-white/10" />
      <div className="absolute left-[30%] top-0 bottom-0 w-px bg-white/10" />
      <div className="absolute left-[50%] top-0 bottom-0 w-px bg-white/10" />
      <div className="absolute left-[70%] top-0 bottom-0 w-px bg-white/10" />
      <div className="absolute left-[85%] top-0 bottom-0 w-px bg-white/10" />
      
      {/* Horizontal lines */}
      <div className="absolute top-[20%] left-0 right-0 h-px bg-white/10" />
      <div className="absolute top-[40%] left-0 right-0 h-px bg-white/10" />
      <div className="absolute top-[60%] left-0 right-0 h-px bg-white/10" />
      <div className="absolute top-[80%] left-0 right-0 h-px bg-white/10" />
    </div>
  );
};

export default function ClingrHomePage() {
  const navigate = useNavigate();
  const [showVideo, setShowVideo] = useState(false);
  const heroRef = useRef(null);
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 300], [1, 0.95]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-white">
      <ScrollProgress />

      {/* Hero Section - Minimalist */}
      <motion.section
        ref={heroRef}
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://res.cloudinary.com/dusynu0kv/image/upload/v1761658028/hero_jlpiil.jpg"
            alt="Hero"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Decorative Lines */}
        <DecorativeLines />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="mb-6"
          >
            {/* Tiny elegant label */}
            <p className="text-[10px] md:text-xs tracking-[0.4em] text-white/70 mb-4 uppercase font-light">
              New Arrivals Just for You
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-3 justify-center items-center"
          >
            {/* Tiny buttons */}
            <button
              onClick={() => navigate('/shop')}
              className="px-6 py-2 text-[10px] tracking-widest uppercase bg-white text-neutral-900 hover:bg-neutral-100 border border-white transition-all duration-300 font-medium"
            >
              View Collection
            </button>
            
            <button
              onClick={() => setShowVideo(true)}
              className="flex items-center gap-2 px-6 py-2 text-[10px] tracking-widest uppercase border border-white text-white hover:bg-white hover:text-neutral-900 transition-all duration-300 font-medium"
            >
              <Play size={12} />
              Watch Story
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.2 }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <ChevronDown size={20} className="text-white/60" />
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Best Sellers Section - Minimalist */}
      <section className="py-16 px-4 bg-neutral-50">
        <div className="max-w-7xl mx-auto">
          <TextRevealOnScroll className="text-center mb-12">
            <p className="text-[10px] tracking-[0.3em] text-neutral-500 mb-3 uppercase font-light">Best Sellers</p>
            <h2 className="font-serif text-xl md:text-2xl font-light text-neutral-900">
              Customer Favorites
            </h2>
          </TextRevealOnScroll>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Product 1 */}
            <TextRevealOnScroll>
              <div className="group cursor-pointer">
                <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100 mb-3">
                  <img
                    src="https://res.cloudinary.com/dusynu0kv/image/upload/w_600,q_auto,f_auto/v1761655548/A5B830C9-6BF5-4117-87BB-81014C55648B_jruhlc.jpg"
                    alt="Blaze Set Summer"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <button className="px-4 py-1.5 bg-white text-neutral-900 text-[9px] tracking-widest uppercase font-medium">
                      Quick View
                    </button>
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="font-serif text-xs font-normal text-neutral-900 mb-0.5">Blaze Set Summer</h3>
                  <p className="text-neutral-600 text-[10px] mb-1">Adeleke</p>
                  <p className="text-neutral-900 font-medium text-[10px]">₦226,980.00</p>
                </div>
              </div>
            </TextRevealOnScroll>

            {/* Product 2 */}
            <TextRevealOnScroll>
              <div className="group cursor-pointer">
                <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100 mb-3">
                  <img
                    src="https://res.cloudinary.com/dusynu0kv/image/upload/w_600,q_auto,f_auto/v1761655938/IMG_2376_mwz41c.jpg"
                    alt="Blaze Skirt Set"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <button className="px-4 py-1.5 bg-white text-neutral-900 text-[9px] tracking-widest uppercase font-medium">
                      Quick View
                    </button>
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="font-serif text-xs font-normal text-neutral-900 mb-0.5">Blaze Skirt Set</h3>
                  <p className="text-neutral-600 text-[10px] mb-1">Premium Collection</p>
                  <p className="text-neutral-900 font-medium text-[10px]">₦499,300.00</p>
                </div>
              </div>
            </TextRevealOnScroll>

            {/* Product 3 */}
            <TextRevealOnScroll>
              <div className="group cursor-pointer">
                <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100 mb-3">
                  <img
                    src="https://res.cloudinary.com/dusynu0kv/image/upload/w_600,q_auto,f_auto/v1761657166/Gemini_Generated_Image_ywipcvywipcvywip_dcejpx.png"
                    alt="Arewa Dress"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <button className="px-4 py-1.5 bg-white text-neutral-900 text-[9px] tracking-widest uppercase font-medium">
                      Quick View
                    </button>
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="font-serif text-xs font-normal text-neutral-900 mb-0.5">Arewa Dress</h3>
                  <p className="text-neutral-600 text-[10px] mb-1">Floral Beauty</p>
                  <p className="text-neutral-900 font-medium text-[10px]">₦249,990.00</p>
                </div>
              </div>
            </TextRevealOnScroll>

            {/* Product 4 */}
            <TextRevealOnScroll>
              <div className="group cursor-pointer">
                <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100 mb-3">
                  <img
                    src="https://res.cloudinary.com/dusynu0kv/image/upload/w_600,q_auto,f_auto/v1761657174/Gemini_Generated_Image_y81htcy81htcy81h_i75fio.png"
                    alt="Makeup Dress"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <button className="px-4 py-1.5 bg-white text-neutral-900 text-[9px] tracking-widest uppercase font-medium">
                      Quick View
                    </button>
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="font-serif text-xs font-normal text-neutral-900 mb-0.5">Makeup Dress</h3>
                  <p className="text-neutral-600 text-[10px] mb-1">Statement Pink</p>
                  <p className="text-neutral-900 font-medium text-[10px]">₦123,493.50</p>
                </div>
              </div>
            </TextRevealOnScroll>
          </div>

          {/* Tiny View All Button */}
          <div className="text-center mt-8">
            <button
              onClick={() => navigate('/shop')}
              className="px-8 py-2 bg-neutral-900 text-white hover:bg-neutral-800 transition-all duration-300 font-medium text-[10px] tracking-widest uppercase"
            >
              View All
            </button>
          </div>
        </div>
      </section>

      {/* Brand Story Section - Minimalist */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <TextRevealOnScroll>
            <p className="text-[10px] tracking-[0.3em] text-neutral-500 mb-3 text-center uppercase font-light">Our Story</p>
          </TextRevealOnScroll>

          <SplitTextReveal
            text="Fashion is more than clothing. It's confidence, expression, and empowerment."
            className="font-serif text-lg md:text-xl lg:text-2xl font-light text-neutral-900 text-center mb-8 leading-relaxed"
          />

          <TextRevealOnScroll>
            <p className="text-sm text-neutral-600 text-center max-w-3xl mx-auto leading-relaxed">
              At Inaara Woman, we believe every woman deserves to feel extraordinary. Our carefully curated collections
              blend timeless elegance with contemporary style, creating pieces that transition seamlessly from day to night.
            </p>
          </TextRevealOnScroll>
        </div>
      </section>

      {/* Featured Products Grid - Minimalist */}
      <section className="py-16 px-4 bg-neutral-50">
        <div className="max-w-7xl mx-auto">
          <TextRevealOnScroll className="text-center mb-12">
            <p className="text-[10px] tracking-[0.3em] text-neutral-500 mb-3 uppercase font-light">Featured Collection</p>
            <h2 className="font-serif text-xl md:text-2xl font-light text-neutral-900">
              This Season's Must-Haves
            </h2>
          </TextRevealOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TextRevealOnScroll>
              <div className="relative aspect-[3/4] overflow-hidden group cursor-pointer">
                <ParallaxImage
                  src="https://res.cloudinary.com/dusynu0kv/image/upload/v1761654830/Gemini_Generated_Image_c0aiz1c0aiz1c0ai_yit4rx.png"
                  speed={0.2}
                  className="w-full h-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute bottom-6 left-6 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <h3 className="text-xl font-serif font-light mb-1">Elegant Dresses</h3>
                  <p className="text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    From casual to formal
                  </p>
                </div>
              </div>
            </TextRevealOnScroll>

            <TextRevealOnScroll>
              <div className="relative aspect-[3/4] overflow-hidden group cursor-pointer">
                <ParallaxImage
                  src="https://res.cloudinary.com/dusynu0kv/image/upload/v1761654824/Gemini_Generated_Image_ehszg6ehszg6ehsz_qkrfwy.png"
                  speed={0.2}
                  className="w-full h-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute bottom-6 left-6 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <h3 className="text-xl font-serif font-light mb-1">Statement Pieces</h3>
                  <p className="text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    Bold and beautiful
                  </p>
                </div>
              </div>
            </TextRevealOnScroll>
          </div>
        </div>
      </section>

      {/* Benefits Section - Minimalist */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <TextRevealOnScroll className="text-center mb-16">
            <p className="text-[10px] tracking-[0.3em] text-neutral-500 mb-3 uppercase font-light">Why Choose Us</p>
            <h2 className="font-serif text-xl md:text-2xl font-light text-neutral-900">
              The Inaara Experience
            </h2>
          </TextRevealOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <TextRevealOnScroll>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-neutral-900 rounded-full flex items-center justify-center">
                  <Award size={20} className="text-white" />
                </div>
                <h3 className="text-sm font-serif font-normal mb-2">Premium Quality</h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Every piece is carefully selected for exceptional quality, craftsmanship, and attention to detail.
                </p>
              </div>
            </TextRevealOnScroll>

            <TextRevealOnScroll>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-neutral-900 rounded-full flex items-center justify-center">
                  <Truck size={20} className="text-white" />
                </div>
                <h3 className="text-sm font-serif font-normal mb-2">Fast Delivery</h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Nationwide shipping with tracking. Your order arrives swiftly and securely at your doorstep.
                </p>
              </div>
            </TextRevealOnScroll>

            <TextRevealOnScroll>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-neutral-900 rounded-full flex items-center justify-center">
                  <Shield size={20} className="text-white" />
                </div>
                <h3 className="text-sm font-serif font-normal mb-2">Secure Shopping</h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Shop with confidence. Your payment information is protected with industry-leading security.
                </p>
              </div>
            </TextRevealOnScroll>
          </div>
        </div>
      </section>

      {/* Large Image Showcase - Crafted for You - Minimalist */}
      <section className="relative h-screen">
        <div className="absolute inset-0">
          <img
            src="https://res.cloudinary.com/dusynu0kv/image/upload/v1761657297/IMG_4662_nwpdmy.jpg"
            alt="Crafted for You"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
          
          {/* Large INAARA watermark */}
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <h1 className="font-serif text-[20vw] font-bold text-white tracking-wider">
              INAARA
            </h1>
          </div>
        </div>

        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h2 className="font-serif text-2xl md:text-3xl font-light mb-4">
              Crafted for You
            </h2>
            <p className="text-xs md:text-sm mb-6 max-w-2xl mx-auto">
              Each design tells a story of elegance and sophistication
            </p>
            <button
              onClick={() => navigate('/shop')}
              className="px-6 py-2 text-[10px] tracking-widest uppercase bg-white text-neutral-900 hover:bg-neutral-100 transition-all duration-300 font-medium"
            >
              Explore Collection
            </button>
          </div>
        </div>
      </section>

      {/* Collection Highlights - Minimalist */}
      <section className="py-24 px-4 bg-neutral-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24">
            <TextRevealOnScroll>
              <div className="relative aspect-[4/5]">
                <ParallaxImage
                  src="https://res.cloudinary.com/dusynu0kv/image/upload/v1761654824/Gemini_Generated_Image_ehszg6ehszg6ehsz_qkrfwy.png"
                  speed={0.2}
                  className="w-full h-full rounded-lg"
                />
              </div>
            </TextRevealOnScroll>

            <TextRevealOnScroll>
              <div>
                <p className="text-[10px] tracking-[0.3em] text-neutral-500 mb-3 uppercase font-light">Versatile Style</p>
                <h2 className="font-serif text-xl md:text-2xl font-light text-neutral-900 mb-4">
                  Day to Night Elegance
                </h2>
                <p className="text-sm text-neutral-600 mb-6 leading-relaxed">
                  Our collection seamlessly transitions from professional meetings to evening gatherings.
                  Versatile pieces designed to adapt to your dynamic lifestyle.
                </p>
                <button
                  onClick={() => navigate('/collections')}
                  className="px-6 py-2 bg-neutral-900 hover:bg-neutral-800 text-white transition-all duration-300 font-medium text-[10px] tracking-widest uppercase"
                >
                  View Collections
                </button>
              </div>
            </TextRevealOnScroll>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <TextRevealOnScroll className="order-2 lg:order-1">
              <div>
                <p className="text-[10px] tracking-[0.3em] text-neutral-500 mb-3 uppercase font-light">Sustainable Fashion</p>
                <h2 className="font-serif text-xl md:text-2xl font-light text-neutral-900 mb-4">
                  Conscious Choices
                </h2>
                <p className="text-sm text-neutral-600 mb-6 leading-relaxed">
                  We're committed to sustainable practices and ethical sourcing. Fashion that looks good
                  and does good for our planet.
                </p>
                <button
                  onClick={() => navigate('/about')}
                  className="px-6 py-2 bg-neutral-900 hover:bg-neutral-800 text-white transition-all duration-300 font-medium text-[10px] tracking-widest uppercase"
                >
                  Learn More
                </button>
              </div>
            </TextRevealOnScroll>

            <TextRevealOnScroll className="order-1 lg:order-2">
              <div className="relative aspect-[4/5]">
                <ParallaxImage
                  src="/Gemini_Generated_Image_vre75gvre75gvre7.png"
                  speed={0.2}
                  className="w-full h-full rounded-lg"
                />
              </div>
            </TextRevealOnScroll>
          </div>
        </div>
      </section>

      {/* Featured Products - Scrollable Section - Minimalist */}
      <section className="py-24 px-4 bg-neutral-50 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <TextRevealOnScroll className="text-center mb-12">
            <p className="text-[10px] tracking-[0.3em] text-neutral-500 mb-3 uppercase font-light">Discover</p>
            <h2 className="font-serif text-xl md:text-2xl font-light text-neutral-900">
              New Arrivals
            </h2>
          </TextRevealOnScroll>

          <div className="relative">
            <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide snap-x snap-mandatory" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              
              {/* Product 1 */}
              <div className="flex-none w-64 group cursor-pointer snap-start">
                <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100 mb-3">
                  <img
                    src="https://res.cloudinary.com/dusynu0kv/image/upload/v1761657117/Gemini_Generated_Image_ghl6prghl6prghl6_qvqz21.png"
                    alt="Product 1"
                    className="w-full h-full object-cover transition-opacity duration-500 group-hover:opacity-0"
                  />
                  <img
                    src="https://res.cloudinary.com/dusynu0kv/image/upload/v1761657117/Gemini_Generated_Image_ghl6prghl6prghl6_qvqz21.png"
                    alt="Product 1 Hover"
                    className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <button className="px-4 py-1.5 bg-white text-neutral-900 text-[9px] tracking-widest uppercase font-medium">
                      Quick View
                    </button>
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="font-serif text-xs font-normal text-neutral-900 mb-0.5">Zola Earring</h3>
                  <p className="text-neutral-600 text-[10px] mb-1">Classic Statement Piece</p>
                  <p className="text-neutral-900 font-medium text-[10px]">₦277,200.00</p>
                </div>
              </div>

              {/* Product 2 */}
              <div className="flex-none w-64 group cursor-pointer snap-start">
                <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100 mb-3">
                  <img
                    src="https://res.cloudinary.com/dusynu0kv/image/upload/v1761657116/Gemini_Generated_Image_13mwoj13mwoj13mw_3_nq4a88.png"
                    alt="Product 2"
                    className="w-full h-full object-cover transition-opacity duration-500 group-hover:opacity-0"
                  />
                  <img
                    src="https://res.cloudinary.com/dusynu0kv/image/upload/v1761657116/Gemini_Generated_Image_13mwoj13mwoj13mw_3_nq4a88.png"
                    alt="Product 2 Hover"
                    className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <button className="px-4 py-1.5 bg-white text-neutral-900 text-[9px] tracking-widest uppercase font-medium">
                      Quick View
                    </button>
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="font-serif text-xs font-normal text-neutral-900 mb-0.5">Salle Bodysuit</h3>
                  <p className="text-neutral-600 text-[10px] mb-1">Camel Elegance</p>
                  <p className="text-neutral-900 font-medium text-[10px]">₦215,800.00</p>
                </div>
              </div>

              {/* Product 3 */}
              <div className="flex-none w-64 group cursor-pointer snap-start">
                <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100 mb-3">
                  <img
                    src="https://res.cloudinary.com/dusynu0kv/image/upload/v1761657152/Gemini_Generated_Image_ezhk6aezhk6aezhk_vsvjez.png"
                    alt="Product 3"
                    className="w-full h-full object-cover transition-opacity duration-500 group-hover:opacity-0"
                  />
                  <img
                    src="https://res.cloudinary.com/dusynu0kv/image/upload/v1761657152/Gemini_Generated_Image_ezhk6aezhk6aezhk_vsvjez.png"
                    alt="Product 3 Hover"
                    className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <button className="px-4 py-1.5 bg-white text-neutral-900 text-[9px] tracking-widest uppercase font-medium">
                      Quick View
                    </button>
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="font-serif text-xs font-normal text-neutral-900 mb-0.5">Ovu Knit Cape</h3>
                  <p className="text-neutral-600 text-[10px] mb-1">Sophisticated Layering</p>
                  <p className="text-neutral-900 font-medium text-[10px]">₦585,100.00</p>
                </div>
              </div>

              {/* Product 4 */}
              <div className="flex-none w-64 group cursor-pointer snap-start">
                <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100 mb-3">
                  <img
                    src="https://res.cloudinary.com/dusynu0kv/image/upload/v1761657174/Gemini_Generated_Image_y81htcy81htcy81h_i75fio.png"
                    alt="Product 4"
                    className="w-full h-full object-cover transition-opacity duration-500 group-hover:opacity-0"
                  />
                  <img
                    src="https://res.cloudinary.com/dusynu0kv/image/upload/v1761657174/Gemini_Generated_Image_y81htcy81htcy81h_i75fio.png"
                    alt="Product 4 Hover"
                    className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <button className="px-4 py-1.5 bg-white text-neutral-900 text-[9px] tracking-widest uppercase font-medium">
                      Quick View
                    </button>
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="font-serif text-xs font-normal text-neutral-900 mb-0.5">Ovu Knit Pants</h3>
                  <p className="text-neutral-600 text-[10px] mb-1">Coffee Comfort</p>
                  <p className="text-neutral-900 font-medium text-[10px]">₦369,500.00</p>
                </div>
              </div>

              {/* Product 5 */}
              <div className="flex-none w-64 group cursor-pointer snap-start">
                <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100 mb-3">
                  <img
                    src="https://res.cloudinary.com/dusynu0kv/image/upload/v1761657292/Gemini_Generated_Image_jc5sdejc5sdejc5s_muhame.png"
                    alt="Product 5"
                    className="w-full h-full object-cover transition-opacity duration-500 group-hover:opacity-0"
                  />
                  <img
                    src="https://res.cloudinary.com/dusynu0kv/image/upload/v1761657292/Gemini_Generated_Image_jc5sdejc5sdejc5s_muhame.png"
                    alt="Product 5 Hover"
                    className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <button className="px-4 py-1.5 bg-white text-neutral-900 text-[9px] tracking-widest uppercase font-medium">
                      Quick View
                    </button>
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="font-serif text-xs font-normal text-neutral-900 mb-0.5">Coral Dress</h3>
                  <p className="text-neutral-600 text-[10px] mb-1">Statement Evening Wear</p>
                  <p className="text-neutral-900 font-medium text-[10px]">₦458,980.00</p>
                </div>
              </div>

              {/* Product 6 */}
              <div className="flex-none w-64 group cursor-pointer snap-start">
                <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100 mb-3">
                  <img
                    src="https://res.cloudinary.com/dusynu0kv/image/upload/v1761657313/Gemini_Generated_Image_3g5mvf3g5mvf3g5m_ukrg1d.png"
                    alt="Product 6"
                    className="w-full h-full object-cover transition-opacity duration-500 group-hover:opacity-0"
                  />
                  <img
                    src="https://res.cloudinary.com/dusynu0kv/image/upload/v1761657313/Gemini_Generated_Image_3g5mvf3g5mvf3g5m_ukrg1d.png"
                    alt="Product 6 Hover"
                    className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <button className="px-4 py-1.5 bg-white text-neutral-900 text-[9px] tracking-widest uppercase font-medium">
                      Quick View
                    </button>
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="font-serif text-xs font-normal text-neutral-900 mb-0.5">Floral Maxi Dress</h3>
                  <p className="text-neutral-600 text-[10px] mb-1">Garden Party Perfect</p>
                  <p className="text-neutral-900 font-medium text-[10px]">₦524,390.00</p>
                </div>
              </div>

            </div>

            {/* Scroll Indicator */}
            <div className="text-center mt-6">
              <p className="text-[9px] text-neutral-500 tracking-wider">← Scroll to explore more →</p>
            </div>
          </div>

          {/* View All Button */}
          <div className="text-center mt-8">
            <button
              onClick={() => navigate('/shop')}
              className="px-8 py-2 bg-neutral-900 text-white hover:bg-neutral-800 transition-all duration-300 font-medium text-[10px] tracking-widest uppercase"
            >
              View All
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials - Minimalist */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <TextRevealOnScroll className="text-center mb-16">
            <p className="text-[10px] tracking-[0.3em] text-neutral-500 mb-3 uppercase font-light">Testimonials</p>
            <h2 className="font-serif text-xl md:text-2xl font-light text-neutral-900">
              What Our Customers Say
            </h2>
          </TextRevealOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <TextRevealOnScroll key={i}>
                <div className="bg-neutral-50 p-6 rounded-lg">
                  <div className="flex gap-0.5 mb-3">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} size={14} className="fill-neutral-900 text-neutral-900" />
                    ))}
                  </div>
                  <p className="text-xs text-neutral-600 mb-4 leading-relaxed">
                    "Absolutely love my purchase! The quality is exceptional and the fit is perfect.
                    Inaara Woman has become my go-to for elegant fashion."
                  </p>
                  <p className="font-medium text-neutral-900 text-xs">Customer {i}</p>
                  <p className="text-[10px] text-neutral-500">Verified Purchase</p>
                </div>
              </TextRevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA - Minimalist */}
      <section className="relative py-32 px-4 text-white">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://res.cloudinary.com/dusynu0kv/image/upload/v1761735409/Untitled-1_3x_laltoc.jpg"
            alt="Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <TextRevealOnScroll>
            <h2 className="font-serif text-2xl md:text-3xl font-light mb-4">
              Ready to Elevate Your Wardrobe?
            </h2>
          </TextRevealOnScroll>

          <TextRevealOnScroll>
            <p className="text-sm md:text-base text-white/90 mb-8">
              Join thousands of women who trust Inaara Woman for their fashion needs.
            </p>
          </TextRevealOnScroll>

          <TextRevealOnScroll>
            <button
              onClick={() => navigate('/shop')}
              className="inline-flex items-center gap-2 px-6 py-2 text-[10px] tracking-widest uppercase bg-white text-neutral-900 hover:bg-neutral-100 transition-all duration-300 font-medium"
            >
              <ShoppingBag size={14} />
              Start Shopping
            </button>
          </TextRevealOnScroll>
        </div>
      </section>

      {/* Video Modal */}
      {showVideo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          onClick={() => setShowVideo(false)}
        >
          <div className="relative w-full max-w-4xl aspect-video bg-neutral-900 rounded-lg">
            <button
              onClick={() => setShowVideo(false)}
              className="absolute -top-10 right-0 text-white text-sm hover:text-neutral-300"
            >
              Close
            </button>
            <div className="w-full h-full flex items-center justify-center text-white">
              <p className="text-sm">Video placeholder - Add your brand story video here</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}