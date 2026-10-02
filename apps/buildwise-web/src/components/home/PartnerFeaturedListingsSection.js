"use client";

import Image from "next/image";
import Link from "next/link";
import { usePlatformFeaturedProperties } from "@/hooks/usePlatformListings";
import { getMarketplaceCardLabel } from "@/lib/properties/mapProperty";
import { isPlatformMarketplaceSite } from "@/lib/siteContext";

const PLACEHOLDER = "/images/listings/list-1.jpg";

export default function PartnerFeaturedListingsSection() {
  const usePlatform = isPlatformMarketplaceSite();
  const { data, isLoading, isError } = usePlatformFeaturedProperties(
    { limit: 6 },
    { enabled: usePlatform },
  );

  const listings = data?.cards || [];

  if (!usePlatform) {
    return null;
  }

  if (isError) {
    return (
      <section className="pt-0 pb90">
        <div className="container">
          <p className="text-muted mb-0">
            Partner listings are temporarily unavailable. Try again later.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="pt-0 pb90">
      <div className="container">
        <div className="row align-items-center mb30">
          <div className="col-lg-8">
            <h2 className="title">Partner developments</h2>
            <p className="text mb-0">
              Selected listings from partner developments on the marketplace.
            </p>
          </div>
        </div>
        <div className="row">
          {isLoading ? (
            <div className="col-12">
              <p className="text-muted mb-0">Loading partner listings…</p>
            </div>
          ) : !listings.length ? (
            <div className="col-12">
              <p className="text-muted mb-0">
                No partner listings on the marketplace yet. Check back soon.
              </p>
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
