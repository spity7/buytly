"use client";

import { buytlyApi } from "@/api/generated";
import { UserPreferencesPropertyTypesItem } from "@/api/generated/buytly.schemas";
import DashboardFormSubmit from "@/components/property/dashboard/dashboard-profile/DashboardFormSubmit";
import ProfileFormSkeleton from "@/components/property/dashboard/dashboard-profile/ProfileFormSkeleton";
import { hasFormChanges } from "@/lib/form/hasFormChanges";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { notifyError } from "@/lib/toast";
import { useAuth } from "@/providers/AuthProvider";
import { useEffect, useMemo, useState } from "react";

const PROPERTY_TYPE_OPTIONS = Object.values(UserPreferencesPropertyTypesItem);

const emptyForm = {
  budgetMin: "",
  budgetMax: "",
  locations: "",
  propertyTypes: [],
};

const buildPreferencesSnapshot = (user) => ({
  budgetMin:
    user?.preferences?.budgetMin != null
      ? String(user.preferences.budgetMin)
      : "",
  budgetMax:
    user?.preferences?.budgetMax != null
      ? String(user.preferences.budgetMax)
      : "",
  locations: (user?.preferences?.locations || []).join(", "),
  propertyTypes: user?.preferences?.propertyTypes || [],
});

const PreferencesForm = () => {
  const { user, refreshUser, isLoading } = useAuth();
  const [form, setForm] = useState(emptyForm);
  const [baseline, setBaseline] = useState(null);
  const { run, isBusy } = useAsyncAction();

  useEffect(() => {
    if (!user) {
      return;
    }

    const snapshot = buildPreferencesSnapshot(user);
    setForm(snapshot);
    setBaseline(snapshot);
  }, [user]);

  const isDirty = useMemo(
    () => hasFormChanges(form, baseline),
    [form, baseline],
  );

  const handleChange = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const togglePropertyType = (type) => {
    setForm((current) => {
      const selected = new Set(current.propertyTypes);
      if (selected.has(type)) {
        selected.delete(type);
      } else {
        selected.add(type);
      }
      return { ...current, propertyTypes: [...selected] };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const budgetMin = form.budgetMin.trim();
    const budgetMax = form.budgetMax.trim();
    const locations = form.locations
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    if (budgetMin && budgetMax && Number(budgetMin) > Number(budgetMax)) {
      notifyError("Minimum budget cannot exceed maximum budget.");
      return;
    }

    try {
      await run({
        message: "Saving preferences...",
        successMessage: "Search preferences updated",
        task: async () => {
          await buytlyApi.updateUserPreferences({
            budgetMin: budgetMin ? Number(budgetMin) : undefined,
            budgetMax: budgetMax ? Number(budgetMax) : undefined,
            locations,
            propertyTypes: form.propertyTypes,
          });
          await refreshUser();
        },
      });
    } catch {
      // Toast handled by useAsyncAction
    }
  };

  if (isLoading || !user) {
    return <ProfileFormSkeleton rows={3} />;
  }

  return (
    <form className="form-style1" onSubmit={handleSubmit}>
      <div className="row">
        <div className="col-sm-6 col-xl-4">
          <div className="mb20">
            <label className="heading-color ff-heading fw600 mb10">
              Minimum budget
            </label>
            <input
              type="number"
              min="0"
              className="form-control"
              placeholder="e.g. 100000"
              value={form.budgetMin}
              onChange={handleChange("budgetMin")}
            />
          </div>
        </div>

        <div className="col-sm-6 col-xl-4">
          <div className="mb20">
            <label className="heading-color ff-heading fw600 mb10">
              Maximum budget
            </label>
            <input
              type="number"
              min="0"
              className="form-control"
              placeholder="e.g. 500000"
              value={form.budgetMax}
              onChange={handleChange("budgetMax")}
            />
          </div>
        </div>

        <div className="col-sm-6 col-xl-8">
          <div className="mb20">
            <label className="heading-color ff-heading fw600 mb10">
              Preferred locations
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="Dubai, Abu Dhabi"
              value={form.locations}
              onChange={handleChange("locations")}
            />
            <p className="text fz13 mt5 mb0">
              Separate multiple locations with commas.
            </p>
          </div>
        </div>

        <div className="col-md-12">
          <div className="mb20">
            <span className="heading-color ff-heading fw600 mb10 d-block">
              Property types
            </span>
            <div className="preferences-types">
              {PROPERTY_TYPE_OPTIONS.map((type) => (
                <label key={type} className="preferences-types__item">
                  <input
                    type="checkbox"
                    checked={form.propertyTypes.includes(type)}
                    onChange={() => togglePropertyType(type)}
                    disabled={isBusy}
                  />
                  <span>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="col-md-12">
          <DashboardFormSubmit
            isDirty={isDirty}
            isSubmitting={isBusy}
            idleLabel="Update preferences"
            submittingLabel="Saving..."
          />
        </div>
      </div>
    </form>
  );
};

export default PreferencesForm;
