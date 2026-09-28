"use client";

import React, { useMemo, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Thumbs } from "swiper/modules";
import "swiper/swiper-bundle.css";
import Image from "next/image";
import Link from "next/link";
import { useProperties } from "@/hooks/useProperties";
import { getPublicListingCardHref } from "@/lib/properties/mapProperty";

const FALLBACK_SLIDES = [
  {
    id: "fallback-1",
    image: "/images/listings/list-1.jpg",
    href: "/listings",
    price: "$485,000",
    title: "Contemporary villa with skyline views",
    meta: "4 Beds · 3 Baths · 2,400 sq ft",
    location: "Beirut, Lebanon",
  },
  {
    id: "fallback-2",
    image: "/images/listings/list-2.jpg",
    href: "/listings",
    price: "$320,000",
    title: "Bright apartment near the waterfront",
    meta: "2 Beds · 2 Baths · 1,180 sq ft",
    location: "Jounieh, Lebanon",
  },
  {
    id: "fallback-3",
    image: "/images/listings/list-3.jpg",
    href: "/listings",
    price: "$275,000",
    title: "Renovated home in a quiet neighborhood",
    meta: "3 Beds · 2 Baths · 1,650 sq ft",
    location: "Byblos, Lebanon",
  },
  {
    id: "fallback-4",
    image: "/images/listings/list-4.jpg",
    href: "/listings",
    price: "$198,000",
    title: "Efficient studio with premium finishes",
    meta: "Studio · 1 Bath · 520 sq ft",
    location: "Hamra, Beirut",
  },
];

function formatHeroMeta({ bed, bath, sqft }) {
  const parts = [];
  const beds = Number(bed) || 0;
  const baths = Number(bath) || 0;
  const area = Number(sqft) || 0;

  if (beds <= 0) parts.push("Studio");
  else parts.push(`${beds} Bed${beds === 1 ? "" : "s"}`);

  if (baths > 0) parts.push(`${baths} Bath${baths === 1 ? "" : "s"}`);

  if (area > 0) parts.push(`${area.toLocaleString()} sq ft`);

  return parts.join(" · ") || "View listing for full details";
}

function mapCardToSlide(card) {
  const id = card.id || card._id;
  return {
    id,
    image: card.image || "/images/listings/list-1.jpg",
    href: getPublicListingCardHref(card),
    price: card.price || "Price on request",
    title: card.title || "Featured property",
    meta: formatHeroMeta(card),
    location: card.location || card.city || "",
  };
}

const HERO_HEIGHT_STYLE = { height: "min(750px, 85vh)" };
const THUMB_SKELETON_COUNT = 4;

function HeroBannerSkeleton() {
  return (
    <div
      className="hero-large-home5 home-hero-slider home-hero-skeleton"
      style={HERO_HEIGHT_STYLE}
      aria-busy="true"
      aria-live="polite"
      aria-label="Loading featured properties"
    >
      <div className="home-hero-skeleton__banner slider-slide-item home-hero-slide">
        <div className="home-hero-skeleton__shimmer" aria-hidden />
        <div
          className="home-hero-slide__overlay home-hero-skeleton__overlay"
          aria-hidden
        />
        <div className="container h-100 d-flex align-items-center">
          <div className="col-lg-10 col-xl-8 px-0">
            <div className="home-hero-skeleton__line home-hero-skeleton__line--eyebrow" />
            <div className="home-hero-skeleton__line home-hero-skeleton__line--price" />
            <div className="home-hero-skeleton__line home-hero-skeleton__line--title" />
            <div className="home-hero-skeleton__line home-hero-skeleton__line--title-short" />
            <div className="home-hero-skeleton__line home-hero-skeleton__line--meta" />
            <div className="home-hero-skeleton__btn" />
          </div>
        </div>
      </div>

      <div
        className="custom_thumbs home-hero-thumbs home-hero-skeleton__thumbs"
        aria-hidden
      >
        <div className="home-hero-skeleton__thumb-list">
          {Array.from({ length: THUMB_SKELETON_COUNT }, (_, index) => (
            <span
              key={index}
              className="home-hero-skeleton__thumb"
              style={{ animationDelay: `${index * 0.12}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function HeroSlideContent({ slide }) {
  return (
    <div className="row">
      <div className="col-lg-10 col-xl-8 text-left position-relative">
        {slide.location ? (
          <p className="home-hero-slide__eyebrow text-white mb10">
            <span className="flaticon-location me-2" aria-hidden />
            {slide.location}
          </p>
        ) : null}
        <p className="home-hero-slide__price text-white mb10">{slide.price}</p>
        <h2 className="slider-title text-white mb15">{slide.title}</h2>
        <p className="mb30 slider-text text-white home-hero-slide__meta">
          {slide.meta}
        </p>
        <div className="slider-btn-block">
          <Link href={slide.href} className="ud-btn btn-white slider-btn">
            View details
            <i className="fal fa-arrow-right-long" />
          </Link>
        </div>
      </div>
    </div>
  );
}

const Hero = () => {
  const [thumbsSwiper, setThumbsSwiper] = useState(null);

  const queryParams = useMemo(
    () => ({
      limit: 5,
      status: "active",
      sortBy: "viewCount",
      sortOrder: "desc",
    }),
    [],
  );

  const { data, isLoading } = useProperties(queryParams);

  const sliderItems = useMemo(() => {
    const cards = data?.cards || [];
    if (cards.length) {
      return cards.map(mapCardToSlide);
    }
    return FALLBACK_SLIDES;
  }, [data?.cards]);

  const showThumbs = sliderItems.length > 1;

  if (isLoading && !data) {
    return <HeroBannerSkeleton />;
  }

  return (
    <>
      <div className="hero-large-home5 home-hero-slider">
        <Swiper
          direction="horizontal"
          spaceBetween={0}
          slidesPerView={1}
          speed={900}
          autoplay={
            showThumbs
              ? {
                  delay: 5500,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: true,
                }
              : false
          }
          modules={[Thumbs, Autoplay]}
          thumbs={{
            swiper:
              thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null,
          }}
          className="home-hero-slider__main"
          style={HERO_HEIGHT_STYLE}
        >
          {sliderItems.map((item, index) => (
            <SwiperSlide key={item.id}>
              <div className="item h-100">
                <div className="slider-slide-item home-hero-slide h-100">
                  <div className="home-hero-slide__media">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      priority={index === 0}
                      className="cover home-hero-slide__img"
                      sizes="100vw"
                    />
                  </div>
                  <div className="home-hero-slide__overlay" aria-hidden />
                  <div className="container h-100 d-flex align-items-center">
                    <HeroSlideContent slide={item} />
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {showThumbs ? (
        <div
          className="custom_thumbs home-hero-thumbs"
          aria-label="Featured listings"
        >
          <Swiper
            modules={[Thumbs]}
            watchSlidesProgress
            onSwiper={setThumbsSwiper}
            slidesPerView="auto"
            spaceBetween={10}
            className="home-hero-thumbs__swiper"
            breakpoints={{
              0: {
                direction: "horizontal",
              },
              1200: {
                direction: "vertical",
              },
            }}
          >
            {sliderItems.map((item) => (
              <SwiperSlide
                key={`thumb-${item.id}`}
                className="home-hero-thumbs__slide"
              >
                <span className="home-hero-thumbs__btn">
                  <span className="home-hero-thumbs__media">
                    <Image
                      src={item.image}
                      alt=""
                      fill
                      className="cover home-hero-thumbs__img"
                      sizes="(max-width: 1199px) 12vw, 64px"
                    />
                  </span>
                </span>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      ) : null}
    </>
  );
};

export default Hero;
