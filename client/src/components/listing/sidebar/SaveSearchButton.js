"use client";

import { buytlyApi } from "@/api/generated";
import { useAuth } from "@/providers/AuthProvider";
import { getApiError } from "@/lib/auth/getApiError";
import {
  buildSavedSearchFilters,
  buildSavedSearchName,
} from "@/lib/listings/listingSearchParams";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function SaveSearchButton({
  queryParams,
  listingStatus,
  location,
  searchQuery,
}) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!isAuthenticated) {
      router.push("/?auth=signin");
      return;
    }

    const defaultName = buildSavedSearchName({
      listingStatus,
      location,
      searchQuery,
    });
    const name = window.prompt("Name this saved search", defaultName);
    if (!name?.trim()) return;

    setIsSaving(true);
    try {
      await buytlyApi.addSavedSearch({
        name: name.trim(),
        filters: buildSavedSearchFilters(queryParams),
      });
      toast.success("Search saved");
    } catch (error) {
      toast.error(getApiError(error));
    } finally {
      setIsSaving(false);
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
