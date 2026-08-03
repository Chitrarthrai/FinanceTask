// Automated Live & Fallback Currency Exchange Rate Engine for FinanceTask

export let EXCHANGE_RATES: Record<string, number> = {
  '$': 1.0,      // Base USD
  '₹': 83.5,     // INR
  '€': 0.92,     // EUR
  '£': 0.78,     // GBP
  '¥': 155.0,    // JPY
  'A$': 1.52,    // AUD
};

const CACHE_KEY = 'financetask_live_exchange_rates';
const CACHE_TIME_KEY = 'financetask_live_exchange_rates_time';
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 Hours

/**
 * Automate fetching live exchange rates from open.er-api.com API
 * with 24-hour local caching and fallback rates.
 */
export const fetchLiveExchangeRates = async (): Promise<Record<string, number>> => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    const cachedTime = localStorage.getItem(CACHE_TIME_KEY);

    if (cached && cachedTime && Date.now() - Number(cachedTime) < CACHE_DURATION_MS) {
      const parsed = JSON.parse(cached);
      EXCHANGE_RATES = { ...EXCHANGE_RATES, ...parsed };
      return EXCHANGE_RATES;
    }

    const response = await fetch('https://open.er-api.com/v6/latest/USD');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data = await response.json();
    if (data && data.rates) {
      const liveRates: Record<string, number> = {
        '$': 1.0,
        '₹': Number(data.rates.INR) || 83.5,
        '€': Number(data.rates.EUR) || 0.92,
        '£': Number(data.rates.GBP) || 0.78,
        '¥': Number(data.rates.JPY) || 155.0,
        'A$': Number(data.rates.AUD) || 1.52,
      };

      EXCHANGE_RATES = { ...EXCHANGE_RATES, ...liveRates };
      localStorage.setItem(CACHE_KEY, JSON.stringify(liveRates));
      localStorage.setItem(CACHE_TIME_KEY, String(Date.now()));
    }
  } catch (error) {
    console.warn('FinanceTask: Live exchange rate fetch failed, using cached/fallback rates', error);
  }

  return EXCHANGE_RATES;
};

// Immediately trigger live rate fetch on load
fetchLiveExchangeRates();

/**
 * Converts an amount from one currency symbol to another.
 */
export const convertCurrency = (
  amount: number,
  fromSymbol: string = '$',
  toSymbol: string = '$'
): number => {
  if (fromSymbol === toSymbol) return amount;
  const fromRate = EXCHANGE_RATES[fromSymbol] || 1.0;
  const toRate = EXCHANGE_RATES[toSymbol] || 1.0;
  
  const inUSD = amount / fromRate;
  const converted = inUSD * toRate;
  
  return Number(converted.toFixed(2));
};
