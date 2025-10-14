import { Currency, CurrencyInfo } from '../types';

export const CURRENCY_RATES: Record<Currency, CurrencyInfo> = {
  USD: { code: 'USD', symbol: '$', rate: 1 },
  GBP: { code: 'GBP', symbol: '£', rate: 0.79 },
  EUR: { code: 'EUR', symbol: '€', rate: 0.92 },
  CAD: { code: 'CAD', symbol: 'C$', rate: 1.35 }
};

export function formatPrice(price: number, currency: Currency = 'USD'): string {
  const currencyInfo = CURRENCY_RATES[currency];
  const convertedPrice = price * currencyInfo.rate;
  return `${currencyInfo.symbol}${convertedPrice.toFixed(2)}`;
}

export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `IN${timestamp}${random}`;
}

export function generateSessionId(): string {
  let sessionId = localStorage.getItem('sessionId');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    localStorage.setItem('sessionId', sessionId);
  }
  return sessionId;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function classNames(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function calculateShipping(subtotal: number, country: string): number {
  if (subtotal >= 150) return 0;
  if (country === 'US' || country === 'CA') return 10;
  return 15;
}

export function calculateTax(subtotal: number, country: string): number {
  const taxRates: Record<string, number> = {
    'US': 0.08,
    'CA': 0.13,
    'GB': 0.20,
    'EU': 0.19
  };
  return subtotal * (taxRates[country] || 0);
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}
