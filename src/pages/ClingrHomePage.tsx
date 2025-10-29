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

      {/* Hero Section - Updated */}
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
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Decorative Lines (like Clingr) */}
        <DecorativeLines />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="mb-8"
          >
            {/* Updated Hero Text - Smaller like ZEMA */}
            <p className="text-xs md:text-sm tracking-[0.3em] text-white/80 mb-6 uppercase">
              New Arrivals Just for You
            </p>
            <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-normal text-white mb-8 leading-tight tracking-wide">
              Exclusive Collections
              <br />
              <span className="block mt-2">Just for You</span>
            </h1>
          </motion.div>

          {/* Removed subtitle as requested */}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            {/* FIXED BUTTON 1 - Using standard button element with full styling */}
            <button
              onClick={() => navigate('/shop')}
              className="px-10 py-4 text-sm tracking-wider uppercase bg-white text-neutral-900 hover:bg-neutral-100 border-2 border-white transition-all duration-300 font-medium"
            >
              View Collection
            </button>
            
            {/* FIXED BUTTON 2 - Watch Story button */}
            <button
              onClick={() => setShowVideo(true)}
              className="flex items-center gap-3 px-10 py-4 text-sm tracking-wider uppercase border-2 border-white text-white hover:bg-white hover:text-neutral-900 transition-all duration-300 font-medium"
            >
              <Play size={20} />
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
              <ChevronDown size={32} className="text-white/60" />
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Brand Story Section */}
      <section className="py-32 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <TextRevealOnScroll>
            <p className="text-sm tracking-widest text-neutral-500 mb-4 text-center">OUR STORY</p>
          </TextRevealOnScroll>

          <SplitTextReveal
            text="Fashion is more than clothing. It's confidence, expression, and empowerment."
            className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold text-neutral-900 text-center mb-12 leading-tight"
          />

          <TextRevealOnScroll>
            <p className="text-xl text-neutral-600 text-center max-w-4xl mx-auto leading-relaxed">
              At Inaara Woman, we believe every woman deserves to feel extraordinary. Our carefully curated collections
              blend timeless elegance with contemporary style, creating pieces that transition seamlessly from day to night.
            </p>
          </TextRevealOnScroll>
        </div>
      </section>

      {/* Featured Products Grid */}
      <section className="py-20 px-4 bg-neutral-50">
        <div className="max-w-7xl mx-auto">
          <TextRevealOnScroll className="text-center mb-16">
            <p className="text-sm tracking-widest text-neutral-500 mb-4">FEATURED COLLECTION</p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-neutral-900">
              This Season's Must-Haves
            </h2>
          </TextRevealOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <TextRevealOnScroll>
              <div className="relative aspect-[3/4] overflow-hidden group cursor-pointer">
                <ParallaxImage
                  src="https://res.cloudinary.com/dusynu0kv/image/upload/v1761654830/Gemini_Generated_Image_c0aiz1c0aiz1c0ai_yit4rx.png"
                  speed={0.2}
                  className="w-full h-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute bottom-8 left-8 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <h3 className="text-3xl font-serif font-bold mb-2">Elegant Dresses</h3>
                  <p className="text-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500">
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
                <div className="absolute bottom-8 left-8 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <h3 className="text-3xl font-serif font-bold mb-2">Statement Pieces</h3>
                  <p className="text-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    Bold and beautiful
                  </p>
                </div>
              </div>
            </TextRevealOnScroll>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-32 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <TextRevealOnScroll className="text-center mb-20">
            <p className="text-sm tracking-widest text-neutral-500 mb-4">WHY CHOOSE US</p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-neutral-900">
              The Inaara Experience
            </h2>
          </TextRevealOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            <TextRevealOnScroll>
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-neutral-900 rounded-full flex items-center justify-center">
                  <Award size={40} className="text-white" />
                </div>
                <h3 className="text-2xl font-serif font-bold mb-4">Premium Quality</h3>
                <p className="text-neutral-600 leading-relaxed">
                  Every piece is carefully selected for exceptional quality, craftsmanship, and attention to detail.
                </p>
              </div>
            </TextRevealOnScroll>

            <TextRevealOnScroll>
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-neutral-900 rounded-full flex items-center justify-center">
                  <Truck size={40} className="text-white" />
                </div>
                <h3 className="text-2xl font-serif font-bold mb-4">Fast Delivery</h3>
                <p className="text-neutral-600 leading-relaxed">
                  Nationwide shipping with tracking. Your order arrives swiftly and securely at your doorstep.
                </p>
              </div>
            </TextRevealOnScroll>

            <TextRevealOnScroll>
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-neutral-900 rounded-full flex items-center justify-center">
                  <Shield size={40} className="text-white" />
                </div>
                <h3 className="text-2xl font-serif font-bold mb-4">Secure Shopping</h3>
                <p className="text-neutral-600 leading-relaxed">
                  Shop with confidence. Your payment information is protected with industry-leading security.
                </p>
              </div>
            </TextRevealOnScroll>
          </div>
        </div>
      </section>

      {/* Large Image Showcase */}
      <section className="relative h-screen">
        <ParallaxImage
          src="https://res.cloudinary.com/dusynu0kv/image/upload/v1761657297/IMG_4662_nwpdmy.jpg"
          speed={0.5}
          className="w-full h-full"
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <TextRevealOnScroll>
            <div className="text-center text-white px-4">
              <h2 className="font-serif text-3xl md:text-4xl font-bold mb-6">
                Crafted for You
              </h2>
              <p className="text-2xl mb-8 max-w-2xl mx-auto">
                Each design tells a story of elegance and sophistication
              </p>
              {/* FIXED BUTTON 3 */}
              <button
                onClick={() => navigate('/shop')}
                className="px-12 py-6 text-lg bg-white text-neutral-900 hover:bg-neutral-100 transition-all duration-300 font-medium"
              >
                Explore Collection
              </button>
            </div>
          </TextRevealOnScroll>
        </div>
      </section>

      {/* Collection Highlights */}
      <section className="py-32 px-4 bg-neutral-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-32">
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
                <p className="text-sm tracking-widest text-neutral-500 mb-4">VERSATILE STYLE</p>
                <h2 className="font-serif text-3xl font-bold text-neutral-900 mb-6">
                  Day to Night Elegance
                </h2>
                <p className="text-xl text-neutral-600 mb-8 leading-relaxed">
                  Our collection seamlessly transitions from professional meetings to evening gatherings.
                  Versatile pieces designed to adapt to your dynamic lifestyle.
                </p>
                {/* FIXED BUTTON 4 */}
                <button
                  onClick={() => navigate('/collections')}
                  className="px-8 py-3 bg-neutral-900 hover:bg-neutral-800 text-white transition-all duration-300 font-medium"
                >
                  View Collections
                </button>
              </div>
            </TextRevealOnScroll>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <TextRevealOnScroll className="order-2 lg:order-1">
              <div>
                <p className="text-sm tracking-widest text-neutral-500 mb-4">SUSTAINABLE FASHION</p>
                <h2 className="font-serif text-3xl font-bold text-neutral-900 mb-6">
                  Conscious Choices
                </h2>
                <p className="text-xl text-neutral-600 mb-8 leading-relaxed">
                  We're committed to sustainable practices and ethical sourcing. Fashion that looks good
                  and does good for our planet.
                </p>
                {/* FIXED BUTTON 5 */}
                <button
                  onClick={() => navigate('/about')}
                  className="px-8 py-3 bg-neutral-900 hover:bg-neutral-800 text-white transition-all duration-300 font-medium"
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

      {/* Testimonials */}
      <section className="py-32 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <TextRevealOnScroll className="text-center mb-20">
            <p className="text-sm tracking-widest text-neutral-500 mb-4">TESTIMONIALS</p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-neutral-900">
              What Our Customers Say
            </h2>
          </TextRevealOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <TextRevealOnScroll key={i}>
                <div className="bg-neutral-50 p-8 rounded-lg">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} size={20} className="fill-neutral-900 text-neutral-900" />
                    ))}
                  </div>
                  <p className="text-neutral-600 mb-6 leading-relaxed">
                    "Absolutely love my purchase! The quality is exceptional and the fit is perfect.
                    Inaara Woman has become my go-to for elegant fashion."
                  </p>
                  <p className="font-semibold text-neutral-900">Customer {i}</p>
                  <p className="text-sm text-neutral-500">Verified Purchase</p>
                </div>
              </TextRevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-40 px-4 bg-neutral-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <TextRevealOnScroll>
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-8">
              Ready to Elevate Your Wardrobe?
            </h2>
          </TextRevealOnScroll>

          <TextRevealOnScroll>
            <p className="text-xl md:text-2xl text-neutral-300 mb-12">
              Join thousands of women who trust Inaara Woman for their fashion needs.
            </p>
          </TextRevealOnScroll>

          <TextRevealOnScroll>
            {/* FIXED BUTTON 6 */}
            <button
              onClick={() => navigate('/shop')}
              className="inline-flex items-center gap-3 px-16 py-8 text-lg bg-white text-neutral-900 hover:bg-neutral-100 transition-all duration-300 font-medium"
            >
              <ShoppingBag size={24} />
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
              className="absolute -top-12 right-0 text-white text-lg hover:text-neutral-300"
            >
              Close
            </button>
            <div className="w-full h-full flex items-center justify-center text-white">
              <p className="text-xl">Video placeholder - Add your brand story video here</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}