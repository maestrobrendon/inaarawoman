import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface AccordionItem {
  title: string;
  content: string | JSX.Element;
}

const accordionData: AccordionItem[] = [
  {
    title: 'Introduction',
    content: (
      <>
        <p className="mb-4">
          Welcome to Inaara Woman Fashion. We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website www.inaarawoman.com or make a purchase from us.
        </p>
        <p className="mb-4">
          By using our website, you consent to the data practices described in this policy. If you do not agree with the terms of this Privacy Policy, please do not access or use our website.
        </p>
        <p>
          We reserve the right to make changes to this Privacy Policy at any time. We will notify you of any changes by updating the "Last Updated" date at the top of this policy.
        </p>
      </>
    ),
  },
  {
    title: 'Information We Collect',
    content: (
      <>
        <p className="mb-4">
          We collect information that you provide directly to us when you:
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li>Create an account on our website</li>
          <li>Place an order or make a purchase</li>
          <li>Subscribe to our newsletter or marketing communications</li>
          <li>Contact our customer service team</li>
          <li>Participate in surveys, contests, or promotions</li>
          <li>Leave reviews or feedback</li>
        </ul>
        <p className="mb-4">
          The personal information we may collect includes:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Contact Information:</strong> Name, email address, phone number, shipping and billing addresses</li>
          <li><strong>Account Information:</strong> Username, password, and preferences</li>
          <li><strong>Payment Information:</strong> Credit card details, billing information (processed securely through our payment providers)</li>
          <li><strong>Transaction Information:</strong> Details about purchases, order history, and returns</li>
          <li><strong>Communication Information:</strong> Your correspondence with us, including customer service inquiries</li>
        </ul>
      </>
    ),
  },
  {
    title: 'How We Use Your Information',
    content: (
      <>
        <p className="mb-4">
          We use the information we collect for the following purposes:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Order Processing:</strong> To process and fulfill your orders, including payment processing, shipping, and delivery</li>
          <li><strong>Customer Service:</strong> To respond to your inquiries, provide support, and resolve any issues</li>
          <li><strong>Account Management:</strong> To create and manage your account, including authentication and security</li>
          <li><strong>Marketing Communications:</strong> To send you newsletters, promotional offers, and updates about new collections (you can opt-out at any time)</li>
          <li><strong>Personalization:</strong> To personalize your shopping experience and show you relevant products</li>
          <li><strong>Analytics:</strong> To analyze website usage, improve our services, and enhance user experience</li>
          <li><strong>Legal Compliance:</strong> To comply with legal obligations, resolve disputes, and enforce our policies</li>
          <li><strong>Fraud Prevention:</strong> To detect and prevent fraudulent transactions and protect against security threats</li>
        </ul>
      </>
    ),
  },
  {
    title: 'Cookies and Tracking Technologies',
    content: (
      <>
        <p className="mb-4">
          We use cookies and similar tracking technologies to enhance your browsing experience and collect information about how you use our website.
        </p>
        <p className="mb-4">
          <strong>What are cookies?</strong> Cookies are small text files stored on your device that help us remember your preferences and understand how you interact with our website.
        </p>
        <p className="mb-4">
          <strong>Types of cookies we use:</strong>
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li><strong>Essential Cookies:</strong> Necessary for the website to function properly, including shopping cart functionality and secure checkout</li>
          <li><strong>Performance Cookies:</strong> Help us understand how visitors use our website through analytics, allowing us to improve performance</li>
          <li><strong>Functional Cookies:</strong> Remember your preferences and personalize your experience</li>
          <li><strong>Marketing Cookies:</strong> Used to deliver relevant advertisements and track campaign effectiveness</li>
        </ul>
        <p className="mb-4">
          You can control cookies through your browser settings. However, disabling cookies may limit your ability to use certain features of our website.
        </p>
        <p>
          We use Google Analytics and other analytics services to collect aggregate data about website traffic and user behavior. This helps us improve our website and services.
        </p>
      </>
    ),
  },
  {
    title: 'Payment Processing',
    content: (
      <>
        <p className="mb-4">
          We use secure third-party payment processors to handle all financial transactions:
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li><strong>Paystack:</strong> For local and international card payments</li>
          <li><strong>PayPal:</strong> For secure PayPal transactions</li>
          <li><strong>Credit Card Processing:</strong> All card information is encrypted and processed securely</li>
        </ul>
        <p className="mb-4">
          We do not store your complete credit card information on our servers. Payment data is encrypted and transmitted directly to our payment processors using industry-standard SSL technology.
        </p>
        <p>
          Our payment processors comply with PCI-DSS (Payment Card Industry Data Security Standard) requirements to ensure the secure handling of your payment information.
        </p>
      </>
    ),
  },
  {
    title: 'Data Security',
    content: (
      <>
        <p className="mb-4">
          We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
        </p>
        <p className="mb-4">
          <strong>Our security measures include:</strong>
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li>SSL encryption for data transmission</li>
          <li>Secure hosting infrastructure</li>
          <li>Regular security audits and updates</li>
          <li>Access controls and authentication protocols</li>
          <li>Staff training on data protection</li>
        </ul>
        <p>
          While we strive to protect your personal information, no method of transmission over the internet or electronic storage is 100% secure. We cannot guarantee absolute security but are committed to protecting your data using industry best practices.
        </p>
      </>
    ),
  },
  {
    title: 'Third-Party Services',
    content: (
      <>
        <p className="mb-4">
          We do not sell, trade, or transfer your personal information to third parties. However, we may share your information with trusted service providers who assist us in operating our website and conducting our business, provided they agree to keep your information confidential.
        </p>
        <p className="mb-4">
          <strong>Service providers we work with include:</strong>
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li><strong>Payment Processors:</strong> Paystack and PayPal for secure payment processing</li>
          <li><strong>Shipping Partners:</strong> Courier services for order delivery</li>
          <li><strong>Email Service Providers:</strong> For sending newsletters and transactional emails</li>
          <li><strong>Analytics Providers:</strong> Google Analytics for website performance analysis</li>
          <li><strong>Hosting Services:</strong> Cloud infrastructure providers for website hosting</li>
        </ul>
        <p>
          These third parties are contractually obligated to use your information only as necessary to provide these services to us and to protect your information consistent with this Privacy Policy.
        </p>
      </>
    ),
  },
  {
    title: 'Your Rights and Choices',
    content: (
      <>
        <p className="mb-4">
          You have the following rights regarding your personal information:
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li><strong>Access:</strong> Request access to the personal information we hold about you</li>
          <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
          <li><strong>Deletion:</strong> Request deletion of your personal information (subject to legal obligations)</li>
          <li><strong>Opt-Out:</strong> Unsubscribe from marketing communications at any time</li>
          <li><strong>Data Portability:</strong> Request a copy of your data in a structured, machine-readable format</li>
          <li><strong>Restriction:</strong> Request restriction of processing in certain circumstances</li>
        </ul>
        <p className="mb-4">
          <strong>To exercise your rights:</strong>
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li>Email us at <a href="mailto:info@inaarawoman.com" className="text-neutral-900 underline hover:text-neutral-600">info@inaarawoman.com</a></li>
          <li>Log into your account to update your information</li>
          <li>Click "unsubscribe" in any marketing email</li>
        </ul>
        <p>
          We will respond to your request within 30 days. Please note that we may need to verify your identity before processing certain requests.
        </p>
      </>
    ),
  },
  {
    title: 'International Data Transfers',
    content: (
      <>
        <p className="mb-4">
          Inaara Woman Fashion operates internationally, serving customers both locally in Nigeria and worldwide. Your personal information may be transferred to, stored, and processed in different countries where our service providers operate.
        </p>
        <p className="mb-4">
          When we transfer your information internationally, we ensure appropriate safeguards are in place to protect your data in accordance with this Privacy Policy and applicable data protection laws.
        </p>
        <p>
          By using our services and providing your information, you consent to the transfer of your information to countries outside your country of residence, which may have different data protection laws.
        </p>
      </>
    ),
  },
  {
    title: 'Children\'s Privacy',
    content: (
      <>
        <p className="mb-4">
          Our website and services are not directed to individuals under the age of 18. We do not knowingly collect personal information from children.
        </p>
        <p>
          If you are a parent or guardian and believe your child has provided us with personal information, please contact us at <a href="mailto:info@inaarawoman.com" className="text-neutral-900 underline hover:text-neutral-600">info@inaarawoman.com</a>, and we will promptly delete such information from our records.
        </p>
      </>
    ),
  },
  {
    title: 'Changes to This Privacy Policy',
    content: (
      <>
        <p className="mb-4">
          We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or for other operational reasons.
        </p>
        <p className="mb-4">
          When we make changes, we will:
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li>Update the "Last Updated" date at the top of this policy</li>
          <li>Notify you via email if the changes are significant</li>
          <li>Post a notice on our website homepage</li>
        </ul>
        <p>
          We encourage you to review this Privacy Policy periodically to stay informed about how we are protecting your information.
        </p>
      </>
    ),
  },
  {
    title: 'Contact Us',
    content: (
      <>
        <p className="mb-4">
          If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
        </p>
        <div className="bg-neutral-50 border border-neutral-200 p-6 rounded-sm">
          <p className="mb-2"><strong>Inaara Woman Fashion</strong></p>
          <p className="mb-2">Email: <a href="mailto:info@inaarawoman.com" className="text-neutral-900 underline hover:text-neutral-600">info@inaarawoman.com</a></p>
          <p className="mb-2">Website: <a href="https://www.inaarawoman.com" className="text-neutral-900 underline hover:text-neutral-600">www.inaarawoman.com</a></p>
        </div>
        <p className="mt-4">
          We are committed to resolving any privacy concerns you may have and will respond to your inquiry within 5 business days.
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

export default function PrivacyPolicyPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-white py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-serif text-3xl md:text-4xl font-light text-neutral-900 tracking-wide uppercase mb-4"
          >
            Privacy Policy
          </motion.h1>
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
            At Inaara Woman Fashion, your privacy is of utmost importance to us. This policy outlines how we collect, use, and protect your personal information.
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

        {/* Footer Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 text-center"
        >
          <p className="text-xs text-neutral-500">
            This Privacy Policy is effective as of the date stated above and will remain in effect except with respect to any changes in its provisions in the future.
          </p>
        </motion.div>
      </div>
    </div>
  );
}