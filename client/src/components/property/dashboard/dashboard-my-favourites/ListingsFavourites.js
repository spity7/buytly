"use client";

import React from "react";
import { Tooltip as ReactTooltip } from "react-tooltip";
import Image from "next/image";
import Link from "next/link";
import { DashboardGridSkeleton } from "@/components/property/dashboard/skeletons/DashboardSkeletons";
import { useFavorites, useToggleFavorite } from "@/hooks/useFavorites";

const PLACEHOLDER = "/images/listings/list-1.jpg";

const ListingsFavourites = () => {
  const { data, isLoading, isError } = useFavorites({ limit: 50 });
  const toggleFavorite = useToggleFavorite();
  const cards = data?.cards || [];

  const handleDeleteListing = async (propertyId) => {
    toggleFavorite.mutate({ propertyId, isFavorite: true });
  };

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
                    onClick={() => handleDeleteListing(id)}
                    style={{ border: "none" }}
                    data-tooltip-id={`delete-${id}`}
                    disabled={toggleFavorite.isPending}
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
    </>
  );
};

export default ListingsFavourites;
