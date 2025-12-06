import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function AboutPage() {
  const [isHovered, setIsHovered] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const founderImages = [
    'https://res.cloudinary.com/dusynu0kv/image/upload/w_800,q_auto,f_auto/v1761737368/IMG_7531_sje7dc.jpg',
    'https://res.cloudinary.com/dusynu0kv/image/upload/w_800,q_auto,f_auto/v1761737367/IMG_7530_oh18g5.jpg'
  ];

  const galleryImages = [
    'https://res.cloudinary.com/dusynu0kv/image/upload/w_600,q_auto,f_auto/v1761734976/IMG_0010_js7uxg.jpg',
    'https://res.cloudinary.com/dusynu0kv/image/upload/w_600,q_auto,f_auto/v1761734952/IMG_0008_vxjvwz.jpg',
    'https://res.cloudinary.com/dusynu0kv/image/upload/w_600,q_auto,f_auto/v1761734713/IMG_0001_1_s2rlvp.jpg'
  ];

  // Auto slider for mobile founder images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % founderImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      
      {/* SECTION 1: About the Brand */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            
            {/* Left - Brand Image */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="w-full"
            >
              <div className="relative w-full aspect-[3/4] overflow-hidden rounded-xl">
                <img
                  src="https://res.cloudinary.com/dusynu0kv/image/upload/w_800,q_auto,f_auto/v1761657117/Gemini_Generated_Image_ghl6prghl6prghl6_qvqz21.png"
                  alt="About Inaara Woman"
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>

            {/* Right - Brand Text */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="w-full lg:pt-8"
            >
              <h2 className="text-xl md:text-2xl font-normal text-neutral-900 tracking-wide uppercase mb-8">
                About the Brand
              </h2>
              
              <div className="space-y-6 text-sm text-neutral-600 leading-relaxed">
                <p>
                  Inaara Woman is a contemporary clothing brand that celebrates the light, grace, and strength within every woman.
                </p>
                
                <p>
                  Founded in 2023 by Nigerian fashion model and creative visionary Iriketoma Oghenevwede Favour, the brand blends timeless design with intentional craftsmanship — creating elegant, feminine pieces that empower women to express confidence unapologetically.
                </p>
                
                <p>
                  The name Inaara, drawn from the Arabic word meaning "illuminated" or "heaven-sent," reflects the essence of who we are: a brand rooted in light, purpose, and divine radiance. Each collection tells a story of self-expression, confidence, and becoming — reminding women that their glow was never meant to be dimmed.
                </p>
                
                <p>
                  At Inaara Woman, fashion is more than what you wear; it is how you feel, how you show up, and how you honor your truth. Every silhouette, color, and fabric is chosen with intention, crafted to help women feel seen, celebrated, and beautifully themselves.
                </p>
                
                <p>
                  From our debut collection, UZURI SS25, to the evolving chapters that follow, Inaara Woman continues to champion inclusivity, individuality, and authenticity in every thread.
                </p>
                
                <p className="font-medium text-neutral-800">
                  Inaara Woman is more than a brand — it is a movement. A radiant community of women embracing their light, one piece at a time.
                </p>
                
                <p className="italic text-neutral-700">
                  Welcome home. Welcome to our tribe.
                </p>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-t border-neutral-200"></div>
      </div>

      {/* SECTION 2: Meet the Founder */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            
            {/* Left - Founder Text */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="w-full order-2 lg:order-1"
            >
              <h2 className="text-xl md:text-2xl font-normal text-neutral-900 tracking-wide uppercase mb-2">
                Meet the Founder
              </h2>
              <p className="text-sm text-neutral-500 mb-8">
                — Iriketoma Oghenevwede Favour
              </p>
              
              <div className="space-y-6 text-sm text-neutral-600 leading-relaxed">
                <p className="text-base font-medium text-neutral-800 italic">
                  💌 Founder's Note
                </p>
                
                <p>
                  When I think about Inaara Woman, I see more than clothes — I see light.
                </p>
                
                <p>
                  For as long as I can remember, I've been drawn to the quiet strength and grace women carry, even when the world tries to make them small. I wanted to create something that reminded every woman that her glow was never a coincidence — it is divine.
                </p>
                
                <p>
                  Inaara Woman was born from that conviction: a space where women can reconnect with their light, their softness, and their power. Every piece we create is intentional. It's not just about what you wear, but how you feel — confident, feminine, seen, and enough.
                </p>
                
                <p>
                  As a model, I've worn many designs, yet I rarely found pieces that told our stories. So I began to create them myself — pieces that whisper, "You are radiant, just as you are."
                </p>
                
                <p>
                  This dream would never have become reality without the people who chose to believe in it with me.
                </p>
                
                <div className="pl-4 border-l-2 border-neutral-200 space-y-2 text-neutral-700">
                  <p>To <span className="font-medium">Racheal</span> — your hands and heart are woven into every stitch of Inaara.</p>
                  <p>To <span className="font-medium">Brendon Oleghe</span> — thank you for your strength and dedication behind the scenes.</p>
                  <p>To <span className="font-medium">Victor</span> — for breathing soul into our identity.</p>
                  <p>And to <span className="font-medium">Karo</span> — whose lens captures the spirit of every woman who wears Inaara.</p>
                </div>
                
                <p>
                  Most of all, this brand is lovingly dedicated to my beloved aunt, <span className="font-medium">Ndomaya Gbaya</span> — the woman who believed in me before the world did. Her love, prayers, and unwavering faith built the foundation I stand on today. Her light continues to guide everything we do.
                </p>
                
                <p>
                  From my heart to yours, thank you for being part of the Inaara Tribe, for believing in this vision, and for carrying your light boldly into the world. Every woman deserves to shine in her God-given light — not someday, but every day.
                </p>
                
                <div className="pt-4">
                  <p className="text-neutral-700 italic">With love and light,</p>
                  <p className="font-medium text-neutral-900 mt-2">Iriketoma Oghenevwede Favour</p>
                  <p className="text-xs text-neutral-500 mt-1">Founder, Inaara Woman</p>
                </div>
              </div>
            </motion.div>

            {/* Right - Founder Image */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="w-full order-1 lg:order-2"
            >
              {/* Desktop - Hover Effect */}
              <div 
                className="hidden md:block relative w-full aspect-[3/4] overflow-hidden rounded-xl cursor-pointer"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <img
                  src={founderImages[0]}
                  alt="Iriketoma Oghenevwede Favour"
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
                    isHovered ? 'opacity-0' : 'opacity-100'
                  }`}
                />
                <img
                  src={founderImages[1]}
                  alt="Iriketoma Oghenevwede Favour"
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
                    isHovered ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              </div>

              {/* Mobile - Auto Slider */}
              <div className="md:hidden relative w-full aspect-[3/4] overflow-hidden rounded-xl">
                {founderImages.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Iriketoma Oghenevwede Favour ${index + 1}`}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
                      currentSlide === index ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                ))}
                
                {/* Slide Indicators */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {founderImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        currentSlide === index 
                          ? 'bg-white w-6' 
                          : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* SECTION 3: Gallery */}
      <section className="py-16 md:py-24 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {galleryImages.map((image, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                viewport={{ once: true }}
                className="relative aspect-[3/4] overflow-hidden rounded-xl group"
              >
                <img
                  src={image}
                  alt={`Inaara Woman Collection ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: Call to Action */}
      <section className="py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <p className="text-lg md:text-xl font-normal text-neutral-800 leading-relaxed mb-8">
              "Every woman deserves to shine in her God-given light — not someday, but every day."
            </p>
            
            <a
              href="/shop"
              className="inline-block px-8 py-3 bg-neutral-900 text-white text-xs tracking-widest uppercase hover:bg-neutral-800 transition-colors duration-300 rounded-lg"
            >
              Shop the Collection
            </a>
          </motion.div>
        </div>
      </section>

      {/* Instagram Link */}
      <section className="pb-16">
        <div className="text-center">
          <a
            href="https://www.instagram.com/inaarawoman_/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-xs tracking-widest uppercase text-neutral-600 hover:text-neutral-900 transition-colors duration-300"
          >
            Follow us @inaarawoman_
          </a>
        </div>
      </section>

    </div>
  );
}