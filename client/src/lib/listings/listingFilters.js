export const LISTING_PAGE_SIZE = 12;

export const LISTING_MAX_PRICE = 1_000_000;

export const LISTING_SORT_OPTIONS = {
  Newest: { sortBy: "createdAt", sortOrder: "desc" },
  "Price Low": { sortBy: "price", sortOrder: "asc" },
  "Price High": { sortBy: "price", sortOrder: "desc" },
  "Best Seller": { sortBy: "viewCount", sortOrder: "desc" },
  "Best Match": { sortBy: "createdAt", sortOrder: "desc" },
};

export const LISTING_PROPERTY_TYPE_OPTIONS = [
  { label: "Apartment", value: "apartment" },
  { label: "Villa", value: "villa" },
  { label: "Townhouse", value: "townhouse" },
  { label: "Land", value: "land" },
  { label: "Commercial", value: "commercial" },
  { label: "Duplex", value: "duplex" },
  { label: "Studio", value: "studio" },
];

export function buildListingQueryParams({
  page = 1,
  limit = LISTING_PAGE_SIZE,
  currentSortingOption = "Newest",
  listingStatus = "All",
  propertyTypes = [],
  priceRange = [0, LISTING_MAX_PRICE],
  bedrooms = 0,
  location = "All Cities",
  searchQuery = "",
} = {}) {
  const sort =
    LISTING_SORT_OPTIONS[currentSortingOption] || LISTING_SORT_OPTIONS.Newest;

  const params = {
    page,
    limit,
    status: "active",
    sortBy: sort.sortBy,
    sortOrder: sort.sortOrder,
  };

  if (listingStatus === "Buy") params.listingType = "sale";
  if (listingStatus === "Rent") params.listingType = "rent";
  if (propertyTypes.length === 1) params.type = propertyTypes[0];
  if (priceRange[0] > 0) params.minPrice = priceRange[0];
  if (priceRange[1] < LISTING_MAX_PRICE) params.maxPrice = priceRange[1];
  if (bedrooms > 0) params.bedrooms = bedrooms;
  if (location && location !== "All Cities") params.city = location;

  const trimmedSearch = searchQuery.trim();
  if (trimmedSearch) params.search = trimmedSearch;

  return params;
}

export function getListingPageRange(page, limit, total = 0) {
  if (!total) return [0, 0, 0];

  return [(page - 1) * limit + 1, Math.min(page * limit, total), total];
}

export function getListingBrowseTitle({
  listingStatus = "All",
  location = "All Cities",
} = {}) {
  const cityLabel =
    location && location !== "All Cities" ? location : "All Areas";

  if (listingStatus === "Rent") {
    return `Properties for Rent in ${cityLabel}`;
  }

  if (listingStatus === "Buy") {
    return `Properties for Sale in ${cityLabel}`;
  }

  return `Browse Properties in ${cityLabel}`;
}

export function getListingBrowseCrumb({
  listingStatus = "All",
  location = "All Cities",
} = {}) {
  if (listingStatus === "Rent") return "For Rent";
  if (listingStatus === "Buy") return "For Sale";
  if (location && location !== "All Cities") return location;
  return "All Listings";
}
