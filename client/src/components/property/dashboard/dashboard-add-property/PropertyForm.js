"use client";

import { buytlyApi } from "@/api/generated";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import DashboardFormSubmit from "@/components/property/dashboard/dashboard-profile/DashboardFormSubmit";
import { DashboardFormSkeleton } from "@/components/property/dashboard/skeletons/DashboardSkeletons";
import { getApiError } from "@/lib/auth/getApiError";
import { notifyError, notifySuccess } from "@/lib/toast";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const PROPERTY_TYPES = [
  "apartment",
  "villa",
  "townhouse",
  "land",
  "commercial",
  "duplex",
  "studio",
];

const AMENITY_OPTIONS = [
  "Air Conditioning",
  "Barbeque",
  "Dryer",
  "Gym",
  "Lawn",
  "Microwave",
  "Outdoor Shower",
  "Refrigerator",
  "Swimming Pool",
  "TV Cable",
  "Washer",
  "WiFi",
];

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
    latitude: property.location?.coordinates?.[1]?.toString() || "",
    longitude: property.location?.coordinates?.[0]?.toString() || "",
    bedrooms: property.bedrooms?.toString() || "",
    bathrooms: property.bathrooms?.toString() || "",
    area: property.area?.toString() || "",
    status: property.status || "draft",
    amenities: property.amenities || [],
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
    return a[key] === b[key];
  });
}

function isVideoFile(file) {
  return file.type.startsWith("video/");
}

export default function PropertyForm({ propertyId }) {
  const router = useRouter();
  const isEdit = Boolean(propertyId);
  const [form, setForm] = useState(emptyForm);
  const [baselineForm, setBaselineForm] = useState(isEdit ? null : emptyForm);
  const [existingMedia, setExistingMedia] = useState([]);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaPreviews, setMediaPreviews] = useState([]);
  const [mediaPendingDelete, setMediaPendingDelete] = useState(null);
  const [deletingMediaId, setDeletingMediaId] = useState(null);
  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const mediaPreviewsRef = useRef(mediaPreviews);
  mediaPreviewsRef.current = mediaPreviews;

  const hasChanges = useMemo(() => {
    const baseline = isEdit ? baselineForm : emptyForm;
    if (!baseline) return false;
    return !formsEqual(form, baseline) || mediaFiles.length > 0;
  }, [baselineForm, form, isEdit, mediaFiles.length]);

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
          setExistingMedia(response.data?.media || []);
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
      mediaPreviewsRef.current.forEach((preview) => {
        if (preview.url.startsWith("blob:")) {
          URL.revokeObjectURL(preview.url);
        }
      });
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

  const handleMediaSelect = useCallback((fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;

    const previews = files.map((file) => ({
      id: `${file.name}-${file.size}-${file.lastModified}`,
      file,
      url: URL.createObjectURL(file),
      isVideo: isVideoFile(file),
      name: file.name,
    }));

    setMediaFiles((prev) => [...prev, ...files]);
    setMediaPreviews((prev) => [...prev, ...previews]);
  }, []);

  const removeMediaPreview = useCallback((index) => {
    setMediaPreviews((prev) => {
      const preview = prev[index];
      if (preview?.url.startsWith("blob:")) {
        URL.revokeObjectURL(preview.url);
      }
      return prev.filter((_, itemIndex) => itemIndex !== index);
    });
    setMediaFiles((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
  }, []);

  const handleDeleteExistingMedia = async () => {
    if (!mediaPendingDelete?._id || !propertyId) return;

    setDeletingMediaId(mediaPendingDelete._id);
    try {
      await buytlyApi.deletePropertyMedia(propertyId, mediaPendingDelete._id);
      setExistingMedia((prev) =>
        prev.filter((item) => item._id !== mediaPendingDelete._id),
      );
      notifySuccess("Media removed");
      setMediaPendingDelete(null);
    } catch (error) {
      notifyError(getApiError(error));
    } finally {
      setDeletingMediaId(null);
    }
  };

  const buildPayload = () => ({
    title: form.title.trim(),
    description: form.description.trim(),
    type: form.type,
    listingType: form.listingType,
    price: Number(form.price),
    currency: form.currency,
    location: {
      coordinates: [Number(form.longitude), Number(form.latitude)],
      address: form.address.trim(),
      city: form.city.trim(),
      country: form.country.trim(),
    },
    bedrooms: form.bedrooms ? Number(form.bedrooms) : undefined,
    bathrooms: form.bathrooms ? Number(form.bathrooms) : undefined,
    area: form.area ? Number(form.area) : undefined,
    amenities: form.amenities,
    status: form.status,
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = buildPayload();
      let savedId = propertyId;

      if (isEdit) {
        await buytlyApi.updateProperty(propertyId, payload);
        notifySuccess("Property updated");
        setBaselineForm(form);
      } else {
        const response = await buytlyApi.createProperty(payload);
        savedId = response.data?._id;
        notifySuccess("Property created");
      }

      if (mediaFiles.length && savedId) {
        for (const file of mediaFiles) {
          await buytlyApi.uploadPropertyMedia(savedId, { media: file });
        }
      }

      router.push("/dashboard-my-properties");
    } catch (error) {
      notifyError(getApiError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <DashboardFormSkeleton rows={10} />;
  }

  return (
    <form className="form-style1 p30" onSubmit={handleSubmit}>
      <div className="row">
        <div className="col-sm-12">
          <div className="mb20">
            <label className="heading-color ff-heading fw600 mb10">Title</label>
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
            <label className="heading-color ff-heading fw600 mb10">Type</label>
            <select
              className="form-control"
              value={form.type}
              onChange={(e) => updateField("type", e.target.value)}
              required
            >
              {PROPERTY_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
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
              Status
            </label>
            <select
              className="form-control"
              value={form.status}
              onChange={(e) => updateField("status", e.target.value)}
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>

        <div className="col-sm-6 col-xl-4">
          <div className="mb20">
            <label className="heading-color ff-heading fw600 mb10">Price</label>
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
              placeholder="USD"
              value={form.currency}
              onChange={(e) =>
                updateField("currency", e.target.value.toUpperCase())
              }
              maxLength={3}
              required
            />
          </div>
        </div>

        <div className="col-sm-6 col-xl-4">
          <div className="mb20">
            <label className="heading-color ff-heading fw600 mb10">
              Bedrooms
            </label>
            <input
              type="number"
              className="form-control"
              placeholder="e.g. 3"
              value={form.bedrooms}
              onChange={(e) => updateField("bedrooms", e.target.value)}
              min={0}
            />
          </div>
        </div>

        <div className="col-sm-6 col-xl-4">
          <div className="mb20">
            <label className="heading-color ff-heading fw600 mb10">
              Bathrooms
            </label>
            <input
              type="number"
              className="form-control"
              placeholder="e.g. 2"
              value={form.bathrooms}
              onChange={(e) => updateField("bathrooms", e.target.value)}
              min={0}
              step="0.5"
            />
          </div>
        </div>

        <div className="col-sm-6 col-xl-4">
          <div className="mb20">
            <label className="heading-color ff-heading fw600 mb10">Area</label>
            <input
              type="number"
              className="form-control"
              placeholder="e.g. 1200"
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
            <label className="heading-color ff-heading fw600 mb10">City</label>
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

        <div className="col-sm-6 col-xl-4">
          <div className="mb20">
            <label className="heading-color ff-heading fw600 mb10">
              Latitude
            </label>
            <input
              type="number"
              className="form-control"
              placeholder="e.g. 25.2048"
              value={form.latitude}
              onChange={(e) => updateField("latitude", e.target.value)}
              required
              step="any"
            />
          </div>
        </div>

        <div className="col-sm-6 col-xl-4">
          <div className="mb20">
            <label className="heading-color ff-heading fw600 mb10">
              Longitude
            </label>
            <input
              type="number"
              className="form-control"
              placeholder="e.g. 55.2708"
              value={form.longitude}
              onChange={(e) => updateField("longitude", e.target.value)}
              required
              step="any"
            />
          </div>
        </div>

        <div className="col-sm-12">
          <h4 className="fz17 mb20">Amenities</h4>
          <div className="row">
            {AMENITY_OPTIONS.map((amenity) => (
              <div className="col-sm-6 col-md-4 col-lg-3" key={amenity}>
                <label className="custom_checkbox d-block mb15">
                  {amenity}
                  <input
                    type="checkbox"
                    checked={form.amenities.includes(amenity)}
                    onChange={() => toggleAmenity(amenity)}
                  />
                  <span className="checkmark" />
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="col-sm-12">
          <div className="mb20 mt20">
            <label className="heading-color ff-heading fw600 mb10">
              Upload Media
            </label>
            <input
              type="file"
              className="form-control"
              accept="image/*,video/*"
              multiple
              onChange={(e) => {
                handleMediaSelect(e.target.files);
                e.target.value = "";
              }}
            />
            <p className="text mt10 mb0">
              Add photos or videos. New uploads will be attached when you save.
            </p>
          </div>

          {existingMedia.length > 0 && (
            <div className="mb20">
              <p className="heading-color ff-heading fw600 mb15">
                Current media
              </p>
              <div className="row profile-box position-relative d-md-flex align-items-end mb20">
                {existingMedia.map((item) => (
                  <div className="col-6 col-md-4 col-lg-3" key={item._id}>
                    <div className="profile-img mb20 position-relative">
                      {item.type === "video" ? (
                        <video
                          className="w-100 bdrs12 cover"
                          src={item.url}
                          controls
                          style={{ height: 194, objectFit: "cover" }}
                        />
                      ) : (
                        <Image
                          width={212}
                          height={194}
                          className="w-100 bdrs12 cover"
                          src={item.url || "/images/listings/listing-1.jpg"}
                          alt="Property media"
                          unoptimized
                        />
                      )}
                      <button
                        type="button"
                        style={{ border: "none" }}
                        className="tag-del"
                        title="Delete media"
                        onClick={() => setMediaPendingDelete(item)}
                        disabled={Boolean(deletingMediaId)}
                        aria-label="Delete media"
                      >
                        <span className="fas fa-trash-can" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {mediaPreviews.length > 0 && (
            <div className="mb20">
              <p className="heading-color ff-heading fw600 mb15">New uploads</p>
              <div className="row profile-box position-relative d-md-flex align-items-end mb20">
                {mediaPreviews.map((preview, index) => (
                  <div className="col-6 col-md-4 col-lg-3" key={preview.id}>
                    <div className="profile-img mb20 position-relative">
                      {preview.isVideo ? (
                        <video
                          className="w-100 bdrs12 cover"
                          src={preview.url}
                          controls
                          style={{ height: 194, objectFit: "cover" }}
                        />
                      ) : (
                        <Image
                          width={212}
                          height={194}
                          className="w-100 bdrs12 cover"
                          src={preview.url}
                          alt={preview.name}
                          unoptimized
                        />
                      )}
                      <button
                        type="button"
                        style={{ border: "none" }}
                        className="tag-del"
                        title="Remove file"
                        onClick={() => removeMediaPreview(index)}
                      >
                        <span className="fas fa-trash-can" />
                      </button>
                    </div>
                    <p className="text fz13 mb0 text-truncate">
                      {preview.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="col-sm-12">
          <div className="d-flex gap-3 flex-wrap align-items-center">
            <button
              type="button"
              className="ud-btn btn-white"
              onClick={() => router.push("/dashboard-my-properties")}
            >
              Cancel
            </button>
            <DashboardFormSubmit
              isDirty={hasChanges}
              isSubmitting={isSubmitting}
              idleLabel={isEdit ? "Update Property" : "Create Property"}
              submittingLabel="Saving..."
            />
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(mediaPendingDelete)}
        title="Delete media?"
        message="This photo or video will be permanently removed from the property."
        confirmLabel="Delete media"
        cancelLabel="Cancel"
        confirmVariant="danger"
        isConfirming={Boolean(deletingMediaId)}
        onClose={() => {
          if (!deletingMediaId) {
            setMediaPendingDelete(null);
          }
        }}
        onConfirm={handleDeleteExistingMedia}
      />
    </form>
  );
}
