"use client";

import FavoriteButton from "@/components/property/FavoriteButton";
import { notifyError, notifySuccess } from "@/lib/toast";

export default function PropertyHeaderActions({ propertyId }) {
  const handleShare = async () => {
    const url = window.location.href;

    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ url, title: document.title });
        return;
      } catch (error) {
        if (error?.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      notifySuccess("Link copied to clipboard");
    } catch {
      notifyError("Could not copy link");
    }
  };

  return (
    <div className="property-header-actions">
      <FavoriteButton
        propertyId={propertyId}
        className="property-header-actions__item"
      />
      <button
        type="button"
        className="icon property-header-actions__item border-0 bg-transparent p-0"
        onClick={handleShare}
        aria-label="Share listing"
      >
        <span className="flaticon-share-1" />
      </button>
    </div>
  );
}
