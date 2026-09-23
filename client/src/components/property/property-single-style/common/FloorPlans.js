"use client";

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
      {floorPlans.map((floorPlan, index) => (
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
              {floorPlan.title || "Floor plan"}
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
      ))}
    </div>
  );
};

export default FloorPlans;
