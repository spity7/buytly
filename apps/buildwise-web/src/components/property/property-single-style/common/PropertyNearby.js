"use client";

import NearbyPlacesTabs from "@/components/property/property-single-style/common/NearbyPlacesTabs";
import { usePropertyNearby } from "@/hooks/usePropertyNearby";
import { hasPropertyMapCoordinates } from "@/lib/geo/propertyCoordinates";
import { usePropertySingle } from "@/providers/PropertySingleProvider";

const PropertyNearby = () => {
  const { id, property } = usePropertySingle();
  const location = property?.location;
  const hasCoordinates = hasPropertyMapCoordinates(location);
  const { data, isLoading, isError } = usePropertyNearby(id, {
    enabled: Boolean(id && hasCoordinates),
  });

  return (
    <NearbyPlacesTabs
      categories={data?.categories || []}
      isLoading={isLoading}
      isError={isError}
      unavailable={data?.unavailable}
      hasCoordinates={hasCoordinates}
    />
  );
};

export default PropertyNearby;
