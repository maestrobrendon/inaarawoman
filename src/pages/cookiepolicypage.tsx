import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Cookie } from 'lucide-react';

interface AccordionItem {
  title: string;
  content: string | JSX.Element;
}

const accordionData: AccordionItem[] = [
  {
    title: 'What Are Cookies?',
    content: (
      <>
        <p className="mb-4">
          Cookies are small text files that are stored on your device (computer, tablet, or mobile phone) when you visit a website. They help websites remember your preferences and improve your browsing experience.
        </p>
        <p className="mb-4">
          Think of cookies like a bookmark—they help the website remember who you are and what you like, so you don't have to start from scratch every time you visit.
        </p>
        <p>
          Cookies are safe and cannot harm your device. They don't contain viruses or malware.
        </p>
      </>
    ),
  },
  {
    title: 'How We Use Cookies',
    content: (
      <>
        <p className="mb-4">
          At Inaara Woman, we use cookies to provide you with a better shopping experience. Here's what we use them for:
        </p>
        <div className="space-y-4">
          <div className="bg-white border border-neutral-200 p-4 rounded-sm">
            <h4 className="text-xs font-semibold text-neutral-900 uppercase tracking-wide mb-2">
              Essential Cookies (Required)
            </h4>
            <p className="text-sm text-neutral-700">
              These cookies are necessary for the website to function properly. They enable core features like:
            </p>
            <ul className="list-disc pl-6 mt-2 text-sm text-neutral-700 space-y-1">
              <li>Shopping cart functionality</li>
              <li>Secure login to your account</li>
              <li>Processing your orders</li>
              <li>Remembering your preferences</li>
            </ul>
            <p className="text-xs text-neutral-600 mt-2 italic">
              *These cookies cannot be disabled as they are essential for the website to work.
            </p>
          </div>

          <div className="bg-white border border-neutral-200 p-4 rounded-sm">
            <h4 className="text-xs font-semibold text-neutral-900 uppercase tracking-wide mb-2">
              Analytics Cookies
            </h4>
            <p className="text-sm text-neutral-700">
              We use analytics tools like Google Analytics to understand how visitors use our website. This helps us:
            </p>
            <ul className="list-disc pl-6 mt-2 text-sm text-neutral-700 space-y-1">
              <li>Improve website performance</li>
              <li>Understand which pages are most popular</li>
              <li>Identify and fix technical issues</li>
              <li>Enhance your shopping experience</li>
            </ul>
            <p className="text-xs text-neutral-600 mt-2">
              These cookies collect anonymous information and do not identify you personally.
            </p>
          </div>

          <div className="bg-white border border-neutral-200 p-4 rounded-sm">
            <h4 className="text-xs font-semibold text-neutral-900 uppercase tracking-wide mb-2">
              Marketing Cookies
            </h4>
            <p className="text-sm text-neutral-700">
              These cookies help us show you relevant content and advertisements. They:
            </p>
            <ul className="list-disc pl-6 mt-2 text-sm text-neutral-700 space-y-1">
              <li>Remember products you've viewed</li>
              <li>Show you personalized recommendations</li>
              <li>Track the effectiveness of our marketing campaigns</li>
            </ul>
          </div>
        </div>
      </>
    ),
  },
  {
    title: 'Types of Cookies We Use',
    content: (
      <>
        <div className="space-y-4">
          <div>
            <h4 className="text-xs font-semibold text-neutral-900 uppercase tracking-wide mb-2">
              Session Cookies
            </h4>
            <p className="text-sm text-neutral-700">
              These are temporary cookies that expire when you close your browser. They help maintain your shopping cart and keep you logged in while browsing.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-neutral-900 uppercase tracking-wide mb-2">
              Persistent Cookies
            </h4>
            <p className="text-sm text-neutral-700">
              These cookies stay on your device for a set period (or until you delete them). They remember your preferences and settings for future visits, so you don't have to re-enter information.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-neutral-900 uppercase tracking-wide mb-2">
              Third-Party Cookies
            </h4>
            <p className="text-sm text-neutral-700 mb-2">
              Some cookies are set by third-party services we use to enhance your experience:
            </p>
            <ul className="list-disc pl-6 text-sm text-neutral-700 space-y-1">
              <li><strong>Google Analytics</strong> - Website traffic analysis</li>
              <li><strong>Payment Processors</strong> (Paystack, PayPal) - Secure checkout</li>
              <li><strong>Social Media</strong> - Sharing and engagement features</li>
            </ul>
          </div>
        </div>
      </>
    ),
  },
  {
    title: 'Managing Your Cookie Preferences',
    content: (
      <>
        <p className="mb-4">
          You have control over how cookies are used on your device. Here's how to manage them:
        </p>

        <div className="bg-neutral-50 border border-neutral-200 p-4 rounded-sm mb-6">
          <h4 className="text-xs font-semibold text-neutral-900 uppercase tracking-wide mb-3">
            Browser Settings
          </h4>
          <p className="text-sm text-neutral-700 mb-3">
            Most web browsers allow you to control cookies through their settings. You can:
          </p>
          <ul className="list-disc pl-6 text-sm text-neutral-700 space-y-1">
            <li>Block all cookies</li>
            <li>Delete existing cookies</li>
            <li>Allow cookies only from specific websites</li>
            <li>Set preferences for third-party cookies</li>
          </ul>
        </div>

        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6">
          <p className="text-sm text-amber-900 font-semibold mb-2">
            Important Note:
          </p>
          <p className="text-sm text-amber-900">
            If you disable all cookies, some features of our website may not work properly. You may not be able to add items to your cart, proceed to checkout, or use other essential shopping features.
          </p>
        </div>

        <h4 className="text-xs font-semibold text-neutral-900 uppercase tracking-wide mb-3">
          How to Delete Cookies in Popular Browsers:
        </h4>

        <div className="space-y-2">
          <div className="flex items-start gap-3 text-sm">
            <span className="font-semibold text-neutral-900 w-24">Chrome:</span>
            <span className="text-neutral-700">Settings → Privacy and Security → Clear Browsing Data</span>
          </div>
          <div className="flex items-start gap-3 text-sm">
            <span className="font-semibold text-neutral-900 w-24">Safari:</span>
            <span className="text-neutral-700">Preferences → Privacy → Manage Website Data</span>
          </div>
          <div className="flex items-start gap-3 text-sm">
            <span className="font-semibold text-neutral-900 w-24">Firefox:</span>
            <span className="text-neutral-700">Options → Privacy & Security → Cookies and Site Data</span>
          </div>
          <div className="flex items-start gap-3 text-sm">
            <span className="font-semibold text-neutral-900 w-24">Edge:</span>
            <span className="text-neutral-700">Settings → Privacy & Security → Clear Browsing Data</span>
          </div>
        </div>
      </>
    ),
  },
  {
    title: 'Your Privacy Rights',
    content: (
      <>
        <p className="mb-4">
          We respect your privacy and are committed to protecting your personal information. Our use of cookies is designed to enhance your experience while keeping your data secure.
        </p>
        <p className="mb-4">
          <strong>What We Don't Do:</strong>
        </p>
        <ul className="list-disc pl-6 mb-6 space-y-2">
          <li>We don't sell your personal information to third parties</li>
          <li>We don't use cookies to store sensitive data like passwords or payment information</li>
          <li>We don't track you across other websites without your consent</li>
        </ul>
        <div className="bg-neutral-50 border border-neutral-200 p-4 rounded-sm">
          <p className="text-sm text-neutral-700">
            For more detailed information about how we collect, use, and protect your data, please read our{' '}
            <a href="/privacy-policy" className="text-neutral-900 underline hover:text-neutral-600 font-medium">
              Privacy Policy
            </a>.
          </p>
        </div>
      </>
    ),
  },
  {
    title: 'Updates to This Policy',
    content: (
      <>
        <p className="mb-4">
          We may update this Cookie Policy from time to time to reflect changes in technology, legal requirements, or our business practices.
        </p>
        <p className="mb-4">
          When we make changes, we will:
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li>Update the "Last Updated" date at the top of this page</li>
          <li>Notify you of any significant changes via email or website notice</li>
        </ul>
        <p>
          We encourage you to review this Cookie Policy periodically to stay informed about how we use cookies.
        </p>
      </>
    ),
  },
  {
    title: 'Contact Us',
    content: (
      <>
        <p className="mb-4">
          If you have any questions about our use of cookies or this Cookie Policy, please don't hesitate to contact us:
        </p>
        <div className="bg-neutral-50 border border-neutral-200 p-6 rounded-sm">
          <p className="mb-2"><strong>Inaara Woman Fashion</strong></p>
          <p className="mb-2">Email: <a href="mailto:info@inaarawoman.com" className="text-neutral-900 underline hover:text-neutral-600 font-medium">info@inaarawoman.com</a></p>
          <p className="mb-2">Website: <a href="https://www.inaarawoman.com" className="text-neutral-900 underline hover:text-neutral-600 font-medium">www.inaarawoman.com</a></p>
        </div>
        <p className="mt-4 text-sm text-neutral-700">
          We're here to help and will respond to your inquiry within 5 business days.
        </p>
      </>
    ),
  },
];

function AccordionSection({ item, isOpen, onClick }: { item: AccordionItem; isOpen: boolean; onClick: () => void }) {
  return (
    <div className="border-b border-neutral-200 last:border-0">
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between py-5 px-6 text-left hover:bg-neutral-50 transition-colors"
      >
        <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider pr-4">
          {item.title}
        </h3>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="flex-shrink-0"
        >
          <ChevronDown size={20} className="text-neutral-600" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 text-sm text-neutral-700 leading-relaxed">
              {item.content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function CookiePolicyPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-white py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-center gap-3 mb-4"
          >
            <Cookie size={32} className="text-neutral-900" />
            <h1 className="font-serif text-3xl md:text-4xl font-light text-neutral-900 tracking-wide uppercase">
              Cookie Policy
            </h1>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-xs text-neutral-600 uppercase tracking-wider"
          >
            Last Updated: October 31, 2025
          </motion.p>
        </div>

        {/* Introduction Text */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8 text-center max-w-2xl mx-auto"
        >
          <p className="text-sm text-neutral-700 leading-relaxed">
            This Cookie Policy explains what cookies are, how we use them on www.inaarawoman.com, and how you can control them. By using our website, you consent to our use of cookies as described in this policy.
          </p>
        </motion.div>

        {/* Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white border border-neutral-200 rounded-sm overflow-hidden"
        >
          {accordionData.map((item, index) => (
            <AccordionSection
              key={index}
              item={item}
              isOpen={openIndex === index}
              onClick={() => handleToggle(index)}
            />
          ))}
        </motion.div>

        {/* Simple Summary Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 bg-neutral-50 border border-neutral-200 p-8 rounded-sm text-center"
        >
          <Cookie size={24} className="mx-auto mb-3 text-neutral-600" />
          <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wide mb-3">
            In Simple Terms
          </h3>
          <p className="text-sm text-neutral-700 leading-relaxed">
            We use cookies to make your shopping experience better and to understand how you use our website. 
            You can control or delete cookies at any time through your browser settings. 
            If you have questions, just email us at{' '}
            <a
              href="mailto:info@inaarawoman.com"
              className="text-neutral-900 underline hover:text-neutral-600 font-medium transition-colors"
            >
              info@inaarawoman.com
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}