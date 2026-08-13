"use client";

import { usePropertySingle } from "@/providers/PropertySingleProvider";
import { Gallery, Item } from "react-photoswipe-gallery";
import "photoswipe/dist/photoswipe.css";
import Image from "next/image";

const PLACEHOLDER = "/images/listings/listing-single-1.jpg";

const PropertyGallery = () => {
  const { property } = usePropertySingle();
  const images =
    property?.media?.filter((item) => item.type === "image" && item.url) || [];

  const galleryImages =
    images.length > 0 ? images : [{ url: PLACEHOLDER, _id: "placeholder" }];

  const mainImage = galleryImages[0];
  const thumbImages = galleryImages.slice(1, 5);

  return (
    <Gallery>
      <div className="col-sm-6">
        <div className="sp-img-content mb15-md">
          <div className="popup-img preview-img-1 sp-img">
            <Item
              original={mainImage.url}
              thumbnail={mainImage.url}
              width={610}
              height={510}
            >
              {({ ref, open }) => (
                <Image
                  src={mainImage.url}
                  width={591}
                  height={558}
                  ref={ref}
                  onClick={open}
                  alt="property main"
                  role="button"
                  className="w-100 h-100 cover"
                />
              )}
            </Item>
          </div>
        </div>
      </div>

      <div className="col-sm-6">
        <div className="row">
          {thumbImages.map((image, index) => (
            <div className="col-6 ps-sm-0" key={image._id || index}>
              <div className="sp-img-content">
                <div
                  className={`popup-img preview-img-${index + 2} sp-img mb10`}
                >
                  <Item
                    original={image.url}
                    thumbnail={image.url}
                    width={270}
                    height={250}
                  >
                    {({ ref, open }) => (
                      <Image
                        width={270}
                        height={250}
                        className="w-100 h-100 cover"
                        ref={ref}
                        onClick={open}
                        role="button"
                        src={image.url}
                        alt={`property ${index + 2}`}
                      />
                    )}
                  </Item>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Gallery>
  );
};

export default PropertyGallery;
