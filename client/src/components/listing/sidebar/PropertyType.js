"use client";

import React from "react";
import { LISTING_PROPERTY_TYPE_OPTIONS } from "@/lib/listings/listingFilters";

const PropertyType = ({ filterFunctions }) => {
  return (
    <>
      <label className="custom_checkbox">
        All
        <input
          type="checkbox"
          checked={!filterFunctions?.propertyTypes.length}
          onChange={() => filterFunctions?.setPropertyTypes([])}
        />
        <span className="checkmark" />
      </label>
      {LISTING_PROPERTY_TYPE_OPTIONS.map((option) => (
        <label className="custom_checkbox" key={option.value}>
          {option.label}
          <input
            type="checkbox"
            checked={filterFunctions?.propertyTypes.includes(option.value)}
            onChange={() => filterFunctions.handlepropertyTypes(option.value)}
          />
          <span className="checkmark" />
        </label>
      ))}
    </>
  );
};

export default PropertyType;
