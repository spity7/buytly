"use client";

import NearbyPlacesTabs from "@/components/property/property-single-style/common/NearbyPlacesTabs";
import { usePropertyNearby } from "@/hooks/usePropertyNearby";

export default function PropertyFormNearbyPreview({
  propertyId,
  latitude,
  longitude,
}) {
  const hasCoordinates = Boolean(latitude && longitude);
  const canPreview = Boolean(propertyId && hasCoordinates);
  const { data, isLoading, isError } = usePropertyNearby(propertyId, {
    enabled: canPreview,
  });

  return (
    <div className="property-form-nearby-preview bdr1 bdrs12 p20 mb20">
      <h4 className="fz17 mb10">What&apos;s Nearby?</h4>
      <p className="text mb20">
        Schools, medical facilities, and transit stops within 5 km are shown
        automatically on the listing page using the latitude and longitude above.
        {canPreview
          ? " Preview below uses the saved location."
          : " Save the listing with coordinates to generate the nearby section."}
      </p>

      {canPreview ? (
        <NearbyPlacesTabs
          categories={data?.categories || []}
          isLoading={isLoading}
          isError={isError}
          unavailable={data?.unavailable}
          hasCoordinates={hasCoordinates}
        />
      ) : (
        <p className="text mb-0">
          {hasCoordinates
            ? "Nearby places will appear on the public listing after you save this property."
            : "Add latitude and longitude to enable the What's Nearby section."}
        </p>
      )}
    </div>
  );
}
