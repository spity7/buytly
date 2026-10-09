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
    discoveryMode,
    setDiscoveryMode,
    location,
    searchQuery,
    queryParams,
  } = useListingFilters({ pageSize });

  const saveSearchContext = {
    queryParams,
    listingStatus,
    location,
    searchQuery,
    discoveryMode,
  };

  return (
    <>
      <ListingBrowseHeader
        listingStatus={listingStatus}
        location={location}
        viewMode="grid"
        discoveryMode={discoveryMode}
      />

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
              <ListingSidebar
                filterFunctions={filterFunctions}
                saveSearchContext={saveSearchContext}
              />
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

          <div className="row align-items-center mb10">
            <div className="col-12">
              <div className="d-flex gap-2 mb20">
                <button
                  type="button"
                  className={`ud-btn btn-sm ${discoveryMode === "units" ? "btn-thm" : "btn-white2"}`}
                  onClick={() => setDiscoveryMode("units")}
                >
                  Units
                </button>
                <button
                  type="button"
                  className={`ud-btn btn-sm ${discoveryMode === "projects" ? "btn-thm" : "btn-white2"}`}
                  onClick={() => setDiscoveryMode("projects")}
                >
                  Projects
                </button>
              </div>
              {discoveryMode === "projects" ? (
                <p className="fz14 text-muted mb0">
                  Project view uses location and search filters. Price, bedrooms, and
                  property type apply to the Units tab.
                </p>
              ) : null}
            </div>
          </div>

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
              Failed to load {discoveryMode === "projects" ? "projects" : "properties"}.
              Please try again.
            </div>
          )}

          <div className="row mt15">
            <ListingPropertyGrid
              colstyle={colstyle}
              data={cards}
              isLoading={isLoading}
              layout={layout}
              discoveryMode={discoveryMode}
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
