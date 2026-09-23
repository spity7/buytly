"use client";

import NearbyPlacesTabs from "@/components/property/property-single-style/common/NearbyPlacesTabs";
import { useCatalogNearbyPreview } from "@/hooks/useCatalogNearbyPreview";
import { usePropertyNearby } from "@/hooks/usePropertyNearby";

export default function PropertyFormNearbyPreview({
  propertyId,
  latitude,
  longitude,
  locationSource = "project",
}) {
  const hasCoordinates = Boolean(latitude && longitude);
  const useSavedProperty = Boolean(propertyId && hasCoordinates);

  const savedQuery = usePropertyNearby(propertyId, {
    enabled: useSavedProperty,
  });

  const previewQuery = useCatalogNearbyPreview(latitude, longitude, {
    enabled: hasCoordinates && !useSavedProperty,
  });

  const { data, isLoading, isError } = useSavedProperty
    ? savedQuery
    : previewQuery;

  const sourceHint =
    locationSource === "project"
      ? " Uses the parent project map location (edit location on the project, not on this unit)."
      : "";

  return (
    <div className="property-form-nearby-preview bdr1 bdrs12 p20 mb20">
      <h4 className="fz17 mb10">What&apos;s Nearby?</h4>
      <p className="text mb20">
        Schools, medical facilities, and transit stops within 5 km are shown on
        the public listing page from the project location.{sourceHint}
        {useSavedProperty
          ? " Preview uses coordinates synced from the parent project."
          : hasCoordinates
            ? " Live preview from the project map."
            : " Set the project location to preview nearby places."}
      </p>

      {hasCoordinates ? (
        <NearbyPlacesTabs
          categories={data?.categories || []}
          isLoading={isLoading}
          isError={isError}
          unavailable={data?.unavailable}
          hasCoordinates={hasCoordinates}
        />
      ) : (
        <p className="text mb0">
          Add or update the map on the parent project to enable this preview.
        </p>
      )}
    </div>
  );
}
