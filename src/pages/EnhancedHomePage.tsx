import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ProductWithImages } from '../types';
import Button from '../components/ui/Button';
import ProductCard from '../components/product/ProductCard';
import Input from '../components/ui/Input';
import HeroSection from '../components/home/HeroSection';
import { ScrollReveal, StaggerContainer, staggerItemVariants } from '../components/animations/ScrollReveal';
import { ImageReveal } from '../components/animations/ImageReveal';
import { CounterAnimation } from '../components/animations/CounterAnimation';
import { LetterReveal, TextReveal } from '../components/animations/TextReveal';
import { ParallaxImage } from '../components/animations/ParallaxSection';

interface HomePageProps {
  onNavigate: (page: string, data?: any) => void;
}

export default function EnhancedHomePage({ onNavigate }: HomePageProps) {
  const [featuredProducts, setFeaturedProducts] = useState<ProductWithImages[]>([]);
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);

  useEffect(() => {
    loadFeaturedData();
  }, []);

  const loadFeaturedData = async () => {
    const { data: products } = await supabase
      .from('products')
      .select(`
        *,
        images:product_images(*),
        collection:collections(*)
      `)
      .eq('is_bestseller', true)
      .limit(4);

    if (products) setFeaturedProducts(products as any);
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
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
    <div className="min-h-screen">
      <HeroSection onNavigate={onNavigate} />

      <section className="py-20 px-4 bg-stone-100">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal className="text-center mb-12">
            <p className="text-sm tracking-widest text-neutral-500 mb-2">EVERYONE'S LOVING</p>
            <LetterReveal
              text="BEST SELLERS"
              className="font-serif text-3xl md:text-5xl font-bold text-neutral-900"
            />
          </ScrollReveal>

          <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8" staggerDelay={0.1}>
            {[
              {
                image: '/Gemini_Generated_Image_vre75gvre75gvre7 copy copy.png',
                name: 'Zurié Dress - Long',
                price: '₦458,990.00 NGN',
              },
              {
                image: '/Gemini_Generated_Image_gmfzi0gmfzi0gmfz (1).png',
                name: 'Buzu Skirt Set',
                price: '₦499,900.00 NGN',
              },
              {
                image: '/Gemini_Generated_Image_nobba7nobba7nobb.png',
                name: 'Adioba Set',
                price: '₦359,990.00 NGN',
              },
              {
                image: '/Gemini_Generated_Image_28wvm128wvm128wv.png',
                name: 'Zyma Dress',
                price: '₦249,990.00 NGN',
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                variants={staggerItemVariants}
                className="group cursor-pointer"
              >
                <ImageReveal
                  src={item.image}
                  alt={item.name}
                  className="relative aspect-[3/4] overflow-hidden rounded-sm mb-3 bg-stone-200"
                />
                <h3 className="font-medium text-neutral-900 mb-1">{item.name}</h3>
                <p className="text-neutral-600 text-sm">{item.price}</p>
              </motion.div>
            ))}
          </StaggerContainer>

          <ScrollReveal className="text-center" delay={0.4}>
            <Button variant="primary" size="lg" onClick={() => onNavigate('shop')}>
              View all
            </Button>
          </ScrollReveal>
        </div>
      </section>

      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center mb-16">
            <ParallaxImage
              src="/freepik_edit (14).png"
              alt="Woman in elegant white dress"
              speed={-0.3}
              className="order-2 lg:order-1 rounded-sm aspect-[3/4]"
            />
            <ScrollReveal direction="left" className="order-1 lg:order-2 flex flex-col justify-center">
              <TextReveal
                text="Find something new in every Inaara collection"
                className="font-serif text-4xl md:text-5xl font-bold text-neutral-900 mb-6"
              />
              <ScrollReveal delay={0.3}>
                <p className="text-neutral-700 text-lg leading-relaxed mb-8">
                  We are passionate about timeless elegance and feminine grace. We specialize in offering a curated selection of sophisticated designs that celebrate the modern woman's strength, beauty, and individuality.
                </p>
              </ScrollReveal>
              <ScrollReveal delay={0.4}>
                <Button variant="primary" size="lg" onClick={() => onNavigate('about')}>
                  ABOUT US
                </Button>
              </ScrollReveal>
            </ScrollReveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 border-t border-neutral-200 pt-16">
            <ScrollReveal delay={0.2}>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <svg className="w-12 h-12 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <div>
                  <CounterAnimation
                    end={500}
                    suffix="+"
                    className="text-4xl md:text-5xl font-bold text-neutral-900 mb-2"
                  />
                  <p className="text-neutral-600">Over 500 unique curated pieces</p>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.3}>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <svg className="w-12 h-12 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div>
                  <CounterAnimation
                    end={40}
                    suffix="+"
                    className="text-4xl md:text-5xl font-bold text-neutral-900 mb-2"
                  />
                  <p className="text-neutral-600">40+ talented artisans & designers</p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-neutral-50">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal className="text-center mb-12">
            <p className="text-sm tracking-[0.3em] text-neutral-500 mb-2">FALL WINTER 25</p>
            <LetterReveal
              text="WHAT DO YOU SEE?"
              className="font-serif text-3xl md:text-4xl font-bold text-neutral-900"
            />
          </ScrollReveal>

          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8" staggerDelay={0.15}>
            {[
              {
                id: 1,
                name: 'Elegant Black Dress',
                price: 189.0,
                image: '/Gemini_Generated_Image_mtsv62mtsv62mtsv copy.png',
              },
              {
                id: 2,
                name: 'Monochrome Print Gown',
                price: 249.0,
                image: '/Gemini_Generated_Image_ehszg6ehszg6ehsz copy.png',
              },
              {
                id: 3,
                name: 'Black One-Shoulder Dress',
                price: 169.0,
                image: '/Gemini_Generated_Image_c0aiz1c0aiz1c0ai copy.png',
              },
              {
                id: 4,
                name: 'Black Jumpsuit',
                price: 159.0,
                image: '/Gemini_Generated_Image_f24zqwf24zqwf24z copy.png',
              },
            ].map((item) => (
              <motion.div
                key={item.id}
                variants={staggerItemVariants}
                className="group cursor-pointer"
                onClick={() => onNavigate('shop')}
              >
                <ImageReveal
                  src={item.image}
                  alt={item.name}
                  className="relative aspect-[3/4] bg-neutral-100 mb-4 overflow-hidden rounded-sm"
                />
                <h3 className="text-neutral-900 font-medium mb-2 text-sm">{item.name}</h3>
                <p className="text-neutral-600 mb-4">${item.price.toFixed(2)}</p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigate('shop');
                  }}
                  className="w-full"
                >
                  SHOP
                </Button>
              </motion.div>
            ))}
          </StaggerContainer>
        </div>
      </section>

      <section className="py-8 overflow-hidden bg-neutral-900">
        <div className="flex whitespace-nowrap animate-scroll">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="flex items-center">
              <span className="text-5xl md:text-6xl font-bold text-white mx-8">INAARA WOMAN</span>
              <span
                className="text-5xl md:text-6xl font-bold text-white/20 mx-8"
                style={{ WebkitTextStroke: '1px white' }}
              >
                INAARA WOMAN
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20 px-4 bg-neutral-50">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal className="text-center mb-16">
            <p className="text-sm font-medium tracking-widest text-neutral-500 mb-3">INAARA TRENDS</p>
            <LetterReveal
              text="Latest Collections"
              className="font-serif text-4xl md:text-5xl font-bold text-neutral-900"
            />
          </ScrollReveal>

          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8" staggerDelay={0.12}>
            {[
              { image: '/IMG_4511 copy.JPG', title: 'Evening Elegance' },
              { image: '/A5B830C9-6BF5-4117-87BB-81014C55648B copy.jpg', title: 'Statement Sleeves' },
              { image: '/Gemini_Generated_Image_saz8ssaz8ssaz8ss.png', title: 'Modern Asymmetry' },
              { image: '/Gemini_Generated_Image_hggw0zhggw0zhggw copy.png', title: 'Pure Sophistication' },
            ].map((collection, index) => (
              <motion.button
                key={index}
                variants={staggerItemVariants}
                onClick={() => onNavigate('shop')}
                className="group relative overflow-hidden bg-white rounded-sm shadow-sm hover:shadow-xl transition-all duration-500"
              >
                <div className="aspect-[3/4] overflow-hidden">
                  <img
                    src={collection.image}
                    alt={collection.title}
                    className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/80 via-neutral-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <h3 className="font-serif text-2xl font-bold mb-2">{collection.title}</h3>
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <span>Shop Collection</span>
                      <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </motion.button>
            ))}
          </StaggerContainer>

          <ScrollReveal className="text-center mt-12" delay={0.5}>
            <Button onClick={() => onNavigate('shop')} variant="outline" className="px-8 py-3 text-sm font-medium tracking-wide">
              VIEW ALL COLLECTIONS
            </Button>
          </ScrollReveal>
        </div>
      </section>

      <section className="py-20 px-4 bg-neutral-50">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-neutral-900 mb-4">Bestsellers</h2>
            <p className="text-neutral-600 max-w-2xl mx-auto">Our most loved pieces that continue to inspire</p>
          </ScrollReveal>

          <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-6" staggerDelay={0.1}>
            {featuredProducts.map((product) => (
              <motion.div key={product.id} variants={staggerItemVariants}>
                <ProductCard product={product} onClick={() => onNavigate('product', { id: product.id })} />
              </motion.div>
            ))}
          </StaggerContainer>

          <ScrollReveal className="text-center mt-10" delay={0.4}>
            <Button variant="outline" onClick={() => onNavigate('shop')}>
              View All Products
            </Button>
          </ScrollReveal>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <ScrollReveal>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-neutral-900 mb-4">Join Our Community</h2>
            <p className="text-neutral-600 mb-8">
              Be the first to know about new arrivals, exclusive offers, and styling inspiration
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1"
              />
              <Button type="submit" disabled={isSubscribing}>
                {isSubscribing ? 'Subscribing...' : 'Subscribe'}
              </Button>
            </form>
          </ScrollReveal>
        </div>
      </section>

      <section className="relative h-[500px] md:h-[600px] overflow-hidden">
        <ParallaxImage
          src="/image copy copy copy.png"
          alt="Discover a brand where style, quality, and craftsmanship come together"
          speed={-0.5}
          className="absolute inset-0"
        />
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 flex items-center justify-center">
          <ScrollReveal className="text-center px-4">
            <TextReveal
              text="Discover a brand where style, quality, and craftsmanship come together."
              className="text-white text-xl md:text-2xl lg:text-3xl font-light max-w-3xl mx-auto leading-relaxed"
            />
          </ScrollReveal>
        </div>
      </section>

      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-neutral-900 mb-16 text-center">Our Promise</h2>
          </ScrollReveal>

          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12" staggerDelay={0.15}>
            {[
              {
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                ),
                title: 'Free Shipping',
                description: 'You will love at great low prices',
              },
              {
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                ),
                title: 'Flexible Payment',
                description: 'Pay with Multiple Credit Cards',
              },
              {
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                ),
                title: 'Fast Delivery',
                description: 'Experience the joy of fast shipping',
              },
              {
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                ),
                title: 'Premium Support',
                description: 'Outstanding premium support',
              },
            ].map((feature, index) => (
              <motion.div key={index} variants={staggerItemVariants} className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                  <svg className="w-12 h-12 text-neutral-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {feature.icon}
                  </svg>
                </div>
                <h3 className="font-medium text-lg mb-2 text-neutral-900">{feature.title}</h3>
                <p className="text-sm text-neutral-600">{feature.description}</p>
              </motion.div>
            ))}
          </StaggerContainer>
        </div>
      </section>
    </div>
  );
}
