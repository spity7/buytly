"use client";

import { getStatusLabel } from "@/lib/properties/mapProperty";
import { getListingStatusBannerContent } from "@/lib/properties/listingStatusBanner";

export default function PropertyFormStatusBanner({
  status,
  createdAt,
  updatedAt,
  viewCount,
  listingType,
  type,
  mediaCount,
  isAdmin = false,
}) {
  if (!status) return null;

  const { message, meta, nextStep } = getListingStatusBannerContent({
    status,
    createdAt,
    updatedAt,
    viewCount,
    listingType,
    type,
    mediaCount,
    isAdmin,
  });

  return (
    <div
      className={`property-form-status-banner property-form-status-banner--${status} mb20`}
      role="status"
    >
      <div className="property-form-status-banner__header">
        <strong>Current status:</strong> {getStatusLabel(status)}
      </div>

      {message ? (
        <p className="property-form-status-banner__message mb0">{message}</p>
      ) : null}

      {meta?.length ? (
        <dl className="property-form-status-banner__meta mb0">
          {meta.map((item) => (
            <div
              key={item.label}
              className="property-form-status-banner__meta-item"
            >
              <dt>{item.label}</dt>
              <dd>{item.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      {nextStep ? (
        <p className="property-form-status-banner__next mb0">
          <strong>What&apos;s next:</strong> {nextStep}
        </p>
      ) : null}
    </div>
  );
}
