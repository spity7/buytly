"use client";

import { buytlyApi } from "@/api/generated";
import ProjectDetailsForm from "@/components/property/dashboard/dashboard-projects/ProjectDetailsForm";
import ProjectEditPublishCard from "@/components/property/dashboard/dashboard-projects/ProjectEditPublishCard";
import ProjectEditUnitsSection from "@/components/property/dashboard/dashboard-projects/ProjectEditUnitsSection";
import ProjectListingMeta from "@/components/property/dashboard/dashboard-projects/ProjectListingMeta";
import ProjectMediaPanel from "@/components/property/dashboard/dashboard-projects/ProjectMediaPanel";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import DashboardTableEmptyState from "@/components/property/dashboard/DashboardTableEmptyState";
import { DashboardFormSkeleton } from "@/components/property/dashboard/skeletons/DashboardSkeletons";
import { useProject } from "@/hooks/useProjects";
import { useConfirmAction } from "@/hooks/useConfirmAction";
import {
  projectPermanentDeleteConfirmation,
  projectPublishConfirmation,
  projectTrashConfirmation,
} from "@/lib/confirmations";
import { getApiError } from "@/lib/auth/getApiError";
import StatusBadge from "@/components/common/StatusBadge";
import { getProjectStatusBadgeProps } from "@/lib/statusBadges";
import {
  canShowProjectPublishAction,
  getProjectPublishButtonLabel,
  getProjectPublishRules,
} from "@/lib/properties/projectForm";
import { useAuth } from "@/providers/AuthProvider";
import { canAddUnitToProject } from "@/lib/properties/mapProperty";
import { notifyError, notifySuccess } from "@/lib/toast";
import Link from "next/link";
import DashboardBtnIcon, {
  dashboardIcons,
} from "@/components/property/dashboard/DashboardBtnIcon";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

const EMPTY_PROJECT_MEDIA = [];

export default function ProjectEditPanel({ projectId }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [detailsDirty, setDetailsDirty] = useState(false);
  const { data: project, isLoading, isError, refetch } = useProject(projectId);
  const units = useMemo(() => project?.units || [], [project?.units]);
  const { requestConfirm, dialogProps, isLocked, run } = useConfirmAction();

  const refreshProject = useCallback(async () => {
    queryClient.invalidateQueries({ queryKey: ["my-projects"] });
    queryClient.invalidateQueries({ queryKey: ["my-properties"] });
    queryClient.invalidateQueries({ queryKey: ["project", projectId] });
    await refetch();
  }, [queryClient, projectId, refetch]);

  if (isLoading) {
    return (
      <div className="unit-dashboard-page">
        <header className="unit-dashboard-page__header">
          <h2 className="unit-dashboard-page__title">Edit project</h2>
          <p className="unit-dashboard-page__lede mb0">Loading…</p>
        </header>
        <div className="row unit-dashboard-page__layout g-4">
          <div className="col-xl-8">
            <div className="unit-dashboard-page__form-panel bdrs12 default-box-shadow2 bgc-white overflow-hidden position-relative">
              <DashboardFormSkeleton rows={8} />
            </div>
          </div>
          <div className="col-xl-4">
            <div className="unit-dashboard-page__aside">
              <div
                className="project-edit-section unit-project-card unit-project-card--loading"
                aria-busy="true"
              >
                <p className="text mb0">Loading listing details…</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !project) {
    return (
      <div className="unit-dashboard-page">
        <header className="unit-dashboard-page__header">
          <h2 className="unit-dashboard-page__title">Edit project</h2>
        </header>
        <div className="unit-dashboard-page__form-panel bdrs12 default-box-shadow2 bgc-white overflow-hidden position-relative p30">
          <DashboardTableEmptyState
            icon="flaticon-search"
            title="Project not found"
            description="This project may have been removed or you no longer have access."
            actions={[
              {
                label: "Back to my projects",
                variant: "thm",
                href: "/dashboard-my-projects",
              },
            ]}
          />
        </div>
      </div>
    );
  }

  const isTrashed = Boolean(project.deletedAt);
  const isSold = project.status === "sold";
  const readOnly = isLocked || isSold || isTrashed;
  const unitCount = isTrashed ? (project.unitCount ?? 0) : units.length;
  const trashedUnitCount = isTrashed ? 0 : (project.trashedUnitCount ?? 0);

  const canAddUnit = !isTrashed && canAddUnitToProject(project);

  const { minUnits } = getProjectPublishRules();
  const canSubmit = canShowProjectPublishAction(project, unitCount, {
    isTrashed,
    isAdmin,
  });
  const publishButtonLabel = getProjectPublishButtonLabel({
    isAdmin,
    status: project.status,
  });
  const publishButtonIcon = isAdmin
    ? dashboardIcons.approve
    : dashboardIcons.submit;
  const publishBlockedByUnsavedDetails = canSubmit && detailsDirty;

  const invalidateLists = () => {
    queryClient.invalidateQueries({ queryKey: ["my-projects"] });
    queryClient.invalidateQueries({ queryKey: ["my-properties"] });
    queryClient.invalidateQueries({ queryKey: ["project", projectId] });
  };

  const saveDetails = async (payload) => {
    try {
      await run({
        message: "Saving project details...",
        successMessage: "Project details saved",
        task: async () => {
          await buytlyApi.updateProject(projectId, payload);
          await refetch();
          invalidateLists();
        },
      });
    } catch {
      // Toast handled by useConfirmAction
    }
  };

  const handleDetailsSubmit = (payload) => {
    if (payload?.error) {
      notifyError(payload.error);
      return;
    }
    saveDetails(payload);
  };

  const moveToTrash = () => {
    requestConfirm({
      ...projectTrashConfirmation(project.title),
      action: {
        message: "Moving project to trash...",
        successMessage: "Project moved to trash",
        task: () => buytlyApi.deleteProject(projectId),
        onSuccess: () => {
          invalidateLists();
          router.push("/dashboard-my-projects?trash=1");
        },
        onError: (error) => notifyError(getApiError(error)),
      },
    });
  };

  const deletePermanently = () => {
    requestConfirm({
      ...projectPermanentDeleteConfirmation(project.title),
      action: {
        message: "Deleting project permanently...",
        successMessage: "Project permanently deleted",
        task: () => buytlyApi.permanentlyDeleteProject(projectId),
        onSuccess: () => {
          invalidateLists();
          router.push("/dashboard-my-projects?trash=1");
        },
        onError: (error) => notifyError(getApiError(error)),
      },
    });
  };

  const restoreProject = async () => {
    try {
      await run({
        message: "Restoring project...",
        successMessage: "Project and units restored as draft",
        task: () => buytlyApi.restoreProject(projectId),
      });
      await refetch();
      invalidateLists();
    } catch {
      // Toast handled by useConfirmAction
    }
  };

  const submitForReview = () => {
    const confirmation = projectPublishConfirmation({
      isAdmin,
      status: project.status,
    });

    requestConfirm({
      ...confirmation,
      action: {
        message: confirmation.actionMessage,
        successMessage: confirmation.successMessage,
        task: async () => {
          if (isAdmin) {
            await buytlyApi.adminModerateProject(projectId, {
              status: "active",
            });
          } else {
            await buytlyApi.updateProject(projectId, { status: "active" });
          }
          await refetch();
          invalidateLists();
        },
        onError: (error) => notifyError(getApiError(error)),
      },
    });
  };

  const pageLede = isTrashed
    ? `${project.title} is in trash. Restore it to edit shared marketing, media, and units again.`
    : `Update shared marketing, location, media, and units for ${project.title}. Submit for review when you are ready to publish.`;

  return (
    <div className="unit-dashboard-page project-edit">
      <ConfirmDialog {...dialogProps} />

      <header className="unit-dashboard-page__header project-edit__page-header">
        <div className="project-edit__page-header-main">
          <h2 className="unit-dashboard-page__title">Edit project</h2>
          <p className="unit-dashboard-page__lede mb0">{pageLede}</p>
          <div className="project-edit__badges">
            <StatusBadge
              {...getProjectStatusBadgeProps(project, {
                isTrashView: isTrashed,
              })}
            />
          </div>
        </div>
        <div className="project-edit__header-actions">
          {isTrashed ? (
            <>
              <button
                type="button"
                className="ud-btn btn-thm"
                disabled={isLocked}
                onClick={restoreProject}
              >
                <DashboardBtnIcon icon={dashboardIcons.restore} />
                Restore project
              </button>
              <button
                type="button"
                className="ud-btn btn-white2 text-danger"
                disabled={isLocked}
                onClick={deletePermanently}
              >
                <DashboardBtnIcon icon={dashboardIcons.trash} />
                Delete permanently
              </button>
            </>
          ) : (
            <button
              type="button"
              className="ud-btn btn-white2"
              disabled={isLocked || isSold}
              onClick={moveToTrash}
            >
              <DashboardBtnIcon icon={dashboardIcons.trash} />
              Move to trash
            </button>
          )}
          <Link href="/dashboard-my-projects" className="ud-btn btn-white2">
            <DashboardBtnIcon icon={dashboardIcons.arrowLeft} />
            Back to projects
          </Link>
        </div>
      </header>

      <div className="row unit-dashboard-page__layout g-4">
        <div className="col-xl-8">
          <div className="unit-dashboard-page__form-panel bdrs12 default-box-shadow2 bgc-white overflow-hidden position-relative">
            <div className="unit-dashboard-page__form project-edit__form">
              {isTrashed ? (
                <div
                  className="project-edit-callout project-edit-callout--warning mb0"
                  role="status"
                >
                  <strong>This project is in trash.</strong> It is hidden from
                  the public site along with {unitCount} unit
                  {unitCount === 1 ? "" : "s"}. Restore to edit details, media,
                  and units again.
                </div>
              ) : (
                <>
                  <div className="project-edit-callout mb0" role="note">
                    <strong>How publishing works:</strong> Save project details
                    and add units. When you submit for review, draft units are
                    sent to moderation together with the project. Admins approve
                    the project and pending units in one step.
                  </div>

                  <div
                    className="project-edit__stats"
                    aria-label="Project summary"
                  >
                    <div className="project-edit-stat">
                      <span className="project-edit-stat__label">Units</span>
                      <span className="project-edit-stat__value">
                        {unitCount}
                      </span>
                      <span className="project-edit-stat__hint">
                        {minUnits} required to publish
                      </span>
                    </div>
                    <div className="project-edit-stat">
                      <span className="project-edit-stat__label">Views</span>
                      <span className="project-edit-stat__value">
                        {project.viewCount ?? 0}
                      </span>
                      <span className="project-edit-stat__hint">
                        Public page traffic
                      </span>
                    </div>
                  </div>
                </>
              )}

              <div className="project-edit__main">
                {!isTrashed ? (
                  <ProjectEditUnitsSection
                    units={units}
                    minUnits={minUnits}
                    projectId={projectId}
                    project={project}
                    canAddUnit={canAddUnit}
                    trashedUnitCount={trashedUnitCount}
                  />
                ) : null}

                <ProjectDetailsForm
                  project={project}
                  disabled={readOnly}
                  hideSubmit={isTrashed}
                  onDirtyChange={setDetailsDirty}
                  onSubmit={handleDetailsSubmit}
                />

                <ProjectMediaPanel
                  projectId={projectId}
                  media={project.media ?? EMPTY_PROJECT_MEDIA}
                  onUpdated={refreshProject}
                  disabled={readOnly}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-4">
          <div className="unit-dashboard-page__aside">
            <ProjectListingMeta project={project} />
            {!isTrashed ? (
              <ProjectEditPublishCard
                project={project}
                unitCount={unitCount}
                minUnits={minUnits}
                canSubmit={canSubmit}
                isLocked={isLocked}
                onSubmit={submitForReview}
                submitLabel={publishButtonLabel}
                submitIcon={publishButtonIcon}
                submitDisabled={publishBlockedByUnsavedDetails}
                submitDisabledTitle={
                  isAdmin
                    ? "Save project details before publishing."
                    : "Save project details before submitting."
                }
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
