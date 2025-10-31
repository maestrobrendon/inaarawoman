import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  flag: string;
  rate: number; // Exchange rate relative to NGN (base currency)
}

// Available currencies with their exchange rates
// Base currency is NGN (Nigerian Naira) = 1
export const CURRENCIES: Currency[] = [
  { 
    code: 'NGN', 
    symbol: '₦', 
    name: 'Nigerian Naira', 
    flag: '🇳🇬', 
    rate: 1 
  },
  { 
    code: 'USD', 
    symbol: '$', 
    name: 'US Dollar', 
    flag: '🇺🇸', 
    rate: 0.0012 // 1 NGN ≈ 0.0012 USD (approximately ₦830 = $1)
  },
  { 
    code: 'EUR', 
    symbol: '€', 
    name: 'Euro', 
    flag: '🇪🇺', 
    rate: 0.0011 // 1 NGN ≈ 0.0011 EUR
  },
  { 
    code: 'GBP', 
    symbol: '£', 
    name: 'British Pound', 
    flag: '🇬🇧', 
    rate: 0.00095 // 1 NGN ≈ 0.00095 GBP
  },
  { 
    code: 'CAD', 
    symbol: 'C$', 
    name: 'Canadian Dollar', 
    flag: '🇨🇦', 
    rate: 0.0016 // 1 NGN ≈ 0.0016 CAD
  },
  { 
    code: 'AUD', 
    symbol: 'A$', 
    name: 'Australian Dollar', 
    flag: '🇦🇺', 
    rate: 0.0018 // 1 NGN ≈ 0.0018 AUD
  },
];

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  convertPrice: (price: number) => number;
  formatPrice: (price: number) => string;
  currencies: Currency[];
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  // Initialize currency from localStorage or default to NGN
  const [currency, setCurrencyState] = useState<Currency>(() => {
    const saved = localStorage.getItem('selectedCurrency');
    if (saved) {
      try {
        const savedCurrency = JSON.parse(saved);
        // Find the matching currency from our list
        const found = CURRENCIES.find(c => c.code === savedCurrency.code);
        return found || CURRENCIES[0]; // Fallback to NGN if not found
      } catch (error) {
        console.error('Error loading saved currency:', error);
        return CURRENCIES[0]; // Default to NGN on error
      }
    }
    return CURRENCIES[0]; // Default to NGN
  });

  // Save currency selection to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('selectedCurrency', JSON.stringify(currency));
  }, [currency]);

  // Update currency
  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
  };

  // Convert price from NGN to selected currency
  const convertPrice = (priceInNGN: number): number => {
    return priceInNGN * currency.rate;
  };

  // Format price with currency symbol and proper decimal places
  const formatPrice = (priceInNGN: number): string => {
    const converted = convertPrice(priceInNGN);
    
    // Format with proper decimal places
    // NGN: no decimals (₦25,000)
    // Other currencies: 2 decimals ($30.00)
    const formatted = converted.toLocaleString(undefined, {
      minimumFractionDigits: currency.code === 'NGN' ? 0 : 2,
      maximumFractionDigits: currency.code === 'NGN' ? 0 : 2,
    });

    return `${currency.symbol}${formatted}`;
  };

  const value = {
    currency,
    setCurrency,
    convertPrice,
    formatPrice,
    currencies: CURRENCIES,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

// Custom hook to use currency context
export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within CurrencyProvider');
  }
  return context;
}