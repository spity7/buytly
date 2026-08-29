"use client";

import { useProperties } from "@/hooks/useProperties";
import { remoteImageProps } from "@/lib/images/remoteImage";
import { mapPropertiesToCards } from "@/lib/properties/mapProperty";
import { usePropertySingle } from "@/providers/PropertySingleProvider";
import Image from "next/image";
import Link from "next/link";
import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

const PLACEHOLDER = "/images/listings/list-1.jpg";

const NearbySimilarProperty = () => {
  const { id, property } = usePropertySingle();
  const city = property?.location?.city;
  const params = {
    city,
    type: property?.type,
    listingType: property?.listingType,
    limit: 8,
  };

  const { data, isLoading } = useProperties(params, {
    enabled: Boolean(property),
  });

  const listings = mapPropertiesToCards(data?.properties || []).filter(
    (listing) => String(listing.id) !== String(id),
  );

  if (isLoading) {
    return <p className="text">Loading similar properties...</p>;
  }

  if (!listings.length) {
    return <p className="text">No similar properties found right now.</p>;
  }

  return (
    <Swiper
      spaceBetween={30}
      modules={[Navigation, Pagination]}
      navigation={{
        nextEl: ".featured-next__active",
        prevEl: ".featured-prev__active",
      }}
      pagination={{
        el: ".featured-pagination__active",
        clickable: true,
      }}
      slidesPerView={1}
      breakpoints={{
        300: { slidesPerView: 1 },
        768: { slidesPerView: 2 },
        1024: { slidesPerView: 2 },
        1200: { slidesPerView: 3 },
      }}
    >
      {listings.slice(0, 6).map((listing) => {
        const forRent = listing.forRent;
        const priceSuffix = forRent ? " / mo" : "";

        return (
          <SwiperSlide key={listing.id}>
            <div className="item">
              <div className="listing-style1">
                <div className="list-thumb">
                  <Image
                    width={382}
                    height={248}
                    className="w-100 h-100 cover"
                    src={listing.image || PLACEHOLDER}
                    alt={listing.title}
                    {...remoteImageProps(listing.image)}
                  />
                  <div className="list-price">
                    {listing.price}
                    {priceSuffix && <span>{priceSuffix}</span>}
                  </div>
                </div>
                <div className="list-content">
                  <h6 className="list-title">
                    <Link href={`/single-v1/${listing.id}`}>
                      {listing.title}
                    </Link>
                  </h6>
                  <p className="list-text">{listing.location}</p>
                  <div className="list-meta d-flex align-items-center">
                    <span>
                      <span className="flaticon-bed" /> {listing.bed} bed
                    </span>
                    <span className="ms-3">
                      <span className="flaticon-shower" /> {listing.bath} bath
                    </span>
                    <span className="ms-3">
                      <span className="flaticon-expand" /> {listing.sqft} sqft
                    </span>
                  </div>
                  <hr className="mt-2 mb-2" />
                  <div className="list-meta2 d-flex justify-content-between align-items-center">
                    <span className="for-what">
                      For {forRent ? "Rent" : "Sale"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        );
      })}
    </Swiper>
  );
};

export default NearbySimilarProperty;
