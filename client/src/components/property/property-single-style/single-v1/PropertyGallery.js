"use client";

import PropertySingleGalleryGrid from "@/components/property/property-single-style/PropertySingleGalleryGrid";
import { usePropertySingle } from "@/providers/PropertySingleProvider";
import "photoswipe/dist/photoswipe.css";

const PLACEHOLDER = "/images/listings/listing-single-1.jpg";

const PropertyGallery = () => {
  const { property } = usePropertySingle();
  const images =
    property?.media
      ?.filter((item) => item.type === "image" && item.url)
      .slice()
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) || [];

  const galleryImages =
    images.length > 0 ? images : [{ url: PLACEHOLDER, _id: "placeholder" }];

  return <PropertySingleGalleryGrid images={galleryImages} />;
};

export default PropertyGallery;
