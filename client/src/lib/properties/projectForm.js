import {
  coordinatesToLatLngStrings,
  latLngStringsToGeoJsonCoordinates,
} from "@/lib/geo/propertyCoordinates";
import { getVirtualTourUrlFieldError } from "@/lib/properties/fieldErrors";

/** Matches server `SINGLE_PROJECT_UNIT_TYPE` — only unit type on single projects. */
export const SINGLE_PROJECT_UNIT_TYPE = "villa";

export function getProjectPublishRules(kind) {
  if (kind === "single") {
    return { minUnits: 1, maxUnits: 1 };
  }
  return { minUnits: 1, maxUnits: null };
}

export function getProjectSubmitReviewMessage(kind) {
  if (kind === "single") {
    return "Single projects need exactly one unit.";
  }
  return "Compound projects need at least one unit.";
}

export function countProjectUnitsForKind(project) {
  if (!project) return 0;
  if (Array.isArray(project.units)) {
    return project.units.length;
  }
  return project.unitCount ?? 0;
}

export function canChangeProjectKind(project, unitCount) {
  if (!project) return false;
  return project.status === "draft" && unitCount === 0;
}

export function isProjectReadyToPublish(kind, unitCount) {
  const { minUnits, maxUnits } = getProjectPublishRules(kind);
  if (unitCount < minUnits) return false;
  if (maxUnits != null && unitCount > maxUnits) return false;
  return true;
}

export function hasTooManyUnitsForKind(kind, unitCount) {
  const { maxUnits } = getProjectPublishRules(kind);
  return maxUnits != null && unitCount > maxUnits;
}

export function getProjectAgentId(project) {
  const agent = project?.agentId;
  if (!agent) return "";
  if (typeof agent === "string") return agent;
  return agent._id || agent.id || "";
}

export function emptyProjectFormState(kind = "") {
  return {
    title: "",
    description: "",
    kind: kind || "",
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

export function projectToFormState(project) {
  if (!project) {
    return emptyProjectFormState();
  }

  return {
    title: project.title || "",
    description: project.description || "",
    kind: project.kind || "",
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
  const { includeKind = false, includeAgentId = false } = options;

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

  if (includeKind) {
    if (!form.kind) {
      return { error: "Choose a project type." };
    }
    payload.kind = form.kind;
  }

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
