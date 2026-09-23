"use client";

import StatusBadge from "@/components/common/StatusBadge";
import { getProjectStatusBadgeProps } from "@/lib/statusBadges";
import { isProjectReadyToPublish } from "@/lib/properties/projectForm";

function formatUnitRequirement(kind, minUnits, maxUnits) {
  if (kind === "single") {
    return "1 required (exactly one Villa unit)";
  }
  return `${minUnits}+ required`;
}

function getPublishHint({ kind, unitCount, minUnits, maxUnits }) {
  if (maxUnits != null && unitCount > maxUnits) {
    return `Single projects allow only ${maxUnits} unit. Remove ${
      unitCount - maxUnits
    } unit${unitCount - maxUnits === 1 ? "" : "s"} to publish.`;
  }
  if (isProjectReadyToPublish(kind, unitCount)) {
    return "Unit count meets the requirement for this project type.";
  }
  const needed = minUnits - unitCount;
  return `Add ${needed} more unit${needed === 1 ? "" : "s"} to meet the minimum.`;
}

export default function ProjectEditPublishCard({
  project,
  unitCount,
  minUnits,
  maxUnits = null,
  canSubmit,
  isLocked,
  onSubmit,
}) {
  const kind = project?.kind ?? "compound";
  const unitsReady = isProjectReadyToPublish(kind, unitCount);
  const targetUnits = maxUnits ?? minUnits;
  const progress =
    targetUnits > 0 ? Math.min(100, (unitCount / targetUnits) * 100) : 0;

  return (
    <div className="project-edit-section project-edit-publish">
      <h5 className="project-edit-section__title">Publishing</h5>
      <p className="project-edit-section__lede mb20">
        Add units, save details and media, then submit for admin review.
      </p>

      <div className="project-edit-publish__row">
        <span className="project-edit-publish__label">Units added</span>
        <span className="project-edit-publish__value">
          {unitCount} · {formatUnitRequirement(kind, minUnits, maxUnits)}
        </span>
      </div>
      <div
        className="project-edit-publish__bar"
        role="progressbar"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Unit requirement progress"
      >
        <span
          className={`project-edit-publish__bar-fill${
            unitsReady ? " project-edit-publish__bar-fill--ready" : ""
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="project-edit-publish__hint mb20">
        {getPublishHint({ kind, unitCount, minUnits, maxUnits })}
      </p>

      <div className="project-edit-publish__status">
        <span className="text-uppercase fz12 text-muted d-block mb8">
          Project status
        </span>
        <StatusBadge
          {...getProjectStatusBadgeProps(project, {
            isTrashView: Boolean(project?.deletedAt),
          })}
        />
      </div>

      {canSubmit ? (
        <button
          type="button"
          className="ud-btn btn-thm w-100 mt20"
          disabled={isLocked}
          onClick={onSubmit}
        >
          Submit for review
        </button>
      ) : project.status === "pending" ? (
        <p className="text-muted fz14 mb0 mt20">
          Awaiting admin review. You will be notified when it is approved.
        </p>
      ) : project.status === "active" ? (
        <p className="text-muted fz14 mb0 mt20">
          This project is live. Edit details or units as needed.
        </p>
      ) : null}
    </div>
  );
}
