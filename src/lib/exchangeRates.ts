// Exchange Rates Service - Fetches real-time rates from ExchangeRate-API
const API_KEY = 'd7093c965c63c3a10e6af5ef';
const BASE_CURRENCY = 'NGN';
const API_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/${BASE_CURRENCY}`;

export interface ExchangeRates {
  USD: number;
  EUR: number;
  GBP: number;
  CAD: number;
  AUD: number;
  timestamp: number;
}

// Fallback rates (used if API fails)
const FALLBACK_RATES: ExchangeRates = {
  USD: 0.0012,
  EUR: 0.0011,
  GBP: 0.00095,
  CAD: 0.0016,
  AUD: 0.0018,
  timestamp: Date.now()
};

// Cache rates in localStorage
const CACHE_KEY = 'exchange_rates_cache';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Get cached rates from localStorage
 */
function getCachedRates(): ExchangeRates | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const data = JSON.parse(cached) as ExchangeRates;
    const now = Date.now();
    
    // Check if cache is still valid (less than 24 hours old)
    if (now - data.timestamp < CACHE_DURATION) {
      return data;
    }
    
    // Cache expired
    return null;
  } catch (error) {
    console.error('Error reading cached rates:', error);
    return null;
  }
}

/**
 * Save rates to localStorage cache
 */
function setCachedRates(rates: ExchangeRates): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(rates));
  } catch (error) {
    console.error('Error caching rates:', error);
  }
}

/**
 * Fetch real-time exchange rates from API
 */
export async function fetchExchangeRates(): Promise<ExchangeRates> {
  // First, try to get cached rates
  const cached = getCachedRates();
  if (cached) {
    console.log('Using cached exchange rates');
    return cached;
  }

  console.log('Fetching fresh exchange rates...');

  try {
    const response = await fetch(API_URL);
    
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();

    if (data.result !== 'success') {
      throw new Error('API returned unsuccessful result');
    }

    const rates: ExchangeRates = {
      USD: data.conversion_rates.USD,
      EUR: data.conversion_rates.EUR,
      GBP: data.conversion_rates.GBP,
      CAD: data.conversion_rates.CAD,
      AUD: data.conversion_rates.AUD,
      timestamp: Date.now()
    };

    // Cache the rates
    setCachedRates(rates);

    console.log('Fresh exchange rates fetched and cached:', rates);
    return rates;

  } catch (error) {
    console.error('Error fetching exchange rates, using fallback:', error);
    
    // Return fallback rates if API fails
    return FALLBACK_RATES;
  }
}

/**
 * Force refresh exchange rates (bypasses cache)
 */
export async function refreshExchangeRates(): Promise<ExchangeRates> {
  // Clear cache
  localStorage.removeItem(CACHE_KEY);
  
  // Fetch fresh rates
  return fetchExchangeRates();
}

/**
 * Get the last update timestamp of cached rates
 */
export function getLastUpdateTime(): Date | null {
  const cached = getCachedRates();
  return cached ? new Date(cached.timestamp) : null;
}