"use client";

import ExplorePropertyTypesCarousel from "@/components/home/ExplorePropertyTypesCarousel";
import { useCatalogPropertyTypes } from "@/hooks/useCatalog";

const NAV = {
  prev: "explore-types-prev",
  next: "explore-types-next",
  pagination: "explore-types-pagination",
};

export default function ExplorePropertyTypesSection({
  sectionId = "explore-property",
  className = "pb90 pb30-md",
}) {
  const { data: types = [], isLoading } = useCatalogPropertyTypes();
  const showCarouselNav = isLoading || types.length > 0;
  const totalListings = types.reduce(
    (sum, type) => sum + (Number(type.listingCount) || 0),
    0,
  );

  const subtitle =
    totalListings > 0
      ? `Browse ${totalListings.toLocaleString()} active ${totalListings === 1 ? "listing" : "listings"} by property type.`
      : "Browse listings by property type — apartments, villas, offices, and more.";

  return (
    <section id={sectionId} className={className}>
      <div className="container">
        <div className="row justify-content-between align-items-center">
          <div className="col-lg-8">
            <div
              className={`main-title${showCarouselNav ? "" : " mb30 mb0-md"}`}
              data-aos="fade-up"
              data-aos-delay="300"
            >
              <h2 className="title">Explore property types</h2>
              <p className="paragraph">{subtitle}</p>
            </div>
          </div>

          <div
            className={`col-auto mb30${showCarouselNav ? "" : " d-none"}`}
            aria-hidden={!showCarouselNav}
          >
            <div className="row align-items-center justify-content-center">
              <div className="col-auto">
                <button
                  type="button"
                  className={`${NAV.prev} swiper_button`}
                  aria-label="Previous property types"
                >
                  <i className="far fa-arrow-left-long" aria-hidden="true" />
                </button>
              </div>
              <div className="col-auto">
                <div
                  className={`pagination swiper--pagination ${NAV.pagination}`}
                />
              </div>
              <div className="col-auto">
                <button
                  type="button"
                  className={`${NAV.next} swiper_button`}
                  aria-label="Next property types"
                >
                  <i className="far fa-arrow-right-long" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div
          className={
            showCarouselNav
              ? "explore-apartment-slider explore-apartment-slider--viewport-bleed"
              : "explore-property-types-static"
          }
          data-aos="fade-up"
          data-aos-delay="300"
        >
          <ExplorePropertyTypesCarousel
            navigationPrevClass={NAV.prev}
            navigationNextClass={NAV.next}
            paginationClass={NAV.pagination}
            layout={showCarouselNav ? "carousel" : "static"}
          />
        </div>
      </div>
    </section>
  );
}
