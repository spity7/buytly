"use client";

import Link from "next/link";
import DashboardBtnIcon, {
  dashboardIcons,
} from "@/components/property/dashboard/DashboardBtnIcon";

/**
 * @typedef {Object} DashboardEmptyAction
 * @property {string} label
 * @property {'thm' | 'white2'} [variant]
 * @property {string} [href]
 * @property {() => void} [onClick]
 * @property {boolean} [disabled]
 */

export default function DashboardTableEmptyState({
  icon = "flaticon-search",
  title,
  description,
  actions = [],
  tone = "default",
  className = "",
}) {
  const toneClass =
    tone === "error"
      ? "dashboard-table-empty--error"
      : "dashboard-table-empty--default";

  return (
    <div className={`dashboard-table-empty-wrap ${className}`.trim()}>
      <div
        className={`dashboard-table-empty bdrs12 default-box-shadow2 ${toneClass}`}
        role="status"
      >
        <div className="dashboard-table-empty__content">
          <div className="dashboard-table-empty__icon-wrap" aria-hidden>
            <span className={`dashboard-table-empty__icon ${icon}`} />
          </div>
          <div className="dashboard-table-empty__body">
            <h5 className="dashboard-table-empty__title">{title}</h5>
            {description ? (
              <p className="dashboard-table-empty__text">{description}</p>
            ) : null}
          </div>
        </div>
        {actions.length > 0 ? (
          <div className="dashboard-table-empty__actions">
            {actions.map((action, index) => {
              const isPrimary = action.variant !== "white2";
              const classNames = isPrimary
                ? "ud-btn btn-thm"
                : "ud-btn btn-white2 btn-sm";

              if (action.href) {
                return (
                  <Link
                    key={action.label}
                    href={action.href}
                    className={classNames}
                    aria-disabled={action.disabled}
                  >
                    {action.icon ? (
                      <DashboardBtnIcon icon={action.icon} />
                    ) : null}
                    {action.label}
                    {isPrimary && index === 0 && !action.icon ? (
                      <DashboardBtnIcon
                        icon={dashboardIcons.arrowRight}
                        position="trailArrow"
                      />
                    ) : null}
                  </Link>
                );
              }

              return (
                <button
                  key={action.label}
                  type="button"
                  className={classNames}
                  disabled={action.disabled}
                  onClick={action.onClick}
                >
                  {action.icon ? (
                    <DashboardBtnIcon icon={action.icon} />
                  ) : isPrimary ? (
                    <DashboardBtnIcon icon={dashboardIcons.retry} />
                  ) : null}
                  {action.label}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function DashboardTableErrorState({
  title = "Could not load this list",
  description = "Check your connection and try again.",
  onRetry,
  retryLabel = "Retry",
}) {
  return (
    <DashboardTableEmptyState
      tone="error"
      icon="flaticon-turn-back"
      title={title}
      description={description}
      actions={
        onRetry ? [{ label: retryLabel, variant: "thm", onClick: onRetry }] : []
      }
    />
  );
}
