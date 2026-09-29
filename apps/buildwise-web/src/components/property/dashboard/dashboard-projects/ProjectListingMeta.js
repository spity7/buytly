"use client";

import Link from "next/link";
import StatusBadge from "@/components/common/StatusBadge";
import { formatProjectTimestamp } from "@/lib/properties/projectForm";
import { getProjectStatusBadgeProps } from "@/lib/statusBadges";

function MetaRow({ label, children }) {
  return (
    <div className="project-edit-meta__row">
      <dt className="project-edit-meta__label">{label}:</dt>
      <dd className="project-edit-meta__value mb0">{children}</dd>
    </div>
  );
}

export default function ProjectListingMeta({ project }) {
  if (!project?._id && !project?.id) {
    return null;
  }

  const showPublicLink = project.status === "active" && Boolean(project.slug);
  const agentName =
    project.agentId && typeof project.agentId === "object"
      ? [project.agentId.firstName, project.agentId.lastName]
          .filter(Boolean)
          .join(" ") ||
        project.agentId.email ||
        "—"
      : null;

  return (
    <div className="project-edit-section project-edit-meta">
      <h5 className="project-edit-section__title mb20">Listing information</h5>
      <dl className="project-edit-meta__list mb0">
        <MetaRow label="Status">
          <StatusBadge
            {...getProjectStatusBadgeProps(project, {
              isTrashView: Boolean(project.deletedAt),
            })}
          />
        </MetaRow>
        <MetaRow label="Public URL">
          {showPublicLink ? (
            <Link href={`/project/${project.slug}`} className="text-thm">
              /project/{project.slug}
            </Link>
          ) : (
            <span className="text-muted">Available after publishing</span>
          )}
        </MetaRow>
        <MetaRow label="Views">{project.viewCount ?? 0}</MetaRow>
        <MetaRow label="Created">
          {formatProjectTimestamp(project.createdAt)}
        </MetaRow>
        <MetaRow label="Last updated">
          {formatProjectTimestamp(project.updatedAt)}
        </MetaRow>
        {agentName ? (
          <MetaRow label="Listing agent">{agentName}</MetaRow>
        ) : null}
      </dl>
    </div>
  );
}
