export const NOTIFICATION_PREFERENCE_KEYS = [
  "booking",
  "transaction",
  "property",
  "auth",
  "system",
];

const defaultChannelPreferences = () =>
  Object.fromEntries(
    NOTIFICATION_PREFERENCE_KEYS.map((key) => [key, true]),
  );

export const DEFAULT_NOTIFICATION_PREFERENCES = {
  email: defaultChannelPreferences(),
  inApp: defaultChannelPreferences(),
};

export const normalizeNotificationPreferences = (preferences) => {
  const normalized = {
    email: { ...DEFAULT_NOTIFICATION_PREFERENCES.email },
    inApp: { ...DEFAULT_NOTIFICATION_PREFERENCES.inApp },
  };

  if (!preferences) {
    return normalized;
  }

  for (const channel of ["email", "inApp"]) {
    const channelPrefs = preferences[channel];
    if (!channelPrefs) continue;

    for (const key of NOTIFICATION_PREFERENCE_KEYS) {
      if (typeof channelPrefs[key] === "boolean") {
        normalized[channel][key] = channelPrefs[key];
      }
    }
  }

  return normalized;
};

export const shouldDeliverNotification = (
  user,
  preferenceKey,
  channel,
) => {
  const prefs = normalizeNotificationPreferences(user?.notificationPreferences);
  const channelPrefs = prefs[channel] || {};
  if (typeof channelPrefs[preferenceKey] === "boolean") {
    return channelPrefs[preferenceKey];
  }
  return true;
};
