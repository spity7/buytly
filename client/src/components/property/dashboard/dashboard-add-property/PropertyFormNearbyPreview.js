"use client";

import NearbyPlacesTabs from "@/components/property/property-single-style/common/NearbyPlacesTabs";
import { useCatalogNearbyPreview } from "@/hooks/useCatalogNearbyPreview";
import { usePropertyNearby } from "@/hooks/usePropertyNearby";

export default function PropertyFormNearbyPreview({
  propertyId,
  latitude,
  longitude,
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

  return (
    <div className="property-form-nearby-preview bdr1 bdrs12 p20 mb20">
      <h4 className="fz17 mb10">What&apos;s Nearby?</h4>
      <p className="text mb20">
        Schools, medical facilities, and transit stops within 5 km are shown
        automatically on the listing page using the map location below.
        {useSavedProperty
          ? " Preview uses the saved listing coordinates."
          : hasCoordinates
            ? " Live preview from the selected map point."
            : " Select a point on the map to preview nearby places."}
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
          Pick a location on the map to enable the What&apos;s Nearby section.
        </p>
      )}
    </div>
  );
}
