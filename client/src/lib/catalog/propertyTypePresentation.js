const PROPERTY_TYPE_ICONS = {
  apartment: "flaticon-corporation",
  villa: "flaticon-garden",
  townhouse: "flaticon-chat",
  penthouse: "flaticon-home-3",
  duplex: "flaticon-home-2",
  office: "flaticon-network",
  shop: "flaticon-door",
  building: "flaticon-hotel",
  land: "flaticon-expand",
  chalet: "flaticon-cabin",
};

export function getPropertyTypeIcon(value) {
  if (!value) return "flaticon-home-1";
  return PROPERTY_TYPE_ICONS[value] || "flaticon-home-1";
}

export function formatPropertyTypeListingCount(count) {
  const n = Number(count) || 0;
  return `${n.toLocaleString()} ${n === 1 ? "listing" : "listings"}`;
}

export function buildPropertyTypeListingsHref(typeValue) {
  if (!typeValue) return "/listings";
  return `/listings?type=${encodeURIComponent(typeValue)}`;
}
