export function formatInquiryName(inquiry) {
  return (
    [inquiry?.firstName, inquiry?.lastName].filter(Boolean).join(" ") ||
    inquiry?.email ||
    "—"
  );
}

/** { date: "Oct 7, 2026", time: "9:41 AM" } in the viewer's locale; null when missing. */
export function formatInquiryReceived(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return {
    date: new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date),
    time: new Intl.DateTimeFormat(undefined, {
      hour: "numeric",
      minute: "2-digit",
    }).format(date),
  };
}

/** "+233 24 000 0000" → "tel:+233240000000"; null when there is no number. */
export function getInquiryPhoneHref(phone) {
  const digits = String(phone ?? "").replace(/[^\d+]/g, "");
  return digits ? `tel:${digits}` : null;
}
