"use client";

import { usePropertySingle } from "@/providers/PropertySingleProvider";
import React from "react";

const PropertyFeaturesAminites = () => {
  const { property } = usePropertySingle();
  const amenities = property?.amenities || [];

  if (!amenities.length) {
    return <p className="text col-12">No amenities listed.</p>;
  }

  const chunkSize = Math.ceil(amenities.length / 3) || 1;
  const rows = [
    amenities.slice(0, chunkSize),
    amenities.slice(chunkSize, chunkSize * 2),
    amenities.slice(chunkSize * 2),
  ].filter((row) => row.length > 0);

  return (
    <>
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="col-sm-6 col-md-4">
          <div className="pd-list">
            {row.map((item, index) => (
              <p key={index} className="text mb10">
                <i className="fas fa-circle fz6 align-middle pe-2" />
                {item}
              </p>
            ))}
          </div>
        </div>
      ))}
    </>
  );
};

export default PropertyFeaturesAminites;
