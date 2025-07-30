import { createClient } from '@supabase/supabase-js';

// Define currency type
export type Currency = {
  code: string;
  rate: number;
  symbol: string;
  flag: string;
};

// Cache for exchange rates
let exchangeRatesCache: Record<string, Currency> = {};
let lastFetchTime = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Fallback rates in case API fails
const fallbackRates: Record<string, Currency> = {
  AED: { code: 'AED', rate: 1.0, symbol: 'AED', flag: '🇦🇪' },
  USD: { code: 'USD', rate: 0.272, symbol: '$', flag: '🇺🇸' },
  EUR: { code: 'EUR', rate: 0.25, symbol: '€', flag: '🇪🇺' },
  GBP: { code: 'GBP', rate: 0.21, symbol: '£', flag: '🇬🇧' },
  PKR: { code: 'PKR', rate: 76.5, symbol: '₨', flag: '🇵🇰' },
};

// Function to fetch exchange rates from ExchangeRate-API
async function fetchExchangeRates(): Promise<Record<string, Currency>> {
  try {
    // Fetch directly from the API
    console.log('Fetching exchange rates from API');
    const apiKey = process.env.EXCHANGE_RATE_API_KEY;
    
    if (!apiKey) {
      console.warn('No API key for ExchangeRate-API, using fallback rates');
      return fallbackRates;
    }
    
    const response = await fetch(
      `https://v6.exchangerate-api.com/v6/${apiKey}/latest/AED`
    );
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.result !== 'success') {
      throw new Error(`API returned error: ${data.error}`);
    }
    
    // Convert API response to our format
    const rates: Record<string, Currency> = {};
    const symbols: Record<string, string> = {
      AED: 'AED', USD: '$', EUR: '€', GBP: '£', PKR: '₨'
    };
    const flags: Record<string, string> = {
      AED: '🇦🇪', USD: '🇺🇸', EUR: '🇪🇺', GBP: '🇬🇧', PKR: '🇵🇰'
    };
    
    Object.entries(data.conversion_rates).forEach(([code, rate]) => {
      if (code in symbols) {
        rates[code] = {
          code,
          rate: code === 'AED' ? 1.0 : (1 / (rate as number)),
          symbol: symbols[code] || code,
          flag: flags[code] || '',
        };
      }
    });
    
    return rates;
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    return fallbackRates;
  }
}

// Function to get exchange rates (from cache or fetch new ones)
export async function getExchangeRates(): Promise<Record<string, Currency>> {
  const now = Date.now();
  
  // If cache is empty or expired, fetch new rates
  if (Object.keys(exchangeRatesCache).length === 0 || now - lastFetchTime > CACHE_DURATION) {
    exchangeRatesCache = await fetchExchangeRates();
    lastFetchTime = now;
  }
  
  return exchangeRatesCache;
}

// Function to convert amount from one currency to another
export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  rates: Record<string, Currency>
): number {
  // If rates don't include the currencies, use fallback
  if (!rates[fromCurrency] || !rates[toCurrency]) {
    console.warn(`Currency not found, using fallback rates for ${fromCurrency} or ${toCurrency}`);
    
    const fromRate = rates[fromCurrency]?.rate || fallbackRates[fromCurrency]?.rate || 1;
    const toRate = rates[toCurrency]?.rate || fallbackRates[toCurrency]?.rate || 1;
    
    // Convert to AED first (base currency), then to target currency
    return amount * (toRate / fromRate);
  }
  
  // Convert to AED first (base currency), then to target currency
  const amountInAED = amount / rates[fromCurrency].rate;
  return amountInAED * rates[toCurrency].rate;
}

// Format currency with proper symbol and decimal places
export function formatCurrency(
  amount: number,
  currencyCode: string,
  rates: Record<string, Currency>
): string {
  const currency = rates[currencyCode] || fallbackRates[currencyCode];
  
  if (!currency) {
    return amount.toFixed(2);
  }
  
  // Format based on currency
  const formatter = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currencyCode,
    currencyDisplay: 'symbol',
  });
  
  try {
    return formatter.format(amount);
  } catch (error) {
    // Fallback formatting if Intl formatter fails
    return `${currency.symbol} ${amount.toFixed(2)}`;
  }
}

// Get display string for exchange rate
export function getExchangeRateDisplay(
  fromCurrency: string,
  toCurrency: string,
  rates: Record<string, Currency>
): string {
  const fromRate = rates[fromCurrency]?.rate || fallbackRates[fromCurrency]?.rate || 1;
  const toRate = rates[toCurrency]?.rate || fallbackRates[toCurrency]?.rate || 1;
  
  const rate = toRate / fromRate;
  return `1 ${fromCurrency} = ${rate.toFixed(4)} ${toCurrency}`;
}

// Currency formatting with symbols
export function formatCurrencyWithSymbol(amount: number, currencyCode: string): string {
  // Get currency symbol and formatting options
  const currencyInfo = getCurrencyInfo(currencyCode);
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Get currency information including symbol and decimal places
export function getCurrencyInfo(currencyCode: string): { 
  symbol: string, 
  name: string,
  decimalPlaces: number,
  symbolPosition: 'before' | 'after'
} {
  const currencyMap: Record<string, { 
    symbol: string, 
    name: string,
    decimalPlaces: number,
    symbolPosition: 'before' | 'after'
  }> = {
    AED: { symbol: 'د.إ', name: 'UAE Dirham', decimalPlaces: 2, symbolPosition: 'before' },
    USD: { symbol: '$', name: 'US Dollar', decimalPlaces: 2, symbolPosition: 'before' },
    EUR: { symbol: '€', name: 'Euro', decimalPlaces: 2, symbolPosition: 'before' },
    GBP: { symbol: '£', name: 'British Pound', decimalPlaces: 2, symbolPosition: 'before' },
    PKR: { symbol: '₨', name: 'Pakistani Rupee', decimalPlaces: 0, symbolPosition: 'before' },
    INR: { symbol: '₹', name: 'Indian Rupee', decimalPlaces: 2, symbolPosition: 'before' },
    CAD: { symbol: 'C$', name: 'Canadian Dollar', decimalPlaces: 2, symbolPosition: 'before' },
    AUD: { symbol: 'A$', name: 'Australian Dollar', decimalPlaces: 2, symbolPosition: 'before' },
    JPY: { symbol: '¥', name: 'Japanese Yen', decimalPlaces: 0, symbolPosition: 'before' },
    CNY: { symbol: '¥', name: 'Chinese Yuan', decimalPlaces: 2, symbolPosition: 'before' },
    SAR: { symbol: '﷼', name: 'Saudi Riyal', decimalPlaces: 2, symbolPosition: 'before' },
    QAR: { symbol: 'ر.ق', name: 'Qatari Riyal', decimalPlaces: 2, symbolPosition: 'before' },
    BHD: { symbol: '.د.ب', name: 'Bahraini Dinar', decimalPlaces: 3, symbolPosition: 'before' },
    KWD: { symbol: 'د.ك', name: 'Kuwaiti Dinar', decimalPlaces: 3, symbolPosition: 'before' },
    OMR: { symbol: 'ر.ع.', name: 'Omani Rial', decimalPlaces: 3, symbolPosition: 'before' },
  };
  
  return currencyMap[currencyCode] || { 
    symbol: currencyCode, 
    name: currencyCode, 
    decimalPlaces: 2,
    symbolPosition: 'before'
  };
}
