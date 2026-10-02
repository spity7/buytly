"use client";

import Image from "next/image";
import Link from "next/link";
import { FeaturedListingsLoadingState } from "@/components/home/FeaturedListingsSectionState";
import PropertySectionEmptyState from "@/components/property/property-single-style/common/PropertySectionEmptyState";
import { usePlatformFeaturedProperties } from "@/hooks/usePlatformListings";
import { getMarketplaceCardLabel } from "@/lib/properties/mapProperty";
import { isPlatformMarketplaceSite } from "@/lib/siteContext";

const PLACEHOLDER = "/images/listings/list-1.jpg";

function PartnerListingsEmptyState() {
  return (
    <PropertySectionEmptyState
      className="partner-featured-listings-empty"
      icon="flaticon-discovery"
      title="Partner listings coming soon"
      description="Curated homes from partner developments will show up here as they join the marketplace. You can still browse everything available today."
      actions={[
        { label: "Browse all properties", href: "/listings" },
        {
          label: "Explore projects",
          href: "/listings?view=projects",
          variant: "secondary",
        },
      ]}
    />
  );
}

function PartnerListingsErrorState() {
  return (
    <PropertySectionEmptyState
      className="partner-featured-listings-empty"
      icon="flaticon-settings"
      title="Could not load partner listings"
      description="Something went wrong while fetching partner developments. Please try again in a moment."
      actions={[{ label: "Browse all properties", href: "/listings" }]}
    />
  );
}

export default function PartnerFeaturedListingsSection() {
  const usePlatform = isPlatformMarketplaceSite();
  const { data, isLoading, isError } = usePlatformFeaturedProperties(
    { limit: 6, partnersOnly: true },
    { enabled: usePlatform },
  );

  const listings = data?.cards || [];

  if (!usePlatform) {
    return null;
  }

  return (
    <section className="pt-0 pb90 partner-featured-listings-section">
      <div className="container">
        <div className="row align-items-center mb30">
          <div className="col-lg-8">
            <h2 className="title">Partner developments</h2>
            <p className="text mb-0">
              Selected listings from partner developments on the marketplace.
            </p>
          </div>
          {listings.length > 0 ? (
            <div className="col-lg-4 mt-3 mt-lg-0 text-lg-end">
              <Link href="/listings" className="ud-btn2">
                View all on marketplace
                <i className="fal fa-arrow-right-long" />
              </Link>
            </div>
          ) : null}
        </div>
        <div className="row">
          {isError ? (
            <div className="col-12">
              <PartnerListingsErrorState />
            </div>
          ) : isLoading ? (
            <div className="col-12">
              <FeaturedListingsLoadingState />
            </div>
          ) : !listings.length ? (
            <div className="col-12">
              <PartnerListingsEmptyState />
            </div>
          ) : (
            listings.map((item) => {
              const href = item.href || "#";
              const siteName = item.partnerSiteName || "Partner site";
              return (
                <div key={item.id} className="col-sm-6 col-lg-4 mb30">
                  <div className="listing-style1 bdrs12 default-box-shadow1">
                    <div className="list-thumb">
                      <Image
                        width={382}
                        height={220}
                        className="w-100 cover"
                        style={{ height: 220 }}
                        src={item.image || PLACEHOLDER}
                        alt={item.title || "listing"}
                      />
                      <div className="list-price">{item.price}</div>
                    </div>
                    <div className="list-content p20">
                      <h6 className="list-title">
                        <Link
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {item.title}
                        </Link>
                      </h6>
                      <p className="list-text mb-2">{siteName}</p>
                      <p className="fz14 text-muted mb-3">
                        {getMarketplaceCardLabel(item)}
                      </p>
                      <Link
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ud-btn btn-thm"
                      >
                        View on {siteName}
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
