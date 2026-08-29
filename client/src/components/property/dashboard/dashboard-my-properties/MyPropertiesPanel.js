"use client";

import Link from "next/link";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { buytlyApi } from "@/api/generated";
import { useHighlightQueryParam } from "@/hooks/useDashboardRowHighlight";
import { findPaginatedHighlightPage } from "@/lib/dashboard/findPaginatedHighlightPage";
import {
  DashboardFilterBar,
  FilterSearch,
  FilterSelect,
  FilterSortSelect,
} from "@/components/property/dashboard/DashboardFilterBar";
import PropertyDataTable from "@/components/property/dashboard/dashboard-my-properties/PropertyDataTable";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import {
  LISTING_TYPE_FILTERS,
  MY_PROPERTY_STATUS_FILTERS,
  PROPERTY_SORT_OPTIONS,
  PROPERTY_TYPE_FILTERS,
  parseSortValue,
} from "@/lib/dashboard/filterOptions";

const PAGE_SIZE = 10;

export default function MyPropertiesPanel() {
  const highlightId = useHighlightQueryParam();
  const [highlightResolving, setHighlightResolving] = useState(false);
  const resolvedHighlightRef = useRef(null);
  const [tab, setTab] = useState("active");
  const [page, setPage] = useState(1);
  const handleSearchDebounced = useCallback(() => setPage(1), []);
  const [searchInput, setSearchInput, search] = useDebouncedSearch(
    "",
    300,
    handleSearchDebounced,
  );
  const [status, setStatus] = useState("");
  const [listingType, setListingType] = useState("");
  const [type, setPropertyType] = useState("");
  const [sort, setSort] = useState("createdAt:desc");

  const isTrash = tab === "trash";
  const { sortBy, sortOrder } = parseSortValue(sort);

  const queryParams = useMemo(() => {
    const params = {
      page,
      limit: PAGE_SIZE,
      sortBy,
      sortOrder,
      trashed: isTrash ? "true" : "false",
    };

    if (!isTrash && status) params.status = status;
    if (listingType) params.listingType = listingType;
    if (type) params.type = type;
    if (search.trim()) params.search = search.trim();

    return params;
  }, [page, sortBy, sortOrder, isTrash, status, listingType, type, search]);

  const resetPage = () => setPage(1);

  useEffect(() => {
    if (!highlightId) {
      resolvedHighlightRef.current = null;
      return undefined;
    }

    if (resolvedHighlightRef.current === highlightId) {
      return undefined;
    }

    let cancelled = false;

    (async () => {
      setHighlightResolving(true);

      try {
        let isTrashed = false;

        try {
          const response = await buytlyApi.getPropertyById(highlightId);
          isTrashed = Boolean(response.data?.deletedAt);
        } catch {
          resolvedHighlightRef.current = highlightId;
          return;
        }

        if (cancelled) return;

        const scanParams = {
          limit: PAGE_SIZE,
          sortBy: "createdAt",
          sortOrder: "desc",
          trashed: isTrashed ? "true" : "false",
        };

        const foundPage = await findPaginatedHighlightPage({
          highlightId,
          fetchPage: async (scanPage) => {
            const response = await buytlyApi.listMyProperties({
              ...scanParams,
              page: scanPage,
            });
            return {
              items: response.data,
              pagination: response.pagination,
            };
          },
        });

        if (cancelled) return;

        setTab(isTrashed ? "trash" : "active");
        setStatus("");
        setSearchInput("");
        setListingType("");
        setPropertyType("");
        setPage(foundPage || 1);
        resolvedHighlightRef.current = highlightId;
      } finally {
        if (!cancelled) {
          setHighlightResolving(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [highlightId, setSearchInput]);

  return (
    <>
      <div className="row align-items-center pb40">
        <div className="col-xxl-3">
          <div className="dashboard_title_area">
            <h2>My Properties</h2>
            <p className="text">We are glad to see you again!</p>
          </div>
        </div>
        <div className="col-xxl-9">
          <div className="dashboard_search_meta d-md-flex align-items-center justify-content-xxl-end">
            <Link href="/dashboard-add-property" className="ud-btn btn-thm">
              Add New Property
              <i className="fal fa-arrow-right-long" />
            </Link>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-xl-12">
          <div className="ps-widget bgc-white bdrs12 default-box-shadow2 p30 mb30 overflow-hidden position-relative">
            <div className="packages_table table-responsive">
              <div className="mb20 d-flex flex-wrap gap-2">
                <button
                  type="button"
                  className={`ud-btn btn-sm ${tab === "active" ? "btn-thm" : "btn-white"}`}
                  onClick={() => {
                    setTab("active");
                    resetPage();
                  }}
                >
                  My listings
                </button>
                <button
                  type="button"
                  className={`ud-btn btn-sm ${tab === "trash" ? "btn-thm" : "btn-white"}`}
                  onClick={() => {
                    setTab("trash");
                    resetPage();
                    setStatus("");
                  }}
                >
                  Trash
                </button>
              </div>

              <DashboardFilterBar className="mb20">
                <FilterSearch
                  id="my-properties-search"
                  value={searchInput}
                  onChange={setSearchInput}
                  placeholder="Search listings"
                />
                {!isTrash && (
                  <FilterSelect
                    id="my-properties-status"
                    label="Status"
                    hideLabel
                    value={status}
                    onChange={(value) => {
                      resetPage();
                      setStatus(value);
                    }}
                    options={MY_PROPERTY_STATUS_FILTERS}
                  />
                )}
                <FilterSelect
                  id="my-properties-listing-type"
                  label="Listing type"
                  hideLabel
                  value={listingType}
                  onChange={(value) => {
                    resetPage();
                    setListingType(value);
                  }}
                  options={LISTING_TYPE_FILTERS}
                />
                <FilterSelect
                  id="my-properties-type"
                  label="Property type"
                  hideLabel
                  value={type}
                  onChange={(value) => {
                    resetPage();
                    setPropertyType(value);
                  }}
                  options={PROPERTY_TYPE_FILTERS}
                />
                <FilterSortSelect
                  value={sort}
                  onChange={(value) => {
                    resetPage();
                    setSort(value);
                  }}
                  options={PROPERTY_SORT_OPTIONS}
                />
              </DashboardFilterBar>

              <PropertyDataTable
                queryParams={queryParams}
                isTrash={isTrash}
                page={page}
                pageSize={PAGE_SIZE}
                onPageChange={setPage}
                highlightResolving={highlightResolving}
                hasActiveFilters={Boolean(
                  search || status || listingType || type,
                )}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
