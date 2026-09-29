"use client";

import DashboardBtnIcon, {
  dashboardIcons,
} from "@/components/property/dashboard/DashboardBtnIcon";

import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Tooltip as ReactTooltip } from "react-tooltip";
import { buytlyApi } from "@/api/generated";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import ApiPagination from "@/components/property/ApiPagination";
import { DashboardTableSkeleton } from "@/components/property/dashboard/skeletons/DashboardSkeletons";
import { useMyProjects } from "@/hooks/useProjects";
import { useConfirmAction } from "@/hooks/useConfirmAction";
import {
  useDashboardRowHighlight,
  useHighlightQueryParam,
} from "@/hooks/useDashboardRowHighlight";
import {
  projectPermanentDeleteConfirmation,
  projectTrashConfirmation,
} from "@/lib/confirmations";
import { getApiError } from "@/lib/auth/getApiError";
import { notifyError } from "@/lib/toast";
import { getFreshQueryOptions } from "@/lib/dashboard/freshHighlightQueryOptions";
import StatusBadge from "@/components/common/StatusBadge";
import { getProjectStatusBadgeProps } from "@/lib/statusBadges";
import { invalidateNotificationQueries } from "@/lib/notifications/invalidateNotificationQueries";
import { useQueryClient } from "@tanstack/react-query";
import DashboardTableEmptyState, {
  DashboardTableErrorState,
} from "@/components/property/dashboard/DashboardTableEmptyState";
import { getProjectsTableEmptyState } from "@/lib/dashboard/tableEmptyStates";
import { canAddUnitToProject } from "@/lib/properties/mapProperty";
import { remoteImageProps } from "@/lib/images/remoteImage";

const PLACEHOLDER = "/images/listings/list-1.jpg";

const formatDate = (value) => {
  if (!value) return "—";
  return new Intl.DateTimeFormat(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
};

const ProjectsDataTable = ({
  queryParams,
  isTrash,
  page,
  pageSize,
  onPageChange,
  highlightResolving = false,
  hasActiveFilters = false,
  onMovedToTrash,
  onClearFilters,
  onShowActiveProjects,
}) => {
  const queryClient = useQueryClient();
  const {
    requestConfirm,
    run,
    isLocked,
    overlayMessage,
    dialogProps,
    pending,
  } = useConfirmAction();

  const highlightId = useHighlightQueryParam();
  const { data, isFetching, isError } = useMyProjects(
    queryParams,
    getFreshQueryOptions(highlightId),
  );

  const projects = data?.projects || [];
  const cards = data?.cards || [];
  const pagination = data?.pagination;
  const showTableSkeleton = isFetching || highlightResolving;
  const highlightReady =
    !showTableSkeleton &&
    (!highlightId ||
      projects.some(
        (project) => String(project._id || project.id) === String(highlightId),
      ));
  const { getRowProps } = useDashboardRowHighlight({
    highlightId,
    ready: highlightReady,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["my-projects"] });
    queryClient.invalidateQueries({ queryKey: ["my-properties"] });
    invalidateNotificationQueries(queryClient);
  };

  const promptDelete = (projectId, title) => {
    requestConfirm({
      ...projectTrashConfirmation(title),
      targetId: projectId,
      action: {
        message: "Moving project to trash...",
        successMessage: "Project moved to trash",
        task: () => buytlyApi.deleteProject(projectId),
        onSuccess: () => {
          invalidate();
          onMovedToTrash?.();
        },
      },
    });
  };

  const promptPermanentDelete = (projectId, title) => {
    requestConfirm({
      ...projectPermanentDeleteConfirmation(title),
      targetId: projectId,
      action: {
        message: "Deleting project permanently...",
        successMessage: "Project permanently deleted",
        task: () => buytlyApi.permanentlyDeleteProject(projectId),
        onSuccess: invalidate,
        onError: (error) => notifyError(getApiError(error)),
      },
    });
  };

  const handleRestore = async (projectId) => {
    try {
      await run({
        message: "Restoring project...",
        successMessage: "Project and units restored as draft",
        task: () => buytlyApi.restoreProject(projectId),
      });
      invalidate();
    } catch {
      // Toast handled by useConfirmAction
    }
  };

  const tableBusy = isLocked;
  const actingId = pending?.targetId ?? null;

  if (isError) {
    return (
      <DashboardTableErrorState
        title="Could not load projects"
        onRetry={() =>
          queryClient.invalidateQueries({ queryKey: ["my-projects"] })
        }
      />
    );
  }

  const emptyState = getProjectsTableEmptyState({
    isTrash,
    hasActiveFilters,
    onClearFilters,
    onShowActiveProjects,
  });

  return (
    <>
      {showTableSkeleton ? (
        <div className="packages_table table-responsive">
          <DashboardTableSkeleton rows={5} columns={6} withThumbnail />
        </div>
      ) : !projects.length ? (
        <DashboardTableEmptyState {...emptyState} />
      ) : (
        <table className="table-style3 table at-savesearch">
          <thead className="t-head">
            <tr>
              <th scope="col">Project</th>
              <th scope="col">Units</th>
              <th scope="col">Status</th>
              <th scope="col">{isTrash ? "Deleted" : "Created"}</th>
              {!isTrash && <th scope="col">Views</th>}
              <th scope="col">Action</th>
            </tr>
          </thead>
          <tbody className="t-body">
            {projects.map((project, index) => {
              const card = cards[index];
              const projectId = project._id || project.id;
              const rowBusy = actingId === projectId;
              const isPublished =
                !isTrash &&
                project.status === "active" &&
                project.slug &&
                !project.deletedAt;
              const showAddUnit = canAddUnitToProject(project);

              return (
                <tr key={projectId} {...getRowProps(projectId)}>
                  <th scope="row">
                    <div className="listing-style1 dashboard-style d-xxl-flex align-items-center mb-0">
                      <div className="list-thumb">
                        <Image
                          width={110}
                          height={94}
                          className="w-100 dashboard-table-thumb-img"
                          src={card?.image || PLACEHOLDER}
                          alt=""
                          {...remoteImageProps(card?.image)}
                        />
                      </div>
                      <div className="list-content py-0 p-0 mt-2 mt-xxl-0 ps-xxl-4">
                        <div className="h6 list-title">
                          <Link href={`/dashboard-edit-project/${projectId}`}>
                            {project.title}
                          </Link>
                        </div>
                        <p className="list-text mb-0">{card?.location}</p>
                        <div className="list-price">
                          <span>{card?.price}</span>
                        </div>
                      </div>
                    </div>
                  </th>
                  <td className="vam">{project.unitCount ?? 0}</td>
                  <td className="vam">
                    <StatusBadge
                      {...getProjectStatusBadgeProps(project, {
                        isTrashView: isTrash,
                      })}
                    />
                  </td>
                  <td className="vam">
                    {formatDate(
                      isTrash ? project.deletedAt : project.createdAt,
                    )}
                  </td>
                  {!isTrash && (
                    <td className="vam">{project.viewCount ?? 0}</td>
                  )}
                  <td className="vam">
                    <div className="d-flex">
                      {isTrash ? (
                        <>
                          <button
                            type="button"
                            className="ud-btn btn-thm btn-sm"
                            disabled={rowBusy || tableBusy}
                            onClick={() => handleRestore(projectId)}
                          >
                            <DashboardBtnIcon icon={dashboardIcons.restore} />
                            Restore
                          </button>
                          <Link
                            href={`/dashboard-edit-project/${projectId}`}
                            className={`icon ms-2${tableBusy ? " pe-none opacity-50" : ""}`}
                            data-tooltip-id={`trash-view-${projectId}`}
                          >
                            <span className="far fa-eye" />
                          </Link>
                          <ReactTooltip
                            id={`trash-view-${projectId}`}
                            place="top"
                            content="View in trash"
                          />
                          <button
                            type="button"
                            className="icon ms-2"
                            style={{ border: "none" }}
                            data-tooltip-id={`purge-${projectId}`}
                            disabled={rowBusy || tableBusy}
                            onClick={() =>
                              promptPermanentDelete(projectId, project.title)
                            }
                          >
                            <span className="flaticon-bin" />
                          </button>
                          <ReactTooltip
                            id={`purge-${projectId}`}
                            place="top"
                            content="Delete permanently"
                          />
                        </>
                      ) : (
                        <>
                          {isPublished ? (
                            <Link
                              href={`/project/${project.slug}`}
                              className={`icon${tableBusy ? " pe-none opacity-50" : ""}`}
                              data-tooltip-id={`view-${projectId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-disabled={tableBusy}
                              tabIndex={tableBusy ? -1 : undefined}
                            >
                              <span className="far fa-eye" />
                            </Link>
                          ) : null}
                          <Link
                            href={`/dashboard-edit-project/${projectId}`}
                            className={`icon${tableBusy ? " pe-none opacity-50" : ""}`}
                            data-tooltip-id={`edit-${projectId}`}
                            aria-disabled={tableBusy}
                            tabIndex={tableBusy ? -1 : undefined}
                          >
                            <span className="fas fa-pen fa" />
                          </Link>
                          {showAddUnit ? (
                            <Link
                              href={`/dashboard-add-property?projectId=${projectId}`}
                              className={`icon${tableBusy ? " pe-none opacity-50" : ""}`}
                              data-tooltip-id={`add-unit-${projectId}`}
                              aria-disabled={tableBusy}
                              tabIndex={tableBusy ? -1 : undefined}
                            >
                              <span className="far fa-plus" />
                            </Link>
                          ) : null}
                          <button
                            type="button"
                            className="icon"
                            style={{ border: "none" }}
                            data-tooltip-id={`delete-${projectId}`}
                            onClick={() =>
                              promptDelete(projectId, project.title)
                            }
                            disabled={rowBusy || tableBusy}
                          >
                            <span className="flaticon-bin" />
                          </button>

                          {isPublished ? (
                            <ReactTooltip
                              id={`view-${projectId}`}
                              place="top"
                              content="View live page"
                            />
                          ) : null}
                          <ReactTooltip
                            id={`edit-${projectId}`}
                            place="top"
                            content="Manage project"
                          />
                          <ReactTooltip
                            id={`add-unit-${projectId}`}
                            place="top"
                            content="Add unit"
                          />
                          <ReactTooltip
                            id={`delete-${projectId}`}
                            place="top"
                            content="Move to trash"
                          />
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {!showTableSkeleton && (
        <div className="mt30">
          <ApiPagination
            page={page}
            totalPages={pagination?.totalPages || 1}
            total={pagination?.total || 0}
            limit={pageSize}
            onPageChange={onPageChange}
            itemLabel="projects"
            itemLabelSingular="project"
          />
        </div>
      )}

      <ConfirmDialog {...dialogProps} />
    </>
  );
};

export default ProjectsDataTable;
