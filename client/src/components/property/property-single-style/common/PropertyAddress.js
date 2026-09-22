"use client";

import PropertyLocationMap from "@/components/property/property-single-style/common/PropertyLocationMap";
import { hasPropertyMapCoordinates } from "@/lib/geo/propertyCoordinates";
import { usePropertySingle } from "@/providers/PropertySingleProvider";
import React from "react";

const PropertyAddress = () => {
  const { property } = usePropertySingle();
  const location = property?.location;

  if (!location) {
    return <p className="text">Address not available.</p>;
  }

  const showMap = hasPropertyMapCoordinates(location);

  return (
    <>
      <div className="col-md-6 col-xl-4">
        <div className="d-flex justify-content-between">
          <div className="pd-list">
            <p className="fw600 mb10 ff-heading dark-color">Address</p>
            <p className="fw600 mb10 ff-heading dark-color">City</p>
            <p className="fw600 mb-0 ff-heading dark-color">Country</p>
          </div>
          <div className="pd-list">
            <p className="text mb10">{location.address || "—"}</p>
            <p className="text mb10">{location.city || "—"}</p>
            <p className="text mb-0">{location.country || "—"}</p>
          </div>
        </div>
      </div>

      {showMap ? (
        <div className="col-md-12">
          <PropertyLocationMap />
        </div>
      ) : null}
    </>
  );
};

export default PropertyAddress;
