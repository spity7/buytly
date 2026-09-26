"use client";

import StatusBadge from "@/components/common/StatusBadge";
import { formatProjectTimestamp } from "@/lib/properties/projectForm";
import { getProjectStatusBadgeProps } from "@/lib/statusBadges";
import Link from "next/link";
import DashboardBtnIcon, {
  dashboardIcons,
} from "@/components/property/dashboard/DashboardBtnIcon";

function formatProjectLocation(project) {
  const parts = [
    project?.location?.address,
    project?.location?.city,
    project?.location?.country,
  ].filter(Boolean);

  return parts.length ? parts.join(", ") : "Location not set on project";
}

export default function PropertyUnitProjectCard({
  project,
  isLoading,
  unitTitle,
}) {
  if (isLoading) {
    return (
      <div
        className="project-edit-section unit-project-card unit-project-card--loading"
        aria-busy="true"
      >
        <p className="text mb0">Loading parent project…</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="project-edit-section unit-project-card">
        <h5 className="unit-project-card__title mb10">Parent project</h5>
        <p className="text mb0">
          Project details could not be loaded. Return to{" "}
          <Link href="/dashboard-my-projects" className="text-thm">
            My projects
          </Link>
          .
        </p>
      </div>
    );
  }

  const projectId = project._id || project.id;
  const unitCount = Array.isArray(project.units)
    ? project.units.length
    : (project.unitCount ?? 0);
  const editHref = `/dashboard-edit-project/${projectId}`;

  return (
    <aside className="unit-project-card project-edit-section">
      <p className="unit-project-card__eyebrow mb10">Parent project</p>
      <h5 className="unit-project-card__title mb15">
        <Link href={editHref} className="text-reset">
          {project.title || "Untitled project"}
        </Link>
      </h5>

      <div className="unit-project-card__badges mb15">
        <StatusBadge
          {...getProjectStatusBadgeProps(project, {
            isTrashView: Boolean(project.deletedAt),
          })}
        />
      </div>

      <dl className="unit-project-card__meta mb20">
        <div className="unit-project-card__meta-row">
          <dt>Location</dt>
          <dd>{formatProjectLocation(project)}</dd>
        </div>
        <div className="unit-project-card__meta-row">
          <dt>Units on project</dt>
          <dd>{unitCount}</dd>
        </div>
        {unitTitle ? (
          <div className="unit-project-card__meta-row">
            <dt>This unit</dt>
            <dd>{unitTitle}</dd>
          </div>
        ) : null}
        <div className="unit-project-card__meta-row">
          <dt>Project updated</dt>
          <dd>{formatProjectTimestamp(project.updatedAt)}</dd>
        </div>
      </dl>

      <p className="unit-project-card__note mb20">
        Map location and shared amenities come from the project. Edit those on
        the project page; this form is for unit-specific details, media, and
        pricing.
      </p>

      <Link href={editHref} className="ud-btn btn-thm w-100 text-center">
        <DashboardBtnIcon icon={dashboardIcons.building} />
        Open project
        <DashboardBtnIcon
          icon={dashboardIcons.arrowRight}
          position="trailArrow"
        />
      </Link>
    </aside>
  );
}
