import {
  coordinatesToLatLngStrings,
  latLngStringsToGeoJsonCoordinates,
} from "@/lib/geo/propertyCoordinates";
import { getVirtualTourUrlFieldError } from "@/lib/properties/fieldErrors";

export const MIN_PROJECT_UNITS_TO_PUBLISH = 1;

export function getProjectPublishRules() {
  return { minUnits: MIN_PROJECT_UNITS_TO_PUBLISH, maxUnits: null };
}

export function getProjectSubmitReviewMessage() {
  return "Add at least one unit before you can publish.";
}

export function countProjectUnits(project) {
  if (!project) return 0;
  if (Array.isArray(project.units)) {
    return project.units.length;
  }
  return project.unitCount ?? 0;
}

export function isProjectReadyToPublish(unitCount) {
  const { minUnits } = getProjectPublishRules();
  return unitCount >= minUnits;
}

/** Whether the publish / submit CTA should show on the project edit sidebar. */
export function canShowProjectPublishAction(
  project,
  unitCount,
  { isTrashed = false, isAdmin = false } = {},
) {
  if (isTrashed || !isProjectReadyToPublish(unitCount)) {
    return false;
  }

  const status = project?.status;
  if (isAdmin) {
    return status !== "active" && status !== "sold";
  }

  return status !== "pending" && status !== "active" && status !== "sold";
}

export function getProjectPublishButtonLabel({ isAdmin, status } = {}) {
  if (!isAdmin) {
    return "Submit for review";
  }
  if (status === "pending") {
    return "Approve & publish";
  }
  return "Publish project";
}

export function emptyProjectFormState() {
  return {
    title: "",
    description: "",
    address: "",
    city: "",
    country: "",
    latitude: "",
    longitude: "",
    amenities: [],
    virtualTourUrl: "",
    agentId: "",
  };
}

function normalizeProjectFormSlice(state) {
  return {
    title: (state.title || "").trim(),
    description: (state.description || "").trim(),
    address: (state.address || "").trim(),
    city: (state.city || "").trim(),
    country: (state.country || "").trim(),
    latitude: String(state.latitude ?? "").trim(),
    longitude: String(state.longitude ?? "").trim(),
    virtualTourUrl: (state.virtualTourUrl || "").trim(),
    agentId: state.agentId || "",
    amenities: [...(state.amenities || [])].sort(),
  };
}

/** True when the current form differs from the loaded project snapshot. */
export function isProjectFormDirty(current, baseline) {
  if (!baseline) {
    return true;
  }

  return (
    JSON.stringify(normalizeProjectFormSlice(current)) !==
    JSON.stringify(normalizeProjectFormSlice(baseline))
  );
}

export function getProjectAgentId(project) {
  const agent = project?.agentId;
  if (!agent) return "";
  if (typeof agent === "string") return agent;
  return agent._id || agent.id || "";
}

export function projectToFormState(project) {
  if (!project) {
    return emptyProjectFormState();
  }

  return {
    title: project.title || "",
    description: project.description || "",
    address: project.location?.address || "",
    city: project.location?.city || "",
    country: project.location?.country || "",
    ...coordinatesToLatLngStrings(project.location?.coordinates),
    amenities: project.amenities || [],
    virtualTourUrl: project.virtualTourUrl || "",
    agentId: getProjectAgentId(project),
  };
}

export function buildProjectPayload(form, options = {}) {
  const { includeAgentId = false } = options;

  const coordinates = latLngStringsToGeoJsonCoordinates(
    form.longitude,
    form.latitude,
  );
  if (!coordinates) {
    return { error: "Pin the project on the map." };
  }

  const tourError = getVirtualTourUrlFieldError(form.virtualTourUrl);
  if (tourError) {
    return { error: tourError };
  }

  const title = form.title.trim();
  const description = form.description.trim();

  if (title.length < 3) {
    return { error: "Title must be at least 3 characters." };
  }
  if (description.length < 10) {
    return { error: "Description must be at least 10 characters." };
  }

  const payload = {
    title,
    description,
    location: {
      coordinates,
      address: form.address.trim(),
      city: form.city.trim(),
      country: form.country.trim(),
    },
    amenities: form.amenities,
    virtualTourUrl: form.virtualTourUrl.trim() || undefined,
  };

  if (includeAgentId && form.agentId) {
    payload.agentId = form.agentId;
  }

  return { payload };
}

export function formatProjectTimestamp(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}
