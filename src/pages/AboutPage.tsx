import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AboutPage() {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Tiny Header */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-[10px] tracking-[0.4em] uppercase text-neutral-900 font-light">
            About A.I
          </h1>
        </div>
      </section>

      {/* Main Content - Side by Side Layout */}
      <section className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            
            {/* Left Side - Image with Hover Effect */}
            <div className="w-full">
              <div 
                className="relative w-full aspect-[3/4] overflow-hidden cursor-pointer"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                {/* Main Image */}
                <img
                  src="https://res.cloudinary.com/dusynu0kv/image/upload/w_800,q_auto,f_auto/v1761737368/IMG_7531_sje7dc.jpg"
                  alt="Inaara Woman"
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
                    isHovered ? 'opacity-0' : 'opacity-100'
                  }`}
                />
                {/* Hover Image */}
                <img
                  src="https://res.cloudinary.com/dusynu0kv/image/upload/w_800,q_auto,f_auto/v1761737367/IMG_7530_oh18g5.jpg"
                  alt="Inaara Woman Hover"
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
                    isHovered ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              </div>

              {/* Instagram Link */}
              <div className="mt-4">
                <a
                  href="https://www.instagram.com/inaara.woman"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-[10px] tracking-[0.3em] uppercase text-neutral-900 hover:text-neutral-600 transition-colors duration-300 font-light border-b border-neutral-900 hover:border-neutral-600"
                >
                  @inaara.woman
                </a>
              </div>
            </div>

            {/* Right Side - Text Content */}
            <div className="w-full">
              <div className="space-y-6">
                
                {/* Section 1 */}
                <div>
                  <h2 className="font-serif text-base md:text-lg font-normal text-neutral-900 mb-3">
                    About Inaara Woman
                  </h2>
                  <p className="text-xs text-neutral-700 leading-relaxed">
                    Inaara Woman is a contemporary clothing brand founded by Nigerian fashion model and creative visionary Iriketoma Oghenevwede Favour — a dreamer who has always believed that every woman carries her own light within her.
                  </p>
                </div>

                {/* Section 2 */}
                <div>
                  <p className="text-xs text-neutral-700 leading-relaxed">
                    Born from a simple but powerful question — "What does it mean for a woman to shine?" Inaara Woman was created to remind women that their radiance is not reserved for special occasions, but for every season of life.
                  </p>
                </div>

                {/* Section 3 */}
                <div>
                  <p className="text-xs text-neutral-700 leading-relaxed">
                    The name Inaara, drawn from the Arabic word meaning "to illuminate" or "heaven-sent", embodies the very essence of the brand light, grace, and divine purpose. Each Inaara Woman piece is designed to help women express their individuality with confidence and elegance, celebrating both strength and softness.
                  </p>
                </div>

                {/* Section 4 */}
                <div>
                  <p className="text-xs text-neutral-700 leading-relaxed">
                    An Inaara Woman is free-spirited. She spreads warmth and positivity wherever she goes. She isn't afraid to express herself because she knows who she is radiant, bold, and deeply loved.
                  </p>
                </div>

                {/* Section 5 */}
                <div>
                  <p className="text-xs text-neutral-700 leading-relaxed">
                    Founded in 2023 and officially debuting in 2025 with the UZURI SS25 Collection, Inaara Woman continues to create timeless, figure-flattering pieces that blend contemporary design with an appreciation for detail, craftsmanship, and meaning. Every collection tells a story one that celebrates inclusivity, womanhood, and the beauty of individuality.
                  </p>
                </div>

                {/* Section 6 */}
                <div>
                  <p className="text-xs text-neutral-700 leading-relaxed">
                    Behind Inaara Woman is a passionate team that believed in a dream and helped turn it into reality.
                  </p>
                </div>

                {/* Section 7 - Dedication */}
                <div>
                  <p className="text-xs text-neutral-700 leading-relaxed italic">
                    This website, and so much of what Inaara Woman has become, is dedicated to my beloved aunt, Ndomaya Gbaya whose love, encouragement, and unwavering support made this dream possible.
                  </p>
                </div>

                {/* Section 8 - Brand Statement */}
                <div className="pt-4">
                  <p className="text-xs text-neutral-900 leading-relaxed font-medium mb-2">
                    At Inaara Woman, we stand for one simple truth:
                  </p>
                  <p className="text-xs text-neutral-900 leading-relaxed font-medium">
                    Every woman deserves to shine in her God-given light.
                  </p>
                  <p className="text-xs text-neutral-900 leading-relaxed font-medium">
                    Don't shrink for anyone.
                  </p>
                  <p className="text-xs text-neutral-900 leading-relaxed font-medium">
                    Shine in your light, always.
                  </p>
                </div>

                {/* Section 9 - Community */}
                <div>
                  <p className="text-xs text-neutral-700 leading-relaxed">
                    And as you journey with us, we welcome you into the inner circle of the <span className="font-medium">Inaara Tribe</span>, a community of radiant women who inspire, uplift, and illuminate the world together.
                  </p>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Bottom Spacing */}
      <section className="py-16"></section>
    </div>
  );
}