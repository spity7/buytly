"use client";

import { buytlyApi } from "@/api/generated";
import AsyncActionOverlay from "@/components/common/AsyncActionOverlay";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { useConfirmAction } from "@/hooks/useConfirmAction";
import { getApiError } from "@/lib/auth/getApiError";
import { savedSearchDeleteConfirmation } from "@/lib/confirmations";
import { useCallback, useEffect, useState } from "react";
import { Tooltip as ReactTooltip } from "react-tooltip";
import { DashboardTableSkeleton } from "@/components/property/dashboard/skeletons/DashboardSkeletons";

const formatSearchDate = (value) => {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
};

const SearchDataTable = () => {
  const [searches, setSearches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const { requestConfirm, isLocked, overlayMessage, dialogProps, pending } =
    useConfirmAction({ overlay: true });

  const loadSearches = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await buytlyApi.getSavedSearches();
      setSearches(response.data || []);
    } catch (err) {
      setError(getApiError(err));
      setSearches([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSearches();
  }, [loadSearches]);

  const promptDelete = (searchId, name) => {
    requestConfirm({
      ...savedSearchDeleteConfirmation(name),
      targetId: searchId,
      action: {
        message: "Removing saved search...",
        successMessage: "Saved search removed",
        task: async () => {
          const response = await buytlyApi.removeSavedSearch(searchId);
          setSearches(response.data || []);
        },
      },
    });
  };

  const tableBusy = isLocked;
  const deletingId = pending?.targetId ?? null;

  if (isLoading) {
    return (
      <div className="packages_table table-responsive">
        <DashboardTableSkeleton rows={4} columns={3} withThumbnail={false} />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <p className="text-danger mb10">{error}</p>
        <button
          type="button"
          className="ud-btn btn-white2"
          onClick={loadSearches}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!searches.length) {
    return (
      <p className="text mb0">
        You have no saved searches yet. Save a search from the listings page to
        see it here.
      </p>
    );
  }

  return (
    <>
      <table className="table-style3 table at-savesearch">
        <thead className="t-head">
          <tr>
            <th scope="col">Search name</th>
            <th scope="col">Date created</th>
            <th scope="col">Action</th>
          </tr>
        </thead>
        <tbody className="t-body">
          {searches.map((search) => {
            const searchId = search._id || search.id;
            const rowBusy = deletingId === searchId;

            return (
              <tr key={searchId}>
                <th scope="row">{search.name}</th>
                <td>{formatSearchDate(search.createdAt)}</td>
                <td>
                  <div className="d-flex">
                    <button
                      type="button"
                      className="icon"
                      style={{ border: "none" }}
                      data-tooltip-id={`delete-${searchId}`}
                      onClick={() => promptDelete(searchId, search.name)}
                      disabled={rowBusy || tableBusy}
                      aria-label={`Delete saved search ${search.name}`}
                    >
                      <span className="flaticon-bin" />
                    </button>

                    <ReactTooltip
                      id={`delete-${searchId}`}
                      place="top"
                      content={rowBusy ? "Deleting..." : "Delete"}
                    />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <ConfirmDialog {...dialogProps} />
      <AsyncActionOverlay message={overlayMessage} />
    </>
  );
};

export default SearchDataTable;
