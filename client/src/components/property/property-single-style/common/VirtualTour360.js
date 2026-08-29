"use client";

import { usePropertySingle } from "@/providers/PropertySingleProvider";
import React from "react";

const VirtualTour360 = () => {
  const { property } = usePropertySingle();
  const tourUrl = property?.virtualTourUrl;

  if (!tourUrl) return null;

  return (
    <div className="col-md-12">
      <iframe
        src={tourUrl}
        title="360 virtual tour"
        className="w-100 bdrs12"
        style={{ minHeight: 420, border: 0 }}
        allowFullScreen
      />
    </div>
  );
};

export default VirtualTour360;
