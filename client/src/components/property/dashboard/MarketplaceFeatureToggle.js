"use client";

import DashboardBtnIcon, {
  dashboardIcons,
} from "@/components/property/dashboard/DashboardBtnIcon";

export default function MarketplaceFeatureToggle({
  enabled,
  disabled,
  onToggle,
}) {
  const label = enabled ? "Remove from marketplace" : "Feature on marketplace";
  const icon = enabled ? dashboardIcons.archive : dashboardIcons.external;

  return (
    <button
      type="button"
      className={`ud-btn btn-sm ${enabled ? "btn-white2" : "btn-thm"}`}
      disabled={disabled}
      onClick={onToggle}
      title={
        enabled
          ? "Stop showing on the public marketplace"
          : "Show on the public marketplace"
      }
    >
      <DashboardBtnIcon icon={icon} />
      {label}
    </button>
  );
}
