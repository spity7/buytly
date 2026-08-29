import { formatPrice } from "./formatPrice";

const PLACEHOLDER_IMAGE = "/images/listings/list-1.jpg";

export function mapPropertyToCard(property) {
  if (!property) return null;

  const id = property._id || property.id;
  const firstMedia = property.media?.[0];
  const image =
    firstMedia?.url ||
    property.thumbnail ||
    property.image ||
    PLACEHOLDER_IMAGE;
  const locationObj = property.location;
  const location =
    property.locationLabel ||
    locationObj?.address ||
    [locationObj?.city, locationObj?.country].filter(Boolean).join(", ") ||
    property.location ||
    "—";

  return {
    id,
    _id: id,
    title: property.title || "Untitled",
    image,
    bed: property.bedrooms ?? property.bed ?? 0,
    bath: property.bathrooms ?? property.bath ?? 0,
    sqft: property.area ?? property.sqft ?? 0,
    price:
      property.priceLabel || formatPrice(property.price, property.currency),
    priceValue: property.price,
    currency: property.currency || "USD",
    forRent: property.listingType === "rent",
    listingType: property.listingType,
    location,
    city: locationObj?.city || property.city,
    type: property.type,
    propertyType: property.type,
    status: property.status,
    amenities: property.amenities || [],
    features: property.amenities || property.features || [],
    description: property.description,
    viewCount: property.viewCount ?? 0,
    media: property.media || [],
    createdAt: property.createdAt,
    updatedAt: property.updatedAt,
    raw: property,
  };
}

export function mapPropertiesToCards(properties = []) {
  return properties.map(mapPropertyToCard).filter(Boolean);
}

export function getStatusLabel(status) {
  const labels = {
    draft: "Draft",
    pending: "Pending Review",
    active: "Published",
    sold: "Sold",
    rented: "Rented",
    archived: "Archived",
  };
  return labels[status] || status || "—";
}

export function isPropertyTerminal(status) {
  return status === "sold" || status === "rented" || status === "archived";
}

export function isPropertyBookable(status) {
  return status === "active";
}

export function getStatusClass(status) {
  switch (status) {
    case "pending":
      return "pending-style style1";
    case "active":
      return "pending-style style2";
    case "draft":
      return "pending-style style3";
    case "sold":
    case "rented":
      return "pending-style style4";
    case "archived":
      return "pending-style style5";
    default:
      return "pending-style style1";
  }
}
