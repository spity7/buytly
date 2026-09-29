"use client";

import Image from "next/image";
import Link from "next/link";
import FavoriteButton from "@/components/property/FavoriteButton";
import { getPublicListingCardHref } from "@/lib/properties/mapProperty";
const PLACEHOLDER = "/images/listings/list-1.jpg";

const LAYOUT_COLUMNS = {
  sidebar: {
    grid: "col-sm-6 col-lg-6",
    list: "col-sm-12",
    imageHeight: "230px",
  },
  "full-4": {
    grid: "col-sm-6 col-lg-4 col-xl-3",
    list: "col-sm-12 col-lg-6",
    imageHeight: "170px",
  },
  "full-2": {
    grid: "col-sm-6 col-lg-6",
    list: "col-sm-12",
    imageHeight: "230px",
  },
};

export default function ListingPropertyGrid({
  data = [],
  colstyle = false,
  isLoading = false,
  layout = "full-4",
  discoveryMode = "units",
}) {
  const columns = LAYOUT_COLUMNS[layout] || LAYOUT_COLUMNS["full-4"];
  const columnClass = colstyle ? columns.list : columns.grid;
  const emptyLabel = discoveryMode === "projects" ? "projects" : "properties";

  if (isLoading) {
    return (
      <div className="col-12 text-center py-5">
        <p className="text">Loading {emptyLabel}...</p>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="col-12 text-center py-5">
        <p className="text">
          No {emptyLabel} found. Try adjusting your filters.
        </p>
      </div>
    );
  }

  return (
    <>
      {data.map((listing) => {
        const id = listing.id || listing._id;
        const image = listing.image || PLACEHOLDER;
        const href = getPublicListingCardHref(listing);
        const isProject =
          listing.itemType === "project" || discoveryMode === "projects";

        return (
          <div className={columnClass} key={id}>
            <div
              className={
                colstyle
                  ? "listing-style1 listCustom listing-type"
                  : "listing-style1"
              }
            >
              <div className="list-thumb">
                <Image
                  width={382}
                  height={248}
                  style={{ height: columns.imageHeight }}
                  className="w-100 cover"
                  src={image}
                  alt={listing.title || "listing"}
                />
                {!isProject ? (
                  <div className="sale-sticker-wrap">
                    <div className="list-tag fz12">
                      <span className="flaticon-electricity me-2" />
                      FEATURED
                    </div>
                  </div>
                ) : null}

                <div className="list-price">{listing.price}</div>
              </div>
              <div className="list-content">
                <h6 className="list-title">
                  <Link href={href}>{listing.title}</Link>
                </h6>
                <p className="list-text">{listing.location}</p>
                {isProject ? (
                  <p className="list-text fz14 text-muted mb-0">
                    {listing.unitCount ?? 0} unit
                    {listing.unitCount === 1 ? "" : "s"}
                  </p>
                ) : listing.projectTitle ? (
                  <p className="list-text fz14 text-muted mb-0">
                    {listing.projectTitle}
                  </p>
                ) : null}
                {!isProject && (
                  <div className="list-meta d-flex align-items-center">
                    <span>
                      <span className="flaticon-bed" /> {listing.bed} bed
                    </span>
                    <span>
                      <span className="flaticon-shower" /> {listing.bath} bath
                    </span>
                    <span>
                      <span className="flaticon-expand" /> {listing.sqft} sqft
                    </span>
                  </div>
                )}
                <hr className="mt-2 mb-2" />
                <div className="list-meta2 d-flex justify-content-between align-items-center">
                  <span className="for-what">For Sale</span>
                  <div className="icons d-flex align-items-center">
                    <Link href={href} className="icon">
                      <span className="flaticon-fullscreen" />
                    </Link>
                    <Link href={href} className="icon">
                      <span className="flaticon-new-tab" />
                    </Link>
                    {!isProject && <FavoriteButton propertyId={id} />}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}
