"use client";

import { useState } from "react";
import AdvanceFilterModal from "@/components/common/advance-filter-two";
import ApiPagination from "@/components/property/ApiPagination";
import ListingBrowseHeader from "@/components/listing/shared/ListingBrowseHeader";
import ListingPropertyGrid from "@/components/listing/shared/ListingPropertyGrid";
import ListingSidebar from "@/components/listing/sidebar";
import TopFilterBar from "@/components/listing/grid-view/grid-full-4-col/TopFilterBar";
import { useListingFilters } from "@/hooks/useListingFilters";
import { LISTING_PAGE_SIZE } from "@/lib/listings/listingFilters";

export default function ListingBrowsePanel({
  pageSize = LISTING_PAGE_SIZE,
  layout = "full-4",
  showAdvanceModal = true,
}) {
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
  } = useListingFilters({ pageSize });

  return (
    <>
      <ListingBrowseHeader listingStatus={listingStatus} location={location} />

      <section className="pt0 pb90 bgc-f7">
        <div className="container">
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

          {showAdvanceModal && (
            <div className="advance-feature-modal">
              <div
                className="modal fade"
                id="advanceSeachModal"
                tabIndex={-1}
                aria-labelledby="advanceSeachModalLabel"
                aria-hidden="true"
              >
                <AdvanceFilterModal filterFunctions={filterFunctions} />
              </div>
            </div>
          )}

          <div className="row align-items-center mb20">
            <TopFilterBar
              pageContentTrac={pageContentTrac}
              filterFunctions={filterFunctions}
              setCurrentSortingOption={setCurrentSortingOption}
              colstyle={colstyle}
              setColstyle={setColstyle}
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
              layout={layout}
            />
          </div>

          <div className="row">
            <ApiPagination
              page={pageNumber}
              totalPages={pagination?.totalPages || 1}
              total={pagination?.total || 0}
              limit={pageSize}
              onPageChange={setPageNumber}
            />
          </div>
        </div>
      </section>
    </>
  );
}
