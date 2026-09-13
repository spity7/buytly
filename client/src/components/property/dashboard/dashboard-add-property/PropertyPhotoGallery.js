"use client";

import { remoteImageProps } from "@/lib/images/remoteImage";
import Image from "next/image";

export default function PropertyPhotoGallery({
  items,
  disabled = false,
  onRemove,
  onSetCover,
  onMoveLeft,
  onMoveRight,
}) {
  if (!items.length) return null;

  return (
    <div className="row profile-box property-photo-gallery mb20">
      {items.map((item, index) => {
        const isCover = index === 0;
        const canMoveLeft = index > 0;
        const canMoveRight = index < items.length - 1;

        return (
          <div className="col-6 col-md-4 col-lg-3" key={item.id}>
            <div
              className={`profile-img mb20 position-relative property-photo-gallery__tile${
                isCover ? " property-photo-gallery__tile--cover" : ""
              }`}
            >
              <Image
                width={212}
                height={194}
                className="w-100 bdrs12 cover"
                src={item.url || "/images/listings/listing-1.jpg"}
                alt={item.name || "Property photo"}
                unoptimized
                {...remoteImageProps(item.url || "/images/listings/listing-1.jpg")}
              />
              {isCover ? (
                <span className="property-photo-gallery__cover-badge">Cover</span>
              ) : null}
              <div className="property-photo-gallery__actions">
                {!isCover ? (
                  <button
                    type="button"
                    className="property-photo-gallery__action"
                    title="Set as cover photo"
                    aria-label="Set as cover photo"
                    disabled={disabled}
                    onClick={() => onSetCover?.(index)}
                  >
                    <span className="fas fa-star" aria-hidden />
                  </button>
                ) : null}
                <button
                  type="button"
                  className="property-photo-gallery__action"
                  title="Move earlier"
                  aria-label="Move photo earlier"
                  disabled={disabled || !canMoveLeft}
                  onClick={() => onMoveLeft?.(index)}
                >
                  <span className="fas fa-chevron-left" aria-hidden />
                </button>
                <button
                  type="button"
                  className="property-photo-gallery__action"
                  title="Move later"
                  aria-label="Move photo later"
                  disabled={disabled || !canMoveRight}
                  onClick={() => onMoveRight?.(index)}
                >
                  <span className="fas fa-chevron-right" aria-hidden />
                </button>
                <button
                  type="button"
                  className="property-photo-gallery__action property-photo-gallery__action--danger"
                  title="Remove photo"
                  aria-label="Remove photo"
                  disabled={disabled}
                  onClick={() => onRemove?.(item, index)}
                >
                  <span className="fas fa-trash-can" aria-hidden />
                </button>
              </div>
            </div>
            <p className="text fz13 mb0 text-truncate">{item.name || "Photo"}</p>
          </div>
        );
      })}
    </div>
  );
}
