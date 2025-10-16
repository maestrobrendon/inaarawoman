import { useState } from 'react';
import { X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AnnouncementBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-gradient-to-r from-[#D4AF37] to-[#B8941F] text-white relative overflow-hidden"
      >
        <div className="h-10 flex items-center justify-center px-4 relative">
          <div className="flex items-center gap-2 text-center">
            <p className="text-xs sm:text-sm font-medium tracking-wide uppercase">
              Free Shipping On All Orders - Don't Miss Out!
            </p>
            <ArrowRight size={14} className="hidden sm:inline" />
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="absolute right-4 p-1 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Close announcement"
          >
            <X size={16} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
