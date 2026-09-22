"use client";

import { buytlyApi } from "@/api/generated";
import ProjectDetailsForm from "@/components/property/dashboard/dashboard-projects/ProjectDetailsForm";
import ProjectMediaPanel from "@/components/property/dashboard/dashboard-projects/ProjectMediaPanel";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { useProject } from "@/hooks/useProjects";
import { useConfirmAction } from "@/hooks/useConfirmAction";
import { getApiError } from "@/lib/auth/getApiError";
import { getStatusLabel } from "@/lib/properties/mapProperty";
import { notifyError, notifySuccess } from "@/lib/toast";
import Link from "next/link";
import { useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";

export default function ProjectEditPanel({ projectId }) {
  const queryClient = useQueryClient();
  const { data: project, isLoading, isError, refetch } = useProject(projectId);
  const units = useMemo(() => project?.units || [], [project?.units]);
  const { requestConfirm, dialogProps, isLocked } = useConfirmAction();

  if (isLoading) {
    return <p className="p30">Loading project...</p>;
  }

  if (isError || !project) {
    return <p className="p30">Project not found.</p>;
  }

  const canAddUnit =
    project.kind === "compound" ||
    (project.kind === "single" && units.length === 0);

  const minUnits = project.kind === "single" ? 1 : 2;
  const canSubmit =
    units.length >= minUnits &&
    !["pending", "active", "sold"].includes(project.status);

  const saveDetails = async (payload) => {
    try {
      await buytlyApi.updateProject(projectId, payload);
      notifySuccess("Project details saved");
      await refetch();
      queryClient.invalidateQueries({ queryKey: ["my-projects"] });
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

  const submitForReview = () => {
    requestConfirm({
      title: "Submit project for review?",
      message: `This will submit the project and all draft units for admin review. ${project.kind === "single" ? "Single projects need exactly one unit." : "Compound projects need at least two units."}`,
      confirmLabel: "Submit",
      action: {
        message: "Submitting project...",
        successMessage: "Project and units submitted for review",
        task: async () => {
          await buytlyApi.updateProject(projectId, { status: "active" });
          await refetch();
          queryClient.invalidateQueries({ queryKey: ["my-projects"] });
        },
        onError: (error) => notifyError(getApiError(error)),
      },
    });
  };

  return (
    <div className="p30">
      <ConfirmDialog {...dialogProps} />

      <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb30">
        <div>
          <h2 className="mb5">{project.title}</h2>
          <p className="text mb0">
            {project.kind === "single" ? "Single project" : "Compound project"}{" "}
            · {getStatusLabel(project.status)}
          </p>
          {project.status === "active" && project.slug ? (
            <Link href={`/project/${project.slug}`} className="text-thm fz14">
              View public project page
            </Link>
          ) : null}
        </div>
        <Link href="/dashboard-my-projects" className="ud-btn btn-white2">
          Back to projects
        </Link>
      </div>

      <div className="alert alert-light bdr1 bdrs12 mb30 fz14">
        <strong>How publishing works:</strong> Save project details and add
        units. When you submit for review, draft units are sent to moderation
        together with the project. Admins approve the project and pending units
        in one step.
      </div>

      <ProjectDetailsForm
        project={project}
        disabled={isLocked || project.status === "sold"}
        onSubmit={handleDetailsSubmit}
      />

      <ProjectMediaPanel
        projectId={projectId}
        media={project.media || []}
        onUpdated={refetch}
        disabled={isLocked || project.status === "sold"}
      />

      <div className="row mb30">
        <div className="col-md-4">
          <div className="bdr1 bdrs12 p20">
            <div className="text-uppercase fz13 text-muted">Units</div>
            <div className="h4 mb0">{units.length}</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="bdr1 bdrs12 p20">
            <div className="text-uppercase fz13 text-muted">Required</div>
            <div className="h4 mb0">{minUnits}+</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="bdr1 bdrs12 p20">
            <div className="text-uppercase fz13 text-muted">Kind</div>
            <div className="h4 mb0 text-capitalize">{project.kind}</div>
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-between align-items-center mb20">
        <h4 className="mb0">Units</h4>
        {canAddUnit ? (
          <Link
            href={`/dashboard-add-property?projectId=${projectId}`}
            className="ud-btn btn-thm"
          >
            Add unit
          </Link>
        ) : null}
      </div>

      {units.length === 0 ? (
        <p className="bdr1 bdrs12 p20">
          No units yet. Add at least {minUnits} unit{minUnits === 1 ? "" : "s"}{" "}
          before submitting for review.
        </p>
      ) : (
        <div className="table-responsive mb30">
          <table className="table-style3 table at-savesearch">
            <thead>
              <tr>
                <th>Label</th>
                <th>Title</th>
                <th>Price</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {units.map((unit) => {
                const id = unit._id || unit.id;
                return (
                  <tr key={id}>
                    <td>{unit.unitLabel || "—"}</td>
                    <td>{unit.title}</td>
                    <td>
                      {unit.price != null
                        ? `$${unit.price.toLocaleString()}`
                        : "—"}
                    </td>
                    <td>{getStatusLabel(unit.status)}</td>
                    <td>
                      <Link href={`/dashboard-edit-property/${id}`}>Edit</Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {canSubmit ? (
        <button
          type="button"
          className="ud-btn btn-thm"
          disabled={isLocked}
          onClick={submitForReview}
        >
          Submit project for review
        </button>
      ) : project.status === "pending" ? (
        <p className="text-muted mb0">This project is awaiting admin review.</p>
      ) : null}
    </div>
  );
}
