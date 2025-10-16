import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Home, ShoppingBag, ArrowLeft } from 'lucide-react';
import Button from '../components/ui/Button';

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-gradient-to-br from-neutral-50 to-amber-50/30">
      <div className="max-w-2xl w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.h1
            className="text-9xl font-light text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-amber-600 mb-4"
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{
              duration: 5,
              ease: 'linear',
              repeat: Infinity,
            }}
            style={{
              backgroundSize: '200% 200%',
            }}
          >
            404
          </motion.h1>

          <motion.h2
            className="text-3xl md:text-4xl font-light text-neutral-900 mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Page Not Found
          </motion.h2>

          <motion.p
            className="text-lg text-neutral-600 mb-8 max-w-md mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            The page you're looking for doesn't exist or has been moved.
            Let's get you back on track.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Button
              onClick={() => navigate('/')}
              className="gap-2"
            >
              <Home size={20} />
              Back to Home
            </Button>

            <Button
              onClick={() => navigate('/shop')}
              variant="outline"
              className="gap-2"
            >
              <ShoppingBag size={20} />
              Continue Shopping
            </Button>
          </motion.div>

          <motion.div
            className="mt-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-2 text-neutral-600 hover:text-amber-600 transition-colors"
            >
              <ArrowLeft size={20} />
              Go back to previous page
            </button>
          </motion.div>
        </motion.div>

        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.03 }}
          transition={{ delay: 0.6 }}
        >
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-amber-500 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-amber-400 rounded-full blur-3xl" />
        </motion.div>
      </div>
    </div>
  );
}
