"use client";

import PhoneFields from "@/components/common/PhoneFields";
import DashboardFormSubmit from "@/components/property/dashboard/dashboard-profile/DashboardFormSubmit";
import ProfileFormSkeleton from "@/components/property/dashboard/dashboard-profile/ProfileFormSkeleton";
import { buytlyApi } from "@/api/generated";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { hasFormChanges } from "@/lib/form/hasFormChanges";
import { parsePhoneFromUser } from "@/lib/phone/parsePhone";
import { notifyError } from "@/lib/toast";
import { useAuth } from "@/providers/AuthProvider";
import { useEffect, useMemo, useState } from "react";

const emptyForm = {
  firstName: "",
  lastName: "",
  phoneCountryCode: "",
  phoneNumber: "",
};

const buildPersonalSnapshot = (user) => {
  const phone = parsePhoneFromUser(user);

  return {
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    phoneCountryCode: phone.phoneCountryCode,
    phoneNumber: phone.phoneNumber,
  };
};

const PersonalInfo = () => {
  const { user, refreshUser, isLoading } = useAuth();
  const [form, setForm] = useState(emptyForm);
  const [baseline, setBaseline] = useState(null);
  const { run, isBusy } = useAsyncAction();

  useEffect(() => {
    if (!user) {
      return;
    }

    const snapshot = buildPersonalSnapshot(user);
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

    const trimmedPhone = form.phoneNumber.trim();

    if (trimmedPhone && !form.phoneCountryCode) {
      notifyError("Please select a country code for your phone number.");
      return;
    }

    try {
      await run({
        message: "Saving profile...",
        successMessage: "Personal information updated",
        task: async () => {
          await buytlyApi.updateCurrentUser({
            firstName: form.firstName.trim(),
            lastName: form.lastName.trim(),
            ...(trimmedPhone
              ? {
                  phoneCountryCode: form.phoneCountryCode,
                  phoneNumber: trimmedPhone,
                }
              : { phoneNumber: "" }),
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
              First name
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="First name"
              value={form.firstName}
              onChange={handleChange("firstName")}
              maxLength={50}
              required
            />
          </div>
        </div>

        <div className="col-sm-6 col-xl-4">
          <div className="mb20">
            <label className="heading-color ff-heading fw600 mb10">
              Last name
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="Last name"
              value={form.lastName}
              onChange={handleChange("lastName")}
              maxLength={50}
              required
            />
          </div>
        </div>

        <div className="col-sm-6 col-xl-8">
          <div className="mb20">
            <PhoneFields
              idPrefix="profile-phone"
              countryCode={form.phoneCountryCode}
              phoneNumber={form.phoneNumber}
              onCountryCodeChange={(value) => {
                setForm((current) => ({ ...current, phoneCountryCode: value }));
              }}
              onPhoneNumberChange={(value) => {
                setForm((current) => ({
                  ...current,
                  phoneNumber: value,
                  phoneCountryCode: value ? current.phoneCountryCode : "",
                }));
              }}
              disabled={isBusy}
            />
          </div>
        </div>

        <div className="col-sm-6 col-xl-4">
          <div className="mb20">
            <label className="heading-color ff-heading fw600 mb10">Email</label>
            <input
              type="email"
              className="form-control"
              value={user.email || ""}
              readOnly
              aria-readonly="true"
            />
            <p className="text fz13 mt5 mb0">Email cannot be changed here.</p>
          </div>
        </div>

        <div className="col-md-12">
          <DashboardFormSubmit
            isDirty={isDirty}
            isSubmitting={isBusy}
            idleLabel="Update profile"
            submittingLabel="Saving..."
          />
        </div>
      </div>
    </form>
  );
};

export default PersonalInfo;
