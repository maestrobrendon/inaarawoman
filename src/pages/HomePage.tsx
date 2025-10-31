import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const InaaraHomepage = () => {
  const [activeReview, setActiveReview] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [visibleSections, setVisibleSections] = useState({});
  
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections(prev => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -100px 0px' }
    );

    document.querySelectorAll('[data-animate]').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const reviews = [
    {
      name: "Corrine Bowers",
      text: "I've been wearing Inaara for a month now. If only you knew how much time it used to take me to find the perfect outfit! Now it takes just 15 minutes to put together a stunning look after waking up. I wear it every day! Even my colleagues have noticed my impeccable style. Thank you!"
    },
    {
      name: "Emma Brooks", 
      text: "The quality of the fabrics is exceptional. Every piece feels luxurious and comfortable. I love how versatile the collection is - I can dress up or down depending on the occasion. Inaara has completely transformed my wardrobe."
    },
    {
      name: "Carol Merida",
      text: "Finally found a brand that understands modern women's needs. The fit is perfect, the designs are timeless, and I always feel confident wearing Inaara pieces."
    },
    {
      name: "Gladys Bello",
      text: "Sustainable fashion that doesn't compromise on elegance. The attention to detail in every garment is remarkable. I'm proud to support a brand that cares about both style and ethics."
    }
  ];

  const nextReview = () => setActiveReview((prev) => (prev + 1) % reviews.length);
  const prevReview = () => setActiveReview((prev) => (prev - 1 + reviews.length) % reviews.length);

  return (
    <div className="bg-white text-gray-900 overflow-x-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        
        .fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
          opacity: 0;
        }
        
        @keyframes fadeInUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
          from {
            opacity: 0;
            transform: translateY(40px);
          }
        }
        
        .animate-visible {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }
        
        .hover-scale {
          transition: transform 0.3s ease;
        }
        
        .hover-scale:hover {
          transform: scale(1.02);
        }
        
        .parallax-text {
          will-change: transform;
        }

        @media (max-width: 768px) {
          .text-hero {
            font-size: 2.5rem;
            line-height: 1.1;
          }
        }
      `}</style>

      {/* Kit Includes Section */}
      <section className="py-24 px-6 lg:px-12 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-light mb-16 text-center">
            The collection includes:
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="aspect-square bg-white rounded-lg mb-6 flex items-center justify-center p-8">
                <img 
                  src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&h=400&fit=crop&q=80"
                  alt="Core pieces"
                  className="w-full h-full object-cover rounded"
                />
              </div>
              <h3 className="text-xl font-medium mb-2">Essential pieces</h3>
            </div>
            
            <div className="text-center">
              <div className="aspect-square bg-white rounded-lg mb-6 flex items-center justify-center p-8">
                <img 
                  src="https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=400&fit=crop&q=80"
                  alt="Care instructions"
                  className="w-full h-full object-cover rounded"
                />
              </div>
              <h3 className="text-xl font-medium mb-2">Care instructions</h3>
            </div>
            
            <div className="text-center">
              <div className="aspect-square bg-white rounded-lg mb-6 flex items-center justify-center p-8">
                <img 
                  src="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=400&h=400&fit=crop&q=80"
                  alt="Style guide"
                  className="w-full h-full object-cover rounded"
                />
              </div>
              <h3 className="text-xl font-medium mb-2">Styling guide booklet</h3>
            </div>
            
            <div className="text-center">
              <div className="aspect-square bg-white rounded-lg mb-6 flex items-center justify-center p-8">
                <img 
                  src="https://images.unsplash.com/photo-1602293589930-45aad59ba3ab?w=400&h=400&fit=crop&q=80"
                  alt="Storage bag"
                  className="w-full h-full object-cover rounded"
                />
              </div>
              <h3 className="text-xl font-medium mb-2">Premium garment bag</h3>
            </div>
            
            <div className="text-center">
              <div className="aspect-square bg-white rounded-lg mb-6 flex items-center justify-center p-8">
                <img 
                  src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop&q=80"
                  alt="Warranty"
                  className="w-full h-full object-cover rounded"
                />
              </div>
              <h3 className="text-xl font-medium mb-2">Quality certificate</h3>
            </div>
          </div>
        </div>
      </section>

      {/* Become Partner Section */}
      <section className="py-24 px-6 lg:px-12 bg-black text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-light mb-8">
            Become<br />a partner
          </h2>
          <p className="text-lg md:text-xl leading-relaxed mb-8 opacity-90">
            Do you want to stock our products or establish cooperation with Inaara? Email us now! We are ready to discuss any orders and arrange delivery to any location ASAP. Inaara is a quality brand. And we are your reliable partner.
          </p>
          <button className="bg-white text-black px-10 py-4 text-lg font-medium hover:bg-gray-100 transition">
            Contact Us
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-16 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div>
              <h3 className="text-xl font-semibold mb-6">INAARA</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Redefining elegance for the modern woman through timeless design and exceptional quality.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium mb-4">Shop</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-black transition">New Arrivals</a></li>
                <li><a href="#" className="hover:text-black transition">Collections</a></li>
                <li><a href="#" className="hover:text-black transition">Sale</a></li>
                <li><a href="#" className="hover:text-black transition">Gift Cards</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-black transition">Contact</a></li>
                <li><a href="#" className="hover:text-black transition">Shipping & Returns</a></li>
                <li><a href="#" className="hover:text-black transition">Size Guide</a></li>
                <li><a href="#" className="hover:text-black transition">FAQ</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-black transition">About Us</a></li>
                <li><a href="#" className="hover:text-black transition">Sustainability</a></li>
                <li><a href="#" className="hover:text-black transition">Careers</a></li>
                <li><a href="#" className="hover:text-black transition">Press</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-600">
            <p>&copy; 2025 Inaara. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-black transition">Privacy Policy</a>
              <a href="#" className="hover:text-black transition">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        .animate-scroll {
          animation: scroll 20s linear infinite;
          display: flex;
        }
        
        .animate-scroll > div {
          display: flex;
          min-width: 100%;
        }
      `}</style>
    </div>
  );
};

export default InaaraHomepage; Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
          <div className="text-xl font-semibold tracking-wide">INAARA</div>
          <div className="hidden md:flex items-center space-x-10 text-sm font-medium">
            <a href="#" className="hover:opacity-60 transition-opacity">Collection</a>
            <a href="#" className="hover:opacity-60 transition-opacity">About</a>
            <a href="#" className="hover:opacity-60 transition-opacity">Reviews</a>
            <a href="#" className="hover:opacity-60 transition-opacity">Contact</a>
          </div>
          <button className="bg-black text-white px-6 py-2.5 text-sm font-medium hover:bg-gray-800 transition">
            Shop Now
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 lg:px-12 min-h-screen flex items-center bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto w-full">
          <div className="max-w-4xl">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-light leading-tight mb-6 text-hero">
              An innovative clothing collection that elevates your style effortlessly. With it, you can achieve an impeccable look in just 10 minutes.
            </h1>
          </div>
        </div>
      </section>

      {/* For Any Occasion Section */}
      <section className="py-20 px-6 lg:px-12 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-light mb-8 max-w-3xl">
            For any occasion
          </h2>
          <p className="text-xl md:text-2xl font-light text-gray-700 max-w-4xl leading-relaxed">
            For any setting. Anywhere: at work, at events, or casual outings. Simply choose Inaara and dress like a style icon, maintaining the natural elegance of your appearance.
          </p>
        </div>
      </section>

      {/* Three Column Features */}
      <section className="py-24 px-6 lg:px-12 bg-gray-50" id="features" data-animate>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            {/* Feature 1 */}
            <div className={`transition-all duration-1000 ${visibleSections.features ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
              <div className="relative mb-6">
                <div className="text-6xl font-light text-gray-300">01</div>
                <div className="absolute top-0 left-0 text-lg font-medium text-gray-400">/03</div>
              </div>
              <h3 className="text-3xl font-light mb-6">Dress, style and accessorize – all at the same time!</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Before you can complete your look, you need to find the right pieces. Now with Inaara you can style yourself while selecting. Pick the garment with one hand and accessorize with the other. Mix or match your outfit at the same time to easily create your desired aesthetic.
              </p>
            </div>

            {/* Feature 2 */}
            <div className={`transition-all duration-1000 delay-200 ${visibleSections.features ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
              <div className="relative mb-6">
                <div className="text-6xl font-light text-gray-300">02</div>
                <div className="absolute top-0 left-0 text-lg font-medium text-gray-400">/03</div>
              </div>
              <h3 className="text-3xl font-light mb-6">Ten minutes instead of 40: style your complete look like a professional every day</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Complete freedom in styling gives you better control of your appearance than even a professional stylist. With Inaara, dressing becomes a quick and easy daily ritual. It is no longer a long and stressful process, which you can manage just a few times a week, but a simple and enjoyable experience. With Inaara you will always look your best.
              </p>
            </div>

            {/* Feature 3 */}
            <div className={`transition-all duration-1000 delay-400 ${visibleSections.features ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
              <div className="relative mb-6">
                <div className="text-6xl font-light text-gray-300">03</div>
                <div className="absolute top-0 left-0 text-lg font-medium text-gray-400">/03</div>
              </div>
              <h3 className="text-3xl font-light mb-6">Healthy, radiant and beautiful confidence</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Inaara allows you to embrace quality fabrics at comfortable fits, where the garments feel natural and breathable. This ensures effortless wearing without compromising your comfort or style. With Inaara, your confidence will shine and you'll look naturally beautiful.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stylist Everywhere Section with Image */}
      <section className="py-24 px-6 lg:px-12 bg-white" id="stylist" data-animate>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className={`transition-all duration-1000 ${visibleSections.stylist ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'}`}>
              <h2 className="text-4xl md:text-5xl font-light mb-8">
                A wardrobe<br />everywhere<br />with you
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                Versatile, elegant and easy to style, Inaara is easy to pack wherever you go and wear in any environment. The functionality and design of the collection are clever and timeless: everything you need to look stunning in any situation is there. Anywhere.
              </p>
            </div>
            <div className={`transition-all duration-1000 delay-300 ${visibleSections.stylist ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}`}>
              <div className="aspect-[4/5] bg-gray-100 rounded-lg overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&h=1500&fit=crop&q=80" 
                  alt="Fashion styling"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Three Scenarios */}
      <section className="py-24 px-6 lg:px-12 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <div className="aspect-[3/4] bg-gray-200 rounded-lg overflow-hidden mb-6">
                <img 
                  src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&h=1000&fit=crop&q=80"
                  alt="At home"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-2xl font-light mb-4">At home</h3>
              <p className="text-gray-600 leading-relaxed">
                Use Inaara when preparing for work or getting ready to go out. Keep it in your closet or bedroom: it becomes a natural part of your daily routine.
              </p>
            </div>
            <div>
              <div className="aspect-[3/4] bg-gray-200 rounded-lg overflow-hidden mb-6">
                <img 
                  src="https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&h=1000&fit=crop&q=80"
                  alt="At events"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-2xl font-light mb-4">At events or gatherings</h3>
              <p className="text-gray-600 leading-relaxed">
                Chic style after a morning meeting, or after a wellness session, can be a reality! The convenience and elegance of Inaara makes it possible to take with you anywhere to create the perfect look for any occasion.
              </p>
            </div>
            <div>
              <div className="aspect-[3/4] bg-gray-200 rounded-lg overflow-hidden mb-6">
                <img 
                  src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&h=1000&fit=crop&q=80"
                  alt="On the move"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-2xl font-light mb-4">On the move</h3>
              <p className="text-gray-600 leading-relaxed">
                Thanks to its versatile design, Inaara can be taken on trips. Effortless style in memorable photos from faraway places – it's possible with the timeless collection!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Scrolling Text Banner */}
      <section className="py-16 bg-black text-white overflow-hidden">
        <div className="flex whitespace-nowrap animate-scroll">
          <div className="flex items-center space-x-8 text-2xl md:text-3xl font-light">
            <span>Effortless elegance</span>
            <span>•</span>
            <span>Effortless elegance</span>
            <span>•</span>
            <span>Effortless elegance</span>
            <span>•</span>
            <span>Effortless elegance</span>
            <span>•</span>
            <span>Effortless elegance</span>
            <span>•</span>
          </div>
        </div>
      </section>

      {/* Without High Temperatures Section */}
      <section className="py-24 px-6 lg:px-12 bg-white" id="comfort" data-animate>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-light mb-16 text-center">
            Without uncomfortable restrictions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start mb-16">
            <div>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                The restrictive nature of tight-fitting or poorly designed clothing causes discomfort and affects your natural movement, making garments feel stiff and constraining.
              </p>
            </div>
            <div>
              <p className="text-lg leading-relaxed">
                Inaara preserves the body's <strong>natural freedom</strong>, <strong>comfort</strong> and <strong>confidence</strong> by helping you wear pieces that move with you effortlessly.
              </p>
            </div>
          </div>
          
          <div className={`transition-all duration-1000 ${visibleSections.comfort ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
            <h3 className="text-3xl font-light mb-8">Perfect fit</h3>
            <p className="text-lg text-gray-600 leading-relaxed max-w-3xl">
              By wearing it, you can feel the quality and know how each piece flatters your silhouette and where it should be adjusted. With Inaara you don't have to risk your comfort and confidence for style. Just select what feels right and ensure quality wearing and styling that enhances your natural beauty.
            </p>
          </div>
        </div>
      </section>

      {/* Attention Section */}
      <section className="py-24 px-6 lg:px-12 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-light mb-8">
                Attention and admiration because of your beautiful style
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                We understand the importance of well-styled, elegant clothing for a striking and memorable appearance that leaves a lasting impression. Unfortunately, styling at home is too time-consuming to do every day. That's why many people give up the opportunity to look the way they'd like to, 'save' their best outfits for a 'special day', or dress up just a few times a week.
              </p>
            </div>
            <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1000&h=1000&fit=crop&q=80"
                alt="Elegant style"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Care Section */}
      <section className="py-24 px-6 lg:px-12 bg-white">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-light mb-8">
            Care for what matters
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed mb-8 max-w-3xl mx-auto">
            When developing Inaara, we thought about how you can look the way you would like to look every day. Without compromise or limitation. The collection is based on extensive research into the challenges of daily styling. Comfort, quality, and elegance, saving time – these and more were the guiding principles that drove our designers to create a unique solution. And that is Inaara.
          </p>
          <p className="text-2xl md:text-3xl font-light">
            With just quality pieces and your natural style, you can look beautiful and well-groomed every day.
          </p>
        </div>
      </section>

      {/* Using Instructions */}
      <section className="py-24 px-6 lg:px-12 bg-gray-50" id="using" data-animate>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-light mb-16 text-center">
            Styling with Inaara<br />is easy
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            {[
              { num: "1", text: "Browse the collection" },
              { num: "2", text: "Select your pieces" },
              { num: "3", text: "Try the look" },
              { num: "4", text: "Mix and match" },
              { num: "5", text: "Ready!" }
            ].map((step, idx) => (
              <div 
                key={idx}
                className={`text-center transition-all duration-700 delay-${idx * 100} ${visibleSections.using ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              >
                <div className="text-5xl font-light text-gray-300 mb-4">{step.num}</div>
                <p className="text-lg font-light">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Setup Section with Details */}
      <section className="py-24 px-6 lg:px-12 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-light mb-16 text-center">
            Complete your look<br />with ease
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24">
            <div className="aspect-[4/5] bg-gray-100 rounded-lg overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=1000&h=1250&fit=crop&q=80"
                alt="Styling details"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-xl font-light leading-relaxed mb-8">
                The versatile pieces work perfectly with any style preference and suit various occasions with different styling approaches.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                The adaptable designs fit any aesthetic effortlessly and complement wardrobes with any existing collection.
              </p>
            </div>
          </div>

          {/* Detail Sections */}
          <div className="space-y-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="order-2 lg:order-1">
                <h3 className="text-3xl font-light mb-6">On the mirror or closet</h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  The collection can be organized beautifully on any hanger, rail or any other storage solution. It can just as easily be arranged without leaving creases.
                </p>
              </div>
              <div className="order-1 lg:order-2 aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1558769132-cb1aea27c7fd?w=1200&h=900&fit=crop&q=80"
                  alt="Closet organization"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=1200&h=900&fit=crop&q=80"
                  alt="Fabric detail"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-3xl font-light mb-6">Premium materials</h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Made of premium, sustainably-sourced fabrics, designed to feel luxurious and last for years with proper care.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="order-2 lg:order-1">
                <h3 className="text-3xl font-light mb-6">Timeless design</h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Designed to complement your style with perfect elegance, so that every piece elevates your natural beauty. The garments can also be styled casually or formally.
                </p>
              </div>
              <div className="order-1 lg:order-2 aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=1200&h=900&fit=crop&q=80"
                  alt="Timeless design"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* One Collection Many Options */}
      <section className="py-24 px-6 lg:px-12 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-light mb-16 text-center">
            One collection, many options
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden mb-6">
                <img 
                  src="https://images.unsplash.com/photo-1467043237213-65f2da53396f?w=800&h=800&fit=crop&q=80"
                  alt="Occasion wear"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-2xl font-light mb-4">Perfect for any occasion</h3>
              <p className="text-gray-600 leading-relaxed">
                Whether heading to a business meeting or casual weekend brunch, Inaara pieces adapt beautifully to create the perfect ensemble for every moment of your day.
              </p>
            </div>

            <div>
              <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden mb-6">
                <img 
                  src="https://images.unsplash.com/photo-1469460340997-2f854421e72f?w=800&h=800&fit=crop&q=80"
                  alt="Travel ready"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-2xl font-light mb-4">Save time and effort traveling</h3>
              <p className="text-gray-600 leading-relaxed">
                With Inaara you can pack light and look polished, or create multiple outfits for extended trips. You'll be ready for any adventure in minutes: style yourself beautifully and effortlessly.
              </p>
            </div>

            <div>
              <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden mb-6">
                <img 
                  src="https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?w=800&h=800&fit=crop&q=80"
                  alt="Versatile styling"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-2xl font-light mb-4">Style with confidence</h3>
              <p className="text-gray-600 leading-relaxed">
                Inaara is perfect for those who want to express their unique style effortlessly. With this versatile collection, you can create and refine looks easily, giving you the freedom to look impeccable every day.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Guarantee Banner */}
      <section className="py-16 px-6 bg-black text-white text-center">
        <p className="text-xl md:text-2xl font-light max-w-3xl mx-auto">
          If you don't love Inaara, you can return it within 14 days after delivery.
        </p>
      </section>

      {/* Reviews Section */}
      <section className="py-24 px-6 lg:px-12 bg-white" id="reviews" data-animate>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-light mb-16 text-center">Reviews</h2>
          
          <div className="relative">
            <div className={`bg-gray-50 rounded-2xl p-8 md:p-12 transition-all duration-500 ${visibleSections.reviews ? 'opacity-100' : 'opacity-0'}`}>
              <h3 className="text-2xl font-medium mb-4">{reviews[activeReview].name}</h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                {reviews[activeReview].text}
              </p>
            </div>

            <button 
              onClick={prevReview}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-3 shadow-lg hover:bg-gray-50 transition"
              aria-label="Previous review"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            
            <button 
              onClick={nextReview}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-3 shadow-lg hover:bg-gray-50 transition"
              aria-label="Next review"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          <div className="flex justify-center mt-8 space-x-2">
            {reviews.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveReview(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === activeReview ? 'w-8 bg-black' : 'w-2 bg-gray-300'
                }`}
                aria-label={`Go to review ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/*