"use client";

import PropertySingleGalleryGrid from "@/components/property/property-single-style/PropertySingleGalleryGrid";
import { useProjectSingle } from "@/providers/ProjectSingleProvider";
import "photoswipe/dist/photoswipe.css";

const PLACEHOLDER = "/images/listings/listing-single-1.jpg";

export default function ProjectDetailGallery() {
  const { project } = useProjectSingle();
  const images =
    project?.media
      ?.filter((item) => item.type === "image" && item.url)
      .slice()
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) || [];

  const galleryImages =
    images.length > 0 ? images : [{ url: PLACEHOLDER, _id: "placeholder" }];

  return (
    <div className="row mb30 mt30">
      <PropertySingleGalleryGrid images={galleryImages} />
    </div>
  );
}
