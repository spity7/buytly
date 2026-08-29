"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { Tooltip as ReactTooltip } from "react-tooltip";
import { buytlyApi } from "@/api/generated";
import AsyncActionOverlay from "@/components/common/AsyncActionOverlay";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { useMyProperties } from "@/hooks/useMyProperties";
import { useConfirmAction } from "@/hooks/useConfirmAction";
import { propertyTrashConfirmation } from "@/lib/confirmations";
import { getStatusClass, getStatusLabel } from "@/lib/properties/mapProperty";
import { DashboardTableSkeleton } from "@/components/property/dashboard/skeletons/DashboardSkeletons";
import { useQueryClient } from "@tanstack/react-query";

const PLACEHOLDER = "/images/listings/list-1.jpg";

const formatDate = (value) => {
  if (!value) return "—";
  return new Intl.DateTimeFormat(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
};

const PropertyDataTable = () => {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("active");
  const { requestConfirm, run, isLocked, overlayMessage, dialogProps, pending } =
    useConfirmAction({ overlay: true });

  const isTrash = tab === "trash";

  const { data, isLoading, isError } = useMyProperties({
    sortBy: "createdAt",
    sortOrder: "desc",
    trashed: isTrash ? "true" : "false",
  });

  const properties = data?.properties || [];
  const cards = data?.cards || [];

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["my-properties"] });
  };

  const promptDelete = (propertyId, title) => {
    requestConfirm({
      ...propertyTrashConfirmation(title),
      targetId: propertyId,
      action: {
        message: "Moving listing to trash...",
        successMessage: "Listing moved to trash",
        task: () => buytlyApi.deleteProperty(propertyId),
        onSuccess: invalidate,
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

  if (isLoading) {
    return (
      <div className="packages_table table-responsive">
        <DashboardTableSkeleton rows={5} columns={5} withThumbnail />
      </div>
    );
  }

  if (isError) {
    return <p className="p-4 text-danger">Failed to load your properties.</p>;
  }

  return (
    <>
      <div className="mb20 d-flex gap-2">
        <button
          type="button"
          className={`ud-btn btn-sm ${tab === "active" ? "btn-thm" : "btn-white"}`}
          disabled={tableBusy}
          onClick={() => setTab("active")}
        >
          My listings
        </button>
        <button
          type="button"
          className={`ud-btn btn-sm ${tab === "trash" ? "btn-thm" : "btn-white"}`}
          disabled={tableBusy}
          onClick={() => setTab("trash")}
        >
          Trash
        </button>
      </div>

      {!properties.length ? (
        <div className="p-4">
          <p>
            {isTrash ? "Your trash is empty." : "You have no listings yet."}
          </p>
          {!isTrash && (
            <Link href="/dashboard-add-property" className="ud-btn btn-thm">
              Add your first property
            </Link>
          )}
        </div>
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
                <tr key={propertyId}>
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
                    <span className={getStatusClass(property.status)}>
                      {isTrash ? "In trash" : getStatusLabel(property.status)}
                    </span>
                  </td>
                  {!isTrash && (
                    <td className="vam">{property.viewCount ?? 0}</td>
                  )}
                  <td className="vam">
                    <div className="d-flex">
                      {isTrash ? (
                        <button
                          type="button"
                          className="ud-btn btn-thm btn-sm"
                          disabled={rowBusy || tableBusy}
                          onClick={() => handleRestore(propertyId)}
                        >
                          Restore
                        </button>
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
                            onClick={() => promptDelete(propertyId, property.title)}
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

      <ConfirmDialog {...dialogProps} />
      <AsyncActionOverlay message={overlayMessage} />
    </>
  );
};

export default PropertyDataTable;
