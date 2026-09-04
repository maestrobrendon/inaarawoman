import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { useStoreSettings } from '../../hooks/useStoreSettings';

const PAGES = [
  { name: 'Home', to: '/' },
  { name: 'Shop', to: '/shop' },
  { name: 'Journal', to: '/journal' },
  { name: 'About', to: '/about' },
  { name: 'FAQ', to: '/faq' },
  { name: 'Contact', to: '/contact' },
];

const COLLECTIONS = [
  { name: 'Amata', to: '/shop?collection=amata' },
  { name: 'Uzuri', to: '/shop?collection=uzuri' },
  { name: 'Nivara', to: '/shop?collection=nivara' },
  { name: 'Best sellers', to: '/shop?sort=bestsellers' },
  { name: 'Seasonal Drop', to: '/shop?collection=seasonal-drop' },
  { name: 'New arrivals', to: '/shop?sort=newest' },
];

const LEGALS = [
  { name: 'Privacy Policy', to: '/privacy-policy' },
  { name: 'Terms of service', to: '/terms-conditions' },
  { name: 'Return & Refund Policy', to: '/shipping-returns' },
  { name: 'Shipping Policy', to: '/shipping-policy' },
  { name: 'Cookie Policy', to: '/cookie-policy' },
];

const SOCIALS = [
  { name: 'Instagram', href: 'https://www.instagram.com/inaarawoman_/' },
  { name: 'Pinterest', href: 'https://www.pinterest.com/inaarawoman/' },
];

const PAYMENTS = ['Visa', 'Mastercard', 'Amex', 'PayPal', 'Diners Club', 'Discover'];

const linkClass =
  'text-[14px] text-white/55 transition-colors hover:text-white';

function LinkColumn({
  title,
  items,
}: {
  title: string;
  items: { name: string; to?: string; href?: string }[];
}) {
  return (
    <nav aria-label={title}>
      <h3 className="mb-5 text-[14px] font-bold text-white">{title}</h3>
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.name}>
            {item.href ? (
              <a href={item.href} target="_blank" rel="noopener noreferrer" className={linkClass}>
                {item.name}
              </a>
            ) : (
              <Link to={item.to || '#'} className={linkClass}>
                {item.name}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default function InaaraFooter() {
  const year = new Date().getFullYear();
  const { settings } = useStoreSettings();
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);

  const whatsappDigits = (settings.store_whatsapp || settings.store_phone).replace(/[^\d]/g, '');
  const contactItems = [
    settings.store_email && { label: 'Email', value: settings.store_email, href: `mailto:${settings.store_email}` },
    settings.store_phone && { label: 'Phone', value: settings.store_phone, href: `tel:${settings.store_phone.replace(/\s+/g, '')}` },
    whatsappDigits && { label: 'WhatsApp', value: 'Chat on WhatsApp', href: `https://wa.me/${whatsappDigits}` },
    settings.store_address && { label: 'Address', value: settings.store_address },
  ].filter(Boolean) as { label: string; value: string; href?: string }[];

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setDone(true);
    setEmail('');
  };

  return (
    <footer className="bg-[#1a1a1a] text-white">
      <div className="mx-auto max-w-[1360px] px-5 sm:px-8 lg:px-[50px] pt-16 pb-8 md:pt-20">
        {/* Top row */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-12 md:grid-cols-4 lg:grid-cols-[repeat(4,minmax(0,1fr))_1.6fr]">
          <LinkColumn title="Pages" items={PAGES} />
          <LinkColumn title="Collections" items={COLLECTIONS} />
          <LinkColumn title="Legals" items={LEGALS} />
          <LinkColumn title="Socials" items={SOCIALS} />

          {/* Newsletter */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <h3 className="mb-3 text-[14px] font-bold text-white">Subscribe to Newsletter</h3>
            <p className="mb-5 max-w-sm text-[14px] leading-relaxed text-white/55">
              Get early access to new arrivals, exclusive discounts, and seasonal style updates.
            </p>

            <form onSubmit={submit} className="relative max-w-sm">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                aria-label="Email address"
                className="h-12 w-full rounded-full border border-white/25 bg-transparent pl-5 pr-14 text-[14px] text-white placeholder:text-white/40 focus:border-white/60 focus:outline-none"
              />
              <button
                type="submit"
                aria-label="Subscribe"
                className="absolute right-1.5 top-1.5 grid h-9 w-9 place-items-center rounded-full bg-white text-[#1a1a1a] transition-transform hover:scale-105"
              >
                <ArrowUpRight size={16} />
              </button>
            </form>
            {done && (
              <p className="mt-3 text-[13px] text-white/70">Thanks — you're on the list.</p>
            )}

            {contactItems.length > 0 && (
              <div className="mt-8">
                <p className="mb-3 text-[12px] uppercase tracking-[0.12em] text-white/45">
                  Get in touch
                </p>
                <ul className="space-y-1.5">
                  {contactItems.map((c) => (
                    <li key={c.label} className="text-[14px] text-white/55">
                      {c.href ? (
                        <a
                          href={c.href}
                          {...(c.href.startsWith('http')
                            ? { target: '_blank', rel: 'noopener noreferrer' }
                            : {})}
                          className="transition-colors hover:text-white"
                        >
                          {c.value}
                        </a>
                      ) : (
                        c.value
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-8">
              <p className="mb-3 text-[12px] uppercase tracking-[0.12em] text-white/45">
                Payment secured by
              </p>
              <ul className="flex flex-wrap gap-2">
                {PAYMENTS.map((p) => (
                  <li
                    key={p}
                    className="rounded-md border border-white/15 bg-white/[0.06] px-2.5 py-1 text-[11px] font-medium text-white/70"
                  >
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Divider */}
        <hr className="my-10 border-white/12" />

        {/* Bottom row */}
        <div className="flex flex-col gap-1 text-[13px] text-white/50 sm:flex-row sm:items-center sm:gap-2">
          <span>© {year} {settings.store_name}. All rights reserved.</span>
          <span className="hidden sm:inline">·</span>
          <a
            href="https://thematrixhq.com"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-white"
          >
            Designed by thematrixHQ
          </a>
        </div>
      </div>

      {/* Brand sign-off — INAARA logo, whitened, fading into the dark */}
      <div className="overflow-hidden px-4 pb-8 md:pb-12">
        <img
          src="https://res.cloudinary.com/dusynu0kv/image/upload/v1765001554/z0mkjqsdbnr4ppai6ukp.png"
          alt="Inaara Woman"
          aria-hidden="true"
          className="mx-auto block w-full max-w-[1100px] select-none object-contain opacity-90 [filter:brightness(0)_invert(1)] [mask-image:linear-gradient(to_bottom,#000_55%,transparent)] [-webkit-mask-image:linear-gradient(to_bottom,#000_55%,transparent)]"
        />
      </div>
    </footer>
  );
}
