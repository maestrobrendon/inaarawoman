import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Check, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      setStatus('error');
      setMessage('Please enter a valid email address');
      return;
    }

    setStatus('loading');

    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert([{ email, subscribed_at: new Date().toISOString() }]);

      if (error) {
        if (error.code === '23505') {
          setStatus('error');
          setMessage('This email is already subscribed');
        } else {
          throw error;
        }
      } else {
        setStatus('success');
        setMessage('Thank you for subscribing!');
        setEmail('');

        setTimeout(() => {
          setStatus('idle');
          setMessage('');
        }, 5000);
      }
    } catch (error) {
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
    }
  };

  return (
    <section className="relative py-20 overflow-hidden bg-gradient-to-br from-neutral-50 to-amber-50/30">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(251,191,36,0.1),transparent_50%)]" />

      <div className="relative max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-light text-neutral-900 mb-4">
            Join Our Community
          </h2>
          <p className="text-lg text-neutral-600 mb-8 max-w-2xl mx-auto">
            Subscribe to receive exclusive updates, early access to new collections, and special offers.
          </p>

          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="relative">
              <motion.div
                className="relative"
                animate={status === 'error' ? {
                  x: [0, -10, 10, -10, 10, 0],
                } : {}}
                transition={{ duration: 0.5 }}
              >
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full pl-12 pr-32 py-4 rounded-full border-2 border-neutral-200
                           focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20
                           transition-all outline-none bg-white shadow-sm
                           disabled:bg-neutral-100 disabled:cursor-not-allowed"
                  disabled={status === 'loading' || status === 'success'}
                />
                <motion.button
                  type="submit"
                  disabled={status === 'loading' || status === 'success'}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2.5
                           bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-full
                           hover:from-amber-600 hover:to-amber-700 transition-all
                           disabled:opacity-50 disabled:cursor-not-allowed
                           flex items-center gap-2 font-medium"
                  whileHover={{ scale: status === 'idle' ? 1.05 : 1 }}
                  whileTap={{ scale: status === 'idle' ? 0.95 : 1 }}
                >
                  {status === 'loading' && <Loader2 size={16} className="animate-spin" />}
                  {status === 'success' && <Check size={16} />}
                  {status === 'loading' ? 'Joining...' : status === 'success' ? 'Joined!' : 'Subscribe'}
                </motion.button>
              </motion.div>

              <AnimatePresence mode="wait">
                {message && (
                  <motion.p
                    key={status}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`mt-3 text-sm ${
                      status === 'error' ? 'text-red-600' : 'text-green-600'
                    }`}
                  >
                    {message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </form>

          {status === 'success' && (
            <motion.div
              className="fixed inset-0 pointer-events-none z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-amber-400 rounded-full"
                  style={{
                    left: '50%',
                    top: '50%',
                  }}
                  initial={{ scale: 0, x: 0, y: 0 }}
                  animate={{
                    scale: [0, 1, 0],
                    x: Math.cos((i / 20) * Math.PI * 2) * 200,
                    y: Math.sin((i / 20) * Math.PI * 2) * 200,
                  }}
                  transition={{
                    duration: 1.5,
                    ease: 'easeOut',
                  }}
                />
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
