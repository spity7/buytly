"use client";

import { getStatusLabel } from "@/lib/properties/mapProperty";
import { usePropertySingle } from "@/providers/PropertySingleProvider";
const PropertyDetails = () => {
  const { property, card } = usePropertySingle();

  if (!property || !card) return null;

  const columns = [
    [
      { label: "Price", value: card.price },
      {
        label: "Property Size",
        value: property.area
          ? `${property.area} ${property.areaUnit || "sqm"}`
          : "—",
      },
      { label: "Bathrooms", value: property.bathrooms ?? "—" },
      { label: "Bedrooms", value: property.bedrooms ?? "—" },
    ],
    [
      { label: "Listing Type", value: property.listingType },
      { label: "Property Type", value: property.type },
      {
        label: "Property Status",
        value: getStatusLabel(property.status),
      },
    ],
  ];

  return (
    <div className="row">
      {columns.map((column, columnIndex) => (
        <div
          key={columnIndex}
          className={`col-md-6 col-xl-4${
            columnIndex === 1 ? " offset-xl-2" : ""
          }`}
        >
          {column.map((detail, index) => (
            <div key={index} className="d-flex justify-content-between">
              <div className="pd-list">
                <p className="fw600 mb10 ff-heading dark-color">
                  {detail.label}
                </p>
              </div>
              <div className="pd-list">
                <p className="text mb10">{detail.value}</p>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default PropertyDetails;
