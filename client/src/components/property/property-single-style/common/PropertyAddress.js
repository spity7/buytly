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
      <div className="col-12">
        <div className="property-details-column property-details-column--address">
          <div className="property-detail-row">
            <p className="property-detail-row__label fw600 ff-heading dark-color">
              Address:
            </p>
            <p className="property-detail-row__value text">
              {location.address || "—"}
            </p>
          </div>
          <div className="property-detail-row">
            <p className="property-detail-row__label fw600 ff-heading dark-color">
              City:
            </p>
            <p className="property-detail-row__value text">
              {location.city || "—"}
            </p>
          </div>
          <div className="property-detail-row">
            <p className="property-detail-row__label fw600 ff-heading dark-color">
              Country:
            </p>
            <p className="property-detail-row__value text">
              {location.country || "—"}
            </p>
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
