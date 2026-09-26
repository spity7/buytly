"use client";

import { remoteImageProps } from "@/lib/images/remoteImage";
import { Gallery, Item } from "react-photoswipe-gallery";
import Image from "next/image";

const LIGHTBOX_SIZE = { width: 1600, height: 1200 };

const THUMB_PREVIEW_CLASS = [
  "preview-img-2",
  "preview-img-3",
  "preview-img-4",
  "preview-img-5",
];

function GalleryCell({ image, alt, previewClass, sizes }) {
  return (
    <div
      className={`property-single-gallery__cell sp-img popup-img ${previewClass}`.trim()}
    >
      <Item
        original={image.url}
        thumbnail={image.url}
        width={LIGHTBOX_SIZE.width}
        height={LIGHTBOX_SIZE.height}
      >
        {({ ref, open }) => (
          <Image
            src={image.url}
            alt={alt}
            width={800}
            height={600}
            ref={ref}
            onClick={open}
            role="button"
            className="w-100 h-100 cover"
            sizes={sizes}
            {...remoteImageProps(image.url)}
          />
        )}
      </Item>
    </div>
  );
}

/**
 * Hero gallery: cover photo + up to four thumbnails in a fixed-ratio grid.
 */
export default function PropertySingleGalleryGrid({ images }) {
  const mainImage = images[0];
  const thumbImages = images.slice(1, 5);
  const thumbCount = Math.min(thumbImages.length, 4);

  return (
    <Gallery>
      <div className="col-12">
        <div
          className={`property-single-gallery property-single-gallery--thumbs-${thumbCount}`}
        >
          <div className="property-single-gallery__main sp-img-content mb15-md">
            <GalleryCell
              image={mainImage}
              alt="Property cover photo"
              previewClass="preview-img-1"
              sizes="(max-width: 575.98px) 100vw, 50vw"
            />
          </div>

          {thumbCount > 0 ? (
            <div className="property-single-gallery__side">
              {thumbImages.map((image, index) => (
                <GalleryCell
                  key={image._id || image.id || index}
                  image={image}
                  alt={`Property photo ${index + 2}`}
                  previewClass={THUMB_PREVIEW_CLASS[index] || "preview-img-5"}
                  sizes="(max-width: 575.98px) 50vw, 25vw"
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </Gallery>
  );
}
