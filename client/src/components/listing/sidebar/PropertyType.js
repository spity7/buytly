"use client";

import React from "react";
import { useCatalogPropertyTypes } from "@/hooks/useCatalog";

const PropertyType = ({ filterFunctions }) => {
  const { data: propertyTypes = [] } = useCatalogPropertyTypes();

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
      {propertyTypes.map((option) => (
        <label className="custom_checkbox" key={option.id}>
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
