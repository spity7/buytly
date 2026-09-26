"use client";

import StatusBadge from "@/components/common/StatusBadge";
import DashboardBtnIcon, {
  dashboardIcons,
} from "@/components/property/dashboard/DashboardBtnIcon";
import { getProjectStatusBadgeProps } from "@/lib/statusBadges";
import { isProjectReadyToPublish } from "@/lib/properties/projectForm";

function getPublishHint({ unitCount, minUnits }) {
  if (isProjectReadyToPublish(unitCount)) {
    return "Unit count meets the requirement to publish.";
  }
  const needed = minUnits - unitCount;
  return `Add ${needed} more unit${needed === 1 ? "" : "s"} to meet the minimum.`;
}

export default function ProjectEditPublishCard({
  project,
  unitCount,
  minUnits,
  canSubmit,
  isLocked,
  onSubmit,
  submitLabel = "Submit for review",
  submitIcon = dashboardIcons.submit,
  submitDisabled = false,
  submitDisabledTitle,
}) {
  const unitsReady = isProjectReadyToPublish(unitCount);
  const progress =
    minUnits > 0 ? Math.min(100, (unitCount / minUnits) * 100) : 0;

  return (
    <div className="project-edit-section project-edit-publish">
      <h5 className="project-edit-section__title">Publishing</h5>
      <p className="project-edit-section__lede project-edit-publish__lede">
        Add units, save details and media, then submit for admin review.
      </p>

      <div className="project-edit-publish__units">
        <div className="project-edit-publish__units-head">
          <span className="project-edit-publish__label">Units added</span>
          <span className="project-edit-publish__count" aria-hidden>
            <span className="project-edit-publish__count-current">
              {unitCount}
            </span>
            <span className="project-edit-publish__count-sep">/</span>
            <span className="project-edit-publish__count-goal">{minUnits}</span>
          </span>
        </div>
        <p className="project-edit-publish__requirement">
          At least {minUnits} unit{minUnits === 1 ? "" : "s"} required to publish
        </p>
        <div
          className="project-edit-publish__bar"
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${unitCount} of ${minUnits} units added`}
        >
          <span
            className={`project-edit-publish__bar-fill${
              unitsReady ? " project-edit-publish__bar-fill--ready" : ""
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <p
          className={`project-edit-publish__hint${
            unitsReady ? " project-edit-publish__hint--ready" : ""
          }`}
        >
          {getPublishHint({ unitCount, minUnits })}
        </p>
      </div>

      <div className="project-edit-publish__status">
        <span className="project-edit-publish__status-label">
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
          className="ud-btn btn-thm project-edit-publish__submit"
          disabled={isLocked || submitDisabled}
          title={submitDisabled ? submitDisabledTitle : undefined}
          onClick={onSubmit}
        >
          <DashboardBtnIcon icon={submitIcon} />
          {submitLabel}
        </button>
      ) : project.status === "pending" ? (
        <p className="project-edit-publish__footnote">
          Awaiting admin review. You will be notified when it is approved.
        </p>
      ) : project.status === "active" ? (
        <p className="project-edit-publish__footnote">
          This project is live. Edit details or units as needed.
        </p>
      ) : project.status === "sold" ? (
        <p className="project-edit-publish__footnote">
          This project is sold. You can still view details; publishing actions
          are not available.
        </p>
      ) : null}
    </div>
  );
}
