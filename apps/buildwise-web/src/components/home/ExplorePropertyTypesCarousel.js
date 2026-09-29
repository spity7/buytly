"use client";

import {
  buildPropertyTypeListingsHref,
  formatPropertyTypeListingCount,
  getPropertyTypeIcon,
} from "@/lib/catalog/propertyTypePresentation";
import { useCatalogPropertyTypes } from "@/hooks/useCatalog";
import Link from "next/link";
import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

function TypeCardSkeleton() {
  return (
    <div className="iconbox-style1 explore-property-type-card explore-property-type-card--skeleton">
      <span className="icon explore-property-type-card__icon-skeleton" />
      <div className="iconbox-content">
        <span className="explore-property-type-card__line explore-property-type-card__line--title" />
        <span className="explore-property-type-card__line explore-property-type-card__line--sub" />
      </div>
    </div>
  );
}

export default function ExplorePropertyTypesCarousel({
  navigationPrevClass = "prev__active",
  navigationNextClass = "next__active",
  paginationClass = "pagination__active",
}) {
  const { data: types = [], isLoading, isError } = useCatalogPropertyTypes();

  if (isError) {
    return (
      <p className="text mb0" role="status">
        Property types are unavailable right now. You can still browse all{" "}
        <Link href="/listings" className="text-thm">
          listings
        </Link>
        .
      </p>
    );
  }

  if (isLoading) {
    return (
      <div className="row g-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div className="col-6 col-md-4 col-lg-3 col-xl-2" key={index}>
            <TypeCardSkeleton />
          </div>
        ))}
      </div>
    );
  }

  if (!types.length) {
    return (
      <p className="text mb0" role="status">
        No property types are configured yet.
      </p>
    );
  }

  return (
    <Swiper
      className="overflow-visible explore-property-types-swiper"
      spaceBetween={30}
      modules={[Navigation, Pagination]}
      navigation={{
        nextEl: `.${navigationNextClass}`,
        prevEl: `.${navigationPrevClass}`,
      }}
      pagination={{
        el: `.${paginationClass}`,
        clickable: true,
      }}
      breakpoints={{
        300: { slidesPerView: 2, spaceBetween: 15 },
        576: { slidesPerView: 3, spaceBetween: 15 },
        768: { slidesPerView: 4, spaceBetween: 20 },
        992: { slidesPerView: 5, spaceBetween: 20 },
        1200: { slidesPerView: 5.5, spaceBetween: 25 },
        1400: { slidesPerView: 6.5, spaceBetween: 30 },
      }}
    >
      {types.map((type) => {
        const icon = getPropertyTypeIcon(type.value);
        const href = buildPropertyTypeListingsHref(type.value);
        const countLabel = formatPropertyTypeListingCount(type.listingCount);

        return (
          <SwiperSlide key={type.id || type.value}>
            <div className="item">
              <Link
                href={href}
                className="explore-property-type-card-link"
                aria-label={`Browse ${type.label} — ${countLabel}`}
              >
                <div className="iconbox-style1 explore-property-type-card">
                  <span className={`icon ${icon}`} aria-hidden="true" />
                  <div className="iconbox-content">
                    <h6 className="title">{type.label}</h6>
                    <p className="text mb-0">{countLabel}</p>
                  </div>
                </div>
              </Link>
            </div>
          </SwiperSlide>
        );
      })}
    </Swiper>
  );
}
