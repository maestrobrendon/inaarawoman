import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Instagram, Facebook, Twitter, ShieldCheck, Mail, ArrowRight } from 'lucide-react';

export default function EnhancedFooter() {
  const year = new Date().getFullYear();
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const footerY = useTransform(scrollYProgress, [0.85, 1], [100, 0]);

  return (
    <motion.footer
      className="bg-neutral-50 border-t border-neutral-200 mt-20"
      style={{ y: footerY }}
    >
      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8">
          {/* Customer Care */}
          <div>
            <h4 className="text-[13px] font-bold mb-6 text-neutral-900 uppercase tracking-wider">
              Customer Care
            </h4>
            <ul className="space-y-3">
              {[
                { name: 'Contact Us', path: '/contact' },
                { name: 'Delivery', path: '/shipping-policy' },
                { name: 'Size Guide', path: '/size-guide' },
                { name: 'Returns', path: '/shipping-returns' },
                { name: 'Initiate Your Return', path: '/returns' },
                { name: 'Click & Collect', path: '/click-collect' },
                { name: 'FAQs', path: '/faq' }
              ].map((item) => (
                <li key={item.name}>
                  <Link 
                    to={item.path}
                    className="text-[13px] text-neutral-600 hover:text-neutral-900 transition-colors inline-block hover:translate-x-1 duration-200"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Important Info */}
          <div>
            <h4 className="text-[13px] font-bold mb-6 text-neutral-900 uppercase tracking-wider">
              Important Info
            </h4>
            <ul className="space-y-3">
              {[
                { name: 'Terms & Conditions', path: '/terms-conditions' },
                { name: 'Collection Statement', path: '/collection-statement' },
                { name: 'Privacy', path: '/privacy-policy' },
                { name: 'Cookie Policy', path: '/cookie-policy' },
                { name: 'Online Safety', path: '/online-safety' }
              ].map((item) => (
                <li key={item.name}>
                  <Link 
                    to={item.path}
                    className="text-[13px] text-neutral-600 hover:text-neutral-900 transition-colors inline-block hover:translate-x-1 duration-200"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* More */}
          <div>
            <h4 className="text-[13px] font-bold mb-6 text-neutral-900 uppercase tracking-wider">
              More
            </h4>
            <ul className="space-y-3">
              {[
                { name: 'About Us', path: '/about' },
                { name: 'Careers', path: '/careers' },
                { name: 'Boutiques', path: '/boutiques' },
                { name: 'Lookbook', path: '/lookbook' },
                { name: 'All Products', path: '/shop' },
                { name: 'New Arrivals', path: '/shop' }
              ].map((item) => (
                <li key={item.name}>
                  <Link 
                    to={item.path}
                    className="text-[13px] text-neutral-600 hover:text-neutral-900 transition-colors inline-block hover:translate-x-1 duration-200"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect With Us */}
          <div>
            <h4 className="text-[13px] font-bold mb-6 text-neutral-900 uppercase tracking-wider">
              Connect With Us
            </h4>
            <p className="text-[12px] text-neutral-600 mb-4 leading-relaxed">
              Join our members list to receive the latest access to new arrivals, VIP events and sale previews.
            </p>
            
            {/* Email Newsletter Signup */}
            <div className="mb-6">
              <div className="relative">
                <input
                  type="email"
                  placeholder="Email address..."
                  className="w-full px-4 py-2.5 pr-12 text-[13px] border border-neutral-300 rounded-sm focus:outline-none focus:border-neutral-900 transition-colors"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-neutral-900 transition-colors">
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>

            {/* Social Icons */}
            <div className="flex gap-4 mb-4">
              <motion.a
                href="https://www.instagram.com/inaarawoman_/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-600 hover:text-pink-600 transition-colors"
                aria-label="Instagram"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Instagram size={20} />
              </motion.a>

              <motion.a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-600 hover:text-[#1877F2] transition-colors"
                aria-label="Facebook"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Facebook size={20} />
              </motion.a>

              <motion.a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-600 hover:text-[#1DA1F2] transition-colors"
                aria-label="Twitter"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Twitter size={20} />
              </motion.a>
            </div>

            <a 
              href="mailto:info@inaarawoman.com" 
              className="text-[13px] text-neutral-600 hover:text-neutral-900 transition-colors flex items-center gap-2"
            >
              <Mail size={16} />
              info@inaarawoman.com
            </a>
          </div>
        </div>
      </div>

      {/* Tagline & Acknowledgement Section */}
      <div className="border-t border-neutral-200 bg-neutral-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-4xl">
            <h5 className="text-[13px] font-bold text-neutral-900 mb-3 uppercase tracking-wider">
              Tag @inaarawoman for a chance to be featured
            </h5>
            <p className="text-[12px] text-neutral-600 leading-relaxed">
              By tagging us (@inaarawoman) on Instagram or other social platforms, you grant Inaara Woman permission to repost and feature your content across our digital channels — including but not limited to our website, social media pages, email newsletters, and marketing materials. We love celebrating our community, and your beautiful moments in Inaara pieces inspire women everywhere to shine in their own light.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-neutral-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <p className="text-[12px] text-neutral-600">
                © {year} INAARA WOMAN
              </p>
              <motion.button
                onClick={() => navigate('/admin/login')}
                className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white text-[11px] font-semibold rounded-sm hover:bg-neutral-800 transition-colors uppercase tracking-wider"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ShieldCheck size={14} />
                Admin Login
              </motion.button>
            </div>

            {/* Payment Icons (Optional - Add if needed) */}
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-neutral-500 uppercase tracking-wider">Payment Methods:</span>
              <div className="flex gap-2">
                {['Visa', 'Mastercard', 'PayPal'].map((method) => (
                  <div 
                    key={method}
                    className="px-2 py-1 bg-white border border-neutral-300 rounded text-[10px] text-neutral-600 font-medium"
                  >
                    {method}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}