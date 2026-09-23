import { formatPrice } from "./formatPrice";
import { getListingStatusBadgeClassName } from "@/lib/statusBadges";

const PLACEHOLDER_IMAGE = "/images/listings/list-1.jpg";

/** Display label for API `location` (object or legacy string). */
export function formatPropertyLocationLabel(location, fallback = "—") {
  if (location == null || location === "") return fallback;
  if (typeof location === "string") {
    const trimmed = location.trim();
    return trimmed || fallback;
  }

  const address = location.address?.trim();
  if (address) return address;

  const cityCountry = [location.city, location.country]
    .filter(Boolean)
    .join(", ");
  if (cityCountry) return cityCountry;

  return fallback;
}

export function mapPropertyToCard(property) {
  if (!property) return null;

  const id = property._id || property.id;
  const firstImage = property.media
    ?.filter((item) => item.type === "image")
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))[0];
  const firstMedia = property.media?.[0];
  const image =
    firstImage?.url ||
    (firstMedia?.type !== "video" ? firstMedia?.url : undefined) ||
    property.thumbnail ||
    property.image ||
    PLACEHOLDER_IMAGE;
  const locationObj = property.location;
  const coordinates = locationObj?.coordinates;
  const lng = Array.isArray(coordinates) ? coordinates[0] : undefined;
  const lat = Array.isArray(coordinates) ? coordinates[1] : undefined;
  const location =
    property.locationLabel || formatPropertyLocationLabel(locationObj, "—");

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
    itemType: "unit",
    projectTitle:
      property.projectId?.title ||
      property.project?.title ||
      property.raw?.projectId?.title,
    location,
    lat,
    lng,
    long: lng,
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

export function mapProjectToCard(project) {
  if (!project) return null;

  const id = project._id || project.id;
  const firstImage = project.media
    ?.filter((item) => item.type === "image")
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))[0];
  const image = firstImage?.url || PLACEHOLDER_IMAGE;
  const locationObj = project.location;
  const location = formatPropertyLocationLabel(locationObj, "—");
  const priceMin = project.priceMin;
  const priceLabel =
    priceMin != null
      ? `From ${formatPrice(priceMin, project.currency || "USD")}`
      : "Price on request";

  return {
    id,
    _id: id,
    slug: project.slug,
    title: project.title || "Untitled",
    image,
    location,
    itemType: "project",
    unitCount: project.unitCount ?? 0,
    price: priceLabel,
    priceValue: priceMin,
    status: project.status,
    description: project.description,
    media: project.media || [],
    raw: project,
  };
}

export function mapProjectsToCards(projects = []) {
  return projects.map(mapProjectToCard).filter(Boolean);
}

export function getStatusLabel(status) {
  const labels = {
    draft: "Draft",
    pending: "Pending Review",
    active: "Published",
    sold: "Sold",
    archived: "Archived",
  };
  return labels[status] || status || "—";
}

/** Dashboard row label — trashed listings use Trash, not the archived status flag alone. */
export function getTrashedListingLabel() {
  return "In trash";
}

export function getProjectDashboardStatusLabel(
  project,
  { isTrashView = false } = {},
) {
  if (isTrashView || project?.deletedAt) {
    return getTrashedListingLabel();
  }
  return getStatusLabel(project?.status);
}

export function getPropertyDashboardStatusLabel(
  property,
  { isTrashView = false } = {},
) {
  if (isTrashView || property?.deletedAt) {
    return getTrashedListingLabel();
  }
  return getStatusLabel(property?.status);
}

const PARENT_PROJECT_LIVE_STATUSES = ["active", "sold"];

export function canAdminApproveUnit(property) {
  const project = property?.projectId;
  if (!project || typeof project === "string") {
    return false;
  }
  if (project.deletedAt) {
    return false;
  }
  return PARENT_PROJECT_LIVE_STATUSES.includes(project.status);
}

export function canAddUnitToProject(project) {
  if (!project || project.deletedAt) {
    return false;
  }
  if (project.status === "sold" || project.status === "archived") {
    return false;
  }
  return true;
}

export function isListingPubliclyPreviewable(status) {
  return status === "active" || status === "sold";
}

export function partitionProjectUnits(units = []) {
  const available = [];
  const sold = [];

  for (const unit of units) {
    if (unit.status === "sold") {
      sold.push(unit);
    } else if (unit.status === "active") {
      available.push(unit);
    }
  }

  return { available, sold };
}

export function isUnitRestoreBlockedByParentProject(property) {
  const project = property?.projectId;
  if (!project || typeof project === "string") {
    return false;
  }
  return Boolean(project.deletedAt);
}

export function isPropertyTerminal(status) {
  return status === "sold" || status === "archived";
}

export function isPropertyBookable(status) {
  return status === "active";
}

export function getStatusClass(status) {
  return getListingStatusBadgeClassName(status);
}
