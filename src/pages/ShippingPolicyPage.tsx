import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Package, Truck, Globe, Clock, MapPin, AlertCircle, CreditCard } from 'lucide-react';

interface AccordionItem {
  title: string;
  icon?: JSX.Element;
  content: string | JSX.Element;
}

const accordionData: AccordionItem[] = [
  {
    title: 'General Shipping Information',
    icon: <Package size={18} />,
    content: (
      <>
        <p className="mb-4">
          At Inaara Woman, we are committed to delivering your carefully crafted pieces with care and attention to detail. Each order is thoughtfully packaged to ensure your items arrive in perfect condition.
        </p>
        <div className="bg-neutral-50 border border-neutral-200 p-4 rounded-sm mb-4">
          <p className="text-sm font-semibold mb-2">All Inaara Woman deliveries require a signature upon acceptance.</p>
          <p className="text-sm text-neutral-700">
            This ensures your order is safely received and protects both you and us from potential delivery issues.
          </p>
        </div>
        <p className="mb-4">
          We partner with trusted shipping carriers including <strong>DHL</strong> and local courier services to ensure reliable delivery to your doorstep.
        </p>
        <p>
          Each order includes end-to-end tracking so you can monitor your package every step of the way.
        </p>
      </>
    ),
  },
  {
    title: 'Production & Processing Time',
    icon: <Clock size={18} />,
    content: (
      <>
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6">
          <p className="text-sm text-amber-900 font-semibold mb-2">
            Important: Made-to-Order Production
          </p>
          <p className="text-sm text-amber-900">
            Kindly note that orders take <strong>5 working days for production</strong>. This ensures each piece meets our high-quality standards.
          </p>
        </div>
        <p className="mb-4">
          During busy periods such as new launches, sales, or holiday seasons, production may take up to <strong>10 extra business days</strong>. We're working as fast as possible to get your order out to you.
        </p>
        <p className="text-sm text-neutral-600 italic">
          Production time is separate from shipping time and is not included in the delivery estimates below.
        </p>
      </>
    ),
  },
  {
    title: 'Shipping Times by Location',
    icon: <Truck size={18} />,
    content: (
      <>
        <p className="mb-4">
          After your order completes production (5 working days), shipping times vary based on your location:
        </p>
        <div className="space-y-3 mb-6">
          <div className="flex items-start gap-3 bg-white border border-neutral-200 p-4 rounded-sm">
            <MapPin size={18} className="flex-shrink-0 text-neutral-600 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-xs uppercase tracking-wide text-neutral-900 mb-1">
                Lagos Shipping
              </p>
              <p className="text-sm text-neutral-700">
                1-2 working days
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 bg-white border border-neutral-200 p-4 rounded-sm">
            <MapPin size={18} className="flex-shrink-0 text-neutral-600 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-xs uppercase tracking-wide text-neutral-900 mb-1">
                Interstate Shipping (Nigeria)
              </p>
              <p className="text-sm text-neutral-700">
                3-5 working days via DHL
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 bg-white border border-neutral-200 p-4 rounded-sm">
            <Globe size={18} className="flex-shrink-0 text-neutral-600 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-xs uppercase tracking-wide text-neutral-900 mb-1">
                International Shipping
              </p>
              <p className="text-sm text-neutral-700">
                7-9 working days via DHL
              </p>
            </div>
          </div>
        </div>
        <div className="bg-neutral-50 border border-neutral-200 p-4 rounded-sm">
          <p className="text-xs text-neutral-700">
            <strong>Example:</strong> If you place an order on Monday, production will be complete by the following Monday (5 working days). Lagos orders would then arrive by Wednesday, interstate by the following Monday, and international orders within 7-9 days after production.
          </p>
        </div>
      </>
    ),
  },
  {
    title: 'Shipping Costs',
    icon: <CreditCard size={18} />,
    content: (
      <>
        <p className="mb-4">
          Shipping costs depend on your location and will be calculated automatically at checkout based on your delivery address.
        </p>
        <div className="bg-neutral-50 border border-neutral-200 p-4 rounded-sm mb-4">
          <p className="text-sm font-semibold text-neutral-900 mb-2">
            How It Works:
          </p>
          <ul className="text-sm text-neutral-700 space-y-1">
            <li>• Enter your shipping address at checkout</li>
            <li>• Select your preferred shipping method (if multiple options available)</li>
            <li>• View the exact shipping cost before completing your purchase</li>
            <li>• Review your total including shipping before finalizing payment</li>
          </ul>
        </div>
        <p className="text-sm text-neutral-700">
          This ensures complete transparency—you'll always know the exact shipping cost before you pay.
        </p>
      </>
    ),
  },
  {
    title: 'Tracking Your Order',
    icon: <Package size={18} />,
    content: (
      <>
        <p className="mb-4">
          Once your order is dispatched, you will receive a confirmation email with:
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li>Tracking number</li>
          <li>Carrier information (DHL or local courier)</li>
          <li>Estimated delivery date</li>
          <li>Direct link to track your package</li>
        </ul>
        <div className="bg-neutral-50 border border-neutral-200 p-4 rounded-sm mb-4">
          <p className="text-sm text-neutral-900 font-semibold mb-2">
            Track Your Package:
          </p>
          <p className="text-sm text-neutral-700">
            You can track your order in real-time using the tracking link provided in your dispatch email. This allows you to see exactly where your package is at any given moment.
          </p>
        </div>
        <p className="text-sm text-neutral-700">
          If you haven't received tracking information within 2 business days after your production period ends, please contact us at{' '}
          <a href="mailto:info@inaarawoman.com" className="text-neutral-900 underline hover:text-neutral-600 font-medium">
            info@inaarawoman.com
          </a>
        </p>
      </>
    ),
  },
  {
    title: 'Customs, Duties & Import Taxes',
    icon: <Globe size={18} />,
    content: (
      <>
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6">
          <p className="text-sm text-amber-900 font-semibold mb-2">
            Important Notice for International Orders
          </p>
          <p className="text-sm text-amber-900">
            Inaara Woman is not responsible for custom duties, import taxes, or additional fees imposed by the destination country.
          </p>
        </div>

        <h4 className="text-sm font-semibold text-neutral-900 uppercase tracking-wide mb-3 mt-6">
          What This Means:
        </h4>

        <p className="mb-4">
          When you order internationally, your country may charge customs duties, import taxes, or other fees. These charges:
        </p>

        <ul className="list-disc pl-6 mb-6 space-y-2">
          <li>Are determined by your country's customs agency</li>
          <li>Vary from country to country</li>
          <li>Are collected at the time of delivery or clearance</li>
          <li>Are <strong>not included</strong> in your order total at checkout</li>
          <li>Must be paid by you (the customer) to receive your order</li>
        </ul>

        <div className="bg-white border border-neutral-200 p-4 rounded-sm mb-6">
          <p className="text-sm font-semibold text-neutral-900 mb-2">
            United States Deliveries
          </p>
          <p className="text-sm text-neutral-700">
            Kindly note that deliveries to the United States may be subject to additional customs duties, import taxes, or fees as determined by U.S. Customs and Border Protection. These charges are not covered by Inaara Woman and are the responsibility of the customer.
          </p>
        </div>

        <div className="bg-neutral-50 border border-neutral-200 p-4 rounded-sm">
          <p className="text-sm font-semibold text-neutral-900 mb-2">
            How to Estimate Customs Fees:
          </p>
          <p className="text-sm text-neutral-700">
            To calculate potential customs fees, we recommend contacting your local customs office or checking your country's customs website before placing your order. Unfortunately, we cannot estimate these fees as they vary significantly by country and product value.
          </p>
        </div>
      </>
    ),
  },
  {
    title: 'Delivery Issues & Carrier Liability',
    icon: <AlertCircle size={18} />,
    content: (
      <>
        <p className="mb-4">
          Once tracking details are provided and your package is in transit, Inaara Woman is not liable for:
        </p>

        <ul className="list-disc pl-6 mb-6 space-y-2">
          <li>Delays caused by the shipping carrier</li>
          <li>Lost packages after successful carrier handoff</li>
          <li>Stolen packages from your delivery location</li>
          <li>Customs clearance delays</li>
          <li>Weather-related delivery disruptions</li>
          <li>Incorrect address information provided by customer</li>
        </ul>

        <div className="bg-neutral-50 border border-neutral-200 p-4 rounded-sm mb-6">
          <p className="text-sm font-semibold text-neutral-900 mb-2">
            We're Here to Help:
          </p>
          <p className="text-sm text-neutral-700">
            While we cannot be held responsible for carrier issues, we can and will assist you in contacting the courier service to resolve any delivery problems. Our team is committed to helping you track down your order.
          </p>
        </div>

        <h4 className="text-sm font-semibold text-neutral-900 uppercase tracking-wide mb-3 mt-6">
          If Your Package Is Lost or Delayed:
        </h4>

        <ol className="list-decimal pl-6 mb-4 space-y-2">
          <li>Wait 2-3 extra business days beyond the estimated delivery date</li>
          <li>Check your tracking information for updates</li>
          <li>Contact us at <a href="mailto:info@inaarawoman.com" className="text-neutral-900 underline hover:text-neutral-600 font-medium">info@inaarawoman.com</a> with your order number</li>
          <li>We'll immediately contact the carrier on your behalf</li>
          <li>We'll work with you to find a resolution</li>
        </ol>

        <p className="text-sm text-neutral-700">
          Please note that delays by our shipping partners (DHL and local couriers) are out of our control. If your order has not arrived within 14 business days after the estimated delivery date, please email us immediately.
        </p>
      </>
    ),
  },
  {
    title: 'Refused Deliveries',
    icon: <AlertCircle size={18} />,
    content: (
      <>
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <p className="text-sm text-red-900 font-semibold mb-2">
            Important: Return Charges Apply
          </p>
          <p className="text-sm text-red-900">
            If a delivery is refused by the customer, return charges apply, and store credit will be issued minus the return and original shipping fees.
          </p>
        </div>

        <h4 className="text-sm font-semibold text-neutral-900 uppercase tracking-wide mb-3">
          What Happens When You Refuse Delivery:
        </h4>

        <ol className="list-decimal pl-6 mb-6 space-y-3">
          <li>
            <strong>Return Shipping Fees:</strong> You will be charged the cost of shipping the package back to us (charged by the carrier)
          </li>
          <li>
            <strong>Original Shipping Fees:</strong> Your original shipping cost is non-refundable
          </li>
          <li>
            <strong>Store Credit Only:</strong> A refund will not be issued to your original payment method. You will receive store credit for the product value minus all shipping costs
          </li>
          <li>
            <strong>Customs Refusals:</strong> We will not provide refunds on orders sent back due to customs issues or fees
          </li>
        </ol>

        <div className="bg-neutral-50 border border-neutral-200 p-4 rounded-sm mb-4">
          <p className="text-sm font-semibold text-neutral-900 mb-2">
            Please Do Not Refuse Delivery Due to Customs Fees
          </p>
          <p className="text-sm text-neutral-700">
            If you refuse a delivery because of customs fees, duties, or taxes, you will be responsible for all return shipping costs. These fees are determined by your country and are the customer's responsibility as stated in our shipping policy.
          </p>
        </div>

        <p className="text-sm text-neutral-700">
          By placing an order with Inaara Woman, you acknowledge and agree to accept responsibility for any customs duties or import taxes that may apply to your order.
        </p>
      </>
    ),
  },
  {
    title: 'Address Changes & Cancellations',
    icon: <MapPin size={18} />,
    content: (
      <>
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6">
          <p className="text-sm text-amber-900 font-semibold mb-2">
            Once Production Begins, Changes Cannot Be Accommodated
          </p>
          <p className="text-sm text-amber-900">
            Due to our made-to-order production process, once an order is confirmed and production begins, we are unable to accommodate changes such as size, color, or address adjustments.
          </p>
        </div>

        <h4 className="text-sm font-semibold text-neutral-900 uppercase tracking-wide mb-3">
          Before You Complete Your Order:
        </h4>

        <ul className="list-disc pl-6 mb-6 space-y-2">
          <li>Double-check your shipping address for accuracy</li>
          <li>Verify your selected size and color</li>
          <li>Ensure your contact information is correct</li>
          <li>Confirm your payment details</li>
        </ul>

        <div className="bg-white border border-neutral-200 p-4 rounded-sm mb-4">
          <p className="text-sm font-semibold text-neutral-900 mb-2">
            International Customers:
          </p>
          <p className="text-sm text-neutral-700">
            If you are placing an international order, please ensure that you've filled in your proper address, including postal code, city, and country. Incorrect addresses can result in delivery failures and additional charges.
          </p>
        </div>

        <h4 className="text-sm font-semibold text-neutral-900 uppercase tracking-wide mb-3 mt-6">
          Order Cancellations:
        </h4>

        <p className="mb-4">
          Once an order has been shipped and is in transit, the order can no longer be cancelled. If you need to cancel, you must contact us immediately at{' '}
          <a href="mailto:info@inaarawoman.com" className="text-neutral-900 underline hover:text-neutral-600 font-medium">
            info@inaarawoman.com
          </a>{' '}
          within <strong>1 hour</strong> of placing your order, before production begins.
        </p>

        <p className="text-sm text-neutral-700">
          Shipping costs are non-refundable, even if an order is cancelled before shipment.
        </p>
      </>
    ),
  },
  {
    title: 'Packaging & Presentation',
    icon: <Package size={18} />,
    content: (
      <>
        <p className="mb-4">
          Every Inaara Woman order is thoughtfully packaged to reflect the luxury and care that goes into creating each piece.
        </p>

        <h4 className="text-sm font-semibold text-neutral-900 uppercase tracking-wide mb-3">
          What to Expect:
        </h4>

        <ul className="list-disc pl-6 mb-6 space-y-2">
          <li>Premium packaging materials to protect your items during transit</li>
          <li>Secure outer packaging to ensure your order stays safe</li>
          <li>Careful folding and presentation of each garment</li>
          <li>All necessary tags and care labels intact</li>
        </ul>

        <div className="bg-neutral-50 border border-neutral-200 p-4 rounded-sm">
          <p className="text-sm text-neutral-700">
            We take pride in ensuring that your unboxing experience is as special as wearing our pieces. If there are any issues with your packaging or if items arrive damaged, please contact us immediately with photos within the timeframes specified in our Returns Policy.
          </p>
        </div>
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
        <div className="flex items-center gap-3">
          {item.icon && (
            <div className="flex-shrink-0 text-neutral-600">
              {item.icon}
            </div>
          )}
          <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider pr-4">
            {item.title}
          </h3>
        </div>
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

export default function ShippingPolicyPage() {
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
            Shipping Policy
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-xs text-neutral-600 uppercase tracking-wider"
          >
            Delivering luxury to your doorstep
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
            We ship worldwide with care and precision. Please review our shipping policies below to understand delivery times, costs, and your responsibilities as a customer.
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

        {/* Agreement Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 bg-neutral-50 border border-neutral-200 p-8 rounded-sm"
        >
          <p className="text-sm text-neutral-700 leading-relaxed mb-4 text-center">
            <strong>By shopping with us, you acknowledge and agree to these shipping policies.</strong>
          </p>
          <p className="text-sm text-neutral-700 text-center">
            For further assistance or questions about shipping, please contact us at{' '}
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
