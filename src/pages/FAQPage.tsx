import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { classNames } from '../lib/utils';

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      category: 'Shipping',
      questions: [
        {
          q: 'What are your shipping options?',
          a: 'We offer two shipping options: Standard (5-7 business days) and Express (2-3 business days). Free standard shipping is available on all orders over $150.'
        },
        {
          q: 'Do you ship internationally?',
          a: 'Yes! We ship to over 50 countries worldwide. International shipping times vary by location but typically take 7-14 business days.'
        },
        {
          q: 'How can I track my order?',
          a: 'Once your order ships, you will receive a tracking number via email. You can use this number to track your package on our website or the carrier\'s site.'
        }
      ]
    },
    {
      category: 'Returns & Exchanges',
      questions: [
        {
          q: 'What is your return policy?',
          a: 'We accept returns within 30 days of delivery. Items must be unworn, unwashed, and in original condition with tags attached. Sale items are final sale.'
        },
        {
          q: 'How do I initiate a return?',
          a: 'Contact our customer service team at hello@inaarawoman.com with your order number. We will provide you with a prepaid return label and instructions.'
        },
        {
          q: 'Can I exchange an item?',
          a: 'Yes! We offer free exchanges for size and color. Simply indicate your exchange preference when initiating your return, and we\'ll send the new item right away.'
        }
      ]
    },
    {
      category: 'Sizing',
      questions: [
        {
          q: 'How do I find my size?',
          a: 'We provide a detailed size guide on each product page. Click "Size Guide" to view measurements. If you\'re between sizes, we recommend sizing up for a more comfortable fit.'
        },
        {
          q: 'Do your sizes run true to size?',
          a: 'Yes, our sizes generally run true to size. However, we recommend checking the specific measurements in the size guide for each item, as fit may vary by style.'
        },
        {
          q: 'What if the item doesn\'t fit?',
          a: 'If an item doesn\'t fit, we offer free exchanges within 30 days. Contact us and we\'ll help you find your perfect size.'
        }
      ]
    },
    {
      category: 'Orders',
      questions: [
        {
          q: 'Can I modify or cancel my order?',
          a: 'Orders can be modified or cancelled within 1 hour of placement. After that, orders are processed and cannot be changed. Please contact us immediately if you need assistance.'
        },
        {
          q: 'What payment methods do you accept?',
          a: 'We accept all major credit cards (Visa, Mastercard, American Express), PayPal, Apple Pay, Google Pay, and bank transfers.'
        },
        {
          q: 'Is my payment information secure?',
          a: 'Absolutely. We use industry-standard SSL encryption to protect your payment information. We never store your complete payment details on our servers.'
        }
      ]
    },
    {
      category: 'Products',
      questions: [
        {
          q: 'Are your products ethically made?',
          a: 'Yes, we are committed to ethical production. We work with manufacturers who share our values of fair labor practices and sustainable production methods.'
        },
        {
          q: 'How should I care for my garments?',
          a: 'Care instructions are provided on each product page and on the garment tag. Most items can be machine washed on a gentle cycle. We recommend laying flat to dry to maintain the quality of the fabric.'
        },
        {
          q: 'Do you restock sold-out items?',
          a: 'We restock popular items regularly. Sign up for back-in-stock notifications on the product page to be notified when an item is available again.'
        }
      ]
    }
  ];

  const allQuestions = faqs.flatMap((category, catIndex) =>
    category.questions.map((q, qIndex) => ({
      ...q,
      category: category.category,
      index: catIndex * 100 + qIndex
    }))
  );

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-neutral-600">
            Find answers to common questions about orders, shipping, returns, and more
          </p>
        </div>

        <div className="space-y-2">
          {allQuestions.map((item, index) => {
            const isFirstInCategory =
              index === 0 || item.category !== allQuestions[index - 1].category;

            return (
              <div key={item.index}>
                {isFirstInCategory && (
                  <h2 className="font-serif text-2xl font-semibold text-neutral-900 mt-8 mb-4">
                    {item.category}
                  </h2>
                )}
                <div className="border border-neutral-200 rounded-sm overflow-hidden">
                  <button
                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-neutral-50 transition-colors"
                  >
                    <span className="font-medium text-neutral-900">{item.q}</span>
                    <ChevronDown
                      size={20}
                      className={classNames(
                        'text-neutral-600 transition-transform flex-shrink-0 ml-4',
                        openIndex === index && 'transform rotate-180'
                      )}
                    />
                  </button>
                  {openIndex === index && (
                    <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-200">
                      <p className="text-neutral-700 leading-relaxed">{item.a}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center p-8 bg-gradient-to-br from-amber-50 to-rose-50 rounded-sm">
          <h3 className="font-serif text-2xl font-semibold text-neutral-900 mb-3">
            Still have questions?
          </h3>
          <p className="text-neutral-700 mb-4">
            Our customer service team is here to help
          </p>
          <a
            href="mailto:hello@inaarawoman.com"
            className="text-neutral-900 font-medium hover:underline"
          >
            hello@inaarawoman.com
          </a>
        </div>
      </div>
    </div>
  );
}
