import { Instagram, Facebook, Twitter } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-neutral-50 border-t border-neutral-200 mt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-serif text-xl font-semibold mb-4 text-neutral-900">
              INAARA WOMAN
            </h3>
            <p className="text-sm text-neutral-600 leading-relaxed">
              Timeless elegance meets modern femininity. Every woman deserves to shine in her own light.
            </p>
          </div>

          <div>
            <h4 className="font-medium mb-4 text-neutral-900">Shop</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onNavigate('shop')}
                  className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
                >
                  All Products
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('shop')}
                  className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
                >
                  New Arrivals
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('shop')}
                  className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
                >
                  Bestsellers
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('lookbook')}
                  className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
                >
                  Lookbook
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-4 text-neutral-900">About</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
                >
                  Our Story
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('contact')}
                  className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
                >
                  Contact Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('faq')}
                  className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
                >
                  FAQ
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-4 text-neutral-900">Connect</h4>
            <div className="flex gap-4 mb-4">
              <a
                href="https://www.instagram.com/inaarawoman_/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-600 hover:text-neutral-900 transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-600 hover:text-neutral-900 transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-600 hover:text-neutral-900 transition-colors"
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </a>
            </div>
            <a href="mailto:info@inaarawoman.com" className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
              info@inaarawoman.com
            </a>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-neutral-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-neutral-600">
              © {year} Inaara Woman. All rights reserved.
            </p>
            <div className="flex gap-6">
              <button className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
                Privacy Policy
              </button>
              <button className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
                Terms of Service
              </button>
              <button className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
                Shipping & Returns
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
