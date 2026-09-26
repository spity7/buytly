"use client";

import PropertySectionEmptyState from "@/components/property/property-single-style/common/PropertySectionEmptyState";
import PsWidgetTitle from "@/components/property/property-single-style/common/PsWidgetTitle";
import ProjectUnitCard from "@/components/property/project-single/ProjectUnitCard";
import {
  formatProjectPriceRange,
  partitionProjectUnits,
} from "@/lib/properties/mapProperty";
import { useProjectSingle } from "@/providers/ProjectSingleProvider";

export default function ProjectUnitsSection() {
  const { project } = useProjectSingle();
  const { available, sold } = partitionProjectUnits(project?.units || []);
  const priceRange = formatProjectPriceRange(project);

  return (
    <>
      <div className="ps-widget bgc-white bdrs12 default-box-shadow2 p30 mb30 overflow-hidden position-relative">
        <PsWidgetTitle icon="flaticon-house-1">Units for sale</PsWidgetTitle>

        {available.length > 0 ? (
          <>
            <p className="project-units-section__lead text mb20">
              <strong className="dark-color">
                {available.length} unit{available.length === 1 ? "" : "s"}{" "}
                available
              </strong>
              {priceRange !== "Price on request" ? (
                <> · {priceRange} across listings</>
              ) : null}
              . Open a unit for photos, floor plans, tours, and purchase
              options.
            </p>
            <div className="row g-4 project-units-section__grid">
              {available.map((unit) => (
                <ProjectUnitCard
                  key={unit._id || unit.id}
                  unit={unit}
                  gridSize={available.length}
                />
              ))}
            </div>
          </>
        ) : (
          <PropertySectionEmptyState
            variant="embedded"
            icon="flaticon-house-1"
            title={
              sold.length
                ? "No units available right now"
                : "No units listed yet"
            }
            description={
              sold.length
                ? "Every unit in this project has been sold. Browse sold listings below for reference, or explore other projects."
                : "Units for this development have not been published yet. Check back soon or contact the project team for availability."
            }
            className="project-units-section__empty"
          />
        )}
      </div>

      {sold.length > 0 ? (
        <div className="ps-widget bgc-white bdrs12 default-box-shadow2 p30 mb30 overflow-hidden position-relative project-units-section project-units-section--sold">
          <PsWidgetTitle icon="flaticon-event">
            Sold units ({sold.length})
          </PsWidgetTitle>
          <p className="project-units-section__lead text mb20">
            These listings are no longer for sale but remain visible for
            transparency and price reference.
          </p>
          <div className="row g-4 project-units-section__grid">
            {sold.map((unit) => (
              <ProjectUnitCard
                key={unit._id || unit.id}
                unit={unit}
                sold
                gridSize={sold.length}
              />
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
}
