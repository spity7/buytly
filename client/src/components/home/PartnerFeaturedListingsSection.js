"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { customInstance } from "@/lib/api/custom-instance";

async function fetchPartnerListings() {
  const body = await customInstance({
    url: "/platform/featured-listings",
    method: "GET",
    params: { limit: 6 },
  });
  return body?.data ?? [];
}

export default function PartnerFeaturedListingsSection() {
  const {
    data: listings = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["platform", "featured-listings"],
    queryFn: fetchPartnerListings,
    staleTime: 60_000,
  });

  if (isError || (!isLoading && listings.length === 0)) {
    return null;
  }

  return (
    <section className="pt-0 pb90">
      <div className="container">
        <div className="row align-items-center mb30">
          <div className="col-lg-8">
            <h2 className="title">Partner developments</h2>
            <p className="text mb-0">
              Explore selected projects from independent partner sites on the
              Buytly platform.
            </p>
          </div>
        </div>
        <div className="row">
          {isLoading ? (
            <div className="col-12">
              <p className="text-muted mb-0">Loading partner listings…</p>
            </div>
          ) : (
            listings.map((item) => {
              const externalUrl =
                item.sourceSite?.listingUrl ||
                item.sourceSite?.publicUrl ||
                "#";
              const siteName = item.sourceSite?.name || "Partner site";
              return (
                <div
                  key={item._id || item.id}
                  className="col-sm-6 col-lg-4 mb30"
                >
                  <div className="listing-style1 bdrs12 default-box-shadow1">
                    <div className="list-content p20">
                      <h6 className="list-title">
                        <Link href={externalUrl} target="_blank" rel="noopener">
                          {item.title}
                        </Link>
                      </h6>
                      <p className="list-text mb-2">{siteName}</p>
                      {item.price != null ? (
                        <div className="list-price">
                          ${Number(item.price).toLocaleString()}
                        </div>
                      ) : null}
                      <Link
                        href={externalUrl}
                        target="_blank"
                        rel="noopener"
                        className="ud-btn btn-thm mt15"
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
