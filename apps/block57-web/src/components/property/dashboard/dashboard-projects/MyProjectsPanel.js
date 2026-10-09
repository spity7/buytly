"use client";

import Link from "next/link";
import DashboardBtnIcon, {
  dashboardIcons,
} from "@/components/property/dashboard/DashboardBtnIcon";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { buytlyApi } from "@/api/generated";
import {
  DashboardFilterBar,
  FilterClearButton,
  FilterSearch,
  FilterSelect,
} from "@/components/property/dashboard/DashboardFilterBar";
import ProjectsDataTable from "@/components/property/dashboard/dashboard-projects/ProjectsDataTable";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import { useHighlightQueryParam } from "@/hooks/useDashboardRowHighlight";
import { findPaginatedHighlightPage } from "@/lib/dashboard/findPaginatedHighlightPage";
import { MY_PROJECT_STATUS_FILTERS } from "@/lib/dashboard/filterOptions";

const PAGE_SIZE = 10;

export default function MyProjectsPanel() {
  const searchParams = useSearchParams();
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

  const isTrash = tab === "trash";

  const queryParams = useMemo(() => {
    const params = {
      page,
      limit: PAGE_SIZE,
      sortBy: "createdAt",
      sortOrder: "desc",
      trashed: isTrash ? "true" : "false",
    };

    if (!isTrash && status) params.status = status;
    if (search.trim()) params.search = search.trim();

    return params;
  }, [page, isTrash, status, search]);

  const hasActiveFilters = Boolean(search.trim() || status);

  const resetPage = () => setPage(1);

  const clearFilters = useCallback(() => {
    setStatus("");
    setSearchInput("");
    setPage(1);
  }, [setSearchInput]);

  useEffect(() => {
    if (searchParams.get("trash") === "1") {
      setTab("trash");
    }
  }, [searchParams]);

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
          const response = await buytlyApi.getProjectById(highlightId);
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
            const response = await buytlyApi.listMyProjects({
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
      <div className="row align-items-center pb40 g-2">
        <div className="col">
          <div className="dashboard_title_area">
            <h2>My Projects</h2>
            <p className="text mb-0">
              Developments you manage. Add sellable units
              from <Link href="/dashboard-my-properties">All units</Link>.
            </p>
          </div>
        </div>
        <div className="col-auto">
          <div className="dashboard_search_meta d-flex flex-wrap align-items-center justify-content-end gap-2">
            <Link href="/dashboard-my-properties" className="ud-btn btn-white2">
              <DashboardBtnIcon icon={dashboardIcons.list} />
              All units
            </Link>
            <Link href="/dashboard-add-project" className="ud-btn btn-thm">
              <DashboardBtnIcon icon={dashboardIcons.folderPlus} />
              Add project
              <DashboardBtnIcon
                icon={dashboardIcons.arrowRight}
                position="trailArrow"
              />
            </Link>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-xl-12">
          <div className="ps-widget bgc-white bdrs12 default-box-shadow2 p30 mb30 overflow-hidden position-relative">
            <div className="packages_table table-responsive">
              <div className="mb10 d-flex flex-wrap gap-2 align-items-center">
                <button
                  type="button"
                  className={`ud-btn btn-sm ${tab === "active" ? "btn-thm" : "btn-white"}`}
                  onClick={() => {
                    setTab("active");
                    resetPage();
                  }}
                >
                  <DashboardBtnIcon icon={dashboardIcons.building} />
                  My projects
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
                  <DashboardBtnIcon icon={dashboardIcons.trash} />
                  Trash
                </button>
              </div>
              <p className="fz14 text-muted mb20">
                {isTrash
                  ? "Trashed projects are hidden from the public site. Restore to edit again, or delete permanently to remove all data (blocked if units have bookings or purchase records)."
                  : "Active projects you manage. Move to trash first; permanent deletion is only available from the Trash tab."}
              </p>

              <DashboardFilterBar className="mb20">
                <FilterSearch
                  id="my-projects-search"
                  value={searchInput}
                  onChange={setSearchInput}
                  placeholder="Search projects"
                  disabled={highlightResolving}
                />
                {!isTrash && (
                  <FilterSelect
                    id="my-projects-status"
                    label="Status"
                    hideLabel
                    value={status}
                    disabled={highlightResolving}
                    onChange={(value) => {
                      resetPage();
                      setStatus(value);
                    }}
                    options={MY_PROJECT_STATUS_FILTERS}
                  />
                )}
                <FilterClearButton
                  visible={hasActiveFilters}
                  disabled={highlightResolving}
                  onClick={clearFilters}
                  className="ms-auto"
                />
              </DashboardFilterBar>

              <ProjectsDataTable
                queryParams={queryParams}
                isTrash={isTrash}
                page={page}
                pageSize={PAGE_SIZE}
                onPageChange={setPage}
                highlightResolving={highlightResolving}
                hasActiveFilters={hasActiveFilters}
                onMovedToTrash={() => {
                  setTab("trash");
                  setPage(1);
                  setStatus("");
                }}
                onClearFilters={clearFilters}
                onShowActiveProjects={() => {
                  setTab("active");
                  resetPage();
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
