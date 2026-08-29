"use client";

import { formatPrice } from "@/lib/properties/formatPrice";
import { remoteImageProps } from "@/lib/images/remoteImage";
import { usePropertySingle } from "@/providers/PropertySingleProvider";
import Image from "next/image";
import React from "react";

const FloorPlans = () => {
  const { property } = usePropertySingle();
  const floorPlans = property?.floorPlans || [];

  if (!floorPlans.length) return null;

  return (
    <div className="accordion" id="accordionExample">
      {floorPlans.map((floorPlan, index) => {
        const sizeLabel = floorPlan.area
          ? `${floorPlan.area} ${floorPlan.areaUnit || "sqm"}`
          : "—";
        const priceLabel =
          floorPlan.price != null
            ? formatPrice(floorPlan.price, property?.currency)
            : "—";

        return (
          <div
            className={`accordion-item ${index === 0 ? "active" : ""}`}
            key={floorPlan._id || index}
          >
            <h2 className="accordion-header" id={`heading${index}`}>
              <button
                className={`accordion-button ${index === 0 ? "" : "collapsed"}`}
                type="button"
                data-bs-toggle="collapse"
                data-bs-target={`#collapse${index}`}
                aria-expanded={index === 0 ? "true" : "false"}
                aria-controls={`collapse${index}`}
              >
                <span className="w-100 d-md-flex align-items-center">
                  <span className="mr10-sm">{floorPlan.title}</span>
                  <span className="ms-auto d-md-flex align-items-center justify-content-end">
                    <span className="me-2 me-md-4">
                      <span className="fw600">Size:</span>
                      <span className="text">{sizeLabel}</span>
                    </span>
                    <span className="me-2 me-md-4">
                      <span className="fw600">Bedrooms</span>
                      <span className="text">{floorPlan.bedrooms ?? "—"}</span>
                    </span>
                    <span className="me-2 me-md-4">
                      <span className="fw600">Bathrooms</span>
                      <span className="text">{floorPlan.bathrooms ?? "—"}</span>
                    </span>
                    <span>
                      <span className="fw600">Price</span>
                      <span className="text">{priceLabel}</span>
                    </span>
                  </span>
                </span>
              </button>
            </h2>
            <div
              id={`collapse${index}`}
              className={`accordion-collapse collapse ${
                index === 0 ? "show" : ""
              }`}
              aria-labelledby={`heading${index}`}
              data-parent="#accordionExample"
            >
              <div className="accordion-body text-center">
                {floorPlan.url ? (
                  <Image
                    width={736}
                    height={544}
                    className="w-100 h-100 cover"
                    src={floorPlan.url}
                    alt={floorPlan.title || "Floor plan"}
                    {...remoteImageProps(floorPlan.url)}
                  />
                ) : (
                  <p className="text mb-0">No floor plan image uploaded.</p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FloorPlans;
