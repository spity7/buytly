"use client";

import ListingMap1 from "@/components/listing/map-style/ListingMap1";
import {
  buildPropertyMapEmbedSrc,
  hasPropertyMapCoordinates,
} from "@/lib/geo/propertyCoordinates";
import { usePropertySingle } from "@/providers/PropertySingleProvider";

const googleMapsApiKey =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() ?? "";

function hasMapMarker(card) {
  return (
    typeof card?.lat === "number" &&
    typeof card?.lng === "number" &&
    !Number.isNaN(card.lat) &&
    !Number.isNaN(card.lng)
  );
}

export default function PropertyLocationMap({
  className = "position-relative bdrs12 mt30 overflow-hidden h250 w-100",
  title = "Property location",
}) {
  const { card, property } = usePropertySingle();
  const location = property?.location;

  if (!hasPropertyMapCoordinates(location)) return null;

  const embedSrc = buildPropertyMapEmbedSrc(location);

  if (hasMapMarker(card) && googleMapsApiKey) {
    return (
      <div className={className}>
        <ListingMap1 markers={[card]} />
      </div>
    );
  }

  if (!embedSrc) return null;

  return (
    <iframe
      className={className}
      loading="lazy"
      src={embedSrc}
      title={location?.address?.trim() || title}
      aria-label={location?.address?.trim() || title}
    />
  );
}
