"use client";

import FavoriteButton from "@/components/property/FavoriteButton";
import { usePropertySingle } from "@/providers/PropertySingleProvider";
import React from "react";

const PropertyHeader = () => {
  const { card, property } = usePropertySingle();
  const data = card;

  if (!data) return null;

  const forRent = data.forRent;
  const areaUnit = property?.areaUnit || "sqm";
  const pricePerSqft =
    data.sqft && data.priceValue
      ? (Number(data.priceValue) / Number(data.sqft)).toFixed(2)
      : null;

  return (
    <>
      <div className="col-lg-8">
        <div className="single-property-content mb30-md">
          <h2 className="sp-lg-title">{data.title}</h2>
          <div className="pd-meta mb15 d-md-flex align-items-center">
            <p className="text fz15 mb-0 bdrr1 pr10 bdrrn-sm">
              {data.location}
            </p>
            <a
              className="ff-heading text-thm fz15 bdrr1 pr10 ml0-sm ml10 bdrrn-sm"
              href="#"
            >
              <i className="fas fa-circle fz10 pe-2" />
              For {forRent ? "rent" : "sale"}
            </a>
            <a className="ff-heading ml10 ml0-sm fz15" href="#">
              <i className="flaticon-fullscreen pe-2 align-text-top" />
              {property?.viewCount ?? 0}
            </a>
          </div>
          <div className="property-meta d-flex align-items-center">
            <a className="text fz15" href="#">
              <i className="flaticon-bed pe-2 align-text-top" />
              {data.bed} bed
            </a>
            <a className="text ml20 fz15" href="#">
              <i className="flaticon-shower pe-2 align-text-top" />
              {data.bath} bath
            </a>
            <a className="text ml20 fz15" href="#">
              <i className="flaticon-expand pe-2 align-text-top" />
              {data.sqft} {areaUnit}
            </a>
          </div>
        </div>
      </div>

      <div className="col-lg-4">
        <div className="single-property-content">
          <div className="property-action text-lg-end">
            <div className="d-flex mb20 mb10-md align-items-center justify-content-lg-end">
              <FavoriteButton propertyId={data.id} className="mr10" />
              <a className="icon mr10" href="#">
                <span className="flaticon-new-tab" />
              </a>
              <a className="icon mr10" href="#">
                <span className="flaticon-share-1" />
              </a>
              <a className="icon" href="#">
                <span className="flaticon-printer" />
              </a>
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
