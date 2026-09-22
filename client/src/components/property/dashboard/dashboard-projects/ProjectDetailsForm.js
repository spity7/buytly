"use client";

import PropertyLocationPicker from "@/components/property/dashboard/dashboard-add-property/PropertyLocationPicker";
import { useCatalogAmenities } from "@/hooks/useCatalog";
import {
  coordinatesToLatLngStrings,
  latLngStringsToGeoJsonCoordinates,
} from "@/lib/geo/propertyCoordinates";
import { useEffect, useState } from "react";

export function projectToFormState(project) {
  if (!project) {
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
    };
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
  };
}

export default function ProjectDetailsForm({
  project,
  disabled = false,
  onSubmit,
  submitLabel = "Save project details",
}) {
  const { data: amenitiesCatalog = [] } = useCatalogAmenities();
  const [form, setForm] = useState(() => projectToFormState(project));

  useEffect(() => {
    setForm(projectToFormState(project));
  }, [project]);

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleAmenity = (value) => {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(value)
        ? prev.amenities.filter((item) => item !== value)
        : [...prev.amenities, value],
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const coordinates = latLngStringsToGeoJsonCoordinates(
      form.longitude,
      form.latitude,
    );
    if (!coordinates) {
      onSubmit({ error: "Pin the project on the map." });
      return;
    }

    onSubmit({
      title: form.title.trim(),
      description: form.description.trim(),
      location: {
        coordinates,
        address: form.address.trim(),
        city: form.city.trim(),
        country: form.country.trim(),
      },
      amenities: form.amenities,
      virtualTourUrl: form.virtualTourUrl.trim() || undefined,
    });
  };

  return (
    <form className="bdr1 bdrs12 p20 mb30" onSubmit={handleSubmit}>
      <h4 className="mb20">Project details</h4>
      <div className="row">
        <div className="col-sm-12 mb20">
          <label className="heading-color ff-heading fw600 mb10">Title</label>
          <input
            className="form-control"
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            required
            minLength={3}
            disabled={disabled}
          />
        </div>
        <div className="col-sm-12 mb20">
          <label className="heading-color ff-heading fw600 mb10">
            Description
          </label>
          <textarea
            className="form-control"
            rows={4}
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            required
            minLength={10}
            disabled={disabled}
          />
        </div>
        <div className="col-sm-12 mb20">
          <label className="heading-color ff-heading fw600 mb10">Address</label>
          <input
            className="form-control"
            value={form.address}
            onChange={(e) => update("address", e.target.value)}
            disabled={disabled}
          />
        </div>
        <div className="col-sm-6 mb20">
          <label className="heading-color ff-heading fw600 mb10">City</label>
          <input
            className="form-control"
            value={form.city}
            onChange={(e) => update("city", e.target.value)}
            disabled={disabled}
          />
        </div>
        <div className="col-sm-6 mb20">
          <label className="heading-color ff-heading fw600 mb10">Country</label>
          <input
            className="form-control"
            value={form.country}
            onChange={(e) => update("country", e.target.value)}
            disabled={disabled}
          />
        </div>
        <div className="col-sm-12 mb20">
          <label className="heading-color ff-heading fw600 mb10">Map</label>
          <PropertyLocationPicker
            latitude={form.latitude}
            longitude={form.longitude}
            onChange={({ latitude, longitude }) => {
              update("latitude", latitude);
              update("longitude", longitude);
            }}
            disabled={disabled}
          />
        </div>
        <div className="col-sm-12 mb20">
          <label className="heading-color ff-heading fw600 mb10">
            Virtual tour URL
          </label>
          <input
            className="form-control"
            type="url"
            value={form.virtualTourUrl}
            onChange={(e) => update("virtualTourUrl", e.target.value)}
            disabled={disabled}
          />
        </div>
        <div className="col-sm-12 mb20">
          <label className="heading-color ff-heading fw600 mb10">
            Shared amenities
          </label>
          <div className="row">
            {amenitiesCatalog.map((item) => (
              <div className="col-sm-6 col-md-4" key={item.value}>
                <label className="custom_checkbox">
                  {item.label}
                  <input
                    type="checkbox"
                    checked={form.amenities.includes(item.value)}
                    onChange={() => toggleAmenity(item.value)}
                    disabled={disabled}
                  />
                  <span className="checkmark" />
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
      <button type="submit" className="ud-btn btn-white2" disabled={disabled}>
        {submitLabel}
      </button>
    </form>
  );
}
