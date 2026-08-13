"use client";

import { buytlyApi } from "@/api/generated";
import { getApiError } from "@/lib/auth/getApiError";
import { notifyError, notifySuccess } from "@/lib/toast";
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
  const [deletingId, setDeletingId] = useState(null);

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

  const handleDelete = async (searchId) => {
    setDeletingId(searchId);

    try {
      const response = await buytlyApi.removeSavedSearch(searchId);
      setSearches(response.data || []);
      notifySuccess("Saved search removed.");
    } catch (err) {
      notifyError(getApiError(err));
    } finally {
      setDeletingId(null);
    }
  };

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
                    onClick={() => handleDelete(searchId)}
                    disabled={deletingId === searchId}
                    aria-label={`Delete saved search ${search.name}`}
                  >
                    <span className="flaticon-bin" />
                  </button>

                  <ReactTooltip
                    id={`delete-${searchId}`}
                    place="top"
                    content={deletingId === searchId ? "Deleting..." : "Delete"}
                  />
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default SearchDataTable;
