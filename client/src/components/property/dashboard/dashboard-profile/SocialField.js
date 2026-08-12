"use client";

import { buytlyApi } from "@/api/generated";
import DashboardFormSubmit from "@/components/property/dashboard/dashboard-profile/DashboardFormSubmit";
import ProfileFormSkeleton from "@/components/property/dashboard/dashboard-profile/ProfileFormSkeleton";
import { getApiError } from "@/lib/auth/getApiError";
import { hasFormChanges } from "@/lib/form/hasFormChanges";
import { normalizeWebsiteUrl } from "@/lib/url/normalizeWebsite";
import { notifyError, notifySuccess } from "@/lib/toast";
import { useAuth } from "@/providers/AuthProvider";
import { useEffect, useMemo, useState } from "react";

const emptyForm = {
  instagram: "",
  linkedin: "",
  website: "",
};

const buildSocialSnapshot = (user) => ({
  instagram: user?.socialLinks?.instagram || "",
  linkedin: user?.socialLinks?.linkedin || "",
  website: user?.socialLinks?.website || "",
});

const SocialField = () => {
  const { user, refreshUser, isLoading } = useAuth();
  const [form, setForm] = useState(emptyForm);
  const [baseline, setBaseline] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      return;
    }

    const snapshot = buildSocialSnapshot(user);
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await buytlyApi.updateUserSocialLinks({
        instagram: form.instagram.trim(),
        linkedin: form.linkedin.trim(),
        website: normalizeWebsiteUrl(form.website),
      });
      await refreshUser();
      notifySuccess("Social links updated.");
    } catch (err) {
      notifyError(getApiError(err));
    } finally {
      setIsSubmitting(false);
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
              Instagram URL
            </label>
            <input
              type="url"
              className="form-control"
              placeholder="https://instagram.com/yourpage"
              value={form.instagram}
              onChange={handleChange("instagram")}
              maxLength={500}
            />
          </div>
        </div>

        <div className="col-sm-6 col-xl-4">
          <div className="mb20">
            <label className="heading-color ff-heading fw600 mb10">
              LinkedIn URL
            </label>
            <input
              type="url"
              className="form-control"
              placeholder="https://linkedin.com/in/yourpage"
              value={form.linkedin}
              onChange={handleChange("linkedin")}
              maxLength={500}
            />
          </div>
        </div>

        <div className="col-sm-6 col-xl-4">
          <div className="mb20">
            <label className="heading-color ff-heading fw600 mb10">
              Website
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="yourdomain.com"
              value={form.website}
              onChange={handleChange("website")}
              maxLength={500}
            />
            <p className="text fz13 mt5 mb0">
              We will add https:// automatically if omitted.
            </p>
          </div>
        </div>

        <div className="col-md-12">
          <DashboardFormSubmit
            isDirty={isDirty}
            isSubmitting={isSubmitting}
            idleLabel="Update social links"
            submittingLabel="Saving..."
          />
        </div>
      </div>
    </form>
  );
};

export default SocialField;
