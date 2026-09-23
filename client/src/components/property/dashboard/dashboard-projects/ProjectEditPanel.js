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
  projectTrashConfirmation,
} from "@/lib/confirmations";
import { getApiError } from "@/lib/auth/getApiError";
import StatusBadge from "@/components/common/StatusBadge";
import { getProjectStatusBadgeProps } from "@/lib/statusBadges";
import { getProjectKindLabel } from "@/lib/properties/projectKindOptions";
import {
  getProjectPublishRules,
  getProjectSubmitReviewMessage,
  hasTooManyUnitsForKind,
  isProjectReadyToPublish,
} from "@/lib/properties/projectForm";
import { notifyError, notifySuccess } from "@/lib/toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";

export default function ProjectEditPanel({ projectId }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: project, isLoading, isError, refetch } = useProject(projectId);
  const units = useMemo(() => project?.units || [], [project?.units]);
  const { requestConfirm, dialogProps, isLocked, run } = useConfirmAction({
    overlay: true,
  });

  if (isLoading) {
    return (
      <div className="project-edit p30">
        <DashboardFormSkeleton rows={8} />
      </div>
    );
  }

  if (isError || !project) {
    return (
      <div className="project-edit p30">
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
    );
  }

  const isTrashed = Boolean(project.deletedAt);
  const isSold = project.status === "sold";
  const readOnly = isLocked || isSold || isTrashed;
  const unitCount = isTrashed ? (project.unitCount ?? 0) : units.length;

  const canAddUnit =
    !isTrashed &&
    (project.kind === "compound" ||
      (project.kind === "single" && units.length === 0));

  const { minUnits, maxUnits } = getProjectPublishRules(project.kind);
  const tooManyUnits = hasTooManyUnitsForKind(project.kind, unitCount);
  const canSubmit =
    !isTrashed &&
    isProjectReadyToPublish(project.kind, unitCount) &&
    !["pending", "active", "sold"].includes(project.status);

  const invalidateLists = () => {
    queryClient.invalidateQueries({ queryKey: ["my-projects"] });
    queryClient.invalidateQueries({ queryKey: ["my-properties"] });
    queryClient.invalidateQueries({ queryKey: ["project", projectId] });
  };

  const saveDetails = async (payload) => {
    try {
      await buytlyApi.updateProject(projectId, payload);
      notifySuccess("Project details saved");
      await refetch();
      invalidateLists();
    } catch (error) {
      notifyError(getApiError(error));
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
    requestConfirm({
      title: "Submit project for review?",
      message: `This will submit the project and all draft units for admin review. ${getProjectSubmitReviewMessage(project.kind)}`,
      confirmLabel: "Submit",
      action: {
        message: "Submitting project...",
        successMessage: "Project and units submitted for review",
        task: async () => {
          await buytlyApi.updateProject(projectId, { status: "active" });
          await refetch();
          invalidateLists();
        },
        onError: (error) => notifyError(getApiError(error)),
      },
    });
  };

  return (
    <div className="project-edit p30">
      <ConfirmDialog {...dialogProps} />

      <header className="project-edit__header">
        <div className="project-edit__header-main">
          <p className="project-edit__eyebrow mb0">Edit project</p>
          <h2 className="project-edit__title">{project.title}</h2>
          <div className="project-edit__badges">
            <StatusBadge
              tone="neutral"
              label={getProjectKindLabel(project.kind)}
            />
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
                Restore project
              </button>
              <button
                type="button"
                className="ud-btn btn-white2 text-danger"
                disabled={isLocked}
                onClick={deletePermanently}
              >
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
              Move to trash
            </button>
          )}
          <Link href="/dashboard-my-projects" className="ud-btn btn-white2">
            Back to projects
          </Link>
        </div>
      </header>

      {!isTrashed ? (
        <div className="project-edit__stats" aria-label="Project summary">
          <div className="project-edit-stat">
            <span className="project-edit-stat__label">Units</span>
            <span className="project-edit-stat__value">{unitCount}</span>
            <span className="project-edit-stat__hint">
              {minUnits} required to publish
            </span>
          </div>
          <div className="project-edit-stat">
            <span className="project-edit-stat__label">Type</span>
            <span className="project-edit-stat__value">
              {getProjectKindLabel(project.kind)}
            </span>
            <span className="project-edit-stat__hint">
              {project.kind === "single" ? "One Villa unit" : "Multi-unit"}
            </span>
          </div>
          <div className="project-edit-stat">
            <span className="project-edit-stat__label">Views</span>
            <span className="project-edit-stat__value">
              {project.viewCount ?? 0}
            </span>
            <span className="project-edit-stat__hint">Public page traffic</span>
          </div>
        </div>
      ) : null}

      {isTrashed ? (
        <div
          className="project-edit-callout project-edit-callout--warning"
          role="status"
        >
          <strong>This project is in trash.</strong> It is hidden from the
          public site along with {unitCount} unit{unitCount === 1 ? "" : "s"}.
          Restore to edit details, media, and units again.
        </div>
      ) : (
        <div className="project-edit-callout" role="note">
          <strong>How publishing works:</strong> Save project details and add
          units. When you submit for review, draft units are sent to moderation
          together with the project. Admins approve the project and pending
          units in one step.
        </div>
      )}

      {!isTrashed && tooManyUnits ? (
        <div
          className="project-edit-callout project-edit-callout--warning"
          role="status"
        >
          <strong>Too many units for a single project.</strong> Single projects
          allow exactly one unit. Remove extra units or contact support if you
          need to restructure this listing.
        </div>
      ) : null}

      <div className="row project-edit__layout g-4">
        <div className="col-xl-8">
          <div className="project-edit__main">
            {!isTrashed ? (
              <ProjectEditUnitsSection
                units={units}
                minUnits={minUnits}
                projectId={projectId}
                canAddUnit={canAddUnit}
              />
            ) : null}

            <ProjectDetailsForm
              project={project}
              disabled={readOnly}
              hideSubmit={isTrashed}
              onSubmit={handleDetailsSubmit}
            />

            <ProjectMediaPanel
              projectId={projectId}
              media={project.media || []}
              onUpdated={refetch}
              disabled={readOnly}
            />
          </div>
        </div>

        <div className="col-xl-4">
          <aside className="project-edit__aside">
            <ProjectListingMeta project={project} />
            {!isTrashed ? (
              <ProjectEditPublishCard
                project={project}
                unitCount={unitCount}
                minUnits={minUnits}
                maxUnits={maxUnits}
                canSubmit={canSubmit}
                isLocked={isLocked}
                onSubmit={submitForReview}
              />
            ) : null}
          </aside>
        </div>
      </div>
    </div>
  );
}
