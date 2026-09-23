"use client";

import { buytlyApi } from "@/api/generated";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import FormFieldError from "@/components/common/FormFieldError";
import { DashboardFormSkeleton } from "@/components/property/dashboard/skeletons/DashboardSkeletons";
import { useConfirmAction } from "@/hooks/useConfirmAction";
import { getApiError } from "@/lib/auth/getApiError";
import {
  propertyMediaDeleteConfirmation,
  propertyAdminPublishConfirmation,
  propertyPublishConfirmation,
} from "@/lib/confirmations";
import { notifyError } from "@/lib/toast";
import { getVirtualTourUrlFieldError } from "@/lib/properties/fieldErrors";
import { PRICE_FROM_LABEL } from "@/lib/properties/formatPrice";
import { isPropertyTerminal } from "@/lib/properties/mapProperty";
import PropertyUnitProjectCard from "@/components/property/dashboard/dashboard-add-property/PropertyUnitProjectCard";
import PropertyFormNearbyPreview from "@/components/property/dashboard/dashboard-add-property/PropertyFormNearbyPreview";
import VideoFilePlayer from "@/components/common/VideoFilePlayer";
import PropertyPhotoGallery from "@/components/property/dashboard/dashboard-add-property/PropertyPhotoGallery";
import {
  createPendingGalleryItem,
  getSavedGalleryIds,
  mediaToSavedGalleryItems,
  moveGalleryItem,
  sortPropertyImages,
} from "@/lib/properties/propertyPhotoGallery";
import { reorderPropertyImages } from "@/lib/properties/reorderPropertyMedia";
import { coordinatesToLatLngStrings } from "@/lib/geo/propertyCoordinates";
import {
  useCatalogAmenities,
  useCatalogPropertyTypes,
} from "@/hooks/useCatalog";
import PropertyFormStatusBanner from "@/components/property/dashboard/dashboard-add-property/PropertyFormStatusBanner";
import PropertyFormActions from "@/components/property/dashboard/dashboard-add-property/PropertyFormActions";
import { getPropertyFormCancelHref } from "@/lib/properties/propertyFormActions";
import { invalidatePropertyQueries } from "@/lib/properties/invalidatePropertyQueries";
import { useProject } from "@/hooks/useProjects";
import { useAuth } from "@/providers/AuthProvider";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

function sanitizeWholeNumberInput(value) {
  if (value === "") return "";
  const digits = String(value).replace(/\D/g, "");
  return digits === "" ? "" : String(parseInt(digits, 10));
}

function formatWholeNumberField(value) {
  if (value == null || value === "") return "";
  const n = Number(value);
  if (Number.isNaN(n)) return "";
  return String(Math.trunc(n));
}

function parseOptionalWholeNumber(value) {
  if (value === "" || value == null) return undefined;
  const n = parseInt(String(value), 10);
  return Number.isNaN(n) ? undefined : n;
}

const AREA_SQM_PATTERN = /^\d+(?:\.\d{1,2})?$/;

function sanitizeAreaSqmInput(value) {
  if (value === "") return "";
  let cleaned = String(value).replace(/[^\d.]/g, "");
  const dotIndex = cleaned.indexOf(".");
  if (dotIndex !== -1) {
    const whole = cleaned.slice(0, dotIndex);
    const fraction = cleaned
      .slice(dotIndex + 1)
      .replace(/\./g, "")
      .slice(0, 2);
    cleaned = `${whole}.${fraction}`;
  }
  return cleaned;
}

/** Listing price: whole USD only, > 0. */
function parseRequiredPriceUsd(value) {
  if (value === "" || value == null) return null;
  const trimmed = String(value).trim();
  if (!/^\d+$/.test(trimmed)) return null;
  const n = Number(trimmed);
  if (!Number.isSafeInteger(n) || n <= 0) return null;
  return n;
}

/** Area (sqm): optional; if set, > 0 with at most 2 decimal places. */
function parseOptionalAreaSqm(value) {
  if (value === "" || value == null) return undefined;
  const trimmed = String(value).trim();
  if (!AREA_SQM_PATTERN.test(trimmed)) return null;
  const n = Number(trimmed);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

const TYPE_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const TOP_LEVEL_FIELD_ERROR_KEYS = [
  "title",
  "description",
  "type",
  "price",
  "bedrooms",
  "bathrooms",
  "area",
  "virtualTourUrl",
];

const emptyFieldErrors = () => ({
  title: "",
  description: "",
  type: "",
  price: "",
  bedrooms: "",
  bathrooms: "",
  area: "",
  virtualTourUrl: "",
  floorPlans: {},
});

function getTitleFieldError(value) {
  const trimmed = (value ?? "").trim();
  if (!trimmed) return "Enter a listing title.";
  if (trimmed.length < 3) return "Title must be at least 3 characters.";
  if (trimmed.length > 200) return "Title must be 200 characters or less.";
  return "";
}

function getDescriptionFieldError(value) {
  const trimmed = (value ?? "").trim();
  if (!trimmed) return "Enter a description.";
  if (trimmed.length < 10) return "Description must be at least 10 characters.";
  return "";
}

function getTypeFieldError(value) {
  if (!value) return "Choose a property type.";
  if (!TYPE_SLUG_PATTERN.test(value)) return "Choose a valid property type.";
  return "";
}

function getOptionalWholeNumberFieldError(value, fieldLabel) {
  if (value === "" || value == null) return "";
  const n = parseOptionalWholeNumber(value);
  if (n === undefined || n < 0) {
    return `Use a whole number for ${fieldLabel}, or clear the field.`;
  }
  return "";
}

function floorPlanRowHasContent(plan) {
  return Boolean(
    plan.title?.trim() || plan.imageFile || plan.url || plan.gcsKey,
  );
}

function floorPlanHasImage(plan) {
  return Boolean(plan.imageFile || plan.url || plan.gcsKey);
}

function getFloorPlanTitleFieldError(plan) {
  if (!floorPlanRowHasContent(plan)) return "";
  const trimmed = (plan.title ?? "").trim();
  if (!trimmed) return "Enter a title for this floor plan.";
  if (trimmed.length > 100) return "Title must be 100 characters or less.";
  return "";
}

function getPriceFieldError(value) {
  if (value === "" || value == null) {
    return "Enter a listing price.";
  }
  if (parseRequiredPriceUsd(value) == null) {
    return "Use a whole number of USD greater than 0 (no cents).";
  }
  return "";
}

function getAreaFieldError(value) {
  if (value === "" || value == null) return "";
  if (parseOptionalAreaSqm(value) === null) {
    return "Use a positive sqm value with at most 2 decimal places, or clear the field.";
  }
  return "";
}

function getFloorPlanImageFieldError(plan) {
  if (!plan.title?.trim()) return "";
  if (floorPlanHasImage(plan)) return "";
  return "Upload a plan image for this level.";
}

function collectFloorPlanFieldErrors(plan) {
  if (!floorPlanRowHasContent(plan)) return null;

  const errors = {
    title: getFloorPlanTitleFieldError(plan),
    image: getFloorPlanImageFieldError(plan),
  };

  const filtered = Object.fromEntries(
    Object.entries(errors).filter(([, message]) => Boolean(message)),
  );
  return Object.keys(filtered).length ? filtered : null;
}

function validatePropertyFormFields(form) {
  const floorPlans = {};
  form.floorPlans.forEach((plan, index) => {
    const planErrors = collectFloorPlanFieldErrors(plan);
    if (planErrors) floorPlans[index] = planErrors;
  });

  return {
    title: getTitleFieldError(form.title),
    description: getDescriptionFieldError(form.description),
    type: getTypeFieldError(form.type),
    price: getPriceFieldError(form.price),
    bedrooms: getOptionalWholeNumberFieldError(form.bedrooms, "bedrooms"),
    bathrooms: getOptionalWholeNumberFieldError(form.bathrooms, "bathrooms"),
    area: getAreaFieldError(form.area),
    virtualTourUrl: getVirtualTourUrlFieldError(form.virtualTourUrl),
    floorPlans,
  };
}

function fieldErrorsAreEmpty(errors) {
  if (TOP_LEVEL_FIELD_ERROR_KEYS.some((key) => errors[key])) return false;
  return Object.values(errors.floorPlans).every(
    (planErrors) => !Object.values(planErrors).some(Boolean),
  );
}

function blockWholeNumberKeyDown(event) {
  if (event.ctrlKey || event.metaKey || event.altKey) return;

  const allowedKeys = new Set([
    "Backspace",
    "Delete",
    "Tab",
    "Escape",
    "Enter",
    "ArrowLeft",
    "ArrowRight",
    "ArrowUp",
    "ArrowDown",
    "Home",
    "End",
  ]);

  if (allowedKeys.has(event.key)) return;
  if (/^\d$/.test(event.key)) return;

  event.preventDefault();
}

function WholeNumberInput({
  value,
  onChange,
  className,
  placeholder,
  id,
  inputRef,
  invalid,
  ariaDescribedBy,
  onBlur,
}) {
  return (
    <input
      ref={inputRef}
      id={id}
      type="text"
      className={className}
      placeholder={placeholder}
      inputMode="numeric"
      pattern="[0-9]*"
      autoComplete="off"
      value={value}
      onChange={(event) =>
        onChange(sanitizeWholeNumberInput(event.target.value))
      }
      onKeyDown={blockWholeNumberKeyDown}
      onPaste={(event) => {
        event.preventDefault();
        onChange(sanitizeWholeNumberInput(event.clipboardData.getData("text")));
      }}
      onBlur={onBlur}
      aria-invalid={invalid || undefined}
      aria-describedby={ariaDescribedBy}
    />
  );
}

function invalidClass(hasError) {
  return hasError ? " is-invalid" : "";
}

const emptyFloorPlan = () => ({
  title: "",
  gcsKey: "",
  url: "",
  imageFile: null,
  imageName: "",
});

const emptyForm = {
  title: "",
  description: "",
  type: "apartment",
  price: "",
  currency: "USD",
  bedrooms: "",
  bathrooms: "",
  area: "",
  status: "draft",
  amenities: [],
  virtualTourUrl: "",
  floorPlans: [],
  sortOrder: "",
};

function buildFormFromProperty(property) {
  if (!property) return emptyForm;

  return {
    title: property.title || "",
    description: property.description || "",
    type: property.type || "apartment",
    price: property.price?.toString() || "",
    currency: property.currency || "USD",
    bedrooms: formatWholeNumberField(property.bedrooms),
    bathrooms: formatWholeNumberField(property.bathrooms),
    area: property.area?.toString() || "",
    status: property.status || "draft",
    amenities: property.amenities || [],
    virtualTourUrl: property.virtualTourUrl || "",
    sortOrder:
      property.sortOrder != null && property.sortOrder !== ""
        ? String(property.sortOrder)
        : "",
    floorPlans: (property.floorPlans || []).map((plan) => ({
      title: plan.title || "",
      gcsKey: plan.gcsKey || "",
      url: plan.url || "",
      imageFile: null,
      imageName: plan.title ? `${plan.title} plan` : "Floor plan image",
    })),
  };
}

function getProjectIdRef(projectRef) {
  if (!projectRef) return null;
  if (typeof projectRef === "string") return projectRef;
  return projectRef._id || projectRef.id || null;
}

function formsEqual(a, b) {
  if (!a || !b) return a === b;

  return Object.keys(emptyForm).every((key) => {
    if (key === "amenities") {
      const sortedA = [...a.amenities].sort().join("|");
      const sortedB = [...b.amenities].sort().join("|");
      return sortedA === sortedB;
    }
    if (key === "floorPlans") {
      return JSON.stringify(a.floorPlans) === JSON.stringify(b.floorPlans);
    }
    return a[key] === b[key];
  });
}

async function resolveFloorPlans(savedId, floorPlans) {
  const resolved = [];

  for (const plan of floorPlans) {
    if (!plan.title?.trim()) continue;

    const entry = {
      title: plan.title.trim(),
      gcsKey: plan.gcsKey || undefined,
    };

    if (plan.imageFile) {
      const upload = await buytlyApi.uploadFloorPlanImage(savedId, {
        image: plan.imageFile,
      });
      entry.gcsKey = upload.data?.gcsKey;
    }

    resolved.push(entry);
  }

  return resolved;
}

function splitMedia(media = []) {
  const images = sortPropertyImages(media);
  let video = null;

  for (const item of media) {
    if (item.type === "video" && !video) {
      video = item;
    }
  }

  return { images, video };
}

function isVideoFile(file) {
  return file.type.startsWith("video/");
}

function getSubmitLoadingMessage(isEdit, submitMode) {
  if (isEdit) {
    if (submitMode === "save") return "Saving changes...";
    if (submitMode === "draft") return "Saving draft...";
    return "Submitting listing for review...";
  }
  if (submitMode === "draft") return "Saving draft...";
  return "Publishing listing...";
}

function getSubmitSuccessMessage(isEdit, submitMode, status, isAdmin = false) {
  if (isAdmin && submitMode === "review") {
    return status === "pending"
      ? "Listing approved and published"
      : "Listing published";
  }
  if (isEdit) {
    if (status === "pending" && submitMode === "review") {
      return "Property submitted for review";
    }
    return "Property updated";
  }
  if (status === "pending") {
    return "Property submitted for review";
  }
  return "Property saved as draft";
}

export default function PropertyForm({
  propertyId,
  projectId: projectIdProp,
  unitDashboardLayout = false,
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const isEdit = Boolean(propertyId);
  const unitUnderProject = Boolean(projectIdProp) || unitDashboardLayout;
  const [linkedProjectId, setLinkedProjectId] = useState(projectIdProp ?? null);
  const { data: parentProject, isLoading: parentProjectLoading } = useProject(
    linkedProjectId,
    { enabled: Boolean(linkedProjectId) },
  );
  const projectMapCoords = useMemo(() => {
    const coords = parentProject?.location?.coordinates;
    if (!Array.isArray(coords) || coords.length < 2) {
      return { latitude: "", longitude: "" };
    }
    return coordinatesToLatLngStrings(coords);
  }, [parentProject?.location?.coordinates]);

  useEffect(() => {
    if (projectIdProp) {
      setLinkedProjectId(projectIdProp);
    }
  }, [projectIdProp]);
  const { data: propertyTypes = [], isLoading: propertyTypesLoading } =
    useCatalogPropertyTypes();
  const { data: amenitiesCatalog = [], isLoading: amenitiesLoading } =
    useCatalogAmenities();
  const [form, setForm] = useState(emptyForm);
  const [baselineForm, setBaselineForm] = useState(isEdit ? null : emptyForm);
  const [photoGallery, setPhotoGallery] = useState([]);
  const [baselinePhotoIds, setBaselinePhotoIds] = useState([]);
  const [existingVideo, setExistingVideo] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(isEdit);
  const { requestConfirm, run, isLocked, dialogProps } = useConfirmAction();
  const submitModeRef = useRef("review");
  const [activeSubmitMode, setActiveSubmitMode] = useState("review");
  const [fieldErrors, setFieldErrors] = useState(emptyFieldErrors);
  const titleInputRef = useRef(null);
  const descriptionInputRef = useRef(null);
  const typeSelectRef = useRef(null);
  const priceInputRef = useRef(null);
  const bedroomsInputRef = useRef(null);
  const bathroomsInputRef = useRef(null);
  const areaInputRef = useRef(null);
  const virtualTourInputRef = useRef(null);
  const [propertyStatus, setPropertyStatus] = useState(null);
  const [propertyMeta, setPropertyMeta] = useState(null);
  const photoGalleryRef = useRef(photoGallery);
  photoGalleryRef.current = photoGallery;
  const videoPreviewRef = useRef(videoPreview);
  videoPreviewRef.current = videoPreview;

  const hasChanges = useMemo(() => {
    const baseline = isEdit ? baselineForm : emptyForm;
    if (!baseline) return false;
    const photoOrderChanged =
      JSON.stringify(getSavedGalleryIds(photoGallery)) !==
      JSON.stringify(baselinePhotoIds);
    const hasPendingPhotos = photoGallery.some(
      (item) => item.type === "pending",
    );

    return (
      !formsEqual(form, baseline) ||
      hasPendingPhotos ||
      photoOrderChanged ||
      Boolean(videoFile) ||
      form.floorPlans.some((plan) => plan.imageFile)
    );
  }, [baselineForm, baselinePhotoIds, form, isEdit, photoGallery, videoFile]);

  useEffect(() => {
    if (isEdit || !propertyTypes.length) return;
    setForm((prev) => {
      if (propertyTypes.some((type) => type.value === prev.type)) {
        return prev;
      }
      return { ...prev, type: propertyTypes[0].value };
    });
  }, [isEdit, propertyTypes]);

  useEffect(() => {
    if (!isEdit) return;

    let cancelled = false;

    async function loadProperty() {
      setIsLoading(true);
      try {
        const response = await buytlyApi.getPropertyById(propertyId);
        if (!cancelled) {
          const loadedForm = buildFormFromProperty(response.data);
          setForm(loadedForm);
          setBaselineForm(loadedForm);
          setPropertyStatus(response.data?.status || null);
          setPropertyMeta({
            createdAt: response.data?.createdAt,
            updatedAt: response.data?.updatedAt,
            viewCount: response.data?.viewCount ?? 0,
            type: response.data?.type,
          });
          const projectRef = response.data?.projectId;
          const projectIdFromProperty = getProjectIdRef(projectRef);
          if (projectIdFromProperty) {
            setLinkedProjectId(projectIdFromProperty);
          }
          const { images, video } = splitMedia(response.data?.media || []);
          setPhotoGallery(mediaToSavedGalleryItems(images));
          setBaselinePhotoIds(images.map((item) => item._id));
          setExistingVideo(video);
        }
      } catch (error) {
        notifyError(getApiError(error));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadProperty();
    return () => {
      cancelled = true;
    };
  }, [isEdit, propertyId]);

  useEffect(() => {
    return () => {
      photoGalleryRef.current.forEach((item) => {
        if (item.type === "pending" && item.url?.startsWith("blob:")) {
          URL.revokeObjectURL(item.url);
        }
      });
      const preview = videoPreviewRef.current;
      if (preview?.url?.startsWith("blob:")) {
        URL.revokeObjectURL(preview.url);
      }
    };
  }, []);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const syncTopLevelFieldError = useCallback((field, value) => {
    let message = "";
    switch (field) {
      case "title":
        message = getTitleFieldError(value);
        break;
      case "description":
        message = getDescriptionFieldError(value);
        break;
      case "type":
        message = getTypeFieldError(value);
        break;
      case "price":
        message = getPriceFieldError(value);
        break;
      case "bedrooms":
        message = getOptionalWholeNumberFieldError(value, "bedrooms");
        break;
      case "bathrooms":
        message = getOptionalWholeNumberFieldError(value, "bathrooms");
        break;
      case "area":
        message = getAreaFieldError(value);
        break;
      case "virtualTourUrl":
        message = getVirtualTourUrlFieldError(value);
        break;
      default:
        break;
    }
    setFieldErrors((prev) => ({ ...prev, [field]: message }));
  }, []);

  const focusFirstFieldError = useCallback((errors) => {
    const refByField = {
      title: titleInputRef,
      description: descriptionInputRef,
      type: typeSelectRef,
      price: priceInputRef,
      bedrooms: bedroomsInputRef,
      bathrooms: bathroomsInputRef,
      area: areaInputRef,
      virtualTourUrl: virtualTourInputRef,
    };

    for (const key of TOP_LEVEL_FIELD_ERROR_KEYS) {
      if (!errors[key]) continue;
      const ref = refByField[key];
      ref.current?.focus();
      return;
    }

    const firstIndex = Number(
      Object.keys(errors.floorPlans).sort((a, b) => Number(a) - Number(b))[0],
    );
    if (Number.isNaN(firstIndex)) return;

    const planErrors = errors.floorPlans[firstIndex];
    for (const subField of ["title", "image"]) {
      if (!planErrors?.[subField]) continue;
      document.getElementById(`floor-plan-${firstIndex}-${subField}`)?.focus();
      return;
    }
  }, []);

  const runFormFieldValidation = useCallback(() => {
    const errors = validatePropertyFormFields(form);
    setFieldErrors(errors);
    if (!fieldErrorsAreEmpty(errors)) {
      focusFirstFieldError(errors);
      return false;
    }
    return true;
  }, [focusFirstFieldError, form]);

  const toggleAmenity = (amenity) => {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((item) => item !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const addFloorPlan = () => {
    setForm((prev) => ({
      ...prev,
      floorPlans: [...prev.floorPlans, emptyFloorPlan()],
    }));
  };

  const syncFloorPlanRowErrors = (index, plan) => {
    const collected = collectFloorPlanFieldErrors(plan);
    setFieldErrors((prev) => {
      const floorPlans = { ...prev.floorPlans };
      if (collected) floorPlans[index] = collected;
      else delete floorPlans[index];
      return { ...prev, floorPlans };
    });
  };

  const updateFloorPlan = (index, field, value) => {
    setForm((prev) => {
      const floorPlans = prev.floorPlans.map((plan, planIndex) =>
        planIndex === index ? { ...plan, [field]: value } : plan,
      );
      syncFloorPlanRowErrors(index, floorPlans[index]);
      return { ...prev, floorPlans };
    });
  };

  const removeFloorPlan = (index) => {
    setForm((prev) => {
      const plan = prev.floorPlans[index];
      if (plan?.url?.startsWith("blob:")) {
        URL.revokeObjectURL(plan.url);
      }
      return {
        ...prev,
        floorPlans: prev.floorPlans.filter(
          (_, planIndex) => planIndex !== index,
        ),
      };
    });
    setFieldErrors((prev) => {
      const floorPlans = {};
      Object.entries(prev.floorPlans).forEach(([i, err]) => {
        const n = Number(i);
        if (n === index) return;
        floorPlans[n > index ? n - 1 : n] = err;
      });
      return { ...prev, floorPlans };
    });
  };

  const touchFloorPlanRow = (index) => {
    const plan = form.floorPlans[index];
    if (plan) syncFloorPlanRowErrors(index, plan);
  };

  const clearFloorPlanImage = (index) => {
    setForm((prev) => {
      const floorPlans = prev.floorPlans.map((plan, planIndex) => {
        if (planIndex !== index) return plan;
        if (plan.url?.startsWith("blob:")) {
          URL.revokeObjectURL(plan.url);
        }
        return { ...plan, url: "", imageFile: null, gcsKey: "", imageName: "" };
      });
      syncFloorPlanRowErrors(index, floorPlans[index]);
      return { ...prev, floorPlans };
    });
  };

  const handleFloorPlanImage = (index, fileList) => {
    const file = fileList?.[0];
    if (!file) return;

    setForm((prev) => {
      const floorPlans = prev.floorPlans.map((plan, planIndex) => {
        if (planIndex !== index) return plan;
        if (plan.url?.startsWith("blob:")) {
          URL.revokeObjectURL(plan.url);
        }
        return {
          ...plan,
          imageFile: file,
          imageName: file.name,
          url: URL.createObjectURL(file),
        };
      });
      syncFloorPlanRowErrors(index, floorPlans[index]);
      return { ...prev, floorPlans };
    });
  };

  const handleImageSelect = useCallback((fileList) => {
    const files = Array.from(fileList || []).filter(
      (file) => !isVideoFile(file),
    );

    if (!files.length) {
      notifyError("Only image files can be uploaded in the photos section.");
      return;
    }

    setPhotoGallery((prev) => [
      ...prev,
      ...files.map((file) => createPendingGalleryItem(file)),
    ]);
  }, []);

  const handleVideoSelect = useCallback(
    (fileList) => {
      const file = fileList?.[0];
      if (!file) return;

      if (!isVideoFile(file)) {
        notifyError("Please choose a video file.");
        return;
      }

      if (existingVideo || videoFile) {
        notifyError(
          "This listing already has a video. Remove the current video before uploading a new one.",
        );
        return;
      }

      if (videoPreview?.url?.startsWith("blob:")) {
        URL.revokeObjectURL(videoPreview.url);
      }

      setVideoFile(file);
      setVideoPreview({
        url: URL.createObjectURL(file),
        name: file.name,
      });
    },
    [existingVideo, videoFile, videoPreview],
  );

  const setGalleryCover = useCallback((index) => {
    setPhotoGallery((prev) => moveGalleryItem(prev, index, 0));
  }, []);

  const moveGalleryPhotoLeft = useCallback((index) => {
    if (index <= 0) return;
    setPhotoGallery((prev) => moveGalleryItem(prev, index, index - 1));
  }, []);

  const moveGalleryPhotoRight = useCallback((index) => {
    setPhotoGallery((prev) => {
      if (index >= prev.length - 1) return prev;
      return moveGalleryItem(prev, index, index + 1);
    });
  }, []);

  const clearVideoPreview = useCallback(() => {
    if (videoPreview?.url?.startsWith("blob:")) {
      URL.revokeObjectURL(videoPreview.url);
    }
    setVideoFile(null);
    setVideoPreview(null);
  }, [videoPreview]);

  const promptDeleteMedia = (item, { onRemoved } = {}) => {
    if (!item?._id || !propertyId) return;

    requestConfirm({
      ...propertyMediaDeleteConfirmation(),
      action: {
        message: "Removing media...",
        successMessage: "Media removed",
        task: async () => {
          await buytlyApi.deletePropertyMedia(propertyId, item._id);
          onRemoved?.(item._id);
          await invalidatePropertyQueries(queryClient, { propertyId });
        },
      },
    });
  };

  const removeGalleryPhoto = (item, index) => {
    if (item.type === "saved") {
      promptDeleteMedia(item.media, {
        onRemoved: () => {
          setPhotoGallery((prev) => prev.filter((_, i) => i !== index));
          setBaselinePhotoIds((prev) => prev.filter((id) => id !== item.id));
        },
      });
      return;
    }

    if (item.url?.startsWith("blob:")) {
      URL.revokeObjectURL(item.url);
    }
    setPhotoGallery((prev) => prev.filter((_, i) => i !== index));
  };

  const executeSubmit = async (submitMode, { setProgress }) => {
    if (!runFormFieldValidation()) {
      throw new Error("Please fix the fields marked below.");
    }

    const payload = buildPayload(submitMode);
    let savedId = propertyId;
    let savedStatus = propertyStatus;

    if (isEdit) {
      const response = await buytlyApi.updateProperty(propertyId, payload);
      savedId = response.data?._id || propertyId;
      savedStatus = response.data?.status || propertyStatus;
      setPropertyStatus(savedStatus);
      setPropertyMeta((prev) => ({
        ...prev,
        updatedAt: response.data?.updatedAt || new Date().toISOString(),
        viewCount: response.data?.viewCount ?? prev?.viewCount ?? 0,
        type: response.data?.type ?? prev?.type,
      }));
    } else {
      const response = await buytlyApi.createProperty(payload);
      savedId = response.data?._id;
      savedStatus = response.data?.status;
    }

    if (savedId) {
      const hasFloorPlans = form.floorPlans.some((plan) => plan.title?.trim());
      if (hasFloorPlans || isEdit) {
        setProgress("Saving floor plans...");
        const floorPlans = await resolveFloorPlans(savedId, form.floorPlans);
        if (floorPlans.length || isEdit) {
          await buytlyApi.updateProperty(savedId, { floorPlans });
        }
      }
    }

    if (savedId && photoGallery.length) {
      setProgress("Saving photos...");
      const imageIds = [];

      for (const item of photoGallery) {
        if (item.type === "saved") {
          imageIds.push(item.id);
        } else {
          const uploadResponse = await buytlyApi.uploadPropertyMedia(savedId, {
            media: item.file,
          });
          const newId = uploadResponse.data?._id;
          if (newId) imageIds.push(newId);
        }
      }

      if (imageIds.length) {
        await reorderPropertyImages(savedId, imageIds);
      }
    }

    if (videoFile && savedId) {
      setProgress("Uploading video...");
      await buytlyApi.uploadPropertyMedia(savedId, { media: videoFile });
    }

    setBaselineForm(form);
    photoGallery.forEach((item) => {
      if (item.type === "pending" && item.url?.startsWith("blob:")) {
        URL.revokeObjectURL(item.url);
      }
    });
    clearVideoPreview();
    await invalidatePropertyQueries(queryClient, { propertyId: savedId });
    router.push(getPropertyFormCancelHref(isAdmin, projectIdProp));
    return { savedStatus };
  };

  const buildPayload = (submitMode = "review") => {
    const price = parseRequiredPriceUsd(form.price);
    const area = parseOptionalAreaSqm(form.area);

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      type: form.type,
      price,
      currency: "USD",
      bedrooms: parseOptionalWholeNumber(form.bedrooms),
      bathrooms: parseOptionalWholeNumber(form.bathrooms),
      area,
      amenities: form.amenities,
      virtualTourUrl: form.virtualTourUrl.trim() || undefined,
    };

    if (submitMode === "draft") {
      payload.status = "draft";
    } else if (submitMode === "review") {
      payload.status = "active";
    }

    if (!isEdit && projectIdProp) {
      payload.projectId = projectIdProp;
    }

    if (unitUnderProject) {
      const order = parseOptionalWholeNumber(form.sortOrder);
      if (order != null) payload.sortOrder = order;
    }

    return payload;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const submitMode = submitModeRef.current;
    setActiveSubmitMode(submitMode);
    const loadingMessage = getSubmitLoadingMessage(isEdit, submitMode);

    if (submitMode === "review") {
      requestConfirm({
        ...(isAdmin
          ? propertyAdminPublishConfirmation(propertyStatus)
          : propertyPublishConfirmation(isEdit)),
        action: {
          message: loadingMessage,
          successMessage: (result) =>
            getSubmitSuccessMessage(
              isEdit,
              submitMode,
              result.savedStatus,
              isAdmin,
            ),
          task: ({ setProgress }) => executeSubmit(submitMode, { setProgress }),
        },
      });
      return;
    }

    try {
      await run({
        message: loadingMessage,
        successMessage: (result) =>
          getSubmitSuccessMessage(
            isEdit,
            submitMode,
            result.savedStatus,
            isAdmin,
          ),
        task: ({ setProgress }) => executeSubmit(submitMode, { setProgress }),
      });
    } catch {
      // Toast handled by useConfirmAction
    }
  };

  const formBusy = isLocked;

  if (isLoading || (!isEdit && (propertyTypesLoading || amenitiesLoading))) {
    if (!unitDashboardLayout) {
      return <DashboardFormSkeleton rows={10} />;
    }

    return (
      <div className="unit-dashboard-page">
        <header className="unit-dashboard-page__header">
          <h2 className="unit-dashboard-page__title">
            {isEdit ? "Edit unit" : "Add unit"}
          </h2>
          <p className="unit-dashboard-page__lede mb0">Loading…</p>
        </header>
        <div className="row unit-dashboard-page__layout g-4">
          <div className="col-xl-8">
            <div className="unit-dashboard-page__form-panel bdrs12 default-box-shadow2 bgc-white overflow-hidden position-relative">
              <DashboardFormSkeleton rows={10} />
            </div>
          </div>
          <div className="col-xl-4">
            <div className="unit-dashboard-page__aside">
              <PropertyUnitProjectCard isLoading project={null} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isTerminal = isPropertyTerminal(propertyStatus);
  const parentProjectTrashed = Boolean(parentProject?.deletedAt);
  const formBlockedByParent =
    parentProjectTrashed && !isAdmin && Boolean(linkedProjectId);
  const mediaCount =
    photoGallery.length + (existingVideo ? 1 : 0) + (videoFile ? 1 : 0);
  const hasVideo = Boolean(existingVideo || videoFile);

  if (!isEdit && !projectIdProp) {
    return (
      <div className="form-style1 p30">
        <p className="mb20">
          Units must belong to a project. Start from{" "}
          <a href="/dashboard-add-project">Add New Project</a>.
        </p>
      </div>
    );
  }

  const formClassName = unitDashboardLayout
    ? "form-style1 unit-dashboard-page__form"
    : "form-style1 p30";

  const formContent = (
    <form className={formClassName} onSubmit={handleSubmit}>
      {isEdit && propertyStatus && (
        <PropertyFormStatusBanner
          status={propertyStatus}
          createdAt={propertyMeta?.createdAt}
          updatedAt={propertyMeta?.updatedAt}
          viewCount={propertyMeta?.viewCount}
          type={form.type || propertyMeta?.type}
          mediaCount={mediaCount}
          isAdmin={isAdmin}
        />
      )}

      {formBlockedByParent ? (
        <div className="alert alert-warning mb20" role="status">
          The parent project is in trash. Restore it from{" "}
          <a href="/dashboard-my-projects">My projects → Trash</a> before
          editing this unit.
        </div>
      ) : null}

      <fieldset
        disabled={(isTerminal && !isAdmin) || formBusy || formBlockedByParent}
        style={{ border: "none", padding: 0, margin: 0 }}
      >
        <div className="row">
          {unitUnderProject ? (
            <div className="col-sm-6">
              <div className="mb20">
                <label className="heading-color ff-heading fw600 mb10">
                  Sort order
                </label>
                <input
                  type="number"
                  min={0}
                  className="form-control"
                  placeholder="0"
                  value={form.sortOrder}
                  onChange={(e) => updateField("sortOrder", e.target.value)}
                />
                <p className="text fz13 mt10 mb0">
                  Lower numbers appear first on the project page.
                </p>
              </div>
            </div>
          ) : null}

          <div className="col-sm-12">
            <div className="mb20">
              <label className="heading-color ff-heading fw600 mb10">
                Title
              </label>
              <input
                ref={titleInputRef}
                id="property-title"
                type="text"
                className={`form-control${invalidClass(fieldErrors.title)}`}
                placeholder="e.g. Modern 3-bedroom apartment in downtown"
                value={form.title}
                onChange={(e) => {
                  const value = e.target.value;
                  updateField("title", value);
                  syncTopLevelFieldError("title", value);
                }}
                onBlur={() => syncTopLevelFieldError("title", form.title)}
                required
                minLength={3}
                aria-invalid={Boolean(fieldErrors.title)}
                aria-describedby={
                  fieldErrors.title ? "property-title-error" : undefined
                }
              />
              <FormFieldError
                id="property-title-error"
                message={fieldErrors.title}
              />
            </div>
          </div>

          <div className="col-sm-12">
            <div className="mb20">
              <label className="heading-color ff-heading fw600 mb10">
                Description
              </label>
              <textarea
                ref={descriptionInputRef}
                id="property-description"
                cols={30}
                rows={5}
                className={`form-control${invalidClass(fieldErrors.description)}`}
                placeholder="Describe the property, key features, neighborhood, and anything buyers should know."
                value={form.description}
                onChange={(e) => {
                  const value = e.target.value;
                  updateField("description", value);
                  syncTopLevelFieldError("description", value);
                }}
                onBlur={() =>
                  syncTopLevelFieldError("description", form.description)
                }
                required
                minLength={10}
                aria-invalid={Boolean(fieldErrors.description)}
                aria-describedby={
                  fieldErrors.description
                    ? "property-description-error"
                    : undefined
                }
              />
              <FormFieldError
                id="property-description-error"
                message={fieldErrors.description}
              />
            </div>
          </div>

          <div className="col-sm-6 col-xl-4">
            <div className="mb20">
              <label className="heading-color ff-heading fw600 mb10">
                Type
              </label>
              <select
                ref={typeSelectRef}
                id="property-type"
                className={`form-control${invalidClass(fieldErrors.type)}`}
                value={form.type}
                onChange={(e) => {
                  const value = e.target.value;
                  updateField("type", value);
                  syncTopLevelFieldError("type", value);
                }}
                onBlur={() => syncTopLevelFieldError("type", form.type)}
                required
                aria-invalid={Boolean(fieldErrors.type)}
                aria-describedby={
                  fieldErrors.type ? "property-type-error" : undefined
                }
              >
                {propertyTypes.map((type) => (
                  <option key={type.id} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              <FormFieldError
                id="property-type-error"
                message={fieldErrors.type}
              />
            </div>
          </div>

          <div className="col-sm-6 col-xl-4">
            <div className="mb20">
              <label className="heading-color ff-heading fw600 mb10">
                {PRICE_FROM_LABEL}
              </label>
              <input
                ref={priceInputRef}
                type="number"
                className={`form-control${fieldErrors.price ? " is-invalid" : ""}`}
                placeholder="e.g. 450000"
                value={form.price}
                onChange={(e) => {
                  const value = sanitizeWholeNumberInput(e.target.value);
                  updateField("price", value);
                  syncTopLevelFieldError("price", value);
                }}
                onBlur={() => syncTopLevelFieldError("price", form.price)}
                required
                min={1}
                step="1"
                inputMode="numeric"
                aria-invalid={Boolean(fieldErrors.price)}
                aria-describedby={
                  fieldErrors.price ? "property-price-error" : undefined
                }
              />
              <FormFieldError
                id="property-price-error"
                message={fieldErrors.price}
              />
            </div>
          </div>

          <div className="col-sm-6 col-xl-4">
            <div className="mb20">
              <label className="heading-color ff-heading fw600 mb10">
                Currency
              </label>
              <input
                type="text"
                className="form-control"
                value="USD"
                readOnly
                disabled
                aria-label="Currency (USD only)"
              />
              <p className="text mb0 mt10">
                All listings use US dollars (USD).
              </p>
            </div>
          </div>

          <div className="col-sm-6 col-xl-4">
            <div className="mb20">
              <label className="heading-color ff-heading fw600 mb10">
                Bedrooms
              </label>
              <WholeNumberInput
                inputRef={bedroomsInputRef}
                id="property-bedrooms"
                className={`form-control${invalidClass(fieldErrors.bedrooms)}`}
                placeholder="e.g. 3"
                value={form.bedrooms}
                invalid={Boolean(fieldErrors.bedrooms)}
                ariaDescribedBy={
                  fieldErrors.bedrooms ? "property-bedrooms-error" : undefined
                }
                onChange={(value) => {
                  updateField("bedrooms", value);
                  syncTopLevelFieldError("bedrooms", value);
                }}
                onBlur={() => syncTopLevelFieldError("bedrooms", form.bedrooms)}
              />
              <FormFieldError
                id="property-bedrooms-error"
                message={fieldErrors.bedrooms}
              />
            </div>
          </div>

          <div className="col-sm-6 col-xl-4">
            <div className="mb20">
              <label className="heading-color ff-heading fw600 mb10">
                Bathrooms
              </label>
              <WholeNumberInput
                inputRef={bathroomsInputRef}
                id="property-bathrooms"
                className={`form-control${invalidClass(fieldErrors.bathrooms)}`}
                placeholder="e.g. 2"
                value={form.bathrooms}
                invalid={Boolean(fieldErrors.bathrooms)}
                ariaDescribedBy={
                  fieldErrors.bathrooms ? "property-bathrooms-error" : undefined
                }
                onChange={(value) => {
                  updateField("bathrooms", value);
                  syncTopLevelFieldError("bathrooms", value);
                }}
                onBlur={() =>
                  syncTopLevelFieldError("bathrooms", form.bathrooms)
                }
              />
              <FormFieldError
                id="property-bathrooms-error"
                message={fieldErrors.bathrooms}
              />
            </div>
          </div>

          <div className="col-sm-6 col-xl-4">
            <div className="mb20">
              <label className="heading-color ff-heading fw600 mb10">
                Area (sqm)
              </label>
              <input
                ref={areaInputRef}
                type="number"
                className={`form-control${fieldErrors.area ? " is-invalid" : ""}`}
                placeholder="e.g. 120"
                value={form.area}
                onChange={(e) => {
                  const value = sanitizeAreaSqmInput(e.target.value);
                  updateField("area", value);
                  syncTopLevelFieldError("area", value);
                }}
                onBlur={() => syncTopLevelFieldError("area", form.area)}
                min={1}
                step="0.01"
                inputMode="decimal"
                aria-invalid={Boolean(fieldErrors.area)}
                aria-describedby={
                  fieldErrors.area ? "property-area-error" : undefined
                }
              />
              <FormFieldError
                id="property-area-error"
                message={fieldErrors.area}
              />
            </div>
          </div>

          {linkedProjectId && !parentProjectLoading ? (
            <div className="col-sm-12">
              <PropertyFormNearbyPreview
                propertyId={isEdit ? propertyId : undefined}
                latitude={projectMapCoords.latitude}
                longitude={projectMapCoords.longitude}
                locationSource="project"
              />
            </div>
          ) : null}

          <div className="col-sm-12">
            <div className="mb20">
              <label className="heading-color ff-heading fw600 mb10">
                360° Virtual Tour URL
              </label>
              <input
                ref={virtualTourInputRef}
                id="property-virtual-tour"
                type="url"
                className={`form-control${invalidClass(fieldErrors.virtualTourUrl)}`}
                placeholder="https://my.matterport.com/show/?m=..."
                value={form.virtualTourUrl}
                onChange={(e) => {
                  const value = e.target.value;
                  updateField("virtualTourUrl", value);
                  syncTopLevelFieldError("virtualTourUrl", value);
                }}
                onBlur={() =>
                  syncTopLevelFieldError("virtualTourUrl", form.virtualTourUrl)
                }
                aria-invalid={Boolean(fieldErrors.virtualTourUrl)}
                aria-describedby={
                  fieldErrors.virtualTourUrl
                    ? "property-virtual-tour-error"
                    : undefined
                }
              />
              <FormFieldError
                id="property-virtual-tour-error"
                message={fieldErrors.virtualTourUrl}
              />
            </div>
          </div>

          <div className="col-sm-12 mt20 mb20 property-form-floor-plans">
            <div className="d-flex align-items-center justify-content-between mb10">
              <h4 className="fz17 mb0">Floor plans</h4>
              {form.floorPlans.length > 0 ? (
                <button
                  type="button"
                  className="ud-btn btn-white2 btn-sm"
                  onClick={addFloorPlan}
                >
                  Add another floor plan
                </button>
              ) : null}
            </div>

            {form.floorPlans.length === 0 ? (
              <div className="floor-plans-empty bdr1 bdrs12">
                <span
                  className="floor-plans-empty__icon flaticon-expand"
                  aria-hidden
                />
                <h5 className="floor-plans-empty__title">No floor plans yet</h5>
                <p className="floor-plans-empty__text">
                  Optional. Add a label (e.g. Ground floor) and upload the plan
                  image for each level.
                </p>
                <button
                  type="button"
                  className="ud-btn btn-white2 btn-sm floor-plans-empty__action"
                  onClick={addFloorPlan}
                >
                  Add floor plan
                </button>
              </div>
            ) : null}

            {form.floorPlans.map((plan, index) => (
              <div className="floor-plan-card bdr1 bdrs12 p20 mb20" key={index}>
                <button
                  type="button"
                  className="floor-plan-card__remove"
                  onClick={() => removeFloorPlan(index)}
                  title="Remove floor plan"
                  aria-label="Remove floor plan"
                >
                  <span className="fas fa-trash-alt" aria-hidden />
                </button>
                <div className="row">
                  <div className="col-sm-6 col-xl-5">
                    <div className="mb20">
                      <label className="heading-color ff-heading fw600 mb10">
                        Title
                      </label>
                      <input
                        id={`floor-plan-${index}-title`}
                        type="text"
                        className={`form-control${invalidClass(
                          fieldErrors.floorPlans[index]?.title,
                        )}`}
                        placeholder="e.g. First Floor, Ground Level"
                        value={plan.title}
                        onChange={(e) =>
                          updateFloorPlan(index, "title", e.target.value)
                        }
                        onBlur={() => touchFloorPlanRow(index)}
                        aria-invalid={Boolean(
                          fieldErrors.floorPlans[index]?.title,
                        )}
                        aria-describedby={
                          fieldErrors.floorPlans[index]?.title
                            ? `floor-plan-${index}-title-error`
                            : undefined
                        }
                      />
                      <FormFieldError
                        id={`floor-plan-${index}-title-error`}
                        message={fieldErrors.floorPlans[index]?.title}
                      />
                    </div>
                  </div>
                  <div className="col-sm-6 col-xl-5">
                    <div className="mb20">
                      <label className="heading-color ff-heading fw600 mb10">
                        Plan image
                      </label>
                      <input
                        id={`floor-plan-${index}-image`}
                        type="file"
                        className={`form-control${
                          fieldErrors.floorPlans[index]?.image
                            ? " is-invalid"
                            : ""
                        }`}
                        accept="image/*"
                        onChange={(e) => {
                          handleFloorPlanImage(index, e.target.files);
                          e.target.value = "";
                        }}
                        onBlur={() => touchFloorPlanRow(index)}
                        aria-invalid={Boolean(
                          fieldErrors.floorPlans[index]?.image,
                        )}
                        aria-describedby={
                          fieldErrors.floorPlans[index]?.image
                            ? `floor-plan-${index}-image-error`
                            : undefined
                        }
                      />
                      <FormFieldError
                        id={`floor-plan-${index}-image-error`}
                        message={fieldErrors.floorPlans[index]?.image}
                      />
                    </div>
                  </div>
                  {plan.url && (
                    <div className="col-12">
                      <div className="row profile-box position-relative d-md-flex align-items-end mb0">
                        <div className="col-6 col-md-4 col-lg-3">
                          <div className="profile-img mb20 position-relative">
                            <Image
                              width={212}
                              height={194}
                              className="w-100 bdrs12 cover"
                              src={plan.url}
                              alt={plan.imageName || plan.title || "Floor plan"}
                              unoptimized
                            />
                            <button
                              type="button"
                              style={{ border: "none" }}
                              className="tag-del"
                              title="Remove image"
                              onClick={() => clearFloorPlanImage(index)}
                              aria-label="Remove floor plan image"
                            >
                              <span className="fas fa-trash-can" />
                            </button>
                          </div>
                          <p className="text fz13 mb0 text-truncate">
                            {plan.imageName || plan.title || "Floor plan image"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="col-sm-12">
            <h4 className="fz17 mb20">Amenities</h4>
            <div className="row">
              {amenitiesCatalog.map((amenity) => (
                <div className="col-sm-6 col-md-4 col-lg-3" key={amenity.id}>
                  <label className="custom_checkbox d-block mb15">
                    {amenity.label}
                    <input
                      type="checkbox"
                      checked={form.amenities.includes(amenity.value)}
                      onChange={() => toggleAmenity(amenity.value)}
                    />
                    <span className="checkmark" />
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="col-sm-12">
            <h4 className="fz17 mb20 mt20">Photos</h4>
            <div className="mb20">
              <label className="heading-color ff-heading fw600 mb10">
                Upload photos
              </label>
              <input
                type="file"
                className="form-control"
                accept="image/*"
                multiple
                onChange={(e) => {
                  handleImageSelect(e.target.files);
                  e.target.value = "";
                }}
              />
              <p className="text mt10 mb0">
                Add listing photos only. The first photo is the cover on search
                and map cards; use the star to change it or arrows to reorder.
              </p>
            </div>

            {photoGallery.length > 0 ? (
              <PropertyPhotoGallery
                items={photoGallery}
                disabled={formBusy}
                onRemove={removeGalleryPhoto}
                onSetCover={setGalleryCover}
                onMoveLeft={moveGalleryPhotoLeft}
                onMoveRight={moveGalleryPhotoRight}
              />
            ) : null}
          </div>

          <div className="col-sm-12">
            <h4 className="fz17 mb20">Video</h4>
            <div className="mb20">
              <label className="heading-color ff-heading fw600 mb10">
                Upload property video
              </label>
              <input
                type="file"
                className="form-control"
                accept="video/*"
                onChange={(e) => {
                  handleVideoSelect(e.target.files);
                  e.target.value = "";
                }}
                disabled={hasVideo}
              />
              <p className="text mt10 mb0">
                One video per listing. It appears in the Video section on the
                property page, separate from photos.
              </p>
            </div>

            {existingVideo && (
              <div className="mb20">
                <p className="heading-color ff-heading fw600 mb15">
                  Current video
                </p>
                <div className="row profile-box position-relative d-md-flex align-items-end mb20">
                  <div className="col-12 col-md-8 col-lg-6">
                    <div className="profile-img mb20 position-relative">
                      <VideoFilePlayer
                        className="w-100 bdrs12 cover"
                        src={existingVideo.url}
                        style={{ maxHeight: 280, objectFit: "cover" }}
                      />
                      <button
                        type="button"
                        style={{ border: "none" }}
                        className="tag-del"
                        title="Delete video"
                        onClick={() =>
                          promptDeleteMedia(existingVideo, {
                            onRemoved: () => setExistingVideo(null),
                          })
                        }
                        disabled={formBusy}
                        aria-label="Delete video"
                      >
                        <span className="fas fa-trash-can" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {videoPreview && (
              <div className="mb20">
                <p className="heading-color ff-heading fw600 mb15">New video</p>
                <div className="row profile-box position-relative d-md-flex align-items-end mb20">
                  <div className="col-12 col-md-8 col-lg-6">
                    <div className="profile-img mb20 position-relative">
                      <VideoFilePlayer
                        className="w-100 bdrs12 cover"
                        src={videoPreview.url}
                        style={{ maxHeight: 280, objectFit: "cover" }}
                      />
                      <button
                        type="button"
                        style={{ border: "none" }}
                        className="tag-del"
                        title="Remove video"
                        onClick={clearVideoPreview}
                      >
                        <span className="fas fa-trash-can" />
                      </button>
                    </div>
                    <p className="text fz13 mb0 text-truncate">
                      {videoPreview.name}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="col-sm-12">
            <PropertyFormActions
              isEdit={isEdit}
              propertyStatus={propertyStatus}
              hasChanges={hasChanges}
              formBusy={formBusy}
              activeSubmitMode={activeSubmitMode}
              isAdmin={isAdmin}
              onSubmitMode={(mode) => {
                submitModeRef.current = mode;
                setActiveSubmitMode(mode);
              }}
            />
          </div>
        </div>
      </fieldset>

      <ConfirmDialog {...dialogProps} />
    </form>
  );

  if (!unitDashboardLayout) {
    return formContent;
  }

  const pageTitle = isEdit ? "Edit unit" : "Add unit";
  const pageLede = isEdit
    ? "Update pricing, media, and details for this sellable listing. Shared location and project marketing stay on the parent project."
    : "Create a sellable listing under your project. Location and shared amenities are inherited from the parent project.";

  return (
    <div className="unit-dashboard-page">
      <header className="unit-dashboard-page__header">
        <h2 className="unit-dashboard-page__title">{pageTitle}</h2>
        <p className="unit-dashboard-page__lede mb0">{pageLede}</p>
      </header>

      <div className="row unit-dashboard-page__layout g-4">
        <div className="col-xl-8">
          <div className="unit-dashboard-page__form-panel bdrs12 default-box-shadow2 bgc-white overflow-hidden position-relative">
            {formContent}
          </div>
        </div>
        <div className="col-xl-4">
          <div className="unit-dashboard-page__aside">
            <PropertyUnitProjectCard
              project={parentProject}
              isLoading={parentProjectLoading && !parentProject}
              unitTitle={isEdit ? form.title : null}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
