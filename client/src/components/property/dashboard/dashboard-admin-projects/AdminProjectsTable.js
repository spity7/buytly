"use client";

import { buytlyApi } from "@/api/generated";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import {
  DashboardFilterBar,
  FilterSearch,
  FilterSelect,
} from "@/components/property/dashboard/DashboardFilterBar";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import { useConfirmAction } from "@/hooks/useConfirmAction";
import StatusBadge from "@/components/common/StatusBadge";
import { notifyError } from "@/lib/toast";
import { getApiError } from "@/lib/auth/getApiError";
import Link from "next/link";
import { useLiveSyncReload } from "@/hooks/useLiveSyncReload";
import { useCallback, useEffect, useMemo, useState } from "react";
import DashboardTableEmptyState from "@/components/property/dashboard/DashboardTableEmptyState";
import { DashboardTableSkeleton } from "@/components/property/dashboard/skeletons/DashboardSkeletons";
import { getAdminProjectsEmptyState } from "@/lib/dashboard/tableEmptyStates";
import { adminArchiveProjectConfirmation } from "@/lib/confirmations";

const STATUS_FILTERS = [
  { value: "", label: "All statuses" },
  { value: "pending", label: "Pending review" },
  { value: "active", label: "Published" },
  { value: "draft", label: "Draft" },
  { value: "sold", label: "Sold" },
  { value: "archived", label: "Archived" },
];

export default function AdminProjectsTable() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput, search] = useDebouncedSearch();
  const [statusFilter, setStatusFilter] = useState("pending");
  const [projects, setProjects] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const { requestConfirm, dialogProps, isLocked } = useConfirmAction();

  const queryParams = useMemo(
    () => ({
      page,
      limit: 20,
      ...(statusFilter ? { status: statusFilter } : {}),
      ...(search.trim() ? { search: search.trim() } : {}),
    }),
    [page, statusFilter, search],
  );

  const load = useCallback(
    async ({ silent = false } = {}) => {
      if (!silent) {
        setLoading(true);
      }
      try {
        const response = await buytlyApi.adminListProjects(queryParams);
        setProjects(response.data || []);
        setPagination(response.pagination);
      } finally {
        if (!silent) {
          setLoading(false);
        }
      }
    },
    [queryParams],
  );

  useEffect(() => {
    load();
  }, [load]);

  useLiveSyncReload(load);

  const hasActiveFilters = Boolean(
    search.trim() || statusFilter !== "pending",
  );

  const resetFilters = () => {
    setSearchInput("");
    setStatusFilter("pending");
    setPage(1);
  };

  const moderate = (id, title, status) => {
    const archiveConfig =
      status === "archived" ? adminArchiveProjectConfirmation(title) : null;

    requestConfirm({
      title:
        archiveConfig?.title ??
        (status === "active" ? "Approve project?" : "Update project status?"),
      message:
        archiveConfig?.message ??
        (status === "active"
          ? `"${title}" will go live and pending units will be published.`
          : `Set "${title}" to ${status}?`),
      confirmLabel:
        archiveConfig?.confirmLabel ??
        (status === "active" ? "Approve" : "Confirm"),
      confirmVariant: archiveConfig?.confirmVariant,
      confirmingLabel: archiveConfig?.confirmingLabel,
      action: {
        message:
          status === "archived"
            ? "Archiving project..."
            : "Updating project...",
        successMessage:
          status === "archived" ? "Project archived" : "Project updated",
        task: () => buytlyApi.adminModerateProject(id, { status }),
        onSuccess: load,
        onError: (error) => notifyError(getApiError(error)),
      },
    });
  };

  return (
    <div className="p30">
      <ConfirmDialog {...dialogProps} />
      <h2 className="mb20">Moderate projects</h2>

      <DashboardFilterBar className="mb20">
        <FilterSearch
          id="admin-projects-search"
          value={searchInput}
          onChange={setSearchInput}
          placeholder="Search projects"
          disabled={isLocked}
        />
        <FilterSelect
          id="admin-project-status"
          label="Status"
          hideLabel
          value={statusFilter}
          options={STATUS_FILTERS}
          disabled={isLocked}
          onChange={(value) => {
            setPage(1);
            setStatusFilter(value);
          }}
        />
      </DashboardFilterBar>

      {loading && !projects.length ? (
        <DashboardTableSkeleton rows={5} columns={5} />
      ) : !projects.length ? (
        <DashboardTableEmptyState
          {...getAdminProjectsEmptyState({
            hasActiveFilters,
            isPendingQueue:
              statusFilter === "pending" && !search.trim(),
            onClearFilters: resetFilters,
          })}
        />
      ) : (
        <div className="table-responsive">
          <table className="table-style3 table at-savesearch">
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Owner</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => {
                const id = project._id || project.id;
                return (
                  <tr key={id}>
                    <td>{project.title}</td>
                    <td>
                      <StatusBadge domain="listing" status={project.status} />
                    </td>
                    <td>
                      {project.ownerId?.email ||
                        project.ownerId?.firstName ||
                        "—"}
                    </td>
                    <td className="d-flex flex-wrap gap-2">
                      <Link href={`/dashboard-edit-project/${id}`}>Review</Link>
                      {project.status === "pending" ? (
                        <>
                          <button
                            type="button"
                            className="btn btn-sm btn-success"
                            disabled={isLocked}
                            onClick={() =>
                              moderate(id, project.title, "active")
                            }
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            disabled={isLocked}
                            onClick={() => moderate(id, project.title, "draft")}
                          >
                            Return to draft
                          </button>
                        </>
                      ) : null}
                      {project.status === "active" ? (
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          disabled={isLocked}
                          onClick={() =>
                            moderate(id, project.title, "archived")
                          }
                        >
                          Archive
                        </button>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {pagination && pagination.totalPages > 1 ? (
        <div className="d-flex gap-2 mt20">
          <button
            type="button"
            className="ud-btn btn-white2 btn-sm"
            disabled={page <= 1 || isLocked}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </button>
          <button
            type="button"
            className="ud-btn btn-white2 btn-sm"
            disabled={page >= pagination.totalPages || isLocked}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      ) : null}
    </div>
  );
}
