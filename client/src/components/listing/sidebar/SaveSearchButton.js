"use client";

import { buytlyApi } from "@/api/generated";
import { useAuth } from "@/providers/AuthProvider";
import {
  buildSavedSearchFilters,
  buildSavedSearchName,
} from "@/lib/listings/listingSearchParams";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useRouter } from "next/navigation";

export default function SaveSearchButton({
  queryParams,
  listingStatus,
  location,
  searchQuery,
  discoveryMode = "units",
}) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { run, isBusy: isSaving } = useAsyncAction();

  const handleSave = async () => {
    if (!isAuthenticated) {
      router.push("/?auth=signin");
      return;
    }

    const defaultName = buildSavedSearchName({
      listingStatus,
      location,
      searchQuery,
      discoveryMode,
    });
    const name = window.prompt("Name this saved search", defaultName);
    if (!name?.trim()) return;

    try {
      await run({
        message: "Saving search...",
        successMessage: "Search saved",
        task: () =>
          buytlyApi.addSavedSearch({
            name: name.trim(),
            filters: buildSavedSearchFilters(queryParams, { discoveryMode }),
          }),
      });
    } catch {
      // Toast handled by run()
    }
  };

  return (
    <button
      type="button"
      className="reset-button border-0 bg-transparent p-0"
      onClick={handleSave}
      disabled={isSaving}
    >
      <span className="flaticon-favourite" />
      <u>{isSaving ? "Saving..." : "Save Search"}</u>
    </button>
  );
}
