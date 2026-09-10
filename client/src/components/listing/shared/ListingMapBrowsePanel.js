"use client";

import AdvanceFilterModal from "@/components/common/advance-filter-two";
import ApiPagination from "@/components/property/ApiPagination";
import ListingBrowseHeader from "@/components/listing/shared/ListingBrowseHeader";
import ListingPropertyGrid from "@/components/listing/shared/ListingPropertyGrid";
import ListingSidebar from "@/components/listing/sidebar";
import ListingMap1 from "@/components/listing/map-style/ListingMap1";
import TopFilterBar from "@/components/listing/grid-view/grid-full-4-col/TopFilterBar";
import { useListingFilters } from "@/hooks/useListingFilters";
import { LISTING_PAGE_SIZE } from "@/lib/listings/listingFilters";

export default function ListingMapBrowsePanel({
  pageSize = LISTING_PAGE_SIZE,
}) {
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
    searchQuery,
    queryParams,
  } = useListingFilters({ pageSize, basePath: "/listings/map" });

  const saveSearchContext = {
    queryParams,
    listingStatus,
    location,
    searchQuery,
  };

  return (
    <>
      <ListingBrowseHeader
        listingStatus={listingStatus}
        location={location}
        viewMode="map"
      />

      <section className="p-0 bgc-f7">
        <div className="container-fluid">
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

          <div className="row">
            <div className="col-xl-5">
              <div className="half_map_area_content mt30 px-3 px-xl-4">
                <div className="row align-items-center mb10">
                  <TopFilterBar
                    pageContentTrac={pageContentTrac}
                    filterFunctions={filterFunctions}
                    setCurrentSortingOption={setCurrentSortingOption}
                    colstyle
                    setColstyle={() => {}}
                  />
                </div>

                {isError && (
                  <div className="alert alert-danger mb20">
                    Failed to load properties. Please try again.
                  </div>
                )}

                <div className="row">
                  <ListingPropertyGrid
                    colstyle
                    data={cards}
                    isLoading={isLoading}
                    layout="full-4"
                  />
                </div>

                <div className="row pb30">
                  <ApiPagination
                    page={pageNumber}
                    totalPages={pagination?.totalPages || 1}
                    total={pagination?.total || 0}
                    limit={pageSize}
                    onPageChange={setPageNumber}
                  />
                </div>
              </div>
            </div>

            <div className="col-xl-7 overflow-hidden position-relative">
              <div className="half_map_area map-canvas half_style">
                <ListingMap1 markers={cards} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
