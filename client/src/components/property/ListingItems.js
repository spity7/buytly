"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";
import FavoriteButton from "./FavoriteButton";

const PLACEHOLDER = "/images/listings/list-1.jpg";

const ListingItems = ({ data }) => {
  return (
    <>
      {data?.map((listing) => {
        const id = listing.id || listing._id;
        const image = listing.image || PLACEHOLDER;
        const forRent = listing.forRent ?? listing.listingType === "rent";
        const priceSuffix = forRent ? " / mo" : "";

        return (
          <div className="col-md-6" key={id}>
            <div className="listing-style1">
              <div className="list-thumb">
                <Image
                  width={382}
                  height={248}
                  className="w-100 h-100 cover"
                  src={image}
                  alt={listing.title || "listing"}
                />
                <div className="sale-sticker-wrap">
                  {listing.featured && (
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
};

export default ListingItems;
