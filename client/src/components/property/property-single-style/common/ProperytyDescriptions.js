"use client";

import { usePropertySingle } from "@/providers/PropertySingleProvider";
import React from "react";

const ProperytyDescriptions = () => {
  const { property } = usePropertySingle();

  return (
    <>
      <p className="text mb10">
        {property?.description || "No description provided."}
      </p>
    </>
  );
};

export default ProperytyDescriptions;
