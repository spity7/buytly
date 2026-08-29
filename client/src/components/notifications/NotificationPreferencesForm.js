"use client";

import { buytlyApi } from "@/api/generated";
import DashboardFormSubmit from "@/components/property/dashboard/dashboard-profile/DashboardFormSubmit";
import ProfileFormSkeleton from "@/components/property/dashboard/dashboard-profile/ProfileFormSkeleton";
import { NOTIFICATION_CATEGORIES } from "@/lib/notifications/notificationMeta";
import { hasFormChanges } from "@/lib/form/hasFormChanges";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { notifyError, notifySuccess } from "@/lib/toast";
import { useAuth } from "@/providers/AuthProvider";
import { useEffect, useMemo, useState } from "react";

const DEFAULT_CHANNEL_PREFS = Object.fromEntries(
  NOTIFICATION_CATEGORIES.map(({ key }) => [key, true]),
);

const buildSnapshot = (user) => ({
  email: {
    ...DEFAULT_CHANNEL_PREFS,
    ...(user?.notificationPreferences?.email || {}),
  },
});

const NotificationPreferencesForm = () => {
  const { user, refreshUser, isLoading } = useAuth();
  const [form, setForm] = useState({ email: DEFAULT_CHANNEL_PREFS });
  const [baseline, setBaseline] = useState(null);
  const { run, isBusy } = useAsyncAction();

  useEffect(() => {
    if (!user) {
      return;
    }

    const snapshot = buildSnapshot(user);
    setForm(snapshot);
    setBaseline(snapshot);
  }, [user]);

  const isDirty = useMemo(
    () => hasFormChanges(form, baseline),
    [form, baseline],
  );

  const toggleEmailPreference = (key) => {
    setForm((current) => ({
      ...current,
      email: {
        ...current.email,
        [key]: !current.email[key],
      },
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    await run({
      task: () =>
        buytlyApi.updateUserNotificationPreferences({
          email: form.email,
        }),
      onSuccess: async () => {
        const refreshed = await refreshUser();
        const snapshot = buildSnapshot(refreshed || user);
        setForm(snapshot);
        setBaseline(snapshot);
        notifySuccess("Notification preferences updated");
      },
      onError: (error) => notifyError(error?.message || "Could not save preferences"),
    });
  };

  if (isLoading && !user) {
    return <ProfileFormSkeleton rows={4} />;
  }

  return (
    <form className="form-style1" onSubmit={handleSubmit}>
      <p className="text mb25">
        Choose which email notifications you want to receive. In-app notifications
        remain enabled in your dashboard feed.
      </p>

      <div className="notification-preferences-grid">
        {NOTIFICATION_CATEGORIES.map(({ key, label }) => (
          <label key={key} className="notification-preference-row">
            <span>{label}</span>
            <input
              type="checkbox"
              checked={Boolean(form.email[key])}
              onChange={() => toggleEmailPreference(key)}
            />
          </label>
        ))}
      </div>

      <DashboardFormSubmit isBusy={isBusy} isDirty={isDirty} label="Save preferences" />
    </form>
  );
};

export default NotificationPreferencesForm;
