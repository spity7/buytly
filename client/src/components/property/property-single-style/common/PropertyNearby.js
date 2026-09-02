"use client";

import NearbyPlacesTabs from "@/components/property/property-single-style/common/NearbyPlacesTabs";
import { usePropertyNearby } from "@/hooks/usePropertyNearby";
import { usePropertySingle } from "@/providers/PropertySingleProvider";

const PropertyNearby = () => {
  const { id, property } = usePropertySingle();
  const coordinates = property?.location?.coordinates;
  const { data, isLoading, isError } = usePropertyNearby(id, {
    enabled: Boolean(id && coordinates?.length === 2),
  });

  return (
    <NearbyPlacesTabs
      categories={data?.categories || []}
      isLoading={isLoading}
      isError={isError}
      unavailable={data?.unavailable}
      hasCoordinates={Boolean(coordinates?.length)}
    />
  );
};

export default PropertyNearby;
