"use client";

import PropertyHeaderActions from "@/components/property/property-single-style/common/PropertyHeaderActions";
import { getPublicListingStatusLabel } from "@/lib/properties/listingStatusBanner";
import { usePropertySingle } from "@/providers/PropertySingleProvider";
import React from "react";

const PropertyHeader = () => {
  const { card, property } = usePropertySingle();
  const data = card;

  if (!data) return null;

  const areaUnit = property?.areaUnit || "sqm";
  const pricePerSqft =
    data.sqft && data.priceValue
      ? (Number(data.priceValue) / Number(data.sqft)).toFixed(2)
      : null;
  const listingLabel = getPublicListingStatusLabel(
    property?.status ?? data.status,
  );
  const viewCount = property?.viewCount ?? data.viewCount ?? 0;

  return (
    <>
      <div className="col-lg-8">
        <div className="single-property-content mb30-md">
          <h2 className="sp-lg-title">{data.title}</h2>
          <div className="pd-meta mb15 d-md-flex align-items-center">
            <p className="text fz15 mb-0 bdrr1 pr10 bdrrn-sm">
              {data.location}
            </p>
            <span className="ff-heading text-thm fz15 bdrr1 pr10 ml0-sm ml10 bdrrn-sm">
              <i className="fas fa-circle fz10 pe-2" aria-hidden="true" />
              {listingLabel}
            </span>
            <span className="ff-heading text fz15 ml10 ml0-sm">
              <i
                className="flaticon-fullscreen pe-2 align-text-top"
                aria-hidden="true"
              />
              {viewCount.toLocaleString()}
            </span>
          </div>
          <div className="property-meta d-flex align-items-center">
            <span className="text fz15">
              <i
                className="flaticon-bed pe-2 align-text-top"
                aria-hidden="true"
              />
              {data.bed} bed
            </span>
            <span className="text ml20 fz15">
              <i
                className="flaticon-shower pe-2 align-text-top"
                aria-hidden="true"
              />
              {data.bath} bath
            </span>
            <span className="text ml20 fz15">
              <i
                className="flaticon-expand pe-2 align-text-top"
                aria-hidden="true"
              />
              {data.sqft} {areaUnit}
            </span>
          </div>
        </div>
      </div>

      <div className="col-lg-4">
        <div className="single-property-content">
          <div className="property-action text-lg-end">
            <div className="d-flex mb20 mb10-md align-items-center justify-content-lg-end">
              <PropertyHeaderActions propertyId={data.id} />
            </div>
            <h3 className="price mb-0">{data.price}</h3>
            {pricePerSqft && (
              <p className="text space fz15">${pricePerSqft}/sq ft</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PropertyHeader;
