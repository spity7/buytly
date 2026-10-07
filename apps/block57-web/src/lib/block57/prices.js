import { formatPrice } from "@/lib/properties/formatPrice";

/**
 * Block 57 hides prices from the public: the API sends `price: null` and
 * `priceLabel: "Price on request"`. A price is shown only when the build sets
 * NEXT_PUBLIC_SHOW_PRICES=true AND the unit carries a numeric price.
 */
export const SHOW_PRICES = process.env.NEXT_PUBLIC_SHOW_PRICES === "true";

export const PRICE_ON_REQUEST_LABEL = "Price on request";

/** Formatted price ("$450,000") or null when prices must stay hidden. */
export function formatUnitPrice(unit) {
  if (!SHOW_PRICES) return null;
  const price = unit?.price;
  if (typeof price !== "number" || !Number.isFinite(price)) return null;
  return formatPrice(price, unit?.currency || "USD");
}
