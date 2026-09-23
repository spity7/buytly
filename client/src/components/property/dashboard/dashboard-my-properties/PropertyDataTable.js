"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Tooltip as ReactTooltip } from "react-tooltip";
import { buytlyApi } from "@/api/generated";
import AsyncActionOverlay from "@/components/common/AsyncActionOverlay";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import ApiPagination from "@/components/property/ApiPagination";
import { useMyProperties } from "@/hooks/useMyProperties";
import { useConfirmAction } from "@/hooks/useConfirmAction";
import {
  propertyPermanentDeleteConfirmation,
  propertyTrashConfirmation,
} from "@/lib/confirmations";
import { getApiError } from "@/lib/auth/getApiError";
import { notifyError } from "@/lib/toast";
import StatusBadge from "@/components/common/StatusBadge";
import { getPropertyStatusBadgeProps } from "@/lib/statusBadges";
import { DashboardTableSkeleton } from "@/components/property/dashboard/skeletons/DashboardSkeletons";
import {
  useDashboardRowHighlight,
  useHighlightQueryParam,
} from "@/hooks/useDashboardRowHighlight";
import { getFreshQueryOptions } from "@/lib/dashboard/freshHighlightQueryOptions";
import { invalidateNotificationQueries } from "@/lib/notifications/invalidateNotificationQueries";
import { useQueryClient } from "@tanstack/react-query";
import DashboardTableEmptyState, {
  DashboardTableErrorState,
} from "@/components/property/dashboard/DashboardTableEmptyState";
import { getPropertiesTableEmptyState } from "@/lib/dashboard/tableEmptyStates";

const PLACEHOLDER = "/images/listings/list-1.jpg";

const formatDate = (value) => {
  if (!value) return "—";
  return new Intl.DateTimeFormat(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
};

const PropertyDataTable = ({
  queryParams,
  isTrash,
  page,
  pageSize,
  onPageChange,
  highlightResolving = false,
  hasActiveFilters = false,
  onMovedToTrash,
  onClearFilters,
  onShowActiveListings,
}) => {
  const queryClient = useQueryClient();
  const {
    requestConfirm,
    run,
    isLocked,
    overlayMessage,
    dialogProps,
    pending,
  } = useConfirmAction({ overlay: true });

  const highlightId = useHighlightQueryParam();
  const { data, isFetching, isError } = useMyProperties(
    queryParams,
    getFreshQueryOptions(highlightId),
  );

  const properties = data?.properties || [];
  const cards = data?.cards || [];
  const pagination = data?.pagination;
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

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["my-properties"] });
    invalidateNotificationQueries(queryClient);
  };

  const promptDelete = (propertyId, title) => {
    requestConfirm({
      ...propertyTrashConfirmation(title),
      targetId: propertyId,
      action: {
        message: "Moving listing to trash...",
        successMessage: "Listing moved to trash",
        task: () => buytlyApi.deleteProperty(propertyId),
        onSuccess: () => {
          invalidate();
          onMovedToTrash?.();
        },
      },
    });
  };

  const promptPermanentDelete = (propertyId, title) => {
    requestConfirm({
      ...propertyPermanentDeleteConfirmation(title),
      targetId: propertyId,
      action: {
        message: "Deleting listing permanently...",
        successMessage: "Listing permanently deleted",
        task: () => buytlyApi.permanentlyDeleteProperty(propertyId),
        onSuccess: invalidate,
        onError: (error) => notifyError(getApiError(error)),
      },
    });
  };

  const handleRestore = async (propertyId) => {
    try {
      await run({
        message: "Restoring listing...",
        successMessage: "Listing restored as draft",
        task: () => buytlyApi.restoreProperty(propertyId),
      });
      invalidate();
    } catch {
      // Toast handled by useConfirmAction
    }
  };

  const tableBusy = isLocked;
  const actingId = pending?.targetId ?? null;

  if (isError) {
    return (
      <DashboardTableErrorState
        title="Could not load units"
        onRetry={() =>
          queryClient.invalidateQueries({ queryKey: ["my-properties"] })
        }
      />
    );
  }

  const emptyState = getPropertiesTableEmptyState({
    isTrash,
    hasActiveFilters,
    onClearFilters,
    onShowActiveListings,
  });

  return (
    <>
      {showTableSkeleton ? (
        <div className="packages_table table-responsive">
          <DashboardTableSkeleton rows={5} columns={5} withThumbnail />
        </div>
      ) : !properties.length ? (
        <DashboardTableEmptyState {...emptyState} />
      ) : (
        <table className="table-style3 table at-savesearch">
          <thead className="t-head">
            <tr>
              <th scope="col">Listing title</th>
              <th scope="col">{isTrash ? "Deleted" : "Date Published"}</th>
              <th scope="col">Status</th>
              {!isTrash && <th scope="col">Views</th>}
              <th scope="col">Action</th>
            </tr>
          </thead>
          <tbody className="t-body">
            {properties.map((property, index) => {
              const card = cards[index];
              const propertyId = property._id;
              const rowBusy = actingId === propertyId;

              return (
                <tr key={propertyId} {...getRowProps(propertyId)}>
                  <th scope="row">
                    <div className="listing-style1 dashboard-style d-xxl-flex align-items-center mb-0">
                      <div className="list-thumb">
                        <Image
                          width={110}
                          height={94}
                          className="w-100"
                          src={card?.image || PLACEHOLDER}
                          alt="property"
                        />
                      </div>
                      <div className="list-content py-0 p-0 mt-2 mt-xxl-0 ps-xxl-4">
                        <div className="h6 list-title">
                          {isTrash ? (
                            property.title
                          ) : (
                            <Link href={`/single-v1/${propertyId}`}>
                              {property.title}
                            </Link>
                          )}
                        </div>
                        <p className="list-text mb-0">{card?.location}</p>
                        <div className="list-price">
                          <span>{card?.price}</span>
                        </div>
                      </div>
                    </div>
                  </th>
                  <td className="vam">
                    {formatDate(
                      isTrash ? property.deletedAt : property.createdAt,
                    )}
                  </td>
                  <td className="vam">
                    <StatusBadge
                      {...getPropertyStatusBadgeProps(property, {
                        isTrashView: isTrash,
                      })}
                    />
                  </td>
                  {!isTrash && (
                    <td className="vam">{property.viewCount ?? 0}</td>
                  )}
                  <td className="vam">
                    <div className="d-flex">
                      {isTrash ? (
                        <div className="d-flex flex-wrap align-items-center gap-2">
                          <button
                            type="button"
                            className="ud-btn btn-thm btn-sm"
                            disabled={rowBusy || tableBusy}
                            onClick={() => handleRestore(propertyId)}
                          >
                            Restore
                          </button>
                          <button
                            type="button"
                            className="ud-btn btn-white2 btn-sm text-danger"
                            disabled={rowBusy || tableBusy}
                            onClick={() =>
                              promptPermanentDelete(propertyId, property.title)
                            }
                          >
                            Delete permanently
                          </button>
                        </div>
                      ) : (
                        <>
                          <Link
                            href={`/dashboard-edit-property/${propertyId}`}
                            className={`icon${tableBusy ? " pe-none opacity-50" : ""}`}
                            data-tooltip-id={`edit-${propertyId}`}
                            aria-disabled={tableBusy}
                            tabIndex={tableBusy ? -1 : undefined}
                          >
                            <span className="fas fa-pen fa" />
                          </Link>
                          <button
                            className="icon"
                            style={{ border: "none" }}
                            data-tooltip-id={`delete-${propertyId}`}
                            onClick={() =>
                              promptDelete(propertyId, property.title)
                            }
                            disabled={rowBusy || tableBusy}
                          >
                            <span className="flaticon-bin" />
                          </button>

                          <ReactTooltip
                            id={`edit-${propertyId}`}
                            place="top"
                            content="Edit"
                          />
                          <ReactTooltip
                            id={`delete-${propertyId}`}
                            place="top"
                            content="Move to trash"
                          />
                        </>
                      )}
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
            limit={pageSize}
            onPageChange={onPageChange}
          />
        </div>
      )}

      <ConfirmDialog {...dialogProps} />
      <AsyncActionOverlay message={overlayMessage} />
    </>
  );
};

export default PropertyDataTable;
