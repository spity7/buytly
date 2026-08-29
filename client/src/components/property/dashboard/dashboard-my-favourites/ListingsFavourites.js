"use client";

import React from "react";
import { Tooltip as ReactTooltip } from "react-tooltip";
import Image from "next/image";
import Link from "next/link";
import { buytlyApi } from "@/api/generated";
import AsyncActionOverlay from "@/components/common/AsyncActionOverlay";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { DashboardGridSkeleton } from "@/components/property/dashboard/skeletons/DashboardSkeletons";
import { useFavorites } from "@/hooks/useFavorites";
import { useConfirmAction } from "@/hooks/useConfirmAction";
import { favoriteRemoveConfirmation } from "@/lib/confirmations";
import { useQueryClient } from "@tanstack/react-query";

const PLACEHOLDER = "/images/listings/list-1.jpg";

const ListingsFavourites = () => {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useFavorites({ limit: 50 });
  const { requestConfirm, isLocked, overlayMessage, dialogProps, pending } =
    useConfirmAction({ overlay: true });
  const cards = data?.cards || [];

  const promptRemove = (propertyId, title) => {
    requestConfirm({
      ...favoriteRemoveConfirmation(title),
      targetId: propertyId,
      action: {
        message: "Removing from favorites...",
        successMessage: "Removed from favorites",
        task: () => buytlyApi.removeFavorite(propertyId),
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["favorites"] });
          queryClient.invalidateQueries({
            queryKey: ["favorite-status", propertyId],
          });
        },
      },
    });
  };

  const tableBusy = isLocked;
  const actingId = pending?.targetId ?? null;

  if (isLoading) {
    return <DashboardGridSkeleton count={4} />;
  }

  if (isError) {
    return <p className="p-4 text-danger">Failed to load favorites.</p>;
  }

  return (
    <>
      {cards.length === 0 ? (
        <h3>No items available.</h3>
      ) : (
        cards.map((listing) => {
          const id = listing.id || listing._id;
          const forRent = listing.forRent ?? listing.listingType === "rent";
          const rowBusy = actingId === id;

          return (
            <div className="col-md-6 col-lg-4 col-xl-3" key={id}>
              <div className="listing-style1 style2">
                <div className="list-thumb">
                  <Image
                    width={382}
                    height={248}
                    className="w-100 h-100 cover"
                    src={listing.image || PLACEHOLDER}
                    alt={listing.title || "listing"}
                  />

                  <button
                    className="tag-del"
                    title="Delete Item"
                    onClick={() => promptRemove(id, listing.title || "Listing")}
                    style={{ border: "none" }}
                    data-tooltip-id={`delete-${id}`}
                    disabled={rowBusy || tableBusy}
                  >
                    <span className="fas fa-trash-can"></span>
                  </button>

                  <ReactTooltip
                    id={`delete-${id}`}
                    place="left"
                    content="Remove from favorites"
                  />

                  <div className="list-price">
                    {listing.price}
                    {forRent && <span> / mo</span>}
                  </div>
                </div>
                <div className="list-content">
                  <h6 className="list-title">
                    <Link href={`/single-v1/${id}`}>{listing.title}</Link>
                  </h6>
                  <p className="list-text">{listing.location}</p>
                  <div className="list-meta d-flex align-items-center">
                    <a href="#">
                      <span className="flaticon-bed" /> {listing.bed} bed
                    </a>
                    <a href="#">
                      <span className="flaticon-shower" /> {listing.bath} bath
                    </a>
                    <a href="#">
                      <span className="flaticon-expand" /> {listing.sqft} sqft
                    </a>
                  </div>
                  <hr className="mt-2 mb-2" />
                  <div className="list-meta2 d-flex justify-content-between align-items-center">
                    <span className="for-what">
                      For {forRent ? "Rent" : "Sale"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })
      )}

      <ConfirmDialog {...dialogProps} />
      <AsyncActionOverlay message={overlayMessage} />
    </>
  );
};

export default ListingsFavourites;
