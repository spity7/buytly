"use client";

import {
  formatPropertyLocationLabel,
  formatProjectPriceRange,
  partitionProjectUnits,
} from "@/lib/properties/mapProperty";
import { getPublicListingStatusLabel } from "@/lib/properties/listingStatusBanner";
import { useProjectSingle } from "@/providers/ProjectSingleProvider";
import ProjectShareButton from "./ProjectShareButton";

export default function ProjectDetailHeader() {
  const { project } = useProjectSingle();
  if (!project) return null;

  const { available, sold } = partitionProjectUnits(project.units || []);
  const projectSold = project.status === "sold";
  const listingLabel = getPublicListingStatusLabel(
    projectSold ? "sold" : "active",
  );
  const viewCount = project.viewCount ?? 0;
  const availabilityLabel = projectSold
    ? "Fully sold"
    : available.length
      ? `${available.length} available${sold.length ? ` · ${sold.length} sold` : ""}`
      : sold.length
        ? `${sold.length} sold`
        : "No units listed";

  return (
    <div className="row">
      <div className="col-lg-8">
        <div className="single-property-content mb30-md">
          <h1 className="sp-lg-title h2">{project.title}</h1>
          <div className="pd-meta mb15 d-md-flex align-items-center">
            <p className="text fz15 mb-0 bdrr1 pr10 bdrrn-sm">
              {formatPropertyLocationLabel(project.location)}
            </p>
            <span className="ff-heading text-thm fz15 bdrr1 pr10 ml0-sm ml10 bdrrn-sm">
              <i className="fas fa-circle fz10 pe-2" aria-hidden="true" />
              {listingLabel}
            </span>
            <span className="ff-heading text fz15 ml10 ml0-sm">
              <i
                className="flaticon-fullscreen pe-2 align-text-top"
                aria-hidden="true"
              />
              {viewCount.toLocaleString()} view{viewCount === 1 ? "" : "s"}
            </span>
          </div>
          <p className="text fz15 mb0">{availabilityLabel}</p>
        </div>
      </div>

      <div className="col-lg-4">
        <div className="single-property-content">
          <div className="property-action text-lg-end">
            <div className="d-flex mb20 mb10-md align-items-center justify-content-lg-end">
              <ProjectShareButton />
            </div>
            <h3 className="price mb-0">{formatProjectPriceRange(project)}</h3>
            {(project.unitCount ?? 0) > 0 ? (
              <p className="text space fz15">
                {project.unitCount} unit
                {project.unitCount === 1 ? "" : "s"} in this project
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
