"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  getListingBrowseCrumb,
  getListingBrowseTitle,
} from "@/lib/listings/listingFilters";

export default function ListingBrowseHeader({
  listingStatus,
  location,
  viewMode = "grid",
}) {
  const searchParams = useSearchParams();
  const query = searchParams.toString();
  const title = getListingBrowseTitle({ listingStatus, location });
  const crumb = getListingBrowseCrumb({ listingStatus, location });
  const gridHref = query ? `/listings?${query}` : "/listings";
  const mapHref = query ? `/listings/map?${query}` : "/listings/map";

  return (
    <section className="breadcumb-section bgc-f7">
      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            <div className="breadcumb-style1">
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                <h2 className="title mb-0">{title}</h2>
                <div className="btn-group" role="group" aria-label="Listing view">
                  <Link
                    href={gridHref}
                    className={`btn btn-sm ${viewMode === "grid" ? "btn-dark" : "btn-outline-secondary"}`}
                  >
                    Grid
                  </Link>
                  <Link
                    href={mapHref}
                    className={`btn btn-sm ${viewMode === "map" ? "btn-dark" : "btn-outline-secondary"}`}
                  >
                    Map
                  </Link>
                </div>
              </div>
              <div className="breadcumb-list">
                <Link href="/">Home</Link>
                <Link href="/listings">Listings</Link>
                <span>{crumb}</span>
              </div>
              <a
                className="filter-btn-left mobile-filter-btn d-block d-lg-none"
                data-bs-toggle="offcanvas"
                href="#listingSidebarFilter"
                role="button"
                aria-controls="listingSidebarFilter"
              >
                <span className="flaticon-settings" /> Filter
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
