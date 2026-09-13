"use client";

import { buytlyApi } from "@/api/generated";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import AsyncActionOverlay from "@/components/common/AsyncActionOverlay";
import { DashboardFormSkeleton } from "@/components/property/dashboard/skeletons/DashboardSkeletons";
import { useConfirmAction } from "@/hooks/useConfirmAction";
import { getApiError } from "@/lib/auth/getApiError";
import {
  propertyMediaDeleteConfirmation,
  propertyAdminPublishConfirmation,
  propertyPublishConfirmation,
} from "@/lib/confirmations";
import { notifyError } from "@/lib/toast";
import { isPropertyTerminal } from "@/lib/properties/mapProperty";
import PropertyFormNearbyPreview from "@/components/property/dashboard/dashboard-add-property/PropertyFormNearbyPreview";
import PropertyLocationPicker from "@/components/property/dashboard/dashboard-add-property/PropertyLocationPicker";
import PropertyPhotoGallery from "@/components/property/dashboard/dashboard-add-property/PropertyPhotoGallery";
import {
  createPendingGalleryItem,
  getSavedGalleryIds,
  mediaToSavedGalleryItems,
  moveGalleryItem,
  sortPropertyImages,
} from "@/lib/properties/propertyPhotoGallery";
import { reorderPropertyImages } from "@/lib/properties/reorderPropertyMedia";
import {
  coordinatesToLatLngStrings,
  latLngStringsToGeoJsonCoordinates,
} from "@/lib/geo/propertyCoordinates";
import {
  useCatalogAmenities,
  useCatalogPropertyTypes,
} from "@/hooks/useCatalog";
import PropertyFormStatusBanner from "@/components/property/dashboard/dashboard-add-property/PropertyFormStatusBanner";
import PropertyFormActions from "@/components/property/dashboard/dashboard-add-property/PropertyFormActions";
import { getPropertyFormCancelHref } from "@/lib/properties/propertyFormActions";
import { invalidatePropertyQueries } from "@/lib/properties/invalidatePropertyQueries";
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

function WholeNumberInput({ value, onChange, className, placeholder, id }) {
  return (
    <input
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
    />
  );
}

const emptyFloorPlan = () => ({
  title: "",
  area: "",
  areaUnit: "sqm",
  bedrooms: "",
  bathrooms: "",
  price: "",
  gcsKey: "",
  url: "",
  imageFile: null,
  imageName: "",
});

const emptyForm = {
  title: "",
  description: "",
  type: "apartment",
  listingType: "sale",
  price: "",
  currency: "USD",
  address: "",
  city: "",
  country: "",
  latitude: "",
  longitude: "",
  bedrooms: "",
  bathrooms: "",
  area: "",
  status: "draft",
  amenities: [],
  virtualTourUrl: "",
  floorPlans: [],
};

function buildFormFromProperty(property) {
  if (!property) return emptyForm;

  return {
    title: property.title || "",
    description: property.description || "",
    type: property.type || "apartment",
    listingType: property.listingType || "sale",
    price: property.price?.toString() || "",
    currency: property.currency || "USD",
    address: property.location?.address || "",
    city: property.location?.city || "",
    country: property.location?.country || "",
    ...coordinatesToLatLngStrings(property.location?.coordinates),
    bedrooms: formatWholeNumberField(property.bedrooms),
    bathrooms: formatWholeNumberField(property.bathrooms),
    area: property.area?.toString() || "",
    status: property.status || "draft",
    amenities: property.amenities || [],
    virtualTourUrl: property.virtualTourUrl || "",
    floorPlans: (property.floorPlans || []).map((plan) => ({
      title: plan.title || "",
      area: plan.area?.toString() || "",
      areaUnit: plan.areaUnit || "sqm",
      bedrooms: formatWholeNumberField(plan.bedrooms),
      bathrooms: formatWholeNumberField(plan.bathrooms),
      price: plan.price?.toString() || "",
      gcsKey: plan.gcsKey || "",
      url: plan.url || "",
      imageFile: null,
      imageName: plan.title ? `${plan.title} plan` : "Floor plan image",
    })),
  };
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
      area: plan.area ? Number(plan.area) : undefined,
      areaUnit: plan.areaUnit || "sqm",
      bedrooms: parseOptionalWholeNumber(plan.bedrooms),
      bathrooms: parseOptionalWholeNumber(plan.bathrooms),
      price: plan.price ? Number(plan.price) : undefined,
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

export default function PropertyForm({ propertyId }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const isEdit = Boolean(propertyId);
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
  const { requestConfirm, run, isLocked, overlayMessage, dialogProps } =
    useConfirmAction({ overlay: true });
  const submitModeRef = useRef("review");
  const [activeSubmitMode, setActiveSubmitMode] = useState("review");
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
    const hasPendingPhotos = photoGallery.some((item) => item.type === "pending");

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

  const handleLocationPick = useCallback(({ latitude, longitude }) => {
    setForm((prev) => ({
      ...prev,
      latitude,
      longitude,
    }));
  }, []);

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
            listingType: response.data?.listingType,
            type: response.data?.type,
          });
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

  const updateFloorPlan = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      floorPlans: prev.floorPlans.map((plan, planIndex) =>
        planIndex === index ? { ...plan, [field]: value } : plan,
      ),
    }));
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
  };

  const clearFloorPlanImage = (index) => {
    setForm((prev) => ({
      ...prev,
      floorPlans: prev.floorPlans.map((plan, planIndex) => {
        if (planIndex !== index) return plan;
        if (plan.url?.startsWith("blob:")) {
          URL.revokeObjectURL(plan.url);
        }
        return { ...plan, url: "", imageFile: null, gcsKey: "", imageName: "" };
      }),
    }));
  };

  const handleFloorPlanImage = (index, fileList) => {
    const file = fileList?.[0];
    if (!file) return;

    setForm((prev) => ({
      ...prev,
      floorPlans: prev.floorPlans.map((plan, planIndex) => {
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
      }),
    }));
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
        listingType: response.data?.listingType ?? prev?.listingType,
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
    router.push(getPropertyFormCancelHref(isAdmin));
    return { savedStatus };
  };

  const buildPayload = (submitMode = "review") => {
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      type: form.type,
      listingType: form.listingType,
      price: Number(form.price),
      currency: "USD",
      location: {
        coordinates:
          latLngStringsToGeoJsonCoordinates(form.longitude, form.latitude) ??
          [],
        address: form.address.trim(),
        city: form.city.trim(),
        country: form.country.trim(),
      },
      bedrooms: parseOptionalWholeNumber(form.bedrooms),
      bathrooms: parseOptionalWholeNumber(form.bathrooms),
      area: form.area ? Number(form.area) : undefined,
      amenities: form.amenities,
      virtualTourUrl: form.virtualTourUrl.trim() || undefined,
    };

    if (submitMode === "draft") {
      payload.status = "draft";
    } else if (submitMode === "review") {
      payload.status = "active";
    }
    // submitMode "save" omits status so active listings stay active

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
    return <DashboardFormSkeleton rows={10} />;
  }

  const isTerminal = isPropertyTerminal(propertyStatus);
  const mediaCount =
    photoGallery.length + (existingVideo ? 1 : 0) + (videoFile ? 1 : 0);
  const hasVideo = Boolean(existingVideo || videoFile);

  return (
    <form className="form-style1 p30" onSubmit={handleSubmit}>
      {isEdit && propertyStatus && (
        <PropertyFormStatusBanner
          status={propertyStatus}
          createdAt={propertyMeta?.createdAt}
          updatedAt={propertyMeta?.updatedAt}
          viewCount={propertyMeta?.viewCount}
          listingType={form.listingType || propertyMeta?.listingType}
          type={form.type || propertyMeta?.type}
          mediaCount={mediaCount}
          isAdmin={isAdmin}
        />
      )}

      <fieldset
        disabled={(isTerminal && !isAdmin) || formBusy}
        style={{ border: "none", padding: 0, margin: 0 }}
      >
        <div className="row">
          <div className="col-sm-12">
            <div className="mb20">
              <label className="heading-color ff-heading fw600 mb10">
                Title
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Modern 3-bedroom apartment in downtown"
                value={form.title}
                onChange={(e) => updateField("title", e.target.value)}
                required
                minLength={3}
              />
            </div>
          </div>

          <div className="col-sm-12">
            <div className="mb20">
              <label className="heading-color ff-heading fw600 mb10">
                Description
              </label>
              <textarea
                cols={30}
                rows={5}
                className="form-control"
                placeholder="Describe the property, key features, neighborhood, and anything buyers should know."
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                required
                minLength={10}
              />
            </div>
          </div>

          <div className="col-sm-6 col-xl-4">
            <div className="mb20">
              <label className="heading-color ff-heading fw600 mb10">
                Type
              </label>
              <select
                className="form-control"
                value={form.type}
                onChange={(e) => updateField("type", e.target.value)}
                required
              >
                {propertyTypes.map((type) => (
                  <option key={type.id} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="col-sm-6 col-xl-4">
            <div className="mb20">
              <label className="heading-color ff-heading fw600 mb10">
                Listing Type
              </label>
              <select
                className="form-control"
                value={form.listingType}
                onChange={(e) => updateField("listingType", e.target.value)}
                required
              >
                <option value="sale">For Sale</option>
                <option value="rent">For Rent</option>
              </select>
            </div>
          </div>

          <div className="col-sm-6 col-xl-4">
            <div className="mb20">
              <label className="heading-color ff-heading fw600 mb10">
                Price
              </label>
              <input
                type="number"
                className="form-control"
                placeholder="e.g. 450000"
                value={form.price}
                onChange={(e) => updateField("price", e.target.value)}
                required
                min={1}
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
                className="form-control"
                placeholder="e.g. 3"
                value={form.bedrooms}
                onChange={(value) => updateField("bedrooms", value)}
              />
            </div>
          </div>

          <div className="col-sm-6 col-xl-4">
            <div className="mb20">
              <label className="heading-color ff-heading fw600 mb10">
                Bathrooms
              </label>
              <WholeNumberInput
                className="form-control"
                placeholder="e.g. 2"
                value={form.bathrooms}
                onChange={(value) => updateField("bathrooms", value)}
              />
            </div>
          </div>

          <div className="col-sm-6 col-xl-4">
            <div className="mb20">
              <label className="heading-color ff-heading fw600 mb10">
                Area (sqm)
              </label>
              <input
                type="number"
                className="form-control"
                placeholder="e.g. 120"
                value={form.area}
                onChange={(e) => updateField("area", e.target.value)}
                min={1}
              />
            </div>
          </div>

          <div className="col-sm-12">
            <h4 className="fz17 mb20">Location</h4>
          </div>

          <div className="col-sm-12">
            <div className="mb20">
              <label className="heading-color ff-heading fw600 mb10">
                Address
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Street address, building, unit"
                value={form.address}
                onChange={(e) => updateField("address", e.target.value)}
              />
            </div>
          </div>

          <div className="col-sm-6 col-xl-4">
            <div className="mb20">
              <label className="heading-color ff-heading fw600 mb10">
                City
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Dubai"
                value={form.city}
                onChange={(e) => updateField("city", e.target.value)}
              />
            </div>
          </div>

          <div className="col-sm-6 col-xl-4">
            <div className="mb20">
              <label className="heading-color ff-heading fw600 mb10">
                Country
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. United Arab Emirates"
                value={form.country}
                onChange={(e) => updateField("country", e.target.value)}
              />
            </div>
          </div>

          <div className="col-sm-12">
            <div className="mb20">
              <label className="heading-color ff-heading fw600 mb10">
                Map location
              </label>
              <PropertyLocationPicker
                latitude={form.latitude}
                longitude={form.longitude}
                onChange={handleLocationPick}
                disabled={isLocked}
              />
              <input
                type="hidden"
                name="latitude"
                value={form.latitude}
                required
              />
              <input
                type="hidden"
                name="longitude"
                value={form.longitude}
                required
              />
            </div>
          </div>

          <div className="col-sm-12">
            <PropertyFormNearbyPreview
              propertyId={propertyId}
              latitude={form.latitude}
              longitude={form.longitude}
            />
          </div>

          <div className="col-sm-12">
            <div className="mb20">
              <label className="heading-color ff-heading fw600 mb10">
                360° Virtual Tour URL
              </label>
              <input
                type="url"
                className="form-control"
                placeholder="https://my.matterport.com/show/?m=..."
                value={form.virtualTourUrl}
                onChange={(e) => updateField("virtualTourUrl", e.target.value)}
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
                  Optional. Add a level with size, beds, baths, and a plan image
                  for buyers to compare layouts.
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
                  <div className="col-sm-6 col-xl-4">
                    <div className="mb20">
                      <label className="heading-color ff-heading fw600 mb10">
                        Title
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. First Floor, Ground Level"
                        value={plan.title}
                        onChange={(e) =>
                          updateFloorPlan(index, "title", e.target.value)
                        }
                      />
                    </div>
                  </div>
                  <div className="col-sm-6 col-xl-4">
                    <div className="mb20">
                      <label className="heading-color ff-heading fw600 mb10">
                        Area (sqm)
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="e.g. 85"
                        value={plan.area}
                        onChange={(e) =>
                          updateFloorPlan(index, "area", e.target.value)
                        }
                        min={0}
                      />
                    </div>
                  </div>
                  <div className="col-sm-6 col-xl-4">
                    <div className="mb20">
                      <label className="heading-color ff-heading fw600 mb10">
                        Bedrooms
                      </label>
                      <WholeNumberInput
                        className="form-control"
                        placeholder="e.g. 3"
                        value={plan.bedrooms}
                        onChange={(value) =>
                          updateFloorPlan(index, "bedrooms", value)
                        }
                      />
                    </div>
                  </div>
                  <div className="col-sm-6 col-xl-4">
                    <div className="mb20">
                      <label className="heading-color ff-heading fw600 mb10">
                        Bathrooms
                      </label>
                      <WholeNumberInput
                        className="form-control"
                        placeholder="e.g. 2"
                        value={plan.bathrooms}
                        onChange={(value) =>
                          updateFloorPlan(index, "bathrooms", value)
                        }
                      />
                    </div>
                  </div>
                  <div className="col-sm-6 col-xl-4">
                    <div className="mb20">
                      <label className="heading-color ff-heading fw600 mb10">
                        Price (optional)
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="e.g. 350000"
                        value={plan.price}
                        onChange={(e) =>
                          updateFloorPlan(index, "price", e.target.value)
                        }
                        min={0}
                      />
                    </div>
                  </div>
                  <div className="col-sm-6 col-xl-4">
                    <div className="mb20">
                      <label className="heading-color ff-heading fw600 mb10">
                        Plan image
                      </label>
                      <input
                        type="file"
                        className="form-control"
                        accept="image/*"
                        onChange={(e) => {
                          handleFloorPlanImage(index, e.target.files);
                          e.target.value = "";
                        }}
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
                      <video
                        className="w-100 bdrs12 cover"
                        src={existingVideo.url}
                        controls
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
                      <video
                        className="w-100 bdrs12 cover"
                        src={videoPreview.url}
                        controls
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

      <AsyncActionOverlay message={overlayMessage} />
    </form>
  );
}
