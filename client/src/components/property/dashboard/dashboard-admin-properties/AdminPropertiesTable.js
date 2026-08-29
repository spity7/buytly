"use client";

import Link from "next/link";
import React, { useCallback, useMemo, useState } from "react";
import { buytlyApi } from "@/api/generated";
import AsyncActionOverlay from "@/components/common/AsyncActionOverlay";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import ApiPagination from "@/components/property/ApiPagination";
import {
  DashboardFilterBar,
  FilterSearch,
  FilterSelect,
  FilterSortSelect,
} from "@/components/property/dashboard/DashboardFilterBar";
import { useAdminProperties } from "@/hooks/useAdminProperties";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import { useConfirmAction } from "@/hooks/useConfirmAction";
import { getStatusClass, getStatusLabel } from "@/lib/properties/mapProperty";
import {
  adminApproveListingConfirmation,
  adminArchiveListingConfirmation,
  adminReturnDraftConfirmation,
} from "@/lib/confirmations";
import {
  ADMIN_PROPERTY_STATUS_FILTERS,
  LISTING_TYPE_FILTERS,
  PROPERTY_SORT_OPTIONS,
  PROPERTY_TYPE_FILTERS,
  parseSortValue,
} from "@/lib/dashboard/filterOptions";
import { DashboardTableSkeleton } from "@/components/property/dashboard/skeletons/DashboardSkeletons";
import {
  useDashboardRowHighlight,
  useHighlightQueryParam,
} from "@/hooks/useDashboardRowHighlight";
import { useResolveDashboardHighlight } from "@/hooks/useResolveDashboardHighlight";
import { getFreshQueryOptions } from "@/lib/dashboard/freshHighlightQueryOptions";
import { invalidateNotificationQueries } from "@/lib/notifications/invalidateNotificationQueries";
import { useQueryClient } from "@tanstack/react-query";

const PAGE_SIZE = 20;

const formatDate = (value) => {
  if (!value) return "—";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
};

const getModerateLoadingMessage = (status) => {
  if (status === "active") return "Approving listing...";
  if (status === "draft") return "Returning listing to draft...";
  return "Updating listing...";
};

const getModerateConfirmConfig = (title, status) => {
  if (status === "active") return adminApproveListingConfirmation(title);
  if (status === "draft") return adminReturnDraftConfirmation(title);
  return adminArchiveListingConfirmation(title);
};

export default function AdminPropertiesTable() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput, search] = useDebouncedSearch();
  const [statusFilter, setStatusFilter] = useState("");
  const [listingType, setListingType] = useState("");
  const [type, setPropertyType] = useState("");
  const [sort, setSort] = useState("createdAt:desc");

  const { sortBy, sortOrder } = parseSortValue(sort);

  const queryParams = useMemo(() => {
    const params = {
      page,
      limit: PAGE_SIZE,
      sortBy,
      sortOrder,
    };

    if (statusFilter) params.status = statusFilter;
    if (listingType) params.listingType = listingType;
    if (type) params.type = type;
    if (search.trim()) params.search = search.trim();

    return params;
  }, [page, statusFilter, listingType, type, search, sortBy, sortOrder]);

  const { requestConfirm, isLocked, overlayMessage, dialogProps, pending } =
    useConfirmAction({ overlay: true });

  const highlightId = useHighlightQueryParam();
  const { data, isFetching, isError } = useAdminProperties(
    queryParams,
    getFreshQueryOptions(highlightId),
  );

  const properties = data?.properties || [];
  const pagination = data?.pagination;

  const resolveHighlight = useCallback(
    async ({ highlightId: id, findPage }) => {
      try {
        await buytlyApi.getPropertyById(id);
      } catch {
        return false;
      }

      setStatusFilter("");
      setListingType("");
      setPropertyType("");
      setSearchInput("");

      const foundPage = await findPage(async (scanPage) => {
        const response = await buytlyApi.adminListProperties({
          page: scanPage,
          limit: PAGE_SIZE,
          sortBy: "createdAt",
          sortOrder: "desc",
        });
        return {
          items: response.data,
          pagination: response.pagination,
        };
      });

      setPage(foundPage || 1);
    },
    [setSearchInput],
  );

  const highlightResolving = useResolveDashboardHighlight({
    highlightId,
    items: properties,
    isLoading: isFetching,
    resolve: resolveHighlight,
  });

  const showTableSkeleton = isFetching || highlightResolving;
  const highlightReady =
    !showTableSkeleton &&
    (!highlightId ||
      properties.some(
        (property) => String(property._id) === String(highlightId),
      ));
  const { getRowProps } = useDashboardRowHighlight({
    highlightId,
    ready: highlightReady,
  });

  const promptModerate = (propertyId, title, status) => {
    requestConfirm({
      ...getModerateConfirmConfig(title, status),
      targetId: propertyId,
      action: {
        message: getModerateLoadingMessage(status),
        successMessage: `Listing marked as ${getStatusLabel(status)}`,
        task: () => buytlyApi.adminModerateProperty(propertyId, { status }),
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["admin-properties"] });
          invalidateNotificationQueries(queryClient);
        },
      },
    });
  };

  const tableBusy = isLocked;
  const moderatingId = pending?.targetId ?? null;

  return (
    <>
      <DashboardFilterBar className="mb20">
        <FilterSearch
          id="admin-properties-search"
          value={searchInput}
          onChange={setSearchInput}
          placeholder="Search listings"
          disabled={tableBusy}
        />
        <FilterSelect
          id="admin-status-filter"
          label="Status"
          hideLabel
          value={statusFilter}
          disabled={tableBusy}
          onChange={(value) => {
            setPage(1);
            setStatusFilter(value);
          }}
          options={ADMIN_PROPERTY_STATUS_FILTERS}
        />
        <FilterSelect
          id="admin-listing-type"
          label="Listing type"
          hideLabel
          value={listingType}
          disabled={tableBusy}
          onChange={(value) => {
            setPage(1);
            setListingType(value);
          }}
          options={LISTING_TYPE_FILTERS}
        />
        <FilterSelect
          id="admin-property-type"
          label="Property type"
          hideLabel
          value={type}
          disabled={tableBusy}
          onChange={(value) => {
            setPage(1);
            setPropertyType(value);
          }}
          options={PROPERTY_TYPE_FILTERS}
        />
        <FilterSortSelect
          value={sort}
          disabled={tableBusy}
          onChange={(value) => {
            setPage(1);
            setSort(value);
          }}
          options={PROPERTY_SORT_OPTIONS}
        />
      </DashboardFilterBar>

      {isError ? (
        <p className="p-4 text-danger">Failed to load properties.</p>
      ) : showTableSkeleton ? (
        <DashboardTableSkeleton rows={5} columns={5} />
      ) : !properties.length ? (
        <p className="p-4 mb0">No listings match this filter.</p>
      ) : (
        <table className="table-style3 table at-savesearch admin-properties-table">
          <thead className="t-head">
            <tr>
              <th scope="col">Title</th>
              <th scope="col" className="admin-properties-table__owner">
                Owner
              </th>
              <th scope="col">Created</th>
              <th scope="col">Status</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody className="t-body">
            {properties.map((property) => {
              const propertyId = property._id;
              const owner = property.ownerId;
              const rowBusy = moderatingId === propertyId;

              return (
                <tr key={propertyId} {...getRowProps(propertyId)}>
                  <th scope="row">
                    <Link href={`/single-v1/${propertyId}`}>
                      {property.title}
                    </Link>
                  </th>
                  <td className="vam admin-properties-table__owner">
                    {owner?.firstName} {owner?.lastName}
                    <br />
                    <span className="text fz13">{owner?.email}</span>
                  </td>
                  <td className="vam">{formatDate(property.createdAt)}</td>
                  <td className="vam">
                    <span className={getStatusClass(property.status)}>
                      {getStatusLabel(property.status)}
                    </span>
                  </td>
                  <td className="vam">
                    <div className="d-flex flex-wrap gap-2">
                      {property.status === "pending" && (
                        <>
                          <button
                            type="button"
                            className="ud-btn btn-thm btn-sm"
                            disabled={rowBusy || tableBusy}
                            onClick={() =>
                              promptModerate(
                                propertyId,
                                property.title,
                                "active",
                              )
                            }
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            className="ud-btn btn-white btn-sm"
                            disabled={rowBusy || tableBusy}
                            onClick={() =>
                              promptModerate(
                                propertyId,
                                property.title,
                                "draft",
                              )
                            }
                          >
                            Return to draft
                          </button>
                        </>
                      )}
                      {property.status === "active" && (
                        <button
                          type="button"
                          className="ud-btn btn-white btn-sm"
                          disabled={rowBusy || tableBusy}
                          onClick={() =>
                            promptModerate(
                              propertyId,
                              property.title,
                              "archived",
                            )
                          }
                        >
                          Archive
                        </button>
                      )}
                      <Link
                        href={`/dashboard-edit-property/${propertyId}`}
                        className={`ud-btn btn-white btn-sm${tableBusy ? " pe-none opacity-50" : ""}`}
                        aria-disabled={tableBusy}
                        tabIndex={tableBusy ? -1 : undefined}
                      >
                        View / edit
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {!showTableSkeleton && (
        <div className="mt30">
          <ApiPagination
            page={page}
            totalPages={pagination?.totalPages || 1}
            total={pagination?.total || 0}
            limit={PAGE_SIZE}
            onPageChange={setPage}
          />
        </div>
      )}

      <ConfirmDialog {...dialogProps} />
      <AsyncActionOverlay message={overlayMessage} />
    </>
  );
}
