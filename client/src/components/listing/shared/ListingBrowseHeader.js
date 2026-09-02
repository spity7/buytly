"use client";

import Link from "next/link";
import {
  getListingBrowseCrumb,
  getListingBrowseTitle,
} from "@/lib/listings/listingFilters";

export default function ListingBrowseHeader({ listingStatus, location }) {
  const title = getListingBrowseTitle({ listingStatus, location });
  const crumb = getListingBrowseCrumb({ listingStatus, location });

  return (
    <section className="breadcumb-section bgc-f7">
      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            <div className="breadcumb-style1">
              <h2 className="title">{title}</h2>
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
