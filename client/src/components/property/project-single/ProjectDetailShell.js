"use client";

import PropertySingleSkeleton from "@/components/property/property-single-style/PropertySingleSkeleton";
import { useProjectSingle } from "@/providers/ProjectSingleProvider";

export default function ProjectDetailShell({ children }) {
  const { isLoading, isError } = useProjectSingle();

  if (isLoading) {
    return <PropertySingleSkeleton />;
  }

  if (isError) {
    return (
      <section className="pt60 pb90 bgc-f7">
        <div className="container text-center py-5">
          <h3>Project not found</h3>
          <p className="text">
            This project may have been removed or is not available to view.
          </p>
        </div>
      </section>
    );
  }

  return children;
}
