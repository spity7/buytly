"use client";

import { remoteImageProps } from "@/lib/images/remoteImage";
import { usePropertySingle } from "@/providers/PropertySingleProvider";
import Image from "next/image";
import React, { useEffect, useRef } from "react";

function syncAccordionItemActive(itemEl, collapseEl) {
  if (!itemEl || !collapseEl) return;
  itemEl.classList.toggle("active", collapseEl.classList.contains("show"));
}

function FloorPlanAccordionItem({ floorPlan, index, initiallyOpen }) {
  const itemRef = useRef(null);

  useEffect(() => {
    const itemEl = itemRef.current;
    if (!itemEl) return;

    const collapseEl = itemEl.querySelector(".accordion-collapse");
    if (!collapseEl) return;

    const onCollapseChange = () => syncAccordionItemActive(itemEl, collapseEl);

    onCollapseChange();
    collapseEl.addEventListener("shown.bs.collapse", onCollapseChange);
    collapseEl.addEventListener("hidden.bs.collapse", onCollapseChange);

    return () => {
      collapseEl.removeEventListener("shown.bs.collapse", onCollapseChange);
      collapseEl.removeEventListener("hidden.bs.collapse", onCollapseChange);
    };
  }, []);

  return (
    <div
      ref={itemRef}
      className={`accordion-item ${initiallyOpen ? "active" : ""}`}
    >
      <h2 className="accordion-header" id={`heading${index}`}>
        <button
          className={`accordion-button ${initiallyOpen ? "" : "collapsed"}`}
          type="button"
          data-bs-toggle="collapse"
          data-bs-target={`#collapse${index}`}
          aria-expanded={initiallyOpen ? "true" : "false"}
          aria-controls={`collapse${index}`}
        >
          {floorPlan.title || "Floor plan"}
        </button>
      </h2>
      <div
        id={`collapse${index}`}
        className={`accordion-collapse collapse ${initiallyOpen ? "show" : ""}`}
        aria-labelledby={`heading${index}`}
        data-bs-parent="#accordionExample"
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
}

const FloorPlans = () => {
  const { property } = usePropertySingle();
  const floorPlans = property?.floorPlans || [];

  if (!floorPlans.length) return null;

  return (
    <div className="accordion" id="accordionExample">
      {floorPlans.map((floorPlan, index) => (
        <FloorPlanAccordionItem
          key={floorPlan._id || index}
          floorPlan={floorPlan}
          index={index}
          initiallyOpen={index === 0}
        />
      ))}
    </div>
  );
};

export default FloorPlans;
