import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Instagram, Facebook, Twitter, ShieldCheck } from 'lucide-react';

export default function EnhancedFooter() {
  const year = new Date().getFullYear();
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const footerY = useTransform(scrollYProgress, [0.85, 1], [100, 0]);

  const linkVariants = {
    rest: { x: 0 },
    hover: {
      x: 5,
      transition: { duration: 0.3, ease: "easeOut" }
    }
  };

  const underlineVariants = {
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
          <div>
            <h3 className="text-[18px] font-bold mb-4 text-neutral-900 tracking-wider uppercase">
              INAARA WOMAN
            </h3>
            <p className="text-[14px] font-normal text-neutral-600 leading-relaxed">
              Timeless elegance meets modern femininity. Every woman deserves to shine in her own light.
            </p>
          </div>

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

          <div>
            <h4 className="font-medium mb-4 text-neutral-900">Connect</h4>
            <div className="flex gap-4 mb-4">
              <motion.a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-600 hover:text-transparent bg-clip-text transition-all duration-300"
                style={{
                  backgroundImage: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)'
                }}
                aria-label="Instagram"
                whileHover={{
                  scale: 1.2,
                  rotate: 5,
                  y: -3
                }}
                whileTap={{ scale: 0.9 }}
              >
                <motion.div
                  whileHover={{
                    filter: 'drop-shadow(0 4px 8px rgba(188, 24, 136, 0.4))'
                  }}
                >
                  <Instagram size={20} />
                </motion.div>
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
                <motion.div
                  whileHover={{
                    filter: 'drop-shadow(0 4px 8px rgba(24, 119, 242, 0.4))'
                  }}
                >
                  <Facebook size={20} />
                </motion.div>
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
                <motion.div
                  whileHover={{
                    filter: 'drop-shadow(0 4px 8px rgba(29, 161, 242, 0.4))'
                  }}
                >
                  <Twitter size={20} />
                </motion.div>
              </motion.a>
            </div>
            <p className="text-sm text-neutral-600">
              hello@inaarawoman.com
            </p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-neutral-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <p className="text-sm text-neutral-600">
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
            <div className="flex gap-6">
              {[
                { name: 'Privacy Policy', path: '/' },
                { name: 'Terms of Service', path: '/' },
                { name: 'Shipping & Returns', path: '/' }
              ].map((item) => (
                <Link key={item.name} to={item.path}>
                  <motion.div
                    className="text-sm text-neutral-600 hover:text-[#D4AF37] transition-colors relative"
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
