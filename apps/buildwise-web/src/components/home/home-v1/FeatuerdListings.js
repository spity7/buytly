"use client";

import {
  FeaturedListingsEmptyState,
  FeaturedListingsLoadingState,
} from "@/components/home/FeaturedListingsSectionState";
import FeaturedListings from "@/components/listing/grid-view/grid-default/FeatuerdListings";
import { useProperties } from "@/hooks/useProperties";
import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

const HomeFeaturedListings = () => {
  const { data, isLoading } = useProperties({
    limit: 8,
    sortBy: "viewCount",
    sortOrder: "desc",
    status: "active",
  });

  const cards = data?.cards || [];

  if (isLoading) {
    return <FeaturedListingsLoadingState />;
  }

  if (!cards.length) {
    return <FeaturedListingsEmptyState />;
  }

  return (
    <>
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
          1024: { slidesPerView: 3 },
          1400: { slidesPerView: 4 },
        }}
      >
        {cards.map((listing) => (
          <SwiperSlide key={listing.id}>
            <div className="item">
              <FeaturedListings data={[listing]} slider />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="row align-items-center justify-content-center">
        <div className="col-auto">
          <button className="featured-prev__active swiper_button">
            <i className="far fa-arrow-left-long" />
          </button>
        </div>
        <div className="col-auto">
          <div className="pagination swiper--pagination featured-pagination__active" />
        </div>
        <div className="col-auto">
          <button className="featured-next__active swiper_button">
            <i className="far fa-arrow-right-long" />
          </button>
        </div>
      </div>
    </>
  );
};

export default HomeFeaturedListings;
