"use client";

import StatusBadge from "@/components/common/StatusBadge";
import { formatPrice } from "@/lib/properties/formatPrice";
import {
  canOwnerPreviewUnitListing,
  isUnitPublicOnMarket,
} from "@/lib/properties/mapProperty";
import { getPropertyStatusBadgeProps } from "@/lib/statusBadges";
import Link from "next/link";
import DashboardBtnIcon, {
  dashboardIcons,
} from "@/components/property/dashboard/DashboardBtnIcon";

const PLACEHOLDER_IMAGE = "/images/listings/list-1.jpg";

function getUnitsEmptyCopy(minUnits) {
  if (minUnits === 1) {
    return {
      title: "No unit yet",
      description:
        "Add the sellable listing for this project (price, photos, and details). You need one unit before you can submit for review.",
    };
  }

  return {
    title: "No units yet",
    description: `Add at least ${minUnits} sellable listings under this project before you submit for admin review.`,
  };
}

function formatUnitType(type) {
  if (!type) return "—";
  return type.charAt(0).toUpperCase() + type.slice(1);
}

function getUnitThumbnail(unit) {
  const images = (unit.media || [])
    .filter((item) => item.type !== "video")
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const first = images[0];
  return first?.url || PLACEHOLDER_IMAGE;
}

function formatUnitSpecs(unit) {
  const parts = [
    unit.bedrooms != null && `${unit.bedrooms} bed`,
    unit.bathrooms != null && `${unit.bathrooms} bath`,
    unit.area != null && `${unit.area} sqm`,
  ].filter(Boolean);
  return parts.length ? parts.join(" · ") : null;
}

export default function ProjectEditUnitsSection({
  units,
  minUnits,
  projectId,
  project,
  canAddUnit,
  trashedUnitCount = 0,
}) {
  const unitCount = units.length;
  const addUnitHref = `/dashboard-add-property?projectId=${projectId}`;
  const { title: emptyTitle, description: emptyDescription } =
    getUnitsEmptyCopy(minUnits);
  const showHeaderAddButton = canAddUnit;
  const requirementMet = minUnits > 0 && unitCount >= minUnits;
  const unitsProgressLabel =
    minUnits > 0
      ? `${unitCount} of ${minUnits} required for review`
      : `${unitCount} unit${unitCount === 1 ? "" : "s"}`;
  const progressPercent =
    minUnits > 0 ? Math.min(100, Math.round((unitCount / minUnits) * 100)) : 0;

  return (
    <section
      className="project-edit-section project-edit-units"
      aria-labelledby="project-units-heading"
    >
      <div className="project-edit-section__head">
        <div className="project-edit-units__intro">
          <div className="project-edit-units__title-row">
            <h4
              id="project-units-heading"
              className="project-edit-section__title mb0"
            >
              Units
            </h4>
            <span
              className={`project-edit-units__count${
                requirementMet ? " project-edit-units__count--met" : ""
              }`}
            >
              {unitsProgressLabel}
            </span>
          </div>
          <p className="project-edit-section__lede mb0">
            Sellable listings under this project. Draft units are submitted with
            the project when you send it for review.
          </p>
          {trashedUnitCount > 0 ? (
            <p className="project-edit-units__trash-note mb0" role="note">
              {trashedUnitCount} unit{trashedUnitCount === 1 ? "" : "s"} in
              trash —{" "}
              <Link href="/dashboard-my-properties?tab=trash">
                restore from My properties
              </Link>{" "}
              or add a new unit below.
            </p>
          ) : null}
          {minUnits > 0 ? (
            <div
              className="project-edit-units__progress"
              role="progressbar"
              aria-valuenow={unitCount}
              aria-valuemin={0}
              aria-valuemax={minUnits}
              aria-label="Units required for review"
            >
              <div
                className={`project-edit-units__progress-bar${
                  requirementMet ? " project-edit-units__progress-bar--met" : ""
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          ) : null}
        </div>
        {showHeaderAddButton ? (
          <Link
            href={addUnitHref}
            className="ud-btn btn-thm project-edit-section__head-action project-edit-units__add-btn"
          >
            <DashboardBtnIcon icon={dashboardIcons.add} />
            Add unit
          </Link>
        ) : null}
      </div>

      {unitCount === 0 ? (
        <div className="project-edit-units-placeholder">
          <div
            className="project-edit-units-placeholder__icon-wrap"
            aria-hidden
          >
            <span className="flaticon-home project-edit-units-placeholder__icon" />
          </div>
          <h5 className="project-edit-units-placeholder__title">
            {emptyTitle}
          </h5>
          <p className="project-edit-units-placeholder__text">
            {emptyDescription}
          </p>
          {canAddUnit ? (
            <Link
              href={addUnitHref}
              className="ud-btn btn-thm project-edit-units-placeholder__cta"
            >
              <DashboardBtnIcon icon={dashboardIcons.add} />
              Add unit
            </Link>
          ) : (
            <p className="project-edit-units-placeholder__note mb0">
              This project cannot accept more units right now.
            </p>
          )}
        </div>
      ) : (
        <ul className="project-edit-units-list mb0 ps-0">
          {units.map((unit) => {
            const id = unit._id || unit.id;
            const editHref = `/dashboard-edit-property/${id}`;
            const publicOnMarket = isUnitPublicOnMarket(unit, project);
            const ownerPreview = canOwnerPreviewUnitListing(unit);
            const specs = formatUnitSpecs(unit);
            const views = publicOnMarket ? (unit.viewCount ?? 0) : null;

            return (
              <li key={id} className="project-edit-unit-card">
                <div className="project-edit-unit-card__media">
                  <img
                    src={getUnitThumbnail(unit)}
                    alt=""
                    className="project-edit-unit-card__thumb"
                  />
                </div>
                <div className="project-edit-unit-card__body">
                  <div className="project-edit-unit-card__top">
                    <div className="project-edit-unit-card__title-wrap">
                      <p className="project-edit-unit-card__type mb0">
                        {formatUnitType(unit.type)}
                      </p>
                      <h5 className="project-edit-unit-card__title mb0">
                        {unit.title || "Untitled unit"}
                      </h5>
                    </div>
                    <StatusBadge
                      {...getPropertyStatusBadgeProps(unit, { parentProject: project })}
                      className="project-edit-unit-card__badge"
                    />
                  </div>
                  <div className="project-edit-unit-card__meta">
                    <span className="project-edit-unit-card__price">
                      {formatPrice(unit.price, unit.currency || "USD")}
                    </span>
                    {specs ? (
                      <span className="project-edit-unit-card__specs">
                        {specs}
                      </span>
                    ) : null}
                    {views != null ? (
                      <span className="project-edit-unit-card__views">
                        <i className="flaticon-fullscreen" aria-hidden="true" />
                        {views.toLocaleString()} view{views === 1 ? "" : "s"}
                      </span>
                    ) : null}
                  </div>
                  <div className="project-edit-unit-card__actions">
                    <Link
                      href={editHref}
                      className="ud-btn btn-thm btn-sm project-edit-unit-card__btn"
                    >
                      <DashboardBtnIcon icon={dashboardIcons.edit} />
                      Edit unit
                    </Link>
                    {ownerPreview ? (
                      <Link
                        href={`/single-v1/${id}`}
                        className="ud-btn btn-white2 btn-sm project-edit-unit-card__btn"
                        target="_blank"
                        rel="noopener noreferrer"
                        title={
                          publicOnMarket
                            ? undefined
                            : "Preview only — not visible on the marketplace until the project is published"
                        }
                      >
                        {publicOnMarket ? "View listing" : "Preview"}
                        <DashboardBtnIcon
                          icon={dashboardIcons.external}
                          position="trail"
                        />
                      </Link>
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
