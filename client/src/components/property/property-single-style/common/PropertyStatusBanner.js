"use client";

import {
  getStatusLabel,
  isPropertyBookable,
  isPropertyTerminal,
} from "@/lib/properties/mapProperty";
import { usePropertySingle } from "@/providers/PropertySingleProvider";

export default function PropertyStatusBanner() {
  const { property } = usePropertySingle();
  const status = property?.status;

  if (!status || status === "active") return null;

  const isTerminal = isPropertyTerminal(status);
  const isBookable = isPropertyBookable(status);

  return (
    <div
      className={`property-status-banner property-status-banner--${status} mb30`}
      role="status"
    >
      <strong>{getStatusLabel(status)}</strong>
      {status === "pending" && (
        <p className="mb0 mt-2">
          This listing is not public yet. Only the owner and admins can view it.
        </p>
      )}
      {status === "draft" && (
        <p className="mb0 mt-2">
          This is a draft listing and is not visible to the public.
        </p>
      )}
      {isTerminal && (
        <p className="mb0 mt-2">
          This property is no longer available
          {status === "sold"
            ? " for purchase"
            : status === "rented"
              ? " for rent"
              : ""}
          . Scheduling a tour or starting a transaction is disabled.
        </p>
      )}
      {!isBookable &&
        !isTerminal &&
        status !== "draft" &&
        status !== "pending" && (
          <p className="mb0 mt-2">
            This listing is not currently accepting inquiries.
          </p>
        )}
    </div>
  );
}
