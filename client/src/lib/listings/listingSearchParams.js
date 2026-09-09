import {
  LISTING_MAX_PRICE,
  LISTING_SORT_OPTIONS,
} from "@/lib/listings/listingFilters";

export function listingStatusFromParams(searchParams) {
  const listingType = searchParams.get("listingType");
  if (listingType === "sale") return "Buy";
  if (listingType === "rent") return "Rent";
  if (searchParams.get("status") === "sold") return "Sold";
  return "All";
}

export function parseListingSearchParams(searchParams) {
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortOrder = searchParams.get("sortOrder") || "desc";
  const currentSortingOption =
    Object.entries(LISTING_SORT_OPTIONS).find(
      ([, value]) => value.sortBy === sortBy && value.sortOrder === sortOrder,
    )?.[0] || "Newest";

  const type = searchParams.get("type");
  const minPrice = Number(searchParams.get("minPrice") || 0);
  const maxPrice = Number(searchParams.get("maxPrice") || LISTING_MAX_PRICE);
  const bedrooms = Number(searchParams.get("bedrooms") || 0);
  const page = Number(searchParams.get("page") || 1);

  return {
    pageNumber: Number.isFinite(page) && page > 0 ? page : 1,
    currentSortingOption,
    listingStatus: listingStatusFromParams(searchParams),
    propertyTypes: type ? [type] : [],
    priceRange: [
      Number.isFinite(minPrice) && minPrice > 0 ? minPrice : 0,
      Number.isFinite(maxPrice) && maxPrice > 0 ? maxPrice : LISTING_MAX_PRICE,
    ],
    bedrooms: Number.isFinite(bedrooms) && bedrooms > 0 ? bedrooms : 0,
    location: searchParams.get("city") || "All Cities",
    searchQuery: searchParams.get("search") || "",
  };
}

export function buildListingSearchParams({
  page = 1,
  currentSortingOption = "Newest",
  listingStatus = "All",
  propertyTypes = [],
  priceRange = [0, LISTING_MAX_PRICE],
  bedrooms = 0,
  location = "All Cities",
  searchQuery = "",
} = {}) {
  const params = new URLSearchParams();
  const sort =
    LISTING_SORT_OPTIONS[currentSortingOption] || LISTING_SORT_OPTIONS.Newest;

  if (page > 1) params.set("page", String(page));
  if (listingStatus === "Buy") params.set("listingType", "sale");
  if (listingStatus === "Rent") params.set("listingType", "rent");
  if (listingStatus === "Sold") params.set("status", "sold");
  if (propertyTypes.length === 1) params.set("type", propertyTypes[0]);
  if (priceRange[0] > 0) params.set("minPrice", String(priceRange[0]));
  if (priceRange[1] < LISTING_MAX_PRICE) {
    params.set("maxPrice", String(priceRange[1]));
  }
  if (bedrooms > 0) params.set("bedrooms", String(bedrooms));
  if (location && location !== "All Cities") params.set("city", location);

  const trimmedSearch = searchQuery.trim();
  if (trimmedSearch) params.set("search", trimmedSearch);

  if (sort.sortBy !== "createdAt" || sort.sortOrder !== "desc") {
    params.set("sortBy", sort.sortBy);
    params.set("sortOrder", sort.sortOrder);
  }

  return params;
}

export function buildListingsHref(filterState) {
  const params = buildListingSearchParams(filterState);
  const qs = params.toString();
  return qs ? `/listings?${qs}` : "/listings";
}

export function buildSavedSearchFilters(queryParams) {
  const filters = { ...queryParams };
  delete filters.page;
  delete filters.limit;
  return filters;
}

export function buildListingsHrefFromSavedFilters(filters = {}) {
  const listingStatus =
    filters.listingType === "sale"
      ? "Buy"
      : filters.listingType === "rent"
        ? "Rent"
        : filters.status === "sold"
          ? "Sold"
          : "All";

  const sortEntry = Object.entries(LISTING_SORT_OPTIONS).find(
    ([, value]) =>
      value.sortBy === filters.sortBy && value.sortOrder === filters.sortOrder,
  );

  return buildListingsHref({
    listingStatus,
    propertyTypes: filters.type ? [filters.type] : [],
    priceRange: [
      Number(filters.minPrice) > 0 ? Number(filters.minPrice) : 0,
      Number(filters.maxPrice) > 0
        ? Number(filters.maxPrice)
        : LISTING_MAX_PRICE,
    ],
    bedrooms: Number(filters.bedrooms) > 0 ? Number(filters.bedrooms) : 0,
    location: filters.city || "All Cities",
    searchQuery: filters.search || "",
    currentSortingOption: sortEntry?.[0] || "Newest",
  });
}

export function buildSavedSearchName({
  listingStatus = "All",
  location = "All Cities",
  searchQuery = "",
} = {}) {
  const parts = [];

  if (listingStatus === "Buy") parts.push("For sale");
  else if (listingStatus === "Rent") parts.push("For rent");
  else if (listingStatus === "Sold") parts.push("Sold");

  if (location && location !== "All Cities") parts.push(`in ${location}`);

  const trimmedSearch = searchQuery.trim();
  if (trimmedSearch) parts.push(`"${trimmedSearch}"`);

  return parts.length ? parts.join(" ") : "All listings";
}

/** Hero home search → API property type */
export const HERO_PROPERTY_TYPE_MAP = {
  Apartments: "apartment",
  Bungalow: "townhouse",
  Houses: "villa",
  Office: "commercial",
  TownHome: "townhouse",
  Villa: "villa",
};
