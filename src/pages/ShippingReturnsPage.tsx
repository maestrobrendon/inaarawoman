import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Package, Truck, RefreshCw, AlertCircle, Clock, Globe } from 'lucide-react';

interface AccordionItem {
  title: string;
  icon?: JSX.Element;
  content: string | JSX.Element;
}

const accordionData: AccordionItem[] = [
  {
    title: 'International & Express Shipping',
    icon: <Globe size={18} />,
    content: (
      <>
        <p className="mb-4 font-semibold text-neutral-900">
          Do you offer international and express shipping?
        </p>
        <p className="mb-4">
          <strong>Yes, we ship worldwide!</strong>
        </p>
        <p className="mb-4">
          After your order has completed our processing time of <strong>3-6 weeks</strong>, please allow <strong>1-5 working days</strong> for shipping depending on your location.
        </p>
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-4">
          <p className="text-sm text-amber-900">
            <strong>Important:</strong> Please note that we cannot take responsibility for delays due to customs clearances.
          </p>
        </div>
        <p className="mb-4">
          The prices displayed on our site are tax-free in Nigerian Naira (NGN), which means you may be liable to pay for duties and taxes once you receive your order. Custom duties vary from country to country and are paid by the customer.
        </p>
        <p className="font-medium text-neutral-900">
          Please check your country's customs policies before placing an order. We will not provide refunds on orders sent back due to customs issues.
        </p>
      </>
    ),
  },
  {
    title: 'Can My Order Be Delayed?',
    icon: <Clock size={18} />,
    content: (
      <>
        <p className="mb-4">
          At Inaara Woman, we understand that unforeseeable circumstances can sometimes impact the delivery of your order.
        </p>
        <p className="mb-4">
          While we strive to ensure timely delivery, there are certain factors that are outside our control, such as:
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li>Global events and shipping disruptions</li>
          <li>Logistics and courier delays</li>
          <li>Customs checks and clearance procedures</li>
          <li>Weather conditions or natural disasters</li>
          <li>Peak shopping seasons</li>
        </ul>
        <p className="mb-4">
          Rest assured, if any delay arises, we will keep you informed every step of the way and provide a new estimated delivery date as soon as possible.
        </p>
        <div className="bg-neutral-50 border border-neutral-200 p-4 rounded-sm">
          <p className="text-sm">
            We take pride in our commitment to customer satisfaction, and our team is always available to assist you with any questions or concerns you may have. Please don't hesitate to reach out to us at{' '}
            <a href="mailto:info@inaarawoman.com" className="text-neutral-900 underline hover:text-neutral-600 font-medium">
              info@inaarawoman.com
            </a>{' '}
            for any updates or assistance.
          </p>
        </div>
      </>
    ),
  },
  {
    title: 'Returns, Exchanges & Refunds Policy',
    icon: <RefreshCw size={18} />,
    content: (
      <>
        <p className="mb-6 font-semibold text-neutral-900 text-base">
          Can I exchange or return my order?
        </p>
        
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <p className="text-sm text-red-900 font-semibold">
            No returns, No exchanges. All sales are final.
          </p>
        </div>

        <p className="mb-4">
          Currently all Inaara Woman pieces are on a <strong>made-to-order basis</strong>, and for that reason, we do not offer refunds. We take pride in making sure that all our pieces are quality controlled and inspected before they are sent out to you. We also take images and recordings of each piece to avoid any faulty, damaged, or marked claims.
        </p>

        <p className="mb-6">
          Our commitment to transparency means that every garment listed on our website comes with an extensive, detailed, and unique description. It is crucial that you carefully read the item description before making a purchase.
        </p>

        <div className="bg-neutral-50 border border-neutral-200 p-4 rounded-sm mb-6">
          <p className="text-sm">
            If you have any queries about a particular garment, please feel free to reach out to our customer support team <strong>before placing your order</strong> via email at{' '}
            <a href="mailto:info@inaarawoman.com" className="text-neutral-900 underline hover:text-neutral-600 font-medium">
              info@inaarawoman.com
            </a>
          </p>
        </div>

        <p className="mb-6 text-sm italic text-neutral-600">
          By placing an order, you confirm your agreement with our store policies.
        </p>

        <h4 className="text-sm font-semibold text-neutral-900 uppercase tracking-wide mb-4 mt-8">
          Exceptions for Damaged or Incorrect Items
        </h4>

        <p className="mb-4">
          Returns/Refunds are <strong>only accepted for damaged or incorrect items</strong>. Please report issues within the following timeframes:
        </p>

        <div className="space-y-3 mb-6">
          <div className="flex items-start gap-3 bg-white border border-neutral-200 p-4 rounded-sm">
            <div className="flex-shrink-0 w-32 font-semibold text-xs uppercase tracking-wide text-neutral-900">
              Lagos Orders
            </div>
            <div className="text-sm text-neutral-700">
              24 hours from the time of delivery
            </div>
          </div>
          <div className="flex items-start gap-3 bg-white border border-neutral-200 p-4 rounded-sm">
            <div className="flex-shrink-0 w-32 font-semibold text-xs uppercase tracking-wide text-neutral-900">
              Interstate Orders
            </div>
            <div className="text-sm text-neutral-700">
              48 hours from the time of delivery
            </div>
          </div>
          <div className="flex items-start gap-3 bg-white border border-neutral-200 p-4 rounded-sm">
            <div className="flex-shrink-0 w-32 font-semibold text-xs uppercase tracking-wide text-neutral-900">
              International Orders
            </div>
            <div className="text-sm text-neutral-700">
              96 hours from the time of delivery
            </div>
          </div>
        </div>

        <h4 className="text-sm font-semibold text-neutral-900 uppercase tracking-wide mb-4 mt-8">
          Return Process
        </h4>

        <ol className="list-decimal pl-6 space-y-3 mb-6">
          <li>
            Once your return request is reviewed and approved, we will provide you with instructions on how to send the item back to us.
          </li>
          <li>
            Items must be returned in the same condition as they were sent, with the tag intact and labels in the bag they were sent in. The items must be free of stains, sweat, and must not have been worn or used.
          </li>
          <li>
            Pack the item securely and ship it to the address provided by our customer service team. Please ensure you use a trackable shipping method.
          </li>
          <li>
            Upon receiving the returned item, we will inspect it and, if it meets the criteria, we will process the exchange. You will be notified via email once the replacement has been shipped.
          </li>
        </ol>

        <h4 className="text-sm font-semibold text-neutral-900 uppercase tracking-wide mb-4 mt-8">
          Important Conditions
        </h4>

        <ul className="list-disc pl-6 space-y-2">
          <li>Items that are custom-sized or altered per request are <strong>non-returnable and non-exchangeable</strong>.</li>
          <li>We do not accept color exchanges—ensure the correct color is selected before placing an order.</li>
          <li>If a sizing issue is due to customer error, amendments will be done for a fee, and the customer will cover all delivery costs.</li>
        </ul>
      </>
    ),
  },
  {
    title: 'Processing Time',
    icon: <Clock size={18} />,
    content: (
      <>
        <p className="mb-4">
          Please allow <strong>24-48 hours</strong> for your order to be processed. Processing times are not included in the estimated delivery time at checkout.
        </p>
        <p className="mb-4">
          Certain products could require an additional <strong>1-2 business days</strong>.
        </p>
        <div className="bg-neutral-50 border border-neutral-200 p-4 rounded-sm">
          <p className="text-sm">
            <strong>During sales and high volume periods:</strong> Processing time is 3-4 days.
          </p>
        </div>
      </>
    ),
  },
  {
    title: 'Estimated Delivery Times',
    icon: <Truck size={18} />,
    content: (
      <>
        <p className="mb-4">
          After processing, your order will be shipped according to the following estimated delivery times:
        </p>
        <div className="space-y-3">
          <div className="flex items-start gap-3 bg-white border border-neutral-200 p-4 rounded-sm">
            <div className="flex-shrink-0 w-40 font-semibold text-xs uppercase tracking-wide text-neutral-900">
              U.S. Express Shipping
            </div>
            <div className="text-sm text-neutral-700">
              1 business day
            </div>
          </div>
          <div className="flex items-start gap-3 bg-white border border-neutral-200 p-4 rounded-sm">
            <div className="flex-shrink-0 w-40 font-semibold text-xs uppercase tracking-wide text-neutral-900">
              U.S. Standard Shipping
            </div>
            <div className="text-sm text-neutral-700">
              2-4 business days
            </div>
          </div>
          <div className="flex items-start gap-3 bg-white border border-neutral-200 p-4 rounded-sm">
            <div className="flex-shrink-0 w-40 font-semibold text-xs uppercase tracking-wide text-neutral-900">
              International Shipping
            </div>
            <div className="text-sm text-neutral-700">
              3-5 business days
            </div>
          </div>
        </div>
        <p className="mt-4 text-xs text-neutral-600 italic">
          *Delivery times may vary depending on your location and customs clearance procedures.
        </p>
      </>
    ),
  },
  {
    title: 'Shipping Rates',
    icon: <Package size={18} />,
    content: (
      <>
        <p className="mb-4">
          Shipping rates are <strong>calculated at checkout</strong> and vary depending on your delivery location.
        </p>
        <p className="text-sm text-neutral-700">
          The exact shipping cost will be displayed before you complete your purchase, allowing you to review the total amount including shipping before finalizing your order.
        </p>
      </>
    ),
  },
  {
    title: 'Pre-Order Items',
    icon: <AlertCircle size={18} />,
    content: (
      <>
        <p className="mb-4">
          Items listed as <strong>'PRE-ORDER'</strong> begin processing on the date indicated in the product description and vary between items.
        </p>
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-4">
          <p className="text-sm text-amber-900">
            <strong>Important:</strong> To ensure a smooth and efficient delivery process, please note that any orders containing pre-order items will be fulfilled in two separate shipments.
          </p>
        </div>
        <p className="mb-4">
          Items available for immediate shipment will be sent first.
        </p>
        <div className="bg-neutral-50 border border-neutral-200 p-4 rounded-sm">
          <p className="text-sm font-semibold mb-2">Recommendation:</p>
          <p className="text-sm text-neutral-700">
            To avoid any potential delays or complications, we recommend placing two separate orders: one for in-stock items and one for pre-order items.
          </p>
        </div>
      </>
    ),
  },
  {
    title: 'Dispatch Notification',
    icon: <Truck size={18} />,
    content: (
      <>
        <p className="mb-4">
          You will receive an email notification when your order has been dispatched, including tracking information.
        </p>
        <p className="mb-4">
          If you have not received a dispatch/delivery notification within the specified processing time or dispatch date, please notify us by sending an email to{' '}
          <a href="mailto:info@inaarawoman.com" className="text-neutral-900 underline hover:text-neutral-600 font-medium">
            info@inaarawoman.com
          </a>{' '}
          including your order number.
        </p>
      </>
    ),
  },
  {
    title: 'Item Not Delivered?',
    icon: <AlertCircle size={18} />,
    content: (
      <>
        <p className="mb-4">
          If you have not yet received your order within the estimated delivery time, please allow an extra <strong>2-3 days</strong> before contacting us because packages may have been delayed by the selected courier service.
        </p>
        <p className="mb-4">
          Once items are dispatched, it is the responsibility of the postal service to ensure packages are delivered.
        </p>
        <div className="bg-neutral-50 border border-neutral-200 p-4 rounded-sm">
          <p className="text-sm">
            <strong>Please note:</strong> Refunds will not be issued for lost packages. However, items will be resent if a package cannot be traced.
          </p>
        </div>
        <p className="mt-4 text-sm text-neutral-700">
          For assistance with undelivered orders, please contact us at{' '}
          <a href="mailto:info@inaarawoman.com" className="text-neutral-900 underline hover:text-neutral-600 font-medium">
            info@inaarawoman.com
          </a>
        </p>
      </>
    ),
  },
  {
    title: 'Temporary Shipping Suspension',
    icon: <Globe size={18} />,
    content: (
      <>
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <p className="text-sm text-red-900 font-semibold mb-2">
            Important Notice
          </p>
          <p className="text-sm text-red-900">
            Due to current circumstances, we are temporarily unable to ship orders to <strong>Israel, Iran, and Russia</strong>.
          </p>
        </div>
        <p className="text-sm text-neutral-700">
          We apologize for any inconvenience this may cause and appreciate your understanding.
        </p>
      </>
    ),
  },
  {
    title: 'Customs and Duties Charges',
    icon: <Package size={18} />,
    content: (
      <>
        <p className="mb-4">
          Almost all shipments crossing international borders are subject to the assessment of duties and taxes imposed by the importing country's government.
        </p>

        <h4 className="text-sm font-semibold text-neutral-900 uppercase tracking-wide mb-3 mt-6">
          Important Information:
        </h4>

        <div className="space-y-4 mb-6">
          <div className="bg-white border border-neutral-200 p-4 rounded-sm">
            <h5 className="text-xs font-semibold text-neutral-900 uppercase tracking-wide mb-2">
              Duty Handled Deliveries (EU)
            </h5>
            <p className="text-sm text-neutral-700">
              Items shipped from our European warehouse will be delivered without extra duties charged as they are now shipped from within the EU. This means smoother transactions and hassle-free deliveries for you.
            </p>
          </div>

          <div className="bg-white border border-neutral-200 p-4 rounded-sm">
            <h5 className="text-xs font-semibold text-neutral-900 uppercase tracking-wide mb-2">
              International Fulfillment
            </h5>
            <p className="text-sm text-neutral-700">
              In cases where we run out of stock in the EU or do not have a certain item in our European warehouse, we will fulfill it from our US warehouse. Please note that these items might come with customs duty fees attached.
            </p>
          </div>

          <div className="bg-amber-50 border-l-4 border-amber-500 p-4">
            <h5 className="text-xs font-semibold text-amber-900 uppercase tracking-wide mb-2">
              Changes to DDP Shipping
            </h5>
            <p className="text-sm text-amber-900">
              We will no longer ship orders DDP (Duties and Taxes Paid) to any country outside of the EU (Middle East, Asia, Africa, etc.). All international orders should expect corresponding duties fees upon delivery, subject to the local laws of the recipient.
            </p>
          </div>
        </div>

        <p className="text-sm text-neutral-700">
          In rare cases where your package arrives from multiple warehouses (if it is unavailable in one location), duties may apply depending on your shipping address.
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

export default function ShippingReturnsPage() {
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
            Shipping & Returns
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-xs text-neutral-600 uppercase tracking-wider"
          >
            Everything you need to know about delivery and returns
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
            We're committed to ensuring your Inaara Woman pieces arrive safely and in perfect condition. Please review our shipping and returns policies below.
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

        {/* Contact Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 bg-neutral-50 border border-neutral-200 p-8 rounded-sm text-center"
        >
          <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wide mb-3">
            Have Questions?
          </h3>
          <p className="text-sm text-neutral-700 mb-4">
            Our customer service team is here to help with any shipping or returns inquiries.
          </p>
          <a
            href="mailto:info@inaarawoman.com"
            className="inline-block text-sm text-neutral-900 underline hover:text-neutral-600 font-medium transition-colors"
          >
            info@inaarawoman.com
          </a>
        </motion.div>
      </div>
    </div>
  );
}