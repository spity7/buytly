const currencySymbols = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  AED: "AED ",
};

export function formatPrice(price, currency = "USD") {
  if (price == null) return "—";
  const symbol = currencySymbols[currency] || `${currency} `;
  return `${symbol}${Number(price).toLocaleString()}`;
}
