/**
 * Supported currencies and conversion rates.
 * In production, rates should be fetched from an external API periodically.
 */
export const SUPPORTED_CURRENCIES = {
  INR: { symbol: "₹", name: "Indian Rupee", rate: 1 },
  USD: { symbol: "$", name: "US Dollar", rate: 0.012 },
  EUR: { symbol: "€", name: "Euro", rate: 0.011 },
  GBP: { symbol: "£", name: "British Pound", rate: 0.0095 },
  AED: { symbol: "د.إ", name: "UAE Dirham", rate: 0.044 },
};

export const DEFAULT_CURRENCY = "INR";

export function convertCurrency(amountInINR, targetCurrency) {
  const currency = SUPPORTED_CURRENCIES[targetCurrency];
  if (!currency) return amountInINR;
  return Math.round(amountInINR * currency.rate * 100) / 100;
}

export function getCurrencySymbol(currencyCode) {
  return SUPPORTED_CURRENCIES[currencyCode]?.symbol || "₹";
}
