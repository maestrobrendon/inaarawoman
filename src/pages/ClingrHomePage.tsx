import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { Play, ChevronDown, Star, ShoppingBag, Truck, Shield, Award } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useCurrency } from '../context/CurrencyContext';

// Keep all the animation components from the original
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

const DecorativeLines = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute left-[15%] top-0 bottom-0 w-px bg-white/10" />
      <div className="absolute left-[30%] top-0 bottom-0 w-px bg-white/10" />
      <div className="absolute left-[50%] top-0 bottom-0 w-px bg-white/10" />
      <div className="absolute left-[70%] top-0 bottom-0 w-px bg-white/10" />
      <div className="absolute left-[85%] top-0 bottom-0 w-px bg-white/10" />
      
      <div className="absolute top-[20%] left-0 right-0 h-px bg-white/10" />
      <div className="absolute top-[40%] left-0 right-0 h-px bg-white/10" />
      <div className="absolute top-[60%] left-0 right-0 h-px bg-white/10" />
      <div className="absolute top-[80%] left-0 right-0 h-px bg-white/10" />
    </div>
  );
};

interface HomepageContent {
  hero: {
    image: string;
    overlay_opacity: number;
    small_text: string;
    main_title: string;
    subtitle: string;
    button1_text: string;
    button1_link: string;
    button2_text: string;
    show_video_button: boolean;
  };
  top_banner: {
    text: string;
    background_color: string;
    text_color: string;
    is_visible: boolean;
  };
  brand_story: {
    small_text: string;
    main_text: string;
    description: string;
  };
  crafted_section: {
    background_image: string;
    title: string;
    subtitle: string;
    button_text: string;
    button_link: string;
    overlay_opacity: number;
  };
  final_cta: {
    background_image: string;
    title: string;
    subtitle: string;
    button_text: string;
    button_link: string;
    overlay_opacity: number;
  };
  benefits: {
    title: string;
    small_text: string;
    benefits: Array<{
      icon: string;
      title: string;
      description: string;
    }>;
  };
}

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  compare_at_price?: number;
  main_image?: string;
  featured_image?: string;
  category?: string;
  description?: string;
  homepage_position: number;
}

export default function ClingrHomePage() {
  const navigate = useNavigate();
  const { currency, convertPrice } = useCurrency();
  const [showVideo, setShowVideo] = useState(false);
  const [content, setContent] = useState<HomepageContent | null>(null);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  
  const heroRef = useRef(null);
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 300], [1, 0.95]);

  useEffect(() => {
    window.scrollTo(0, 0);
    loadContent();
    loadProducts();
  }, []);

  const loadContent = async () => {
    try {
      const { data, error } = await supabase
        .from('homepage_content')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;

      // Convert array to object keyed by section_key
      const contentObj: any = {};
      data?.forEach(item => {
        contentObj[item.section_key] = item.content;
      });
      
      setContent(contentObj);
    } catch (error) {
      console.error('Error loading content:', error);
      // Set default content if loading fails
      setDefaultContent();
    }
  };

  const loadProducts = async () => {
    try {
      // Load best sellers
      const { data: bestSellersData, error: bestError } = await supabase
        .from('products')
        .select('id, name, slug, price, compare_at_price, main_image, featured_image, category, description, homepage_position')
        .eq('show_on_homepage', true)
        .eq('homepage_section', 'best_sellers')
        .eq('status', 'active')
        .order('homepage_position')
        .limit(4);

      if (!bestError && bestSellersData) {
        setBestSellers(bestSellersData);
      }

      // Load new arrivals
      const { data: newArrivalsData, error: newError } = await supabase
        .from('products')
        .select('id, name, slug, price, compare_at_price, main_image, featured_image, category, description, homepage_position')
        .eq('show_on_homepage', true)
        .eq('homepage_section', 'new_arrivals')
        .eq('status', 'active')
        .order('homepage_position')
        .limit(6);

      if (!newError && newArrivalsData) {
        setNewArrivals(newArrivalsData);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const setDefaultContent = () => {
    // Set default content matching the original design
    setContent({
      hero: {
        image: "https://res.cloudinary.com/dusynu0kv/image/upload/v1761658028/hero_jlpiil.jpg",
        overlay_opacity: 40,
        small_text: "New Arrivals Just for You",
        main_title: "",
        subtitle: "",
        button1_text: "View Collection",
        button1_link: "/shop",
        button2_text: "Watch Story",
        show_video_button: true
      },
      top_banner: {
        text: "Free Shipping On All Orders - Don't Miss Out!",
        background_color: "#000000",
        text_color: "#FFFFFF",
        is_visible: true
      },
      brand_story: {
        small_text: "Our Story",
        main_text: "Fashion is more than clothing. It's confidence, expression, and empowerment.",
        description: "At Inaara Woman, we believe every woman deserves to feel extraordinary. Our carefully curated collections blend timeless elegance with contemporary style, creating pieces that transition seamlessly from day to night."
      },
      crafted_section: {
        background_image: "https://res.cloudinary.com/dusynu0kv/image/upload/v1761657297/IMG_4662_nwpdmy.jpg",
        title: "Crafted for You",
        subtitle: "Each design tells a story of elegance and sophistication",
        button_text: "Explore Collection",
        button_link: "/shop",
        overlay_opacity: 40
      },
      final_cta: {
        background_image: "https://res.cloudinary.com/dusynu0kv/image/upload/v1761735409/Untitled-1_3x_laltoc.jpg",
        title: "Ready to Elevate Your Wardrobe?",
        subtitle: "Join thousands of women who trust Inaara Woman for their fashion needs.",
        button_text: "Start Shopping",
        button_link: "/shop",
        overlay_opacity: 50
      },
      benefits: {
        title: "The Inaara Experience",
        small_text: "Why Choose Us",
        benefits: [
          {
            icon: "Award",
            title: "Premium Quality",
            description: "Every piece is carefully selected for exceptional quality, craftsmanship, and attention to detail."
          },
          {
            icon: "Truck",
            title: "Fast Delivery",
            description: "Nationwide shipping with tracking. Your order arrives swiftly and securely at your doorstep."
          },
          {
            icon: "Shield",
            title: "Secure Shopping",
            description: "Shop with confidence. Your payment information is protected with industry-leading security."
          }
        ]
      }
    });
  };

  const getIconComponent = (iconName: string) => {
    switch(iconName) {
      case 'Award': return <Award size={20} className="text-white" />;
      case 'Truck': return <Truck size={20} className="text-white" />;
      case 'Shield': return <Shield size={20} className="text-white" />;
      default: return <Award size={20} className="text-white" />;
    }
  };

  if (!content) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-neutral-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <ScrollProgress />

      {/* Top Banner - Dynamic from CMS */}
      {content.top_banner.is_visible && (
        <div 
          className="text-center py-2 text-xs"
          style={{
            backgroundColor: content.top_banner.background_color,
            color: content.top_banner.text_color
          }}
        >
          {content.top_banner.text}
        </div>
      )}

      {/* Hero Section - Dynamic from CMS */}
      <motion.section
        ref={heroRef}
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
      >
        <div className="absolute inset-0 z-0">
          <img
            src={content.hero.image}
            alt="Hero"
            className="w-full h-full object-cover"
          />
          <div 
            className="absolute inset-0" 
            style={{ backgroundColor: `rgba(0, 0, 0, ${content.hero.overlay_opacity / 100})` }}
          />
        </div>

        <DecorativeLines />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="mb-6"
          >
            <p className="text-[10px] md:text-xs tracking-[0.4em] text-white/70 mb-4 uppercase font-light">
              {content.hero.small_text}
            </p>
            {content.hero.main_title && (
              <h1 className="font-serif text-3xl md:text-5xl font-light text-white mb-4">
                {content.hero.main_title}
              </h1>
            )}
            {content.hero.subtitle && (
              <p className="text-sm md:text-base text-white/80">
                {content.hero.subtitle}
              </p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-3 justify-center items-center"
          >
            <button
              onClick={() => navigate(content.hero.button1_link)}
              className="px-6 py-2 text-[10px] tracking-widest uppercase bg-white text-neutral-900 hover:bg-neutral-100 border border-white transition-all duration-300 font-medium"
            >
              {content.hero.button1_text}
            </button>
            
            {content.hero.show_video_button && (
              <button
                onClick={() => setShowVideo(true)}
                className="flex items-center gap-2 px-6 py-2 text-[10px] tracking-widest uppercase border border-white text-white hover:bg-white hover:text-neutral-900 transition-all duration-300 font-medium"
              >
                <Play size={12} />
                {content.hero.button2_text}
              </button>
            )}
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

      {/* Best Sellers Section - Dynamic from Database */}
      {bestSellers.length > 0 && (
        <section className="py-16 px-4 bg-neutral-50">
          <div className="max-w-7xl mx-auto">
            <TextRevealOnScroll className="text-center mb-12">
              <p className="text-[10px] tracking-[0.3em] text-neutral-500 mb-3 uppercase font-light">Best Sellers</p>
              <h2 className="font-serif text-xl md:text-2xl font-light text-neutral-900">
                Customer Favorites
              </h2>
            </TextRevealOnScroll>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {bestSellers.map((product) => (
                <TextRevealOnScroll key={product.id}>
                  <div 
                    className="group cursor-pointer"
                    onClick={() => navigate(`/product/${product.slug}`)}
                  >
                    <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100 mb-3">
                      <img
                        src={product.main_image || product.featured_image || '/placeholder.jpg'}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <button className="px-4 py-1.5 bg-white text-neutral-900 text-[9px] tracking-widest uppercase font-medium">
                          Quick View
                        </button>
                      </div>
                    </div>
                    <div className="text-center">
                      <h3 className="font-serif text-xs font-normal text-neutral-900 mb-0.5">{product.name}</h3>
                      <p className="text-neutral-600 text-[10px] mb-1">{product.category || 'Premium Collection'}</p>
                      <p className="text-neutral-900 font-medium text-[10px]">
                        {currency.symbol}{convertPrice(product.price).toLocaleString()}
                        {product.compare_at_price && (
                          <span className="text-neutral-500 line-through ml-2">
                            {currency.symbol}{convertPrice(product.compare_at_price).toLocaleString()}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </TextRevealOnScroll>
              ))}
            </div>

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
      )}

      {/* Brand Story Section - Dynamic from CMS */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <TextRevealOnScroll>
            <p className="text-[10px] tracking-[0.3em] text-neutral-500 mb-3 text-center uppercase font-light">
              {content.brand_story.small_text}
            </p>
          </TextRevealOnScroll>

          <SplitTextReveal
            text={content.brand_story.main_text}
            className="font-serif text-lg md:text-xl lg:text-2xl font-light text-neutral-900 text-center mb-8 leading-relaxed"
          />

          <TextRevealOnScroll>
            <p className="text-sm text-neutral-600 text-center max-w-3xl mx-auto leading-relaxed">
              {content.brand_story.description}
            </p>
          </TextRevealOnScroll>
        </div>
      </section>

      {/* Featured Products Grid - Keep static for now */}
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
                  AMATA SS25
                  </p>
                </div>
              </div>
            </TextRevealOnScroll>

            <TextRevealOnScroll>
              <div className="relative aspect-[3/4] overflow-hidden group cursor-pointer">
                <ParallaxImage
                  src="https://res.cloudinary.com/dusynu0kv/image/upload/v1761654824/Gemini_Generated_Image_mtsv62mtsv62mtsv_yynrua.png"
                  speed={0.2}
                  className="w-full h-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute bottom-6 left-6 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <h3 className="text-xl font-serif font-light mb-1">Statement Pieces</h3>
                  <p className="text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  UZURI SS25
                  </p>
                </div>
              </div>
            </TextRevealOnScroll>
          </div>
        </div>
      </section>

      {/* Benefits Section - Dynamic from CMS */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <TextRevealOnScroll className="text-center mb-16">
            <p className="text-[10px] tracking-[0.3em] text-neutral-500 mb-3 uppercase font-light">
              {content.benefits.small_text}
            </p>
            <h2 className="font-serif text-xl md:text-2xl font-light text-neutral-900">
              {content.benefits.title}
            </h2>
          </TextRevealOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {content.benefits.benefits.map((benefit, index) => (
              <TextRevealOnScroll key={index}>
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-4 bg-neutral-900 rounded-full flex items-center justify-center">
                    {getIconComponent(benefit.icon)}
                  </div>
                  <h3 className="text-sm font-serif font-normal mb-2">{benefit.title}</h3>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </TextRevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Crafted for You Section - Dynamic from CMS */}
      <section className="relative h-screen">
        <div className="absolute inset-0">
          <img
            src={content.crafted_section.background_image}
            alt="Crafted for You"
            className="w-full h-full object-cover"
          />
          <div 
            className="absolute inset-0" 
            style={{ backgroundColor: `rgba(0, 0, 0, ${content.crafted_section.overlay_opacity / 100})` }}
          />
          
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <h1 className="font-serif text-[20vw] font-bold text-white tracking-wider">
              INAARA
            </h1>
          </div>
        </div>

        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h2 className="font-serif text-2xl md:text-3xl font-light mb-4">
              {content.crafted_section.title}
            </h2>
            <p className="text-xs md:text-sm mb-6 max-w-2xl mx-auto">
              {content.crafted_section.subtitle}
            </p>
            <button
              onClick={() => navigate(content.crafted_section.button_link)}
              className="px-6 py-2 text-[10px] tracking-widest uppercase bg-white text-neutral-900 hover:bg-neutral-100 transition-all duration-300 font-medium"
            >
              {content.crafted_section.button_text}
            </button>
          </div>
        </div>
      </section>

      {/* Collection Highlights - Keep static */}
      <section className="py-24 px-4 bg-neutral-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24">
            <TextRevealOnScroll>
              <div className="relative aspect-[4/5]">
                <ParallaxImage
                  src="https://res.cloudinary.com/dusynu0kv/image/upload/v1761734975/IMG_0011_kerlww.jpg"
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

      {/* New Arrivals - Dynamic from Database */}
      {newArrivals.length > 0 && (
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
                
                {newArrivals.map((product) => (
                  <div 
                    key={product.id} 
                    className="flex-none w-64 group cursor-pointer snap-start"
                    onClick={() => navigate(`/product/${product.slug}`)}
                  >
                    <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100 mb-3">
                      <img
                        src={product.main_image || product.featured_image || '/placeholder.jpg'}
                        alt={product.name}
                        className="w-full h-full object-cover transition-opacity duration-500"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <button className="px-4 py-1.5 bg-white text-neutral-900 text-[9px] tracking-widest uppercase font-medium">
                          Quick View
                        </button>
                      </div>
                    </div>
                    <div className="text-center">
                      <h3 className="font-serif text-xs font-normal text-neutral-900 mb-0.5">{product.name}</h3>
                      <p className="text-neutral-600 text-[10px] mb-1">{product.category || 'Classic Statement Piece'}</p>
                      <p className="text-neutral-900 font-medium text-[10px]">
                        {currency.symbol}{convertPrice(product.price).toLocaleString()}
                        {product.compare_at_price && (
                          <span className="text-neutral-500 line-through ml-2">
                            {currency.symbol}{convertPrice(product.compare_at_price).toLocaleString()}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                ))}

              </div>

              <div className="text-center mt-6">
                <p className="text-[9px] text-neutral-500 tracking-wider">← Scroll to explore more →</p>
              </div>
            </div>

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
      )}

      {/* Testimonials - Keep static */}
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

      {/* Final CTA - Dynamic from CMS */}
      <section className="relative py-32 px-4 text-white">
        <div className="absolute inset-0">
          <img
            src={content.final_cta.background_image}
            alt="Background"
            className="w-full h-full object-cover"
          />
          <div 
            className="absolute inset-0" 
            style={{ backgroundColor: `rgba(0, 0, 0, ${content.final_cta.overlay_opacity / 100})` }}
          />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <TextRevealOnScroll>
            <h2 className="font-serif text-2xl md:text-3xl font-light mb-4">
              {content.final_cta.title}
            </h2>
          </TextRevealOnScroll>

          <TextRevealOnScroll>
            <p className="text-sm md:text-base text-white/90 mb-8">
              {content.final_cta.subtitle}
            </p>
          </TextRevealOnScroll>

          <TextRevealOnScroll>
            <button
              onClick={() => navigate(content.final_cta.button_link)}
              className="inline-flex items-center gap-2 px-6 py-2 text-[10px] tracking-widest uppercase bg-white text-neutral-900 hover:bg-neutral-100 transition-all duration-300 font-medium"
            >
              <ShoppingBag size={14} />
              {content.final_cta.button_text}
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