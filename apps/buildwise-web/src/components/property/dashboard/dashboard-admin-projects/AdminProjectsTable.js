"use client";

import { buytlyApi } from "@/api/generated";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import ApiPagination from "@/components/property/ApiPagination";
import {
  DashboardFilterBar,
  FilterClearButton,
  FilterSearch,
  FilterSelect,
} from "@/components/property/dashboard/DashboardFilterBar";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import { useConfirmAction } from "@/hooks/useConfirmAction";
import StatusBadge from "@/components/common/StatusBadge";
import { notifyError } from "@/lib/toast";
import { getApiError } from "@/lib/auth/getApiError";
import Link from "next/link";
import DashboardBtnIcon, {
  dashboardIcons,
} from "@/components/property/dashboard/DashboardBtnIcon";
import { useLiveSyncReload } from "@/hooks/useLiveSyncReload";
import { useCallback, useEffect, useMemo, useState } from "react";
import DashboardTableEmptyState from "@/components/property/dashboard/DashboardTableEmptyState";
import { DashboardTableSkeleton } from "@/components/property/dashboard/skeletons/DashboardSkeletons";
import { getAdminProjectsEmptyState } from "@/lib/dashboard/tableEmptyStates";
import {
  adminArchiveProjectConfirmation,
  adminMarkProjectSoldConfirmation,
} from "@/lib/confirmations";

const PAGE_SIZE = 20;

const STATUS_FILTERS = [
  { value: "", label: "All statuses" },
  { value: "pending", label: "Pending review" },
  { value: "active", label: "Published" },
  { value: "draft", label: "Draft" },
  { value: "sold", label: "Sold" },
  { value: "archived", label: "Archived" },
];

const formatDate = (value) => {
  if (!value) return "—";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
};

const formatOwner = (owner) => {
  if (!owner) return { name: "—", email: null };
  const name = [owner.firstName, owner.lastName].filter(Boolean).join(" ");
  if (name && owner.email) {
    return { name, email: owner.email };
  }
  return {
    name: name || owner.email || "—",
    email: owner.email && name ? owner.email : null,
  };
};

export default function AdminProjectsTable() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput, search] = useDebouncedSearch();
  const [statusFilter, setStatusFilter] = useState("");
  const [projects, setProjects] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const { requestConfirm, dialogProps, isLocked, pending } = useConfirmAction();

  const queryParams = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
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

  const hasActiveFilters = Boolean(search.trim() || statusFilter);

  const resetFilters = () => {
    setSearchInput("");
    setStatusFilter("");
    setPage(1);
  };

  const tableBusy = isLocked;
  const moderatingId = pending?.targetId ?? null;

  const moderate = (id, title, status, unitCount = 0) => {
    const archiveConfig =
      status === "archived" ? adminArchiveProjectConfirmation(title) : null;
    const soldConfig =
      status === "sold"
        ? adminMarkProjectSoldConfirmation(title, unitCount)
        : null;

    requestConfirm({
      title:
        soldConfig?.title ??
        archiveConfig?.title ??
        (status === "active" ? "Approve project?" : "Update project status?"),
      message:
        soldConfig?.message ??
        archiveConfig?.message ??
        (status === "active"
          ? `"${title}" will go live and pending units will be published.`
          : `Set "${title}" to ${status}?`),
      confirmLabel:
        soldConfig?.confirmLabel ??
        archiveConfig?.confirmLabel ??
        (status === "active" ? "Approve" : "Confirm"),
      confirmVariant: archiveConfig?.confirmVariant,
      confirmingLabel:
        soldConfig?.confirmingLabel ?? archiveConfig?.confirmingLabel,
      targetId: id,
      action: {
        message:
          status === "sold"
            ? "Marking project as sold..."
            : status === "archived"
              ? "Archiving project..."
              : "Updating project...",
        successMessage:
          status === "sold"
            ? "Project marked as sold"
            : status === "archived"
              ? "Project archived"
              : "Project updated",
        task: () => buytlyApi.adminModerateProject(id, { status }),
        onSuccess: load,
        onError: (error) => notifyError(getApiError(error)),
      },
    });
  };

  const showTableSkeleton = loading && !projects.length;

  return (
    <>
      <ConfirmDialog {...dialogProps} />

      <DashboardFilterBar className="mb20 admin-projects-moderation__filters">
        <FilterSearch
          id="admin-projects-search"
          value={searchInput}
          onChange={setSearchInput}
          placeholder="Search by title or owner email"
          disabled={tableBusy}
        />
        <FilterSelect
          id="admin-project-status"
          label="Status"
          value={statusFilter}
          options={STATUS_FILTERS}
          disabled={tableBusy}
          onChange={(value) => {
            setPage(1);
            setStatusFilter(value);
          }}
        />
        <FilterClearButton
          visible={hasActiveFilters}
          disabled={tableBusy}
          onClick={resetFilters}
        />
      </DashboardFilterBar>

      {pagination?.total != null && !showTableSkeleton ? (
        <p className="admin-projects-moderation__summary text-muted fz14 mb20">
          {hasActiveFilters
            ? `${pagination.total} project${pagination.total === 1 ? "" : "s"} match your filters`
            : `${pagination.total} project${pagination.total === 1 ? "" : "s"} total`}
        </p>
      ) : null}

      {showTableSkeleton ? (
        <DashboardTableSkeleton rows={5} columns={5} />
      ) : !projects.length ? (
        <DashboardTableEmptyState
          {...getAdminProjectsEmptyState({
            hasActiveFilters,
            isPendingQueue: statusFilter === "pending" && !search.trim(),
            onClearFilters: resetFilters,
          })}
        />
      ) : (
        <div className="table-responsive admin-projects-moderation__table-wrap">
          <table className="table-style3 table at-savesearch admin-projects-moderation-table">
            <thead className="t-head">
              <tr>
                <th scope="col">Project</th>
                <th scope="col">Status</th>
                <th
                  scope="col"
                  className="admin-projects-moderation-table__owner"
                >
                  Owner
                </th>
                <th scope="col">Submitted</th>
                <th
                  scope="col"
                  className="admin-projects-moderation-table__actions"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="t-body">
              {projects.map((project) => {
                const id = project._id || project.id;
                const rowBusy = moderatingId === id;
                const owner = formatOwner(project.ownerId);

                return (
                  <tr key={id}>
                    <th
                      scope="row"
                      className="admin-projects-moderation-table__title"
                    >
                      {project.title}
                    </th>
                    <td className="vam">
                      <StatusBadge domain="listing" status={project.status} />
                    </td>
                    <td className="vam admin-projects-moderation-table__owner">
                      <div>{owner.name}</div>
                      {owner.email ? (
                        <div className="text-muted fz13">{owner.email}</div>
                      ) : null}
                    </td>
                    <td className="vam text-nowrap">
                      {formatDate(project.createdAt)}
                    </td>
                    <td className="vam admin-projects-moderation-table__actions">
                      <div className="d-flex flex-wrap gap-2">
                        {project.status === "pending" ? (
                          <>
                            <button
                              type="button"
                              className="ud-btn btn-thm btn-sm"
                              disabled={rowBusy || tableBusy}
                              onClick={() =>
                                moderate(id, project.title, "active")
                              }
                            >
                              <DashboardBtnIcon icon={dashboardIcons.approve} />
                              Approve
                            </button>
                            <Link
                              href={`/dashboard-edit-project/${id}`}
                              className={`ud-btn btn-white btn-sm${tableBusy ? " pe-none opacity-50" : ""}`}
                              aria-disabled={tableBusy}
                              tabIndex={tableBusy ? -1 : undefined}
                            >
                              <DashboardBtnIcon icon={dashboardIcons.eye} />
                              Review
                            </Link>
                            <button
                              type="button"
                              className="ud-btn btn-white btn-sm"
                              disabled={rowBusy || tableBusy}
                              onClick={() =>
                                moderate(id, project.title, "draft")
                              }
                            >
                              <DashboardBtnIcon icon={dashboardIcons.draft} />
                              Return to draft
                            </button>
                          </>
                        ) : (
                          <>
                            <Link
                              href={`/dashboard-edit-project/${id}`}
                              className={`ud-btn btn-white btn-sm${tableBusy ? " pe-none opacity-50" : ""}`}
                              aria-disabled={tableBusy}
                              tabIndex={tableBusy ? -1 : undefined}
                            >
                              <DashboardBtnIcon icon={dashboardIcons.eye} />
                              Review
                            </Link>
                            {project.status === "active" ? (
                              <>
                                <button
                                  type="button"
                                  className="ud-btn btn-white btn-sm"
                                  disabled={rowBusy || tableBusy}
                                  onClick={() =>
                                    moderate(
                                      id,
                                      project.title,
                                      "sold",
                                      project.unitCount ?? 0,
                                    )
                                  }
                                >
                                  <DashboardBtnIcon
                                    icon={dashboardIcons.complete}
                                  />
                                  Mark as sold
                                </button>
                                <button
                                  type="button"
                                  className="ud-btn btn-white btn-sm"
                                  disabled={rowBusy || tableBusy}
                                  onClick={() =>
                                    moderate(id, project.title, "archived")
                                  }
                                >
                                  <DashboardBtnIcon
                                    icon={dashboardIcons.archive}
                                  />
                                  Archive
                                </button>
                              </>
                            ) : null}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {!showTableSkeleton ? (
        <div className="mt30">
          <ApiPagination
            page={page}
            totalPages={pagination?.totalPages || 1}
            total={pagination?.total || 0}
            limit={PAGE_SIZE}
            itemLabel="projects"
            itemLabelSingular="project"
            disabled={tableBusy}
            onPageChange={setPage}
          />
        </div>
      ) : null}
    </>
  );
}
