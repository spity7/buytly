"use client";

import Image from "next/image";
import Link from "next/link";
import FavoriteButton from "@/components/property/FavoriteButton";

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
}) {
  const columns = LAYOUT_COLUMNS[layout] || LAYOUT_COLUMNS["full-4"];
  const columnClass = colstyle ? columns.list : columns.grid;

  if (isLoading) {
    return (
      <div className="col-12 text-center py-5">
        <p className="text">Loading properties...</p>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="col-12 text-center py-5">
        <p className="text">No properties found. Try adjusting your filters.</p>
      </div>
    );
  }

  return (
    <>
      {data.map((listing) => {
        const id = listing.id || listing._id;
        const image = listing.image || PLACEHOLDER;
        const forRent = listing.forRent ?? listing.listingType === "rent";
        const priceSuffix = forRent ? " / mo" : "";

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
                <div className="sale-sticker-wrap">
                  {!forRent && (
                    <div className="list-tag fz12">
                      <span className="flaticon-electricity me-2" />
                      FEATURED
                    </div>
                  )}
                </div>

                <div className="list-price">
                  {listing.price}
                  {priceSuffix && <span>{priceSuffix}</span>}
                </div>
              </div>
              <div className="list-content">
                <h6 className="list-title">
                  <Link href={`/single-v1/${id}`}>{listing.title}</Link>
                </h6>
                <p className="list-text">{listing.location}</p>
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
                <hr className="mt-2 mb-2" />
                <div className="list-meta2 d-flex justify-content-between align-items-center">
                  <span className="for-what">
                    For {forRent ? "Rent" : "Sale"}
                  </span>
                  <div className="icons d-flex align-items-center">
                    <Link href={`/single-v1/${id}`} className="icon">
                      <span className="flaticon-fullscreen" />
                    </Link>
                    <Link href={`/single-v1/${id}`} className="icon">
                      <span className="flaticon-new-tab" />
                    </Link>
                    <FavoriteButton propertyId={id} />
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
