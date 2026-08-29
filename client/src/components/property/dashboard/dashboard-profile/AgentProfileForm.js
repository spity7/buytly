"use client";

import { buytlyApi } from "@/api/generated";
import DashboardFormSubmit from "@/components/property/dashboard/dashboard-profile/DashboardFormSubmit";
import ProfileFormSkeleton from "@/components/property/dashboard/dashboard-profile/ProfileFormSkeleton";
import { getApiError } from "@/lib/auth/getApiError";
import { hasFormChanges } from "@/lib/form/hasFormChanges";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useAuth } from "@/providers/AuthProvider";
import { useCallback, useEffect, useMemo, useState } from "react";

const emptyForm = {
  licenseNumber: "",
  agency: "",
  city: "",
  bio: "",
  specialties: "",
};

const buildAgentSnapshot = (profile) => ({
  licenseNumber: profile?.licenseNumber || "",
  agency: profile?.agency || "",
  city: profile?.city || "",
  bio: profile?.bio || "",
  specialties: (profile?.specialties || []).join(", "),
});

const AgentProfileForm = () => {
  const { user } = useAuth();
  const [form, setForm] = useState(emptyForm);
  const [baseline, setBaseline] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const { run, isBusy } = useAsyncAction();

  const loadAgentProfile = useCallback(async () => {
    if (!user || user.role !== "agent") {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setLoadError("");

    try {
      const response = await buytlyApi.getMyAgentProfile();
      const profile = response.data?.profile;
      const snapshot = buildAgentSnapshot(profile);
      setForm(snapshot);
      setBaseline(snapshot);
    } catch (err) {
      setLoadError(getApiError(err));
      setForm(emptyForm);
      setBaseline(null);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadAgentProfile();
  }, [loadAgentProfile]);

  const isDirty = useMemo(
    () => hasFormChanges(form, baseline),
    [form, baseline],
  );

  if (!user || user.role !== "agent") {
    return null;
  }

  const handleChange = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const specialties = form.specialties
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    try {
      await run({
        message: "Saving agent profile...",
        successMessage: "Agent profile updated",
        task: async () => {
          await buytlyApi.updateMyAgentProfile({
            licenseNumber: form.licenseNumber.trim(),
            agency: form.agency.trim(),
            city: form.city.trim(),
            bio: form.bio.trim(),
            specialties,
          });

          const response = await buytlyApi.getMyAgentProfile();
          const profile = response.data?.profile;
          const snapshot = buildAgentSnapshot(profile);
          setForm(snapshot);
          setBaseline(snapshot);
        },
      });
    } catch {
      // Toast handled by useAsyncAction
    }
  };

  return (
    <div className="ps-widget bgc-white bdrs12 default-box-shadow2 p30 mb30 overflow-hidden position-relative">
      <h4 className="title fz17 mb30">Agent details</h4>

      {isLoading ? (
        <ProfileFormSkeleton rows={4} />
      ) : loadError ? (
        <div className="agent-profile-error">
          <p className="text-danger mb10">{loadError}</p>
          <button
            type="button"
            className="ud-btn btn-white2"
            onClick={loadAgentProfile}
          >
            Retry
          </button>
        </div>
      ) : (
        <form className="form-style1" onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-sm-6 col-xl-4">
              <div className="mb20">
                <label className="heading-color ff-heading fw600 mb10">
                  License number
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="RE-12345"
                  value={form.licenseNumber}
                  onChange={handleChange("licenseNumber")}
                  maxLength={50}
                />
              </div>
            </div>

            <div className="col-sm-6 col-xl-4">
              <div className="mb20">
                <label className="heading-color ff-heading fw600 mb10">
                  Agency
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Company name"
                  value={form.agency}
                  onChange={handleChange("agency")}
                  maxLength={100}
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
                  placeholder="Dubai"
                  value={form.city}
                  onChange={handleChange("city")}
                  maxLength={100}
                />
              </div>
            </div>

            <div className="col-sm-6 col-xl-4">
              <div className="mb20">
                <label className="heading-color ff-heading fw600 mb10">
                  Specialties
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="luxury, commercial"
                  value={form.specialties}
                  onChange={handleChange("specialties")}
                />
                <p className="text fz13 mt5 mb0">
                  Separate multiple values with commas.
                </p>
              </div>
            </div>

            <div className="col-md-12">
              <div className="mb20">
                <label className="heading-color ff-heading fw600 mb10">
                  About me
                </label>
                <textarea
                  cols={30}
                  rows={4}
                  className="form-control"
                  placeholder="Tell clients about your experience and focus areas."
                  value={form.bio}
                  onChange={handleChange("bio")}
                  maxLength={2000}
                />
              </div>
            </div>

            <div className="col-md-12">
              <DashboardFormSubmit
                isDirty={isDirty}
                isSubmitting={isBusy}
                idleLabel="Update agent profile"
                submittingLabel="Saving..."
              />
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default AgentProfileForm;
