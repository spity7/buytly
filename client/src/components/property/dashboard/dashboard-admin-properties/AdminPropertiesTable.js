"use client";

import Link from "next/link";
import React, { useState } from "react";
import { buytlyApi } from "@/api/generated";
import AsyncActionOverlay from "@/components/common/AsyncActionOverlay";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { useAdminProperties } from "@/hooks/useAdminProperties";
import { useConfirmAction } from "@/hooks/useConfirmAction";
import { getStatusClass, getStatusLabel } from "@/lib/properties/mapProperty";
import {
  adminApproveListingConfirmation,
  adminArchiveListingConfirmation,
  adminReturnDraftConfirmation,
} from "@/lib/confirmations";
import { DashboardTableSkeleton } from "@/components/property/dashboard/skeletons/DashboardSkeletons";
import { useQueryClient } from "@tanstack/react-query";

const STATUS_FILTERS = [
  { value: "", label: "All statuses" },
  { value: "pending", label: "Pending review" },
  { value: "active", label: "Published" },
  { value: "draft", label: "Draft" },
  { value: "sold", label: "Sold" },
  { value: "rented", label: "Rented" },
  { value: "archived", label: "Archived" },
];

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
  const [statusFilter, setStatusFilter] = useState("pending");
  const { requestConfirm, isLocked, overlayMessage, dialogProps, pending } =
    useConfirmAction({ overlay: true });

  const { data, isLoading, isError } = useAdminProperties({
    status: statusFilter || undefined,
    limit: 50,
  });

  const properties = data?.properties || [];

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
        },
      },
    });
  };

  const tableBusy = isLocked;
  const moderatingId = pending?.targetId ?? null;

  if (isLoading) {
    return <DashboardTableSkeleton rows={5} columns={5} />;
  }

  if (isError) {
    return <p className="p-4 text-danger">Failed to load properties.</p>;
  }

  return (
    <>
      <div className="mb20 d-flex flex-wrap gap-3 align-items-center">
        <label
          className="heading-color ff-heading fw600 mb0"
          htmlFor="admin-status-filter"
        >
          Filter by status
        </label>
        <select
          id="admin-status-filter"
          className="form-control"
          style={{ maxWidth: 220 }}
          value={statusFilter}
          disabled={tableBusy}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          {STATUS_FILTERS.map((option) => (
            <option key={option.value || "all"} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {!properties.length ? (
        <p className="p-4 mb0">No listings match this filter.</p>
      ) : (
        <table className="table-style3 table at-savesearch">
          <thead className="t-head">
            <tr>
              <th scope="col">Title</th>
              <th scope="col">Owner</th>
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
                <tr key={propertyId}>
                  <th scope="row">
                    <Link href={`/single-v1/${propertyId}`}>
                      {property.title}
                    </Link>
                  </th>
                  <td className="vam">
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
                              promptModerate(propertyId, property.title, "active")
                            }
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            className="ud-btn btn-white btn-sm"
                            disabled={rowBusy || tableBusy}
                            onClick={() =>
                              promptModerate(propertyId, property.title, "draft")
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
                            promptModerate(propertyId, property.title, "archived")
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

      <ConfirmDialog {...dialogProps} />
      <AsyncActionOverlay message={overlayMessage} />
    </>
  );
}
