import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, Variants } from 'framer-motion';
import { Instagram, Facebook, Twitter, ShieldCheck } from 'lucide-react';

export default function EnhancedFooter() {
  const year = new Date().getFullYear();
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const footerY = useTransform(scrollYProgress, [0.85, 1], [100, 0]);

  const linkVariants: Variants = {
    rest: { x: 0 },
    hover: {
      x: 5,
      transition: { duration: 0.3, ease: "easeOut" }
    }
  };

  const underlineVariants: Variants = {
    rest: { width: 0 },
    hover: {
      width: "100%",
      transition: { duration: 0.3, ease: "easeOut" }
    }
  };

  return (
    <motion.footer
      className="bg-neutral-50 border-t border-neutral-200 mt-20"
      style={{ y: footerY }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div>
            <h3 className="text-[18px] font-bold mb-4 text-neutral-900 tracking-wider uppercase">
              INAARA WOMAN
            </h3>
            <p className="text-[14px] font-normal text-neutral-600 leading-relaxed">
              Timeless elegance meets modern femininity. Every woman deserves to shine in her own light.
            </p>
          </div>

          {/* Shop Section */}
          <div>
            <h4 className="text-[14px] font-semibold mb-4 text-neutral-900 uppercase tracking-wider">Shop</h4>
            <ul className="space-y-2">
              {[
                { name: 'All Products', path: '/shop' },
                { name: 'New Arrivals', path: '/shop' },
                { name: 'Bestsellers', path: '/shop' },
                { name: 'Lookbook', path: '/lookbook' }
              ].map((item) => (
                <li key={item.name}>
                  <Link to={item.path}>
                    <motion.div
                      className="text-[13px] md:text-[14px] font-normal text-neutral-600 hover:text-[#D4AF37] transition-colors relative inline-block"
                      initial="rest"
                      whileHover="hover"
                      variants={linkVariants}
                    >
                      <span className="relative">
                        {item.name}
                        <motion.span
                          className="absolute -bottom-1 left-0 h-0.5 bg-[#D4AF37]"
                          variants={underlineVariants}
                        />
                      </span>
                    </motion.div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About Section */}
          <div>
            <h4 className="text-[14px] font-semibold mb-4 text-neutral-900 uppercase tracking-wider">About</h4>
            <ul className="space-y-2">
              {[
                { name: 'Our Story', path: '/about' },
                { name: 'Contact Us', path: '/contact' },
                { name: 'FAQ', path: '/faq' }
              ].map((item) => (
                <li key={item.name}>
                  <Link to={item.path}>
                    <motion.div
                      className="text-[13px] md:text-[14px] font-normal text-neutral-600 hover:text-[#D4AF37] transition-colors relative inline-block"
                      initial="rest"
                      whileHover="hover"
                      variants={linkVariants}
                    >
                      <span className="relative">
                        {item.name}
                        <motion.span
                          className="absolute -bottom-1 left-0 h-0.5 bg-[#D4AF37]"
                          variants={underlineVariants}
                        />
                      </span>
                    </motion.div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect Section */}
          <div>
            <h4 className="text-[14px] font-semibold mb-4 text-neutral-900 uppercase tracking-wider">Connect</h4>
            <div className="flex gap-4 mb-4">
              <motion.a
                href="https://www.instagram.com/inaarawoman_/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-600 hover:text-pink-600 transition-all duration-300"
                aria-label="Instagram"
                whileHover={{
                  scale: 1.2,
                  rotate: 5,
                  y: -3
                }}
                whileTap={{ scale: 0.9 }}
              >
                <Instagram size={20} />
              </motion.a>

              <motion.a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-600 hover:text-[#1877F2] transition-colors duration-300"
                aria-label="Facebook"
                whileHover={{
                  scale: 1.2,
                  rotate: 5,
                  y: -3
                }}
                whileTap={{ scale: 0.9 }}
              >
                <Facebook size={20} />
              </motion.a>

              <motion.a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-600 hover:text-[#1DA1F2] transition-colors duration-300"
                aria-label="Twitter"
                whileHover={{
                  scale: 1.2,
                  rotate: 5,
                  y: -3
                }}
                whileTap={{ scale: 0.9 }}
              >
                <Twitter size={20} />
              </motion.a>
            </div>
            <a 
              href="mailto:info@inaarawoman.com" 
              className="text-[13px] md:text-[14px] text-neutral-600 hover:text-[#D4AF37] transition-colors"
            >
              info@inaarawoman.com
            </a>
          </div>
        </div>

        {/* Bottom Section with Policy Links */}
        <div className="mt-12 pt-8 border-t border-neutral-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <p className="text-[13px] text-neutral-600">
                © {year} Inaara Woman. All rights reserved.
              </p>
              <motion.button
                onClick={() => navigate('/admin/login')}
                className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white text-xs font-semibold rounded-md hover:bg-neutral-800 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ShieldCheck size={14} />
                Admin Login
              </motion.button>
            </div>
            
            {/* Policy Links */}
            <div className="flex flex-wrap gap-4 md:gap-6 justify-center">
              {[
                { name: 'Privacy Policy', path: '/privacy-policy' },
                { name: 'Terms & Conditions', path: '/terms-conditions' },
                { name: 'Shipping Policy', path: '/shipping-policy' },
                { name: 'Shipping & Returns', path: '/shipping-returns' },
                { name: 'Cookie Policy', path: '/cookie-policy' }
              ].map((item) => (
                <Link key={item.name} to={item.path}>
                  <motion.div
                    className="text-[13px] text-neutral-600 hover:text-[#D4AF37] transition-colors relative"
                    initial="rest"
                    whileHover="hover"
                  >
                    <span className="relative">
                      {item.name}
                      <motion.span
                        className="absolute -bottom-1 left-0 h-0.5 bg-[#D4AF37]"
                        variants={underlineVariants}
                      />
                    </span>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}