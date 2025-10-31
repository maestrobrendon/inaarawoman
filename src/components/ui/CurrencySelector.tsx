import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { useCurrency, Currency } from '../../context/CurrencyContext';

export default function CurrencySelector() {
  const { currency, setCurrency, currencies } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (selectedCurrency: Currency) => {
    setCurrency(selectedCurrency);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 hover:text-neutral-900 transition-colors"
        aria-label="Select currency"
        aria-expanded={isOpen}
      >
        <span className="text-lg" role="img" aria-label={currency.name}>
          {currency.flag}
        </span>
        <span className="font-medium">{currency.code}</span>
        <ChevronDown 
          size={14} 
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white border border-neutral-200 rounded-sm shadow-lg z-50 animate-fadeIn">
          <div className="p-2">
            {/* Header */}
            <div className="px-3 py-2 border-b border-neutral-100">
              <p className="text-xs text-neutral-500 uppercase tracking-wider font-semibold">
                Select Currency
              </p>
            </div>

            {/* Currency List */}
            <div className="space-y-1 mt-2">
              {currencies.map((curr: Currency) => (
                <button
                  key={curr.code}
                  onClick={() => handleSelect(curr)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-sm transition-all ${
                    currency.code === curr.code
                      ? 'bg-neutral-100 text-neutral-900 font-medium'
                      : 'text-neutral-700 hover:bg-neutral-50'
                  }`}
                  aria-label={`Select ${curr.name}`}
                >
                  <div className="flex items-center gap-3">
                    {/* Flag */}
                    <span className="text-lg" role="img" aria-label={curr.name}>
                      {curr.flag}
                    </span>
                    
                    {/* Currency Info */}
                    <div className="text-left">
                      <p className="font-medium text-sm">{curr.code}</p>
                      <p className="text-xs text-neutral-500">{curr.name}</p>
                    </div>
                  </div>

                  {/* Check Icon for Selected */}
                  {currency.code === curr.code && (
                    <Check size={16} className="text-neutral-900" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}