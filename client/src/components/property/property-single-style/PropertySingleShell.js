"use client";

import PropertySingleSkeleton from "@/components/property/property-single-style/PropertySingleSkeleton";
import { usePropertySingle } from "@/providers/PropertySingleProvider";

export default function PropertySingleShell({ children }) {
  const { isLoading, isError } = usePropertySingle();

  if (isLoading) {
    return <PropertySingleSkeleton />;
  }

  if (isError) {
    return (
      <section className="pt60 pb90 bgc-f7">
        <div className="container text-center py-5">
          <h3>Property not found</h3>
          <p className="text">
            This listing may have been removed or is no longer available.
          </p>
        </div>
      </section>
    );
  }

  return children;
}
