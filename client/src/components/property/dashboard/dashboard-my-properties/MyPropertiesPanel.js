"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { buytlyApi } from "@/api/generated";
import { useHighlightQueryParam } from "@/hooks/useDashboardRowHighlight";
import { findPaginatedHighlightPage } from "@/lib/dashboard/findPaginatedHighlightPage";
import {
  DashboardFilterBar,
  FilterClearButton,
  FilterSearch,
  FilterSelect,
} from "@/components/property/dashboard/DashboardFilterBar";
import PropertyDataTable from "@/components/property/dashboard/dashboard-my-properties/PropertyDataTable";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import { useMyProjects } from "@/hooks/useProjects";
import {
  MY_PROPERTY_STATUS_FILTERS,
  PROPERTY_TYPE_FILTERS,
} from "@/lib/dashboard/filterOptions";

const PAGE_SIZE = 10;

export default function MyPropertiesPanel() {
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
  const [type, setPropertyType] = useState("");
  const [projectId, setProjectId] = useState(
    () => searchParams.get("projectId") || "",
  );

  const isTrash = tab === "trash";

  const { data: projectsData } = useMyProjects({
    limit: 100,
    sortBy: "title",
    sortOrder: "asc",
    trashed: "false",
  });

  const projectFilterOptions = useMemo(() => {
    const projects = projectsData?.projects || [];
    return [
      { value: "", label: "All projects" },
      ...projects.map((project) => ({
        value: String(project._id || project.id),
        label: project.title || "Untitled",
      })),
    ];
  }, [projectsData]);

  const queryParams = useMemo(() => {
    const params = {
      page,
      limit: PAGE_SIZE,
      sortBy: "createdAt",
      sortOrder: "desc",
      trashed: isTrash ? "true" : "false",
    };

    if (!isTrash && status) params.status = status;
    if (type) params.type = type;
    if (projectId) params.projectId = projectId;
    if (search.trim()) params.search = search.trim();

    return params;
  }, [page, isTrash, status, type, projectId, search]);

  const hasActiveFilters = Boolean(
    search.trim() || status || type || projectId,
  );

  const resetPage = () => setPage(1);

  const clearFilters = useCallback(() => {
    setStatus("");
    setPropertyType("");
    setProjectId("");
    setSearchInput("");
    setPage(1);
  }, [setSearchInput]);

  useEffect(() => {
    const fromUrl = searchParams.get("projectId");
    if (fromUrl) {
      setProjectId(fromUrl);
      setPage(1);
    }
    if (searchParams.get("tab") === "trash") {
      setTab("trash");
      setPage(1);
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
        setPropertyType("");
        setProjectId("");
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
            <h2>All units</h2>
            <p className="text mb-0">
              Flat list of sellable units. Manage projects from{" "}
              <Link href="/dashboard-my-projects">My Projects</Link>.
            </p>
          </div>
        </div>
        <div className="col-auto">
          <div className="dashboard_search_meta d-flex flex-wrap align-items-center justify-content-end gap-2">
            <Link href="/dashboard-my-projects" className="ud-btn btn-white2">
              My projects
            </Link>
            <Link href="/dashboard-add-project" className="ud-btn btn-thm">
              Add project
              <i className="fal fa-arrow-right-long" />
            </Link>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-xl-12">
          <div className="ps-widget bgc-white bdrs12 default-box-shadow2 p30 mb30 overflow-hidden position-relative">
            <div className="packages_table table-responsive">
              <div className="mb10 d-flex flex-wrap gap-2">
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
              <p className="fz14 text-muted mb20">
                {isTrash
                  ? "Trashed units are hidden from the public site. Restore to edit again, or delete permanently (not allowed when visit bookings or purchase records exist). Units trashed with a project are restored from Projects → Trash, not here."
                  : "Units belonging to trashed projects are hidden here until the project is restored. Move units to trash before permanent deletion."}
              </p>

              <DashboardFilterBar className="mb20">
                <FilterSearch
                  id="my-properties-search"
                  value={searchInput}
                  onChange={setSearchInput}
                  placeholder="Search by title or location"
                  disabled={highlightResolving}
                />
                <FilterSelect
                  id="my-properties-project"
                  label="Project"
                  hideLabel
                  value={projectId}
                  disabled={highlightResolving}
                  onChange={(value) => {
                    resetPage();
                    setProjectId(value);
                  }}
                  options={projectFilterOptions}
                />
                {!isTrash && (
                  <FilterSelect
                    id="my-properties-status"
                    label="Status"
                    hideLabel
                    value={status}
                    disabled={highlightResolving}
                    onChange={(value) => {
                      resetPage();
                      setStatus(value);
                    }}
                    options={MY_PROPERTY_STATUS_FILTERS}
                  />
                )}
                <FilterSelect
                  id="my-properties-type"
                  label="Property type"
                  hideLabel
                  value={type}
                  disabled={highlightResolving}
                  onChange={(value) => {
                    resetPage();
                    setPropertyType(value);
                  }}
                  options={PROPERTY_TYPE_FILTERS}
                />
                <FilterClearButton
                  visible={hasActiveFilters}
                  disabled={highlightResolving}
                  onClick={clearFilters}
                  className="ms-auto"
                />
              </DashboardFilterBar>

              <PropertyDataTable
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
                onShowActiveListings={() => {
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
