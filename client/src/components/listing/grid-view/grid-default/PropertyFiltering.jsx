"use client";

import React, { useState } from "react";
import ListingSidebar from "../../sidebar";
import TopFilterBar from "./TopFilterBar";
import ListingPropertyGrid from "@/components/listing/shared/ListingPropertyGrid";
import ApiPagination from "@/components/property/ApiPagination";
import ListingBrowseHeader from "@/components/listing/shared/ListingBrowseHeader";
import { useListingFilters } from "@/hooks/useListingFilters";

const PAGE_SIZE = 8;

export default function PropertyFiltering() {
  const [colstyle, setColstyle] = useState(false);

  const {
    pageNumber,
    setPageNumber,
    setCurrentSortingOption,
    filterFunctions,
    cards,
    pagination,
    pageContentTrac,
    isLoading,
    isError,
    listingStatus,
    location,
  } = useListingFilters({ pageSize: PAGE_SIZE });

  return (
    <>
      <ListingBrowseHeader listingStatus={listingStatus} location={location} />

      <section className="pt0 pb90 bgc-f7">
        <div className="container">
          <div className="row gx-xl-5">
            <div className="col-lg-4 d-none d-lg-block">
              <ListingSidebar filterFunctions={filterFunctions} />
            </div>

            <div
              className="offcanvas offcanvas-start p-0"
              tabIndex="-1"
              id="listingSidebarFilter"
              aria-labelledby="listingSidebarFilterLabel"
            >
              <div className="offcanvas-header">
                <h5 className="offcanvas-title" id="listingSidebarFilterLabel">
                  Listing Filter
                </h5>
                <button
                  type="button"
                  className="btn-close text-reset"
                  data-bs-dismiss="offcanvas"
                  aria-label="Close"
                ></button>
              </div>
              <div className="offcanvas-body p-0">
                <ListingSidebar filterFunctions={filterFunctions} />
              </div>
            </div>

            <div className="col-lg-8">
              <div className="row align-items-center mb20">
                <TopFilterBar
                  pageContentTrac={pageContentTrac}
                  colstyle={colstyle}
                  setColstyle={setColstyle}
                  setCurrentSortingOption={setCurrentSortingOption}
                />
              </div>

              {isError && (
                <div className="alert alert-danger mb20">
                  Failed to load properties. Please try again.
                </div>
              )}

              <div className="row mt15">
                <ListingPropertyGrid
                  colstyle={colstyle}
                  data={cards}
                  isLoading={isLoading}
                  layout="sidebar"
                />
              </div>

              <div className="row">
                <ApiPagination
                  page={pageNumber}
                  totalPages={pagination?.totalPages || 1}
                  total={pagination?.total || 0}
                  limit={PAGE_SIZE}
                  onPageChange={setPageNumber}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
