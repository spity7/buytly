export const NOTIFICATION_CATEGORIES = [
  { key: "booking", label: "Bookings" },
  { key: "transaction", label: "Transactions" },
  { key: "property", label: "Properties & reviews" },
  { key: "auth", label: "Account & security" },
  { key: "system", label: "System announcements" },
];

export const NOTIFICATION_TYPE_META = {
  booking: {
    icon: "flaticon-calendar",
    label: "Booking",
  },
  transaction: {
    icon: "flaticon-contract",
    label: "Transaction",
  },
  property: {
    icon: "flaticon-home",
    label: "Property",
  },
  system: {
    icon: "flaticon-settings",
    label: "System",
  },
  auth: {
    icon: "flaticon-user",
    label: "Account",
  },
};

export function getNotificationMeta(type) {
  return (
    NOTIFICATION_TYPE_META[type] || {
      icon: "flaticon-bell",
      label: "Notification",
    }
  );
}
