"use client";

import { notifyError, notifySuccess } from "@/lib/toast";

export default function ProjectShareButton() {
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
    <button
      type="button"
      className="icon property-header-actions__item border-0 bg-transparent p-0"
      onClick={handleShare}
      aria-label="Share project"
    >
      <span className="flaticon-share-1" />
    </button>
  );
}
