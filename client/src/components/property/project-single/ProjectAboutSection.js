"use client";

import LocationAddressFields from "@/components/property/property-single-style/common/LocationAddressFields";
import PsWidgetTitle from "@/components/property/property-single-style/common/PsWidgetTitle";
import PropertyLocationMap from "@/components/property/property-single-style/common/PropertyLocationMap";
import VirtualTour360 from "@/components/property/property-single-style/common/VirtualTour360";
import { hasPropertyMapCoordinates } from "@/lib/geo/propertyCoordinates";
import { mapProjectToCard } from "@/lib/properties/mapProperty";
import { useProjectSingle } from "@/providers/ProjectSingleProvider";
import { useMemo } from "react";

export default function ProjectAboutSection() {
  const { project } = useProjectSingle();
  const mapMarker = useMemo(
    () => (project ? mapProjectToCard(project) : null),
    [project],
  );

  if (!project) return null;

  const location = project.location;
  const showMap = hasPropertyMapCoordinates(location);

  return (
    <>
      {project.description ? (
        <div className="ps-widget bgc-white bdrs12 default-box-shadow2 p30 mb30 overflow-hidden position-relative">
          <PsWidgetTitle icon="flaticon-corporation">About this project</PsWidgetTitle>
          <p className="text mb0">{project.description}</p>
        </div>
      ) : null}

      {project.amenities?.length ? (
        <div className="ps-widget bgc-white bdrs12 default-box-shadow2 p30 mb30 overflow-hidden position-relative">
          <PsWidgetTitle icon="flaticon-garden">Shared amenities</PsWidgetTitle>
          <ul className="list-unstyled d-flex flex-wrap gap-2 mb0">
            {project.amenities.map((item) => (
              <li key={item} className="badge bg-light text-dark bdr1">
                {item}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="ps-widget bgc-white bdrs12 default-box-shadow2 p30 mb30 overflow-hidden position-relative">
        <PsWidgetTitle icon="flaticon-map">Address</PsWidgetTitle>
        <div className="row">
          <div className="col-12">
            <LocationAddressFields location={location} />
          </div>

          {showMap ? (
            <div className="col-md-12">
              <PropertyLocationMap
                location={location}
                marker={mapMarker}
                title="Project location"
              />
            </div>
          ) : null}
        </div>
      </div>

      {project.virtualTourUrl ? (
        <div className="ps-widget bgc-white bdrs12 default-box-shadow2 p30 mb30 overflow-hidden position-relative">
          <PsWidgetTitle icon="flaticon-fullscreen-1">
            360° Virtual Tour
          </PsWidgetTitle>
          <div className="row">
            <VirtualTour360 virtualTourUrl={project.virtualTourUrl} />
          </div>
        </div>
      ) : null}
    </>
  );
}
