"use client";

import StatusBadge from "@/components/common/StatusBadge";
import { PRICE_FROM_LABEL } from "@/lib/properties/formatPrice";
import { usePropertySingle } from "@/providers/PropertySingleProvider";
const PropertyDetails = () => {
  const { property, card } = usePropertySingle();

  if (!property || !card) return null;

  const columns = [
    [
      { label: PRICE_FROM_LABEL, value: card.price },
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
      { label: "Property Type", value: property.type },
      {
        label: "Project",
        value:
          property.projectId?.title ||
          property.project?.title ||
          card.projectTitle ||
          "—",
      },
      {
        label: "Property Status",
        status: property.status,
        isStatus: true,
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
                <p className="text mb10">
                  {detail.isStatus ? (
                    <StatusBadge domain="listing" status={detail.status} />
                  ) : (
                    detail.value
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default PropertyDetails;
