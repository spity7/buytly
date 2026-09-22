"use client";

import { buytlyApi } from "@/api/generated";
import PropertyLocationPicker from "@/components/property/dashboard/dashboard-add-property/PropertyLocationPicker";
import { latLngStringsToGeoJsonCoordinates } from "@/lib/geo/propertyCoordinates";
import { getApiError } from "@/lib/auth/getApiError";
import { notifyError } from "@/lib/toast";
import { useCatalogAmenities } from "@/hooks/useCatalog";
import { useRouter } from "next/navigation";
import { useState } from "react";

const emptyProject = {
  title: "",
  description: "",
  address: "",
  city: "",
  country: "",
  latitude: "",
  longitude: "",
  amenities: [],
};

export default function ProjectWizard() {
  const router = useRouter();
  const [kind, setKind] = useState("");
  const [form, setForm] = useState(emptyProject);
  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const { data: amenitiesCatalog = [] } = useCatalogAmenities();

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

  const handleCreate = async (event) => {
    event.preventDefault();
    const coordinates = latLngStringsToGeoJsonCoordinates(
      form.longitude,
      form.latitude,
    );
    if (!coordinates) {
      notifyError("Pin the project on the map.");
      return;
    }
    if (form.title.trim().length < 3 || form.description.trim().length < 10) {
      notifyError("Enter a project title and description.");
      return;
    }

    setBusy(true);
    try {
      const response = await buytlyApi.createProject({
        title: form.title.trim(),
        description: form.description.trim(),
        kind,
        location: {
          coordinates,
          address: form.address.trim(),
          city: form.city.trim(),
          country: form.country.trim(),
        },
        amenities: form.amenities,
        status: "draft",
      });
      const projectId = response.data?._id || response.data?.id;
      router.push(`/dashboard-edit-project/${projectId}`);
    } catch (error) {
      notifyError(getApiError(error));
    } finally {
      setBusy(false);
    }
  };

  if (step === 1) {
    return (
      <div className="form-style1 p30">
        <h4 className="mb20">Choose project type</h4>
        <div className="row">
          <div className="col-md-6 mb20">
            <button
              type="button"
              className={`ud-btn w-100 ${kind === "single" ? "btn-thm" : "btn-white2"}`}
              onClick={() => setKind("single")}
            >
              Single
              <span className="d-block fz14 fw400 mt5">
                One sellable unit (villa, apartment, land parcel)
              </span>
            </button>
          </div>
          <div className="col-md-6 mb20">
            <button
              type="button"
              className={`ud-btn w-100 ${kind === "compound" ? "btn-thm" : "btn-white2"}`}
              onClick={() => setKind("compound")}
            >
              Compound
              <span className="d-block fz14 fw400 mt5">
                Multiple units in one development
              </span>
            </button>
          </div>
        </div>
        <button
          type="button"
          className="ud-btn btn-thm"
          disabled={!kind}
          onClick={() => setStep(2)}
        >
          Continue
        </button>
      </div>
    );
  }

  return (
    <form className="form-style1 p30" onSubmit={handleCreate}>
      <h4 className="mb20">
        Project details ({kind === "single" ? "Single" : "Compound"})
      </h4>
      <div className="row">
        <div className="col-sm-12 mb20">
          <label className="heading-color ff-heading fw600 mb10">Title</label>
          <input
            className="form-control"
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            required
            minLength={3}
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
          />
        </div>
        <div className="col-sm-12 mb20">
          <label className="heading-color ff-heading fw600 mb10">Address</label>
          <input
            className="form-control"
            value={form.address}
            onChange={(e) => update("address", e.target.value)}
          />
        </div>
        <div className="col-sm-6 mb20">
          <label className="heading-color ff-heading fw600 mb10">City</label>
          <input
            className="form-control"
            value={form.city}
            onChange={(e) => update("city", e.target.value)}
          />
        </div>
        <div className="col-sm-6 mb20">
          <label className="heading-color ff-heading fw600 mb10">Country</label>
          <input
            className="form-control"
            value={form.country}
            onChange={(e) => update("country", e.target.value)}
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
            disabled={busy}
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
                  />
                  <span className="checkmark" />
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="d-flex gap-2">
        <button
          type="button"
          className="ud-btn btn-white2"
          onClick={() => setStep(1)}
          disabled={busy}
        >
          Back
        </button>
        <button type="submit" className="ud-btn btn-thm" disabled={busy}>
          {busy ? "Creating..." : "Create project & add units"}
        </button>
      </div>
    </form>
  );
}
