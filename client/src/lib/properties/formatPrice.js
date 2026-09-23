const currencySymbols = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  AED: "AED ",
};

/** Standard UI label for listing/project price fields (starting price). */
export const PRICE_FROM_LABEL = "Price From";

export function formatPrice(price, currency = "USD") {
  if (price == null) return "—";
  const symbol = currencySymbols[currency] || `${currency} `;
  return `${symbol}${Number(price).toLocaleString()}`;
}
