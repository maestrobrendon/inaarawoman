import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, FileText, Shield, AlertCircle } from 'lucide-react';

interface AccordionItem {
  title: string;
  content: string | JSX.Element;
}

const accordionData: AccordionItem[] = [
  {
    title: 'Overview',
    content: (
      <>
        <p className="mb-4">
          This website is operated by <strong>Inaara Woman Fashion</strong>. Throughout the site, the terms "we", "us" and "our" refer to Inaara Woman Fashion. Inaara Woman Fashion offers this website, including all information, tools and services available from this site to you, the user, conditioned upon your acceptance of all terms, conditions, policies and notices stated here.
        </p>
        <p className="mb-4">
          By visiting our site at <strong>www.inaarawoman.com</strong> and/or purchasing something from us, you engage in our "Service" and agree to be bound by the following terms and conditions ("Terms of Service", "Terms", "Terms & Conditions"), including those additional terms and conditions and policies referenced herein and/or available by hyperlink. These Terms of Service apply to all users of the site, including without limitation users who are browsers, vendors, customers, merchants, and/or contributors of content.
        </p>
        <p className="mb-4">
          Please read these Terms of Service carefully before accessing or using our website. By accessing or using any part of the site, you agree to be bound by these Terms of Service. If you do not agree to all the terms and conditions of this agreement, then you may not access the website or use any services. If these Terms of Service are considered an offer, acceptance is expressly limited to these Terms of Service.
        </p>
        <p className="mb-4">
          Any new features or tools which are added to the current store shall also be subject to the Terms of Service. You can review the most current version of the Terms of Service at any time on this page. We reserve the right to update, change or replace any part of these Terms of Service by posting updates and/or changes to our website. It is your responsibility to check this page periodically for changes. Your continued use of or access to the website following the posting of any changes constitutes acceptance of those changes.
        </p>
      </>
    ),
  },
  {
    title: 'Section 1 - Online Store Terms',
    content: (
      <>
        <ul className="list-disc pl-6 space-y-3">
          <li>
            By agreeing to these Terms of Service, you represent that you are at least the age of majority (18 years old) in your country of residence, or that you are the age of majority in your country of residence and you have given us your consent to allow any of your minor dependents to use this site.
          </li>
          <li>
            You may not use our products for any illegal or unauthorized purpose nor may you, in the use of the Service, violate any laws in your jurisdiction (including but not limited to copyright laws).
          </li>
          <li>
            You must not transmit any worms or viruses or any code of a destructive nature.
          </li>
          <li>
            A breach or violation of any of the Terms will result in an immediate termination of your Services.
          </li>
        </ul>
      </>
    ),
  },
  {
    title: 'Section 2 - General Conditions',
    content: (
      <>
        <ul className="list-disc pl-6 space-y-3">
          <li>
            We reserve the right to refuse service to anyone for any reason at any time.
          </li>
          <li>
            You understand that your content (not including credit card information), may be transferred unencrypted and involve (a) transmissions over various networks; and (b) changes to conform and adapt to technical requirements of connecting networks or devices. Credit card information is always encrypted during transfer over networks using industry-standard SSL technology.
          </li>
          <li>
            You agree not to reproduce, duplicate, copy, sell, resell or exploit any portion of the Service, use of the Service, or access to the Service or any contact on the website through which the service is provided, without express written permission by us.
          </li>
          <li>
            The headings used in this agreement are included for convenience only and will not limit or otherwise affect these Terms.
          </li>
        </ul>
      </>
    ),
  },
  {
    title: 'Section 3 - Accuracy, Completeness and Timeliness of Information',
    content: (
      <>
        <p className="mb-4">
          We are not responsible if information made available on this site is not accurate, complete or current. The material on this site is provided for general information only and should not be relied upon or used as the sole basis for making decisions without consulting primary, more accurate, more complete or more timely sources of information. Any reliance on the material on this site is at your own risk.
        </p>
        <p className="mb-4">
          This site may contain certain historical information. Historical information, necessarily, is not current and is provided for your reference only. We reserve the right to modify the contents of this site at any time, but we have no obligation to update any information on our site. You agree that it is your responsibility to monitor changes to our site.
        </p>
      </>
    ),
  },
  {
    title: 'Section 4 - Modifications to the Service and Prices',
    content: (
      <>
        <ul className="list-disc pl-6 space-y-3">
          <li>
            Prices for our products are subject to change without notice.
          </li>
          <li>
            We reserve the right at any time to modify or discontinue the Service (or any part or content thereof) without notice at any time.
          </li>
          <li>
            We shall not be liable to you or to any third-party for any modification, price change, suspension or discontinuance of the Service.
          </li>
        </ul>
      </>
    ),
  },
  {
    title: 'Section 5 - Products and Services',
    content: (
      <>
        <p className="mb-4">
          Certain products or services may be available exclusively online through the website. These products or services are made-to-order and have limited quantities. They are subject to return or exchange only according to our Return Policy.
        </p>
        <p className="mb-4">
          We have made every effort to display as accurately as possible the colors and images of our products that appear at the store. We cannot guarantee that your computer monitor's, tablet's, or mobile device's display of any color will be accurate. Due to the nature of digital photography and screen variations, actual product colors may vary slightly from images shown.
        </p>
        <p className="mb-4">
          We reserve the right, but are not obligated, to limit the sales of our products or Services to any person, geographic region or jurisdiction. We may exercise this right on a case-by-case basis. We reserve the right to limit the quantities of any products or services that we offer. All descriptions of products or product pricing are subject to change at anytime without notice, at the sole discretion of us. We reserve the right to discontinue any product at any time. Any offer for any product or service made on this site is void where prohibited.
        </p>
        <p className="mb-4">
          We do not warrant that the quality of any products, services, information, or other material purchased or obtained by you will meet your expectations, or that any errors in the Service will be corrected.
        </p>
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mt-4">
          <p className="text-sm text-amber-900 font-semibold mb-2">
            Made-to-Order Notice
          </p>
          <p className="text-sm text-amber-900">
            All Inaara Woman pieces are made-to-order with a production time of 5 working days. Once production begins, orders cannot be cancelled or modified. Please review your order carefully before completing your purchase.
          </p>
        </div>
      </>
    ),
  },
  {
    title: 'Section 6 - Accuracy of Billing and Account Information',
    content: (
      <>
        <p className="mb-4">
          We reserve the right to refuse any order you place with us. We may, in our sole discretion, limit or cancel quantities purchased per person, per household or per order. These restrictions may include orders placed by or under the same customer account, the same credit card, and/or orders that use the same billing and/or shipping address. In the event that we make a change to or cancel an order, we may attempt to notify you by contacting the e-mail and/or billing address/phone number provided at the time the order was made. We reserve the right to limit or prohibit orders that, in our sole judgment, appear to be placed by dealers, resellers or distributors.
        </p>
        <p className="mb-4">
          You agree to provide current, complete and accurate purchase and account information for all purchases made at our store. You agree to promptly update your account and other information, including your email address and credit card numbers and expiration dates, so that we can complete your transactions and contact you as needed.
        </p>
        <p>
          For more detail, please review our <strong>Shipping & Returns Policy</strong> and <strong>Privacy Policy</strong>.
        </p>
      </>
    ),
  },
  {
    title: 'Section 7 - Optional Tools',
    content: (
      <>
        <p className="mb-4">
          We may provide you with access to third-party tools over which we neither monitor nor have any control nor input.
        </p>
        <p className="mb-4">
          You acknowledge and agree that we provide access to such tools "as is" and "as available" without any warranties, representations or conditions of any kind and without any endorsement. We shall have no liability whatsoever arising from or relating to your use of optional third-party tools.
        </p>
        <p className="mb-4">
          Any use by you of optional tools offered through the site is entirely at your own risk and discretion and you should ensure that you are familiar with and approve of the terms on which tools are provided by the relevant third-party provider(s).
        </p>
        <p>
          We may also, in the future, offer new services and/or features through the website (including, the release of new tools and resources). Such new features and/or services shall also be subject to these Terms of Service.
        </p>
      </>
    ),
  },
  {
    title: 'Section 8 - Third-Party Links',
    content: (
      <>
        <p className="mb-4">
          Certain content, products and services available via our Service may include materials from third-parties.
        </p>
        <p className="mb-4">
          Third-party links on this site may direct you to third-party websites that are not affiliated with us. We are not responsible for examining or evaluating the content or accuracy and we do not warrant and will not have any liability or responsibility for any third-party materials or websites, or for any other materials, products, or services of third-parties.
        </p>
        <p className="mb-4">
          We are not liable for any harm or damages related to the purchase or use of goods, services, resources, content, or any other transactions made in connection with any third-party websites. Please review carefully the third-party's policies and practices and make sure you understand them before you engage in any transaction. Complaints, claims, concerns, or questions regarding third-party products should be directed to the third-party.
        </p>
      </>
    ),
  },
  {
    title: 'Section 9 - User Comments, Feedback and Other Submissions',
    content: (
      <>
        <p className="mb-4">
          If, at our request, you send certain specific submissions (for example contest entries, product reviews) or without a request from us you send creative ideas, suggestions, proposals, plans, or other materials, whether online, by email, by postal mail, or otherwise (collectively, 'comments'), you agree that we may, at any time, without restriction, edit, copy, publish, distribute, translate and otherwise use in any medium any comments that you forward to us. We are and shall be under no obligation (1) to maintain any comments in confidence; (2) to pay compensation for any comments; or (3) to respond to any comments.
        </p>
        <p className="mb-4">
          We may, but have no obligation to, monitor, edit or remove content that we determine in our sole discretion are unlawful, offensive, threatening, libelous, defamatory, pornographic, obscene or otherwise objectionable or violates any party's intellectual property or these Terms of Service.
        </p>
        <p className="mb-4">
          You agree that your comments will not violate any right of any third-party, including copyright, trademark, privacy, personality or other personal or proprietary right. You further agree that your comments will not contain libelous or otherwise unlawful, abusive or obscene material, or contain any computer virus or other malware that could in any way affect the operation of the Service or any related website. You may not use a false e-mail address, pretend to be someone other than yourself, or otherwise mislead us or third-parties as to the origin of any comments. You are solely responsible for any comments you make and their accuracy. We take no responsibility and assume no liability for any comments posted by you or any third-party.
        </p>
      </>
    ),
  },
  {
    title: 'Section 10 - Personal Information',
    content: (
      <>
        <p className="mb-4">
          Your submission of personal information through the store is governed by our Privacy Policy.
        </p>
        <p>
          To view our Privacy Policy and understand how we collect, use, and protect your personal data, please visit our <strong>Privacy Policy</strong> page. By using our Service, you consent to the collection and use of information in accordance with our Privacy Policy.
        </p>
      </>
    ),
  },
  {
    title: 'Section 11 - Errors, Inaccuracies and Omissions',
    content: (
      <>
        <p className="mb-4">
          Occasionally there may be information on our site or in the Service that contains typographical errors, inaccuracies or omissions that may relate to product descriptions, pricing, promotions, offers, product shipping charges, transit times and availability. We reserve the right to correct any errors, inaccuracies or omissions, and to change or update information or cancel orders if any information in the Service or on any related website is inaccurate at any time without prior notice (including after you have submitted your order).
        </p>
        <p className="mb-4">
          We undertake no obligation to update, amend or clarify information in the Service or on any related website, including without limitation, pricing information, except as required by law. No specified update or refresh date applied in the Service or on any related website, should be taken to indicate that all information in the Service or on any related website has been modified or updated.
        </p>
      </>
    ),
  },
  {
    title: 'Section 12 - Prohibited Uses',
    content: (
      <>
        <p className="mb-4">
          In addition to other prohibitions as set forth in the Terms of Service, you are prohibited from using the site or its content:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>(a) for any unlawful purpose;</li>
          <li>(b) to solicit others to perform or participate in any unlawful acts;</li>
          <li>(c) to violate any international, federal, provincial or state regulations, rules, laws, or local ordinances;</li>
          <li>(d) to infringe upon or violate our intellectual property rights or the intellectual property rights of others;</li>
          <li>(e) to harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate based on gender, sexual orientation, religion, ethnicity, race, age, national origin, or disability;</li>
          <li>(f) to submit false or misleading information;</li>
          <li>(g) to upload or transmit viruses or any other type of malicious code that will or may be used in any way that will affect the functionality or operation of the Service or of any related website, other websites, or the Internet;</li>
          <li>(h) to collect or track the personal information of others;</li>
          <li>(i) to spam, phish, pharm, pretext, spider, crawl, or scrape;</li>
          <li>(j) for any obscene or immoral purpose; or</li>
          <li>(k) to interfere with or circumvent the security features of the Service or any related website, other websites, or the Internet.</li>
        </ul>
        <p className="mt-4">
          We reserve the right to terminate your use of the Service or any related website for violating any of the prohibited uses.
        </p>
      </>
    ),
  },
  {
    title: 'Section 13 - Disclaimer of Warranties; Limitation of Liability',
    content: (
      <>
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <p className="text-sm text-red-900 font-semibold mb-2">
            Important Legal Disclaimer
          </p>
          <p className="text-sm text-red-900">
            Please read this section carefully as it limits our liability and your legal rights.
          </p>
        </div>
        <ul className="list-disc pl-6 space-y-3 mb-6">
          <li>
            We do not guarantee, represent or warrant that your use of our service will be uninterrupted, timely, secure or error-free.
          </li>
          <li>
            We do not warrant that the results that may be obtained from the use of the service will be accurate or reliable.
          </li>
          <li>
            You agree that from time to time we may remove the service for indefinite periods of time or cancel the service at any time, without notice to you.
          </li>
          <li>
            You expressly agree that your use of, or inability to use, the service is at your sole risk. The service and all products and services delivered to you through the service are (except as expressly stated by us) provided 'as is' and 'as available' for your use, without any representation, warranties or conditions of any kind, either express or implied, including all implied warranties or conditions of merchantability, merchantable quality, fitness for a particular purpose, durability, title, and non-infringement.
          </li>
        </ul>
        <p className="mb-4">
          In no case shall <strong>Inaara Woman Fashion</strong>, our directors, officers, employees, affiliates, agents, contractors, interns, suppliers, service providers or licensors be liable for any injury, loss, claim, or any direct, indirect, incidental, punitive, special, or consequential damages of any kind, including, without limitation lost profits, lost revenue, lost savings, loss of data, replacement costs, or any similar damages, whether based in contract, tort (including negligence), strict liability or otherwise, arising from your use of any of the service or any products procured using the service, or for any other claim related in any way to your use of the service or any product, including, but not limited to, any errors or omissions in any content, or any loss or damage of any kind incurred as a result of the use of the service or any content (or product) posted, transmitted, or otherwise made available via the service, even if advised of their possibility.
        </p>
        <p className="text-sm text-neutral-600">
          Because some states or jurisdictions do not allow the exclusion or the limitation of liability for consequential or incidental damages, in such states or jurisdictions, our liability shall be limited to the maximum extent permitted by law.
        </p>
      </>
    ),
  },
  {
    title: 'Section 14 - Indemnification',
    content: (
      <>
        <p className="mb-4">
          You agree to indemnify, defend and hold harmless <strong>Inaara Woman Fashion</strong> and our parent, subsidiaries, affiliates, partners, officers, directors, agents, contractors, licensors, service providers, subcontractors, suppliers, interns and employees, harmless from any claim or demand, including reasonable attorneys' fees, made by any third-party due to or arising out of your breach of these Terms of Service or the documents they incorporate by reference, or your violation of any law or the rights of a third-party.
        </p>
        <p>
          This means you are responsible for any legal claims, damages, or expenses that result from your misuse of our website or violation of these terms.
        </p>
      </>
    ),
  },
  {
    title: 'Section 15 - Severability',
    content: (
      <>
        <p>
          In the event that any provision of these Terms of Service is determined to be unlawful, void or unenforceable, such provision shall nonetheless be enforceable to the fullest extent permitted by applicable law, and the unenforceable portion shall be deemed to be severed from these Terms of Service, such determination shall not affect the validity and enforceability of any other remaining provisions.
        </p>
      </>
    ),
  },
  {
    title: 'Section 16 - Termination',
    content: (
      <>
        <p className="mb-4">
          The obligations and liabilities of the parties incurred prior to the termination date shall survive the termination of this agreement for all purposes.
        </p>
        <p className="mb-4">
          These Terms of Service are effective unless and until terminated by either you or us. You may terminate these Terms of Service at any time by notifying us that you no longer wish to use our Services, or when you cease using our site.
        </p>
        <p>
          If in our sole judgment you fail, or we suspect that you have failed, to comply with any term or provision of these Terms of Service, we also may terminate this agreement at any time without notice and you will remain liable for all amounts due up to and including the date of termination; and/or accordingly may deny you access to our Services (or any part thereof).
        </p>
      </>
    ),
  },
  {
    title: 'Section 17 - Entire Agreement',
    content: (
      <>
        <p className="mb-4">
          The failure of us to exercise or enforce any right or provision of these Terms of Service shall not constitute a waiver of such right or provision.
        </p>
        <p className="mb-4">
          These Terms of Service and any policies or operating rules posted by us on this site or in respect to The Service constitutes the entire agreement and understanding between you and us and govern your use of the Service, superseding any prior or contemporaneous agreements, communications and proposals, whether oral or written, between you and us (including, but not limited to, any prior versions of the Terms of Service).
        </p>
        <p>
          Any ambiguities in the interpretation of these Terms of Service shall not be construed against the drafting party.
        </p>
      </>
    ),
  },
  {
    title: 'Section 18 - Governing Law',
    content: (
      <>
        <p className="mb-4">
          These Terms of Service and any separate agreements whereby we provide you Services shall be governed by and construed in accordance with the laws of the <strong>Federal Republic of Nigeria</strong>.
        </p>
        <p className="mb-4">
          Any disputes arising from these Terms of Service or your use of our Service shall be subject to the exclusive jurisdiction of the courts of Nigeria.
        </p>
        <p>
          By using our Service, you consent to the jurisdiction and venue of such courts in connection with any action, suit, proceeding or claim arising under or by reason of these Terms of Service.
        </p>
      </>
    ),
  },
  {
    title: 'Section 19 - Changes to Terms of Service',
    content: (
      <>
        <p className="mb-4">
          You can review the most current version of the Terms of Service at any time at this page: <strong>www.inaarawoman.com/terms-conditions</strong>
        </p>
        <p className="mb-4">
          We reserve the right, at our sole discretion, to update, change or replace any part of these Terms of Service by posting updates and changes to our website. It is your responsibility to check our website periodically for changes. Your continued use of or access to our website or the Service following the posting of any changes to these Terms of Service constitutes acceptance of those changes.
        </p>
        <div className="bg-neutral-50 border border-neutral-200 p-4 rounded-sm">
          <p className="text-sm text-neutral-700">
            We recommend reviewing these Terms periodically to stay informed of any updates or modifications that may affect your use of our Service.
          </p>
        </div>
      </>
    ),
  },
  {
    title: 'Section 20 - Contact Information',
    content: (
      <>
        <p className="mb-4">
          Questions about the Terms of Service should be sent to us at:
        </p>
        <div className="bg-neutral-50 border border-neutral-200 p-6 rounded-sm">
          <p className="mb-2"><strong>Inaara Woman Fashion</strong></p>
          <p className="mb-2">Email: <a href="mailto:info@inaarawoman.com" className="text-neutral-900 underline hover:text-neutral-600 font-medium">info@inaarawoman.com</a></p>
          <p className="mb-2">Website: <a href="https://www.inaarawoman.com" className="text-neutral-900 underline hover:text-neutral-600 font-medium">www.inaarawoman.com</a></p>
        </div>
        <p className="mt-4 text-sm text-neutral-700">
          We will respond to your inquiry within 5 business days. For urgent matters, please clearly mark your email subject line as "URGENT".
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

export default function TermsConditionsPage() {
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
            <FileText size={32} className="text-neutral-900" />
            <h1 className="font-serif text-3xl md:text-4xl font-light text-neutral-900 tracking-wide uppercase">
              Terms & Conditions
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
          className="mb-8"
        >
          <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-sm">
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="flex-shrink-0 text-amber-600 mt-0.5" />
              <div>
                <p className="text-sm text-amber-900 font-semibold mb-2">
                  Please Read Carefully
                </p>
                <p className="text-sm text-amber-900 leading-relaxed">
                  These Terms & Conditions govern your use of our website and purchase of our products. By using our services, you agree to these terms in full. If you disagree with any part of these terms, you should not use our website or purchase our products.
                </p>
              </div>
            </div>
          </div>
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

        {/* Agreement Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 bg-neutral-900 text-white p-8 rounded-sm text-center"
        >
          <Shield size={32} className="mx-auto mb-4" />
          <p className="text-sm font-semibold mb-3 uppercase tracking-wider">
            Your Agreement
          </p>
          <p className="text-sm leading-relaxed mb-4">
            By using www.inaarawoman.com and purchasing from Inaara Woman Fashion, you acknowledge that you have read, understood, and agree to be bound by these Terms & Conditions.
          </p>
          <p className="text-xs text-neutral-400">
            For questions or concerns, contact us at{' '}
            <a href="mailto:info@inaarawoman.com" className="text-white underline hover:text-neutral-300 font-medium">
              info@inaarawoman.com
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}